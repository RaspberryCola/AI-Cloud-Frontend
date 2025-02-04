import React from 'react';
import { Space, Button, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFileIcon } from '../../utils/fileIcons';
import { formatFileSize } from '../../utils/fileUtils';
import type { FileItem } from '../../types/cloudDrive';

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
}) => [
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
  },
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
          onClick: () => {
            onRename(record);
          },
        },
        {
          key: 'share',
          icon: <ShareAltOutlined />,
          label: '分享',
          onClick: () => {
            onShare(record);
          },
        },
        {
          key: 'favorite',
          icon: <StarOutlined />,
          label: '收藏',
          onClick: () => {
            onToggleFavorite(record);
          },
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
  },
]; 