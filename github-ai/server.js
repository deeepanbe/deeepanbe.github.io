import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Octokit } from "@octokit/rest";
import crypto from "node:crypto";

const app = express();
const port = Number(process.env.PORT || 8787);
const github = process.env.GITHUB_TOKEN ? new Octokit({ auth: process.env.GITHUB_TOKEN }) : null;
const owner = process.env.GITHUB_OWNER || "";
const audit = [];
const approvals = new Map();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "256kb" }));
app.use(cors({ origin(origin, cb) {
  if (!origin) return cb(null, true);
  const allowed = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  cb(null, allowed.includes(origin));
}}));
app.use(rateLimit({ windowMs: 60000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false }));

function requireGithub() {
  if (!github) throw Object.assign(new Error("GITHUB_TOKEN is not configured"), { status: 503 });
}
function assertRepo(repo) {
  if (!/^[A-Za-z0-9_.-]+$/.test(repo)) throw Object.assign(new Error("Invalid repository name"), { status: 400 });
}

app.get("/health", (_req, res) => res.json({
  ok: true, service: "dj-github-ai", github_configured: Boolean(github),
  owner_configured: Boolean(owner), ai_provider: process.env.AI_PROVIDER || "not-configured",
  write_mode: "approval-required"
}));

app.get("/api/repos", async (_req, res, next) => {
  try {
    requireGithub();
    const { data } = await github.repos.listForUser({ username: owner, per_page: 100, sort: "updated" });
    res.json({ ok: true, repositories: data.map(r => ({
      name:r.name, full_name:r.full_name, private:r.private, default_branch:r.default_branch,
      language:r.language, updated_at:r.updated_at, open_issues:r.open_issues_count
    }))});
  } catch(e) { next(e); }
});

app.get("/api/repos/:repo/tree", async (req, res, next) => {
  try {
    requireGithub(); assertRepo(req.params.repo);
    const meta = await github.repos.get({ owner, repo:req.params.repo });
    const { data } = await github.git.getTree({ owner, repo:req.params.repo, tree_sha:meta.data.default_branch, recursive:"true" });
    res.json({ ok:true, repository:meta.data.full_name, default_branch:meta.data.default_branch,
      files:data.tree.filter(x=>x.type==="blob").map(x=>({path:x.path,sha:x.sha,size:x.size})) });
  } catch(e) { next(e); }
});

app.get("/api/repos/:repo/file", async (req, res, next) => {
  try {
    requireGithub(); assertRepo(req.params.repo);
    const path=String(req.query.path||"");
    if(!path || path.includes("..")) throw Object.assign(new Error("Invalid path"),{status:400});
    const { data }=await github.repos.getContent({owner,repo:req.params.repo,path});
    if(Array.isArray(data) || data.type!=="file") throw Object.assign(new Error("File not found"),{status:404});
    res.json({ok:true,path:data.path,sha:data.sha,size:data.size,content:Buffer.from(data.content,"base64").toString("utf8")});
  } catch(e) { next(e); }
});

app.post("/api/changes/propose", (req,res,next)=>{
  try {
    const {repo,branch,path,sha,reason,proposed_content}=req.body||{};
    assertRepo(repo);
    if(!branch||!path||!sha||typeof proposed_content!=="string"||!reason)
      throw Object.assign(new Error("repo, branch, path, sha, reason and proposed_content are required"),{status:400});
    const id=crypto.randomUUID();
    approvals.set(id,{repo,branch,path,sha,reason,proposed_content,created_at:new Date().toISOString()});
    audit.push({id,action:"proposal_created",repo,branch,path,created_at:new Date().toISOString()});
    res.status(201).json({ok:true,proposal_id:id,requires_approval:true});
  } catch(e){next(e);}
});

