// 调用服务器信息模块
import config from "./config";

// 网络请求的封装

export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync("cookies")
          ? wx.getStorageSync("cookies")
          : "",
      },
      success: (res) => {
        // console.log("请求成功：", res);
        resolve(res.data);
      },
      fali: (err) => {
        // console.log("请求失败：", err);
        reject(err);
      },
    });
  });
};
