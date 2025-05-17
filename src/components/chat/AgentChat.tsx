import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAgent } from '../../hooks/useAgent';
import { Message } from '../../types/chat';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlusIcon, SendIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';

const AgentChat: React.FC = () => {
  const { agent_id, conv_id } = useParams<{ agent_id: string; conv_id?: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Error handler
  const handleError = (error: Error) => {
    console.error('Error in AgentChat:', error);
    // You could add a toast notification here
  };

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

  // Handle sending message
  const handleSendMessage = () => {
    if (userInput.trim() && agent_id) {
      sendMessage(userInput);
    }
  };

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle infinite scroll for conversation history
  const handleSidebarScroll = () => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
      
      // If scrolled near bottom (within 50px), load more conversations
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreConversations && !isFetchingConversations) {
        loadMoreConversations();
      }
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  // Handle delete conversation
  const handleDeleteConversation = (convId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(convId);
    }
  };

  // Render a message
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div 
        key={index}
        className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className="mr-2 h-8 w-8">
            <AvatarImage src="/agent-avatar.png" alt="Agent" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        
        <div 
          className={`max-w-[80%] rounded-lg p-3 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
        
        {isUser && (
          <Avatar className="ml-2 h-8 w-8">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  // Show loading if agent data is still loading
  if (isLoadingAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Conversations</h2>
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
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.ConvID}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 ${
                    conversation.ConvID === conv_id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => switchConversation(conversation.ConvID)}
                >
                  <div className="truncate flex-1">
                    <span className="text-sm font-medium">
                      {conversation.Title || 'New Conversation'}
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg">
            {agent?.name || 'Chat'}
          </h1>
          {agent?.description && (
            <span className="ml-2 text-sm text-muted-foreground">
              {agent.description}
            </span>
          )}
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-background">
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
                  <h3 className="font-medium text-lg mb-2">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Send a message to start chatting with the AI assistant.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  
                  {/* Show streaming response if any */}
                  {currentStreamContent && (
                    <div className="flex mb-4 justify-start">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src="/agent-avatar.png" alt="Agent" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="whitespace-pre-wrap text-sm">
                          {currentStreamContent}
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
        <div className="border-t p-4 bg-background">
          <div className="relative">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
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
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentChat; 