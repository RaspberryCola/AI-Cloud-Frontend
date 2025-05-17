## 接口定义

#### 1. 获取Agent的对话历史

**请求示例**

```http
GET /api/chat/list/agent?page=1&size=10&agent_id=2639bf10-d38e-4074-b0e4-96bc9b92c27c HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NDc0ODYzNDAsIm5iZiI6MTc0NzM5OTk0MCwiaWF0IjoxNzQ3Mzk5OTQwfQ.NHi8GZvQhMTXy0PmMlheUDFZbAhOy2DxD9-kQ62KaPs
Content-Type: application/json
```

**响应示例**

```json
{
    "code": 0,
    "message": "success",
    "data": {
        "total": 12,
        "list": [
            {
                "ID": 101,
                "ConvID": "b480d2b8-ace1-42fa-8151-0808a131b234",
                "UserID": 1,
                "AgentID": "2639bf10-d38e-4074-b0e4-96bc9b92c27c",
                "Title": "新对话2025-05-17 10:21:36.493821 +0800 CST m=+2505.385542584",
                "CreatedAt": 1747448496,
                "UpdatedAt": 1747448661,
                "Settings": null,
                "IsArchived": false,
                "IsPinned": false
            },
            {
                "ID": 100,
                "ConvID": "b99d04b9-c42e-4e12-a72f-9f7ed9f29189",
                "UserID": 1,
                "AgentID": "2639bf10-d38e-4074-b0e4-96bc9b92c27c",
                "Title": "新对话2025-05-17 10:21:30.259865 +0800 CST m=+2499.151597293",
                "CreatedAt": 1747448490,
                "UpdatedAt": 1747448494,
                "Settings": null,
                "IsArchived": false,
                "IsPinned": false
            }
        ]
    }
}
```

#### 2. 创建新对话

**请求示例**

```http
POST /api/chat/create HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NDc0ODYzNDAsIm5iZiI6MTc0NzM5OTk0MCwiaWF0IjoxNzQ3Mzk5OTQwfQ.NHi8GZvQhMTXy0PmMlheUDFZbAhOy2DxD9-kQ62KaPs
Content-Type: application/json
Content-Length: 58

{
    "agent_id": "2639bf10-d38e-4074-b0e4-96bc9b92c27c"
}
```

**响应示例**

```json
{
    "code": 0,
    "message": "Conversation created successfully",
    "data": {
        "conv_id": "0e019ddf-df64-462d-9131-9e05f73f7077"
    }
}
```

#### 3. 请求对话Stream

**请求示例**

```http
POST /api/chat/stream HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NDc0ODYzNDAsIm5iZiI6MTc0NzM5OTk0MCwiaWF0IjoxNzQ3Mzk5OTQwfQ.NHi8GZvQhMTXy0PmMlheUDFZbAhOy2DxD9-kQ62KaPs
Content-Type: application/json
Content-Length: 139

{
    "agent_id": "2639bf10-d38e-4074-b0e4-96bc9b92c27c",
    "message": "查一下明天天气",
    "conv_id": "0e019ddf-df64-462d-9131-9e05f73f7077"
}
```

**响应示例**

```
data:"5L2g5aW9"

data:"77yB"

data:"5pyJ5LuA5LmI"

data:"5Y+v5Lul5biu5Yqp5L2g55qE5ZCX77yf"

data:""


```

为了便于你处理，我将提供给你Go后端的源代码：

```go
// 调用会话模式流式处理
	sr, err := c.svc.StreamAgentWithConversation(ctx.Request.Context(), userID, req.AgentID, req.ConvID, req.Message)
	if err != nil {
		log.Printf("[Conversation Stream] Error running agent: %v\n", err)
		response.InternalError(ctx, errcode.InternalServerError, "Agent execution failed")
		return
	}

	// 设置SSE响应头
	ctx.Writer.Header().Set("Content-Type", "text/event-stream")
	ctx.Writer.Header().Set("Cache-Control", "no-cache")
	ctx.Writer.Header().Set("Connection", "keep-alive")
	ctx.Writer.Header().Set("Transfer-Encoding", "chunked")

	// 传输流
	done := make(chan struct{})
	defer func() {
		sr.Close()
		close(done)
		log.Printf("[Conversation Stream] Finish Stream with ConvID: %s\n", req.ConvID)
	}()

	// 流式响应
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Request.Context().Done():
			log.Printf("[Conversation Stream] Context done for ConvID: %s\n", req.ConvID)
			return false
		case <-done:
			return false
		default:
			msg, err := sr.Recv()
			if errors.Is(err, io.EOF) {
				log.Printf("[Conversation Stream] EOF received for ConvID: %s\n", req.ConvID)
				return false
			}
			if err != nil {
				log.Printf("[Conversation Stream] Error receiving message: %v\n", err)
				return false
			}

			// 发送SSE事件
			sse.Encode(w, sse.Event{
				Data: []byte(msg.Content),
			})

			// 立即刷新响应
			ctx.Writer.Flush()
			return true
		}
	})
```

#### 4. 获取某一对话下的消息记录

**请求**

```http
GET /api/chat/history?conv_id=b480d2b8-ace1-42fa-8151-0808a131b234 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NDc0ODYzNDAsIm5iZiI6MTc0NzM5OTk0MCwiaWF0IjoxNzQ3Mzk5OTQwfQ.NHi8GZvQhMTXy0PmMlheUDFZbAhOy2DxD9-kQ62KaPs
Content-Type: application/json
```

**响应示例**



```json
{
    "code": 0,
    "message": "Conversation history retrieved successfully",
    "data": {
        "messages": [
            {
                "role": "user",
                "content": "你好"
            },
            {
                "role": "assistant",
                "content": "你好！有什么可以帮助你的吗？"
            },
            {
                "role": "user",
                "content": "我是吴由波"
            },
            {
                "role": "assistant",
                "content": "你好，吴由波！有什么我可以帮助你的吗？"
            }
        ]
    }
}
```

#### 5. 删除对话

**请求示例**

```http
DELETE /api/chat/delete?conv_id=65f89a0d-ef2f-4b81-95da-c10e4862d9e0 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NDc0ODYzNDAsIm5iZiI6MTc0NzM5OTk0MCwiaWF0IjoxNzQ3Mzk5OTQwfQ.NHi8GZvQhMTXy0PmMlheUDFZbAhOy2DxD9-kQ62KaPs
Content-Type: application/json
```

**响应示例**

```json
{
    "code": 0,
    "message": "Conversation deleted successfully",
    "data": null
}
```







