const db = uniCloud.database();

exports.main = async (event) => {
  try {
    // 参数校验
    if (!event.room_number || !/^\d{6}$/.test(event.room_number)) {
      return { code: 400, msg: "无效的房间号" };
    }

    const roomNumber = parseInt(event.room_number);

    // 查询房间信息
    const roomRes = await db
      .collection("rooms")
      .where({
        room_number: roomNumber,
        status: 1, // 只查询开启状态的房间
      })
      .field({
        _id: true,
        room_number: true,
        current_score: true,
        members: true,
        // logs: db.command.slice(-20),
        created_at: true,
      })
      .get();

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
