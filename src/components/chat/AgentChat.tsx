import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAgent } from '../../hooks/useAgent';
import { Message } from '../../types/chat';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { PlusIcon, SendIcon, TrashIcon, ArrowLeftIcon, AlertCircleIcon, BotIcon, UserIcon } from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';

// Add CSS for Markdown styling
import '../../styles/markdown-content.css';

const AgentChat: React.FC = () => {
  const { agent_id, conv_id } = useParams<{ agent_id: string; conv_id?: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const renderedRef = useRef(false);
  
  // Error handler
  const handleError = useCallback((error: Error) => {
    console.error('Error in AgentChat:', error);
    setError(error.message);
    // You could add a toast notification here
  }, []);

  // Use our custom hooks
  const { agent, isLoading: isLoadingAgent } = useAgent(
    agent_id, 
    { onError: handleError }
  );
  
  const {
    conversations,
    messages,
    userInput,
    setUserInput,
    isLoading,
    isFetchingHistory,
    isFetchingConversations,
    currentStreamContent,
    hasMoreConversations,
    loadMoreConversations,
    createNewConversation,
    deleteConversation,
    sendMessage,
    switchConversation
  } = useChat(agent_id || '', conv_id, { onError: handleError });

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentStreamContent]);

  // Debug logging - 仅在首次渲染和特定值变化时输出
  useEffect(() => {
    // 避免重复日志输出
    const isFirstRender = !renderedRef.current;
    if (isFirstRender) {
      console.log('AgentChat初始渲染，参数:', { agent_id, conv_id });
      renderedRef.current = true;
    }
  }, [agent_id, conv_id]);

  // 当agent或conversations明显变化时记录日志
  useEffect(() => {
    if (agent) {
      console.log('Agent数据已加载:', agent);
    }
  }, [agent?.id]);
  
  useEffect(() => {
    if (conversations.length > 0) {
      console.log('会话数据已加载，数量:', conversations.length);
    }
  }, [conversations.length]);

  // Handle sending message
  const handleSendMessage = useCallback(() => {
    if (userInput.trim() && agent_id) {
      sendMessage(userInput);
    }
  }, [userInput, agent_id, sendMessage]);

  // Handle key press in textarea
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle infinite scroll for conversation history
  const handleSidebarScroll = useCallback(() => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
      
      // If scrolled near bottom (within 50px), load more conversations
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreConversations && !isFetchingConversations) {
        loadMoreConversations();
      }
    }
  }, [hasMoreConversations, isFetchingConversations, loadMoreConversations]);

  // Handle back button click
  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle delete conversation
  const handleDeleteConversation = useCallback((convId: string) => {
    if (window.confirm('确定要删除这个对话吗?')) {
      deleteConversation(convId);
    }
  }, [deleteConversation]);

  // Render a message
  const renderMessage = useCallback((message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div 
        key={index}
        className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className="mr-2 h-8 w-8 flex items-center justify-center">
            <BotIcon className="h-5 w-5 text-gray-600" />
          </Avatar>
        )}
        
        <div 
          className={`max-w-[80%] rounded-lg p-3 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted markdown-content'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          ) : (
            <div className="text-sm">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>
        
        {isUser && (
          <Avatar className="ml-2 h-8 w-8 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </Avatar>
        )}
      </div>
    );
  }, []);

  // Show loading for initial agent loading only
  if (isLoadingAgent) {
    console.log('显示Agent加载状态');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载Agent详情...</p>
        </div>
      </div>
    );
  }

  console.log('渲染AgentChat UI');
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">历史对话</h2>
          <Button 
            size="sm" 
            onClick={createNewConversation}
            className="h-8 w-8 p-0"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea 
          className="flex-1"
          viewportRef={sidebarRef}
          onScroll={handleSidebarScroll}
        >
          {error && (
            <div className="p-3 m-2 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircleIcon className="h-4 w-4 inline mr-1" />
              {error}
            </div>
          )}
          
          {conversations.length === 0 && !isFetchingConversations ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              暂无对话
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.ConvID}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 group ${
                    conversation.ConvID === conv_id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => switchConversation(conversation.ConvID)}
                >
                  <div className="truncate flex-1">
                    <span className="text-sm font-medium">
                      {conversation.Title || '新对话'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.ConvID);
                    }}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {isFetchingConversations && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header - full width */}
        <header className="border-b p-4 flex items-center w-full">
          <h1 className="font-semibold text-lg">
            {agent?.name || 'Chat'}
          </h1>
        </header>
        
        {/* Centered content with max width */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex flex-col h-full">
        {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 w-full">
          {isFetchingHistory ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {messages.length === 0 && !currentStreamContent ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <SendIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">开始一个对话</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    发送消息开始与AI助手聊天
                  </p>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  
                  {/* Show streaming response if any */}
                  {currentStreamContent && (
                    <div className="flex mb-4 justify-start">
                      <Avatar className="mr-2 h-8 w-8 flex items-center justify-center">
                        <BotIcon className="h-5 w-5 text-gray-600" />
                      </Avatar>
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted markdown-content">
                        <div className="text-sm">
                          <MarkdownRenderer content={currentStreamContent} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show loading indicator */}
                  {isLoading && !currentStreamContent && (
                    <div className="flex justify-center my-4">
                      <div className="animate-bounce flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input area */}
            <div className="border-t p-4 w-full">
          <div className="relative">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="输入您的消息..."
              className="min-h-[80px] pr-12 resize-none"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button
              className="absolute right-2 bottom-2"
              size="sm"
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">
            按Enter发送，Shift+Enter换行
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat; 