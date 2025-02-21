<template>
  <view class="container">
    <view v-if="!isLogin">
      <button class="login-btn" @tap="openPopup" type="primary">
        微信登录
      </button>
    </view>

    <view v-else class="main-page">
      <!-- 用户信息展示区 -->
      <view class="user-card">
        <view class="left-info">
          <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill" />
          <view class="user-info">
            <text class="user-name">{{ userInfo.nickname || "微信用户" }}</text>
          </view>
        </view>

        <view @tap="openPopup">
          <uni-icons type="compose" size="20" color="#666"></uni-icons>
        </view>
      </view>

      <!-- 功能按钮区 -->
      <view class="function-grid">
        <view class="grid-item" @tap="createRoom">
          <view class="icon-box create-room">
            <uni-icons type="plus" size="30" color="#fff"></uni-icons>
          </view>
          <text class="grid-text">创建房间</text>
        </view>

        <!-- <view class="grid-item" @tap="backRoom">
          <view class="icon-box join-room">
            <uni-icons type="home" size="30" color="#fff"></uni-icons>
          </view>
          <text class="grid-text">返回房间</text>
        </view> -->

        <view class="grid-item" @tap="openJoinPopup">
          <view class="icon-box scan-code">
            <uni-icons type="search" size="30" color="#fff"></uni-icons>
          </view>
          <text class="grid-text">进入房间</text>
        </view>
      </view>
    </view>

    <uni-popup ref="joinRoomPopup" type="bottom">
      <view class="join-box">
        <input
          class="input"
          v-model="inputRoomNumber"
          placeholder="输入6位房间号"
          type="number"
        />
        <button class="confirm-btn" @click="joinRoom">加入房间</button>
      </view>
    </uni-popup>

    <uni-popup
      ref="editPopup"
      type="bottom"
      @hide="handleHide"
      class="edit-popup"
    >
      <view class="popup-content">
        <!-- 头像编辑区域 -->
        <view class="avatar-section">
          <button
            class="avatar-btn"
            open-type="chooseAvatar"
            @chooseavatar="onChooseAvatar"
            size="mini"
          >
            <image
              class="avatar"
              :src="avatarUrl || '/static/user-avatar.png'"
              mode="aspectFill"
            />
          </button>
        </view>

        <!-- 昵称输入区域 -->
        <input
          v-model="nickname"
          type="nickname"
          class="nickname-input"
          placeholder="请输入昵称"
          placeholder-class="placeholder-style"
          @blur="onNicknameBlur"
        />

        <!-- 提交按钮 -->
        <button
          class="submit-btn"
          open-type="getUserInfo"
          @getuserinfo="handleSubmit"
        >
          提交信息
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { checkLogin, getCurrentUser } from "@/utils/auth";
const editPopup = ref(null); // 创建popup引用

const joinRoomPopup = ref(null); // 创建popup引用

const nickname = ref("");
const avatarUrl = ref("/static/user-avatar.png");

const inputRoomNumber = ref("");

const userInfo = ref({});
const isLogin = ref(false);

onMounted(() => {
  isLogin.value = checkLogin();
  console.log(checkLogin());

  userInfo.value = getCurrentUser();
  console.log("当前用户:", userInfo);
});
// 弹窗关闭回调
const handleHide = () => {
  console.log("弹窗已关闭");
};
const onChooseAvatar = (e) => {
  console.log(e);

  avatarUrl.value = e.detail.avatarUrl; // 获取微信返回的临时头像路径
};
const onNicknameBlur = (e) => {
  nickname.value = e.detail.value;
};
// 打开弹窗
const openPopup = () => {
  nickname.value = userInfo.value.nickname; // 初始化昵称
  avatarUrl.value = userInfo.value.avatar; // 初始化头像路径

  editPopup.value.open(); // 通过ref调用组件方法
};
// 提交处理

const handleSubmit = async () => {
  try {
    if (!nickname.value) {
      uni.showToast({
        title: "请输入昵称",
        icon: "none",
      });
      return;
    }
    if (avatarUrl.value === "/static/user-avatar.png") {
      uni.showToast({
        title: "请选择头像",
        icon: "none",
      });
      return;
    }

    uni.showLoading();

    // 获取用户code
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });

    let finalAvatar = avatarUrl.value;
    // 仅当选择新头像时上传（排除默认头像和已上传头像）
    if (
      avatarUrl.value !== userInfo.value.avatar &&
      !avatarUrl.value.startsWith("cloud:")
    ) {
      const uploadRes = await uniCloud.uploadFile({
        filePath: avatarUrl.value,
        cloudPath: `avatars/${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)}.jpg`,
      });

      if (!uploadRes.fileID) throw new Error("头像上传失败");
      finalAvatar = uploadRes.fileID;
    }

    // 提交完整数据到云函数
    const res = await uniCloud.callFunction({
      name: "login",
      data: {
        code: loginRes.code,
        nickname: nickname.value,
        avatar: finalAvatar,
      },
    });

    if (res.result.code === 0) {
      // 存储到本地缓存
      const userData = {
        _id: res.result.data._id,
        nickname: res.result.data.nickname,
        avatar: res.result.data.avatar,
        lastLogin: Date.now(), // 添加时间戳
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 设置7天有效期
      };
      // 持久化存储到本地
      uni.setStorageSync("userInfo", userData);
      // 同步到全局变量
      getApp().globalData.userInfo = userData;

      userInfo.value = getCurrentUser();
      editPopup.value.close();
    }
    // if (res.result.code === 0) {
    //   uni.showToast({ title: "信息更新成功" });
    //   editPopup.value.close();
    // } else {
    //   throw new Error(res.result.msg);
    // }
    uni.hideLoading();
  } catch (e) {
    uni.showToast({
      title: "提交失败：" + e.message,
      icon: "none",
    });
  }
  uni.hideLoading();
};

