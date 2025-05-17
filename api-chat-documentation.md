# Chat API Documentation

This document provides detailed documentation for the Chat API endpoints under the `/api/chat` group. These endpoints allow you to manage conversations with AI agents, including creating conversations, sending messages, and retrieving conversation history.

## Base URL

All API endpoints are prefixed with `/api/chat`.

## Authentication

All endpoints require authentication using JWT. The JWT token should be included in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Debug Mode: Chat Without Saving History

**Endpoint:** `POST /api/chat/debug`

Debug mode allows you to chat with an agent without saving the conversation history. This is useful for testing and development.

**Request:**

```json
{
  "agent_id": "string",  // Required: The ID of the agent to chat with
  "message": "string"    // Required: The message to send to the agent
}
```

**Response:**

Server-Sent Events (SSE) stream with text/event-stream content type. Each event contains a chunk of the agent's response.

---

### Create a New Conversation

**Endpoint:** `POST /api/chat/create`

Creates a new conversation with a specified agent.

**Request:**

```json
{
  "agent_id": "string"  // Required: The ID of the agent to create a conversation with
}
```

**Response:**

```json
{
  "code": 0,
  "msg": "Conversation created successfully",
  "data": {
    "conv_id": "string"  // The ID of the newly created conversation
  }
}
```

---

### Stream Conversation with Agent

**Endpoint:** `POST /api/chat/stream`

Send a message to an agent in an existing conversation. The conversation history will be saved.

**Request:**

```json
{
  "agent_id": "string",  // Required: The ID of the agent to chat with
  "conv_id": "string",   // Required: The ID of the conversation
  "message": "string"    // Required: The message to send to the agent
}
```

**Response:**

Server-Sent Events (SSE) stream with text/event-stream content type. Each event contains a chunk of the agent's response.

---

### List User's Conversations

**Endpoint:** `GET /api/chat/list`

Retrieves a paginated list of all conversations for the authenticated user.

**Parameters:**

- `page` (query, optional): Page number for pagination (default: 1)
- `size` (query, optional): Number of items per page (default: 10)

**Response:**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 0,
        "conv_id": "string",
        "user_id": 0,
        "agent_id": "string",
        "title": "string",
        "created_at": 0,
        "updated_at": 0,
        "settings": {},
        "is_archived": false,
        "is_pinned": false
      }
    ],
    "total": 0,
    "page": 1,
    "size": 10
  }
}
```

---

### List Agent's Conversations

**Endpoint:** `GET /api/chat/agent/list`

Retrieves a paginated list of conversations with a specific agent.

**Parameters:**

- `agent_id` (query, required): The ID of the agent
- `page` (query, optional): Page number for pagination (default: 1)
- `size` (query, optional): Number of items per page (default: 10)

**Response:**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 0,
        "conv_id": "string",
        "user_id": 0,
        "agent_id": "string",
        "title": "string",
        "created_at": 0,
        "updated_at": 0,
        "settings": {},
        "is_archived": false,
        "is_pinned": false
      }
    ],
    "total": 0,
    "page": 1,
    "size": 10
  }
}
```

---

### Get Conversation History

**Endpoint:** `GET /api/chat/history`

Retrieves the message history for a specific conversation.

**Parameters:**

- `conv_id` (query, required): The ID of the conversation
- `limit` (query, optional): Maximum number of messages to return (default: 50)

**Response:**

```json
{
  "code": 0,
  "msg": "Conversation history retrieved successfully",
  "data": {
    "messages": [
      {
        "role": "user|assistant|system|function",
        "content": "string"
      }
    ]
  }
}
```

## Data Structures

### Conversation Object

```json
{
  "id": 0,                // Internal ID
  "conv_id": "string",    // Conversation UUID
  "user_id": 0,           // ID of the user who owns the conversation
  "agent_id": "string",   // ID of the agent used in the conversation
  "title": "string",      // Conversation title
  "created_at": 0,        // Timestamp when conversation was created
  "updated_at": 0,        // Timestamp when conversation was last updated
  "settings": {},         // JSON object containing conversation settings
  "is_archived": false,   // Whether the conversation is archived
  "is_pinned": false      // Whether the conversation is pinned
}
```

### Message Object

```json
{
  "role": "user|assistant|system|function",  // Role of the message sender
  "content": "string"                        // Content of the message
}
```

## Error Codes

- `0`: Success
- `400001`: Parameter error
- `400003`: Unauthorized
- `500001`: Internal server error

## Notes

- All streaming endpoints use Server-Sent Events (SSE) for real-time communication.
- Timestamps are in Unix time (seconds since epoch).
- The conversation history is automatically saved when using the `/api/chat/stream` endpoint.
- Debug mode (`/api/chat/debug`) does not save conversation history and is suitable for testing. 