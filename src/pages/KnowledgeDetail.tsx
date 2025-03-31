import React from 'react';
import { Button, List, Space, Tag } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

interface DocumentItem {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed';
  enabled: boolean;
  updateTime: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: '1',
    name: '项目管理指南.pdf',
    status: 'completed',
    enabled: true,
    updateTime: '2025-03-30',
  },
  {
    id: '2',
    name: '前端规范.docx',
    status: 'processing',
    enabled: false,
    updateTime: '2025-03-28',
  },
];

const KnowledgeDetail: React.FC = () => {
  const handleCreateNew = () => {
    console.log('创建新文档');
  };

  const handleImport = () => {
    console.log('导入文档');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">知识库文档列表</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={handleImport}
          >
            导入文档
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            新建文档
          </Button>
        </Space>
      </div>

      <List
        dataSource={mockDocuments}
        renderItem={(item) => (
          <List.Item>
            <div className="w-full flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <Space size="small">
                  <Tag color={
                    item.status === 'completed' ? 'green' : 
                    item.status === 'processing' ? 'orange' : 'red'
                  }>
                    {item.status === 'completed' ? '已完成' : 
                     item.status === 'processing' ? '处理中' : '失败'}
                  </Tag>
                  <Tag color={item.enabled ? 'blue' : 'default'}>
                    {item.enabled ? '已启用' : '已禁用'}
                  </Tag>
                </Space>
              </div>
              <Space>
                <div className="text-gray-400 text-sm">
                  更新时间：{item.updateTime}
                </div>
                <Button size="small" danger>删除</Button>
              </Space>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default KnowledgeDetail;
