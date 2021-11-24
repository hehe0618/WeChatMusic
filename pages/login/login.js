import request from "../../util/request";

// pages/login/login.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    password: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  // 登录逻辑
  // 1.获取表达数据
  handleInput(event) {
    let idType = event.currentTarget.dataset.type;

    this.setData({
      // 原始写法
      // phone: idType === "phone" ? event.detail.value : this.data.phone,
      // password: idType === "password" ? event.detail.value : this.data.password,

      // 进阶写法(重点)
      [idType]: event.detail.value,
    });
  },

  // 2.登录验证(非请求！！！)
  async login() {
    let { phone, password } = this.data;
    let phoneRegular = /^1(3|4|5|6|7|8|9)\d{9}$/;
    if (!phone) {
      wx.showToast({
        title: "手机密码不能为空",
        icon: "none",
      });
      return;
    }
    if (!phoneRegular.test(phone)) {
      wx.showToast({
        title: "手机号格式不正确",
        icon: "none",
      });
      return;
    }
    if (!password) {
      wx.showToast({
        title: "密码不能为空",
        icon: "none",
      });
      return;
    }

    // 登录请求
    let result = await request("/login/cellphone", { phone, password }, "GET");
    if (result.code === 200) {
      wx.showToast({
        title: "登录成功!",
      });
      // 储存登录cookeis
      wx.setStorage({
        key: "cookies",
        data: result.cookie,
      });
      // 储存登录信息
      wx.setStorageSync("userInfo", JSON.stringify(result.profile));
      // 跳转到主页面 switchTab 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
      wx.switchTab({
        url: "../personal/personal",
      });
    } else if (result.code === 501) {
      wx.showToast({
        title: "手机号错误，请重新登录!",
        icon: "none",
      });
    } else if (result.coder === 502) {
      wx.showToast({
        title: "密码错误，请重新登录!",
        icon: "none",
      });
    } else if (result.code === 509) {
      wx.showToast({
        title: "密码错误超过限制！！！",
        icon: "none",
      });
    } else {
      wx.showToast({
        title: "登录失败，请重新登录!",
        icon: "none",
      });
    }
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