app.post("/api/changes/:id/approve",(req,res,next)=>{
  try {
    const p=approvals.get(req.params.id);
    if(!p) throw Object.assign(new Error("Proposal not found or expired"),{status:404});
    p.approved=true; p.approved_at=new Date().toISOString();
    audit.push({id:req.params.id,action:"proposal_approved",repo:p.repo,branch:p.branch,path:p.path,created_at:p.approved_at});
    res.json({ok:true,proposal_id:req.params.id,approved:true});
  } catch(e){next(e);}
});

app.post("/api/changes/:id/apply",async(req,res,next)=>{
  try {
    requireGithub();
    const p=approvals.get(req.params.id);
    if(!p||!p.approved) throw Object.assign(new Error("Explicit approval is required before applying changes"),{status:403});
    assertRepo(p.repo);
    const message=String(req.body?.commit_message||p.reason).slice(0,160);
    const {data}=await github.repos.createOrUpdateFileContents({
      owner,repo:p.repo,path:p.path,message,content:Buffer.from(p.proposed_content,"utf8").toString("base64"),branch:p.branch,sha:p.sha
    });
    audit.push({id:req.params.id,action:"change_applied",repo:p.repo,branch:p.branch,path:p.path,commit:data.commit?.sha,created_at:new Date().toISOString()});
    approvals.delete(req.params.id);
    res.json({ok:true,commit_sha:data.commit?.sha,message});
  } catch(e){next(e);}
});


app.get("/api/repos/:repo/issues", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const {data}=await github.issues.listForRepo({owner,repo:req.params.repo,state:"open",per_page:100,sort:"updated"});
    res.json({ok:true,issues:data.filter(i=>!i.pull_request).map(i=>({number:i.number,title:i.title,labels:i.labels.map(x=>x.name),updated_at:i.updated_at,url:i.html_url}))});
  } catch(e){next(e);}
});

app.get("/api/repos/:repo/pulls", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const {data}=await github.pulls.list({owner,repo:req.params.repo,state:"open",per_page:100,sort:"updated",direction:"desc"});
    res.json({ok:true,pulls:data.map(p=>({number:p.number,title:p.title,user:p.user?.login,updated_at:p.updated_at,url:p.html_url}))});
  } catch(e){next(e);}
});

app.get("/api/repos/:repo/commits", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const {data}=await github.repos.listCommits({owner,repo:req.params.repo,per_page:30});
    res.json({ok:true,commits:data.map(x=>({sha:x.sha,message:x.commit.message.split("\n")[0],author:x.author?.login||x.commit.author?.name,date:x.commit.author?.date,url:x.html_url}))});
  } catch(e){next(e);}
});

