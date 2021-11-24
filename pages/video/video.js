import request from "../../util/request";
// pages/video/video.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航数据
    navId: null, // 点击导航下标值
    videoList: [], // 视频列表数据
    videoId: "", // 切换image is video 的决定值
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 标识下拉刷新是否被触发
    videoListId: 8,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航数据
    this.getVideoGroupListData();
    //
  },

  // 导航数据封装
  async getVideoGroupListData() {
    let videoGroupListData = await request("/video/group/list");
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id,
    });

    // 设置完setData后执行
    this.getVideoListData(this.data.navId);
  },
  // 获取视频列表数据
  async getVideoListData(navId) {
    let videoListData = await request("/video/group", { id: navId });
    let index = 0;
    let videoList = videoListData.datas.map((item) => {
      item.id = index++;
      return item;
    });

    // 更新数据/上拉刷新为false
    this.setData({
      videoList,
    });
    // 延迟更新效果
    setTimeout(() => {
      this.setData({
        isTriggered: false,
      });
    }, 500);

    // 请求赋完值结束加载显示
    wx.hideLoading();
  },

  // 点击导航切换回调 变颜色
  changeNav(event) {
    // console.log(event.currentTarget.dataset.id);
    let navId = event.currentTarget.dataset.id;
    this.setData({
      navId,
      videoList: [],
    });

    // 切换数据显示加载提示
    wx.showLoading({
      title: "加载中！",
    });

    // 点击改变页面的数据
    this.getVideoListData(this.data.navId);
  },

  // 点击播放的回调函数bindplay="handlePlay"
  handlePlay(event) {
    let vid = event.currentTarget.id;
    // // 1.点击播放 暂停上一个视频
    // this.vid !== vid && this.VideoContext !== undefined
    //   ? this.VideoContext.stop()
    //   : "";

    // this.vid = vid;

    // 跟新videoId的值
    this.setData({
      videoId: vid,
    });

    // 获取video实例
    this.VideoContext = wx.createVideoContext(vid);

    // 实现播放记录
    let { videoUpdateTime } = this.data;
    let videoItem = videoUpdateTime.find((item) => item.vid === vid);
    if (videoItem) {
      // this.VideoContext.seek(videoItem);
      this.VideoContext.seek(videoItem.currentTime);
    }

    // 设置好videoId 的值之后自动播放视频
    setTimeout(() => {
      this.VideoContext.play();
    }, 200);
  },

  // 监听视频播放进度的回调
  handleTiemUpdate(event) {
    // console.log(event);
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime,
    };
    let { videoUpdateTime } = this.data;
    // 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    let videoItem = videoUpdateTime.find(
      (item) => item.vid === videoTimeObj.vid
    );
    if (videoItem) {
      // 有以前id的时候
      videoItem.currentTime = event.detail.currentTime;
    } else {
      // 没有以前id的时候
      videoUpdateTime.push(videoTimeObj);
    }
    // 最后跟新数据
    this.setData({
      videoUpdateTime,
    });
  },

  // 视频播放结束调用的回调  视频播放结束后删除储存的播放记录 videoUpdateTime
  handleEnd(event) {
    let { videoUpdateTime } = this.data;
    // 移除记录播放时长数组中当前视频的对象
    let videoIndex = videoUpdateTime.findIndex(
      (item) => item.vid === event.currentTarget.id
    );
    videoUpdateTime.splice(videoIndex, 1);
    this.setData({
      videoUpdateTime,
    });
  },

  // 下拉刷新回调/方法实现
  handleRefresher() {
    this.getVideoListData(this.data.navId);
  },

  // 上拉底部加载更多数据 自定义上拉触底的回调 scroll-view
  async handleToLower() {
    let getId = this.data.navId;
    let { videoListId, videoList } = this.data;
    let pullUpLoading = await request("/video/group", {
      id: getId,
      offset: videoListId,
    });

    let newVideoList = pullUpLoading.datas.map((item) => {
      item.id = videoListId++;
      return item;
    });
    videoList.push(...newVideoList);
    this.setData({
      videoListId,
      videoList,
    });
  },

  // 跳转搜索页面
  toSearch() {
    wx.navigateTo({
      url: "../search/search",
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
  onShareAppMessage: function ({ from }) {
    console.log(from);
  },
});
