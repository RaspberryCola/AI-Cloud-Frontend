import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, ConversationListResponse } from '../types/chat';
import { chatService } from '../services/chatService';

interface UseChatOptions {
  onError?: (error: Error) => void;
}

export const useChat = (agentId: string, initialConvId?: string, options?: UseChatOptions) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationListResponse['list']>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | undefined>(initialConvId);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const PAGE_SIZE = 10;

  // Cleanup function for event source
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, [cleanupEventSource]);

  // Update activeConversation when initialConvId changes
  useEffect(() => {
    if (initialConvId) {
      setActiveConversation(initialConvId);
    }
  }, [initialConvId]);

  // Fetch conversations for the agent
  const fetchConversations = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!agentId) return;
    
    setIsFetchingConversations(true);
    try {
      const response = await chatService.listAgentConversations(agentId, page, PAGE_SIZE);
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
        throw new Error(response.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch conversations'));
    } finally {
      setIsFetchingConversations(false);
    }
  }, [agentId, options]);

  // Load more conversations (for infinite scroll)
  const loadMoreConversations = useCallback(() => {
    if (hasMoreConversations && !isFetchingConversations) {
      fetchConversations(currentPage + 1, true);
    }
  }, [fetchConversations, currentPage, hasMoreConversations, isFetchingConversations]);

  // Fetch conversation history
  const fetchConversationHistory = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsFetchingHistory(true);
    try {
      const response = await chatService.getConversationHistory(conversationId);
      if (response.code === 0) {
        setMessages(response.data.messages || []);
      } else {
        throw new Error(response.message || 'Failed to fetch conversation history');
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch conversation history'));
    } finally {
      setIsFetchingHistory(false);
    }
  }, [options]);

  // Create a new conversation
  const createNewConversation = useCallback(async (): Promise<string | undefined> => {
    if (!agentId) return undefined;
    
    try {
      const response = await chatService.createConversation(agentId);
      if (response.code === 0) {
        const newConvId = response.data.conv_id;
        setActiveConversation(newConvId);
        setMessages([]);
        navigate(`/chat/${agentId}/${newConvId}`);
        // Refresh conversations list
        fetchConversations(1, false);
        return newConvId;
      } else {
        throw new Error(response.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to create conversation'));
    }
    return undefined;
  }, [agentId, navigate, fetchConversations, options]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    if (!conversationId) return false;
    
    try {
      const response = await chatService.deleteConversation(conversationId);
      if (response.code === 0) {
        // Remove the conversation from the list
        setConversations(prev => prev.filter(conv => conv.ConvID !== conversationId));
        
        // If the active conversation was deleted, create a new one
        if (activeConversation === conversationId) {
          createNewConversation();
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to delete conversation'));
      return false;
    }
  }, [activeConversation, createNewConversation, options]);

  // Handle sending a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Determine if we need to create a new conversation
    let currentConvId = activeConversation;
    if (!currentConvId) {
      currentConvId = await createNewConversation();
      if (!currentConvId) return;
    }
    
    const newUserMessage: Message = {
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setCurrentStreamContent('');
    
    // Clean up any existing event source
    cleanupEventSource();
    
    try {
      const eventSource = chatService.streamConversation({
        agent_id: agentId,
        conv_id: currentConvId,
        message: content
      });
      
      eventSourceRef.current = eventSource;
      let streamedContent = '';
      
      // Listen for message events
      eventSource.onmessage = (event) => {
        try {
          streamedContent += event.data;
          setCurrentStreamContent(streamedContent);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      // Handle completion
      eventSource.addEventListener('done', () => {
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: streamedContent || 'No response received' }
        ]);
        setCurrentStreamContent('');
        setIsLoading(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        // Refresh the first page of conversations to update latest chat
        fetchConversations(1, false);
      });
      
      // Handle errors
      eventSource.onerror = (event) => {
        console.error('Chat error:', event);
        let errorMsg = 'Processing failed: Server error';
        
        if (event instanceof MessageEvent && event.data) {
          errorMsg = `Processing failed: ${event.data}`;
        }
        
        if (!streamedContent) {
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: errorMsg }
          ]);
          setCurrentStreamContent('');
        }
        
        setIsLoading(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        options?.onError?.(new Error(errorMsg));
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Failed to send: ' + (error instanceof Error ? error.message : String(error)) }
      ]);
      setIsLoading(false);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }, [agentId, activeConversation, createNewConversation, cleanupEventSource, fetchConversations, options]);

  // Switch to a different conversation
  const switchConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
    fetchConversationHistory(conversationId);
    navigate(`/chat/${agentId}/${conversationId}`);
  }, [agentId, fetchConversationHistory, navigate]);
  
  // Initialize
  useEffect(() => {
    fetchConversations(1, false);
  }, [agentId, fetchConversations]);
  
  // Handle active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchConversationHistory(activeConversation);
    }
  }, [activeConversation, fetchConversationHistory]);
  
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
    deleteConversation,
    sendMessage,
    switchConversation
  };
}; 