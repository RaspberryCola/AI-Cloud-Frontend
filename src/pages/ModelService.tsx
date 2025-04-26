import React, { useState, useEffect } from 'react';
import { Typography, Card, Tabs, Button, Table, Space, Modal, Form, Input, Select, InputNumber, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { modelService } from '../services/modelService';
import { ModelItem, ModelType, ModelServer, CreateModelRequest, UpdateModelRequest } from '../types/model';

const { Title } = Typography;
const { TabPane } = Tabs;

const ModelService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [modelType, setModelType] = useState<'llm' | 'embedding'>('llm');
  const [currentModel, setCurrentModel] = useState<ModelItem | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchModels = async (type?: ModelType) => {
    try {
      setLoading(true);
      const res = await modelService.getModelList({ type });
      if (res.code === 0) {
        setModels(res.data);
      } else {
        message.error(res.message || '获取模型列表失败');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchModels();
    } else if (activeTab === 'llm') {
      fetchModels('llm');
    } else if (activeTab === 'embedding') {
      fetchModels('embedding');
    }
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const showCreateModal = (type: 'llm' | 'embedding') => {
    setModelType(type);
    form.resetFields();
    form.setFieldsValue({
      type,
      server: 'openai',
      max_tokens: type === 'llm' ? 8192 : 2048,
      max_output_length: 4096,
      function: false
    });
    setModalVisible(true);
  };

  const handleCreateModel = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await modelService.createModel(values as CreateModelRequest);
      if (res.code === 0) {
        message.success('创建模型成功');
        setModalVisible(false);
        fetchModels(activeTab === 'all' ? undefined : activeTab as ModelType);
      } else {
        message.error(res.message || '创建模型失败');
      }
    } catch (error) {
      console.error('创建模型失败:', error);
      message.error('创建模型失败');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = async (modelId: string) => {
    try {
      setLoading(true);
      const res = await modelService.getModelDetail(modelId);
      if (res.code === 0) {
        const modelData = res.data;
        setCurrentModel(modelData);
        setModelType(modelData.Type as 'llm' | 'embedding');
        
        // 将后端数据格式转换为表单数据格式
        editForm.setFieldsValue({
          id: modelData.ID,
          type: modelData.Type,
          name: modelData.ShowName,
          server: modelData.Server,
          base_url: modelData.BaseURL,
          model: modelData.ModelName,
          api_key: modelData.APIKey,
          max_tokens: modelData.MaxTokens,
          max_output_length: modelData.MaxOutputLength,
          function: modelData.Function,
          dimension: modelData.Dimension
        });
        
        setEditModalVisible(true);
      } else {
        message.error(res.message || '获取模型详情失败');
      }
    } catch (error) {
      console.error('获取模型详情失败:', error);
      message.error('获取模型详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModel = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      const res = await modelService.updateModel(values as UpdateModelRequest);
      if (res.code === 0) {
        message.success('更新模型成功');
        setEditModalVisible(false);
        fetchModels(activeTab === 'all' ? undefined : activeTab as ModelType);
      } else {
        message.error(res.message || '更新模型失败');
      }
    } catch (error) {
      console.error('更新模型失败:', error);
      message.error('更新模型失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模型吗？',
      onOk: async () => {
        try {
          setLoading(true);
          const res = await modelService.deleteModel(modelId);
          if (res.code === 0) {
            message.success('删除模型成功');
            fetchModels(activeTab === 'all' ? undefined : activeTab as ModelType);
          } else {
            message.error(res.message || '删除模型失败');
          }
        } catch (error) {
          console.error('删除模型失败:', error);
          message.error('删除模型失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'ShowName',
      key: 'ShowName',
    },
    {
      title: '服务商',
      dataIndex: 'Server',
      key: 'Server',
    },
    {
      title: '模型类型',
      dataIndex: 'Type',
      key: 'Type',
      render: (text: string) => text === 'llm' ? 'LLM模型' : 'Embedding模型'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ModelItem) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record.ID)}>编辑</Button>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.ID)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="model-service-container">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>模型服务</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showCreateModal('llm')}>新建LLM模型</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showCreateModal('embedding')}>新建Embedding模型</Button>
        </Space>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部模型" key="all" />
          <TabPane tab="LLM模型" key="llm" />
          <TabPane tab="Embedding模型" key="embedding" />
        </Tabs>
        
        <Table 
          columns={columns} 
          dataSource={models} 
          rowKey="ID" 
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={modelType === 'llm' ? '新建LLM模型' : '新建Embedding模型'}
        open={modalVisible}
        onOk={handleCreateModel}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: modelType,
            server: 'openai',
            max_tokens: modelType === 'llm' ? 8192 : 2048,
            max_output_length: 4096,
            function: false
          }}
        >
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型显示名称" />
          </Form.Item>

          <Form.Item
            name="server"
            label="服务商"
            rules={[{ required: true, message: '请选择服务商' }]}
          >
            <Select>
              <Select.Option value="openai">OpenAI</Select.Option>
              <Select.Option value="ollama">Ollama</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="base_url"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="请输入API地址" />
          </Form.Item>

          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: false, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>

          {modelType === 'embedding' && (
            <Form.Item
              name="dimension"
              label="向量维度"
              rules={[{ required: true, message: '请输入向量维度' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item
            name="max_tokens"
            label="最大输入长度"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          {modelType === 'llm' && (
            <>
              <Form.Item
                name="max_output_length"
                label="最大输出长度"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="function"
                label="支持Function Call"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title={currentModel?.Type === 'llm' ? '编辑LLM模型' : '编辑Embedding模型'}
        open={editModalVisible}
        onOk={handleUpdateModel}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            type: currentModel?.Type,
            server: currentModel?.Server || 'openai',
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型显示名称" />
          </Form.Item>

          <Form.Item
            name="server"
            label="服务商"
            rules={[{ required: true, message: '请选择服务商' }]}
          >
            <Select>
              <Select.Option value="openai">OpenAI</Select.Option>
              <Select.Option value="ollama">Ollama</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="base_url"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="请输入API地址" />
          </Form.Item>

          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: false, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>

          {currentModel?.Type === 'embedding' && (
            <Form.Item
              name="dimension"
              label="向量维度"
              rules={[{ required: true, message: '请输入向量维度' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item
            name="max_tokens"
            label="最大输入长度"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          {currentModel?.Type === 'llm' && (
            <>
              <Form.Item
                name="max_output_length"
                label="最大输出长度"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="function"
                label="支持Function Call"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ModelService;