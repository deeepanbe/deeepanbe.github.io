import os
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

from services.rag_service import get_rag_context
from system_prompt import DJ_SYSTEM_PROMPT

load_dotenv()
client = AsyncAnthropic(api_key=os.getenv("CLAUDE_API_KEY"))


async def get_dj_response(messages: list[dict], mode: str = "chat") -> str:
    latest_query = messages[-1]["content"] if messages else ""
    rag_context = await get_rag_context(latest_query, limit=5)
    system_prompt = DJ_SYSTEM_PROMPT.replace(
        "{INJECT_RAG_CONTEXT_HERE}",
        rag_context or "No relevant verified context found.",
    )

    claude_messages = [
        {"role": item["role"], "content": item["content"]}
        for item in messages
        if item["role"] in {"user", "assistant"}
    ]

    response = await client.messages.create(
        model=os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20240620"),
        max_tokens=1500,
        temperature=0.3,
        system=f"{system_prompt}\n\nCurrent mode: {mode}",
        messages=claude_messages,
    )

    return response.content[0].text
