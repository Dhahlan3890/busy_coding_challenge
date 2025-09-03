# Busy Coding Challenge

This project is a full-stack AI-powered document assistant with:
- **FastAPI backend** (Python): Handles PDF upload, AI-powered Q&A, and email sending.
- **Next.js frontend** (React/TypeScript): User interface for uploading documents, chatting with AI, and composing emails.

---

## Features
- Upload and analyze PDF documents
- Ask questions about uploaded documents (AI-powered)
- Compose and send emails via Gmail SMTP

---

## Project Structure

```
.
├── app.py                  # FastAPI backend
├── requirements.txt        # Python dependencies
├── ai-document-chat/       # Next.js frontend app
│   ├── package.json        # Frontend dependencies
│   └── ...
├── dockerfile              # Production Dockerfile (multi-stage)
├── supervisord.conf        # Supervisor config for running both apps
└── ...
```

---

## FastAPI Backend

- **Location:** `app.py`
- **Run locally:**
  ```bash
  pip install -r requirements.txt
  uvicorn app:app --reload
  ```
- **Endpoints:**
  - `POST /chat-pdf/` — Upload PDFs and ask questions
  - `POST /send-email/` — Send emails
- **Environment variables:**
  - `GOOGLE_API_KEY` (for Gemini/Google Generative AI)
  - `EMAIL_USER` and `EMAIL_PASS` (Gmail SMTP, App Password recommended)
- **.env file example:**
  ```env
  GOOGLE_API_KEY=your_google_api_key
  EMAIL_USER=your_gmail_address@gmail.com
  EMAIL_PASS=your_gmail_app_password
  ```

---

## Next.js Frontend

- **Location:** `ai-document-chat/`
- **Run locally:**
  ```bash
  cd ai-document-chat
  npm install
  npm run dev
  ```
- **Features:**
  - Upload PDFs
  - Chat with AI about document content
  - Compose and send emails
- **Configuration:**
  - Update API URLs in frontend if backend is not on `localhost:8000`

---

## Docker Deployment

- **Build image:**
  ```bash
  docker build -t busy-coding-challenge .
  ```
- **Run container:**
  ```bash
  docker run -p 8000:8000 -p 3000:3000 busy-coding-challenge
  ```
- **Access:**
  - FastAPI: http://localhost:8000
  - Next.js: http://localhost:3000

---

## Render.com Deployment

- Push code to GitHub
- Create a new Web Service on Render, select Docker, and connect your repo
- Set environment variables in Render dashboard
- Expose port 3000 (Next.js) or 8000 (FastAPI) as needed

---

## License
MIT
