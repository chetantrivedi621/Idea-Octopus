# Server Environment Variables Checklist

## Required Environment Variables

### 1. MongoDB Connection
- **MONGO_URI** (Required)
  - MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
  - Used in: `index.js`, `worker.js`

### 2. Client URL (CORS)
- **CLIENT_URL** (Optional, defaults to `http://localhost:5173`)
  - Frontend URL for CORS configuration
  - Example: `http://localhost:5173` or `https://yourdomain.com`
  - Used in: `index.js`, `routes/qr.js`

### 3. Server Port
- **PORT** (Optional, defaults to `8080`)
  - Server port number
  - Example: `8080` or `3000`
  - Used in: `index.js`

### 4. Extractor Service
- **EXTRACTOR_URL** (Required for worker)
  - Python extractor service URL
  - Example: `http://localhost:5001/extract`
  - Used in: `worker.js`, `utils/extractClient.js`

### 5. Authentication
- **JWT_SECRET** (Optional, but recommended for production)
  - Secret key for JWT token signing
  - Example: `your-super-secret-jwt-key-change-in-production`
  - Defaults to `your-secret-key-change-in-production` if not set
  - Used in: `routes/auth.js`, `middleware/auth.js`
  - **Important**: Change this to a strong random string in production

### 6. LLM Configuration
- **LLM_PROVIDER** (Optional, defaults to `perplexity`)
  - LLM provider: `perplexity` or `openai`
  - Used in: `utils/llmClient.js`

- **MODEL** (Optional)
  - Model name
  - Defaults: `pplx-70b-chat` (Perplexity) or `gpt-4o-mini` (OpenAI)
  - Used in: `utils/llmClient.js`

- **PERPLEXITY_API_KEY** (Required if using Perplexity)
  - Perplexity API key
  - Used in: `utils/llmClient.js`

- **OPENAI_API_KEY** (Required if using OpenAI)
  - OpenAI API key
  - Used in: `utils/llmClient.js`

## Example .env File

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/idea-octopus?retryWrites=true&w=majority

# Server
PORT=8080
CLIENT_URL=http://localhost:5173

# Extractor Service
EXTRACTOR_URL=http://localhost:5001/extract

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# LLM Configuration
LLM_PROVIDER=perplexity
MODEL=pplx-70b-chat
PERPLEXITY_API_KEY=your-perplexity-api-key-here

# Alternative: OpenAI
# LLM_PROVIDER=openai
# MODEL=gpt-4o-mini
# OPENAI_API_KEY=your-openai-api-key-here
```

## Verification Checklist

- [ ] MONGO_URI is set and valid
- [ ] JWT_SECRET is set (recommended for production)
- [ ] EXTRACTOR_URL is set and points to running extractor service
- [ ] LLM_PROVIDER is set (perplexity or openai)
- [ ] API key is set for chosen LLM provider
- [ ] CLIENT_URL matches your frontend URL
- [ ] PORT is set (or using default 8080)

## Testing

1. **MongoDB Connection**: Check server logs for "MongoDB connected"
2. **Extractor Service**: Ensure Python extractor is running on EXTRACTOR_URL
3. **LLM Service**: Worker will use mock summary if API key is missing
4. **CORS**: Check browser console for CORS errors

