import React, { useState, useEffect } from 'react';
import { Table, Breadcrumb, Button, Space, message, Tooltip, Modal, Input } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getFileList, FileItem, createFolder } from '../services/api';
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
  const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
          {record.IsDir ? <FolderOutlined className="text-blue-500" /> : <FileOutlined className="text-gray-500" />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'Size',
      key: 'size',
      width: 120,
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
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: FileItem) => (
        <Space size="middle">
          {!record.IsDir && (
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSingleDownload(record);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="收藏">
            <Button
              type="text"
              icon={<StarOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(record);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSingleDelete(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleUpload = () => {
    message.info('上传功能待实现');
  };

  const handleNewFolder = () => {
    setNewFolderName('');
    setIsNewFolderModalVisible(true);
  };

  const handleNewFolderOk = async () => {
    if (!newFolderName.trim()) {
      message.warning('请输入文件夹名称');
      return;
    }

    try {
      const currentFolder = currentPath[currentPath.length - 1];
      const response = await createFolder({
        name: newFolderName.trim(),
        parent_id: currentFolder.id || undefined,
      });

      console.log('创建文件夹响应:', response);

      if (response.code === 0) {
        message.success('创建文件夹成功');
        setIsNewFolderModalVisible(false);
        fetchFileList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || '创建文件夹失败');
      }
    } catch (error) {
      console.error('创建文件夹错误:', error);
      message.error('创建文件夹失败');
    }
  };

  const handleNewFolderCancel = () => {
    setIsNewFolderModalVisible(false);
  };

  const handleBatchDownload = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }
    message.info('批量下载功能待实现');
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }
    message.info('批量删除功能待实现');
  };

  const handleSingleDownload = (file: FileItem) => {
    message.info(`下载文件：${file.Name}`);
  };

  const handleToggleFavorite = (file: FileItem) => {
    message.info(`收藏文件：${file.Name}`);
  };

  const handleSingleDelete = (file: FileItem) => {
    message.info(`删除文件：${file.Name}`);
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

      <div className="mb-4 flex justify-between">
        <Space>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
          >
            上传文件
          </Button>
          <Button
            icon={<FolderAddOutlined />}
            onClick={handleNewFolder}
          >
            新建文件夹
          </Button>
        </Space>

        {selectedRows.length > 0 && (
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleBatchDownload}
            >
              下载
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              删除
            </Button>
          </Space>
        )}
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
      <Modal
        title="新建文件夹"
        open={isNewFolderModalVisible}
        onOk={handleNewFolderOk}
        onCancel={handleNewFolderCancel}
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleNewFolderOk}
        />
      </Modal>
    </div>
  );
};

export default CloudDrive; 