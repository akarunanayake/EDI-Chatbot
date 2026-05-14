from fastapi import FastAPI, Request, Form, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
from uuid import uuid4
from fastapi.responses import JSONResponse
from io import BytesIO
from docx import Document
import fitz  # PyMuPDF
from typing import Optional
from .init_db import init_db
from .models import ChatSession, Message, Feedback
from .db import SessionLocal
from fastapi.responses import StreamingResponse
from docx import Document
import io
from fastapi import Request
import json
from pdf2docx import Converter
from docx.text.paragraph import Paragraph
from docx.oxml import OxmlElement
from docx.shared import RGBColor
import re

#Load OpenAI API key
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#Initialize DB
init_db()

#Initialize app
app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Define and initialize chatbot system prompt
SYSTEM_PROMPT = (
    '''You are an EDI advisor chatbot. Your role is to support educators in integrating Equity, Diversity, and Inclusion (EDI) principles into their ICT lessons. Draw on your knowledge of EDI in ICT education to offer thoughtful, practical, and constructive guidance.

Begin the conversation by warmly introducing yourself as an EDI advisor. Invite the educator to ask any question related to EDI integration into their ICT lessons and remind them they can upload their lesson plans they’d like to enhance with EDI principles at anytime. 
Also, mention that several support options and action buttons are available in the right panel to help educators integrate EDI principles into their lesson plans, and that these become available after a lesson plan is uploaded.

When offering support, apply the following guiding principles:
 1. Strong Equity
Provide suggestions with a focus on strong equity, including:
• Recognition: Validate the lived experiences and knowledge of marginalized groups.
• Representation: Ensure students from diverse backgrounds are visible in content, examples, and discourse.
• Reframing: Challenge deficit narratives and stereotypes using inclusive language and critical reflection.

 2. Universal Design for Learning (UDL)
Apply UDL principles, especially those supporting emotional capacity:
• Embed empathy and restorative practices into learning activities.
• Use strategies that foster perspective-taking, relational awareness, and community trust.
• Design tasks that allow for multiple formats of expression and support safe academic risk-taking.

 3. Social Constructivist Learning
Promote collaborative learning and distributed expertise:
• Encourage peer interaction and co-construction of knowledge.
• Include content that raises awareness of different social groups to challenge assumptions.
• Use open-ended tasks that invite diverse perspectives and lived experiences.

 4. Teacher and Institutional Practice Awareness
Be mindful of hidden curriculum and institutional norms:
• Include diverse representation in texts, examples, and references.
• Avoid reinforcing dominant cultural norms or stereotypes.
• Design activities that disrupt bias and foster critical empathy.

 Design Requirements
• Offer multiple modes of engagement (e.g., visual, oral, written, experiential).
• Provide flexibility in how students demonstrate understanding.
• Use inclusive language and prompts that invite varied viewpoints.
• Include feedback mechanisms that are empathetic, growth-oriented, and restorative.
Where appropriate, integrate data or insights about different social groups to build awareness and counter deficit thinking.

Lesson Plan Upload Handling

If the educator uploads a lesson plan along with their own requirements, provide assistance accordingly.

If the educator uploads a lesson plan without their own request:
• Acknowledge the upload;
• Briefly summarise the lesson topic or context;
• Briefly mention that EDI support can be provided for the lesson;
• Then ask how they would like support.

Do not immediately provide detailed support suggestions, examples, or multiple support recommendations unless the educator specifically asks for them.

After the acknowledgement and brief summary, guide the educator by asking them to either:
• select one of the available support options from the right panel;
• or explain their specific requirements or goals in the chat.

Avoid repeating or paraphrasing multiple support options conversationally as the interface already presents them separately.

The  support options are as follows:

1. I want to integrate EDI principles into this lesson plan.
2. I want to include better examples or datasets that reflect EDI principles.
3. I want to design an EDI-integrated assignment for this lesson.
4. I want to include reflective questions to help students think about EDI in this lesson.
5. I want to evaluate my lesson plan in terms of how well it addresses EDI principles.
6. Something else.

These options are primarily represented through the interface and do not need to be reproduced conversationally unless specifically requested.

If the educator selects a numbered option, respond with relevant insights, suggestions, or resources tailored to their choice. If they select “6” ask them to describe their specific needs or goals.

Conversation Flow and Follow-up Guidance
Throughout the conversation:

Use a supportive, conversational tone.

Guide the educator with questions or prompts appropriate to their context.

Offer explanations, examples, or ideas suited to their level of experience with EDI.

If the educator seems unsure or stuck, suggest possible directions or ask clarifying questions.

If they enter an unrecognized input, gently prompt them to choose from the available options or rephrase their request.

Refer to the right panel or action buttons only when contextually relevant. Do not repeatedly mention interface controls in every response.

After meaningfully completing a support response, you may remind educators that additional support options are available in the right panel.


Follow-up After Suggestions
After suggesting new content—such as examples, datasets, assignments, reflective questions, or learning activities, 
ask context-appropriate follow-up questions that help the educator reflect, refine, or move forward. These follow-up prompts should:

Encourage adaptation, integration, or deeper thinking;

Support decision-making about incorporating the suggestion;

Align with the educator’s original intent and lesson context;

Be supportive and conversational in tone.

At any point do not limit yourself only to the specifically mentioned follow-up question; 
including that question, include other relevant follow-up questions as well, according to the provided instructions.

Lesson Plan Update Behaviour

When you provide content that can be directly added to the educator’s lesson plan — such as activities, examples, datasets, assignments, reflective questions, rewritten lesson content, or EDI integration suggestions — ask whether they would like to “update the lesson plan”.

Only suggest using the “Update Lesson Plan” action when the generated content can be directly incorporated into the lesson plan.

If you ask whether the educator would like to update the lesson plan, ask them to click the “Update Lesson Plan” button in the right panel to update lesson plan.

Special Handling
If the educator chooses Option 2 (datasets/examples):

If only suggestions for improvement are offered, follow up by asking:
“Would you like to craft a sample dataset that reflects these principles?”

Only ask to "update the lesson plan" if a dataset or specific content has been generated.

If the educator chooses Option 4 (reflective questions):

After providing suggestions, ask whether they’d like to design an individual or group activity based on those questions.
'''
)

