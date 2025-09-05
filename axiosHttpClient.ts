import axios from 'axios';
import { MinimalHttpClient } from './MinimalHttpClient';

export const axiosHttpClient = (baseURL: string) => <MinimalHttpClient>(async ({
    method = 'get',
    url = '',
    body = null as any,
    responseType = 'json' as 'arraybuffer' | 'blob' | 'text' | 'json',
    headers = {} as { [header: string]: string | string[]; }
}) => {
    // console.log({ method, url, body, responseType, headers })
    const x = axios({
        baseURL,
        method,
        url,
        data: body,
        headers
    });
    const y = await x
        .then(response => ({ response }))
        .catch(error => ({ error })) as any;
    const { response, error } = y as { response: Awaited<typeof x>; error: any; };
    const { status, statusText, data } = response || {};
    if (status >= 400) {
        const message = data?.error || data?.message || statusText || status;
        const error = Object.assign(new Error(message), data, { status, statusText });
        throw error;
    } else if (error) {
        console.error(error); throw error;
    } else
        return response.data;
});