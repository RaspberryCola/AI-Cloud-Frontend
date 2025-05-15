import { httpClient } from './httpClient';
import axios from 'axios';
import {
  AgentListResponse,
  CreateAgentRequest,
  CreateAgentResponse,
  UpdateAgentRequest,
  AgentItem,
  ExecuteAgentRequest,
  ExecuteAgentResponse
} from '../types/agent';
import { ApiResponse } from '../types/common';

export const agentService = {
  // Create a new agent
  createAgent: (data: CreateAgentRequest): Promise<ApiResponse<CreateAgentResponse>> => {
    return httpClient.post('/agent/create', data);
  },

  // Update an existing agent
  updateAgent: (data: UpdateAgentRequest): Promise<ApiResponse<null>> => {
    return httpClient.put('/agent/update', data);
  },

  // Delete an agent
  deleteAgent: (agent_id: string): Promise<ApiResponse<null>> => {
    return httpClient.delete(`/agent/delete?agent_id=${agent_id}`);
  },

  // Get a specific agent by ID
  getAgent: (agent_id: string): Promise<ApiResponse<AgentItem>> => {
    return httpClient.get(`/agent/get?agent_id=${agent_id}`);
  },

  // Get a paginated list of agents
  getAgentList: (params: { page: number; size: number; name?: string }): Promise<ApiResponse<AgentListResponse>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return httpClient.get(`/agent/page?${queryParams.toString()}`);
  },

  // Execute an agent with a query and history
  executeAgent: (agent_id: string, data: ExecuteAgentRequest): Promise<ApiResponse<ExecuteAgentResponse>> => {
    return httpClient.post(`/agent/execute/${agent_id}`, data);
  },

  // Stream execute an agent with a query and history (returns EventSource)
  streamExecuteAgent: (agent_id: string, data: ExecuteAgentRequest): EventSource => {
    // 由于 EventSource 标准不支持 POST 请求，而我们的接口需要 POST 请求
    // 这里直接使用 executeAgent 普通接口，然后模拟 EventSource 的行为
    const eventTarget = new EventTarget();
    const mockEventSource = {
      readyState: 0, // 0: CONNECTING, 1: OPEN, 2: CLOSED
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
      dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
      close: () => {
        mockEventSource.readyState = 2;
        const closeEvent = new Event('close');
        eventTarget.dispatchEvent(closeEvent);
      },
      CONNECTING: 0,
      OPEN: 1,
      CLOSED: 2,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onopen: null as ((event: Event) => void) | null,
    };

    // 发送请求
    console.log('Executing agent request');
    // 使用我们自己的 executeAgent 方法，它返回的是已经处理过的 ApiResponse
    agentService.executeAgent(agent_id, data)
      .then((response) => {
        // 模拟打开连接
        mockEventSource.readyState = 1;
        const openEvent = new Event('open');
        eventTarget.dispatchEvent(openEvent);
        if (mockEventSource.onopen) mockEventSource.onopen(openEvent);

        // 如果请求成功，通过消息事件发送响应
        if (response && response.code === 0 && response.data && response.data.result) {
          const result = response.data.result;
          
          // 如果结果是字符串，将其分块发送，模拟流式响应
          if (typeof result === 'string') {
            const chunks = result.match(/.{1,10}/g) || [result]; // 每10个字符一个块
            
            chunks.forEach((chunk, index) => {
              setTimeout(() => {
                const messageEvent = new MessageEvent('message', {
                  data: chunk
                });
                eventTarget.dispatchEvent(messageEvent);
                if (mockEventSource.onmessage) mockEventSource.onmessage(messageEvent);
              }, index * 100); // 每100毫秒发送一块
            });
            
            // 发送完成事件
            setTimeout(() => {
              const doneEvent = new MessageEvent('done', {
                data: ''
              });
              eventTarget.dispatchEvent(doneEvent);
            }, chunks.length * 100 + 200);
          } else {
            // 如果不是字符串，一次性发送
            const messageEvent = new MessageEvent('message', {
              data: JSON.stringify(result)
            });
            eventTarget.dispatchEvent(messageEvent);
            if (mockEventSource.onmessage) mockEventSource.onmessage(messageEvent);
            
            // 发送完成事件
            setTimeout(() => {
              const doneEvent = new MessageEvent('done', {
                data: ''
              });
              eventTarget.dispatchEvent(doneEvent);
            }, 100);
          }
        } else {
          // 发送错误事件
          const errorEvent = new MessageEvent('error', {
            data: response.message || '未知错误'
          });
          eventTarget.dispatchEvent(errorEvent);
          if (mockEventSource.onerror) mockEventSource.onerror(errorEvent);
          mockEventSource.close();
        }
      })
      .catch((error) => {
        // 发送错误事件
        console.error('Agent execution error:', error);
        const errorEvent = new MessageEvent('error', {
          data: error.message || '请求失败'
        });
        eventTarget.dispatchEvent(errorEvent);
        if (mockEventSource.onerror) mockEventSource.onerror(errorEvent);
        mockEventSource.close();
      });

    return mockEventSource as unknown as EventSource;
  }
};
