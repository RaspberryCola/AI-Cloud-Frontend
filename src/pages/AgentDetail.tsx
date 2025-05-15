import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Input, Select, Switch, Form, 
  InputNumber, message, Tabs, Spin, Tag, Tooltip, Row, Col, Divider, 
  Modal, Space
} from 'antd';
import { Button } from '../components/common';
import { 
  QuestionCircleOutlined, 
  SaveOutlined,
  LeftOutlined, 
  SettingOutlined,
  ThunderboltOutlined,
  SendOutlined,
  DatabaseOutlined,
  ToolOutlined,
  CloudServerOutlined,
  EditOutlined
} from '@ant-design/icons';
import { agentService } from '../services/agentService';
import { modelService } from '../services/modelService';
import { knowledgeService } from '../services/knowledgeService';
import { AgentItem, AgentSchema, ChatMessage } from '../types/agent';
import { ModelItem } from '../types/model';
import { KnowledgeItem } from '../types/knowledge';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [nameDescForm] = Form.useForm();
  
  const [agent, setAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [showLLMSettingsModal, setShowLLMSettingsModal] = useState(false);
  
  const [llmModels, setLLMModels] = useState<ModelItem[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeItem[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  
  // Fetch agent data
  useEffect(() => {
    if (id) {
      fetchAgentData();
      fetchLLMModels();
      fetchKnowledgeBases();
    }
  }, [id]);
  
  const fetchAgentData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await agentService.getAgent(id);
      if (res.code === 0) {
        setAgent(res.data);
        // Set form values
        const schema = res.data.schema || {
          llm_config: {
            model_id: '',
            temperature: 0.7,
            top_p: 0.9,
            max_output_length: 2048,
            thinking: true
          },
          mcp: { servers: [] },
          tools: { tool_ids: [] },
          prompt: '',
          knowledge: { knowledge_ids: [] }
        };
        
        form.setFieldsValue({
          name: res.data.name,
          description: res.data.description,
          'llm_config.model_id': schema.llm_config?.model_id || '',
          'llm_config.temperature': schema.llm_config?.temperature || 0.7,
          'llm_config.top_p': schema.llm_config?.top_p || 0.9,
          'llm_config.max_output_length': schema.llm_config?.max_output_length || 2048,
          'llm_config.thinking': schema.llm_config?.thinking || true,
          prompt: schema.prompt || '',
          'knowledge.knowledge_ids': schema.knowledge?.knowledge_ids || [],
          'mcp.servers': schema.mcp?.servers || [],
          'tools.tool_ids': schema.tools?.tool_ids || []
        });
        
        nameDescForm.setFieldsValue({
          name: res.data.name,
          description: res.data.description
        });
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
  
  const fetchLLMModels = async () => {
    try {
      const res = await modelService.getModelList({ type: 'llm' });
      if (res.code === 0) {
        setLLMModels(res.data);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    }
  };
  
  const fetchKnowledgeBases = async () => {
    try {
      const res = await knowledgeService.getKnowledgeList({ page: 1, page_size: 100 });
      if (res.code === 0) {
        setKnowledgeBases(res.data.list);
      }
    } catch (error) {
      console.error('获取知识库列表失败:', error);
    }
  };
  
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      // Flatten form values into agent format
      const updateData = {
        id: id!,
        name: values.name,
        description: values.description,
        llm_config: {
          model_id: values['llm_config.model_id'],
          temperature: values['llm_config.temperature'],
          top_p: values['llm_config.top_p'],
          max_output_length: values['llm_config.max_output_length'],
          thinking: values['llm_config.thinking'],
        },
        prompt: values.prompt,
        knowledge: {
          knowledge_ids: values['knowledge.knowledge_ids'],
        },
        mcp: {
          servers: values['mcp.servers'],
        },
        tools: {
          tool_ids: values['tools.tool_ids'],
        },
      };
      
      const res = await agentService.updateAgent(updateData);
      if (res.code === 0) {
        message.success('保存成功');
        fetchAgentData(); // Refresh data
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateNameDesc = async () => {
    try {
      const values = await nameDescForm.validateFields();
      
      // Update the main form values
      form.setFieldsValue({
        name: values.name,
        description: values.description
      });
      
      // Update agent state
      if (agent) {
        setAgent({
          ...agent,
          name: values.name,
          description: values.description
        });
      }
      
      setEditNameModalVisible(false);
      
      // Save to backend
      handleSave();
    } catch (error) {
      console.error('更新名称和描述失败:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || !id) return;
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: userInput,
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setTestLoading(true);
    
    try {
      console.log('Creating EventSource connection...');
      // 使用我们的模拟 EventSource
      const eventSource = agentService.streamExecuteAgent(id, {
        query: newMessage.content,
        history: chatMessages,
      });
      
      let streamedContent = '';
      
      // 监听消息事件
      eventSource.onmessage = (event) => {
        console.log('Received message:', event);
        try {
          streamedContent += event.data;
          setCurrentStreamContent(streamedContent);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      // 监听特定消息类型 - 我们的模拟 EventSource 支持这个
      eventSource.addEventListener('message', (event) => {
        console.log('Event - message:', event);
        try {
          streamedContent += event.data;
          setCurrentStreamContent(streamedContent);
        } catch (error) {
          console.error('Error processing message event:', error);
        }
      });
      
      // 监听完成事件
      eventSource.addEventListener('done', (event) => {
        console.log('Event - done:', event);
        // 添加 assistant 消息，内容为累积的流式响应
        setChatMessages(prev => [
          ...prev, 
          { role: 'assistant', content: streamedContent || '没有收到回复内容' }
        ]);
        setCurrentStreamContent('');
        setTestLoading(false);
        
        // 关闭连接
        eventSource.close();
      });
      
      // 监听打开事件
      eventSource.addEventListener('open', (event) => {
        console.log('Event - open:', event);
      });
      
      // 监听错误事件
      eventSource.addEventListener('error', (event) => {
        console.error('Event - error:', event);
        // 添加错误消息
        let errorMsg = '执行失败: 服务器错误';
        
        // 尝试从事件中读取错误信息
        if (event instanceof MessageEvent && event.data) {
          errorMsg = `执行失败: ${event.data}`;
        }
        
        // 如果流内容为空，才添加错误消息
        if (!streamedContent) {
          setChatMessages(prev => [
            ...prev, 
            { role: 'assistant', content: errorMsg }
          ]);
          setCurrentStreamContent('');
          setTestLoading(false);
        }
      });
      
      // 监听关闭事件
      eventSource.addEventListener('close', () => {
        console.log('EventSource connection closed');
        setTestLoading(false);
      });
      
    } catch (error) {
      console.error('测试执行失败:', error);
      message.error('测试执行失败: ' + (error instanceof Error ? error.message : String(error)));
      setChatMessages(prev => [
        ...prev, 
        { role: 'assistant', content: '执行失败: ' + (error instanceof Error ? error.message : String(error)) }
      ]);
      setTestLoading(false);
    }
  };
  
  const handleClearChat = () => {
    setChatMessages([]);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  
  const selectedModel = llmModels.find(model => model.ID === form.getFieldValue('llm_config.model_id'));
  
  return (
    <Layout className="h-screen overflow-hidden bg-white">
      <Header className="bg-white border-b flex items-center justify-between px-6 h-14 shadow-sm">
        <div className="flex items-center">
          <Button
            icon={<LeftOutlined />}
            type="text"
            onClick={() => navigate('/agent')}
            className="rounded-full hover:bg-gray-100 focus:outline-none"
          />
          <div className="flex items-center ml-4">
            <span className="text-lg font-semibold">{agent?.name || 'Agent详情'}</span>
            {agent?.description && (
              <span className="text-gray-500 ml-2 text-sm">({agent.description})</span>
            )}
            <Button 
              icon={<EditOutlined />} 
              type="text" 
              size="small" 
              className="ml-2 rounded-full hover:bg-gray-100 focus:outline-none"
              onClick={() => setEditNameModalVisible(true)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
            className="rounded-md focus:outline-none active:outline-none"
          >
            保存
          </Button>
        </div>
      </Header>

      <Content className="overflow-hidden">
        <div className="flex h-[calc(100vh-56px)]">
          {/* 左侧编辑区域 */}
          <div className="w-1/2 overflow-auto p-4">
            <Card className="h-full overflow-auto" bodyStyle={{ padding: "16px" }}>
              <Form
                form={form}
                layout="vertical"
                className="space-y-2"
              >
                {/* LLM配置 */}
                <div className="text-base font-medium mb-2">
                  <span className="inline-flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-2">
                      <ThunderboltOutlined className="text-purple-600" />
                      LLM配置
                    </span>
                    <Button 
                      type="text" 
                      icon={<SettingOutlined />} 
                      size="small"
                      onClick={() => setShowLLMSettingsModal(true)}
                      className="rounded-full hover:bg-gray-100 focus:outline-none active:outline-none"
                    />
                  </span>
                </div>
                
                <Row gutter={16} className="mb-2">
                  <Col span={24}>
                    <Form.Item
                      name="llm_config.model_id"
                      rules={[{ required: true, message: '请选择AI模型' }]}
                      className="mb-1"
                    >
                      <Select
                        placeholder="请选择AI模型"
                        options={llmModels.map(model => ({
                          label: model.ShowName,
                          value: model.ID
                        }))}
                        notFoundContent="暂无可用的AI模型"
                        size="middle"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider className="my-2" />
                
                {/* 提示词部分 */}
                <div className="text-base font-medium mb-2">
                  <span className="inline-flex items-center gap-2">
                    <SendOutlined className="text-blue-600" />
                    提示词
                  </span>
                </div>
                <Form.Item name="prompt" className="mb-2">
                  <TextArea
                    placeholder="在这里输入你的提示词，输入'/'可选择变量"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                  />
                </Form.Item>

                <Divider className="my-2" />
                
                {/* 知识库部分 */}
                <div className="text-base font-medium mb-2">
                  <span className="inline-flex items-center gap-2">
                    <DatabaseOutlined className="text-blue-600" />
                    知识库
                  </span>
                </div>
                <Form.Item name="knowledge.knowledge_ids" className="mb-2">
                  <Select
                    mode="multiple"
                    placeholder="请选择关联的知识库"
                    options={knowledgeBases.map(kb => ({
                      label: kb.Name,
                      value: kb.ID
                    }))}
                    optionFilterProp="label"
                    notFoundContent="暂无可用的知识库"
                    size="middle"
                  />
                </Form.Item>

                <Divider className="my-2" />
                
                {/* MCP服务 */}
                <div className="text-base font-medium mb-2">
                  <span className="inline-flex items-center gap-2">
                    <CloudServerOutlined className="text-green-600" />
                    MCP服务
                  </span>
                </div>
                <Form.Item name="mcp.servers" className="mb-2">
                  <Select
                    mode="tags"
                    placeholder="请输入MCP服务器URL"
                    tokenSeparators={[',']}
                    size="middle"
                  />
                </Form.Item>

                <Divider className="my-2" />
                
                {/* 工具调用部分 */}
                <div className="text-base font-medium mb-2">
                  <span className="inline-flex items-center gap-2">
                    <ToolOutlined className="text-purple-600" />
                    工具调用
                  </span>
                </div>
                <Form.Item name="tools.tool_ids" className="mb-2">
                  <Select
                    mode="multiple"
                    placeholder="暂不支持工具配置"
                    disabled
                    size="middle"
                  />
                </Form.Item>
              </Form>
            </Card>
          </div>

          {/* 右侧预览与测试区域 */}
          <div className="w-1/2 p-4">
            <Card 
              title="调试与预览"
              extra={
                <Button 
                  type="text" 
                  icon={<SettingOutlined />} 
                  onClick={handleClearChat}
                  size="small"
                  className="rounded-full hover:bg-gray-100 focus:outline-none active:outline-none"
                >
                  清空对话
                </Button>
              }
              className="h-full flex flex-col overflow-hidden"
              bodyStyle={{ 
                height: 'calc(100% - 56px)', 
                display: 'flex', 
                flexDirection: 'column',
                padding: '12px',
                overflow: 'hidden'
              }}
            >
              <div className="flex-1 overflow-auto mb-3 space-y-3" style={{ height: 'calc(100% - 50px)' }}>
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[85%]">
                      {message.role === 'user' ? (
                        <>
                          <div className="bg-blue-100 px-3 py-2 rounded-lg text-sm">
                            {message.content}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs">
                            U
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                            A
                          </div>
                          <div className="bg-white border px-3 py-2 rounded-lg whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show streaming response if any */}
                {currentStreamContent && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                        A
                      </div>
                      <div className="bg-white border px-3 py-2 rounded-lg whitespace-pre-wrap text-sm">
                        {currentStreamContent}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show loading indicator */}
                {testLoading && !currentStreamContent && (
                  <div className="flex justify-center">
                    <Spin tip="思考中..." size="small" />
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="relative">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="发送消息测试Agent"
                    className="pr-12 rounded-full"
                    onPressEnter={handleSendMessage}
                    disabled={testLoading}
                    size="middle"
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={handleSendMessage}
                    disabled={testLoading || !userInput.trim()}
                    size="small"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Content>
      
      {/* 编辑名称和描述的弹窗 */}
      <Modal
        title="编辑Agent信息"
        open={editNameModalVisible}
        onCancel={() => setEditNameModalVisible(false)}
        onOk={handleUpdateNameDesc}
        okText="保存"
        cancelText="取消"
        maskClosable={false}
      >
        <Form
          form={nameDescForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Agent名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入Agent名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Agent描述"
          >
            <TextArea 
              placeholder="请输入Agent描述" 
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* LLM详细设置的弹窗 */}
      <Modal
        title="LLM详细设置"
        open={showLLMSettingsModal}
        onCancel={() => setShowLLMSettingsModal(false)}
        onOk={() => setShowLLMSettingsModal(false)}
        okText="确定"
        cancelText="取消"
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="llm_config.temperature"
                label={
                  <div className="flex items-center gap-1">
                    <span>温度</span>
                    <Tooltip title="控制输出的随机性。较高的值（如0.8）会使输出更加随机，而较低的值（如0.2）会使输出更加确定和集中。">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </div>
                }
                rules={[{ required: true, message: '请输入温度值' }]}
              >
                <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="llm_config.top_p"
                label={
                  <div className="flex items-center gap-1">
                    <span>Top P</span>
                    <Tooltip title="控制输出的多样性。较低的值（如0.5）使模型更加确定，仅考虑最有可能的词元，而较高的值（如0.9）则考虑更多可能性。">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </div>
                }
                rules={[{ required: true, message: '请输入Top P值' }]}
              >
                <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="llm_config.max_output_length"
            label={
              <div className="flex items-center gap-1">
                <span>最大输出长度</span>
                <Tooltip title="控制模型回复的最大长度。">
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            }
            rules={[{ required: true, message: '请输入最大输出长度' }]}
          >
            <InputNumber min={1} max={2048} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="llm_config.thinking"
            label={
              <div className="flex items-center gap-1">
                <span>思考过程</span>
                <Tooltip title="是否展示AI的思考过程。">
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AgentDetail; 