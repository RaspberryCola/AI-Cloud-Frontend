import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, message, Checkbox, Switch, Modal, Upload, Breadcrumb, Input, Card, Typography } from 'antd';
import { PlusOutlined, UploadOutlined, ArrowLeftOutlined, EyeOutlined, DeleteOutlined, InboxOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { getKnowledgeDocPage, KnowledgeDocItem, importCloudFileToKnowledge, uploadFileToKnowledge, getFileList, FileItem, getKnowledgeDetail, retrieveKnowledge, RetrieveItem } from '../services/api';

const { TextArea } = Input;
const { Text } = Typography;

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
  const [activeTab, setActiveTab] = React.useState('documents');
  const [queryText, setQueryText] = React.useState('');
  const [topK, setTopK] = React.useState(3);
  const [retrieveResults, setRetrieveResults] = React.useState<RetrieveItem[]>([]);
  const [retrieveLoading, setRetrieveLoading] = React.useState(false);

  const fetchKbDetail = async () => {
    if (!id) return;
    try {
      const res = await getKnowledgeDetail(id);
      if (res.code === 0) {
        setKbName(res.data.Name || '');
        setKbDescription(res.data.Description || '');
      }
    } catch (error) {
      console.error('获取知识库详情失败', error);
    }
  };

  const fetchDocList = async (page: number, pageSize: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getKnowledgeDocPage({
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

  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [selectedFileId, setSelectedFileId] = React.useState<string>('');
  const [fileList, setFileList] = React.useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = React.useState<{id: string, name: string}[]>([]);
  const [currentParentId, setCurrentParentId] = React.useState<string | undefined>(undefined);
  const [fileLoading, setFileLoading] = React.useState(false);

  const handleCreateNew = async (event: React.MouseEvent) => {
    event.preventDefault();
    showUploadModal();
  };

  const uploadFile = async (file: File) => {
    if (!id) return;
    try {
      const res = await uploadFileToKnowledge(id, file);
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
  };

  const handleImport = async () => {
    if (!id || !selectedFileId) return;
    try {
      const res = await importCloudFileToKnowledge({
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

  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);

  const beforeUpload = (file: File) => {
    uploadFile(file);
    return false; // 阻止默认上传行为
  };

  const showUploadModal = () => {
    setUploadModalVisible(true);
  };

  const showImportModal = () => {
    setImportModalVisible(true);
    setFileLoading(true);
    setCurrentPath([]);
    setCurrentParentId(undefined);
    getFileList({
      parent_id: undefined,
      page: 1,
      page_size: 999,
      sort: 'name:asc'
    }).then((res) => {
      if (res.code === 0) {
        setFileList(res.data.list);
      } else {
        message.error(res.message || '获取文件列表失败');
      }
    }).finally(() => {
      setFileLoading(false);
    });
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

  return (
    <div className="flex min-h-screen">
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
                    onClick={showImportModal}
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
                </Space>

                <div className="w-1/3">
                  <input 
                    type="text" 
                    placeholder="搜索文档..." 
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Table
          rowKey="ID"
          loading={loading}
          dataSource={data}
          className="bg-white rounded-lg shadow"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            className: "text-sm",
            size: "small"
          }}
          columns={[
          {
            title: <Checkbox />,
            dataIndex: 'checkbox',
            width: 30,
            render: () => <Checkbox />
          },
          {
            title: '#',
            dataIndex: 'index',
            width: 30,
            render: (_: any, __: any, index: number) => index + 1
          },
          {
            title: '名称',
            dataIndex: 'Title',
            ellipsis: true,
            width: 400
          },
          {
            title: '修改时间',
            dataIndex: 'UpdatedAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString()
          },
          {
            title: '解析状态',
            dataIndex: 'Status',
            width: 100,
            render: (status: number) => (
              <Tag color={{
                2: 'success',
                1: 'warning',
                0: 'error'
              }[status]} className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                {status === 2 ? '已完成' : 
                 status === 1 ? '处理中' : '失败'}
              </Tag>
            )
          },
          {
            title: '启用状态',
            dataIndex: 'Enabled',
            width: 100,
            render: (enabled: boolean) => (
              <Switch 
                checked={enabled}
                checkedChildren="启用" 
                unCheckedChildren="关闭"
              />
            )
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            render: () => (
              <Space size="small">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EyeOutlined />}
                  className="text-blue-500 hover:text-blue-600"
                />
                <Button 
                  type="text" 
                  size="small" 
                  icon={<DeleteOutlined />}
                  className="text-red-500 hover:text-red-600"
                  danger
                />
              </Space>
            )
          }
          ]}
        />

            </>
          ) : (
            <div className="flex h-full">
              {/* 左侧查询区域 */}
              <div className="w-1/2 pr-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">召回测试</h3>
                  <p className="text-gray-500 mb-4">根据给定的查询文本测试知识的召回效果。</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">召回数量 (top_k)</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">查询文本</label>
                  <TextArea
                    rows={8}
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="请输入查询文本..."
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="primary" 
                    loading={retrieveLoading}
                    onClick={async () => {
                      if (!id || !queryText) {
                        message.warning('请输入查询文本');
                        return;
                      }
                      try {
                        setRetrieveLoading(true);
                        const res = await retrieveKnowledge({
                          kb_id: id,
                          query: queryText,
                          top_k: topK
                        });
                        if (res.code === 0) {
                          setRetrieveResults(res.data);
                        } else {
                          message.error(res.message || '召回测试失败');
                        }
                      } catch (error) {
                        message.error('召回测试失败');
                      } finally {
                        setRetrieveLoading(false);
                      }
                    }}
                  >
                    测试
                  </Button>
                </div>
              </div>

              {/* 右侧结果区域 */}
              <div className="w-1/2 pl-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    {retrieveResults.length > 0 ? `${retrieveResults.length}个召回段落` : '召回结果'}
                  </h3>
                </div>

                <div className="space-y-4">
                  {retrieveResults.map((item, index) => (
                    <Card key={item.id} className="shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <Text strong>Chunk-{String(index + 1).padStart(2, '0')}</Text>
                        <Text type="secondary">得分: {item.score.toFixed(4)}</Text>
                      </div>
                      <div className="mb-2">
                        <Text>{item.content}</Text>
                      </div>
                      <div>
                        <Text type="secondary" className="text-sm">
                          {item.document_name} / index-{item.index}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'documents' && (
          <Modal
            title="上传文件"
            open={uploadModalVisible}
            onCancel={() => setUploadModalVisible(false)}
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
        )}

        <Modal
          title="导入云盘文件"
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          onOk={handleImport}
          okText="导入"
          cancelText="取消"
          width={1000}
        >
          <div className="p-4">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item>
                <a onClick={() => {
                  setCurrentPath([]);
                  setCurrentParentId(undefined);
                  setFileLoading(true);
                  getFileList({
                    parent_id: undefined,
                    page: 1,
                    page_size: 999,
                    sort: 'name:asc'
                  }).then((res) => {
                    if (res.code === 0) {
                      setFileList(res.data.list);
                    } else {
                      message.error(res.message || '获取文件列表失败');
                    }
                  }).finally(() => {
                    setFileLoading(false);
                  });
                }}>根目录</a>
              </Breadcrumb.Item>
              {currentPath.map((item, index) => (
                <Breadcrumb.Item key={item.id}>
                  <a onClick={() => {
                    const newPath = currentPath.slice(0, index + 1);
                    setCurrentPath(newPath);
                    setCurrentParentId(item.id);
                    setFileLoading(true);
                    getFileList({
                      parent_id: item.id,
                      page: 1,
                      page_size: 999,
                      sort: 'name:asc'
                    }).then((res) => {
                      if (res.code === 0) {
                        setFileList(res.data.list);
                      } else {
                        message.error(res.message || '获取文件列表失败');
                      }
                    }).finally(() => {
                      setFileLoading(false);
                    });
                  }}>{item.name}</a>
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
                  setSelectedFileId(selectedRowKeys[0] as string);
                }
              }}
              columns={[
                {
                  title: '名称',
                  dataIndex: 'Name',
                  width: 500,
                  render: (text: string, record: FileItem) => (
                    <div className="flex items-center">
                      {record.IsDir ? (
                        <FolderOutlined 
                          className="mr-2 text-yellow-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPath([...currentPath, {id: record.ID, name: record.Name}]);
                            setCurrentParentId(record.ID);
                            setFileLoading(true);
                            getFileList({
                              parent_id: record.ID,
                              page: 1,
                              page_size: 999,
                              sort: 'name:asc'
                            }).then((res) => {
                              if (res.code === 0) {
                                setFileList(res.data.list);
                              } else {
                                message.error(res.message || '获取文件列表失败');
                              }
                            }).finally(() => {
                              setFileLoading(false);
                            });
                          }}
                        />
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
      </div>
    </div>
  );
};

export default KnowledgeDetail;
