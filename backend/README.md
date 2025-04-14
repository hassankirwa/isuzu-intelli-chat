# Document Indexing and Retrieval API

This is a FastAPI backend that powers document ingestion and semantic search using LangChain and FAISS vector storage. It handles document processing, embedding generation, vector storage, and similarity search.

## Features

- Upload and process `.txt` and `.pdf` files
- Extract and chunk document text
- Create embeddings using OpenAI's text embedding model
- Store embeddings in a FAISS vector index
- Query documents by semantic similarity
- Get statistics about the indexed documents

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- OpenAI API key

### Installation

1. Clone the repository (if applicable)
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```
5. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
6. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...
   ```

### Running the Server

Start the server using uvicorn:

```
uvicorn main:app --reload --port 8000
```

The server will be available at `http://localhost:8000`.

## API Endpoints

### 1. Upload Document

Uploads and indexes a document.

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: The document file (PDF or TXT)
  - `chunk_size` (optional): Size of text chunks (default: 1000)
  - `chunk_overlap` (optional): Overlap between chunks (default: 200)
- **Response**: JSON with upload status and chunk information

### 2. Query Documents

Performs a semantic search on indexed documents.

- **URL**: `/query`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "query": "Your question here",
    "top_k": 3
  }
  ```
- **Response**: JSON with matching document chunks and their metadata

### 3. Get Statistics

Returns statistics about the indexed documents.

- **URL**: `/stats`
- **Method**: `GET`
- **Response**: JSON with total documents, chunks, and last update time

### 4. Health Check

Simple endpoint to check if the server is running.

- **URL**: `/health`
- **Method**: `GET`
- **Response**: JSON with status information

## Directory Structure

```
/backend/
├── main.py               # FastAPI application
├── utils/
│   └── document_loader.py # Document processing utilities
├── uploads/              # Stores uploaded files
├── myindex/              # Stores FAISS index + metadata
├── .env                  # Environment variables
└── requirements.txt      # Python dependencies
```

## Integration with Next.js Frontend

For the Next.js frontend to interact with this API:

1. Make API calls to `http://localhost:8000/upload` for document uploads
2. Make API calls to `http://localhost:8000/query` for semantic searches
3. Make API calls to `http://localhost:8000/stats` for index statistics

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad request (e.g., unsupported file type)
- `500`: Server error (with details in the response)

---

For any issues or questions, please refer to the documentation or open an issue on the repository. 