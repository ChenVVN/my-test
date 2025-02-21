const db = uniCloud.database();

exports.main = async (event) => {
  try {
    // 参数校验
    if (!event.room_number || !/^\d{6}$/.test(event.room_number)) {
      return { code: 400, msg: "无效的房间号" };
    }

    const roomNumber = parseInt(event.room_number);

    const roomRes = await db
      .collection("rooms")
      .aggregate()
      .match({
        room_number: roomNumber,
        status: 1,
      })
      .addFields({
        // 确保logs字段存在且为数组
        logs: {
          $cond: {
            if: { $isArray: "$logs" },
            then: { $slice: ["$logs", -20] }, // 取最后20条
            else: [], // 处理不存在的情况
          },
        },
      })
      .project({
        _id: 1,
        room_number: 1,
        current_score: 1,
        members: 1,
        logs: 1,
        created_at: 1,
        version: 1,
        last_modified: 1,
        status: 1,
      })
      .end();

    if (roomRes.data.length === 0) {
      return { code: 404, msg: "房间不存在或已关闭" };
    }

    // 处理返回数据
    const roomData = roomRes.data[0];
    return {
      code: 200,
      data: {
        ...roomData,
        // 转换_id为字符串
        _id: roomData._id.toString(),
        // 处理成员信息
        members: roomData.members.map((member) => ({
          ...member,
          isHost: member.role === "host",
        })),
      },
    };
  } catch (e) {
    console.error("获取房间信息失败:", e);
    return { code: 500, msg: "服务器错误" };
  }
};
