"""DJ AI security primitives: webhook verification, redaction and bounded actions."""
import hashlib,hmac,re
def verify_github_signature(payload:bytes,signature:str,secret:str)->bool:
    if not signature or not signature.startswith("sha256="): return False
    expected="sha256="+hmac.new(secret.encode(),payload,hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected,signature)
def redact(text:str)->str:
    patterns=[r'(?i)(api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+',r'gh[pousr]_[A-Za-z0-9_]+']
    out=text
    for p in patterns: out=re.sub(p,lambda m:m.group(0).split(":")[0].split("=")[0]+"=[REDACTED]",out)
    return out
def allowed_action(action:str)->bool:
    return action in {"read","analyze","generate_patch","validate","run_tests","create_branch","create_pr"}
