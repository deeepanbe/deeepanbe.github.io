import io, json, os, re
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pypdf import PdfReader
from app import parse_resume, match

app=FastAPI(title="DJ Job Profile API",version="1.0")

MAX_UPLOAD=5*1024*1024

def extract(data:bytes, filename:str)->str:
    if filename.lower().endswith(".pdf"):
        return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)
    return data.decode("utf-8","ignore")

@app.get("/health")
def health(): return {"ok":True,"service":"dj-job-profile"}

@app.post("/profile/parse")
async def profile_parse(file:UploadFile=File(...)):
    data=await file.read()
    if len(data)>MAX_UPLOAD: raise HTTPException(413,"File too large")
    if not (file.filename or "").lower().endswith((".pdf",".txt")): raise HTTPException(415,"Use PDF or TXT")
    return JSONResponse({"profile":parse_resume(extract(data,file.filename)).__dict__})

@app.post("/jobs/match")
async def jobs_match(profile: str=Form(...), job: str=Form(...)):
    try: p=json.loads(profile); j=json.loads(job)
    except Exception: raise HTTPException(400,"profile and job must be JSON")
    from app import Profile
    prof=Profile(**p)
    return match(prof,j)

@app.post("/applications/manual-assist")
async def manual_assist(job_url:str=Form(...), job_title:str=Form("")):
    if not re.match(r"^https?://",job_url): raise HTTPException(400,"Invalid job URL")
    return {"mode":"manual_assist","job_title":job_title,"job_url":job_url,
            "message":"Review your tailored documents and complete the final application yourself.",
            "platform_automation":"disabled"}
