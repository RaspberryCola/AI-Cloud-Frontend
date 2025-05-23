import React, { useEffect } from 'react';
import { Modal, Table, Breadcrumb, message } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import type { FileItem } from '../../types/cloudDrive';
//import { getFileList } from '../../services/api';

import { cloudDriveService } from '../../services/cloudDriveService';

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  selectedFileId: string;
  onSelectFile: (fileId: string) => void;
  formatFileSize: (size: number) => string;
}

const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onCancel,
  onOk,
  selectedFileId,
  onSelectFile,
  formatFileSize,
}) => {
  const [fileList, setFileList] = React.useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = React.useState<{id: string, name: string}[]>([]);
  const [currentParentId, setCurrentParentId] = React.useState<string | undefined>(undefined);
  const [fileLoading, setFileLoading] = React.useState(false);

  useEffect(() => {
    if (visible) {
      fetchFileList(currentParentId);
    }
  }, [visible, currentParentId]);

  const fetchFileList = async (parentId?: string) => {
    setFileLoading(true);
    try {
      const res = await cloudDriveService.getFileList({
        parent_id: parentId,
        page: 1,
        page_size: 999,
        sort: 'name:asc'
      });
      if (res.code === 0) {
        setFileList(res.data.list);
      } else {
        message.error(res.message || '获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <Modal
      title="导入云盘文件"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText="导入"
      cancelText="取消"
      width={1000}
    >
      <div className="p-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item onClick={() => {
            setCurrentParentId(undefined);
            setCurrentPath([]);
          }}>
            全部文件
          </Breadcrumb.Item>
          {currentPath.map((item) => (
            <Breadcrumb.Item 
              key={item.id}
              onClick={() => {
                setCurrentParentId(item.id);
                setCurrentPath(currentPath.slice(0, currentPath.findIndex(p => p.id === item.id) + 1));
              }}
            >
              {item.name}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Table
          rowKey="ID"
          loading={fileLoading}
          dataSource={fileList}
          pagination={false}
          scroll={{ y: 400 }}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedFileId ? [selectedFileId] : [],
            onChange: (selectedRowKeys) => {
              onSelectFile(selectedRowKeys[0] as string);
            }
          }}
          columns={[
            {
              title: '名称',
              dataIndex: 'Name',
              width: 500,
              render: (text: string, record: FileItem) => (
                <div 
                  className="flex items-center"
                  onDoubleClick={() => {
                    if (record.IsDir) {
                      setCurrentParentId(record.ID);
                      setCurrentPath([...currentPath, {id: record.ID, name: record.Name}]);
                    }
                  }}
                >
                  {record.IsDir ? (
                    <FolderOutlined className="mr-2 text-yellow-500" />
                  ) : (
                    <FileOutlined className="mr-2 text-blue-500" />
                  )}
                  {text}
                </div>
              )
            },
            {
              title: '大小',
              dataIndex: 'Size',
              width: 150,
              render: (size: number, record: FileItem) => (
                record.IsDir ? '-' : formatFileSize(size)
              )
            },
            {
              title: '修改时间',
              width: 200,
              dataIndex: 'UpdatedAt',
              render: (text: string) => new Date(text).toLocaleString()
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default ImportModal;
