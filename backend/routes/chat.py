from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Literal

from security.auth import require_jwt
from security.rate_limit import limiter
from security.sanitizer import sanitize_user_input
from services.claude_service import get_dj_response

router = APIRouter()


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    messages: List[Message]
    mode: str = "chat"


class ChatResponse(BaseModel):
    reply: str
    mode: str
    grounded: bool


@router.post("/", response_model=ChatResponse)
@limiter.limit("60/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    _claims: dict = Depends(require_jwt),
):
    sanitized_messages = [
        {"role": message.role, "content": sanitize_user_input(message.content)}
        for message in body.messages
    ]
    reply = await get_dj_response(sanitized_messages, mode=body.mode)
    return ChatResponse(reply=reply, mode=body.mode, grounded=True)
