import os
import httpx

from services.rag_service import upsert_document

GITHUB_API = "https://api.github.com"


async def sync_github_repositories() -> dict:
    owner = os.getenv("GITHUB_OWNER", "deeepanbe")
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=30) as client:
        repos_response = await client.get(f"{GITHUB_API}/users/{owner}/repos", headers=headers)
        repos_response.raise_for_status()
        repos = repos_response.json()

        indexed = 0
        for repo in repos:
            if repo.get("fork"):
                continue
            repo_name = repo["name"]
            summary = [
                f"Repository: {repo_name}",
                f"Description: {repo.get('description') or 'No description'}",
                f"URL: {repo.get('html_url')}",
                f"Language: {repo.get('language') or 'Unknown'}",
                f"Topics: {', '.join(repo.get('topics') or [])}",
            ]
            upsert_document(
                doc_id=f"github:{repo_name}",
                text="\n".join(summary),
                metadata={"source": repo.get("html_url"), "type": "github_repo"},
            )
            indexed += 1

    return {"status": "ok", "indexed_repositories": indexed}
