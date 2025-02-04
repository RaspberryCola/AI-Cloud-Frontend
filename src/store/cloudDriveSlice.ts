import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileItem, BreadcrumbItem, PaginationState } from '../types/cloudDrive';

interface CloudDriveState {
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

const initialState: CloudDriveState = {
  currentPath: [{ id: null, name: '根目录' }],
  selectedRows: [],
  loading: false,
  data: [],
  sortField: 'name',
  sortOrder: 'asc',
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  searchKey: '',
  isSearchMode: false,
  isLoadingPath: false,
};

const cloudDriveSlice = createSlice({
  name: 'cloudDrive',
  initialState,
  reducers: {
    setCurrentPath: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.currentPath = action.payload;
    },
    setSelectedRows: (state, action: PayloadAction<FileItem[]>) => {
      state.selectedRows = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setData: (state, action: PayloadAction<FileItem[]>) => {
      state.data = action.payload;
    },
    setSortField: (state, action: PayloadAction<'name' | 'updated_at'>) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    setSearchKey: (state, action: PayloadAction<string>) => {
      state.searchKey = action.payload;
    },
    setIsSearchMode: (state, action: PayloadAction<boolean>) => {
      state.isSearchMode = action.payload;
    },
    setIsLoadingPath: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPath = action.payload;
    },
    resetState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCurrentPath,
  setSelectedRows,
  setLoading,
  setData,
  setSortField,
  setSortOrder,
  setPagination,
  setSearchKey,
  setIsSearchMode,
  setIsLoadingPath,
  resetState,
} = cloudDriveSlice.actions;

export default cloudDriveSlice.reducer; 