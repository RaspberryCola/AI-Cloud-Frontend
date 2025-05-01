import React from 'react';
import { message, Modal, Upload } from 'antd'; // Import Upload
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
    // Close modal immediately
    setImportModalVisible(false); 
    message.info('文件导入任务已开始，请稍后刷新查看...'); // Inform user processing started
    try {
      const res = await knowledgeService.importCloudFileToKnowledge({
        file_id: selectedFileId,
        kb_id: id
      });
      if (res.code === 0) {
        // Refresh list after API call (might not show immediately)
        fetchDocList(currentPage, pageSize); 
        // Optional: Add a success message confirming API call success, 
        // but the main feedback is the 'info' message above.
        // message.success('导入请求已发送'); 
      } else {
        message.error(res.message || '导入文件失败');
      }
    } catch (error) {
      message.error('导入文件失败');
    }
  };

  // Make the function synchronous to match Ant Design's beforeUpload signature expectation
  const handleUpload = (file: File) => { 
    if (!id) return false; // Return false if no ID, preventing upload attempt
    // Close modal immediately
    setUploadModalVisible(false);
    message.info('文件上传任务已开始，请稍后刷新查看...'); // Inform user processing started

    // Initiate the async call but don't await it here
    knowledgeService.uploadFileToKnowledge({ 
      kb_id: id,
      file: file
    }).then(res => {
      // Handle success: Refresh list after API call completes
      if (res.code === 0) { 
        fetchDocList(currentPage, pageSize);
        // Optional: Add a success message confirming API call success
        // message.success('上传请求已发送');
      } else {
        // Handle API error after completion
        message.error(res.message || '上传文件失败'); 
      }
    }).catch(error => {
      // Handle network/unexpected errors after completion
      message.error('上传文件失败'); 
      console.error('Upload error:', error); // Log error for debugging
    });

    // Return Upload.LIST_IGNORE immediately to prevent default behavior without signaling error
    return Upload.LIST_IGNORE; 
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
          if (!id) return false;
          
          const res = await knowledgeService.deleteKnowledgeDocs({
            kb_id: id,
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

  // Function to handle single document deletion
  const handleDeleteDocument = (docId: string) => {
    if (!id) return;

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这个文档吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await knowledgeService.deleteKnowledgeDocs({
            kb_id: id,
            doc_ids: [docId] // Pass the single docId in an array
          });
          if (res.code === 0) {
            message.success('删除成功');
            // Refresh the list - consider resetting to page 1 if the current page becomes empty
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
    handleDeleteDocument, // Expose the new function
  };
};
