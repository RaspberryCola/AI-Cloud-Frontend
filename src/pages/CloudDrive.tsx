import React, { useState } from 'react';
import { Table, Breadcrumb, Button, Space, message } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface FileItem {
  key: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  lastModified: string;
}

const CloudDrive: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['根目录']);
  const [selectedRows, setSelectedRows] = useState<FileItem[]>([]);

  // 模拟文件数据
  const data: FileItem[] = [
    {
      key: '1',
      name: '我的文档',
      type: 'folder',
      size: 0,
      lastModified: '2024-02-03 12:00:00',
    },
    {
      key: '2',
      name: '工作文件',
      type: 'folder',
      size: 0,
      lastModified: '2024-02-03 13:00:00',
    },
    {
      key: '3',
      name: '报告.pdf',
      type: 'file',
      size: 1024576, // 1MB
      lastModified: '2024-02-03 14:00:00',
    },
  ];

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {record.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
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
      dataIndex: 'lastModified',
      key: 'lastModified',
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
            <Breadcrumb.Item key={index}>
              {index === currentPath.length - 1 ? (
                path
              ) : (
                <Link to="#">{path}</Link>
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
        pagination={{
          total: data.length,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 项`,
        }}
        onRow={(record) => ({
          onDoubleClick: () => {
            if (record.type === 'folder') {
              setCurrentPath([...currentPath, record.name]);
            }
          },
        })}
      />
    </div>
  );
};

export default CloudDrive; 