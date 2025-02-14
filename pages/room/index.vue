<template>
  <view class="container">
    <view class="room-number">
      <text class="prefix">房间号：</text>
      <span class="number">{{ roomData.room_number }}</span></view
    >
    <!-- 桌面积分展示 -->
    <view class="score-card">
      <text class="score-label">桌面积分</text>
      <text class="score-value">234</text>
    </view>
    <!-- 操作日志 -->
    <view class="action-log">
      <scroll-view class="log-list" scroll-y>
        <view
          v-for="(log, index) in logs"
          :key="index"
          class="log-item"
          :class="log.type"
        >
          <text class="time">{{ log.time }}</text>
          {{ log.content }}
        </view>
      </scroll-view>
    </view>
    <!-- <view class="user-text">玩家列表</view> -->
    <view class="member-list">
      <view
        v-for="(member, memberIndex) in 5"
        :key="memberIndex"
        class="member-item"
      >
        <view class="order">{{ memberIndex + 1 }}</view>
        <view class="member-info">
          <image class="member-avatar" src="/static/user-avatar.png" />
          <text class="member-name">wnccc</text>
        </view>
        <view class="member-score">0</view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="fixed-actions">
      <button class="action-btn out" @click="handleOut">支 出</button>
      <button class="action-btn in" @click="handleIn">收 回</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { formatTime } from '@/utils/util';

const roomData = ref({
  room_number: "",
  current_score: 0,
  members: [],
  logs: [],
});

const roomNumber = ref("");

onMounted(async () => {
  // 从URL参数获取房间号
  const params = getCurrentPages().pop().options;

  roomNumber.value = params.room_number;
  console.log(roomNumber.value);

  loadRoomData();
});

const loadRoomData = async () => {
  try {
    const res = await uniCloud.callFunction({
      name: "get_room_info",
      data: { room_number: roomNumber.value },
    });

    if (res.result.code === 200) {
      roomData.value = res.result.data;
      console.log(res);
    } else {
      handleError(res.result.msg);
    }
  } catch (e) {
    handleError(e.message);
  }
};

const handleError = (msg) => {
  uni.showToast({ title: msg || "数据加载失败", icon: "none" });
  setTimeout(() => uni.navigateBack(), 1500);
};

const logs = [
  {
    time: "12:00",
    content: "wnccc 加入房间",
    type: "join",
  },
  {
    time: "12:05",
    content: "wnccc 支出2",
    type: "action",
  },
  {
    time: "12:10",
    content: "wnccc 收回43",
    type: "score-up",
  },
];
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx;
  height: 100vh;
  padding-bottom: 160rpx; // 给底部操作栏留出空间
  background: #f8f9fa;
}

/* 房间号样式 */
.room-number {
  padding: 10rpx 0;
  background: transparent; // 移除背景色
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   height: 4rpx;
  //   background: linear-gradient(
  //     90deg,
  //     rgba(46, 204, 113, 0.6) 0%,
  //     rgba(52, 152, 219, 0.6) 50%,
  //     rgba(155, 89, 182, 0.6) 100%
  //   );
  //   animation: gradientFlow 3s infinite linear;
  // }

  .prefix {
    font-size: 22rpx;
    color: #7f8c8d;
    letter-spacing: 2rpx;
  }

  .number {
    font-family: "DIN Alternate", sans-serif;
    font-size: 40rpx; // 缩小字号
    color: #2c3e50;
    letter-spacing: 3rpx;
    position: relative;
    display: inline-block;
    padding: 0 10rpx;
    background: linear-gradient(45deg, #3498db 25%, #2ecc71 50%, #e74c3c 75%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;
    font-weight: 700;
  }
}

.score-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .score-label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 15rpx;
    text-align: center;
  }

  .score-value {
    display: block;
    font-size: 55rpx;
    color: #07c160;
    font-weight: bold;
    text-align: center;
  }
}

.user-text {
  margin: 15rpx 0 0;
  font-size: 22rpx;
  color: #7f8c8d;
  letter-spacing: 2rpx;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 25rpx;
  margin-top: 20rpx;

  .member-item {
    width: 16%;
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid #eee;
    transition: all 0.3s ease;
    position: relative;
    .order {
      height: 30rpx;
      width: 30rpx;
      text-align: center;
      font-size: 20rpx;
      position: absolute;
      left: 0;
      top: 0;
      background: #5ab4e8;
      color: #fff;
      border-radius: 16rpx 0 13rpx 0;
    }

    .member-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10rpx;

      .member-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        border: 4rpx solid #f5f5f5;
        margin-bottom: 8rpx;
      }

      .member-name {
        font-size: 28rpx;
        color: #333;
        max-width: 200rpx;
      }
    }

    .member-score {
      text-align: center;
      font-size: 36rpx;
      color: #07c160;
      font-weight: 600;
      padding: 10rpx;
      background: #f5fff9;
      border-radius: 8rpx;
    }
  }
}

/* 操作日志区域 */
.action-log {
  margin: 30rpx 0;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  height: 400rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .log-list {
    height: 100%;
    overflow-y: auto;

    .log-item {
      padding: 15rpx 0;
      border-bottom: 1rpx solid #eee;
      font-size: 26rpx;

      &:last-child {
        border-bottom: none;
      }

      .time {
        color: #999;
        margin-right: 20rpx;
      }

      &.join {
        color: #2979ff;
      }

      &.out {
        color: #07c160;
      }

      &.in {
        color: #ff9500;
      }
    }
  }
}

/* 底部固定操作栏 */
.fixed-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
  z-index: 10;

  .action-btn {
    flex: 1;
    height: 100rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:active {
      transform: scale(0.95);
    }

    &.out {
      background: linear-gradient(135deg, #07c160, #05a854);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
    }

    &.in {
      background: linear-gradient(135deg, #ff9500, #ff7f00);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(255, 149, 0, 0.3);
    }
  }
}
</style>
