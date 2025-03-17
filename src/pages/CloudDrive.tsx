import React, { useState, useEffect } from 'react';
import { Table, Modal, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileToolbar } from '../components/CloudDrive/FileToolbar';
import { FileBreadcrumb } from '../components/CloudDrive/FileBreadcrumb';
import MoveFilesModal from '../components/CloudDrive/MoveFilesModal';
import { getColumns } from '../components/CloudDrive/columns';
import { useFileOperations } from '../hooks/useFileOperations';
import { RootState } from '../store';
import { setCurrentPath, setSelectedRows, setSortField, setSortOrder, setSearchKey, setIsSearchMode } from '../store/cloudDriveSlice';
import type { FileItem, BreadcrumbItem } from '../types/cloudDrive';

const CloudDrive: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data,
    loading,
    pagination,
    selectedRows,
    sortField,
    sortOrder,
    isLoadingPath,
    currentPath,
    isSearchMode,
  } = useSelector((state: RootState) => state.cloudDrive);

  const {
    fetchFileList,
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleMove,
    handleDownload,
    handleRename,
    getFilePath,
    handleSearch,
    handleClearSearch,
    getFileList,
  } = useFileOperations();

  const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [moveTargetPath, setMoveTargetPath] = useState<BreadcrumbItem[]>([{ id: null, name: '根目录' }]);
  const [moveTargetData, setMoveTargetData] = useState<FileItem[]>([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    // 从 URL 中解析路径
    const pathParam = new URLSearchParams(location.search).get('path');
    if (pathParam) {
      try {
        const pathData = JSON.parse(decodeURIComponent(pathParam));
        dispatch(setCurrentPath(pathData));
      } catch (e) {
        dispatch(setCurrentPath([{ id: null, name: '根目录' }]));
      }
    } else {
      dispatch(setCurrentPath([{ id: null, name: '根目录' }]));
    }
  }, [location.search]);

  useEffect(() => {
    fetchFileList();
  }, [currentPath, sortField, sortOrder]);

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        handleUpload(files);
      }
    };
    input.click();
  };

  const handleNewFolderClick = () => {
    setNewFolderName('');
    setIsNewFolderModalVisible(true);
  };

  const handleNewFolderOk = async () => {
    const success = await handleCreateFolder(newFolderName);
    if (success) {
      setIsNewFolderModalVisible(false);
    }
  };

  const handleBatchDownload = async () => {
    for (const file of selectedRows) {
      await handleDownload(file);
    }
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRows.length} 个文件/文件夹吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleDelete(selectedRows.map(file => file.ID)),
    });
  };

  const handleMoveClick = () => {
    setSelectedFolderId(undefined);
    setMoveTargetPath([{ id: null, name: '根目录' }]);
    setIsMoveModalVisible(true);
    // 获取根目录下的文件夹列表
    getFileList({
      parent_id: undefined,
      page: 1,
      page_size: 999,
      sort: `${sortField}:${sortOrder}`,
    }).then((response: any) => {
      if (response.code === 0) {
        // 只显示文件夹
        setMoveTargetData(response.data.list.filter((item: FileItem) => item.IsDir));
      }
    });
  };

  const handleMoveModalOk = async () => {
    const success = await handleMove(
      selectedRows.map(file => file.ID),
      selectedFolderId
    );
    if (success) {
      setIsMoveModalVisible(false);
    }
  };

  const handleRenameClick = (file: FileItem) => {
    setRenameFile(file);
    setNewFileName(file.Name);
    setIsRenameModalVisible(true);
  };

  const handleRenameOk = async () => {
    if (!renameFile) return;
    const success = await handleRename(renameFile.ID, newFileName);
    if (success) {
      setIsRenameModalVisible(false);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = currentPath.slice(0, index + 1);
    const encodedPath = encodeURIComponent(JSON.stringify(newPath));
    navigate(`?path=${encodedPath}`);
  };

  const handleFolderClick = async (record: FileItem) => {
    if (record.IsDir) {
      const fullPath = await getFilePath(record.ID);
      const encodedPath = encodeURIComponent(JSON.stringify(fullPath));
      navigate(`?path=${encodedPath}`);
      if (isSearchMode) {
        handleClearSearch();
      }
    }
  };

  const handleMoveTargetFolderClick = async (record: FileItem) => {
    setSelectedFolderId(record.ID);
    setMoveTargetPath([...moveTargetPath, { id: record.ID, name: record.Name }]);
    // 获取点击的文件夹下的子文件夹列表
    const response = await getFileList({
      parent_id: record.ID,
      page: 1,
      page_size: 999,
      sort: `${sortField}:${sortOrder}`,
    });
    if (response.code === 0) {
      // 只显示文件夹
      setMoveTargetData(response.data.list.filter((item: FileItem) => item.IsDir));
    }
  };

  const handleMoveTargetBreadcrumbClick = async (index: number) => {
    const newPath = moveTargetPath.slice(0, index + 1);
    setMoveTargetPath(newPath);
    const targetFolder = newPath[newPath.length - 1];
    setSelectedFolderId(targetFolder.id || undefined);
    // 获取面包屑导航点击后的文件夹列表
    const response = await getFileList({
      parent_id: targetFolder.id || undefined,
      page: 1,
      page_size: 999,
      sort: `${sortField}:${sortOrder}`,
    });
    if (response.code === 0) {
      // 只显示文件夹
      setMoveTargetData(response.data.list.filter((item: FileItem) => item.IsDir));
    }
  };

  const handleSortChange = (field: 'name' | 'updated_at') => {
    if (sortField !== field) {
      dispatch(setSortField(field));
      dispatch(setSortOrder('asc'));
    } else {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    }
  };

  const handleTableChange = (newPagination: any) => {
    fetchFileList(newPagination.current, newPagination.pageSize);
  };

  const columns = getColumns({
    sortField,
    sortOrder,
    onSortChange: handleSortChange,
    onFolderClick: handleFolderClick,
    onDownload: handleDownload,
    onToggleFavorite: (record) => console.log('收藏文件：', record.Name),
    onDelete: (file) => handleDelete([file.ID]),
    onRename: handleRenameClick,
    onShare: (file) => console.log('分享文件：', file.Name),
    isSearchMode: false,
    getFilePath: async (fileId) => {
      const path = await getFilePath(fileId);
      return path.map(item => item.name).join('/');
    },
  });

  return (
    <div className="space-y-4">
      <FileToolbar
        onUpload={handleUploadClick}
        onNewFolder={handleNewFolderClick}
        onRefresh={() => fetchFileList()}
        onBatchDownload={handleBatchDownload}
        onMove={handleMoveClick}
        onBatchDelete={handleBatchDelete}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />

      <FileBreadcrumb
        onBreadcrumbClick={handleBreadcrumbClick}
        onClearSearch={handleClearSearch}
      />

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
            dispatch(setSelectedRows(newSelectedRows));
          },
        })}
        rowSelection={{
          selectedRowKeys: selectedRows.map((row) => row.ID),
          onChange: (_, rows) => dispatch(setSelectedRows(rows)),
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