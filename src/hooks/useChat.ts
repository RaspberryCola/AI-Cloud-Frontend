import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { chatService, ChatMessage, ConversationItem } from '../services/chatService';

export const useChat = (agentId: string, convId?: string) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | undefined>(convId);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const PAGE_SIZE = 10;

  // Update activeConversation when convId changes
  useEffect(() => {
    if (convId) {
      setActiveConversation(convId);
    }
  }, [convId]);

  // Fetch conversations for the agent
  const fetchConversations = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!agentId) return;
    
    setIsFetchingConversations(true);
    try {
      const response = await chatService.listAgentConversations(agentId, page, PAGE_SIZE, 'desc');
      if (response.code === 0) {
        const newConversations = response.data.list;
        setTotalConversations(response.data.total);
        
        // Check if there are more conversations to load
        setHasMoreConversations(page * PAGE_SIZE < response.data.total);
        
        if (append) {
          // Append new conversations to existing list
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          // Replace existing conversations
          setConversations(newConversations);
        }
        
        setCurrentPage(page);
      } else {
        message.error(response.message || '获取会话列表失败');
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
      message.error('获取会话列表失败');
    } finally {
      setIsFetchingConversations(false);
    }
  }, [agentId]);

  // Load more conversations (for infinite scroll)
  const loadMoreConversations = useCallback(() => {
    if (hasMoreConversations && !isFetchingConversations) {
      fetchConversations(currentPage + 1, true);
    }
  }, [fetchConversations, currentPage, hasMoreConversations, isFetchingConversations]);

  // Fetch conversation history
  const fetchConversationHistory = async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsFetchingHistory(true);
    try {
      const response = await chatService.getConversationHistory(conversationId);
      if (response.code === 0) {
        setMessages(response.data.messages || []);
      } else {
        message.error(response.message || '获取会话历史失败');
      }
    } catch (error) {
      console.error('获取会话历史失败:', error);
      message.error('获取会话历史失败');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async (): Promise<string | undefined> => {
    if (!agentId) return undefined;
    
    try {
      const response = await chatService.createConversation({ agent_id: agentId });
      if (response.code === 0) {
        const newConvId = response.data.conv_id;
        setActiveConversation(newConvId);
        setMessages([]);
        navigate(`/chat/${agentId}/${newConvId}`);
        // Refresh conversations list
        fetchConversations(1, false);
        return newConvId;
      } else {
        message.error(response.message || '创建新会话失败');
      }
    } catch (error) {
      console.error('创建新会话失败:', error);
      message.error('创建新会话失败');
    }
    return undefined;
  };

  // Handle sending a message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Determine if we need to create a new conversation
    let currentConvId = activeConversation;
    if (!currentConvId) {
      currentConvId = await createNewConversation();
      if (!currentConvId) return;
    }
    
    const newUserMessage: ChatMessage = {
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      const eventSource = chatService.streamConversation({
        agent_id: agentId,
        conv_id: currentConvId,
        message: content
      });
      
      let streamedContent = '';
      
      // Listen for message events
      eventSource.onmessage = (event) => {
        try {
          streamedContent += event.data;
          setCurrentStreamContent(streamedContent);
        } catch (error) {
          console.error('处理消息出错:', error);
        }
      };
      
      // Handle completion
      eventSource.addEventListener('done', () => {
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: streamedContent || '没有收到回复内容' }
        ]);
        setCurrentStreamContent('');
        setIsLoading(false);
        eventSource.close();
        
        // Refresh the first page of conversations to update latest chat
        fetchConversations(1, false);
      });
      
      // Handle errors
      eventSource.addEventListener('error', (event) => {
        console.error('聊天错误:', event);
        let errorMsg = '处理失败: 服务器错误';
        
        if (event instanceof MessageEvent && event.data) {
          errorMsg = `处理失败: ${event.data}`;
        }
        
        if (!streamedContent) {
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: errorMsg }
          ]);
          setCurrentStreamContent('');
          setIsLoading(false);
        }
        
        eventSource.close();
      });
      
      eventSource.addEventListener('close', () => {
        setIsLoading(false);
      });
      
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败: ' + (error instanceof Error ? error.message : String(error)));
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: '发送失败: ' + (error instanceof Error ? error.message : String(error)) }
      ]);
      setIsLoading(false);
    }
  };

  // Switch to a different conversation
  const switchConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    fetchConversationHistory(conversationId);
    navigate(`/chat/${agentId}/${conversationId}`);
  };
  
  // Initialize
  useEffect(() => {
    fetchConversations(1, false);
  }, [agentId, fetchConversations]);
  
  // Handle active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchConversationHistory(activeConversation);
    }
  }, [activeConversation]);
  
  return {
    conversations,
    messages,
    userInput,
    setUserInput,
    isLoading,
    isFetchingHistory,
    isFetchingConversations,
    currentStreamContent,
    activeConversation,
    hasMoreConversations,
    totalConversations,
    currentPage,
    fetchConversations,
    loadMoreConversations,
    fetchConversationHistory,
    createNewConversation,
    sendMessage,
    switchConversation
  };
}; 