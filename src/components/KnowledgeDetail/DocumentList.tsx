import React from 'react';
import { Table, Space, Tag, Button} from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { KnowledgeDocItem } from '../../types/knowledge';

interface DocumentListProps {
  loading: boolean;
  data: KnowledgeDocItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onDelete: (id: string) => void; // Change id type to string
  rowSelection: any;
}

const DocumentList: React.FC<DocumentListProps> = ({
  loading,
  data,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onDelete, // Destructure onDelete
  rowSelection,
}) => {
  return (
    <Table
      rowKey="ID"
      loading={loading}
      dataSource={data}
      className="bg-white rounded-lg shadow"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
        className: "text-sm",
        size: "small"
      }}
      rowSelection={rowSelection}
      columns={[
        // {
        //   title: <Checkbox />,
        //   dataIndex: 'checkbox',
        //   width: 30,
        //   render: () => <Checkbox />
        // },
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
          width: 150,
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
        // {
        //   title: '启用状态',
        //   dataIndex: 'Enabled',
        //   width: 100,
        //   render: (enabled: boolean) => (
        //     <Switch 
        //       checked={enabled}
        //       checkedChildren="启用" 
        //       unCheckedChildren="关闭"
        //     />
        //   )
        // },
        {
          title: '操作',
          key: 'action',
          width: 150,
          render: (_: any, record: KnowledgeDocItem) => ( // Receive record
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
                onClick={() => onDelete(record.ID)} // Add onClick handler
              />
            </Space>
          )
        }
      ]}
    />
  );
};

export default DocumentList;
