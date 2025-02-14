"use strict";
const common_vendor = require("../common/vendor.js");
const checkLogin = () => {
  try {
    if (getApp().globalData.userInfo)
      return true;
    const cachedUser = common_vendor.index.getStorageSync("userInfo");
    if (cachedUser && Date.now() < cachedUser.expires) {
      getApp().globalData.userInfo = cachedUser;
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
const getCurrentUser = () => {
  return getApp().globalData.userInfo || common_vendor.index.getStorageSync("userInfo");
};
exports.checkLogin = checkLogin;
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
