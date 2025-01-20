export interface SystemResponse<T> {
    timeStamp: string;
    message: string;
    payload: T;
}
