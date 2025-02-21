"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const editPopup = common_vendor.ref(null);
    const joinRoomPopup = common_vendor.ref(null);
    const nickname = common_vendor.ref("");
    const avatarUrl = common_vendor.ref("/static/user-avatar.png");
    const inputRoomNumber = common_vendor.ref("");
    const userInfo = common_vendor.ref({});
    const isLogin = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      isLogin.value = utils_auth.checkLogin();
      common_vendor.index.__f__("log", "at pages/index/index.vue:124", utils_auth.checkLogin());
      userInfo.value = utils_auth.getCurrentUser();
      common_vendor.index.__f__("log", "at pages/index/index.vue:127", "当前用户:", userInfo);
    });
    const handleHide = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:131", "弹窗已关闭");
    };
    const onChooseAvatar = (e) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:134", e);
      avatarUrl.value = e.detail.avatarUrl;
    };
    const onNicknameBlur = (e) => {
      nickname.value = e.detail.value;
    };
    const openPopup = () => {
      nickname.value = userInfo.value.nickname;
      avatarUrl.value = userInfo.value.avatar;
      editPopup.value.open();
    };
    const handleSubmit = async () => {
      try {
        if (!nickname.value) {
          common_vendor.index.showToast({
            title: "请输入昵称",
            icon: "none"
          });
          return;
        }
        if (avatarUrl.value === "/static/user-avatar.png") {
          common_vendor.index.showToast({
            title: "请选择头像",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading();
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        let finalAvatar = avatarUrl.value;
        if (avatarUrl.value !== userInfo.value.avatar && !avatarUrl.value.startsWith("cloud:")) {
          const uploadRes = await common_vendor.er.uploadFile({
            filePath: avatarUrl.value,
            cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.jpg`
          });
          if (!uploadRes.fileID)
            throw new Error("头像上传失败");
          finalAvatar = uploadRes.fileID;
        }
        const res = await common_vendor.er.callFunction({
          name: "login",
          data: {
            code: loginRes.code,
            nickname: nickname.value,
            avatar: finalAvatar
          }
        });
        if (res.result.code === 0) {
          const userData = {
            _id: res.result.data._id,
            nickname: res.result.data.nickname,
            avatar: res.result.data.avatar,
            lastLogin: Date.now(),
            // 添加时间戳
            expires: Date.now() + 7 * 24 * 60 * 60 * 1e3
            // 设置7天有效期
          };
          common_vendor.index.setStorageSync("userInfo", userData);
          getApp().globalData.userInfo = userData;
          userInfo.value = utils_auth.getCurrentUser();
          editPopup.value.close();
        }
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.showToast({
          title: "提交失败：" + e.message,
          icon: "none"
        });
      }
      common_vendor.index.hideLoading();
    };
    const openJoinPopup = () => {
      joinRoomPopup.value.open();
    };
    const validateRoomNumber = (value) => {
      if (!value)
        return "请输入房间号";
      if (!/^\d{6}$/.test(value))
        return "房间号必须为6位数字";
      return true;
    };
    common_vendor.ref(null);
    const joinRoom = async () => {
      const valid = validateRoomNumber(inputRoomNumber.value);
      if (valid !== true) {
        return common_vendor.index.showToast({
          title: valid,
          icon: "none"
        });
      }
      try {
        const res = await common_vendor.er.callFunction({
          name: "join_room",
          data: {
            roomNumber: inputRoomNumber.value,
            userInfo: userInfo.value
          }
        });
        if (res.result.code === 200) {
          common_vendor.index.navigateTo({
            url: `/pages/room/index?room_number=${inputRoomNumber.value}`
          });
        } else {
          common_vendor.index.showToast({
            title: res.result.msg,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "加入失败",
          icon: "none"
        });
      }
    };
    const createRoom = async () => {
      common_vendor.index.showLoading({
        title: "创建中"
      });
      const res = await common_vendor.er.callFunction({
        name: "create_room",
        data: {
          userInfo: userInfo.value
        }
      });
      common_vendor.index.hideLoading();
      common_vendor.index.navigateTo({
        url: `/pages/room/index?room_number=${res.result.data.room_number}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isLogin.value
      }, !isLogin.value ? {
        b: common_vendor.o(openPopup)
      } : {
        c: userInfo.value.avatar,
        d: common_vendor.t(userInfo.value.nickname || "微信用户"),
        e: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#666"
        }),
        f: common_vendor.o(openPopup),
        g: common_vendor.p({
          type: "plus",
          size: "30",
          color: "#fff"
        }),
        h: common_vendor.o(createRoom),
        i: common_vendor.p({
          type: "search",
          size: "30",
          color: "#fff"
        }),
        j: common_vendor.o(openJoinPopup)
      }, {
        k: inputRoomNumber.value,
        l: common_vendor.o(($event) => inputRoomNumber.value = $event.detail.value),
        m: common_vendor.o(joinRoom),
        n: common_vendor.sr(joinRoomPopup, "1cf27b2a-3", {
          "k": "joinRoomPopup"
        }),
        o: common_vendor.p({
          type: "bottom"
        }),
        p: avatarUrl.value || "/static/user-avatar.png",
        q: common_vendor.o(onChooseAvatar),
        r: common_vendor.o(onNicknameBlur),
        s: nickname.value,
        t: common_vendor.o(($event) => nickname.value = $event.detail.value),
        v: common_vendor.o(handleSubmit),
        w: common_vendor.sr(editPopup, "1cf27b2a-4", {
          "k": "editPopup"
        }),
        x: common_vendor.o(handleHide),
        y: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
