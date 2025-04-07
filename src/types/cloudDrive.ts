export interface FileItem {
  ID: string;
  UserID: number;
  Name: string;
  Size: number;
  Hash: string;
  MIMEType: string;
  IsDir: boolean;
  ParentID: string | null;
  StorageType: string;
  StorageKey: string;
  CreatedAt: string;
  UpdatedAt: string;
}


export interface FileListParams {
  parent_id?: string;
  page?: number;
  page_size?: number;
  sort?: string;
}

export interface CreateFolderRequest {
  name: string;
  parent_id?: string;
}

export interface MoveFilesRequest{
  files_pid: string[];
  target_pid?: string;
}

export interface FileSearchParams {
  key: string;
  page: number;
  page_size: number;
  sort?: string;
}


export interface RenameFileRequest {
  file_id: string;
  new_name: string;
}


// 原有的
export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}