const MAX_RETRY = 3; // 最大重试次数

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const roomCollection = db.collection("rooms");

  let retryCount = 0;
  let roomNumber = 0;

  // 生成唯一房间号
  while (retryCount < MAX_RETRY) {
    try {
      roomNumber = generateRoomNumber();

      // 检查是否已存在
      const countRes = await roomCollection
        .where({
          room_number: roomNumber,
          status: 1, // 只检查活跃房间
        })
        .count();
      console.log("房间号：", countRes);

      if (countRes.total === 0) {
        break;
      }

      retryCount++;
    } catch (e) {
      console.error("生成房间号失败:", e);
      throw e;
    }
  }

  if (retryCount >= MAX_RETRY) {
    throw new Error("生成房间号失败，请重试");
  }

  const res = await roomCollection.add({
    room_number: roomNumber,
    creator_id: event.userInfo._id,
    current_score: 0,
    status: 1,
    created_at: Date.now(),
    members: [
      {
        id: event.userInfo._id, // 使用统一字段名
        nickname: event.userInfo.nickname,
        avatar: event.userInfo.avatarUrl, // 保持字段命名一致性
        join_time: Date.now(), // 新增加入时间
        role: "host", // 添加角色标识
      },
    ],
  });

  return {
    code: 0,
    data: res,
  };
};

// 生成6位随机数（100000-999999）
function generateRoomNumber() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
