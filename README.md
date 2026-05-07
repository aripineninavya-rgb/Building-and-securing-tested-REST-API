# Gym Review REST API

A complete, tested, and secure REST API for gym reviews built with Express.js, Firebase authentication, React frontend, and comprehensive test coverage.

## Table of Contents

- [Setup](#setup)
- [Testing](#testing)
- [Authentication](#authentication)
- [Security Decisions](#security-decisions)
- [Reflections](#reflections)

## Setup

### Prerequisites

- Node.js 22.x or higher
- npm or yarn
- A Firebase project with authentication enabled

### Clone the Repository

```bash
git clone <your-repo-url>
cd Building-and-securing-tested-REST-API
```

### Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### Configure Environment Variables

Copy the `.env.example` files and update them with your actual values:

#### Backend (`backend/.env`)

```bash
cp .env.example .env
```

Then edit `backend/.env`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

```bash
cp .env.example .env
```

Then edit `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5001
```

### Run the Project Locally

#### Terminal 1: Start the Backend

```bash
cd backend
npm run dev
```

The server will run on `http://localhost:5001`

#### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing

### Run Tests Locally

#### Backend Integration Tests

```bash
cd backend
npm test
```

This runs all integration tests using Vitest and validates:
- Public routes return correct data
- Protected routes return 401 without authentication
- Protected routes work with valid tokens
- Error handling for missing/invalid data

#### Frontend Unit Tests

```bash
cd frontend
npm test
```

This runs unit tests for React components using Vitest + React Testing Library, validating:
- Login/logout button visibility
- Protected content visibility based on auth state
- Component rendering and error states

## GitHub Actions Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:

1. **Triggers on every push and pull request to main** - Ensures all code changes are tested
2. **Installs dependencies** for both backend and frontend
3. **Runs all tests** - Both integration and unit tests
4. **Uses GitHub Secrets** for sensitive Firebase credentials

### Setting Up GitHub Secrets

Add the following secrets to your GitHub repository:

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Authentication

### Provider Choice: Firebase

We chose **Firebase Authentication** because:

1. **Easy Integration**: Firebase Admin SDK provides straightforward token verification
2. **Token-Based**: Naturally supports API authentication via bearer tokens
3. **Security**: Managed by Google, handles hashing and best practices
4. **Scalability**: No need to manage user databases ourselves
5. **Cross-Platform**: Firebase works seamlessly across web, mobile, and backend

### How Authentication is Implemented
§
#### Frontend (`src/context/AuthContext.jsx`)

- **Firebase Initialization**: Sets up Firebase with configuration from environment variables
- **Auth Context**: Provides user state and authentication methods globally
- **Login**: Uses `signInWithPopup` with Google Provider
- **Token Management**: Automatically gets ID token after login and stores it in localStorage
- **Logout**: Clears token and user state

#### Backend (`src/middleware/auth.js`)

- **Middleware**: `verifyToken` middleware checks Bearer tokens in `Authorization` headers
- **Token Verification**: Uses Firebase Admin SDK to verify tokens server-side
- **Protected Routes**: All POST routes and `/profile` require valid tokens
- **Error Handling**: Returns 401 Unauthorized for missing or invalid tokens

#### Routes

| Method | Route | Access | Returns |
|--------|-------|--------|---------|
| GET | /gyms | Public | 200 + gym list |
| GET | /gyms/:id | Public | 200 + gym details or 404 |
| POST | /gyms | Protected | 201 + new gym or 401/400 |
| POST | /gyms/:id/reviews | Protected | 201 + review or 401/404/400 |
| GET | /profile | Protected | 200 + user profile or 401 |

## Security Decisions

### 1. **No Secrets in Repository**

**What**: All sensitive values (Firebase credentials, API keys) are stored in `.env` files which are gitignored.

**Why**: If secrets are committed, anyone with repository access can compromise your Firebase project. Using environment variables ensures secrets are only available on secure servers and CI/CD pipelines.

**How**: 
- `.env` is in `.gitignore`
- `.env.example` documents required variables without values
- GitHub Actions uses GitHub Secrets for sensitive values

### 2. **Protected Routes Return 401**

**What**: All POST endpoints and the `/profile` endpoint require valid Firebase tokens. Requests without tokens return `401 Unauthorized`.

**Why**: This prevents unauthorized access to sensitive operations like creating gyms or viewing user profiles. Tests verify this behavior explicitly.

**How**:
- `verifyToken` middleware on all protected routes
- Firebase Admin SDK validates bearer tokens
- Invalid/missing tokens immediately return 401

### 3. **CORS Restricted to Specific Origin**

**What**: CORS is configured to only accept requests from `http://localhost:5173` (frontend origin), not `*`.

**Why**: A wildcard CORS policy allows requests from ANY origin, enabling attackers to make requests on behalf of users. Restricting to a specific origin prevents cross-origin attacks.

**How**:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
```

### 4. **Credentials in All Authenticated Requests**

**What**: Frontend includes `credentials: 'include'` in all authenticated API calls and sets headers with bearer tokens.

**Why**: This ensures cookies (if used) are sent with requests, and the server knows these requests are from authenticated users. It prevents token-based attacks.

**How**:
```javascript
fetch(`${API_URL}/gyms`, {
  headers: { 'Authorization': `Bearer ${token}` },
  credentials: 'include'
})
```

### 5. **Token Storage Approach**

**What**: Firebase tokens are stored in localStorage after login.

**Why**: While localStorage is vulnerable to XSS, Firebase tokens have a short expiration (1 hour) and represent temporary access. This is standard for SPAs and uses the secure bearer token pattern.

**Production Alternative**: Use HttpOnly cookies for even better security, but this requires backend session management.

### 6. **Bearer Token in Authorization Header**

**What**: Tokens are sent in the `Authorization: Bearer <token>` header, not in URL or body.

**Why**: Headers are not logged by default in servers/proxies, and URL parameters can be cached or logged. The Authorization header is the standard secure location for credentials.

**How**:
```javascript
const token = authHeader.substring(7); // Extract token from "Bearer {token}"
const decodedToken = await admin.auth().verifyIdToken(token);
```

### 7. **Input Validation**

**What**: All endpoints validate required fields before processing.

**Why**: Prevents invalid or malicious data from being stored.

**How**:
```javascript
if (!name || !location) {
  return res.status(400).json({ error: 'Name and location are required' });
}
```

### 8. **In-Memory Database for Testing**

**What**: The API uses an in-memory array for storing gyms and reviews.

**Why**: For this educational assignment, an in-memory database is sufficient and keeps focus on testing and security, not database design.

## Reflections

### Implementation Choices

1. **Express.js Backend**: Simple, well-documented framework perfect for RESTful APIs
2. **React + Context API**: Minimal frontend with no complex state management needed
3. **Firebase**: Chose token-based auth for better API security patterns
4. **In-Memory Database**: Kept focus on testing and security
5. **Vitest**: Modern test runner with excellent mocking and React support

### Challenges & Solutions

**Challenge 1: Firebase Admin SDK Initialization in Tests**
- **Problem**: Firebase Admin requires credentials, but tests need to mock authentication
- **Solution**: Mocked `firebase-admin` entirely using `vi.mock()`, allowing tests to control verification

**Challenge 2: CORS and Credentials**
- **Problem**: Credentials require specific CORS configuration, not just a wildcard
- **Solution**: Set `FRONTEND_URL` as environment variable and use in `corsOptions`

**Challenge 3: Frontend-Backend Token Flow**
- **Problem**: Needed to ensure tokens are correctly extracted from Firebase and sent to backend
- **Solution**: Created `AuthContext` to manage token lifecycle and add tokens to all requests

### What We'd Do Differently

1. **Database**: Use MongoDB with encryption at rest for production
2. **Rate Limiting**: Add middleware to prevent brute force attacks
3. **Logging**: Implement structured logging to audit authentication
4. **HttpOnly Cookies**: Store tokens in HttpOnly cookies instead of localStorage
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Refresh Tokens**: Implement refresh token rotation for longer sessions
7. **Load Testing**: Test performance under concurrent user loads

---

## Project Structure

```
.
├── .github/workflows/test.yml
├── backend/
│   ├── src/
│   │   ├── __tests__/integration.test.js
│   │   ├── middleware/auth.js
│   │   ├── routes/gyms.js
│   │   ├── routes/profile.js
│   │   ├── app.js
│   │   └── db.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── __tests__/components.test.jsx
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```