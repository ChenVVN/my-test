"use strict";
const createConfig = require("uni-config-center");
const wxConfig = createConfig({ // 获取配置实例
	pluginId: 'wx-config' // common/uni-config-center下的插件配置目录名
})
const ConfigInfo = wxConfig.config() // 获取common/uni-config-center/share-config/config.json的内容

exports.main = async (event, context) => {
	
	let url =
		"https://api.weixin.qq.com/sns/jscode2session?appid=" +
		ConfigInfo.appid +
		"&secret=" +
		ConfigInfo.secret +
		"&js_code=" +
		event.code +
		"&grant_type=authorization_code";
	let res = await uniCloud.httpclient.request(
		url, // 请求路径,
		{
			dataType: "json",
		}
	);
	return res;
};