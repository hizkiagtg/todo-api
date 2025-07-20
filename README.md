# To-Do List API

## Project Description
This is a RESTful API built with Node.js and Express.js for managing a to-do list application. It supports user authentication and authorization using JWT (JSON Web Tokens) and bcrypt for password hashing. The API allows users to perform CRUD (Create, Read, Update, Delete) operations on their personal to-do items, with features like input validation (using Joi), centralized error handling, and pagination for retrieving items. Data is stored in MongoDB.

Key Features:
- **User Authentication**: Secure registration and login, generating JWT for protected routes.
- **Authorization**: Users can only access and manage their own to-do items.
- **CRUD Operations**: Create, retrieve (single or list), update, and delete to-do items.
- **Validation & Error Handling**: Ensures valid inputs (e.g., email format, password length) and returns appropriate HTTP status codes with descriptive messages (e.g., 400 for bad requests, 404 for not found).
- **Pagination**: Supports querying items with page and limit parameters, including metadata (total items, pages).
- **Security**: Passwords are hashed; JWT protects routes; middleware verifies tokens.

This project meets the case study requirements for a back-end development task, including RESTful design, database integration, and best practices for API development.

## Technologies Used
- Node.js (v22.x or compatible)
- Express.js (web framework)
- MongoDB (database)
- Mongoose (ODM for MongoDB)
- bcryptjs (password hashing)
- jsonwebtoken (JWT generation/verification)
- Joi (input validation)
- dotenv (environment variables)

## Instructions to Run the Project Locally
Follow these steps to set up and run the API on your local machine (tested on Windows).

