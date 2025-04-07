import { httpClient } from "./httpClient";

import { CreateFolderRequest, FileItem, FileListParams, MoveFilesRequest } from "../types/cloudDrive";

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


}

export const cloudDriveService = CloudDriveService.getInstance();