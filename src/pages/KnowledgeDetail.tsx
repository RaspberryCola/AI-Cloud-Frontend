import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, List, Space, Tag, message, Pagination } from 'antd';
import { PlusOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            返回
          </Button>
          <h2 className="text-xl font-bold">知识库文档列表</h2>
        </div>
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
        loading={loading}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <div className="w-full flex justify-between items-center">
              <div>
                <div className="font-medium">{item.Title}</div>
                <Space size="small">
                  <Tag color={
                    item.Status === 2 ? 'green' : 
                    item.Status === 1 ? 'orange' : 'red'
                  }>
                    {item.Status === 2 ? '已完成' : 
                     item.Status === 1 ? '处理中' : '失败'}
                  </Tag>
                </Space>
              </div>
              <Space>
                <div className="text-gray-400 text-sm">
                  更新时间：{new Date(item.UpdatedAt).toLocaleString()}
                </div>
                <Button size="small" danger>删除</Button>
              </Space>
            </div>
          </List.Item>
        )}
      />
      <div className="mt-4 flex justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条记录`}
        />
      </div>
    </div>
  );
};

export default KnowledgeDetail;
