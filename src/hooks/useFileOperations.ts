import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getFileList,
  createFolder,
  deleteFile,
  downloadFile,
  moveFiles,
  uploadFile,
  searchFiles,
  renameFile as renameFileApi,
  getFilePathById,
  getFileIdPath,
} from '../services/api';
import { FileItem, BreadcrumbItem } from '../types/cloudDrive';
import { RootState } from '../store';
import {
  setData,
  setLoading,
  setPagination,
  setSelectedRows,
  setIsSearchMode,
  setSearchKey,
  setCurrentPath,
  setIsLoadingPath,
} from '../store/cloudDriveSlice';
import { downloadBlob } from '../utils/fileUtils';

export const useFileOperations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentPath,
    pagination,
    sortField,
    sortOrder,
    searchKey,
    isSearchMode,
  } = useSelector((state: RootState) => state.cloudDrive);

  const fetchFileList = async (page = pagination.current, pageSize = pagination.pageSize, isSearch = isSearchMode) => {
    try {
      dispatch(setLoading(true));
      let response;
      
      if (isSearch && searchKey.trim()) {
        response = await searchFiles({
          key: searchKey.trim(),
          page,
          page_size: pageSize,
          sort: `${sortField === 'name' ? 'name' : 'updated_at'}:${sortOrder}`,
        });
      } else {
        const currentFolder = currentPath[currentPath.length - 1];
        response = await getFileList({
          parent_id: currentFolder.id || undefined,
          page,
          page_size: pageSize,
          sort: `${sortField === 'name' ? 'name' : 'updated_at'}:${sortOrder}`,
        });
      }

      if (response.code === 0) {
        dispatch(setData(response.data.list));
        dispatch(setPagination({
          ...pagination,
          current: page,
          total: response.data.total,
        }));
      } else {
        message.error(response.message || '获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const currentFolder = currentPath[currentPath.length - 1];
    const parentId = currentFolder.id || undefined;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        message.loading({ content: `正在上传: ${file.name}`, key: file.name });
        
        const response = await uploadFile(file, parentId);
        if (response.code === 0) {
          message.success({ content: `${file.name} 上传成功`, key: file.name });
        } else {
          message.error({ content: `${file.name} ${response.message || '上传失败'}`, key: file.name });
        }
      }
      fetchFileList();
    } catch (error) {
      message.error('上传失败');
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!name.trim()) {
      message.warning('请输入文件夹名称');
      return false;
    }

    try {
      const currentFolder = currentPath[currentPath.length - 1];
      const response = await createFolder({
        name: name.trim(),
        parent_id: currentFolder.id || undefined,
      });

      if (response.code === 0) {
        message.success('创建文件夹成功');
        fetchFileList();
        return true;
      } else {
        message.error(response.message || '创建文件夹失败');
        return false;
      }
    } catch (error) {
      message.error('创建文件夹失败');
      return false;
    }
  };

  const handleDelete = async (fileIds: string[]) => {
    try {
      await Promise.all(fileIds.map(id => deleteFile(id)));
      message.success('删除成功');
      dispatch(setSelectedRows([]));
      fetchFileList();
      return true;
    } catch (error) {
      message.error('删除失败');
      return false;
    }
  };

  const handleMove = async (fileIds: string[], targetId?: string) => {
    try {
      const response = await moveFiles({
        files_pid: fileIds,
        target_pid: targetId,
      });

      if (response.code === 0) {
        message.success('移动成功');
        dispatch(setSelectedRows([]));
        fetchFileList();
        return true;
      } else {
        message.error(response.message || '移动失败');
        return false;
      }
    } catch (error) {
      message.error('移动失败');
      return false;
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      if (file.IsDir) {
        message.loading({ content: `正在准备下载文件夹：${file.Name}`, key: file.ID });
      } else {
        message.loading({ content: `正在下载：${file.Name}`, key: file.ID });
      }
      
      const blob = await downloadFile(file.ID);
      downloadBlob(blob, file.Name, file.MIMEType);
      message.success({ content: '下载成功', key: file.ID });
      return true;
    } catch (error) {
      message.error({ content: '下载失败', key: file.ID });
      return false;
    }
  };

  const handleRename = async (fileId: string, newName: string) => {
    if (!newName.trim()) {
      message.warning('请输入文件名称');
      return false;
    }

    try {
      const response = await renameFileApi({
        file_id: fileId,
        new_name: newName.trim()
      });
      
      if (response.code === 0) {
        message.success('重命名成功');
        fetchFileList();
        return true;
      } else {
        message.error(response.message || '重命名失败');
        return false;
      }
    } catch (error) {
      message.error('重命名失败');
      return false;
    }
  };

  const getFilePath = async (fileId: string): Promise<BreadcrumbItem[]> => {
    dispatch(setIsLoadingPath(true));
    try {
      const [pathResponse, idPathResponse] = await Promise.all([
        getFilePathById(fileId),
        getFileIdPath(fileId)
      ]);

      if (pathResponse.code === 0 && idPathResponse.code === 0) {
        const pathParts = pathResponse.data.path.split('/').filter(Boolean);
        const idParts = idPathResponse.data.id_path.split('/').filter(Boolean);
        
        const newPath = [
          { id: null, name: '根目录' },
          ...pathParts.slice(1).map((name: string, index: number) => ({
            id: idParts[index + 1],
            name: name
          }))
        ];
        return newPath;
      }
      throw new Error(pathResponse.message || idPathResponse.message || '获取路径失败');
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
        navigate('/login');
      } else {
        message.error('获取文件路径失败');
      }
      return [{ id: null, name: '根目录' }];
    } finally {
      dispatch(setIsLoadingPath(false));
    }
  };

  const handleSearch = (key: string) => {
    if (key.trim()) {
      dispatch(setSearchKey(key));
      dispatch(setIsSearchMode(true));
      dispatch(setSelectedRows([]));
      fetchFileList(1, pagination.pageSize, true);
    } else {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    dispatch(setSearchKey(''));
    dispatch(setIsSearchMode(false));
    dispatch(setSelectedRows([]));
    fetchFileList(1, pagination.pageSize, false);
  };

  return {
    fetchFileList,
    handleUpload,
    handleCreateFolder,
    handleDelete,
    handleMove,
    handleDownload,
    handleRename,
    getFilePath,
    handleSearch,
    handleClearSearch,
  };
}; 