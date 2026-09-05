"""Provider-neutral SaaS domain layer for DJ AI."""
from dataclasses import dataclass,field
from typing import Set
PLANS={"free":{"repos":2,"agent_tasks":10},"developer":{"repos":10,"agent_tasks":100},"pro":{"repos":50,"agent_tasks":500},"team":{"repos":250,"agent_tasks":5000}}
@dataclass
class Account:
    user_id:str
    plan:str="free"
    github_installation_id:str|None=None
    repositories:Set[str]=field(default_factory=set)
    usage:int=0
    def limits(self): return PLANS[self.plan]
    def can_use(self)->bool: return self.usage < self.limits()["agent_tasks"]
    def can_add_repo(self)->bool: return len(self.repositories)<self.limits()["repos"]
    def consume(self): 
        if not self.can_use(): raise PermissionError("Plan usage limit reached")
        self.usage+=1
def scope_repo(account:Account,repo:str)->bool: return repo in account.repositories
