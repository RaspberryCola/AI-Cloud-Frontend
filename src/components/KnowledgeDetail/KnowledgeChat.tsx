import React from 'react';
import { Input, Button, Spin, Avatar, message as antdMessage } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { MarkdownRenderer } from '../common';
import { knowledgeService } from '../../services/knowledgeService';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface KnowledgeChatProps {
  kbId: string;
}

const KnowledgeChat: React.FC<KnowledgeChatProps> = ({ kbId }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add an initial empty bot message to append stream content to
    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: Message = {
      id: botMessageId,
      sender: 'bot',
      text: '', // Start with empty text
    };
    setMessages((prev) => [...prev, initialBotMessage]);

    try {
      const response = await knowledgeService.knowledgeChatStream({
        kbs: [kbId],
        query: userMessage.text,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process each complete SSE event (separated by double newlines)
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; // Keep incomplete data for next iteration

        for (const part of parts) {
          const event = part.trim();
          if (!event.startsWith('data:')) continue;

          try {
            const jsonStr = event.substring(5).trim(); // Remove 'data:' prefix
            const data = JSON.parse(jsonStr);
            const deltaContent = data?.choices?.[0]?.delta?.content;
            const finishReason = data?.choices?.[0]?.finish_reason;

            if (deltaContent) {
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: msg.text + deltaContent } 
                  : msg
              ));
              setTimeout(scrollToBottom, 0);
            }

            if (finishReason === 'stop') {
              reader.cancel();
              break;
            }
          } catch (error) {
            console.error('Error parsing SSE event:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Chat stream error:', error);
      antdMessage.error(`请求失败: ${error.message || '未知错误'}`);
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] border border-gray-300 rounded-xl shadow-sm bg-white">
      <div className='p-2 bg-gray-100 text-gray-700 text-left  font-medium border-b border-gray-200 rounded-t-xl'>
        ⚠️注意：当前为知识库对话测试，不支持多轮对话。如需多轮对话和工具调用，请使用Agent。
      </div>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <Avatar icon={<RobotOutlined />} className="mr-2 bg-blue-500" />
            )}
            <div
              className={`max-w-[80%] md:max-w-[45%] inline-flex px-3 py-2 rounded-lg shadow ${
                msg.sender === 'user'
                  ? 'bg-green-200 text-gray-800'
                  : 'bg-gray-200 text-gray-800 markdown-content'
              }`}
            >
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}
              </div>
            </div>
            {msg.sender === 'user' && (
              <Avatar icon={<UserOutlined />} className="ml-2" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center">
            <Avatar icon={<RobotOutlined />} className="mr-2 bg-blue-500" />
            <Spin size="small" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="输入您的问题..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={!inputValue.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeChat;
