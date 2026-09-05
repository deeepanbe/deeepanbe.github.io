import re, json
from dataclasses import dataclass, asdict
from typing import List

@dataclass
class Profile:
    name:str=""
    email:str=""
    phone:str=""
    skills:List[str]=None
    titles:List[str]=None
    years_experience:float=0
    education:List[str]=None
    certifications:List[str]=None
    def __post_init__(self):
        self.skills=self.skills or []; self.titles=self.titles or []; self.education=self.education or []; self.certifications=self.certifications or []

def parse_resume(text:str)->Profile:
    email=(re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",text) or [""])[0]
    phone=(re.search(r"(?:\+91[- ]?)?[6-9]\d{9}",text) or [""])[0]
    years=(re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)",text,re.I) or ["0","0"])[1]
    skills=[]
    for s in ["Python","SQL","Power BI","DAX","Excel","Tableau","Pandas","BigQuery","Machine Learning","Git"]:
        if re.search(r"\b"+re.escape(s)+r"\b",text,re.I): skills.append(s)
    cert=[x.strip() for x in re.findall(r"(?:Google Data Analytics|DP-900|PL-300|[A-Z]{2,}-\d{3})",text,re.I)]
    return Profile(email=email,phone=phone,skills=skills,years_experience=float(years),certifications=cert)

def match(profile:Profile, job:dict)->dict:
    required=set(x.lower() for x in job.get("skills",[])); have=set(x.lower() for x in profile.skills)
    matched=sorted(required & have); missing=sorted(required-have)
    score=round(100*len(matched)/max(1,len(required)))
    return {"score":score,"matched_skills":matched,"missing_skills":missing,"job_title":job.get("title","")}

if __name__=="__main__":
    import sys
    text=sys.stdin.read()
    print(json.dumps(asdict(parse_resume(text)),indent=2))
