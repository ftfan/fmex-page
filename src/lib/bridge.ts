import { IsWechat } from './utils';
import { LoadScript } from '@/lib/LoadScript';

// 声明window变量
declare global {
  interface Window {
    AlipayJSBridge: any;
    WeixinJSBridge: any;
  }
}

/**
 * 等待微信支付宝SDK加载完毕
 */
export const JsBridgeReady = () => {
  return new Promise((resolve) => {
    if (IsWechat) {
      if (typeof window.WeixinJSBridge !== 'undefined') return resolve();
      return document.addEventListener('WeixinJSBridgeReady', resolve, false);
    }
    resolve();
  });
};

export const JsBridgeCloseMenu = async () => {
  await JsBridgeReady();
  if (IsWechat) {
    window.WeixinJSBridge.call('hideOptionMenu');
  }
};

let cloudapi: any;
export const LoadCloudApi = async () => {
  if (cloudapi) return cloudapi;
  cloudapi = LoadScript('https://res.wx.qq.com/open/js/cloudbase/1.1.0/cloud.js');
  return cloudapi;
};

let wxapi: any;
export const LoadWxApi = async () => {
  if (wxapi) return wxapi;
  wxapi = LoadScript('https://res.wx.qq.com/open/js/jweixin-1.6.0.js');
  return wxapi;
};
