from agent_loop import AgentLoop
def test_retries_after_test_failure():
    calls={"n":0}
    def gen(task):
        calls["n"]+=1; return "bad" if calls["n"]==1 else "good"
    def val(p): return {"passed":True}
    def test(p): return {"passed":p=="good"}
    r=AgentLoop(3).run("fix",gen,val,test)
    assert r["status"]=="ready_for_approval" and r["attempts"]==2
