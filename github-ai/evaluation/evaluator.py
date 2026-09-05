"""Small, dependency-free evaluator for DJ agent changes."""
import json,sys
def evaluate(result):
    tests=result.get("tests_passed",False)
    validation=result.get("validation_passed",False)
    security=result.get("security_findings",0)
    reviewer=result.get("review_accepted",False)
    score=0
    score += 40 if tests else 0
    score += 30 if validation else 0
    score += 20 if reviewer else 0
    score += 10 if security==0 else max(0,10-security*3)
    return {"score":score,"promote":score>=85,"reasons":{
        "tests":tests,"validation":validation,"security_findings":security,"review_accepted":reviewer}}
if __name__=="__main__":
    print(json.dumps(evaluate(json.load(sys.stdin)),indent=2))
