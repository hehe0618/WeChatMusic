import PubSub from "pubsub-js";
import moment from "moment";
import request from "../../util/request";
// 获取全局初始化的数据对象 appInstance
const appInstance = getApp();
// pages/songDetail/songDetail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 标识音乐是否播放
    songList: [], // 初始化音乐数据
    musicId: "", // 音乐id
    musicUrl: "", // 音乐连接
    currentTime: "00:00", // 实时时长
    durationTime: "00:00", // 总时长
    currentWidth: 0, // 实时的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉

    // 调用音乐详情请求方法
    let musicId = options.musicId;
    this.getSongListData(musicId);
    this.setData({
      musicId,
    });
    // console.log(
    //   appInstance.globalData.isMusicPlay,
    //   appInstance.globalData.musicId,
    //   musicId
    // );
    // 判断进来页面时音乐是否在播放
    if (
      appInstance.globalData.isMusicPlay &&
      appInstance.globalData.musicId == musicId
    ) {
      this.setData({
        isPlay: true,
      });
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 通过控制音频的实例backgroundAudioManager 去监听音乐播放/暂停/停止/播放自然结束 (解决播放/暂停系统音频导致页面还没改变的现状)
    this.backgroundAudioManager.onPlay(() => {
      // 播放回调
      this.changePlayState(true);
      // 修改全局音乐播放的id
    });
    this.backgroundAudioManager.onPause(() => {
      // 暂停回调
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      // 停止回调
      this.changePlayState(false);
    });
    // 结束回调
    this.backgroundAudioManager.onEnded(() => {
      // this.changePlayState(false);
      PubSub.publish("switchType", "next");
      this.subscribeFn();
      this.setData({
        currentWidth: 0,
        currentTime: "00:00",
      });
    });
    // 监听背景音频播放进度更新事件
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 在每次进入页面的时候判断 播放的音乐是否和进入的页面一样
      let { currentWidth, currentTime } = this.data;
      if (appInstance.globalData.musicId == musicId || this.data.isPlay) {
        // 获取音乐实时时间并且格式化
        currentTime = moment(
          this.backgroundAudioManager.currentTime * 1000
        ).format("mm:ss");
        // 获取音乐实时长度
        currentWidth =
          (this.backgroundAudioManager.currentTime /
            this.backgroundAudioManager.duration) *
          450;
      } else {
        currentTime = "00:00";
        currentWidth = 0;
      }
      this.setData({
        currentTime,
        currentWidth,
      });
    });
  },

  // 封装修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay,
    });
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },

  // 封装音乐详情请求  /song/detail?ids=347230
  async getSongListData(ids) {
    // 获取音乐数据
    let songListData = await request("/song/detail", { ids });
    // 获取并格式化总时长
    let durationTime = moment(songListData.songs[0].dt).format("mm:ss");
    this.setData({
      songList: songListData.songs[0],
      durationTime,
    });
    //设置导航栏的title
    wx.setNavigationBarTitle({
      title: this.data.songList.name,
    });
  },

  // 播放/暂停按钮的回调
  handleMusicPlay() {
    let { isPlay, musicId, musicUrl } = this.data;
    // 修改是否播放的状态
    // this.setData({
    //   isPlay: !isPlay,
    // });
    // 调用音乐API
    isPlay = !isPlay;
    this.setData({
      isPlay,
    });
    this.musicControl(isPlay, musicId, musicUrl);
  },

  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicUrl) {
    appInstance.globalData.musicId = musicId;

    if (isPlay) {
      // 获取音乐连接
      if (!musicUrl) {
        let musicUrlData = await request("/song/url", { id: musicId });
        musicUrl = musicUrlData.data[0].url;
      }
      this.setData({
        musicUrl,
      });
      // console.log(musicUrlData.data[0].url);
      // 播放的时候
      this.backgroundAudioManager.src = musicUrl;
      // 音乐标题
      this.backgroundAudioManager.title = this.data.songList.name;
    } else {
      // 暂停的时候
      this.backgroundAudioManager.pause();
    }
  },

  // 点击上一首/下一首的回调方法
  handleSwitch(event) {
    // 获取type pre || next
    let type = event.currentTarget.id;
    // 暂停上一首歌曲
    this.backgroundAudioManager.stop();
    // 判断用户点击上一首||下一首
    if (type === "pre") {
      // 上一首
      // 发布者 发布消息数据给recommendSong页面
      PubSub.publish("switchType", type);
    } else {
      // 下一首
      // 发布者 发布消息数据给recommendSong页面
      PubSub.publish("switchType", type);
    }

    // 调用封装订阅者的方法方法
    this.subscribeFn();
  },

  // 封装订阅者/发布者方法
  subscribeFn() {
    // 订阅者 收集recommendSong页面发来的 musicId bug：每次收集一次会累加收集 收集完必须取消订阅
    PubSub.subscribe("musicId", (msg, musicId) => {
      this.setData({
        musicId,
      });
      // console.log(msg, musicId);
      // 上下一首更新音乐数据
      this.getSongListData(musicId);
      // 更新完自动播放
      this.musicControl(true, musicId);
      // 取消订阅
      PubSub.unsubscribe("musicId");
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