app.post("/api/analysis/repository", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repo=req.body.repo;
    const meta=(await github.repos.get({owner,repo})).data;
    const tree=(await github.git.getTree({owner,repo,tree_sha:meta.default_branch,recursive:"true"})).data;
    const files=tree.tree.filter(x=>x.type==="blob");
    const ext={};
    for(const f of files){const m=f.path.match(/\.([A-Za-z0-9]+)$/); if(m) ext[m[1]]=(ext[m[1]]||0)+1;}
    const top=files.sort((a,b)=>(b.size||0)-(a.size||0)).slice(0,10).map(x=>({path:x.path,size:x.size||0}));
    const score=Math.max(0,Math.min(100,50+(meta.has_issues?10:0)+(meta.has_wiki?5:0)+(meta.has_projects?5:0)+(files.some(x=>/test|spec/i.test(x.path))?15:0)+(files.some(x=>/readme/i.test(x.path))?10:0)+(files.some(x=>/\.github\/workflows\//.test(x.path))?10:0)));
    res.json({ok:true,repository:meta.full_name,default_branch:meta.default_branch,stars:meta.stargazers_count,forks:meta.forks_count,open_issues:meta.open_issues_count,file_count:files.length,technology_profile:ext,largest_files:top,readiness_score:score,recommendations:[
      !files.some(x=>/readme/i.test(x.path))&&"Add or improve README documentation",
      !files.some(x=>/\.github\/workflows\//.test(x.path))&&"Add CI workflow for repeatable validation",
      !files.some(x=>/test|spec/i.test(x.path))&&"Add automated tests for critical paths",
      "Review dependencies and security configuration",
      "Document architecture and deployment"
    ].filter(Boolean)});
  } catch(e){next(e);}
});

app.post("/api/agent/plan", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo;
    const meta=(await github.repos.get({owner,repo:repoName})).data;
    const tree=(await github.git.getTree({owner,repo:repoName,tree_sha:meta.data.default_branch,recursive:"true"})).data;
    const files=tree.tree.filter(x=>x.type==="blob").map(x=>x.path);
    const priority=[];
    if(!files.some(x=>/^readme(\\.|$)/i.test(x))) priority.push({priority:"high",area:"Documentation",action:"Create a production-quality README with architecture, setup, usage and deployment."});
    if(!files.some(x=>x.startsWith(".github/workflows/"))) priority.push({priority:"high",area:"CI/CD",action:"Add automated validation workflow for linting, tests and build checks."});
    if(!files.some(x=>/(test|spec)\\./i.test(x))) priority.push({priority:"medium",area:"Testing",action:"Add automated tests around the most important application paths."});
    if(files.some(x=>/\\.(env|pem|key)$/i.test(x))) priority.push({priority:"critical",area:"Secrets",action:"Review potentially sensitive files and move secrets to deployment environment variables."});
    priority.push({priority:"medium",area:"Maintainability",action:"Review duplicated logic, error handling and configuration boundaries."});
    priority.push({priority:"medium",area:"Security",action:"Review dependencies, authentication, authorization and input validation."});
    res.json({ok:true,repository:meta.full_name,default_branch:meta.default_branch,plan:priority,principle:"Propose first; write only after explicit approval."});
  } catch(e){next(e);}
});

app.get("/api/repos/:repo/health", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const meta=(await github.repos.get({owner,repo:req.params.repo})).data;
    const branch=meta.default_branch;
    const runs=await github.actions.listWorkflowRunsForRepo({owner,repo:req.params.repo,per_page:10});
    res.json({ok:true,repository:meta.full_name,default_branch:branch,workflow_runs:runs.data.workflow_runs.map(r=>({id:r.id,name:r.name,status:r.status,conclusion:r.conclusion,created_at:r.created_at,url:r.html_url}))});
  } catch(e){next(e);}
});

async function getTextFile(repoName,path){
  const {data}=await github.repos.getContent({owner,repo:repoName,path});
  if(Array.isArray(data)||data.type!=="file") throw Object.assign(new Error("Text file required"),{status:400});
  return {sha:data.sha,content:Buffer.from(data.content,"base64").toString("utf8")};
}

app.post("/api/agent/propose", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo, path=String(req.body.path||"");
    const instruction=String(req.body.instruction||"").trim();
    if(!path || path.includes("..") || !instruction) throw Object.assign(new Error("repo, path and instruction are required"),{status:400});
    if(/(^|\/)(\.env|.*\.(pem|key|p12))$/i.test(path)) throw Object.assign(new Error("Sensitive files are blocked"),{status:403});
    const file=await getTextFile(repoName,path);
    const max=Number(process.env.AGENT_MAX_FILE_CHARS||120000);
    if(file.content.length>max) throw Object.assign(new Error("File is too large for V1 patch generation"),{status:413});
    const proposalText = "DJ GitHub AI proposal\n\nInstruction: "+instruction+"\n\nTarget: "+path+"\n\nCurrent file length: "+file.content.length+" characters.\n\nNo repository write has been performed.";
    const id=crypto.randomUUID();
    const meta=(await github.repos.get({owner,repo:repoName})).data;
    approvals.set(id,{repo:repoName,branch:req.body.branch||meta.default_branch,path,sha:file.sha,reason:instruction,proposed_content:file.content,created_at:new Date().toISOString(),proposal_only:true});
    audit.push({id,action:"agent_proposal_created",repo:repoName,path,created_at:new Date().toISOString()});
    res.status(201).json({ok:true,proposal_id:id,proposal:proposalText,requires_approval:true,write_performed:false});
  } catch(e){next(e);}
});

