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
  RetweetOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getFileList, FileItem, createFolder, deleteFile, downloadFile, uploadFile, moveFiles } from '../services/api';
import dayjs from 'dayjs';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

const getFileIcon = (fileName: string, isDir: boolean) => {
  if (isDir) return <FolderOutlined className="text-blue-500" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'doc':
    case 'docx':
      return <FileWordOutlined className="text-blue-600" />;
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined className="text-green-600" />;
    case 'pdf':
      return <FilePdfOutlined className="text-red-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <FileImageOutlined className="text-purple-600" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined className="text-orange-600" />;
    case 'md':
      return <FileMarkdownOutlined className="text-cyan-600" />;
    case 'txt':
      return <FileTextOutlined className="text-gray-600" />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <PlayCircleOutlined className="text-pink-600" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'py':
    case 'java':
    case 'cpp':
      return <CodeOutlined className="text-yellow-600" />;
    default:
      return <FileOutlined className="text-gray-500" />;
  }
};

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
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [moveTargetPath, setMoveTargetPath] = useState<BreadcrumbItem[]>([{ id: null, name: '根目录' }]);
  const [moveTargetData, setMoveTargetData] = useState<FileItem[]>([]);

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

  const fetchMoveTargetFileList = async (parentId?: string) => {
    try {
      setLoading(true);
      const response = await getFileList({
        parent_id: parentId,
        page: 1,
        page_size: 100,
        sort: 'updated_at:desc',
      });

      if (response.code === 0) {
        setMoveTargetData(response.data.list.filter(item => item.IsDir));
      } else {
        message.error(response.message || '获取文件夹列表失败');
      }
    } catch (error) {
      message.error('获取文件夹列表失败');
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
          {getFileIcon(text, record.IsDir)}
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
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const currentFolder = currentPath[currentPath.length - 1];
      const parentId = currentFolder.id || undefined;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          message.loading({ content: `正在上传: ${file.name}`, key: file.name });
          
          await uploadFile(file, parentId);
          message.success({ content: `${file.name} 上传成功`, key: file.name });
        }
        
        // 刷新文件列表
        fetchFileList(pagination.current, pagination.pageSize);
      } catch (error) {
        message.error('上传失败');
      }
    };
    input.click();
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

  const handleSingleDownload = async (file: FileItem) => {
    try {
      const blob = await downloadFile(file.ID);
      const url = window.URL.createObjectURL(new Blob([blob], { type: file.MIMEType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = file.Name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('下载成功');
    } catch (error) {
      console.error('下载错误:', error);
      message.error('下载失败');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }

    try {
      for (const file of selectedRows) {
        if (!file.IsDir) {
          await handleSingleDownload(file);
        }
      }
    } catch (error) {
      message.error('批量下载失败');
    }
  };

  const handleToggleFavorite = (file: FileItem) => {
    message.info(`收藏文件：${file.Name}`);
  };

  const handleSingleDelete = (file: FileItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${file.Name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteFile(file.ID);
          message.success('删除成功');
          fetchFileList(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRows.length} 个文件/文件夹吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const deletePromises = selectedRows.map(file => deleteFile(file.ID));
          await Promise.all(deletePromises);
          message.success('删除成功');
          setSelectedRows([]);
          fetchFileList(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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

  const handleMove = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要移动的文件');
      return;
    }
    setSelectedFolderId(undefined);
    setMoveTargetPath([{ id: null, name: '根目录' }]);
    fetchMoveTargetFileList();
    setIsMoveModalVisible(true);
  };

  const handleMoveModalOk = async () => {
    try {
      const response = await moveFiles({
        files_pid: selectedRows.map(file => file.ID),
        target_pid: selectedFolderId,
      });

      if (response.code === 200) {
        message.success('移动成功');
        setIsMoveModalVisible(false);
        setSelectedRows([]);
        fetchFileList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.msg || '移动失败');
      }
    } catch (error) {
      message.error('移动失败');
    }
  };

  const handleMoveModalCancel = () => {
    setIsMoveModalVisible(false);
  };

  const handleMoveTargetFolderClick = (record: FileItem) => {
    setSelectedFolderId(record.ID);
    setMoveTargetPath([...moveTargetPath, { id: record.ID, name: record.Name }]);
    fetchMoveTargetFileList(record.ID);
  };

  const handleMoveTargetBreadcrumbClick = (index: number) => {
    const newPath = moveTargetPath.slice(0, index + 1);
    setMoveTargetPath(newPath);
    const targetFolder = newPath[newPath.length - 1];
    setSelectedFolderId(targetFolder.id || undefined);
    fetchMoveTargetFileList(targetFolder.id || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Space>
          <Button type="primary" icon={<UploadOutlined />} onClick={handleUpload}>
            上传文件
          </Button>
          <Button icon={<FolderAddOutlined />} onClick={handleNewFolder}>
            新建文件夹
          </Button>
          {selectedRows.length > 0 && (
            <>
              <Button icon={<DownloadOutlined />} onClick={handleBatchDownload}>
                批量下载
              </Button>
              <Button icon={<RetweetOutlined />} onClick={handleMove}>
                移动到
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                批量删除
              </Button>
            </>
          )}
        </Space>
      </div>

      <Breadcrumb className="py-2">
        {currentPath.map((item, index) => (
          <Breadcrumb.Item key={item.id || 'root'}>
            <a onClick={() => handleBreadcrumbClick(index)}>{item.name}</a>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        rowKey="ID"
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => record.IsDir && handleFolderClick(record),
        })}
        rowSelection={{
          selectedRowKeys: selectedRows.map((row) => row.ID),
          onChange: (_, rows) => setSelectedRows(rows),
        }}
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
        />
      </Modal>

      <Modal
        title="移动到"
        open={isMoveModalVisible}
        onOk={handleMoveModalOk}
        onCancel={handleMoveModalCancel}
        width={600}
      >
        <div className="space-y-4">
          <Breadcrumb>
            {moveTargetPath.map((item, index) => (
              <Breadcrumb.Item key={item.id || 'root'}>
                <a onClick={() => handleMoveTargetBreadcrumbClick(index)}>{item.name}</a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <Table
            columns={[
              {
                title: '名称',
                dataIndex: 'Name',
                key: 'name',
                render: (text: string) => (
                  <Space>
                    <FolderOutlined className="text-blue-500" />
                    <span>{text}</span>
                  </Space>
                ),
              },
            ]}
            dataSource={moveTargetData}
            pagination={false}
            rowKey="ID"
            onRow={(record) => ({
              onClick: () => handleMoveTargetFolderClick(record),
            })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CloudDrive; 