export const checkLogin = () => {
  try {
    // 先检查内存中的全局数据
    if (getApp().globalData.userInfo) return true;

    // 再检查本地存储
    const cachedUser = uni.getStorageSync("userInfo");
    if (cachedUser && Date.now() < cachedUser.expires) {
      getApp().globalData.userInfo = cachedUser;
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const getCurrentUser = () => {
  return getApp().globalData.userInfo || uni.getStorageSync("userInfo");
};
