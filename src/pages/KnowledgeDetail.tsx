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
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Navigation */}
      <div className="w-64 p-4 border-r border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 text-center">知识库文档管理</p>
        </div>

        <div className="space-y-1">
          <div className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md font-medium">
            文档
          </div>
          <div className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">
            召回测试
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">文档</h2>
          
          <div className="flex justify-between items-center mb-4">
            <Space>
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={handleImport}
                className="h-8"
              >
                导入云盘文件
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
                className="h-8"
              >
                上传新文件
              </Button>
            </Space>

            <div className="w-1/3">
              <input 
                type="text" 
                placeholder="搜索文档..." 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
    </div>
  );
};

export default KnowledgeDetail;
