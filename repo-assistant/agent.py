import os, json, hashlib
from typing import Any
import requests

API="https://api.github.com"
TOKEN=os.environ["GITHUB_TOKEN"]
OWNER=os.environ["GITHUB_OWNER"]
MODEL=os.getenv("OPENAI_MODEL","gpt-5.6-luna")
OPENAI=os.getenv("OPENAI_API_KEY")
HEAD={"Authorization":f"Bearer {TOKEN}","Accept":"application/vnd.github+json"}

def gh(path, params=None):
    r=requests.get(API+path,headers=HEAD,params=params,timeout=30); r.raise_for_status(); return r.json()

def review_patch(repo, pr_number):
    files=gh(f"/repos/{OWNER}/{repo}/pulls/{pr_number}/files",{"per_page":100})
    if not files: return "No changed files."
    findings=[]
    for f in files:
        patch=f.get("patch") or ""
        if not patch: continue
        if "TODO" in patch or "pass" in patch: findings.append(f"{f['filename']}: review placeholder/TODO changes.")
        if "print(" in patch: findings.append(f"{f['filename']}: avoid debug print statements in production code.")
        if "eval(" in patch or "exec(" in patch: findings.append(f"{f['filename']}: dangerous dynamic execution; justify or remove.")
        if "password" in patch.lower() or "api_key" in patch.lower(): findings.append(f"{f['filename']}: inspect for hard-coded credentials/secrets.")
    if OPENAI:
        payload={"model":MODEL,"messages":[
          {"role":"system","content":"Review code diffs like a senior engineer. Return concise, specific, actionable findings only. Never invent issues."},
          {"role":"user","content":json.dumps([{"file":f["filename"],"patch":f.get("patch","")} for f in files])[:90000]}
        ],"temperature":0.1}
        rr=requests.post("https://api.openai.com/v1/chat/completions",headers={"Authorization":f"Bearer {OPENAI}","Content-Type":"application/json"},json=payload,timeout=90)
        if rr.ok: findings.append(rr.json()["choices"][0]["message"]["content"])
    return "\n".join(f"- {x}" for x in findings) or "No high-confidence issues detected."

def main():
    repo=os.getenv("GITHUB_REPOSITORY","").split("/")[-1] or OWNER
    event=os.getenv("PR_NUMBER")
    if not event: print("Set PR_NUMBER to review a pull request."); return
    result=review_patch(repo,int(event))
    print(result)
    with open("review-result.json","w") as f: json.dump({"repo":repo,"pr":int(event),"review":result,"fingerprint":hashlib.sha256(result.encode()).hexdigest()},f)

if __name__=="__main__": main()
