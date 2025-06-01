const fs = require("fs");
const path = require("path");
const { getSourceWithSourceCodeLocation } = require("./dist/index.js");
const htmlTags = require("html-tags");

// 读取客户端代码
function getClientCode() {
  const clientPath = path.resolve(__dirname, "client.js");
  return fs.readFileSync(clientPath, 'utf-8');
}

module.exports = function vitePlugin(options = {}) {
  let config;

  return {
    name: "vite-plugin-click-to-component",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      // 使用 configureServer 钩子来确保在开发服务器启动时执行
      const originalTransformIndexHtml = server.transformIndexHtml;
      server.transformIndexHtml = function(url, html, originalUrl) {
        // 先执行原始的 transformIndexHtml
        return originalTransformIndexHtml.call(this, url, html, originalUrl)
          .then(transformedHtml => {
            // 如果不是开发环境，直接返回
            if (process.env.VUE_CLICK_TO_COMPONENT_FORCE_ENABLE !== "true" && 
                process.env.NODE_ENV !== "development") {
              return transformedHtml;
            }
            
            // 在 head 标签结束前插入脚本
            const scriptTag = `<script type="module" src="${config.base || '/'}@id/virtual:vue-click-to-component/client"></script>`;
            return transformedHtml.replace('</head>', `${scriptTag}</head>`);
          });
      };
    },
    load(id) {
      if (
        process.env.VUE_CLICK_TO_COMPONENT_FORCE_ENABLE !== "true" &&
        process.env.NODE_ENV !== "development"
      ) {
        // disable vite plugin
        return;
      }

      if (id.endsWith(".vue")) {
        try {
          const source = fs.readFileSync(id, "utf-8");
          const sourceWithSourceCodeLocation = getSourceWithSourceCodeLocation({
            source,
            filePath: id,
            htmlTags,
          });

          return sourceWithSourceCodeLocation;
        } catch (error) {
          console.error("[vue-click-to-component-vite-plugin] error", {
            file: id,
            error: error && error.message,
          });

          return;
        }
      }

      if (id === '\0virtual:vue-click-to-component/client') {
        return getClientCode();
      }
    },
    resolveId(id) {
      if (id === 'virtual:vue-click-to-component/client') {
        return '\0' + id;
      }
    },
    transformIndexHtml(html) {
      if (
        process.env.VUE_CLICK_TO_COMPONENT_FORCE_ENABLE !== "true" &&
        process.env.NODE_ENV !== "development"
      ) {
        // disable injection in production
        return html;
      }

      return {
        html,
        tags: [
          {
            tag: 'script',
            injectTo: 'head',
            attrs: {
              type: 'module',
              src: `${config.base || '/'}@id/virtual:vue-click-to-component/client`,
            },
          },
        ],
      };
    },
  };
};
