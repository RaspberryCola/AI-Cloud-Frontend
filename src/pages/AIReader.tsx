import React, { useState } from 'react';
import { Layout, Upload, Button, Card, Input, Spin, message } from 'antd';
import { InboxOutlined, SendOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Content, Sider } = Layout;
const { TextArea } = Input;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AIReader: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (info: any) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      setFileList([...fileList, info.file]);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: userInput,
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserInput('');
    setLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: '这是AI助手的回复。在实际应用中，这里应该调用后端API获取真实的AI响应。',
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <div className="mb-6">
          <Dragger
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            multiple={false}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 PDF、Word、TXT 等格式的文档
            </p>
          </Dragger>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card title="文档预览" className="h-[600px] overflow-auto">
            {fileList.map((file, index) => (
              <div key={index} className="p-4 border-b">
                <h3 className="font-bold">{file.name}</h3>
                <p className="text-gray-500">
                  文件大小: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </Card>

          <Card title="AI对话" className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-auto mb-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-center">
                  <Spin />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="输入您的问题..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                className="ml-2"
              >
                发送
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AIReader; 