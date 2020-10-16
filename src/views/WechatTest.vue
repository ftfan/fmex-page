<template>
  <div></div>
</template>

<script lang="ts">
import { LoadCloudApi, LoadWxApi, LoadWxh5Api } from '@/lib/bridge';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component<WechatTest>({})
export default class WechatTest extends Vue {
  async created() {
    await LoadWxApi();
    await LoadCloudApi();
    await LoadWxh5Api();
    const win = window as any;
    win.app = null;
    win.uid = null;
    win.db = null;
    const init_result = win.cloudbase_login.init({
      appid: 'wxc5709bd44205e738',
      resourceAppid: 'wx647b8a5ba3cae7fa',
      resourceEnv: 'fmex-i1c20',
      scope: 'snsapi_base', // 登录方式 snsapi_userinfo snsapi_base
    });

    if (!init_result) {
      // 初始化状态，如果为false则无条件，需要引入cloud-sdk
      alert('没有引入cloud-sdk');
      return;
    }
    // 初始化状态，如果为true则继续登录
    const res = await win.cloudbase_login.doLogin();
    // 公众号登录执行函数
    if (res.code !== 0) {
      console.log(res.info);
      return;
    }
    // code=0则登录成功
    win.app = res.info; //info可获取到云开发的实例
    win.uid = res.msg; //msg可获取到用户的openid（临时功能）
    win.db = win.app.database(); // 装载云开发数据库对象
    const jsapi = [
      'onMenuShareTimeline', // 发送朋友圈权限
      'onMenuShareAppMessage', // 分享好友权限
      'hideAllNonBaseMenuItem', // 隐藏所有非基础菜单
      'showMenuItems', // 显示菜单项
      'updateAppMessageShareData',
      'updateTimelineShareData',
    ];
    // todo 登录成功后的业务
    const result = await win.cloudbase_login.useJSSDK(win.app, jsapi, false);
    console.log(result); //传入实例云开发、获取的能力列表、是否开启调试，装载SDK过程
    win.wx.hideAllNonBaseMenuItem();
    win.wx.showMenuItems({
      menuList: [
        'menuItem:share:appMessage', // 发送给朋友
        'menuItem:share:timeline', // 分享到朋友圈
      ],
    });
    const share = {
      Title: 'Title',
      Desc: 'Desc',
      Url: location.href,
      Img: 'https://fmex.fun/favicon.png',
    };
    win.wx.ready(function() {
      //启动监听，准备成功后自动触发
      win.wx.updateAppMessageShareData({
        // 更新分享给朋友的链接
        title: share.Title, // 分享标题
        desc: share.Desc, // 分享描述
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
      });
      win.wx.updateTimelineShareData({
        // 更新分享给朋友圈的链接
        title: share.Title, // 分享标题
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
      });

      window.wx.onMenuShareTimeline({
        title: share.Title, // 分享标题
        desc: share.Desc,
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
        success: async (res: any) => {
          console.log(res);
          // if (res.errMsg === 'shareTimeline:ok') return alert('分享成功');
        },
      });
      window.wx.onMenuShareAppMessage({
        title: share.Title, // 分享标题
        desc: share.Desc, // 分享描述
        link: share.Url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: share.Img, // 分享图标
        success: async (res: any) => {
          console.log(res);
          // if (res.errMsg === 'sendAppMessage:ok') return alert('分享成功');
        },
      });
    });
  }
}
</script>
