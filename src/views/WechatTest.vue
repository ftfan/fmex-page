<template>
  <div></div>
</template>

<script lang="ts">
import { LoadCloudApi, LoadWxApi } from '@/lib/bridge';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component<WechatTest>({})
export default class WechatTest extends Vue {
  async created() {
    await LoadWxApi();
    await LoadCloudApi();
    if (window.wx) {
      (window as any).aaa = window.cloud;
      window.cloud = window.wx.cloud;
    }

    const urlSearch = new URLSearchParams(location.search);
    const accessToken = urlSearch.get('access_token');
    const refreshToken = urlSearch.get('refresh_token');

    /**
     * 检查/发起登录
     * 1. 函数会检查当前是否已登录（checkLogin）
     * 2. 如果未登录，会 10s 后自动发起登录（startLogin）
     * 3. 如果已登录，会初始化实例，使用指定的小程序云开发资源
     */
    const doLogin = async () => {
      try {
        const checkLoginOptions = {
          provider: 'OfficialAccount',
          appid: 'wxc5709bd44205e738',
        };

        if (urlSearch.get('oauthredirect') === '1') {
          Object.assign(checkLoginOptions, {
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }

        console.log(`checkLogin options: `, checkLoginOptions);
        const result = await window.cloud.checkLogin(checkLoginOptions);
        console.log(`checkLogin result: `, result);

        if (result.errCode === 0 && result.loggedIn) {
          console.log(`checkLogin success`);
          this.aaa();
        } else {
          console.log(`checkLogin with sdk errCode ${result.errCode} errMsg ${result.errMsg}, will start oauth in 10s`);

          setTimeout(() => {
            try {
              window.cloud.startLogin({
                provider: 'OfficialAccount',
                appid: 'wxc5709bd44205e738',
                scope: 'snsapi_base',
                redirectUri: location.href,
              });
            } catch (e) {
              console.error(`startLogin fail: ${e}`);
              console.warn(`will start OfficialAccount OAuth login in 10s.`);
            }
          }, 10000);
        }
      } catch (e) {
        console.error(e);
      }
    };

    doLogin();
  }

  async aaa() {
    // 初始化一个实例，声明要使用哪个小程序哪个云环境的资源
    const c = new window.cloud.Cloud({
      appid: 'wxc5709bd44205e738',
      resourceAppid: 'wx647b8a5ba3cae7fa',
      resourceEnv: 'fmex-i1c20',
    });
    console.log(c);

    // 初始化，等待授权关系校验通过以及目标云环境的 cloudbase_auth 函数返回授权
    const result = await c.init();
    console.log(result);
    const res = await window.cloud.getJSSDKSignature({
      url: location.href,
    });
    console.log(res);
    window.wx.config({
      appId: 'wxc5709bd44205e738', // 必填，公众号的唯一标识
      timestamp: res.timestamp + '', // 必填，生成签名的时间戳
      nonceStr: res.nonceStr, // 必填，生成签名的随机串
      signature: res.signature, // 必填，签名
      jsApiList: [
        'onMenuShareTimeline', // 发送朋友圈权限
        'onMenuShareAppMessage', // 分享好友权限
        'hideAllNonBaseMenuItem', // 隐藏所有非基础菜单
        'showMenuItems', // 显示菜单项
      ],
    });
    const share = {
      Title: 'Title',
      Desc: 'Desc',
      Url: 'Url',
      Img: 'Img',
    };
    window.wx.ready(() => {
      window.wx.hideAllNonBaseMenuItem();
      window.wx.showMenuItems({
        menuList: [
          'menuItem:share:appMessage', // 发送给朋友
          'menuItem:share:timeline', // 分享到朋友圈
        ],
      });
      window.wx.onMenuShareTimeline({
        title: share.Title, // 分享标题
        desc: share.Desc,
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
        success: async (res: any) => {
          console.log(res);
          if (res.errMsg === 'shareTimeline:ok') return alert('分享成功');
        },
      });
      window.wx.onMenuShareAppMessage({
        title: share.Title, // 分享标题
        desc: share.Desc, // 分享描述
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
        success: async (res: any) => {
          console.log(res);
          if (res.errMsg === 'sendAppMessage:ok') return alert('分享成功');
        },
      });
    });
  }
}
</script>
