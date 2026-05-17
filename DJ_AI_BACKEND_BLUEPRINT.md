# DJ AI Backend Blueprint

Create this as a separate private repository:

`dj-ai-backend`

The current portfolio repo includes a safe scaffold under `/backend` and
`/frontend/security` so the private repo can be created quickly without
committing secrets.

## Structure

```text
dj-ai-backend/
├── main.py
├── routes/
│   ├── chat.py
│   ├── upload.py
│   └── health.py
├── services/
│   ├── ai_service.py
│   ├── rag_service.py
│   └── data_service.py
├── knowledge/
│   ├── resume.md
│   ├── projects.md
│   ├── sql_notes.md
│   ├── powerbi_notes.md
│   └── certifications.md
├── .env
├── .env.example
├── requirements.txt
└── Procfile
```

## main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, upload, health

app = FastAPI(title="DJ AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://deeepanbe.github.io",
        "http://localhost:3000",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router, prefix="/chat")
app.include_router(upload.router, prefix="/upload")
```

## requirements.txt

```text
fastapi==0.110.0
uvicorn==0.27.0
openai==1.14.0
pandas==2.2.0
numpy==1.26.4
openpyxl==3.1.2
python-multipart==0.0.9
python-dotenv==1.0.1
```

## Render Deployment

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variable:

```text
OPENAI_API_KEY=your_openai_key_here
```

For Claude production, use:

```text
CLAUDE_API_KEY=your_claude_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20240620
JWT_SECRET=long_random_secret
```

After deployment, update:

```js
DJ_CONFIG.BACKEND_URL = "https://dj-ai-backend.onrender.com";
```
