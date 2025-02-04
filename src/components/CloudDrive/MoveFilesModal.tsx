import React from 'react';
import { Modal, Breadcrumb, Table, Space } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import type { FileItem, BreadcrumbItem } from '../../types/cloudDrive';

interface MoveFilesModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  moveTargetPath: BreadcrumbItem[];
  moveTargetData: FileItem[];
  onBreadcrumbClick: (index: number) => void;
  onFolderClick: (record: FileItem) => void;
}

const MoveFilesModal: React.FC<MoveFilesModalProps> = ({
  visible,
  onOk,
  onCancel,
  moveTargetPath,
  moveTargetData,
  onBreadcrumbClick,
  onFolderClick,
}) => {
  return (
    <Modal
      title="移动到"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
    >
      <div className="space-y-4">
        <Breadcrumb>
          {moveTargetPath.map((item, index) => (
            <Breadcrumb.Item key={item.id || '根目录'}>
              <a onClick={() => onBreadcrumbClick(index)}>{item.name}</a>
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
            onClick: () => onFolderClick(record),
          })}
        />
      </div>
    </Modal>
  );
};

export default MoveFilesModal; 