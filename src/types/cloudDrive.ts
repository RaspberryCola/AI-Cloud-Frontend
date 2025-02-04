export interface FileItem {
  ID: string;
  Name: string;
  Size: number;
  IsDir: boolean;
  MIMEType: string;
  UpdatedAt: string;
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