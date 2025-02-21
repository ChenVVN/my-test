const db = uniCloud.database();
const rooms = db.collection("rooms");

exports.main = async (event, context) => {
  // 参数校验
  if (!event.roomNumber || !event.userInfo) {
    throw new Error("参数不完整");
  }

  if (!/^\d{6}$/.test(event.roomNumber)) {
    return {
      code: 400,
      msg: "房间号必须为6位数字",
    };
  }

  // 查询房间状态
  const roomRes = await rooms
    .where({
      room_number: Number(event.roomNumber),
      status: 1,
    })
    .get();

  if (!roomRes.data.length) {
    return {
      code: 404,
      msg: "房间不存在或已关闭",
    };
  }

  const room = roomRes.data[0];

  // 检查是否已加入
  const isMember = room.members.some((m) => m.id === event.userInfo._id);
  if (isMember) {
    return {
      code: 200,
      data: room,
    };
  }

  // 添加新成员
  const newMember = {
    _id: event.userInfo._id,
    nickname: event.userInfo.nickname,
    avatar: event.userInfo.avatarUrl,
    join_time: Date.now(),
    role: "member",
    personal_score: 0,
  };

  await rooms.doc(room._id).update({
    members: db.command.push(newMember),
    version: db.command.inc(1), // 必须存在的版本号
    last_modified: Date.now(), // 新增时间戳字段
    $push: {
      logs: {
        type: "join",
        user_id: event.userInfo._id,
        timestamp: Date.now(),
        content: `${event.userInfo.nickname} 加入房间`,
      },
    },
  });

  return {
    code: 200,
    msg: "加入成功",
  };
};
