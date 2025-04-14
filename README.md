# ISUZU IntelliChat

A sophisticated Retrieval Augmented Generation (RAG) system built for ISUZU East Africa, combining vector search with OpenAI's language models to provide accurate answers about ISUZU vehicles, services, and products.

## System Architecture

ISUZU IntelliChat uses a dual-component architecture:

- **Next.js Frontend**: User interface, admin panel, and API routes that handle user interactions  
- **FastAPI Backend**: Document processing, vector embeddings, and similarity search using FAISS

## Key Features

- **AI-Powered Chat**: Conversational interface for ISUZU-related inquiries  
- **Document Indexing**: Upload and process documents for knowledge retrieval  
- **Vector Search**: FAISS-based semantic search to find relevant document chunks  
- **Admin Dashboard**: Monitor usage, manage documents, and view statistics  
- **Multi-source Knowledge**: Combines uploaded documents, official ISUZU information, and OpenAI's general knowledge  

## Prerequisites

- Node.js 18+ and npm/yarn  
- Python 3.8+ with pip  
- OpenAI API key  

## Installation and Setup

### 1. Clone the Repository
```
git clone https://github.com/hassankirwa/isuzu-intelli-chat.git

```


### 2. Frontend Setup (Next.js)

Install dependencies:  
```
npm install or npm install --legacy-peer-deps

```


Run  
```
npm run dev
```

### 3. Backend Setup (FastAPI)

Navigate to the backend directory.

```
cd backend
```
Go to `.env` file and replace 'your api key ' with your api key

Install the required packages:
   ```
   pip install -r requirements.txt
   ```


## Running the Application

### Start the Backend Server (FastAPI)

Apply to README.md  
Run  

```
python main.py
```

The backend API will be available at `http://localhost:8000`

### Start the Frontend (Next.js)

In a separate terminal:  
When in backend 

```
cd ..

```
 
Then Run  

```
npm run dev

```
Then Navigate to `http://localhost:3000/` in your browser

## Usage Guide

**Login to the admin panel:**  
Navigate to `http://localhost:3000/login`  
Enter your admin credentials  admin admin123
Access the admin dashboard at `http://localhost:3000/admin`

### Document Management

**Uploading Documents:**  
- Go to the admin panel  
- Select "Documents" from the sidebar  
- Click "Upload Document"  
- Choose a file (supported formats: TXT, PDF, CSV, JSON, Markdown)  
- Set chunking parameters (if needed)  
- Submit to process and index the document  

**Managing Documents:**  
- View all uploaded documents  
- Delete documents when no longer needed  
- View document status and metadata  

### Using the Chat Interface

- Navigate to the home page (`http://localhost:3000`)  
- Type your question in the chat input  
- The system will:  
  - Search for relevant information in indexed documents  
  - Check for ISUZU East Africa official information  
  - Generate a comprehensive response using OpenAI  
  - Display the answer in a conversational format  
- Chat sessions are saved automatically and can be accessed later  

## System Components

### Frontend (Next.js)

- Chat Interface: Conversational UI powered by OpenAI  
- Admin Dashboard: Document management and analytics  
- API Routes: Proxy endpoints that connect to the backend  
- Authentication: Admin login and registration system  

### Backend (FastAPI)

- Document Processing: Text extraction and chunking  
- Vector Embeddings: OpenAI embedding generation  
- FAISS Index: Fast vector similarity search  
- API Endpoints: Document upload, search, and statistics  

## Data Flow

### Document Indexing Flow

1. Document uploaded through frontend  
2. Document sent to backend for processing  
3. Text extracted and split into chunks  
4. Embeddings generated for each chunk  
5. Embeddings stored in FAISS index  
6. Metadata saved for future reference  

### Query Flow

1. User asks a question  
2. Question analyzed to extract key query  
3. Vector search finds relevant document chunks  
4. Retrieved context combined with the user query  
5. OpenAI generates comprehensive response  
6. Answer displayed to the user  

## Customization Options

### Modifying System Behavior

- Adjust chunking parameters in backend for different document types  
- Modify system prompts in `app/api/chat/route.ts` to change AI behavior  
- Update `lib/isuzu-fetcher.ts` to include additional official information  

### Styling and UI

- Customize the UI components in the `components` directory  
- Modify global styles in `app/globals.css`  

## Troubleshooting

### Common Issues

**1. OpenAI API Issues**  
- **Symptom**: Chat fails to respond or returns errors  
- **Solution**: Verify your OpenAI API key and check API rate limits  

**2. Document Processing Errors**  
- **Symptom**: Files fail to upload or index  
- **Solution**: Check supported file formats, verify backend logs, ensure Python dependencies are installed  

**3. Backend Connection Issues**  
- **Symptom**: Frontend can't connect to backend  
- **Solution**: Ensure backend server is running, check `BACKEND_URL` in `.env.local`  

**4. Vector Search Not Working**  
- **Symptom**: Chat doesn't use document knowledge  
- **Solution**: Verify FAISS index initialization, check that documents are properly indexed  

### Logs and Debugging

- Frontend logs appear in the browser console  
- Backend logs appear in the terminal running `uvicorn`  
- Check `data/faiss` directory to confirm vector indexes are created  

## Deployment Considerations

### Production Deployment

For production deployment, consider:

**Environment Variables:**  
- Use proper secrets management for API keys  
- Set `NODE_ENV=production` for Next.js  

**Database Setup:**  
- Implement a persistent database for user sessions and documents  
- Consider using PostgreSQL or MongoDB  

**Vector Storage:**  
- Set up persistent storage for FAISS indexes  
- Consider managed vector database services for production  

**Authentication:**  
- Implement more robust authentication methods  
- Set up proper user roles and permissions  

## License

MIT

## Credits

ISUZU IntelliChat is developed for ISUZU East Africa to enhance customer support and information access. This project uses the following key technologies:

- Next.js  
- FastAPI  
- OpenAI API  
- LangChain  
- FAISS Vector Database  
