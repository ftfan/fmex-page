import { IsWechat } from './utils';

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
