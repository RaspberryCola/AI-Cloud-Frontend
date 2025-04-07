import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Input } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

import DocumentList from '../components/KnowledgeDetail/DocumentList';
import RetrieveTest from '../components/KnowledgeDetail/RetrieveTest';
import KnowledgeChat from '../components/KnowledgeDetail/KnowledgeChat'; 
import ImportModal from '../components/KnowledgeDetail/ImportModal';
import UploadModal from '../components/KnowledgeDetail/UploadModal';
import { useKnowledgeDetail } from '../hooks/useKnowledgeDetail'; 

const KnowledgeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
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
  } = useKnowledgeDetail(id);

  
  const handleCreateNew = (event: React.MouseEvent) => {
    event.preventDefault();
    setUploadModalVisible(true);
  };

  const handleBack = () => {
    navigate('/knowledge-base');
  };

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