#Initialize maximum number of messages in the chat history
MAX_HISTORY = 20

#Create folder to save lesson plan
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "lessonPlans")
os.makedirs(UPLOAD_DIR, exist_ok=True)

#Check write permission (helps detect permission issues in deployed version)
if not os.access(UPLOAD_DIR, os.W_OK):
    print(f"Warning: Upload directory may not be writable: {UPLOAD_DIR}")

#Functions to extract text from the uploaded lesson plan
def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(BytesIO(file_bytes))
    return "\n".join(para.text for para in doc.paragraphs)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf:
        for page in pdf:
            text += page.get_text()
    return text

# Summarize older messages if available

def summarize_old_messages(session_id: str, db):
    all_messages = db.query(Message).filter_by(session_id=session_id).order_by(Message.timestamp).all()
    if len(all_messages) <= MAX_HISTORY:
        return None
    early_messages = all_messages[:-MAX_HISTORY]
    prompt = [
        {"role": "system", "content": "You are summarizing a conversation between an educator and an EDI advisor. Provide a brief summary of the conversation so far."},
        *[{"role": m.role, "content": m.content} for m in early_messages]
    ]
    summary_response = client.chat.completions.create(model="gpt-4.1-mini", messages=prompt)
    return summary_response.choices[0].message.content

