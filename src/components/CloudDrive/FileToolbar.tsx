import React, { useState } from 'react';
import { Button, Space, Input } from 'antd';
import {
  UploadOutlined,
  FolderAddOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RetweetOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSearchKey } from '../../store/cloudDriveSlice';

interface FileToolbarProps {
  onUpload: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onBatchDownload: () => void;
  onMove: () => void;
  onBatchDelete: () => void;
  onSearch: (key: string) => void;
  onClearSearch: () => void;
}

export const FileToolbar: React.FC<FileToolbarProps> = ({
  onUpload,
  onNewFolder,
  onRefresh,
  onBatchDownload,
  onMove,
  onBatchDelete,
  onSearch,
  onClearSearch,
}) => {
  const dispatch = useDispatch();
  const { selectedRows, searchKey, isSearchMode } = useSelector((state: RootState) => state.cloudDrive);

  const handleSearch = () => {
    if (searchKey.trim()) {
      onSearch(searchKey);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Space>
        <Button type="primary" icon={<UploadOutlined />} onClick={onUpload}>
          上传文件
        </Button>
        <Button icon={<FolderAddOutlined />} onClick={onNewFolder}>
          新建文件夹
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          刷新
        </Button>
        {selectedRows.length > 0 && (
          <>
            <Button icon={<DownloadOutlined />} onClick={onBatchDownload}>
              批量下载
            </Button>
            <Button icon={<RetweetOutlined />} onClick={onMove}>
              移动到
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={onBatchDelete}>
              批量删除
            </Button>
          </>
        )}
      </Space>
      <Space>
        <Input
          placeholder="搜索文件"
          value={searchKey}
          onChange={(e) => dispatch(setSearchKey(e.target.value))}
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
          <Button onClick={onClearSearch}>
            清除搜索
          </Button>
        )}
      </Space>
    </div>
  );
}; 