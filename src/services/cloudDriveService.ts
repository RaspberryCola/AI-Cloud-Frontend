import { httpClient } from "./httpClient";

import { FileItem, FileListParams } from "../types/cloudDrive";

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
        return httpClient.get('files/page',{params:data});
    }

}

export const cloudDriveService = CloudDriveService.getInstance();