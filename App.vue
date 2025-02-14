<script>
export default {
  onLaunch() {
    // 检查本地存储
    try {
      const cachedUser = uni.getStorageSync("userInfo");
      if (cachedUser && Date.now() < cachedUser.expires) {
        // // 验证通过后设置全局变量
        // getApp().globalData.userInfo = cachedUser;
        console.log("从缓存加载用户信息");
      } else {
        // 清除过期数据
        uni.removeStorageSync("userInfo");
      }
    } catch (e) {
      console.error("读取存储失败:", e);
    }
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uni-scss/index.scss";
/* #ifndef APP-NVUE */
@import "@/static/customicons.css";
// 设置整个项目的背景色
page {
  background-color: #f5f5f5;
}

/* #endif */
.example-info {
  font-size: 14px;
  color: #333;
  padding: 10px;
}
</style>
