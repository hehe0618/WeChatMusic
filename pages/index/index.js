import request from "../../util/request";
// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐数据
    topList: [], // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // wx.request({
    //   url: "http://123.207.32.32:9001/banner",
    //   data: { type: "2" },
    //   success: (res) => {
    //     console.log("请求成功：", res);
    //   },
    //   fail: (err) => {
    //     console.log("请求失败：", err);
    //   },
    // });
    // 轮播图请求
    const bannerListData = await request("/banner", { type: 2 });
    this.setData({
      bannerList: bannerListData.banners,
    });
    // 推荐请求
    const recommendListData = await request("/personalized", { limit: 10 });
    this.setData({
      recommendList: recommendListData.result,
    });
    // 排行榜数据请求
    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request("/top/list", { idx: index++ });
      let topListItem = {
        name: topListData.playlist.name,
        // splice(会修改原数组，可以指定增删改查) slice(不会修改原数组)
        tracks: topListData.playlist.tracks.slice(0, 3),
      };
      resultArr.push(topListItem);
      this.setData({
        topList: resultArr,
      });
    }
  },

  // 点击每日推荐跳转
  handleItem(){
    wx.navigateTo({
      url: '../recommendSong/recommendSong',
    })
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
