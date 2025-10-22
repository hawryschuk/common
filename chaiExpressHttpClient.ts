import chai from 'chai'; //chai.should();
import chaiHttp from 'chai-http'; chai.use(chaiHttp);
import { Express } from 'express';
import { HttpClientRequestParams, MinimalHttpClient } from './MinimalHttpClient';
import { Util } from './util';

export const chaiExpressHttpClient = (expressApp: Express) => <MinimalHttpClient>(async (options: HttpClientRequestParams) => {
    let { method = 'get', url = '', body = null, responseType = 'json', headers = {} } = options;
    body &&= Util.shallowClone(body)
    const z = chai.request(expressApp)[method](`/${url}`).set(headers);
    const x = (method === 'get' || method === 'delete') ? z.query(body) : z.send(body);
    const y = await x.then(response => ({ response })).catch(error => ({ error })) as any;
    const { response, error } = y as { response: Awaited<typeof x>; error: any; };
    const { status } = response || {};
    if (error) {
        console.error(error);
        throw error;
    }
    if (status >= 400) {
        const message = response.body?.error?.message || response.body?.error || response.body?.message || (response.body ? status : response.text);
        const error = Object.assign(new Error(message), response.body || {}, { status });
        throw error;
    } else {
        return method === 'head' ? response.headers : responseType === 'text' ? response.text : response.body;
    }
});
