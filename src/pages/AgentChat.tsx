import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Input, Button, List, Spin, Empty, message } from 'antd';
import { PlusOutlined, SendOutlined, LeftOutlined } from '@ant-design/icons';
import { agentService } from '../services/agentService';
import { useChat } from '../hooks/useChat';
import { AgentItem } from '../types/agent';
import { ConversationItem } from '../services/chatService';

const { Header, Content, Sider } = Layout;

const AgentChat: React.FC = () => {
  const { agent_id, conv_id } = useParams<{ agent_id: string; conv_id?: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [agent, setAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(true);

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
    sendMessage,
    switchConversation
  } = useChat(agent_id || '', conv_id);

  // Fetch agent data
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agent_id) return;
      
      try {
        const res = await agentService.getAgent(agent_id);
        if (res.code === 0) {
          setAgent(res.data);
        } else {
          message.error(res.message || '获取Agent数据失败');
        }
      } catch (error) {
        console.error('获取Agent数据失败:', error);
        message.error('获取Agent数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [agent_id]);

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

  // Only show loading when we're fetching agent data, not during conversation changes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <Layout className="h-screen">
      {/* Left sidebar for conversation history */}
      <Sider 
        width={250} 
        theme="light"
        className="border-r overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium m-0 text-gray-800">历史对话</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createNewConversation}
            size="middle"
            className="flex items-center justify-center"
          >
            新对话
          </Button>
        </div>
        
        <div 
          className="overflow-y-auto flex-1 py-2"
          ref={sidebarRef}
          onScroll={handleSidebarScroll}
        >
          {conversations.length > 0 ? (
            <List
              dataSource={conversations}
              renderItem={(item: ConversationItem) => (
                <List.Item
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                    item.ConvID === conv_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => switchConversation(item.ConvID)}
                >
                  <div className="truncate w-full">
                    <div className="font-medium truncate text-gray-800">
                      {item.Title || '新对话'}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Empty description="暂无对话历史" />
            </div>
          )}
          
          {isFetchingConversations && (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          )}
        </div>
      </Sider>
      
      {/* Main chat area */}
      <Layout>
        {/* Header with agent name and back button */}
        <Header className="bg-white border-b flex items-center px-6 h-14 shadow-sm">
          <div className="flex items-center">
            <Button
              icon={<LeftOutlined />}
              onClick={() => window.history.back()}
              type="text"
              className="mr-4"
            />
            <span className="text-lg font-semibold">{agent?.name || 'Agent对话'}</span>
            {agent?.description && (
              <span className="text-gray-500 ml-2 text-sm">({agent.description})</span>
            )}
          </div>
        </Header>
        
        {/* Chat content area */}
        <Content className="bg-gray-50 p-6 flex flex-col h-[calc(100vh-56px)]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-6">
            {isFetchingHistory ? (
              <div className="flex justify-center p-4">
                <Spin tip="加载历史消息..." />
              </div>
            ) : (
              <>
                {messages.length === 0 && !currentStreamContent && (
                  <div className="h-full flex items-center justify-center">
                    <Empty description="发送消息开始对话" />
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {/* Show streaming response if any */}
                {currentStreamContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg bg-white border shadow-sm">
                      <div className="whitespace-pre-wrap">{currentStreamContent}</div>
                    </div>
                  </div>
                )}
                
                {/* Show loading indicator */}
                {isLoading && !currentStreamContent && (
                  <div className="flex justify-center">
                    <Spin tip="思考中..." />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input area */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="relative">
              <Input.TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="有什么我能帮您的吗?"
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                className="pr-12 border-gray-300 rounded-lg"
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                className="absolute right-2 bottom-2"
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-right">
              按Enter发送，Shift+Enter换行
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AgentChat; 