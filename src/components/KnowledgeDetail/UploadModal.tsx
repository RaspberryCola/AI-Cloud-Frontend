import React from 'react';
import { Modal, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  beforeUpload: (file: File) => boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  beforeUpload,
}) => {
  return (
    <Modal
      title="上传文件"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Upload.Dragger
        name="file"
        multiple={false}
        beforeUpload={beforeUpload}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">支持单个文件上传</p>
      </Upload.Dragger>
    </Modal>
  );
};

export default UploadModal;