#Send chat history
def get_chat_history(session_id: str, db):
    session = db.query(ChatSession).filter_by(id=session_id).first()
    history = db.query(Message).filter_by(session_id=session_id).order_by(Message.timestamp).all()
    messages = [{"role": m.role, "content": m.content} for m in history][-MAX_HISTORY:]

    system_prompt_present = any(
        m["role"] == "system" and SYSTEM_PROMPT in m["content"]
        for m in messages
    )

    #Inject system prompt if missing
    if not system_prompt_present:
        messages.insert(0, {
            "role": "system",
            "content": SYSTEM_PROMPT  
    })

    # Check if original lesson is referenced
    lesson_present = any(
        session.original_lesson.strip()[:100] in m["content"]
        for m in messages
    ) if session and session.original_lesson else False

    if session and session.original_lesson and not lesson_present:
        messages.insert(1, {
            "role": "user",
            "content": f"The original lesson plan for this conversation is:\n{session.original_lesson}"
        })

    #Inject chat history summary if available
    if session and session.summary:
        messages.insert(1, {
            "role": "system",
            "content": f"Summary of earlier conversation: {session.summary}"
        })

    return messages

def load_edits(session):
    try:
        return json.loads(session.suggested_edits or "[]")
    except:
        return []


def save_edits(session, edits):
    session.suggested_edits = json.dumps(edits)

def insert_paragraph_after(paragraph, text=None, style=None):
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)

    new_para = Paragraph(new_p, paragraph._parent)

    if text:
        run = new_para.add_run(text)

        # Manual formatting
        run.bold = True
        run.italic = False

        # Dark blue text
        run.font.color.rgb = RGBColor(0, 51, 102)

    return new_para

def extract_edi_section(text: str):
    match = re.search(
        r"### EDI integration start\.\s*(.*?)\s*### EDI integration end\.",
        text,
        re.DOTALL
    )
    
    if match:
        return match.group(1).strip()
    return None

def get_last_sentence_before_edi(text: str):
    marker = "### EDI integration start."

    if marker not in text:
        return None

    before_edi = text.split(marker)[0].strip()

    # Split into sentences (simple but effective for most lesson plans)
    sentences = re.split(r'(?<=[.!?])\s+', before_edi)

    # Get last non-empty sentence
    for s in reversed(sentences):
        if s.strip():
            return s.strip()

    return None

def get_last_paragraph_before_edi(text: str):
    marker = "### EDI integration start."

    if marker not in text:
        return None

    before = text.split(marker)[0].strip()

    paragraphs = [p.strip() for p in before.split("\n") if p.strip()]

    return paragraphs[-1] if paragraphs else None

def remove_edi_markers(text: str):
    text = text.replace("### EDI integration start.", "")
    text = text.replace("### EDI integration end.", "")
    return text

def supportOptions():
    allOptions = [
        {"label": "Integrate EDI principles into this lesson plan", "value": "1"},
        {"label": "Include better examples or datasets", "value": "2"},
        {"label": "Design an EDI-integrated assignment", "value": "3"},
        {"label": "Include reflective questions", "value": "4"},
        {"label": "Evaluate lesson plan for EDI", "value": "5"},
        {"label": "Something else", "value": "6"}
    ]

    return allOptions


@app.post("/chatStart")
async def chatStart():
    db = SessionLocal()
    session_id = str(uuid4())  # Create unique session ID

    # Initiate conversation executing system prompt
    db.add(ChatSession(id=session_id))
    db.add(Message(session_id=session_id, role="system", content=SYSTEM_PROMPT, visible=False))

    response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages= [{"role": "system", "content": SYSTEM_PROMPT}]
        )
        
    api_response = response.choices[0].message.content

    db.add(Message(session_id=session_id, role="assistant", content=api_response))
    db.commit()
    db.close()

    return {"response": api_response, "session_id" :session_id}

