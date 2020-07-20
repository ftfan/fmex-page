<template>
  <v-list>
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title>站点介绍</v-list-item-title>
        <v-list-item-subtitle>代码： <v-chip link small href="https://github.com/ftfan/fmex-page">https://github.com/ftfan/fmex-page</v-chip></v-list-item-subtitle>
        <v-list-item-subtitle>部署方式（GitHub Pages）： <v-chip link small color="primary" href="https://fmex.fun">https://fmex.fun</v-chip></v-list-item-subtitle>
        <v-list-item-subtitle>国内镜像（Gitee Pages）： <v-chip link small color="primary" href="https://fmex.gitee.io">https://fmex.gitee.io</v-chip></v-list-item-subtitle>
        <v-list-item-subtitle>
          欢迎 pr、issues
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title>联系我们</v-list-item-title>
        <v-list-item-subtitle>
          <v-chip small color="primary">support@ft100.fun</v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<style lang="scss" scoped>
.about {
  user-select: text;
}
</style>
