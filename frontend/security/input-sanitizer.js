const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
  /print\s+(your\s+)?hidden\s+instructions/i,
  /bypass\s+(security|auth|authentication)/i,
  /forget\s+(your\s+)?rules/i,
  /show\s+(api\s+key|jwt|secret)/i
];

export function sanitizeInput(value) {
  const cleaned = String(value || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, 8000);

  const blocked = PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(cleaned));
  return {
    value: blocked
      ? 'Blocked prompt-injection attempt. Please ask a normal analytics question.'
      : cleaned,
    blocked
  };
}
