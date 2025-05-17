export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

export interface PageData<T> {
    total: number;
    list: T[];
}