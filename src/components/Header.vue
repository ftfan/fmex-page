<template>
  <div class="header">
    <div class="menu" v-if="$AppStore.localState.topMenuShow" :class="{ hover: hover.menu }" @click.self="hover.menu = !hover.menu">
      <p>
        <span>{{ $AppStore.state.Lyrics[0][0] }}</span>
        <span class="delay">{{ $AppStore.state.Lyrics[0][1] }}</span>
      </p>
      <ul class="clearfix">
        <router-link tag="li" class="index GetTired" @click.stop :to="{ name: 'Index' }">首页</router-link>
        <router-link tag="li" class="GetTired" @click.stop :to="{ name: 'Friend' }">其他</router-link>
        <router-link tag="li" class="three GetTired" @click.stop :to="{ name: 'Analysis' }">分析</router-link>
        <router-link tag="li" class="GetTired" @click.stop :to="{ name: 'About' }">关于</router-link>
      </ul>
    </div>
    <div class="auther" :class="{ hover: hover.auther }" @click="hover.auther = !hover.auther">
      <p>
        <span>{{ $AppStore.state.Lyrics[1][0] }}</span>
        <span class="delay">{{ $AppStore.state.Lyrics[1][1] }}</span>
      </p>
      <img src="~@/assets/logo.png" />
    </div>
    <div class="other" :class="{ hover: hover.other }" @click="hover.other = !hover.other">
      <p>
        <span>{{ $AppStore.state.Lyrics[2][0] }}</span>
        <span class="delay">{{ $AppStore.state.Lyrics[2][1] }}</span>
      </p>
    </div>
    <div class="chat" :class="{ hover: hover.chat }" @click="hover.chat = !hover.chat">
      <p>
        <span>{{ $AppStore.state.Lyrics[3][0] }}</span>
        <span class="delay">{{ $AppStore.state.Lyrics[3][1] }}</span>
      </p>
    </div>

    <div class="control-mobile">
      <div class="close-it" v-if="$AppStore.localState.topMenuShow" @click="$AppStore.localState.topMenuShow = false">收起导航</div>
      <div class="open-it" v-else @click="$AppStore.localState.topMenuShow = true">导航</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class Header extends Vue {
  hover = {
    menu: true,
    auther: false,
    other: false,
    chat: false,
  };

  Next(name: string) {
    if (this.$route.name === name) return;
    this.$router.push({ name });
  }
}
</script>

<style lang="scss" scoped>
.header {
  $header-div-width: 300px;
  // background-color: $bg-color - #333;
  & > div {
    position: fixed;
    width: $header-div-width;
    height: $header-div-width / 2;
    background-color: $color-main;
    border: 4px solid #fff;
    text-align: center;
    box-shadow: 0 0 4px #04a4cc;
    transition: all 0.4s ease-in-out;
    border-radius: 100px;
    opacity: 0.5;
    z-index: $zIndex-header-div;

    p {
      color: #83ffe9;
      display: block;
      height: $header-div-width / 4 - 50px;
      margin-top: 20px;
      font-size: 12px;
      height: 32px;
      span {
        transition: opacity 2s ease-in-out;
        opacity: 0;
        text-shadow: 0 0 30px #fff;
        display: block;
        &.delay {
          transition-delay: 1s;
        }
      }
    }
    &:hover,
    &.hover {
      opacity: 0.9;
      transform: rotate(0);
      border-radius: 30px;
      p {
        span {
          opacity: 1;
        }
      }
    }
  }
  .menu {
    padding-top: $header-div-width / 2;
    top: -$header-div-width / 2 - 10px;
    left: -$header-div-width / 2 - 10px;
    transform: rotate(-45deg);
    &:hover,
    &.hover {
      left: 0;
    }
    ul {
      //padding-top: $header-div-width / 4 - 30px;
      a {
        color: #fff;
      }
      $header-menu-ul-padding: 50px;
      $header-menu-li-width: 60px;
      font-size: 16px;
      padding: 0 $header-menu-ul-padding;
      li {
        transition: all 0.4s ease-in-out;
        float: left;
        padding: 4px 0;
        cursor: pointer;
        width: $header-menu-li-width;
        color: #fff;
        &.index {
          margin: 14px ($header-div-width - $header-menu-ul-padding * 2 - $header-menu-li-width)/2;
        }
        &.three {
          margin: 0 ($header-div-width - $header-menu-li-width * 3 - $header-menu-ul-padding * 2)/2;
        }
        &:hover {
          // transform: rotate(10deg);
          background-color: #f8f8f8;
          color: #04a4cc;
          border-radius: 10px;
          box-shadow: 0 0 10px #fff;
        }
        &.router-link-exact-active {
          color: #82f3e8;
        }
      }
    }
  }
  .auther {
    padding-top: $header-div-width / 2;
    top: -$header-div-width / 2 - 10px;
    right: -$header-div-width / 2 - 10px;
    transform: rotate(45deg);
    &:hover,
    &.hover {
      right: 0;
      img {
        transform: rotate(0);
        margin-top: 20px;
        width: 24%;
      }
    }
    img {
      transition: all 0.4s ease-in-out;
      transform: rotate(-45deg);
      width: 30%;
      border-radius: 50%;
      box-shadow: 0 0 10px #fff;
    }
  }
  .chat {
    padding-bottom: $header-div-width / 2;
    right: -$header-div-width / 1.5 - 10px;
    bottom: -$header-div-width / 1.5 - 10px;
    transform: rotate(45deg);
    &:hover,
    &.hover {
      right: 0;
      p {
      }
    }
  }
  .other {
    padding-bottom: $header-div-width / 2;
    bottom: -$header-div-width / 1.5 - 10px;
    left: -$header-div-width / 1.5 - 10px;
    transform: rotate(-45deg);
    &:hover,
    &.hover {
      left: 0;
    }
  }
  div.control-mobile {
    display: none;
    position: fixed;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    padding: 5px;
    opacity: 1;
    color: #fff;
    font-size: 12px;
    .open-it {
      line-height: 30px;
    }
  }
}

@media screen and (max-width: 750px) {
  .header div.control-mobile {
    display: block;
    div {
      display: block;
    }
  }
}
</style>
