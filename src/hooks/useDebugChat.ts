import { useState } from 'react';
import { chatService, ChatMessage, CustomEventSource } from '../services/chatService';
import { message } from 'antd';

export interface UseDebugChatReturn {
  messages: ChatMessage[];
  userInput: string;
  setUserInput: (input: string) => void;
  isLoading: boolean;
  currentStreamContent: string;
  sendMessage: (content: string) => void;
  clearChat: () => void;
}

export const useDebugChat = (agentId: string): UseDebugChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  const [eventSource, setEventSource] = useState<CustomEventSource | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !agentId) return;
    
    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setCurrentStreamContent('');
    
    try {
      // Check if user is authenticated
      const authData = localStorage.getItem('auth');
      if (!authData) {
        message.error('请先登录后再使用调试功能');
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: '错误: 未登录状态无法使用调试功能，请先登录。' }
        ]);
        setIsLoading(false);
        return;
      }
      
      // Close existing event source if any
      if (eventSource) {
        eventSource.close();
      }
      
      // Create new event source
      const newEventSource = chatService.debugChat({
        agent_id: agentId,
        message: content
      });
      
      setEventSource(newEventSource);
      
      let streamedContent = '';
      
      // Listen for message events
      newEventSource.onmessage = (event) => {
        try {
          console.log('Received raw data:', event.data);
          
          // 检查数据是否是看起来像编码的内容
          let decodedData = event.data;
          
          // 特别处理看上去像Base64或其他编码的字符串
          if (typeof event.data === 'string') {
            if (event.data.startsWith('"') && event.data.endsWith('"')) {
              try {
                // 尝试解析JSON字符串（去掉引号）
                decodedData = JSON.parse(event.data);
                console.log('Parsed JSON string:', decodedData);
              } catch (e) {
                console.log('Not valid JSON, using original data');
              }
            }
            
            // 针对"5L2g5aW9"这种格式，可能是Base64编码的中文
            const pattern = /"[A-Za-z0-9+/=]+"/g;
            if (pattern.test(event.data)) {
              try {
                // 尝试去掉引号并Base64解码
                const withoutQuotes = event.data.replace(/^"|"$/g, '');
                const decoded = atob(withoutQuotes);
                console.log('Decoded potential Base64:', decoded);
                
                // 将解码后的字节转为UTF-8字符串
                const bytes = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) {
                  bytes[i] = decoded.charCodeAt(i);
                }
                
                try {
                  const text = new TextDecoder('utf-8').decode(bytes);
                  console.log('Decoded as UTF-8:', text);
                  decodedData = text;
                } catch (e) {
                  console.log('Failed to convert to UTF-8:', e);
                }
                
              } catch (e) {
                console.log('Not valid Base64, using original data:', e);
              }
            }
          }
          
          streamedContent += decodedData;
          setCurrentStreamContent(streamedContent);
          console.log('Current streaming content:', streamedContent);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      // Handle completion
      newEventSource.addEventListener('done', () => {
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: streamedContent || '没有收到回复内容' }
        ]);
        setCurrentStreamContent('');
        setIsLoading(false);
        newEventSource.close();
      });
      
      // Handle errors
      newEventSource.addEventListener('error', (event) => {
        console.error('Chat error:', event);
        let errorMsg = '处理失败: 服务器错误';
        
        if (event instanceof MessageEvent && event.data) {
          errorMsg = `处理失败: ${event.data}`;
        } else if (event instanceof ErrorEvent && event.message) {
          if (event.message.includes('Authentication failed') || event.message.includes('401')) {
            errorMsg = '处理失败: 认证失败，请重新登录';
            message.error('登录已过期，请重新登录', 3, () => {
              // 可选：重定向到登录页面
              // window.location.href = '/login';
            });
          } else if (event.message.includes('403')) {
            errorMsg = '处理失败: 没有权限使用该功能';
            message.error('没有权限使用该功能');
          } else if (event.message.includes('404')) {
            errorMsg = '处理失败: 接口不存在，请检查API路径是否正确';
            message.error('接口不存在，请检查API配置');
          } else {
            errorMsg = `处理失败: ${event.message}`;
          }
        }
        
        if (!streamedContent) {
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: errorMsg }
          ]);
          setCurrentStreamContent('');
          setIsLoading(false);
        }
        
        newEventSource.close();
      });
      
    } catch (error) {
      console.error('Send message failed:', error);
      let errorMessage = '发送失败: ' + (error instanceof Error ? error.message : String(error));
      
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: errorMessage }
      ]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentStreamContent('');
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  return {
    messages,
    userInput,
    setUserInput,
    isLoading,
    currentStreamContent,
    sendMessage,
    clearChat
  };
}; 