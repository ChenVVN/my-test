const db = uniCloud.database();
exports.main = async (event) => {
  const { roomId, userInfo, amount } = event;

  // 参数校验
  if (!roomId || !userInfo._id || amount === undefined) {
    return { code: 400, msg: "参数不完整" };
  }

  const transaction = await db.startTransaction();
  try {
    // 1. 获取房间数据
    const room = await transaction.collection("rooms").doc(roomId).get();
    if (!room.data) throw new Error("房间不存在");

    // 2. 验证用户存在性（关键修复）
    const memberIndex = room.data.members.findIndex(
      (m) => m._id === userInfo._id
    );
    if (memberIndex === -1) {
      throw new Error("用户不在成员列表中");
    }

    // 3. 构建精确更新条件
    const updateCondition = {
      [`members.${memberIndex}.personal_score`]: db.command.inc(-amount), // 直接使用索引
      current_score: db.command.inc(amount),
      version: db.command.inc(1), // 必须存在的版本号
      last_modified: Date.now(), // 新增时间戳字段
      $push: {
        logs: {
          type: "out",
          user_id: userInfo._id,
          nickname: userInfo.nickname,
          amount: amount,
          timestamp: Date.now(),
          content: `${userInfo.nickname} 支出了 ${amount}分`,
        },
      },
    };

    // 4. 执行精确更新
    await transaction.collection("rooms").doc(roomId).update(updateCondition);

    await transaction.commit();
    return { code: 200, msg: "支出成功" };
  } catch (err) {
    await transaction.rollback();
    return { code: 500, msg: err.message };
  }
};
