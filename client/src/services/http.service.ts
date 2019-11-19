import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ENV } from "../env";

export interface IHttpOptions {
  headers?: {
    [header: string]: string | string[];
  };
  params?: {
    [param: string]: string | string[];
  };
}

function processQueries(queries: { [prop: string]: any } = {}) {
  const qrs = Object.keys(queries)
    .map(name => `${name}=${encodeURIComponent(queries[name])}`)
    .join("&");
  return qrs.length > 0 ? "?" + qrs : "";
}

@Injectable()
export class HttpService {
  constructor(private client: HttpClient) {}

  public get(url: string, queries: { [prop: string]: any } = {}, options: IHttpOptions = {}) {
    return this.client.get(`${ENV.server.api}/${url}${processQueries(queries)}`, options).toPromise();
  }

  public post(url: string, body: { [prop: string]: any } = {}, options: IHttpOptions = {}) {
    return this.client.post(`${ENV.server.api}/${url}`, body, options).toPromise();
  }

  public put(url: string, body: { [prop: string]: any } = {}, options: IHttpOptions = {}) {
    return this.client.put(`${ENV.server.api}/${url}`, body, options).toPromise();
  }

  public delete(url: string, queries: { [prop: string]: any } = {}, options: IHttpOptions = {}) {
    return this.client.delete(`${ENV.server.api}/${url}${processQueries(queries)}`, options).toPromise();
  }
}
