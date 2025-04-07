import React from 'react';
import { message, Modal } from 'antd';
import { knowledgeService } from '../services/knowledgeService';
import { KnowledgeDocItem } from '../types/knowledge';

export const useKnowledgeDetail = (id: string | undefined) => {
  const [loading, setLoading] = React.useState(false);
  const [kbName, setKbName] = React.useState('');
  const [kbDescription, setKbDescription] = React.useState('');
  const [data, setData] = React.useState<KnowledgeDocItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [activeTab, setActiveTab] = React.useState('documents');
  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);
  const [selectedFileId, setSelectedFileId] = React.useState('');
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);

  const fetchKbDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await knowledgeService.getKnowledgeDetail(id);
      if (res.code === 0) {
        setKbName(res.data.Name || '');
        setKbDescription(res.data.Description || '');
      }
    } catch (error) {
      console.error('获取知识库详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocList = async (page: number, pageSize: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await knowledgeService.getKnowledgeDocPage({
        page,
        page_size: pageSize,
        kb_id: id
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      } else {
        message.error(res.message || '获取文档列表失败');
      }
    } catch (error) {
      message.error('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchKbDetail();
    fetchDocList(currentPage, pageSize);
  }, [id, currentPage, pageSize]);

  const handleImport = async () => {
    if (!id || !selectedFileId) return;
    try {
      const res = await knowledgeService.importCloudFileToKnowledge({
        file_id: selectedFileId,
        kb_id: id
      });
      if (res.code === 0) {
        message.success('导入文件成功');
        setImportModalVisible(false);
        fetchDocList(currentPage, pageSize);
      } else {
        message.error(res.message || '导入文件失败');
      }
    } catch (error) {
      message.error('导入文件失败');
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return false;
    try {
      const res = await knowledgeService.uploadFileToKnowledge({
        kb_id: id,
        file: file
      });
      if (res.code === 0) {
        message.success('上传文件成功');
        setUploadModalVisible(false);
        fetchDocList(currentPage, pageSize);
      } else {
        message.error(res.message || '上传文件失败');
      }
    } catch (error) {
      message.error('上传文件失败');
    }
    return false;
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const onSelectChange = (newSelectedRowKeys: string[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个文档吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await knowledgeService.deleteKnowledgeDocs({
            doc_ids: selectedRowKeys
          });
          if (res.code === 0) {
            message.success('删除成功');
            setSelectedRowKeys([]);
            fetchDocList(currentPage, pageSize);
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  return {
    loading,
    kbName,
    kbDescription,
    data,
    total,
    currentPage,
    pageSize,
    activeTab,
    importModalVisible,
    uploadModalVisible,
    selectedFileId,
    selectedRowKeys,
    setActiveTab,
    setImportModalVisible,
    setUploadModalVisible,
    setSelectedFileId,
    handleImport,
    handleUpload,
    handlePageChange,
    formatFileSize,
    onSelectChange,
    handleBatchDelete,
  };
};