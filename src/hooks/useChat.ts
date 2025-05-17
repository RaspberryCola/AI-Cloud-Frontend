import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, ConversationListResponse } from '../types/chat';
import { chatService } from '../services/chatService';

interface UseChatOptions {
  onError?: (error: Error) => void;
}

// Types for the custom EventTarget
interface ChatEventTarget extends EventTarget {
  dispatchMessage?: (data: string) => void;
  dispatchDone?: () => void;
  dispatchError?: (error: Error) => void;
  close?: () => void;
  addEventListener: (type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void;
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
  const eventSourceRef = useRef<ChatEventTarget | null>(null);
  const initDoneRef = useRef(false);
  const fetchingRef = useRef(false);
  const agentIdRef = useRef<string | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    agentIdRef.current = agentId;
  }, [agentId]);

  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('Cleaning up EventSource');
      if (typeof eventSourceRef.current.close === 'function') {
        eventSourceRef.current.close();
      }
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, [cleanupEventSource]);

  useEffect(() => {
    if (initialConvId) {
      console.log('Setting active conversation to:', initialConvId);
      setActiveConversation(initialConvId);
    }
  }, [initialConvId]);

  const fetchConversations = useCallback(async (page: number = 1, append: boolean = false) => {
    if (fetchingRef.current || !agentIdRef.current) {
      console.log('Already fetching or no agent ID, skipping');
      return;
    }
    
    fetchingRef.current = true;
    setIsFetchingConversations(true);
    
    try {
      console.log(`Fetching conversations for agent ${agentIdRef.current}, page ${page}`);
      const response = await chatService.listAgentConversations(agentIdRef.current, page, PAGE_SIZE);
      console.log('Conversations response:', response);
      
      if (response.code === 0) {
        const newConversations = response.data.list || [];
        setTotalConversations(response.data.total || 0);
        
        setHasMoreConversations(page * PAGE_SIZE < (response.data.total || 0));
        
        if (append) {
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }
        
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch conversations:', response.message);
        throw new Error(response.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch conversations'));
    } finally {
      setIsFetchingConversations(false);
      fetchingRef.current = false;
    }
  }, [options]);

  const loadMoreConversations = useCallback(() => {
    if (hasMoreConversations && !isFetchingConversations) {
      console.log('Loading more conversations, page:', currentPage + 1);
      fetchConversations(currentPage + 1, true);
    }
  }, [fetchConversations, currentPage, hasMoreConversations, isFetchingConversations]);

  const fetchConversationHistory = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.log('No conversation ID provided, skipping history fetch');
      return;
    }
    
    setIsFetchingHistory(true);
    try {
      console.log(`Fetching history for conversation ${conversationId}`);
      const response = await chatService.getConversationHistory(conversationId);
      console.log('Conversation history response:', response);
      
      if (response.code === 0) {
        setMessages(response.data.messages || []);
      } else {
        console.error('Failed to fetch history:', response.message);
        throw new Error(response.message || 'Failed to fetch conversation history');
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch conversation history'));
    } finally {
      setIsFetchingHistory(false);
    }
  }, [options]);

  const createNewConversation = useCallback(async (): Promise<string | undefined> => {
    if (!agentIdRef.current) {
      console.log('No agent ID provided, cannot create conversation');
      return undefined;
    }
    
    if (isLoading) {
      console.log('Already loading, skipping conversation creation');
      return undefined;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Creating new conversation for agent ${agentIdRef.current}`);
      const response = await chatService.createConversation(agentIdRef.current);
      console.log('Create conversation response:', response);
      
      if (response.code === 0) {
        const newConvId = response.data.conv_id;
        if (!newConvId) {
          throw new Error('Server returned empty conversation ID');
        }
        
        setActiveConversation(newConvId);
        setMessages([]);
        setCurrentStreamContent('');
        
        await fetchConversations(1, false);
        
        navigate(`/chat/${agentIdRef.current}/${newConvId}`);
        
        return newConvId;
      } else {
        throw new Error(response.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to create conversation'));
    } finally {
      setIsLoading(false);
    }
    return undefined;
  }, [navigate, fetchConversations, options, isLoading]);

  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    if (!conversationId) return false;
    
    try {
      console.log(`Deleting conversation ${conversationId}`);
      const response = await chatService.deleteConversation(conversationId);
      console.log('Delete conversation response:', response);
      
      if (response.code === 0) {
        setConversations(prev => prev.filter(conv => conv.ConvID !== conversationId));
        
        if (activeConversation === conversationId) {
          console.log('Active conversation was deleted, creating new one');
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

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      console.log('Empty message, not sending');
      return;
    }
    
    if (isLoading) {
      console.log('Already loading, not sending message');
      return;
    }
    
    let currentConvId = activeConversation;
    if (!currentConvId) {
      console.log('No active conversation, creating one');
      currentConvId = await createNewConversation();
      if (!currentConvId) {
        console.error('Failed to create conversation before sending message');
        return;
      }
    }
    
    const newUserMessage: Message = {
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setCurrentStreamContent('');
    
    cleanupEventSource();
    
    try {
      console.log(`Sending message to conversation ${currentConvId}`);
      const eventTarget = chatService.streamConversation({
        agent_id: agentIdRef.current || '',
        conv_id: currentConvId,
        message: content
      });
      
      eventSourceRef.current = eventTarget;
      let streamedContent = '';
      
      eventTarget.addEventListener('message', ((event: MessageEvent) => {
        try {
          console.log('Received message event:', event.data);
          if (event.data) {
            streamedContent += event.data;
            setCurrentStreamContent(streamedContent);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }) as EventListener);
      
      eventTarget.addEventListener('done', (() => {
        console.log('Received done event, streamedContent length:', streamedContent.length);
        if (streamedContent.length > 0) {
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: streamedContent }
          ]);
        } else {
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', content: 'No response received' }
          ]);
        }
        setCurrentStreamContent('');
        setIsLoading(false);
        
        if (eventSourceRef.current === eventTarget) {
          eventSourceRef.current = null;
          
          setTimeout(() => {
            fetchConversationsRef.current(1, false);
          }, 500);
        }
      }) as EventListener);
      
      eventTarget.addEventListener('error', ((event: ErrorEvent) => {
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
        }
        
        setCurrentStreamContent('');
        setIsLoading(false);
        
        if (eventSourceRef.current === eventTarget) {
          eventSourceRef.current = null;
        }
        
        options?.onError?.(new Error(errorMsg));
      }) as EventListener);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Failed to send: ' + (error instanceof Error ? error.message : String(error)) }
      ]);
      setIsLoading(false);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }, [activeConversation, createNewConversation, cleanupEventSource, options, isLoading]);

  const switchConversation = useCallback((conversationId: string) => {
    if (conversationId === activeConversation || isLoading) {
      console.log('Already on this conversation or loading, not switching');
      return;
    }
    
    setIsLoading(true);
    
    console.log(`Switching to conversation ${conversationId}`);
    
    setActiveConversation(conversationId);
    setMessages([]);
    setCurrentStreamContent('');
    
    fetchConversationHistory(conversationId).finally(() => {
      setIsLoading(false);
    });
    
    navigate(`/chat/${agentIdRef.current}/${conversationId}`);
  }, [activeConversation, fetchConversationHistory, navigate, isLoading]);
  
  const fetchConversationsRef = useRef(fetchConversations);
  
  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);
  
  useEffect(() => {
    if (!agentId || initDoneRef.current) {
      return;
    }
    
    console.log(`Initial fetch for agent ${agentId}`);
    initDoneRef.current = true;
    
    if (conversations.length === 0) {
      fetchConversationsRef.current(1, false);
    }
    
    return () => {
      console.log("Component unmounting, resetting initialization flag");
      initDoneRef.current = false;
    };
  }, [agentId, conversations.length]);
  
  const fetchConversationHistoryRef = useRef(fetchConversationHistory);
  
  useEffect(() => {
    fetchConversationHistoryRef.current = fetchConversationHistory;
  }, [fetchConversationHistory]);
  
  useEffect(() => {
    if (!activeConversation || isLoading) {
      return;
    }
    
    console.log(`Fetching history for newly active conversation ${activeConversation}`);
    fetchConversationHistoryRef.current(activeConversation);
  }, [activeConversation, isLoading]);
  
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