### Prerequisites
- Node.js (LTS version recommended; download from https://nodejs.org)
- MongoDB (Community Server; download from https://www.mongodb.com/try/download/community)
- Git (for cloning the repository)
- Postman or similar tool (for testing API endpoints)

### Setup Steps
1. **Clone the Repository**:
   ```
   git clone https://github.com/yourusername/todo-api.git
   cd todo-api
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the project root (copy from `.env.example` if available).
   - Add the following (replace values as needed):
     ```
     MONGO_URI=mongodb://localhost:27017/todo-db  # Your MongoDB connection string
     JWT_SECRET=your_jwt_secret_here  # Generate a strong secret (e.g., using openssl rand -hex 32)
     PORT=3000  # Optional; default port
     ```
   - Ensure MongoDB is running: Start the service via Services app (search "services" > MongoDB > Start) or run `mongod` in Command Prompt.

4. **Start the Server**:
   ```
   npm start
   ```
   - You should see logs: "MongoDB connected" and "Server running on port 3000".
   - Access the API at `http://localhost:3000`.

5. **Test the API**:
   - Use Postman to send requests (import the provided collection for ease).
   - Register a user first, then login to get a JWT token for protected routes.

### Troubleshooting
- **MongoDB Connection Error**: Verify the service is running and `MONGO_URI` is correct. Test with `mongosh mongodb://localhost:27017/todo-db`.
- **JWT Issues**: Ensure `JWT_SECRET` is set and not committed to Git (`.gitignore` includes `.env`).
- **Port Conflict**: Change `PORT` in `.env` if 3000 is in use.
- **Dependencies Missing**: Run `npm install` again.

## API Documentation
The API uses JSON for data exchange. All routes are prefixed with `/` (base URL: `http://localhost:3000`).

### Authentication Routes (/auth)
These are public routes for user management.

- **POST /auth/register**  
  Registers a new user.  
  **Input (Body - JSON)**:  
  ```json
  {
    "email": "string (valid email format, required)",
    "password": "string (min 6 characters, required)"
  }
  ```  
  **Output**:  
  - Success (201): `{"message": "User registered successfully"}`  
  - Error (400): `{"error": "User already exists"}` or validation errors like `{"error": "\"email\" must be a valid email"}`  
  **Example**:  
  Request: `{"email": "test@example.com", "password": "password123"}`  
  Response: `{"message": "User registered successfully"}`

- **POST /auth/login**  
  Logs in a user and returns a JWT token.  
  **Input (Body - JSON)**:  
  ```json
  {
    "email": "string (valid email, required)",
    "password": "string (required)"
  }
  ```  
  **Output**:  
  - Success (200): `{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}`  
  - Error (400): `{"error": "Invalid credentials"}` or validation errors.  
  **Example**:  
  Request: `{"email": "test@example.com", "password": "password123"}`  
  Response: `{"token": "jwt_token_string"}`

### Profile Route (/profile)
Protected route requiring JWT.

- **GET /profile**  
  Retrieves the authenticated user's profile.  
  **Headers**: `Authorization: Bearer <jwt_token>`  
  **Input**: None.  
  **Output**:  
  - Success (200): `{"_id": "userId", "email": "test@example.com"}`  
  - Error (401): `{"error": "No token provided"}` or `{"error": "Invalid token"}`  
  **Example**:  
  Response: `{"_id": "60a1b2c3d4e5f6g7h8i9j0k", "email": "test@example.com"}`

### Items Routes (/items)
Protected routes for to-do items (CRUD). Each user manages only their own items. Data format for items:  
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "boolean (optional, default: false)",
  "_id": "string (auto-generated)",
  "owner": "string (user ID, auto-set)"
}
```

- **POST /items**  
  Creates a new to-do item.  
  **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`  
  **Input (Body - JSON)**:  
  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "status": "boolean (optional)"
  }
  ```  
  **Output**:  
  - Success (201): `{"message": "Item created", "item": {full_item_object}}`  
  - Error (400): Validation errors like `{"error": "\"title\" is required"}`  
  **Example**:  
  Request: `{"title": "Buy groceries", "description": "Milk and eggs"}`  
  Response: `{"message": "Item created", "item": {"_id": "itemId", "title": "Buy groceries", ...}}`

- **GET /items**  
  Retrieves a paginated list of user's items.  
  **Headers**: `Authorization: Bearer <jwt_token>`  
  **Query Params**: `page` (number, default: 1), `limit` (number, default: 10)  
  **Output**:  
  - Success (200):  
    ```json
    {
      "items": [array_of_item_objects],
      "metadata": {
        "total": number,
        "totalPages": number,
        "currentPage": number
      }
    }
    ```  
  - Error (401): Unauthorized.  
  **Example**:  
  URL: `/items?page=1&limit=5`  
  Response: `{"items": [...], "metadata": {"total": 8, "totalPages": 2, "currentPage": 1}}`

- **GET /items/:id**  
  Retrieves a specific item by ID.  
  **Headers**: `Authorization: Bearer <jwt_token>`  
  **Output**:  
  - Success (200): `{full_item_object}`  
  - Error (404): `{"error": "Item not found"}`  
  **Example**:  
  Response: `{"_id": "itemId", "title": "Buy groceries", ...}`

- **PUT /items/:id**  
  Updates an existing item.  
  **Headers**: `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`  
  **Input (Body - JSON)**: Same as POST (partial updates allowed).  
  **Output**:  
  - Success (200): `{"message": "Item updated", "item": {updated_item_object}}`  
  - Error (404): `{"error": "Item not found"}` or validation errors.  
  **Example**:  
  Request: `{"status": true}`  
  Response: `{"message": "Item updated", "item": {...}}`

- **DELETE /items/:id**  
  Deletes an item.  
  **Headers**: `Authorization: Bearer <jwt_token>`  
  **Output**:  
  - Success (200): `{"message": "Item deleted"}`  
  - Error (404): `{"error": "Item not found"}`  
  **Example**:  
  Response: `{"message": "Item deleted"}`

### Error Handling
- Common Errors: 400 (bad input), 401 (unauthorized), 404 (not found), 500 (server error).
- Responses: Always JSON like `{"error": "Descriptive message"}`.

## Testing the API
Import the Postman collection from the evidence links below. Run tests in order: Authentication first, then CRUD, validation, pagination.

### Test Cases (Excerpt)
| Request Name | Method | URL | Expected Status |
|--------------|--------|-----|-----------------|
| Register User - Success | POST | /auth/register | 201 |
| Create Item - Success | POST | /items | 201 |
| Get Items - Page 1 Limit 5 | GET | /items?page=1&limit=5 | 200 |

For full test cases, see the Postman collection.

## Evidence
- Screenshots/Screen Records: [Google Docs Link](https://docs.google.com/document/d/1xIPa5kAZHemiojMbqgpYf88KH6b_62SRn_YPsYK5k4M/edit?usp=sharing)

## Version Control
Developed using Git with commit messages prefixed as "feat(talent-growth): [description]".

For issues or contributions, open a pull request on GitHub.
