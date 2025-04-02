import React, { useState } from 'react';
import { Button, Input, Card, Layout, message } from 'antd';
import { 
  QuestionCircleOutlined, 
  PlusOutlined, 
  SyncOutlined,
  SettingOutlined,
  DownOutlined,
  ThunderboltOutlined,
  SendOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Header, Content } = Layout;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Agent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！有什么可以帮助你的吗？' }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: userInput,
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserInput('');

    // Simulate agent response
    setTimeout(() => {
      const response: ChatMessage = {
        role: 'assistant',
        content: '这是Agent的回复。我可以帮助您处理各种问题。',
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <Layout className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <Header className="bg-white border-b flex items-center justify-between px-6">
        <div className="text-lg font-semibold ml-8">编排</div>
        <div className="flex items-center ml-auto gap-2">
          <span className="flex items-center gap-1">
          <span>DeepSeek-V3</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 mr-2 rounded text-xs">CHAT</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Button icon={<SettingOutlined />}>Agent 设置</Button>
          <Button type="primary" icon={<DownOutlined />}>发布</Button>
        </div>
      </Header>

      <Content className="flex p-6 gap-6">
        {/* Left Panel - Editor */}
        <div className="w-1/2 space-y-6">
          {/* Prompt Section */}
          <Card 
            title={
              <div className="flex items-center gap-1">
                <span>提示词</span>
                <QuestionCircleOutlined className="text-gray-400" />
              </div>
            }
            extra={
              <Button 
                type="default" 
                icon={<ThunderboltOutlined className="text-blue-500" />}
                className="flex items-center text-blue-500 border-blue-500 hover:text-blue-600 hover:border-blue-600"
              >
                自动优化提示词
              </Button>
            }
          >
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="在这里写你的提示词，输入'\'插入变量、输入'/'插入提示内容块"
              autoSize={{ minRows: 8, maxRows: 12 }}
              className="mb-2"
            />
            <div className="text-right text-sm text-gray-500">
              {prompt.length} 字符
            </div>
          </Card>

          {/* Knowledge Base Section */}
          <Card 
            title="知识库"
            extra={<Button icon={<PlusOutlined />}>添加</Button>}
          >
            <p className="text-gray-600">
              您可以导入知识库作为上下文
            </p>
          </Card>

          {/* Tools Section */}
          <Card 
            title={
              <div className="flex items-center gap-1">
                <span>MCP</span>
                <QuestionCircleOutlined className="text-gray-400" />
              </div>
            }
            extra={<Button icon={<PlusOutlined />}>添加</Button>}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-600">启用</span>
              <span>0/0 启用</span>
            </div>
          </Card>
        </div>

        {/* Right Panel - Chat Preview */}
        <div className="w-1/2">
          <Card 
            title={
              <div className="flex justify-between items-center">
                <span>调试与预览</span>
                <Button icon={<SyncOutlined />} type="text" />
              </div>
            }
            className="h-full flex flex-col"
          >
            <div className="flex-1 overflow-auto mb-4 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.role === 'user' ? (
                      <>
                        <div className="bg-blue-100 px-4 py-2 rounded-lg">
                          {message.content}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                          User
                        </div>

                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          AI
                        </div>
                        <div className="bg-white border px-4 py-2 rounded-lg">
                          {message.content}
                        </div>

                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="relative">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="和机器人聊天"
                  className="pr-12"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleSendMessage}
                />
              </div>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Agent;
