import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Input, Select, Switch, Form, 
  InputNumber, message, Tabs, Spin, Tag, Tooltip, Row, Col, Divider, 
  Modal, Space
} from 'antd';
import { Button } from '../components/common';
import { MarkdownRenderer } from '../components/common';
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
  EditOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { agentService } from '../services/agentService';
import { modelService } from '../services/modelService';
import { knowledgeService } from '../services/knowledgeService';
import { AgentItem, AgentSchema } from '../types/agent';
import { ModelItem } from '../types/model';
import { KnowledgeItem } from '../types/knowledge';
import { useDebugChat } from '../hooks/useDebugChat';

import './markdown-styles.css';

const { Content } = Layout;
const { TextArea } = Input;

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
  
  const {
    messages: chatMessages,
    userInput,
    setUserInput,
    isLoading: testLoading,
    currentStreamContent,
    sendMessage: handleSendMessage,
    clearChat: handleClearChat
  } = useDebugChat(id || '');

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
        setAgent(res.data as unknown as AgentItem);
        // Set form values
        const schema = (res.data as any).schema || {
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
      
      // @ts-ignore
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  
  const selectedModel = llmModels.find(model => model.ID === form.getFieldValue('llm_config.model_id'));
  
  return (
    <div className="flex flex-col h-full">
      {/* 页面顶部操作栏 */}
      <div className="bg-white border-b flex items-center justify-between px-4 py-2 mb-4 rounded-md shadow-sm">
        <div className="flex items-center">
          <Button
            icon={<LeftOutlined />}
            type="text"
            onClick={() => navigate('/agent')}
            className="mr-4"
          />
          <div className="flex items-center">
            <span className="text-lg font-semibold truncate max-w-xs">{agent?.name || 'Agent详情'}</span>
            {agent?.description && (
              <span className="text-gray-500 ml-2 text-sm hidden sm:inline truncate max-w-xs">({agent.description})</span>
            )}
            <Button 
              icon={<EditOutlined />} 
              type="text" 
              size="small" 
              className="ml-2"
              onClick={() => setEditNameModalVisible(true)}
            />
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button 
            type="default"
            icon={<LinkOutlined />}
            onClick={() => window.open(`/chat/${id}`, '_blank')}
          >
            使用
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
          >
            保存
          </Button>
        </div>
      </div>

      {/* 主内容区域，自适应高度 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex w-full h-full">
          {/* 左侧编辑区域 */}
          <div className="w-1/2 flex flex-col overflow-hidden pr-2">
            <Card className="flex-1 overflow-auto" bodyStyle={{ padding: "16px", height: '100%' }}>
              <Form
                form={form}
                layout="vertical"
                className="h-full overflow-auto pr-1"
              >
                {/* LLM配置 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThunderboltOutlined className="text-purple-600" />
                    <span className="text-base font-medium">LLM配置</span>
                  </div>
                  <Button 
                    type="text" 
                    icon={<SettingOutlined />} 
                    size="small"
                    onClick={() => setShowLLMSettingsModal(true)}
                  />
                </div>
                
                <Form.Item
                  name="llm_config.model_id"
                  rules={[{ required: true, message: '请选择AI模型' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="请选择AI模型"
                    options={llmModels.map(model => ({
                      label: model.ShowName,
                      value: model.ID
                    }))}
                    notFoundContent="暂无可用的AI模型"
                  />
                </Form.Item>

                <Divider className="my-3" />
                
                {/* 提示词部分 */}
                <div className="flex items-center gap-2 mb-2">
                  <SendOutlined className="text-blue-600" />
                  <span className="text-base font-medium">提示词</span>
                </div>
                <Form.Item name="prompt" className="mb-4">
                  <TextArea
                    placeholder="在这里输入你的提示词，输入'/'可选择变量"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                    className="resize-none"
                  />
                </Form.Item>

                <Divider className="my-3" />
                
                {/* 知识库部分 */}
                <div className="flex items-center gap-2 mb-2">
                  <DatabaseOutlined className="text-blue-600" />
                  <span className="text-base font-medium">知识库</span>
                </div>
                <Form.Item name="knowledge.knowledge_ids" className="mb-4">
                  <Select
                    mode="multiple"
                    placeholder="请选择关联的知识库"
                    options={knowledgeBases.map(kb => ({
                      label: kb.Name,
                      value: kb.ID
                    }))}
                    optionFilterProp="label"
                    notFoundContent="暂无可用的知识库"
                  />
                </Form.Item>

                <Divider className="my-3" />
                
                {/* MCP服务 */}
                <div className="flex items-center gap-2 mb-2">
                  <CloudServerOutlined className="text-green-600" />
                  <span className="text-base font-medium">MCP服务</span>
                </div>
                <Form.Item name="mcp.servers" className="mb-4">
                  <Select
                    mode="tags"
                    placeholder="请输入MCP服务器URL"
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                <Divider className="my-3" />
                
                {/* 工具调用部分 */}
                <div className="flex items-center gap-2 mb-2">
                  <ToolOutlined className="text-purple-600" />
                  <span className="text-base font-medium">工具调用</span>
                </div>
                <Form.Item name="tools.tool_ids" className="mb-4">
                  <Select
                    mode="multiple"
                    placeholder="暂不支持工具配置"
                    disabled
                  />
                </Form.Item>
              </Form>
            </Card>
          </div>

          {/* 右侧预览与测试区域 */}
          <div className="w-1/2 flex flex-col overflow-hidden pl-2">
            <Card 
              title="调试与预览"
              extra={
                <Button 
                  type="text" 
                  icon={<SettingOutlined />} 
                  onClick={handleClearChat}
                  size="small"
                >
                  清空对话
                </Button>
              }
              className="flex-1 flex flex-col overflow-hidden"
              bodyStyle={{ 
                padding: 0,
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* 对话内容区域 */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
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
                          <div className="bg-white border px-3 py-2 rounded-lg text-sm markdown-content">
                            <MarkdownRenderer content={message.content} />
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
                      <div className="bg-white border px-3 py-2 rounded-lg text-sm markdown-content">
                        <MarkdownRenderer content={currentStreamContent} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show loading indicator */}
                {testLoading && !currentStreamContent && (
                  <div className="flex justify-center my-4">
                    <Spin tip="思考中..." size="small" />
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="border-t p-3 bg-white flex-shrink-0">
                <div className="relative">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="发送消息测试Agent"
                    className="pr-12 rounded-full"
                    onPressEnter={() => {
                      if (userInput.trim() && !testLoading) {
                        handleSendMessage(userInput);
                      }
                    }}
                    disabled={testLoading}
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => handleSendMessage(userInput)}
                    disabled={testLoading || !userInput.trim()}
                    size="small"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default AgentDetail; 