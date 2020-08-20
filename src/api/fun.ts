import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Code, CodeObj } from '../lib/Code';

export const FunApi = Axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7002' : 'https://fun.imconfig.com',
});

const catchError = (error: any) => {
  let revert = 0;
  let Msg = '';
  if (error.response) {
    // 服务器有响应。
    revert = error.response.status;
    if (error.response.data) {
      if (error.response.data.Code) revert = error.response.data.Code;
      if (error.response.data.Msg) Msg = error.response.data.Msg;
    }
  } else if (error.request) {
    // 请求已经发送，但是服务端无响应
    revert = Code.Error;
    if (error.message === 'Network Error') {
      revert = Code.Error;
    }
  } else {
    // 一些异常原因导致请求出错
    revert = Code.Error;
  }
  return Promise.resolve({ data: new CodeObj(revert, null, Msg) });
};

FunApi.interceptors.request.use((config: AxiosRequestConfig) => {
  return config;
}, catchError); // req处理

FunApi.interceptors.response.use((response: AxiosResponse) => {
  // 返回的数据模型内，没有Code字段。默认数据就是Data
  if (response && typeof response.data === 'object') {
    if (response.data.message) response.data.Msg = response.data.message;
    if ('Code' in response.data) {
      response.data = new CodeObj(response.data);
    } else {
      response.data = new CodeObj(Code.Success, response.data);
    }
  }
  // 返回的数据是空
  if (response && !response.data) response.data = new CodeObj(Code.Success, null);
  return response;
}, catchError); // res处理
