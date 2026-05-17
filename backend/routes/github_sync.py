from fastapi import APIRouter, Depends

from security.auth import require_jwt
from services.github_sync import sync_github_repositories

router = APIRouter()


@router.post("/github")
async def sync_github(_claims: dict = Depends(require_jwt)):
    result = await sync_github_repositories()
    return result