app.get("/api/repos/:repo/security", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const meta=(await github.repos.get({owner,repo:req.params.repo})).data;
    const advisories=await github.dependabot.listAlertsForRepo({owner,repo:req.params.repo,state:"open",per_page:100}).catch(()=>({data:[]}));
    res.json({ok:true,repository:meta.full_name,open_dependabot_alerts:advisories.data.length,alerts:advisories.data.slice(0,25).map(a=>({package:a.dependency?.package?.name,severity:a.security_advisory?.severity,state:a.state,url:a.html_url}))});
  } catch(e){next(e);}
});

async function generateAiPatch({instruction,path,currentContent,context}){
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw Object.assign(new Error("OPENAI_API_KEY is not configured"),{status:503});
  const model=process.env.OPENAI_MODEL || "gpt-5.6-luna";
  const prompt=[
    "You are DJ GitHub AI, a careful software-development agent.",
    "Return ONLY valid JSON with keys: summary, risks, tests, new_content.",
    "new_content must contain the complete replacement content for the target text file.",
    "Do not include markdown fences. Never include secrets. Preserve unrelated behavior.",
    "Instruction: "+instruction,
    "Target path: "+path,
    "Repository context: "+context,
    "Current content:\\n"+currentContent
  ].join("\\n\\n");
  const response=await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},
    body:JSON.stringify({model,messages:[{role:"system",content:"You modify source code safely and conservatively."},{role:"user",content:prompt}],temperature:0.1,response_format:{type:"json_object"}})
  });
  if(!response.ok) throw Object.assign(new Error("AI provider request failed"),{status:502});
  const data=await response.json();
  const raw=data.choices?.[0]?.message?.content;
  if(!raw) throw Object.assign(new Error("AI provider returned no patch"),{status:502});
  const result=JSON.parse(raw);
  if(typeof result.new_content!=="string") throw Object.assign(new Error("AI returned invalid patch"),{status:502});
  return result;
}

app.post("/api/agent/generate", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo, path=String(req.body.path||""), instruction=String(req.body.instruction||"").trim();
    if(!path || path.includes("..") || !instruction) throw Object.assign(new Error("repo, path and instruction are required"),{status:400});
    if(/(^|\/)(\.env|.*\.(pem|key|p12))$/i.test(path)) throw Object.assign(new Error("Sensitive files are blocked"),{status:403});
    const file=await getTextFile(repoName,path);
    const max=Number(process.env.AGENT_MAX_FILE_CHARS||120000);
    if(file.content.length>max) throw Object.assign(new Error("File is too large for V1 AI generation"),{status:413});
    const meta=(await github.repos.get({owner,repo:repoName})).data;
    const tree=(await github.git.getTree({owner,repo:repoName,tree_sha:meta.data.default_branch,recursive:"true"})).data;
    const context=tree.tree.filter(x=>x.type==="blob").slice(0,300).map(x=>x.path).join("\\n");
    const ai=await generateAiPatch({instruction,path,currentContent:file.content,context});
    const id=crypto.randomUUID();
    approvals.set(id,{repo:repoName,branch:req.body.branch||meta.default_branch,path,sha:file.sha,reason:instruction,proposed_content:ai.new_content,created_at:new Date().toISOString(),ai_summary:ai.summary,risks:ai.risks,tests:ai.tests});
    audit.push({id,action:"ai_patch_generated",repo:repoName,path,created_at:new Date().toISOString()});
    res.status(201).json({ok:true,proposal_id:id,summary:ai.summary,risks:ai.risks,tests:ai.tests,current_sha:file.sha,proposed_content:ai.new_content,requires_approval:true,write_performed:false});
  } catch(e){next(e);}
});


