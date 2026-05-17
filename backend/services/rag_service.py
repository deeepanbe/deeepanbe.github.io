import os
from pathlib import Path
import chromadb

CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")
COLLECTION_NAME = "deepanraj_knowledge"

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(COLLECTION_NAME)


def upsert_document(doc_id: str, text: str, metadata: dict | None = None) -> None:
    collection.upsert(
        ids=[doc_id],
        documents=[text],
        metadatas=[metadata or {}],
    )


async def get_rag_context(query: str, limit: int = 5) -> str:
    if not query.strip():
        return ""

    results = collection.query(query_texts=[query], n_results=limit)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    context_blocks = []
    for index, doc in enumerate(documents):
        source = metadatas[index].get("source", "unknown") if index < len(metadatas) else "unknown"
        context_blocks.append(f"[source: {source}]\n{doc}")

    return "\n\n---\n\n".join(context_blocks)


def index_markdown_folder(folder: str = "knowledge") -> int:
    count = 0
    for path in Path(folder).glob("*.md"):
        upsert_document(
            doc_id=f"knowledge:{path.stem}",
            text=path.read_text(encoding="utf-8"),
            metadata={"source": str(path)},
        )
        count += 1
    return count