const openJoinPopup = () => {
  joinRoomPopup.value.open(); // 通过ref调用组件方法
};

// 加入房间校验
const validateRoomNumber = (value) => {
  if (!value) return "请输入房间号";
  if (!/^\d{6}$/.test(value)) return "房间号必须为6位数字";
  return true;
};
const roomInfo = ref(null);
// 加入房间
const joinRoom = async () => {
  const valid = validateRoomNumber(inputRoomNumber.value);
  if (valid !== true) {
    return uni.showToast({
      title: valid,
      icon: "none",
    });
  }

  try {
    const res = await uniCloud.callFunction({
      name: "join_room",
      data: {
        roomNumber: inputRoomNumber.value,
        userInfo: userInfo.value,
      },
    });

    if (res.result.code === 200) {
      uni.navigateTo({
        url: `/pages/room/index?room_number=${inputRoomNumber.value}`,
      });
    } else {
      uni.showToast({
        title: res.result.msg,
        icon: "none",
      });
    }
  } catch (e) {
    uni.showToast({
      title: "加入失败",
      icon: "none",
    });
  }
};

const createRoom = async () => {
  uni.showLoading({
    title: "创建中",
  });
  const res = await uniCloud.callFunction({
    name: "create_room",
    data: {
      userInfo: userInfo.value,
    },
  });

  uni.hideLoading();
  uni.navigateTo({
    url: `/pages/room/index?room_number=${res.result.data.room_number}`,
  });
};
const backRoom = () => {};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 样式保持与Vue2版本一致 */
.popup-content {
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
}

.login-btn {
  width: 300rpx;
  /* 调整为更小的宽度 */
  margin: 40rpx 0;
  border-radius: 50rpx;
  /* 添加圆角 */
  font-size: 32rpx;
  line-height: 1.5;
  padding: 20rpx 0;
  /* 调整内边距 */
}

/* 如果需要覆盖primary默认颜色 */
.login-btn[type="primary"] {
  background-color: #07c160;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-desc {
    color: #666;
  }
}

.avatar-btn {
  background: #fff;
  border: none;
  padding: 0;

  &::after {
    border: none;
  }
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.edit-text {
  font-size: 24rpx;
  color: #666;
}

.nickname-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-bottom: 40rpx;
}

.submit-btn {
  background: #07c160;
  color: white;
  border-radius: 10rpx;
}

.edit-popup {
  width: 100%;
}

.main-page {
  padding: 30rpx;
  background: #f5f5f5;
  min-height: 100vh;
  width: 100%;

  .user-card {
    background: #fff;
    padding: 40rpx 30rpx;
    margin: 0 0 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

    .left-info {
      display: flex;
      align-items: center;
    }

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      border: 2rpx solid #eee;
    }

    .user-info {
      flex: 1;
      position: relative;
    }

    .user-name {
      font-size: 36rpx;
      color: #333;
      font-weight: 500;
      display: block;
      max-width: 400rpx;
    }

    .grid-item {
      background: #fff;
      border-radius: 20rpx;
      padding: 40rpx;
      text-align: center;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;
    padding: 0 30rpx;

    .grid-item {
      background: #fff;
      border-radius: 20rpx;
      padding: 40rpx;
      text-align: center;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }

    .icon-box {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin: 0 auto 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.create-room {
        background: #07c160;
      }

      &.join-room {
        background: #2979ff;
      }

      &.scan-code {
        background: #ff9500;
      }

      &.edit-profile {
        background: #673ab7;
      }
    }

    .grid-text {
      font-size: 30rpx;
      color: #666;
      display: block;
    }
  }
}

.join-box {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx 20rpx 0 0;

  .input {
    height: 100rpx;
    border: 2rpx solid #eee;
    border-radius: 10rpx;
    padding: 0 20rpx;
    margin-bottom: 30rpx;
  }

  .confirm-btn {
    background: #07c160;
    color: #fff;
    border-radius: 50rpx;
    height: 80rpx;
    line-height: 80rpx;
  }
}
</style>