function safeBranchName(name){
  const clean=String(name||"dj-ai-change").toLowerCase().replace(/[^a-z0-9._/-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80);
  return clean || "dj-ai-change";
}

app.post("/api/agent/branch", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo, base=String(req.body.base||"");
    const name=safeBranchName(req.body.name);
    const meta=(await github.repos.get({owner,repo:repoName})).data;
    const baseBranch=base||meta.default_branch;
    const ref=(await github.git.getRef({owner,repo:repoName,ref:"heads/"+baseBranch})).data;
    const created=await github.git.createRef({owner,repo:repoName,ref:"refs/heads/"+name,sha:ref.object.sha});
    audit.push({action:"branch_created",repo:repoName,branch:name,created_at:new Date().toISOString()});
    res.status(201).json({ok:true,branch:name,sha:created.data.object.sha});
  } catch(e){next(e);}
});

app.post("/api/agent/pr", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo, head=String(req.body.head||""), base=String(req.body.base||"");
    if(!head||!base||!req.body.title) throw Object.assign(new Error("repo, head, base and title are required"),{status:400});
    const {data}=await github.pulls.create({owner,repo:repoName,title:String(req.body.title).slice(0,120),head,base,body:String(req.body.body||"Generated by DJ GitHub AI; review before merging.")});
    audit.push({action:"pull_request_created",repo:repoName,number:data.number,head,base,created_at:new Date().toISOString()});
    res.status(201).json({ok:true,number:data.number,url:data.html_url});
  } catch(e){next(e);}
});

app.get("/api/repos/:repo/overview", async (req,res,next)=>{
  try {
    requireGithub(); assertRepo(req.params.repo);
    const repoName=req.params.repo;
    const [meta,commits,issues,pulls]=await Promise.all([
      github.repos.get({owner,repo:repoName}),
      github.repos.listCommits({owner,repo:repoName,per_page:10}),
      github.issues.listForRepo({owner,repo:repoName,state:"open",per_page:10}),
      github.pulls.list({owner,repo:repoName,state:"open",per_page:10})
    ]);
    res.json({ok:true,repository:meta.data.full_name,default_branch:meta.data.default_branch,
      activity:{commits:commits.data.map(x=>({sha:x.sha,message:x.commit.message.split("\\n")[0],date:x.commit.author?.date})),
      issues:issues.data.filter(x=>!x.pull_request).map(x=>({number:x.number,title:x.title,updated_at:x.updated_at})),
      pulls:pulls.data.map(x=>({number:x.number,title:x.title,updated_at:x.updated_at}))}});
  } catch(e){next(e);}
});



app.get("/api/intelligence", async (_req,res,next)=>{
  try {
    requireGithub();
    const {data}=await github.repos.listForUser({username:owner,per_page:100,sort:"updated"});
    const repositories=[];
    for(const r of data){
      try{
        const [commits,issues,pulls]=await Promise.all([
          github.repos.listCommits({owner,repo:r.name,per_page:5}),
          github.issues.listForRepo({owner,repo:r.name,state:"open",per_page:10}),
          github.pulls.list({owner,repo:r.name,state:"open",per_page:10})
        ]);
        const issueCount=issues.data.filter(x=>!x.pull_request).length;
        const pullCount=pulls.data.length;
        const activity=commits.data.length;
        const score=Math.min(100,Math.round(45+activity*5+pullCount*4+Math.max(0,5-issueCount)*4));
        repositories.push({name:r.name,private:r.private,language:r.language,updated_at:r.updated_at,open_issues:issueCount,open_pulls:pullCount,recent_commits:activity,development_score:score});
      }catch{}
    }
    repositories.sort((a,b)=>a.development_score-b.development_score);
    res.json({ok:true,owner,repositories,portfolio_score:repositories.length?Math.round(repositories.reduce((a,b)=>a+b.development_score,0)/repositories.length):0,lowest_priority:repositories[0]||null});
  }catch(e){next(e);}
});

