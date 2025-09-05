export type HttpClientRequestParams = {
    method?: 'get' | 'post' | 'put' | 'delete' | 'head';
    url?: string;
    url2?: string;
    body?: any;
    responseType?: 'arraybuffer' | 'blob' | 'text' | 'json';
    headers?: Record<string, string | string[]>;
};

export type MinimalHttpClient = (requestParams: HttpClientRequestParams) => Promise<any>;