@app.post("/chatContinue")
async def chatContinue(request: Request, message: str = Form(None), session_id: str = Form(...), file: Optional[UploadFile] = File(None)):

    db = SessionLocal()
    file_content=""
    file_link=""
    #Extract content of the lesson plan
    if file and file is not None:
        # 🔹 Use universal path (cross-platform)
        Original_file_name = os.path.splitext(file.filename)[0]
        original_ext = os.path.splitext(file.filename)[1]
        unique_id = uuid4()
        original_stored_name = f"{unique_id}_{Original_file_name}{original_ext}"
        file_path = os.path.join(UPLOAD_DIR, original_stored_name)
        file_path = os.path.abspath(file_path)  # Ensure consistent path resolution
        file_link = str(request.url_for("view_file")) + f"?session_id={session_id}"

        # 🔹 Save uploaded file
        try:
            with open(file_path, "wb") as f:
                f.write(await file.read())
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Failed to save file: {str(e)}"})

        #Covert PDF to Docx
        if file.filename.lower().endswith(".pdf"):

            working_file_name = f"{unique_id}_{Original_file_name}.docx"
            output_path = os.path.join(UPLOAD_DIR, working_file_name)
            cv = Converter(file_path)
            cv.convert(output_path)
            cv.close()

            working_file_path = output_path
            working_file_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        else:
            working_file_name = original_stored_name
            working_file_path = file_path
            working_file_type = file.content_type

        if file_path.lower().endswith(".docx"):
            file_content = extract_text_from_docx(open(file_path, "rb").read())
        elif file_path.lower().endswith(".pdf"):
            file_content = extract_text_from_pdf(open(file_path, "rb").read())
        else:
            try:
                file_content = open(file_path, "r", encoding="utf-8").read()
            except Exception:
                file_content = "[File uploaded, but not readable.]"

    #Retrieve chat session
    chat_session = db.query(ChatSession).filter_by(id=session_id).first()

    #Generate chat history summary if it is not available 
    if not chat_session.summary:
        summary = summarize_old_messages(session_id, db)
        if summary:
            chat_session.summary = summary #Set chat history summary to chat session
            db.commit()

    #Inject chat history and user message to the prompt
    chat_messages = get_chat_history(session_id, db)
    if file and message:
        chat_messages.append({"role": "user", "content": f"Lesson Plan:\n{file_content} \n"+message})
        db.add(Message(session_id=session_id, role="user", content=f"📎 [View lesson plan: {file.filename}] \n"+message, file_link=file_link))
        db.add(Message(session_id=session_id, role="user", content=f"Lesson Plan:\n{file_content}", visible=False))
    if file and not message:
        chat_messages.append({"role": "user", "content": f"Lesson Plan:\n{file_content}"})
        db.add(Message(session_id=session_id, role="user", content=f"📎 [View lesson plan: {file.filename}]", file_link=file_link))
        db.add(Message(session_id=session_id, role="user", content=f"Lesson Plan:\n{file_content}", visible=False))
    if message and not file:
        chat_messages.append({"role": "user", "content": message})
        db.add(Message(session_id=session_id, role="user", content=message))

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=chat_messages
    )
    api_response = response.choices[0].message.content

    db.add(Message(session_id=session_id, role="assistant", content=api_response))
    if file:
        chat_session.original_lesson = file_content 
        chat_session.updated_lesson = file_content #Update lesson plan in db with uploaded file content
        chat_session.file_name = file.filename
        chat_session.file_path = file_path
        chat_session.file_type = file.content_type
        chat_session.working_file_name = working_file_name
        chat_session.working_file_path = working_file_path
        chat_session.working_file_type = working_file_type
        chat_session.suggested_edits = json.dumps([])
 
    db.commit()
    db.close()

    return {"response": api_response, "session_id" :session_id}