app.post("/api/agent/task", async (req,res,next)=>{
  try{
    requireGithub();
    const task=String(req.body?.task||"").trim();
    if(!task) throw Object.assign(new Error("task is required"),{status:400});
    const {data}=await github.repos.listForUser({username:owner,per_page:100,sort:"updated"});
    const selected=data.slice(0,100).map(r=>({name:r.name,language:r.language,private:r.private,updated_at:r.updated_at}));
    const id=crypto.randomUUID();
    audit.push({id,action:"agent_task_created",task,repository_count:selected.length,created_at:new Date().toISOString()});
    res.status(202).json({ok:true,task_id:id,status:"planned",task,repository_count:selected.length,
      next_steps:["select repository","inspect relevant files","generate patch","show diff","request approval","apply on branch","validate via CI","open PR"]});
  }catch(e){next(e);}
});

app.get("/api/agent/learning", async (_req,res,next)=>{
  try{
    requireGithub();
    const events=audit.slice(-100);
    const counts=events.reduce((m,e)=>(m[e.action]=(m[e.action]||0)+1,m),{});
    res.json({ok:true,learning:{events_considered:events.length,action_counts:counts,principles:[
      "Prefer small reversible changes",
      "Use repository history and CI results as feedback",
      "Never treat generated code as trusted until validated",
      "Require human approval for consequential writes",
      "Improve recurring weaknesses across repositories"
    ]}});
  }catch(e){next(e);}
});



