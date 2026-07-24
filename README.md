# GenEDIt
GenEDIt is an AI-powered conversational chatbot and lesson plan redesign workflow automation platform designed and developed to support ICT educators in integrating Equity, Diversity, and Inclusion (EDI) principles into the ICT curriculum.

## Technologies
- **Backend** - FastAPI Python web framework
- **Frontend** - React
- **Database** - MySQL
- **LLM** – GPT 4.1-mini
- **GenAI API** – OpenAI API
- **RAG pipeline** – A session specific RAG pipeline for storing and retrieving supporting document content using a fixed size overlapping chunking technique and the OpenAI Embedding API for vector embeddings. 

## Prerequisites 
- Python installed in your machine
- Node.js installed in your machine
- OpenAI API key
- MySQL Databse
- Statcounter account

## Environment Variables
- **Backend**
- OPENAI_API_KEY : Your OpenAI API key

- DB_HOST : Hostname of the database
- DB_NAME : Name of the database
- DB_USER : User of the database
- DB_PASSWORD : Password of the database
- DB_PORT : Port of the database (default: `3306`)
- **Frontend**
- VITE_SC_PROJECT= Statcounter project ID 
- VITE_SC_SECURITY= Statcounter security ID
- VITE_API_URL=/api
  
## Execution Instructions
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Activate virtual environment
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate # On Windows
   ```
3. Install python packages and libraries
   ```bash
   pip install -r requirements.txt
   ```
4. Start backend
   ```bash
   uvicorn app.app:app 
   ```
   Backend will run at: http://127.0.0.1:8000
5. Start frontend
   ```bash
   cd ..
   cd frontend
   npm run dev
   ```
   Frontend will run at: http://localhost:5173
6. Access the application
   - Open your browser and go to http://localhost:5173
