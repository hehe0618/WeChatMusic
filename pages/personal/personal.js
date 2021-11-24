import request from "../../util/request";

let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离
// pages/personal/personal.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: "translateY(0)",
    coveTransition: "",
    userInfo: {}, // 用户信息
    recentPlayList: [], // 最近播放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 登录成功后跳转回来赋值给data.userInfo
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo),
      });
      this.getUserRecentPlayList(this.data.userInfo.userId);
    }
  },

  // 封装历史记录请求方法
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request("/user/record", {
      uid: userId,
      type: 0,
    });
    let index = 0;
    let recentPlayList = recentPlayListData.allData
      .splice(0, 10)
      .map((item) => {
        item.id = index++;
        return item;
      });
    this.setData({
      recentPlayList: recentPlayList,
    });
  },

  // 滚动方法
  // 手指点击调用事件
  handleTouchStart(event) {
    // 获取点击时的位置
    startY = event.touches[0].clientY;
    // 点击时过度为空
    this.setData({
      coveTransition: "",
    });
    // console.log(startY);
  },
  // 手指移动调用事件
  handleTouchMove(event) {
    // 获取移动位置
    moveY = event.touches[0].clientY;
    // 计算移动的距离 移动的位置 - 初始点击的位置
    moveDistance = moveY - startY;
    // 禁止向上移动
    if (moveDistance <= 0) {
      return;
    }
    // 限制移动距离为80
    if (moveDistance >= 80) {
      moveDistance = 80;
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,
    });
  },
  // 手指离开调用事件
  handleTouchEnd() {
    this.setData({
      // 离开为0
      coverTransform: `translateY(0rpx)`,
      // 1s的过度动画
      coveTransition: "transform 0.5s linear",
    });
    // console.log("End");
  },

  // 1.跳转到登录页面 reLaunch跳转时会关闭页面
  toLogin() {
    wx.reLaunch({
      url: "../login/login",
    });
  },

  // 2.点击按钮退出
  queIt() {
    // 清空本地存储userInfo
    // 清空最近播放数据recentPlayList
    wx.removeStorage({
      key: "userInfo",
      success: (res) => {
        wx.reLaunch({
          url: "../personal/personal",
        });
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
