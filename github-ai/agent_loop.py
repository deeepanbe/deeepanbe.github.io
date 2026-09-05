"""DJ bounded autonomous engineering loop.
Generates a task plan, validates a proposed patch, and records an evaluation.
Actual repository writes remain approval-gated.
"""
from dataclasses import dataclass,asdict
from typing import Callable,Optional
import json,time

@dataclass
class Step:
    name:str
    status:str
    detail:str=""

class AgentLoop:
    def __init__(self,max_attempts=3):
        self.max_attempts=max(1,min(max_attempts,3))
        self.steps=[]
    def run(self, task:str, generate:Callable[[str],str], validate:Callable[[str],dict], test:Callable[[str],dict]):
        for attempt in range(1,self.max_attempts+1):
            self.steps.append(Step(f"generate-{attempt}","running"))
            patch=generate(task)
            self.steps[-1]=Step(f"generate-{attempt}","passed")
            v=validate(patch)
            self.steps.append(Step(f"validate-{attempt}","passed" if v.get("passed") else "failed",json.dumps(v)))
            if not v.get("passed"):
                task=task+"\nFix validation failures: "+json.dumps(v); continue
            t=test(patch)
            self.steps.append(Step(f"test-{attempt}","passed" if t.get("passed") else "failed",json.dumps(t)))
            if t.get("passed"):
                return {"status":"ready_for_approval","attempts":attempt,"patch":patch,"steps":[asdict(x) for x in self.steps],"timestamp":time.time()}
            task=task+"\nFix test failures: "+json.dumps(t)
        return {"status":"blocked","reason":"Maximum safe attempts reached","steps":[asdict(x) for x in self.steps],"timestamp":time.time()}
