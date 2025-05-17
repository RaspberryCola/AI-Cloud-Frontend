import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, List, Input, Button, Modal, Form, message 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useAgent } from '../hooks/useAgent';

const { Search } = Input;

const Agent: React.FC = () => {
  const navigate = useNavigate();
  const {
    form,
    editingItem,
    isModalVisible,
    data,
    loading,
    setEditingItem,
    setIsModalVisible,
    onSearch,
    fetchAgentList,
    handleCreateNew,
    handleDelete,
    handleEditSubmit,
  } = useAgent();

  useEffect(() => {
    fetchAgentList();
  }, []);

  // 打开Web聊天界面
  const handleOpenWebChat = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    // 在新标签页中打开聊天界面
    window.open(`/chat/${agentId}`, '_blank');
  };

  return (
    <div className="p-6">
      {/* 新建/编辑Agent模态框 */}
      <Modal
        title={editingItem ? "编辑Agent" : "新建Agent"}
        open={isModalVisible}
        okText="确定"
        cancelText="取消"
        onOk={handleEditSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Agent名称"
            rules={[{ required: true, message: '请输入Agent名称' }]}
          >
            <Input placeholder="请输入Agent名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Agent描述"
          >
            <Input.TextArea placeholder="请输入Agent描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 顶部搜索和新建按钮 */}
      <div className="mb-6 flex justify-between items-center">
        <Search
          placeholder="搜索Agent..."
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
          新建Agent
        </Button>
      </div>

      {/* Agent列表 */}
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={data}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="h-full"
              onClick={() => navigate(`/agent/${item.id}`)}
              title={
                <div className="flex items-center gap-2">
                  <RobotOutlined className="text-blue-500" />
                  <div className="font-bold text-lg truncate" title={item.name}>
                    {item.name}
                  </div>
                </div>
              }
            >
              <div className="mb-4 text-gray-600 h-12 overflow-hidden">
                {item.description || '暂无描述'}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  更新时间：{new Date(item.updated_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={(e) => handleOpenWebChat(e, item.id)}
                  >
                    Web使用
                  </Button>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                      form.setFieldsValue({
                        name: item.name,
                        description: item.description
                      });
                      setIsModalVisible(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.name);
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Agent;