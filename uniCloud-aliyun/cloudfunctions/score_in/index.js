const db = uniCloud.database();
exports.main = async (event) => {
  const { roomId, userInfo, amount } = event;

  // 参数校验
  if (!roomId || !userInfo?._id || !amount) {
    return { code: 400, msg: "参数不完整" };
  }
  const transaction = await db.startTransaction();
  try {
    // 1. 获取房间数据
    const room = await transaction.collection("rooms").doc(roomId).get();
    if (!room.data) throw new Error("房间不存在");

    // 验证存在性
    const memberIndex = room.data.members.findIndex(
      (m) => m._id === userInfo._id
    );
    if (memberIndex === -1) {
      throw new Error("用户不在成员列表中");
    }

    // 3. 验证桌面积分
    if (room.data.current_score < amount) {
      throw new Error("收回积分应小于等于当前桌面积分");
    }

    await transaction
      .collection("rooms")
      .doc(roomId)
      .update({
        [`members.${memberIndex}.personal_score`]: db.command.inc(amount),
        current_score: db.command.inc(-amount),
        version: db.command.inc(1), // 必须存在的版本号
        last_modified: Date.now(), // 新增时间戳字段
        $push: {
          logs: {
            type: "in",
            user_id: userInfo._id,
            nickname: userInfo.nickname,
            amount: amount,
            timestamp: Date.now(),
            content: `${userInfo.nickname} 收回了 ${amount}分`,
          },
        },
      });
    await transaction.commit();
    return {
      code: 200,
      msg: "收回成功",
    };
  } catch (err) {
    await transaction.rollback();
    console.error(err.message);
    return {
      code: 500,
      msg: err.message,
    };
  }
};
