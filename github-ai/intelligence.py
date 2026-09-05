"""DJ repository intelligence: deterministic portfolio scoring and evidence extraction."""
from dataclasses import dataclass, asdict
from typing import Iterable

@dataclass
class RepoSignals:
    name:str
    stars:int=0
    open_issues:int=0
    open_prs:int=0
    has_readme:bool=False
    has_tests:bool=False
    has_ci:bool=False
    recent_commits:int=0
    security_alerts:int=0

def score(s:RepoSignals)->int:
    value=50
    value += min(s.stars,10)*2
    value += 8 if s.has_readme else -10
    value += 10 if s.has_tests else -8
    value += 8 if s.has_ci else -4
    value += min(s.recent_commits,10)*2
    value -= min(s.open_issues,10)*2
    value -= min(s.security_alerts,10)*8
    return max(0,min(100,value))

def rank(signals:Iterable[RepoSignals]):
    rows=[{**asdict(s),"score":score(s)} for s in signals]
    return sorted(rows,key=lambda x:(x["score"],-x["recent_commits"]))
