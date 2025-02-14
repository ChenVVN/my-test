"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/room/index.js";
}
const _sfc_main = {
  onLaunch() {
    try {
      const cachedUser = common_vendor.index.getStorageSync("userInfo");
      if (cachedUser && Date.now() < cachedUser.expires) {
        common_vendor.index.__f__("log", "at App.vue:10", "从缓存加载用户信息");
      } else {
        common_vendor.index.removeStorageSync("userInfo");
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at App.vue:16", "读取存储失败:", e);
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:20", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:23", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
