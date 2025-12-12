export interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface PaginationData {
    hasnext: boolean;
    total: number;
}
