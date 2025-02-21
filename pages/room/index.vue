<template>
  <view class="container">
    <view class="room-number">
      <text class="prefix">房间号：</text>
      <span class="number">{{ roomData.room_number }}</span></view
    >
    <!-- 桌面积分展示 -->
    <view class="score-card">
      <text class="score-label">桌面积分</text>
      <text class="score-value">{{ roomData.current_score }}</text>
    </view>

    <!-- <view class="user-text">玩家列表</view> -->
    <view class="member-list">
      <view
        v-for="(member, memberIndex) in roomData.members"
        :key="memberIndex"
        class="member-item"
      >
        <view class="order">{{ memberIndex + 1 }}</view>
        <view class="member-info">
          <image class="member-avatar" :src="member.avatar" />
          <text class="member-name">{{ member.nickname }}</text>
        </view>
        <view class="member-score">{{ member.personal_score }}</view>
      </view>
    </view>

    <!-- 操作日志 -->
    <view class="action-log">
      <scroll-view class="log-list" scroll-y>
        <view
          v-for="(log, index) in roomData.logs"
          :key="index"
          class="log-item"
        >
          <text class="time">{{ formatTime(log.timestamp) }}</text>
          {{ log.content }}
        </view>
      </scroll-view>
    </view>

    <!-- 底部操作栏 -->
    <view class="fixed-actions">
      <button class="action-btn out" @click="openOut">支 出</button>
      <button class="action-btn in" @click="openIn">收 回</button>
    </view>

    <uni-popup ref="outPopup" type="bottom">
      <view class="edit-box">
        <view class="input-box">
          <input
            class="input"
            v-model="outValue"
            placeholder="输入支出数量"
            type="number"
          />
          <button class="confirm-btn" @click="handleOut">确定</button>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="inPopup" type="bottom">
      <view class="edit-box">
        <view class="input-box">
          <input
            class="input"
            v-model="inValue"
            placeholder="输入收回数量"
            type="number"
          />

          <view class="button-line">
            <view class="all-in-box">全收</view>
            <button class="confirm-btn" @click="handleIn">确定</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
// import { formatTime } from '@/utils/util';
import { getCurrentUser } from "@/utils/auth";
import dayjs from "dayjs";

const roomWatcher = ref(null);

const formatTime = (timestamp) => {
  return dayjs(timestamp).format("HH:mm:ss");
};
// 初始化监听
const initWatch = () => {
  const db = uniCloud.database();

  // 关闭旧监听
  if (roomWatcher.value) {
    console.log("[监听] 关闭旧连接");
    roomWatcher.value.close();
  }

  console.log("[监听] 开始建立新连接，房间ID:", roomData.value._id);
  roomWatcher.value = db
    .collection("rooms")
    .doc(roomData.value._id)
    .watch({
      onChange: (snapshot) => {
        console.log(snapshot);

        console.log("[监听成功] 收到变更:", {
          id: snapshot.id,
          type: snapshot.type,
          doc: snapshot.docs[0],
        });
        handleDataChange(snapshot);
      },
      onError: (err) => {
        console.error("[监听错误]", err);
        uni.showToast({
          title: "连接中断，正在重连...",
          icon: "none",
        });
        setTimeout(initWatch, 5000);
      },
    });

  console.log(roomWatcher.value);
};

// 处理数据变化
const handleDataChange = (snapshot) => {
  console.log("触发监听变更", snapshot);

  if (snapshot.docs && snapshot.docs.length > 0) {
    const newData = snapshot.docs[0];

    // 调试日志
    console.log("[监听触发] 变更类型:", snapshot.type);
    console.log(
      "[数据对比] 旧版本:",
      roomData.value.version,
      "新版本:",
      newData.version
    );

    // 强制触发视图更新
    roomData.value = {
      ...newData,
      // 保持响应式
      members: [...newData.members],
      logs: [...newData.logs],
    };

    // 滚动日志到底部
    nextTick(() => {
      const query = uni.createSelectorQuery().in(this);
      query
        .select(".log-list")
        .boundingClientRect((data) => {
          if (data) {
            uni.pageScrollTo({
              scrollTop: data.height,
              duration: 300,
            });
          }
        })
        .exec();
    });
  }
};

