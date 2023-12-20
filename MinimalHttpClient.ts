
export type MinimalHttpClient = <T = any>(requestParams: {
    method?: 'post' | 'get' | 'delete' | 'put' | 'head';
    url: string;
    body?: any;
    responseType?: 'arraybuffer' | 'blob' | 'text' | 'json';
    headers?: { [header: string]: string | string[]; };
}) => Promise<T>;
