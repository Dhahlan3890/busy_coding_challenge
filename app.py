from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
import google.generativeai as genai
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import tempfile
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load env vars
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("EMAIL_USER") 
SMTP_PASS = os.getenv("EMAIL_PASS")  

# Init FastAPI
app = FastAPI(title="MCP Server - Unified CV Chat & Email")

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- PDF Helpers ---------------- #

def get_pdf_text(pdf_files):
    text = ""
    for pdf in pdf_files:
        try:
            pdf_reader = PdfReader(pdf)
            for page in pdf_reader.pages:
                page_text = page.extract_text() or ""
                text += page_text
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF: {e}")
    if not text.strip():
        raise ValueError("No text could be extracted from the PDFs.")
    return text


def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    return text_splitter.split_text(text)


def build_vector_store(text_chunks):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
        return vector_store
    except Exception as e:
        raise RuntimeError(f"Error building FAISS index: {e}")


def get_conversational_chain():
    prompt_template = """
    You are a highly knowledgeable assistant. 
    Answer the user's question based on the provided context. 
    If the answer is missing, say:
    "The answer isn't in the provided data, but here is the closest match (in point form)."

    Context:\n {context}\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)


def query_resume(vector_store, user_question: str):
    try:
        docs_with_scores = vector_store.similarity_search_with_score(user_question, k=5)
        if not docs_with_scores:
            return "No relevant information found in the PDFs."

        docs = [doc for doc, score in docs_with_scores if score > 0.3]
        if not docs:
            docs = [docs_with_scores[0][0]]

        chain = get_conversational_chain()
        response = chain({"input_documents": docs, "question": user_question}, return_only_outputs=True)

        return response["output_text"]
    except Exception as e:
        raise RuntimeError(f"Error during resume query: {e}")


# ---------------- Unified Endpoint ---------------- #

@app.post("/chat-pdf/")
async def chat_pdf(files: list[UploadFile] = File(...), question: str = Form(...)):
    """
    Upload one/multiple PDFs + a question, 
    then get AI-powered answer from CV/Docs.
    """
    try:
        temp_dir = tempfile.mkdtemp()
        file_paths = []

        # Save uploaded files
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_path)

        # Extract text + build vector store
        pdf_text = get_pdf_text(file_paths)
        chunks = get_text_chunks(pdf_text)
        vector_store = build_vector_store(chunks)

        # Query with question
        answer = query_resume(vector_store, question)

        return {"question": question, "answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- Email API ---------------- #

class EmailRequest(BaseModel):
    recipient: str
    subject: str
    body: str


@app.post("/send-email/")
async def send_email(email: EmailRequest):
    """
    Send an email using Gmail SMTP.
    Requires EMAIL_USER and EMAIL_PASS (App Password) in .env
    """
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = email.recipient
        msg["Subject"] = email.subject
        msg.attach(MIMEText(email.body, "plain"))

        # Connect to SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, email.recipient, msg.as_string())
        server.quit()

        return {
            "status": "success",
            "message": f"Email sent successfully to {email.recipient}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {e}")


@app.get("/")
async def root():
    return {"message": "MCP Server running. Endpoints: /chat-pdf, /send-email"}