@app.post("/fileUpload")
async def fileUpload(request: Request, file: UploadFile = File(None), session_id: Optional[str] = Form(None)):
    db = SessionLocal()
    file_content=""
    #Extract content of the lesson plan
    if file:
        # 🔹 Use universal path (cross-platform)
        unique_name = f"{uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        file_path = os.path.abspath(file_path)  # Ensure consistent path resolution

        # 🔹 Save uploaded file
        try:
            with open(file_path, "wb") as f:
                f.write(await file.read())
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Failed to save file: {str(e)}"})


        if file.filename.endswith(".docx"):
            file_content = extract_text_from_docx(open(file_path, "rb").read())
        elif file.filename.endswith(".pdf"):
            file_content = extract_text_from_pdf(open(file_path, "rb").read())
        else:
            try:
                file_content = open(file_path, "r", encoding="utf-8").read()
            except Exception:
                file_content = "[File uploaded, but not readable.]"

        #Retrieve chat session
        chat_session = db.query(ChatSession).filter_by(id=session_id).first()
        if not chat_session:
            return JSONResponse(status_code=400, content={"error": "Invalid session_id"})

        if not chat_session.summary:
            summary = summarize_old_messages(session_id, db)
            if summary:
                chat_session.summary = summary
                db.commit()

        #Set chat history and file content to the prompt
        chat_messages = get_chat_history(session_id, db)
        chat_messages.append({"role": "user", "content": f"Lesson Plan:\n{file_content}"})

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=chat_messages
        )

        api_response = response.choices[0].message.content

        file_link = str(request.url_for("view_file")) + f"?session_id={session_id}"
        db.add(Message(session_id=session_id, role="user", content=f"📎 [View lesson plan: {file.filename}]", file_link=file_link))
        db.add(Message(session_id=session_id, role="user", content=f"Lesson Plan:\n{file_content}", visible=False))
        db.add(Message(session_id=session_id, role="assistant", content=api_response))
        chat_session.original_lesson = file_content #Update lesson plan in db with uploaded file content
        chat_session.updated_lesson = file_content
        chat_session.file_name = file.filename
        chat_session.file_path = file_path
        chat_session.file_type = file.content_type
        db.commit()

        db.close()
        return {"response": api_response, "session_id": session_id}

#Retrieve chat sessions for chat history   
@app.get("/sessions")
def get_sessions():
        db = SessionLocal()
        sessions = db.query(ChatSession).filter(ChatSession.original_lesson.isnot(None)).order_by(ChatSession.created_at.desc()).all()
        results = []
        for s in sessions:
            results.append({
                "id": s.id,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "summary": s.summary if s.summary else "",
                "lesson_preview": (s.original_lesson[:100] + "...") if s.original_lesson else "",
            })
        db.close()
        return JSONResponse(content=results)

#Retrieve messages of the selected chat session from the chat history
@app.get("/sessionMessages")
def get_session_messages(session_id: str = Query(...)):
    file = ""
    db = SessionLocal()
    query = db.query(Message).filter_by(session_id=session_id)
    query = query.filter_by(visible=True)
    messages = query.order_by(Message.timestamp).all()
    session = db.query(ChatSession).filter_by(id=session_id).first()
    if session:
        if session.updated_lesson:
            file = session.updated_lesson
        else:
            file = session.original_lesson
            
    results = [{"role": m.role, "content": m.content, "file_link": m.file_link} for m in messages]
    db.close()
    return {"file": file, "messages": results}

from fastapi.responses import FileResponse

#View uploaded lesson plan in chat history
@app.get("/viewFile", name="view_file")
def view_file(session_id: str = Query(...)):
    db = SessionLocal()
    chat_session = db.query(ChatSession).filter_by(id=session_id).first()
    db.close()

    if not chat_session or not chat_session.file_path:
        return JSONResponse(status_code=404, content={"error": "File not found."})
    
    # Safely verify file exists before sending
    if not os.path.exists(chat_session.file_path):
        return JSONResponse(status_code=404, content={"error": "File missing on server."})

    return FileResponse(
        path=chat_session.file_path,
        media_type=chat_session.file_type,
        filename=chat_session.file_name,
        headers={
            "Content-Disposition": f"inline; filename={chat_session.file_name}"
        }
    )


