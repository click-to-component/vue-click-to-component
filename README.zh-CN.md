# [vue-click-to-component](https://ctc.zjffun.com/docs/vue)

[![npm](https://img.shields.io/npm/v/vue-click-to-component)](https://www.npmjs.com/package/vue-click-to-component)

[English](./README.md) | 简体中文

在浏览器中按住 <kbd>Option</kbd>(<kbd>Alt</kbd>) 点击组件，**立即**在编辑器中打开对应代码。

在线测试：<https://ctc.zjffun.com/>

![Vite Demo](./images/vite.webp)

## 功能

- 按住 <kbd>Option</kbd>(<kbd>Alt</kbd>) 点击打开组件对应的代码
- 按住 <kbd>Option</kbd>(<kbd>Alt</kbd>) 右键点击打开带有父元素的菜单
- 支持 `vscode`、 `vscode-insiders` 和 `webstorm` 的 [URL 打开](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls)
- 自动“摇树优化”，不会打包到生产代码中

## 安装

### npm

```shell
npm install vue-click-to-component
```

### pnpm

```shell
pnpm add vue-click-to-component
```

### yarn

```shell
yarn add vue-click-to-component
```

虽然 `vue-click-to-component` 安装到了生产依赖，但[摇树优化](https://esbuild.github.io/api/#tree-shaking)会将 `vue-click-to-component` 在生产打包中移除.

## 使用

**如果你正在使用 [Click To Component Chrome 拓展程序](https://chromewebstore.google.com/detail/click-to-component/hdiiegojkjkgaakbdjpoaaadhnddpfdc) 则不需要在 `main.ts/js` 中添加 `import 'vue-click-to-component/client';`。**

### Vite

[`vite.config.ts`](./examples/vite/vite.config.ts#L7)

```diff
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
+import vueClickToComponent from 'vue-click-to-component/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
-  plugins: [vue()],
+  plugins: [vueClickToComponent(), vue()],
})
```

[`main.ts`](./examples/vite/src/main.ts#L4)

```diff
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
+import 'vue-click-to-component/client';

createApp(App).mount('#app')
```

### Vue CLI

[`vue.config.js`](./examples/vue-cli/vue.config.js#L6-L8)

```diff
const { defineConfig } = require("@vue/cli-service");
+const vueClickToComponent = require("vue-click-to-component/vue-cli-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
+  chainWebpack: (config) => {
+    vueClickToComponent(config);
+  },
});
```

[`main.js`](./examples/vue-cli/src/main.js#L3)

```diff
import Vue from 'vue'
import App from './App.vue'
+import 'vue-click-to-component/client.js'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### webpack

[`webpack.config.js`](./examples/webpack/webpack.config.js#L31-L35)

```diff
module: {
  rules: [
+    {
+        test: /\.vue$/,
+        enforce: 'pre',
+        loader: 'vue-click-to-component/loader',
+    },
    {
        test: /\.vue$/,
        loader: 'vue-loader',
    },
  ],
},
```

[`main.js`](./examples/webpack/src/index.js#L3)

```diff
import { createApp } from "vue";
import App from "./App.vue";
+import "vue-click-to-component/client.js";

createApp(App).mount("#app");
```

[`package.json`](./examples/webpack/package.json#L10)

```diff
"scripts": {
-  "serve": "webpack serve"
+  "serve": "NODE_ENV=development webpack serve"
},
```

### 配置打开编辑器的 URL

默认情况点击会打开 [`vscode`](https://code.visualstudio.com/)，一般不需要下面的配置。只有使用了下面这些情况才需要配置。

<details>
<summary>Visual Studio Code Insiders</summary>

如果你使用 [`vscode-insiders`](https://code.visualstudio.com/insiders/)，可以像下面这样修改编辑器：

```diff
import 'vue-click-to-component/client';

+if (process.env.NODE_ENV === 'development') {
+  window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ = function ({
+    sourceCodeLocation
+  }) {
+    return `vscode-insiders://file/${sourceCodeLocation}`;
+  };
+}
```

</details>

<details>
<summary>WSL</summary>

如果你使用 [WSL](https://docs.microsoft.com/en-us/windows/wsl/)，你可以像下面这样设置 URL：

```diff
import 'vue-click-to-component/client';

+if (process.env.NODE_ENV === 'development') {
+  window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ = function ({
+    sourceCodeLocation
+  }) {
+    // Please change to your WSL target
+    const wslTarget = 'Ubuntu-22.04';
+    return `vscode://vscode-remote/wsl+${wslTarget}/${sourceCodeLocation}`;
+  };
+}
```

你可以在 VS Code 的 `Remote Explorer` 面板找到你的 WSL 目标。

<img src="./images/wsl-target.webp" width="200" />

</details>

<details>
<summary>Docker</summary>

如果你使用 [Docker](https://www.docker.com/) 开发环境，你可以像下面这样修正路径：

```diff
import 'vue-click-to-component/client';

+if (process.env.NODE_ENV === 'development') {
+  window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ = function ({
+    sourceCodeLocation
+  }) {
+    // Please change to your docker work dir
+    const dockerWorkDir = '/usr/src/app';
+    // Please change to your local work dir
+    const workDir = '/Users/zjf/gh/vue-click-to-component/examples/vite';
+
+    let realSourceCodeLocation = sourceCodeLocation;
+    if (realSourceCodeLocation.startsWith(dockerWorkDir)) {
+      realSourceCodeLocation = `${workDir}${realSourceCodeLocation.slice(dockerWorkDir.length)}`;
+    }
+
+    return `vscode://file/${realSourceCodeLocation}`;
+  };
+}
```

</details>

<details>
<summary>WebStorm</summary>

如果你使用 [WebStorm](https://www.jetbrains.com/webstorm/)，你可以像下面这样设置 URL：

```diff
import 'vue-click-to-component/client';

+if (process.env.NODE_ENV === 'development') {
+  window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ = function ({
+    sourceCodeLocation
+  }) {
+    const [path, line, column] = sourceCodeLocation.split(':');
+    return `webstorm://open?file=${path}&line=${line}&column=${column}`;
+  };
+}
```

注：根据我的测试，文件可以打开，但是行列不生效。如果有谁知道如何让行列生效，请教给我一下，谢谢。

</details>

### 强制开启

默认情况下，这个工具只有在开发环境（`NODE_ENV` 为 `development`）才会开启。如果你想在生产环境也开启，可以像下面这样配置：

`main.ts`:

```diff
-import 'vue-click-to-component/client';
+import 'vue-click-to-component/client-force-enable';
```

`package.json`:

```diff
-"build": "vue-tsc && vite build",
+"build": "vue-tsc && VUE_CLICK_TO_COMPONENT_FORCE_ENABLE=true vite build",
```
