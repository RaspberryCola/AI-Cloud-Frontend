import React from 'react';
import { Space, Button, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DownloadOutlined,
  StarOutlined,
  DeleteOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  SwapOutlined,
  MoreOutlined,
  EditOutlined,
  ShareAltOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFileIcon } from '../../utils/fileIcons';
import { formatFileSize } from '../../utils/fileUtils';
import type { FileItem } from '../../types/cloudDrive';

// 添加路径缓存
const pathCache = new Map<string, string>();

// 路径列组件
const PathColumn: React.FC<{
  record: FileItem;
  getFilePath?: (fileId: string) => Promise<string>;
}> = React.memo(({ record, getFilePath }) => {
  const [path, setPath] = React.useState<string>(() => pathCache.get(record.ID) || '');
  const [loading, setLoading] = React.useState(!pathCache.has(record.ID));

  React.useEffect(() => {
    if (!pathCache.has(record.ID) && getFilePath) {
      const fetchPath = async () => {
        try {
          const pathStr = await getFilePath(record.ID);
          setPath(pathStr);
          pathCache.set(record.ID, pathStr);
        } catch (error) {
          console.error('获取路径失败:', error);
          const errorPath = '获取路径失败';
          setPath(errorPath);
          pathCache.set(record.ID, errorPath);
        } finally {
          setLoading(false);
        }
      };
      fetchPath();
    }
  }, [record.ID, getFilePath]);

  if (loading) {
    return <span className="text-gray-400">加载中...</span>;
  }

  return (
    <Tooltip title={path} mouseEnterDelay={0.5}>
      <span className="text-gray-500 truncate inline-block max-w-[280px]">{path}</span>
    </Tooltip>
  );
});

export const getColumns = ({
  sortField,
  sortOrder,
  onSortChange,
  onFolderClick,
  onDownload,
  onToggleFavorite,
  onDelete,
  onRename,
  onShare,
  isSearchMode,
  getFilePath,
}: {
  sortField: 'name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'updated_at') => void;
  onFolderClick: (record: FileItem) => void;
  onDownload: (record: FileItem) => void;
  onToggleFavorite: (record: FileItem) => void;
  onDelete: (record: FileItem) => void;
  onRename: (record: FileItem) => void;
  onShare: (record: FileItem) => void;
  isSearchMode: boolean;
  getFilePath?: (fileId: string) => Promise<string>;
}): ColumnsType<FileItem> => {
  const columns: ColumnsType<FileItem> = [
    {
      title: (
        <Space size={4}>
          <span>名称</span>
          <Button
            type="text"
            size="small"
            className="px-0 mx-0"
            onClick={(e) => {
              e.stopPropagation();
              onSortChange('name');
            }}
            icon={
              sortField === 'name' ? (
                sortOrder === 'asc' ? (
                  <CaretUpOutlined className="text-blue-500" />
                ) : (
                  <CaretDownOutlined className="text-blue-500" />
                )
              ) : (
                <SwapOutlined className="text-gray-400" />
              )
            }
          />
        </Space>
      ),
      dataIndex: 'Name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {getFileIcon(text, record.IsDir)}
          <div
            className="px-3 py-1.2 rounded cursor-pointer hover:bg-gray-100 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              if (record.IsDir) {
                onFolderClick(record);
              }
            }}
          >
            {text}
          </div>
        </Space>
      ),
    }
  ];

  // 在搜索模式下添加路径列
  if (isSearchMode) {
    columns.push({
      title: '位置',
      dataIndex: 'ID',
      key: 'path',
      width: 300,
      render: (_: unknown, record: FileItem) => (
        <PathColumn record={record} getFilePath={getFilePath} />
      ),
    });
  }

  // 添加其他列
  columns.push(
    {
      title: '大小',
      dataIndex: 'Size',
      key: 'size',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: (
        <Space size={4}>
          <span>修改时间</span>
          <Button
            type="text"
            size="small"
            className="px-0 mx-0"
            onClick={(e) => {
              e.stopPropagation();
              onSortChange('updated_at');
            }}
            icon={
              sortField === 'updated_at' ? (
                sortOrder === 'asc' ? (
                  <CaretUpOutlined className="text-blue-500" />
                ) : (
                  <CaretDownOutlined className="text-blue-500" />
                )
              ) : (
                <SwapOutlined className="text-gray-400" />
              )
            }
          />
        </Space>
      ),
      dataIndex: 'UpdatedAt',
      key: 'updatedAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: FileItem) => {
        const moreItems: MenuProps['items'] = [
          {
            key: 'rename',
            icon: <EditOutlined />,
            label: '重命名',
            onClick: () => onRename(record),
          },
          {
            key: 'share',
            icon: <ShareAltOutlined />,
            label: '分享',
            onClick: () => onShare(record),
          },
          {
            key: 'favorite',
            icon: <StarOutlined />,
            label: '收藏',
            onClick: () => onToggleFavorite(record),
          },
        ];

        return (
          <Space size="middle">
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(record);
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
                  onDelete(record);
                }}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: moreItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </Space>
        );
      },
    }
  );

  return columns;
}; 