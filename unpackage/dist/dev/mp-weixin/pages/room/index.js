"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const roomData = common_vendor.ref({
      room_number: "",
      current_score: 0,
      members: [],
      logs: []
    });
    const roomNumber = common_vendor.ref("");
    common_vendor.onMounted(async () => {
      const params = getCurrentPages().pop().options;
      roomNumber.value = params.room_number;
      common_vendor.index.__f__("log", "at pages/room/index.vue:68", roomNumber.value);
      loadRoomData();
    });
    const loadRoomData = async () => {
      try {
        const res = await common_vendor.er.callFunction({
          name: "get_room_info",
          data: { room_number: roomNumber.value }
        });
        if (res.result.code === 200) {
          roomData.value = res.result.data;
          common_vendor.index.__f__("log", "at pages/room/index.vue:82", res);
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
    const logs = [
      {
        time: "12:00",
        content: "wnccc 加入房间",
        type: "join"
      },
      {
        time: "12:05",
        content: "wnccc 支出2",
        type: "action"
      },
      {
        time: "12:10",
        content: "wnccc 收回43",
        type: "score-up"
      }
    ];
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(roomData.value.room_number),
        b: common_vendor.f(logs, (log, index, i0) => {
          return {
            a: common_vendor.t(log.time),
            b: common_vendor.t(log.content),
            c: index,
            d: common_vendor.n(log.type)
          };
        }),
        c: common_vendor.f(5, (member, memberIndex, i0) => {
          return {
            a: common_vendor.t(memberIndex + 1),
            b: memberIndex
          };
        }),
        d: common_assets._imports_0,
        e: common_vendor.o((...args) => _ctx.handleOut && _ctx.handleOut(...args)),
        f: common_vendor.o((...args) => _ctx.handleIn && _ctx.handleIn(...args))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8a71c708"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/room/index.js.map
