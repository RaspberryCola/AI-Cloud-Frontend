import React from 'react';
import { Card, List, Input, Button, Tag, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createTime: string;
}

const mockData: KnowledgeItem[] = [
  {
    id: '1',
    title: '项目管理最佳实践',
    description: '总结了项目管理中的关键点和注意事项，包括任务分配、进度控制、风险管理等方面的经验。',
    tags: ['项目管理', '最佳实践', '经验总结'],
    createTime: '2024-02-03',
  },
  {
    id: '2',
    title: '前端开发规范',
    description: '详细的前端开发规范文档，包括代码风格、命名规范、组件设计原则等内容。',
    tags: ['前端开发', '规范', '文档'],
    createTime: '2024-02-03',
  },
  {
    id: '3',
    title: 'API接口文档',
    description: '系统API接口的详细说明，包括接口地址、参数说明、返回值格式等信息。',
    tags: ['API', '接口文档', '开发文档'],
    createTime: '2024-02-03',
  },
];

const KnowledgeBase: React.FC = () => {
  const onSearch = (value: string) => {
    console.log('搜索:', value);
  };

  const handleCreateNew = () => {
    console.log('创建新知识条目');
  };

  return (
    <div className="p-6">
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
        dataSource={mockData}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="h-full"
              title={
                <div className="font-bold text-lg truncate" title={item.title}>
                  {item.title}
                </div>
              }
            >
              <div className="mb-4 text-gray-600 h-12 overflow-hidden">
                {item.description}
              </div>
              <Space direction="vertical" className="w-full">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className="text-right text-gray-400 text-sm">
                  创建时间：{item.createTime}
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default KnowledgeBase; 