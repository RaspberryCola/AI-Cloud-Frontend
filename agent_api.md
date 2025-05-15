# Agent API Documentation

This document provides the API specification for the Agent module in the AI-Cloud system. The Agent API allows users to create, manage, and execute AI agents with various configurations.

## Authorization

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Agent

Creates a new agent with basic information.

**Endpoint:** `POST /api/agent/create`

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)"
}
```

**Response:**
```json
{
  "code": 0,
  "msg": "Agent created successfully",
  "data": {
    "id": "string (UUID)"
  }
}
```

### 2. Update Agent

Updates an existing agent's configuration.

**Endpoint:** `PUT /api/agent/update`

**Request Body:**
```json
{
  "id": "string (required, UUID)",
  "name": "string (optional)",
  "description": "string (optional)",
  "llm_config": {
    "model_id": "string (optional)",
    "temperature": number (optional),
    "top_p": number (optional),
    "max_output_length": integer (optional),
    "thinking": boolean (optional)
  },
  "mcp": {
    "servers": ["string"] (optional, array of server URLs)
  },
  "tools": {
    "tool_ids": ["string"] (optional, array of tool IDs)
  },
  "prompt": "string (optional)",
  "knowledge": {
    "knowledge_ids": ["string"] (optional, array of knowledge base IDs)
  }
}
```

**Response:**
```json
{
  "code": 0,
  "msg": "Agent updated successfully",
  "data": null
}
```

### 3. Delete Agent

Deletes an agent by ID.

**Endpoint:** `DELETE /api/agent/delete`

**Query Parameters:**
- `agent_id`: string (required, UUID)

**Response:**
```json
{
  "code": 0,
  "msg": "Agent deleted successfully",
  "data": null
}
```

### 4. Get Agent

Retrieves details of a specific agent.

**Endpoint:** `GET /api/agent/get`

**Query Parameters:**
- `agent_id`: string (required, UUID)

**Response:**
```json
{
  "code": 0,
  "msg": "Agent retrieved successfully",
  "data": {
    "id": "string (UUID)",
    "user_id": integer,
    "name": "string",
    "description": "string",
    "schema": {
      "llm_config": {
        "model_id": "string",
        "temperature": number,
        "top_p": number,
        "max_output_length": integer,
        "thinking": boolean
      },
      "mcp": {
        "servers": ["string"]
      },
      "tools": {
        "tool_ids": ["string"]
      },
      "prompt": "string",
      "knowledge": {
        "knowledge_ids": ["string"]
      }
    },
    "created_at": "string (timestamp)",
    "updated_at": "string (timestamp)"
  }
}
```

### 5. Page Agents

Retrieves a paginated list of agents.

**Endpoint:** `GET /api/agent/page`

**Query Parameters:**
- `page`: integer (optional, default: 1)
- `size`: integer (optional, default: 10)

**Response:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "string (UUID)",
        "user_id": integer,
        "name": "string",
        "description": "string",
        "schema": {
          "llm_config": {
            "model_id": "string",
            "temperature": number,
            "top_p": number,
            "max_output_length": integer,
            "thinking": boolean
          },
          "mcp": {
            "servers": ["string"]
          },
          "tools": {
            "tool_ids": ["string"]
          },
          "prompt": "string",
          "knowledge": {
            "knowledge_ids": ["string"]
          }
        },
        "created_at": "string (timestamp)",
        "updated_at": "string (timestamp)"
      }
    ],
    "total": integer
  }
}
```

### 6. Execute Agent

Executes an agent with a user message and returns the result.

**Endpoint:** `POST /api/agent/execute/:id`

**URL Parameters:**
- `id`: string (required, agent UUID)

**Request Body:**
```json
{
  "query": "string (required, user's question/prompt)",
  "history": [
    {
      "role": "string (user/assistant)",
      "content": "string (message content)"
    }
  ]
}
```

**Response:**
```json
{
  "code": 0,
  "msg": "Agent executed successfully",
  "data": {
    "result": "string (agent's response)"
  }
}
```

### 7. Stream Execute Agent

Executes an agent with a user message and streams the results using Server-Sent Events (SSE).

**Endpoint:** `POST /api/agent/stream/:id`

**URL Parameters:**
- `id`: string (required, agent UUID)

**Request Body:**
```json
{
  "query": "string (required, user's question/prompt)",
  "history": [
    {
      "role": "string (user/assistant)",
      "content": "string (message content)"
    }
  ]
}
```

**Response:**
The response is streamed as Server-Sent Events (SSE) with the following format:

```
event: message
data: [agent's response chunk]

event: done
data: 

// If an error occurs:
event: error
data: [error message]
```

## Error Codes

- `0`: Success
- `40001`: Parameter error
- `40100`: Unauthorized
- `50000`: Internal server error

## Data Structures

### Agent

```go
type Agent struct {
    ID          string    // UUID, primary key
    UserID      uint      // User ID who owns this agent
    Name        string    // Agent name
    Description string    // Agent description
    AgentSchema string    // JSON string of agent schema
    CreatedAt   time.Time // Creation timestamp
    UpdatedAt   time.Time // Last update timestamp
}
```

### Agent Schema

```go
type AgentSchema struct {
    LLMConfig   LLMConfig       // Language model configuration
    MCP         MCPConfig       // MCP server configuration
    Tools       ToolsConfig     // Tools configuration
    Prompt      string          // System prompt
    Knowledge   KnowledgeConfig // Knowledge bases configuration
}
```

### LLM Config

```go
type LLMConfig struct {
    ModelID         string  // Model ID
    Temperature     float64 // Temperature for sampling
    TopP            float64 // Top-P sampling parameter
    MaxOutputLength int     // Maximum output length
    Thinking        bool    // Whether to show thinking process
}
```

### MCP Config

```go
type MCPConfig struct {
    Servers []string // List of MCP server URLs
}
```

### Tools Config

```go
type ToolsConfig struct {
    ToolIDs []string // List of tool IDs the agent can use
}
```

### Knowledge Config

```go
type KnowledgeConfig struct {
    KnowledgeIDs []string // List of knowledge base IDs
}
```

## Example Usage

### Creating an Agent

```bash
curl -X POST http://localhost:8080/api/agent/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Agent",
    "description": "An agent to help with customer support inquiries"
  }'
```

### Updating an Agent

```bash
curl -X PUT http://localhost:8080/api/agent/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "agent-uuid",
    "llm_config": {
      "model_id": "model-uuid",
      "temperature": 0.7,
      "top_p": 0.9,
      "max_output_length": 2000,
      "thinking": true
    },
    "prompt": "You are a helpful customer support agent for our e-commerce store.",
    "knowledge": {
      "knowledge_ids": ["kb-uuid-1", "kb-uuid-2"]
    }
  }'
```

### Executing an Agent

```bash
curl -X POST http://localhost:8080/api/agent/execute/agent-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are your shipping policies?",
    "history": []
  }'
``` 