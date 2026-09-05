import os, json, hashlib, hmac, base64, urllib.request, urllib.error, re
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS

app=Flask(__name__)
CORS(app, origins=os.getenv("CORS_ORIGINS","*").split(","))
GH_TOKEN=os.getenv("GITHUB_TOKEN","")
OPENAI_KEY=os.getenv("OPENAI_API_KEY","")
OWNER=os.getenv("GITHUB_OWNER","deeepanbe")
MODEL=os.getenv("MODEL","gpt-5.6-luna")
STATE_FILE=os.getenv("STATE_FILE","agent_state.json")

def gh(path, method="GET", payload=None):
    url="https://api.github.com"+path
    headers={"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
    if GH_TOKEN: headers["Authorization"]="Bearer "+GH_TOKEN
    data=json.dumps(payload).encode() if payload is not None else None
    req=urllib.request.Request(url,data=data,headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=20) as r: return json.load(r)

def ai(prompt):
    if not OPENAI_KEY: return {"mode":"local","answer":"AI provider is not configured. GitHub analysis remains available; set OPENAI_API_KEY on the server to enable model-generated reviews."}
    body={"model":MODEL,"messages":[{"role":"system","content":"You are DJ GitHub AI. Be precise, security-conscious and evidence-based. Never invent repository facts. Propose changes, do not claim execution unless confirmed."},{"role":"user","content":prompt}],"temperature":0.2}
    req=urllib.request.Request("https://api.openai.com/v1/chat/completions",data=json.dumps(body).encode(),headers={"Authorization":"Bearer "+OPENAI_KEY,"Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=45) as r:
        x=json.load(r); return {"mode":"ai","answer":x["choices"][0]["message"]["content"]}

def repos():
    return gh(f"/users/{OWNER}/repos?per_page=100&type=public&sort=updated")

def state():
    try:
        with open(STATE_FILE,encoding="utf-8") as f:return json.load(f)
    except Exception:return {"patterns":[],"reviews":[]}

def save(s):
    with open(STATE_FILE,"w",encoding="utf-8") as f:json.dump(s,f,indent=2)

@app.get("/health")
def health():
    return jsonify({"ok":True,"service":"dj-github-ai","github_configured":bool(GH_TOKEN),"ai_configured":bool(OPENAI_KEY),"owner":OWNER,"version":"3.0.0"})

@app.get("/api/repos")
def api_repos(): return jsonify({"repositories":[{"full_name":r["full_name"],"name":r["name"],"language":r.get("language"),"open_issues":r.get("open_issues_count",0),"updated_at":r["updated_at"],"default_branch":r["default_branch"]} for r in repos()]})

@app.get("/api/repos/<name>/overview")
def overview(name):
    r=gh(f"/repos/{OWNER}/{name}")
    commits=gh(f"/repos/{OWNER}/{name}/commits?per_page=10")
    return jsonify({"repository":r["full_name"],"description":r.get("description"),"language":r.get("language"),"stars":r["stargazers_count"],"forks":r["forks_count"],"issues":r["open_issues_count"],"branch":r["default_branch"],"recent_commits":[{"sha":x["sha"][:7],"message":x["commit"]["message"].split("\n")[0],"date":x["commit"]["author"]["date"]} for x in commits]})

@app.get("/api/repos/<name>/issues")
def issues(name): return jsonify({"issues":gh(f"/repos/{OWNER}/{name}/issues?state=open&per_page=50")})

@app.get("/api/repos/<name>/pulls")
def pulls(name): return jsonify({"pulls":gh(f"/repos/{OWNER}/{name}/pulls?state=open&per_page=50")})

@app.get("/api/repos/<name>/commits")
def commits(name): return jsonify({"commits":gh(f"/repos/{OWNER}/{name}/commits?per_page=30")})

@app.get("/api/intelligence")
def intelligence():
    rows=[]
    for r in repos():
        score=100
        if not r.get("description"): score-=10
        if r.get("open_issues_count",0)>5: score-=10
        rows.append({"repo":r["full_name"],"health_score":max(score,0),"language":r.get("language"),"issues":r.get("open_issues_count",0),"updated_at":r["updated_at"]})
    return jsonify({"owner":OWNER,"repositories":rows,"ranked":sorted(rows,key=lambda x:x["health_score"])})

@app.get("/api/utility-summary")
def utility_summary():
    rs=repos(); return jsonify({"owner":OWNER,"public_repositories":len(rs),"languages":sorted(set(r.get("language") for r in rs if r.get("language"))),"open_issues":sum(r.get("open_issues_count",0) for r in rs),"largest":[{"repo":r["name"],"size_kb":r["size"]} for r in sorted(rs,key=lambda x:x["size"],reverse=True)[:5]]})

@app.post("/api/agent/task")
def task():
    p=request.get_json(force=True).get("task","")
    data={"task":p,"repositories":[r["full_name"] for r in repos()],"guardrails":["read/analyze automatically","propose patches","never merge/delete/change permissions autonomously","writes require explicit approval"]}
    return jsonify(data | ai(json.dumps(data)))

@app.post("/api/agent/generate")
def generate():
    b=request.get_json(force=True); name=b.get("repo",""); path=b.get("path",""); instruction=b.get("instruction","")
    f=gh(f"/repos/{OWNER}/{name}/contents/{path}")
    raw=base64.b64decode(f["content"]).decode("utf-8")
    prompt=f"Repository: {OWNER}/{name}\nFile: {path}\nInstruction: {instruction}\nCurrent file:\n{raw}\nReturn a minimal unified diff and explain risks/tests. Do not invent APIs."
    result=ai(prompt); pid=hashlib.sha256((name+path+result["answer"]).encode()).hexdigest()[:16]
    s=state(); s["reviews"].append({"proposal_id":pid,"repo":name,"path":path,"created_at":datetime.now(timezone.utc).isoformat()}); save(s)
    return jsonify({"proposal_id":pid,"repo":name,"path":path,"current_sha":f["sha"],**result})

@app.post("/api/agent/validate")
def validate():
    b=request.get_json(force=True); pid=b.get("proposal_id")
    ok=bool(pid and re.fullmatch(r"[0-9a-f]{16}",pid))
    return jsonify({"proposal_id":pid,"valid":ok,"checks":["proposal id format","server-side approval boundary","no direct merge/delete operation"],"next":"review then approve/apply" if ok else "generate a proposal first"})

@app.get("/api/agent/next")
def next_action():
    rs=repos()
    ranked=sorted(rs,key=lambda r:(bool(r.get("description")), -r.get("open_issues_count",0)))
    r=ranked[0] if ranked else None
    return jsonify({"recommendation":"Improve repository documentation, tests and reproducibility first.","repository":r["full_name"] if r else None})

@app.post("/api/agent/apply")
def apply_change():
    b=request.get_json(force=True)
    if b.get("confirm")!="APPROVE": return jsonify({"error":"Explicit APPROVE confirmation required"}),400
    name,path,content=b.get("repo"),b.get("path"),b.get("content")
    if not all(isinstance(x,str) and x.strip() for x in [name,path,content]): return jsonify({"error":"repo, path and content are required"}),400
    base=gh(f"/repos/{OWNER}/{name}")
    default=base["default_branch"]
    branch_name="dj-ai/"+datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    ref=gh(f"/repos/{OWNER}/{name}/git/ref/heads/{default}")
    gh(f"/repos/{OWNER}/{name}/git/refs","POST",{"ref":"refs/heads/"+branch_name,"sha":ref["object"]["sha"]})
    old=gh(f"/repos/{OWNER}/{name}/contents/{path}?ref={default}")
    payload={"message":"feat: apply approved DJ AI change","content":base64.b64encode(content.encode()).decode(),"sha":old["sha"],"branch":branch_name}
    gh(f"/repos/{OWNER}/{name}/contents/{path}","PUT",payload)
    pr=gh(f"/repos/{OWNER}/{name}/pulls","POST",{"title":"DJ AI: approved improvement","head":branch_name,"base":default,"body":"Created by DJ GitHub AI after explicit user approval. Please review before merging."})
    return jsonify({"ok":True,"branch":branch_name,"pull_request":pr.get("html_url"),"message":"Change committed to a review PR; merge remains manual."})

@app.post("/api/webhook")
def webhook():
    secret=os.getenv("GITHUB_WEBHOOK_SECRET",""); sig=request.headers.get("X-Hub-Signature-256","")
    raw=request.get_data()
    if secret:
        expected="sha256="+hmac.new(secret.encode(),raw,hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected,sig): return jsonify({"error":"invalid signature"}),401
    event=request.headers.get("X-GitHub-Event","unknown")
    payload=request.get_json(silent=True) or {}
    s=state(); s["patterns"].append({"event":event,"repo":payload.get("repository",{}).get("full_name"),"action":payload.get("action"),"at":datetime.now(timezone.utc).isoformat()}); s["patterns"]=s["patterns"][-500:]; save(s)
    return jsonify({"ok":True,"event":event})

@app.errorhandler(Exception)
def error(e): return jsonify({"error":str(e)}),500

if __name__=="__main__": app.run(host="0.0.0.0",port=int(os.getenv("PORT","10000")))
