import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Input, Button, Tag, Space, Modal, Form, message, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { modelService } from '../services/modelService';
import { ModelItem } from '../types/model';

const { Search } = Input;

const KnowledgeBase: React.FC = () => {
  const [embeddingModels, setEmbeddingModels] = useState<ModelItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const {
    form,
    editingItem,
    isModalVisible,
    data,
    loading,
    setEditingItem,
    setIsModalVisible,
    onSearch,
    fetchKnowledgeList,
    handleCreateNew,
    handleDelete,
    handleEditSubmit,
  } = useKnowledgeBase();

  const navigate = useNavigate();

  useEffect(() => {
    fetchKnowledgeList();
    fetchEmbeddingModels();
  }, []);

  const fetchEmbeddingModels = async () => {
    setLoadingModels(true);
    try {
      const res = await modelService.getModelList({ type: 'embedding' });
      if (res.code === 0) {
        setEmbeddingModels(res.data);
      } else {
        message.error(res.message || '获取模型列表失败');
      }
    } catch (error) {
      message.error('获取模型列表失败');
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <div className="p-6">
      {/* 新建/编辑知识库 */}
      <Modal
        title={editingItem ? "编辑知识库" : "新建知识库"}
        open={isModalVisible}
        okText={"确定"}
        cancelText={"取消"}
        onOk={handleEditSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="知识库描述"
          >
            <Input.TextArea placeholder="请输入知识库描述" />
          </Form.Item>
          <Form.Item
            name="embed_model_id"
            label="嵌入模型"
            rules={[{ required: true, message: '请选择嵌入模型' }]}
          >
            <Select
              loading={loadingModels}
              placeholder="请选择嵌入模型"
              options={embeddingModels.map(model => ({
                label: model.ShowName,
                value: model.ID
              }))}
              notFoundContent={
                <div className="text-center py-2">
                  <div>暂无可用的嵌入模型</div>
                  <Button 
                    type="link" 
                    onClick={() => {
                      setIsModalVisible(false);
                      navigate('/model');
                    }}
                  >
                    前往创建
                  </Button>
                </div>
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <div className="mb-6 flex justify-between items-center">
        <Search
          placeholder="搜索知识库..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          style={{ width: 400 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateNew}
        >
          新建知识条目
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={data}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="h-full"
              onClick={() => navigate(`/knowledge-base/${item.ID}`)}
              title={
                <div className="font-bold text-lg truncate" title={item.Name}>
                  {item.Name}
                </div>
              }
            >
              <div className="mb-4 text-gray-600 h-12 overflow-hidden">
                {item.Description}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  更新时间：{new Date(item.UpdatedAt).toLocaleString()}
                </div>
                <Space>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                      form.setFieldsValue({
                        name: item.Name,
                        description: item.Description
                      });
                      setIsModalVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.ID, item.Name);
                    }}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default KnowledgeBase;
