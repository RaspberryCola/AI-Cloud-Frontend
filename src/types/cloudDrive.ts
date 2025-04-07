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

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export interface MoveFilesRequest {
  files_pid: string[];
  target_pid?: string;
}

export interface RenameFileRequest {
  file_id: string;
  new_name: string;
}

export interface CloudDriveState {
  currentPath: BreadcrumbItem[];
  selectedRows: FileItem[];
  loading: boolean;
  data: FileItem[];
  sortField: 'name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  pagination: PaginationState;
  searchKey: string;
  isSearchMode: boolean;
  isLoadingPath: boolean;
}