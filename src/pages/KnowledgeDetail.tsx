import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, message, Input, Table, Modal } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

import DocumentList from '../components/KnowledgeDetail/DocumentList';
import RetrieveTest from '../components/KnowledgeDetail/RetrieveTest';
import KnowledgeChat from '../components/KnowledgeDetail/KnowledgeChat'; // Import the new chat component
import ImportModal from '../components/KnowledgeDetail/ImportModal';
import UploadModal from '../components/KnowledgeDetail/UploadModal';

import { knowledgeService } from '../services/knowledgeService';
import {
  KnowledgeDocItem
} from '../types/knowledge';

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [kbName, setKbName] = React.useState('');
  const [kbDescription, setKbDescription] = React.useState('');
  const [data, setData] = React.useState<KnowledgeDocItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [activeTab, setActiveTab] = React.useState('documents'); // Default tab
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
    }finally {
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

  const handleCreateNew = (event: React.MouseEvent) => {
    event.preventDefault();
    setUploadModalVisible(true);
  };

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

  const handleBack = () => {
    navigate('/knowledge-base');
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
            // 刷新文档列表
            fetchDocList(currentPage, pageSize);
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className="flex">
      {/* 左侧导航栏 */}
      <div className="w-60 p-4 border-r border-gray-200 bg-gray-50">
        <div className="flex flex-col items-start mb-4 pl-2">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 text-center">{kbDescription || '知识库文档管理'}</p>
        </div>

        <div className="space-y-1">
          <div
            className={`px-3 py-2 rounded-md cursor-pointer ${activeTab === 'documents' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('documents')}
          >
            文档
          </div>
          <div
            className={`px-3 py-2 rounded-md cursor-pointer ${activeTab === 'retrieve' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('retrieve')}
          >
            召回测试
          </div>
          <div
            className={`px-3 py-2 rounded-md cursor-pointer ${activeTab === 'chat' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('chat')}
          >
            知识库对话
          </div>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            <span
              className="text-gray-800 hover:bg-gray-100 cursor-pointer rounded transition-colors"
              onClick={handleBack}
            >
              根目录
            </span>
            &nbsp;/ {kbName || '加载中...'}
          </h2>

          {activeTab === 'documents' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <Space>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => setImportModalVisible(true)}
                    className="h-8"
                  >
                    导入云盘文件
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateNew}
                    className="h-8"
                  >
                    上传新文件
                  </Button>
                  {/* 添加批量删除按钮 */}
                  {selectedRowKeys.length > 0 && (
                    <Button
                      danger
                      onClick={handleBatchDelete}
                    >
                      批量删除
                    </Button>
                  )}
                </Space>

                <div className="w-1/3">
                  <Input
                    placeholder="搜索文档..."
                    className="w-full"
                  />
                </div>
              </div>

              <DocumentList
                loading={loading}
                data={data}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                rowSelection={rowSelection}
              />
            </>
          ) : activeTab === 'retrieve' ? (
            <RetrieveTest kbId={id!} />
          ) : (
            <KnowledgeChat kbId={id!} /> // Render the chat component
          )}
        </div>

        <UploadModal
          visible={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          beforeUpload={handleUpload}
        />

        <ImportModal
          visible={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          onOk={handleImport}
          selectedFileId={selectedFileId}
          onSelectFile={setSelectedFileId}
          formatFileSize={formatFileSize}
        />
      </div>
    </div>
  );
};

export default KnowledgeDetail;
