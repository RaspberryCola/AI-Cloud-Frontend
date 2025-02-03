import React, { useState, useEffect } from 'react';
import { Table, Breadcrumb, Button, Space, message } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getFileList, FileItem } from '../services/api';
import dayjs from 'dayjs';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

const CloudDrive: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([{ id: null, name: '根目录' }]);
  const [selectedRows, setSelectedRows] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FileItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchFileList = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const currentFolder = currentPath[currentPath.length - 1];
      const response = await getFileList({
        parent_id: currentFolder.id || undefined,
        page,
        page_size: pageSize,
        sort: 'updated_at:desc',
      });

      if (response.code === 0) {
        setData(response.data.list);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.total,
        });
      } else {
        message.error(response.message || '获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileList();
  }, [currentPath]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'Name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {record.IsDir ? <FolderOutlined /> : <FileOutlined />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'Size',
      key: 'size',
      render: (size: number) => {
        if (size === 0) return '-';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let index = 0;
        let convertedSize = size;
        while (convertedSize >= 1024 && index < units.length - 1) {
          convertedSize /= 1024;
          index++;
        }
        return `${convertedSize.toFixed(2)} ${units[index]}`;
      },
    },
    {
      title: '修改时间',
      dataIndex: 'UpdatedAt',
      key: 'updatedAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const handleUpload = () => {
    message.info('上传功能待实现');
  };

  const handleDownload = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }
    message.info('下载功能待实现');
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }
    message.info('删除功能待实现');
  };

  const handleTableChange = (pagination: any) => {
    fetchFileList(pagination.current, pagination.pageSize);
  };

  const handleFolderClick = (record: FileItem) => {
    if (record.IsDir) {
      setCurrentPath([...currentPath, { id: record.ID, name: record.Name }]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const rowSelection = {
    onChange: (_: React.Key[], selectedRows: FileItem[]) => {
      setSelectedRows(selectedRows);
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <Breadcrumb>
          {currentPath.map((path, index) => (
            <Breadcrumb.Item key={path.id || 'root'}>
              {index === currentPath.length - 1 ? (
                path.name
              ) : (
                <a onClick={() => handleBreadcrumbClick(index)}>{path.name}</a>
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>

      <div className="mb-4">
        <Space>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
          >
            上传
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={selectedRows.length === 0}
          >
            下载
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
          >
            删除
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        rowKey="ID"
        pagination={{
          ...pagination,
          showTotal: (total) => `共 ${total} 项`,
        }}
        loading={loading}
        onChange={handleTableChange}
        onRow={(record) => ({
          onDoubleClick: () => handleFolderClick(record),
        })}
      />
    </div>
  );
};

export default CloudDrive; 