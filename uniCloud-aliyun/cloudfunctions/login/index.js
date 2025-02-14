"use strict";
const db = uniCloud.database();
const userCollection = db.collection("users");
exports.main = async (event, context) => {
  const openIdInfo = await uniCloud.callFunction({
    name: "getOpenId",
    data: {
      code: event.code,
    },
  });

  // if (openIdInfo.result.code !== 0) {
  // 	throw new Error(`获取openId错误`);
  // }

  // 3. 使用返回数据
  await handleLogin(openIdInfo);

  async function handleLogin(openIdInfo) {
    // 数据处理逻辑
    const { nickname, avatar } = event;

    const userInfo = await db
      .collection("users")
      .where({
        openid: openIdInfo.result.data.openid,
      })
      .get();

    if (!userInfo.data.length) {
      const new_info = await userCollection.add({
        openid: openIdInfo.result.data.openid,
        nickname,
        avatar,
        created_at: Date.now(),
      });
      return {
        code: 200,
        data: new_info,
      };
    } else {
      const userInfo = await userCollection
        .where({
          openid: openIdInfo.result.data.openid,
        })
        .update({
          nickname,
          avatar,
        });
      return {
        code: 200,
        data: userInfo,
      };
    }
  }

  //   // 新增头像转存云存储方法
  //   async function uploadToCloudStorage(tempPath) {
  //     // 生成带时间戳和随机数的文件名
  //     const cloudPath = `avatars/${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substr(2, 6)}.jpg`;
  //     // 直接使用临时路径上传
  //     const result = await uniCloud.uploadFile({
  //       cloudPath: cloudPath,
  //       filePath: tempPath, // 直接使用微信临时路径
  //     });

  //     return result.fileID; // 返回云存储永久地址
  //   }

  // 修改返回字段过滤
  const finalInfo = await db
    .collection("users")
    .where({ openid: openIdInfo.result.data.openid })
    .field({ _id: true, nickname: true, avatar: true }) // 只返回指定字段
    .get();

  return {
    code: 0,
    data: finalInfo.data[0], // 直接返回第一条记录
  };
};
