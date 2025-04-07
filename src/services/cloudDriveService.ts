import { httpClient } from "./httpClient";

import { CreateFolderRequest, FileItem, FileListParams, FileSearchParams, MoveFilesRequest, RenameFileRequest } from "../types/cloudDrive";

import { ApiResponse, PageData } from "../types/common";

class CloudDriveService {
    private static instance: CloudDriveService;

    private constructor() { }

    public static getInstance(): CloudDriveService {
        if (!CloudDriveService.instance) {
            CloudDriveService.instance = new CloudDriveService();
        }
        return CloudDriveService.instance;
    }

    async getFileList(data: FileListParams): Promise<ApiResponse<PageData<FileItem>>> {
        return httpClient.get('files/page', { params: data });
    }

    async createFolder(data: CreateFolderRequest): Promise<ApiResponse<FileItem>> {
        return httpClient.post('files/folder', data);
    }

    async deleteFile(fileID: string): Promise<ApiResponse<null>> {
        return httpClient.delete(`files/delete`, { params: { file_id: fileID } });
    }

    async moveFiles(data:MoveFilesRequest):Promise<ApiResponse<null>>{
        return httpClient.post('files/move',data);
    }

    async getFilePathById(fileID: string): Promise<ApiResponse<{ path: string }>> {
        return httpClient.get(`files/path`, { params: { file_id: fileID } });
    }

    async getFileIdPath(fileID: string): Promise<ApiResponse<{ id_path: string }>> {
        return httpClient.get(`files/idPath`, { params: { file_id: fileID } });
    }

    async uploadFile(file: File, parentId?: string): Promise<ApiResponse<FileItem>> {
        const formData = new FormData();
        formData.append('file', file);
        if (parentId) {
          formData.append('parent_id', parentId);
        }
        return httpClient.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    }

    async downloadFile(fileId: string): Promise<Blob> {
        const response = await httpClient.get(`/files/download`, {
          params: { file_id: fileId },
          responseType: 'blob',
          transformResponse: (data) => data, // 防止响应被处理
        });
        return response.data;
    }

    async renameFile(data:RenameFileRequest): Promise<ApiResponse<null>> {
        return httpClient.put('/files/rename', data);
    }

    async searchFiles(data:FileSearchParams ): Promise<ApiResponse<PageData<FileItem>>> {
        return httpClient.get('/files/search', { params: data });
    }


}

export const cloudDriveService = CloudDriveService.getInstance();