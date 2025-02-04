import React, { useState, useEffect } from 'react';
import { Table, Breadcrumb, Button, Space, message, Modal, Input } from 'antd';
import {
  UploadOutlined,
  FolderAddOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RetweetOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  getFileList,
  createFolder,
  deleteFile,
  downloadFile,
  moveFiles,
  uploadFile,
  searchFiles,
  renameFile as renameFileApi,
  getFilePathById,
  getFileIdPath,
} from '../services/api';
import type { FileItem, BreadcrumbItem, PaginationState } from '../types/cloudDrive';
import { getColumns } from '../components/CloudDrive/columns';
import { downloadBlob } from '../utils/fileUtils';
import MoveFilesModal from '../components/CloudDrive/MoveFilesModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiResponse } from '../types/apiResponse';

const CloudDrive: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([{ id: null, name: '根目录' }]);
  const [selectedRows, setSelectedRows] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FileItem[]>([]);
  const [sortField, setSortField] = useState<'name' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState<PaginationState>({
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
  const [searchKey, setSearchKey] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFileList = async (page = 1, pageSize = 10, isSearch = isSearchMode) => {
    try {
      setLoading(true);
      let response;
      
      if (isSearch && searchKey.trim()) {
        response = await searchFiles({
          key: searchKey.trim(),
          page,
          page_size: pageSize,
          sort: `${sortField === 'name' ? 'name' : 'updated_at'}:${sortOrder}`,
        });
      } else {
        const currentFolder = currentPath[currentPath.length - 1];
        response = await getFileList({
          parent_id: currentFolder.id || undefined,
          page,
          page_size: pageSize,
          sort: `${sortField === 'name' ? 'name' : 'updated_at'}:${sortOrder}`,
        });
      }

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
  }, [currentPath, sortField, sortOrder]);

  useEffect(() => {
    // 从 URL 中解析路径
    const pathParam = new URLSearchParams(location.search).get('path');
    if (pathParam) {
      try {
        const pathData = JSON.parse(decodeURIComponent(pathParam));
        setCurrentPath(pathData);
      } catch (e) {
        setCurrentPath([{ id: null, name: '根目录' }]);
      }
    } else {
      setCurrentPath([{ id: null, name: '根目录' }]);
    }
  }, [location.search]);

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
          
          const response = await uploadFile(file, parentId);
          if (response.code === 0) {
            message.success({ content: `${file.name} 上传成功`, key: file.name });
          } else {
            message.error({ content: `${file.name} ${response.message || '上传失败'}`, key: file.name });
          }
        }
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

      if (response.code === 0) {
        message.success('创建文件夹成功');
        setIsNewFolderModalVisible(false);
        fetchFileList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || '创建文件夹失败');
      }
    } catch (error) {
      message.error('创建文件夹失败');
    }
  };

  const handleSingleDownload = async (file: FileItem) => {
    try {
      if (file.IsDir) {
        message.loading({ content: `正在准备下载文件夹：${file.Name}`, key: file.ID });
      } else {
        message.loading({ content: `正在下载：${file.Name}`, key: file.ID });
      }
      
      const blob = await downloadFile(file.ID);
      downloadBlob(blob, file.Name, file.MIMEType);
      message.success({ content: '下载成功', key: file.ID });
    } catch (error) {
      message.error({ content: '下载失败', key: file.ID });
    }
  };

  const handleBatchDownload = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }

    try {
      for (const file of selectedRows) {
        await handleSingleDownload(file);
      }
    } catch (error) {
      message.error('批量下载失败');
    }
  };

  const handleSingleDelete = (file: FileItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${file.Name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await deleteFile(file.ID);
          if (response.code === 0) {
            message.success('删除成功');
            fetchFileList(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '删除失败');
          }
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
          await Promise.all(selectedRows.map(file => deleteFile(file.ID)));
          message.success('删除成功');
          setSelectedRows([]);
          fetchFileList(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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

      if (response.code === 0) {
        message.success('移动成功');
        setIsMoveModalVisible(false);
        setSelectedRows([]);
        fetchFileList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || '移动失败');
      }
    } catch (error) {
      message.error('移动失败');
    }
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

  const handleSortChange = (field: 'name' | 'updated_at') => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder('asc');
    } else {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const handleTableChange = (newPagination: any) => {
    fetchFileList(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = () => {
    if (searchKey.trim()) {
      setIsSearchMode(true);
      setSelectedRows([]);
      fetchFileList(1, pagination.pageSize, true);
    } else {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchKey('');
    setIsSearchMode(false);
    setSelectedRows([]);
    fetchFileList(1, pagination.pageSize, false);
  };

  const getFilePath = async (fileId: string): Promise<BreadcrumbItem[]> => {
    try {
      const [pathResponse, idPathResponse] = await Promise.all([
        getFilePathById(fileId),
        getFileIdPath(fileId)
      ]);

      if (pathResponse.code === 0 && idPathResponse.code === 0) {
        const pathParts = pathResponse.data.path.split('/').filter(Boolean);
        const idParts = idPathResponse.data.id_path.split('/').filter(Boolean);
        
        // 组合路径信息，跳过 root
        return pathParts.map((name: string, index: number) => ({
          id: index === 0 ? null : idParts[index],
          name: name
        }));
      }
      throw new Error(pathResponse.message || idPathResponse.message || '获取路径失败');
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
        // 跳转到登录页
        navigate('/login');
      } else {
        message.error('获取文件路径失败');
      }
      return [{ id: null, name: '根目录' }];
    }
  };

  const handleFolderClick = async (record: FileItem) => {
    if (record.IsDir) {
      setIsLoadingPath(true);
      try {
        if (isSearchMode) {
          // 在搜索模式下，先获取完整路径
          const fullPath = await getFilePath(record.ID);
          setSearchKey('');
          setIsSearchMode(false);
          const encodedPath = encodeURIComponent(JSON.stringify(fullPath));
          navigate(`?path=${encodedPath}`);
        } else {
          const newPath = [...currentPath, { id: record.ID, name: record.Name }];
          const encodedPath = encodeURIComponent(JSON.stringify(newPath));
          navigate(`?path=${encodedPath}`);
        }
      } catch (error) {
        message.error('导航失败');
      } finally {
        setIsLoadingPath(false);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = currentPath.slice(0, index + 1);
    const encodedPath = encodeURIComponent(JSON.stringify(newPath));
    navigate(`?path=${encodedPath}`);
  };

  const handleRename = (file: FileItem) => {
    setRenameFile(file);
    setNewFileName(file.Name);
    setIsRenameModalVisible(true);
  };

  const handleRenameOk = async () => {
    if (!renameFile || !newFileName.trim()) {
      message.warning('请输入文件名称');
      return;
    }

    try {
      const response = await renameFileApi({
        file_id: renameFile.ID,
        new_name: newFileName.trim()
      });
      
      if (response.code === 0) {
        message.success('重命名成功');
        setIsRenameModalVisible(false);
        fetchFileList(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || '重命名失败');
      }
    } catch (error) {
      message.error('重命名失败');
    }
  };

  const handleShare = (file: FileItem) => {
    // TODO: 实现分享功能
    message.info(`分享文件：${file.Name}`);
  };

  const getFileDisplayPath = async (fileId: string): Promise<string> => {
    try {
      const response = await getFilePathById(fileId);
      if (response.code === 0) {
        const path = response.data.path.replace(/^\/root\//, '');
        return path || '根目录';
      }
      throw new Error(response.message || '获取路径失败');
    } catch (error) {
      console.error('获取文件路径失败:', error);
      return '获取路径失败';
    }
  };

  const columns = getColumns({
    sortField,
    sortOrder,
    onSortChange: handleSortChange,
    onFolderClick: handleFolderClick,
    onDownload: handleSingleDownload,
    onToggleFavorite: (record) => message.info(`收藏文件：${record.Name}`),
    onDelete: handleSingleDelete,
    onRename: handleRename,
    onShare: handleShare,
    isSearchMode,
    getFilePath: getFileDisplayPath,
  });

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
          <Button icon={<ReloadOutlined />} onClick={() => fetchFileList(pagination.current, pagination.pageSize)}>
            刷新
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
        <Space>
          <Input
            placeholder="搜索文件"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            suffix={
              <SearchOutlined
                style={{ cursor: 'pointer' }}
                onClick={handleSearch}
              />
            }
          />
          {isSearchMode && (
            <Button onClick={handleClearSearch}>
              清除搜索
            </Button>
          )}
        </Space>
      </div>

      <div className="mb-4">
        <Breadcrumb>
          {!isSearchMode ? (
            currentPath.map((item, index) => (
              <Breadcrumb.Item key={item.id || 'root'}>
                <a onClick={() => handleBreadcrumbClick(index)}>{item.name}</a>
              </Breadcrumb.Item>
            ))
          ) : (
            <>
              <Breadcrumb.Item>
                <a onClick={() => handleClearSearch()}>根目录</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>搜索结果</Breadcrumb.Item>
            </>
          )}
        </Breadcrumb>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading || isLoadingPath}
        pagination={pagination}
        rowKey="ID"
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => {
            const newSelectedRows = selectedRows.find(row => row.ID === record.ID)
              ? selectedRows.filter(row => row.ID !== record.ID)
              : [...selectedRows, record];
            setSelectedRows(newSelectedRows);
          },
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
        onCancel={() => setIsNewFolderModalVisible(false)}
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </Modal>

      <MoveFilesModal
        visible={isMoveModalVisible}
        onOk={handleMoveModalOk}
        onCancel={() => setIsMoveModalVisible(false)}
        moveTargetPath={moveTargetPath}
        moveTargetData={moveTargetData}
        onBreadcrumbClick={handleMoveTargetBreadcrumbClick}
        onFolderClick={handleMoveTargetFolderClick}
      />

      <Modal
        title="重命名"
        open={isRenameModalVisible}
        onOk={handleRenameOk}
        onCancel={() => setIsRenameModalVisible(false)}
      >
        <Input
          placeholder="请输入新的名称"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default CloudDrive; 