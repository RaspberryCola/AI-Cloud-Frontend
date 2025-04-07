import React, { useState } from 'react';
import { Button, Input, Card, Layout, Select, Modal, Form, InputNumber, Switch } from 'antd';
import { 
  QuestionCircleOutlined, 
  PlusOutlined, 
  SyncOutlined,
  SettingOutlined,
  DownOutlined,
  ThunderboltOutlined,
  SendOutlined,
  DatabaseOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Header, Content } = Layout;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  streamOutput: boolean;
}

const defaultModelParams: ModelParams = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  streamOutput: true,
};

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'claude-2', label: 'Claude 2' },
];

const Agent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！有什么可以帮助你的吗？' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [modelParams, setModelParams] = useState<ModelParams>(defaultModelParams);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: userInput,
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserInput('');

    setTimeout(() => {
      const response: ChatMessage = {
        role: 'assistant',
        content: '这是Agent的回复。我可以帮助您处理各种问题。',
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleParamsChange = (values: ModelParams) => {
    setModelParams(values);
  };

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="bg-white border-b flex items-center justify-between px-6">
        <div className="text-lg font-semibold ml-8">编排</div>
        <div className="flex gap-4">
          <Button type="primary" icon={<DownOutlined />}>发布</Button>
        </div>
      </Header>

      <Content className="flex p-6 gap-6">
        <div className="w-1/2 space-y-6">
          {/* AI 配置部分 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <ThunderboltOutlined className="text-purple-600" />
              </div>
              <span className="text-lg font-medium">AI 配置</span>
            </div>

            {/* AI 模型选择 */}
            <Card className="border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-medium">AI 模型</span>
                <QuestionCircleOutlined className="text-gray-400" />
                <div className="flex-1 text-right">
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    className="ml-2"
                  />
                </div>
              </div>
              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                options={modelOptions}
                style={{ width: '100%' }}
                suffixIcon={<DownOutlined />}
              />
            </Card>

            {/* 提示词部分 */}
            <Card className="border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">提示词</span>
                  <QuestionCircleOutlined className="text-gray-400" />
                </div>
                <div className="text-gray-400 text-sm">
                  输入"/"可选择变量
                </div>
              </div>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="模型固定的引导词，通过调整该内容，可以引导模型聊天方向。该内容会被固定在上下文的开头。可通过输入/插入选择变量"
                autoSize={{ minRows: 8, maxRows: 12 }}
                className="mb-2"
              />
            </Card>
          </div>

          {/* 知识库部分 */}
          <Card className="border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DatabaseOutlined className="text-blue-600" />
                </div>
                <span className="font-medium">关联知识库</span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="text">选择</Button>
                <Button type="text">参数</Button>
              </div>
            </div>
          </Card>

          {/* 工具调用部分 */}
          <Card className="border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ToolOutlined className="text-blue-600" />
                </div>
                <span className="font-medium">工具调用</span>
                <QuestionCircleOutlined className="text-gray-400" />
              </div>
              <Button type="text">选择</Button>
            </div>
          </Card>
        </div>

        {/* 右侧预览部分保持不变 */}
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

      {/* Modal 部分保持不变 */}
    </Layout>
  );
};

export default Agent;