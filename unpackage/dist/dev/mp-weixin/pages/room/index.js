"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const roomWatcher = common_vendor.ref(null);
    const formatTime = (timestamp) => {
      return common_vendor.dayjs(timestamp).format("HH:mm:ss");
    };
    const initWatch = () => {
      const db = common_vendor.er.database();
      if (roomWatcher.value) {
        common_vendor.index.__f__("log", "at pages/room/index.vue:100", "[监听] 关闭旧连接");
        roomWatcher.value.close();
      }
      common_vendor.index.__f__("log", "at pages/room/index.vue:104", "[监听] 开始建立新连接，房间ID:", roomData.value._id);
      roomWatcher.value = db.collection("rooms").doc(roomData.value._id).watch({
        onChange: (snapshot) => {
          common_vendor.index.__f__("log", "at pages/room/index.vue:110", snapshot);
          common_vendor.index.__f__("log", "at pages/room/index.vue:112", "[监听成功] 收到变更:", {
            id: snapshot.id,
            type: snapshot.type,
            doc: snapshot.docs[0]
          });
          handleDataChange(snapshot);
        },
        onError: (err) => {
          common_vendor.index.__f__("error", "at pages/room/index.vue:120", "[监听错误]", err);
          common_vendor.index.showToast({
            title: "连接中断，正在重连...",
            icon: "none"
          });
          setTimeout(initWatch, 5e3);
        }
      });
      common_vendor.index.__f__("log", "at pages/room/index.vue:129", roomWatcher.value);
    };
    const handleDataChange = (snapshot) => {
      common_vendor.index.__f__("log", "at pages/room/index.vue:134", "触发监听变更", snapshot);
      if (snapshot.docs && snapshot.docs.length > 0) {
        const newData = snapshot.docs[0];
        common_vendor.index.__f__("log", "at pages/room/index.vue:140", "[监听触发] 变更类型:", snapshot.type);
        common_vendor.index.__f__(
          "log",
          "at pages/room/index.vue:141",
          "[数据对比] 旧版本:",
          roomData.value.version,
          "新版本:",
          newData.version
        );
        roomData.value = {
          ...newData,
          // 保持响应式
          members: [...newData.members],
          logs: [...newData.logs]
        };
        nextTick(() => {
          const query = common_vendor.index.createSelectorQuery().in(this);
          query.select(".log-list").boundingClientRect((data) => {
            if (data) {
              common_vendor.index.pageScrollTo({
                scrollTop: data.height,
                duration: 300
              });
            }
          }).exec();
        });
      }
    };
    const roomData = common_vendor.ref({
      room_number: "",
      current_score: 0,
      members: [],
      logs: []
    });
    const outValue = common_vendor.ref("");
    const inValue = common_vendor.ref("");
    const outPopup = common_vendor.ref(null);
    const inPopup = common_vendor.ref(null);
    const userInfo = common_vendor.ref({});
    const openOut = () => {
      outPopup.value.open("bottom");
    };
    const handleOut = async () => {
      try {
        const res = await common_vendor.er.callFunction({
          name: "score_out",
          data: {
            roomId: roomData.value._id,
            userInfo: userInfo.value,
            amount: Number(outValue.value)
          }
        });
        if (res.result.code === 200) {
          common_vendor.index.showToast({ title: "支出成功" });
          await loadRoomData();
          outPopup.value.close();
        }
      } catch (e) {
        common_vendor.index.showToast({ title: e.message, icon: "none" });
      }
    };
    const openIn = () => {
      inPopup.value.open("bottom");
    };
    const handleIn = async () => {
      if (Number(inValue.value) > roomData.value.current_score) {
        common_vendor.index.showToast({
          title: "收回积分应小于或等于当前桌面积分",
          icon: "none"
        });
        return;
      }
      try {
        const res = await common_vendor.er.callFunction({
          name: "score_in",
          data: {
            roomId: roomData.value._id,
            userInfo: userInfo.value,
            amount: Number(inValue.value)
          }
        });
        if (res.result.code === 200) {
          inPopup.value.close();
          await loadRoomData();
        }
        common_vendor.index.__f__("log", "at pages/room/index.vue:276", "收回", res);
        common_vendor.index.showToast({ title: res.result.msg });
      } catch (e) {
        common_vendor.index.showToast({ title: e.message, icon: "none" });
      }
    };
    const roomNumber = common_vendor.ref("");
    common_vendor.onMounted(async () => {
      const params = getCurrentPages().pop().options;
      roomNumber.value = params.room_number;
      common_vendor.index.__f__("log", "at pages/room/index.vue:291", roomNumber.value);
      userInfo.value = utils_auth.getCurrentUser();
      await loadRoomData();
      common_vendor.index.__f__("log", "at pages/room/index.vue:297", "房间数据加载完成:", roomData.value._id);
      initWatch();
    });
    common_vendor.onUnmounted(() => {
      roomWatcher.value && roomWatcher.value.close();
    });
    const loadRoomData = async () => {
      try {
        const res = await common_vendor.er.callFunction({
          name: "get_room_info",
          data: { room_number: roomNumber.value }
        });
        if (res.result.code === 200) {
          roomData.value = res.result.data;
          common_vendor.index.__f__("log", "at pages/room/index.vue:315", res);
        } else {
          handleError(res.result.msg);
        }
      } catch (e) {
        handleError(e.message);
      }
    };
    const handleError = (msg) => {
      common_vendor.index.showToast({ title: msg || "数据加载失败", icon: "none" });
      setTimeout(() => common_vendor.index.navigateBack(), 1500);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(roomData.value.room_number),
        b: common_vendor.t(roomData.value.current_score),
        c: common_vendor.f(roomData.value.members, (member, memberIndex, i0) => {
          return {
            a: common_vendor.t(memberIndex + 1),
            b: member.avatar,
            c: common_vendor.t(member.nickname),
            d: common_vendor.t(member.personal_score),
            e: memberIndex
          };
        }),
        d: common_vendor.f(roomData.value.logs, (log, index, i0) => {
          return {
            a: common_vendor.t(formatTime(log.timestamp)),
            b: common_vendor.t(log.content),
            c: index
          };
        }),
        e: common_vendor.o(openOut),
        f: common_vendor.o(openIn),
        g: outValue.value,
        h: common_vendor.o(($event) => outValue.value = $event.detail.value),
        i: common_vendor.o(handleOut),
        j: common_vendor.sr(outPopup, "8a71c708-0", {
          "k": "outPopup"
        }),
        k: common_vendor.p({
          type: "bottom"
        }),
        l: inValue.value,
        m: common_vendor.o(($event) => inValue.value = $event.detail.value),
        n: common_vendor.o(handleIn),
        o: common_vendor.sr(inPopup, "8a71c708-1", {
          "k": "inPopup"
        }),
        p: common_vendor.p({
          type: "bottom"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8a71c708"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/room/index.js.map