// 显示操作通知
const showOperationNotice = (log) => {
  const user = roomData.value.members.find((m) => m.user_id === log.user_id);
  const nickName = user?.nickname || "未知用户";

  switch (log.type) {
    case "join":
      uni.showToast({
        title: `${nickName} 加入了房间`,
        icon: "none",
      });
      break;
    case "out":
      uni.showToast({
        title: `${nickName} 支出了 ${log.amount}分`,
        icon: "none",
      });
      break;
    case "in":
      uni.showToast({
        title: `${nickName} 收回了 ${log.amount}分`,
        icon: "none",
      });
      break;
  }
};
// 错误处理
const handleWatchError = (err) => {
  console.error("实时监听失败:", err);
  uni.showToast({
    title: "实时连接中断，请刷新页面",
    icon: "none",
  });
};

const roomData = ref({
  room_number: "",
  current_score: 0,
  members: [],
  logs: [],
});

const outValue = ref("");
const inValue = ref("");
const outPopup = ref(null);
const inPopup = ref(null);

const userInfo = ref({});

const openOut = () => {
  outPopup.value.open("bottom");
};

const handleOut = async () => {
  try {
    const res = await uniCloud.callFunction({
      name: "score_out",
      data: {
        roomId: roomData.value._id,
        userInfo: userInfo.value,
        amount: Number(outValue.value),
      },
    });

    if (res.result.code === 200) {
      uni.showToast({ title: "支出成功" });
      // 强制刷新数据
      await loadRoomData();
      outPopup.value.close();
    }
  } catch (e) {
    uni.showToast({ title: e.message, icon: "none" });
  }
};

const openIn = () => {
  inPopup.value.open("bottom");
};

const handleIn = async () => {
  if (Number(inValue.value) > roomData.value.current_score) {
    uni.showToast({
      title: "收回积分应小于或等于当前桌面积分",
      icon: "none",
    });
    return;
  }
  try {
    const res = await uniCloud.callFunction({
      name: "score_in",
      data: {
        roomId: roomData.value._id,
        userInfo: userInfo.value,
        amount: Number(inValue.value),
      },
    });

    if (res.result.code === 200) {
      inPopup.value.close();
      // 强制刷新数据
      await loadRoomData();
    }
    console.log("收回", res);

    uni.showToast({ title: res.result.msg });
  } catch (e) {
    uni.showToast({ title: e.message, icon: "none" });
  }
};

const roomNumber = ref("");

onMounted(async () => {
  // 从URL参数获取房间号
  const params = getCurrentPages().pop().options;

  roomNumber.value = params.room_number;
  console.log(roomNumber.value);

  userInfo.value = getCurrentUser();

  // 先加载数据再初始化监听
  await loadRoomData();
  console.log("房间数据加载完成:", roomData.value._id); // 调试点2

  initWatch();
});

onUnmounted(() => {
  roomWatcher.value && roomWatcher.value.close();
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
  padding: 0 30rpx;
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
  overflow-y: auto;
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

.edit-box {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx 20rpx 0 0;
  margin-bottom: -24px;

  .input {
    height: 100rpx;
    border: 2rpx solid #eee;
    border-radius: 10rpx;
    padding: 0 20rpx;
    margin-bottom: 30rpx;
  }
  .button-line {
    display: flex;
    justify-content: space-between;

    .all-in-box {
      flex: 1;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #e44a2f;
      color: #fff;
      border-radius: 50rpx;
      margin-right: 10px;
    }
    .confirm-btn {
      flex: 1;
      margin-left: 10px;
      background: #07c160;
      color: #fff;
      border-radius: 50rpx;
      height: 80rpx;
      line-height: 80rpx;
    }
  }

  .confirm-btn {
    margin-left: 10px;
    background: #07c160;
    color: #fff;
    border-radius: 50rpx;
    height: 80rpx;
    line-height: 80rpx;
  }
}
</style>
