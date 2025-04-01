import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, message, Checkbox, Switch } from 'antd';
import { PlusOutlined, UploadOutlined, ArrowLeftOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { getKnowledgeDocPage, KnowledgeDocItem } from '../services/api';

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<KnowledgeDocItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const fetchDocList = async (page: number, pageSize: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getKnowledgeDocPage({
        page,
        page_size: pageSize,
        kb_id: id
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      } else {
        message.error(res.message || '获取文档列表失败');
      }
    } catch (error) {
      message.error('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocList(currentPage, pageSize);
  }, [id, currentPage, pageSize]);

  const handleCreateNew = () => {
    console.log('创建新文档');
  };

  const handleImport = () => {
    console.log('导入文档');
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleBack = () => {
    navigate('/knowledge-base');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="h-8"
          >
            返回
          </Button>
          <div className="flex items-baseline gap-2">  
            <h2 className="text-xl font-bold m-0">文档</h2>
            <span className="text-sm text-gray-500">当前知识库下的所有文件</span>
          </div>
        </div>
      </div>

        
        <div className="flex justify-between items-center">
          <div className="w-1/3">
            <input 
              type="text" 
              placeholder="搜索文档..." 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={handleImport}
              className="h-8"
            >
              导入文档
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              className="h-8"
            >
              新建文档
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="ID"
        loading={loading}
        dataSource={data}
        className="bg-white rounded-lg shadow"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          className: "text-sm",
          size: "small"
        }}
        columns={[
          {
            title: <Checkbox />,
            dataIndex: 'checkbox',
            width: 30,
            render: () => <Checkbox />
          },
          {
            title: '#',
            dataIndex: 'index',
            width: 30,
            render: (_: any, __: any, index: number) => index + 1
          },
          {
            title: '名称',
            dataIndex: 'Title',
            ellipsis: true,
            width: 400
          },
          {
            title: '修改时间',
            dataIndex: 'UpdatedAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString()
          },
          {
            title: '解析状态',
            dataIndex: 'Status',
            width: 100,
            render: (status: number) => (
              <Tag color={{
                2: 'success',
                1: 'warning',
                0: 'error'
              }[status]} className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                {status === 2 ? '已完成' : 
                 status === 1 ? '处理中' : '失败'}
              </Tag>
            )
          },
          {
            title: '启用状态',
            dataIndex: 'Enabled',
            width: 100,
            render: (enabled: boolean) => (
              <Switch 
                checked={enabled}
                checkedChildren="启用" 
                unCheckedChildren="关闭"
              />
            )
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            render: () => (
              <Space size="small">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EyeOutlined />}
                  className="text-blue-500 hover:text-blue-600"
                />
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />}
                  className="text-red-500 hover:text-red-600"
                  danger
                />
              </Space>
            )
          }
        ]}
      />
    </div>
  );
};

export default KnowledgeDetail;
