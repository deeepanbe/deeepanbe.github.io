import re

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"reveal\s+(the\s+)?(system|developer)\s+prompt",
    r"print\s+(your\s+)?hidden\s+instructions",
    r"bypass\s+(security|auth|authentication)",
    r"forget\s+(your\s+)?rules",
    r"act\s+as\s+developer\s+mode",
    r"do\s+anything\s+now",
    r"show\s+api\s+key",
    r"show\s+jwt",
]


def sanitize_user_input(value: str) -> str:
    cleaned = value.strip()
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", cleaned)

    lowered = cleaned.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return (
                "Blocked prompt-injection attempt. Please ask a normal question "
                "about Deepanraj, analytics, SQL, Power BI, Python, or projects."
            )

    return cleaned[:8000]
