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
app.get("/api/audit",(_req,res)=>res.json({ok:true,events:audit.slice(-100)}));
app.use((err,_req,res,_next)=>{
  const status=Number(err.status||err.statusCode||500);
  res.status(status).json({ok:false,error:status>=500?"GitHub AI service error":err.message});
});
app.listen(port,()=>console.log("DJ GitHub AI listening on :"+port));
