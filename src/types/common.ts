export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface PageData<T> {
    total: number;
    list: T[];
}