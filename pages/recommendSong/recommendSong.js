// pages/recommendSong/recommendSong.js
import PubSub from "pubsub-js";
import request from "../../util/request";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    day: "", // 日
    month: "", // 月
    recommendList: [], //每日推荐数据
    index: "", // 初始化 上一首/下一首的下标值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断用户是否登录
    // 1.拿到用户登录信息
    let userInfo = wx.getStorageSync("userInfo");
    // 1.1.判断是否有信息
    if (!userInfo) {
      // 如果没有信息 显示请登录 并且跳转到登录页面
      wx.showToast({
        title: "用户未登录，请登录！",
        icon: "none",
        success: () => {
          wx.reLaunch({
            url: "../login/login",
          });
        },
      });
    }
    // 更新时间
    let day = new Date().getDate();
    let month = new Date().getMonth() + 1;
    this.setData({
      day,
      month,
    });
    // 订阅者 订阅来自songDetail页面发布的消息
    PubSub.subscribe("switchType", (msg, type) => {
      let { recommendList, index } = this.data;
      console.log(msg, type);
      // 判读是上一首还是下一首
      if (type === "pre") {
        // 当歌曲是第一首的时候 点击上一首是最后一首
        index === 0 && (index = recommendList.length);
        index -= 1;
      } else {
        // 当歌曲是最后一首的时候 点击下一首是第一首
        index === recommendList.length - 1 && (index = -1);
        index += 1;
      }
      // 更新下标
      this.setData({
        index,
      });
      // 获取musicId
      let musicId = recommendList[index].id;
      // 发布者 发布歌曲id数据给songDetail页面
      PubSub.publish("musicId", musicId);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取每日推荐音乐数据
    this.getRecommendList();
  },

  // 封装每日推荐数据的请求
  async getRecommendList() {
    let recommendListData = await request("/recommend/songs");
    this.setData({
      recommendList: recommendListData.recommend,
    });
  },

  // 点击每个list跳转到详情页
  toSongDetail(event) {
    // 在跳转之前传入每个音乐song.id
    console.log(event);
    let { song, index } = event.currentTarget.dataset;
    // 把上一首下一首的下标值赋值给data.index
    this.setData({
      index,
    });
    console.log(song, index);
    // 跳转到songDetail页面
    wx.navigateTo({
      url: "../songDetail/songDetail?musicId=" + JSON.stringify(song.id),
    });
  },

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