#Lesson plan update functionality
@app.post("/updateLesson")
async def update_lesson(session_id: str = Form(...), new_content: str = Form(...)):
    db = SessionLocal()
    chat_session = db.query(ChatSession).filter_by(id=session_id).first()
    existing_edits = []
    
    if not chat_session:
        return {"error": "Session not found"}
    
    if chat_session.updated_lesson:
        currentContent = chat_session.updated_lesson
    else:
        currentContent = chat_session.original_lesson
    
    if chat_session.suggested_edits:
        existing_edits = load_edits(chat_session)
    
    if not chat_session.summary:
        summary = summarize_old_messages(session_id, db)
        if summary:
            chat_session.summary = summary
            db.commit()

    #Update lesson plan by appending suggested content using LLM API
    chat_messages = get_chat_history(session_id, db)
    chat_messages.append({"role": "user", "content": f'''Update the lesson plan by integrating the new content - \n{new_content} in to the current lesson plan - \n{currentContent} appropriately preserving the pedagogical flow. 
                          In the response provide the full content of the updated lesson plan. Do not include any additional texts in the response.
                          When adding new content start with "### EDI integration start.". Mention this in a new line.
                          At the end of the new content mention "### EDI integration end." '''
                          })
    response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=chat_messages
        )
    api_response = response.choices[0].message.content
    new_edit = extract_edi_section(api_response)
    target_text = get_last_paragraph_before_edi(api_response)
    clean_api_response = remove_edi_markers(api_response)

    edit = {
        "target_text": target_text,
        "new_content": new_edit
    }
    existing_edits.append(edit)
    save_edits(chat_session, existing_edits)
    chat_session.updated_lesson = clean_api_response #Update updated lesson plan in db 
    success_message = "Lesson plan updated successfully. The updated lesson preview is now available."
    
    full_update_message = f"{success_message}\n\n{clean_api_response}"
    db.add(Message(session_id=session_id, role="assistant", content=full_update_message))
    download_message = "You can download the updated lesson plan by clicking the “Download Lesson Plan” button in the right panel. \n\n Would you like further support with this lesson plan? You can request additional support by selecting a support option from the right panel or by describing your requirements directly in the chat. \n\n If you would like to integrate EDI principles into a different lesson plan, you can upload a new lesson plan at any time."    
    db.add(Message(session_id=session_id, role="assistant", content=download_message))
    
    db.commit()
    db.close()

    return {"response": full_update_message, "download_message": download_message, "session_id": session_id}

@app.get("/previewLesson")
def preview_lesson(session_id: str):
    db = SessionLocal()
    chat_session = db.query(ChatSession).filter_by(id=session_id).first()
  
    updated = chat_session.updated_lesson

    # HTML preview
    html = "<div style='font-family:Arial;line-height:1.6'>"
    for line in updated.split("\n"):
        if "💡EDI Content:" in line:
            html += f"<div style='background:#fff3cd;padding:8px'>{line}</div>"
        else:
            html += f"<p>{line}</p>"
    html += "</div>"

    bot_message = "You can download the updated lesson plan by clicking the “Download Lesson Plan” button in the right panel. \n\n Would you like further support with this lesson plan? You can request additional support by selecting a support option from the right panel or by describing your requirements directly in the chat. \n\n If you would like to integrate EDI principles into a different lesson plan, you can upload a new lesson plan at any time."
    db.close()
    return {"html": html, "bot_message":bot_message, "session_id": session_id}

#Download updated lesson plan functionality
@app.get("/downloadLesson")
def download_lesson(session_id: str = Query(...)):
    db = SessionLocal()
    chat_session = db.query(ChatSession).filter_by(id=session_id).first()
    
    if not chat_session or not chat_session.working_file_path:
        return JSONResponse(status_code=404, content={"error": "Working file path not found."})

    # Create a .docx document
    doc = Document(chat_session.working_file_path)
    edits = load_edits(chat_session)

    if edits:
        for e in edits:
            for para in doc.paragraphs:
                if e["target_text"] in para.text:
                    insert_paragraph_after(
                        para,
                        f"💡 EDI Content: {e['new_content']}"
                    )
                    break

    # Save to in-memory stream
    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    db.close()

    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=updated_lesson_{session_id[:8]}.docx"
        }
    )

@app.post("/submitFeedback")
async def submit_feedback(session_id: str = Form(...), feedback: str = Form(...), feedbackProvider: str = Form(...)):
    db = SessionLocal()
    db.add(Feedback(session_id=session_id, feedback=feedback, name=feedbackProvider))
    db.commit()
    db.close()
    return {"message": "Feedback submitted successfully."}