async function validatePatch(repoName, path, baseContent, newContent){
  const checks=[];
  if(newContent.length===0) checks.push("Generated content is empty");
  if(newContent.includes("-----BEGIN ") || /(?:api[_-]?key|secret|token)\\s*[:=]\\s*["'][^"']{12,}/i.test(newContent)) checks.push("Possible secret detected in generated content");
  const ext=(path.split(".").pop()||"").toLowerCase();
  if(["js","mjs","cjs"].includes(ext)){
    try { new Function(newContent); checks.push("JavaScript syntax check passed"); } catch(e){ checks.push("JavaScript syntax check failed: "+e.message); }
  }
  const oldLines=baseContent.split("\\n").length, newLines=newContent.split("\\n").length;
  if(Math.abs(newLines-oldLines)>Math.max(200,oldLines*2)) checks.push("Large change detected; review carefully");
  return {passed:checks.filter(x=>/passed/i.test(x)).length, warnings:checks.filter(x=>!/passed/i.test(x)), old_lines:oldLines,new_lines:newLines};
}

app.post("/api/agent/validate", async (req,res,next)=>{
  try{
    requireGithub(); assertRepo(req.body?.repo);
    const repoName=req.body.repo,path=String(req.body.path||"");
    const proposal=approvals.get(String(req.body.proposal_id||""));
    if(!proposal || proposal.repo!==repoName || proposal.path!==path) throw Object.assign(new Error("Proposal not found"),{status:404});
    const file=await getTextFile(repoName,path);
    const validation=await validatePatch(repoName,path,file.content,proposal.proposed_content);
    proposal.validation=validation;
    audit.push({action:"patch_validated",repo:repoName,path,proposal_id:req.body.proposal_id,created_at:new Date().toISOString()});
    res.json({ok:true,proposal_id:req.body.proposal_id,validation});
  }catch(e){next(e);}
});

app.post("/api/agent/apply-approved", async (req,res,next)=>{
  try{
    requireGithub();
    const id=String(req.body?.proposal_id||"");
    const p=approvals.get(id);
    if(!p || !p.approved) throw Object.assign(new Error("Explicit approval is required"),{status:403});
    if(p.validation?.warnings?.length) throw Object.assign(new Error("Validation warnings must be reviewed before applying"),{status:409});
    const result=await github.repos.createOrUpdateFileContents({
      owner,repo:p.repo,path:p.path,message:String(req.body.commit_message||"DJ GitHub AI: approved improvement").slice(0,160),
      content:Buffer.from(p.proposed_content,"utf8").toString("base64"),branch:p.branch,sha:p.sha
    });
    audit.push({action:"approved_change_applied",repo:p.repo,path:p.path,branch:p.branch,commit:result.data.commit?.sha,created_at:new Date().toISOString()});
    approvals.delete(id);
    res.json({ok:true,commit_sha:result.data.commit?.sha,branch:p.branch});
  }catch(e){next(e);}
});



app.get("/api/model/route",(req,res)=>{
  const task=String(req.query.task||"general");
  const key=process.env.OPENAI_API_KEY;
  const gateway=chooseModelSafe(task);
  res.json({ok:true,provider:process.env.AI_PROVIDER||"openai",model:gateway,configured:Boolean(key)});
});

function chooseModelSafe(task){
  const t=String(task).toLowerCase();
  if(/security|vulnerab|secret/.test(t)) return process.env.SECURITY_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  if(/code|refactor|bug|test|github|repository/.test(t)) return process.env.CODING_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  if(/plan|architect|design|research/.test(t)) return process.env.REASONING_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  return process.env.GENERAL_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
}



app.get("/api/agent/next", async (_req,res,next)=>{
  try{
    requireGithub();
    const {data}=await github.repos.listForUser({username:owner,per_page:100,sort:"updated"});
    const scored=[];
    for(const r of data){
      try{
        const [commits,issues,pulls]=await Promise.all([
          github.repos.listCommits({owner,repo:r.name,per_page:10}),
          github.issues.listForRepo({owner,repo:r.name,state:"open",per_page:100}),
          github.pulls.list({owner,repo:r.name,state:"open",per_page:100})
        ]);
        const issueCount=issues.data.filter(x=>!x.pull_request).length;
        const pullCount=pulls.data.length;
        const score=Math.min(100,Math.round(45+commits.data.length*4+pullCount*5+Math.max(0,10-issueCount)*2));
        scored.push({repo:r.name,language:r.language,score,open_issues:issueCount,open_pulls:pullCount});
      }catch{}
    }
    scored.sort((a,b)=>a.score-b.score);
    const target=scored[0]||null;
    res.json({ok:true,recommendation:target?{
      action:"inspect_and_improve",
      repository:target.repo,
      reason:"Lowest current development score in the accessible portfolio",
      suggested_task:"Inspect architecture, security, tests, CI/CD and documentation; propose the highest-value safe improvement.",
      score:target.score
    }:null,portfolio:scored});
  }catch(e){next(e);}
});



app.get("/api/agent/health",(req,res)=>{
  res.json({ok:true,agent:"DJ GitHub AI",version:"1.0",capabilities:[
    "repository intelligence","AI patch generation","patch validation",
    "approved branch writes","pull request creation","security policy","audit trail"
  ],safety:{approval_required:true,automatic_merge:false,secret_access:false}});
});


app.get("/api/evaluate",(req,res)=>{
  const r=req.query;
  const tests=r.tests==="true", validation=r.validation==="true", review=r.review==="true";
  const security=Math.max(0,parseInt(r.security||"0",10)||0);
  const score=(tests?40:0)+(validation?30:0)+(review?20:0)+(security===0?10:Math.max(0,10-security*3));
  res.json({ok:true,score,promote:score>=85,criteria:{tests,validation,review,security_findings:security}});
});

app.get("/api/audit",(_req,res)=>res.json({ok:true,events:audit.slice(-100)}));
app.use((err,_req,res,_next)=>{
  const status=Number(err.status||err.statusCode||500);
  res.status(status).json({ok:false,error:status>=500?"GitHub AI service error":err.message});
});
app.listen(port,()=>console.log("DJ GitHub AI listening on :"+port));
