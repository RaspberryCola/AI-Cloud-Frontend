import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Input, Button, Tag, Space, Modal, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { knowledgeService } from '../services/knowledgeService';

import {KnowledgeItem } from '../types/knowledge';

const { Search } = Input;

const KnowledgeBase: React.FC = () => {
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = React.useState<KnowledgeItem | null>(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [data, setData] = React.useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchKnowledgeList();
  }, []);

  const fetchKnowledgeList = async () => {
    setLoading(true);
    try {
      const res = await knowledgeService.getKnowledgeList({ page: 1, page_size: 10 });
      if (res.code === 0) {
        setData(res.data.list);
      } else {
        message.error(res.message || '获取知识库列表失败');
      }
    } catch (error) {
      message.error('获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };
  const onSearch = async (value: string) => {
    setLoading(true);
    try {
      const res = await knowledgeService.getKnowledgeList({ page: 1, page_size: 10, name: value });
      if (res.code === 0) {
        setData(res.data.list);
      } else {
        message.error(res.message || '搜索知识库失败');
      }
    } catch (error) {
      message.error('搜索知识库失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = (ID: string, Name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识库"${Name}"吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await knowledgeService.deleteKnowledge(ID);
          if (res.code === 0) {
            message.success('删除成功');
            fetchKnowledgeList();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        const res = await knowledgeService.updateKnowledge({
          kb_id: editingItem.ID,
          name: values.name,
          description: values.description,
        });
        if (res.code === 0) {
          message.success('更新成功');
          fetchKnowledgeList();
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await knowledgeService.createKnowledge(values);
        if (res.code === 0) {
          message.success('创建成功');
          fetchKnowledgeList();
        } else {
          message.error(res.message || '创建失败');
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return (
    <div className="p-6">
      <Modal
        title={editingItem ? "编辑知识库" : "新建知识库"}
        visible={isModalVisible}
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
