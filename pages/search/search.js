// pages/search/search.js
import request from "../../util/request";
// 防抖函数的初始值
let timer = null;
let isInvoke = false;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: "", // 搜索框placeholderContent的默认
    hotList: [], // 热搜榜数据
    searchContent: "", // 用户输入的表单
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 搜索历史记录
    newFunc: null, // debounce的新函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData();

    this.getSearchHistory();
  },
  // 获取本地历史记录
  getSearchHistory() {
    let historyList = wx.getStorageSync("searchHistory");
    if (historyList) {
      this.setData({
        historyList,
      });
    }
  },

  // 初始化搜索框的请求
  async getInitData() {
    let placeholderData = await request("/search/default");
    let hotListData = await request("/search/hot/detail");
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data,
    });
  },

  // 封装防抖函数debounce
  debounce(func, awit, immediate = false, resultCallback) {
    const _debounce = function (...args) {
      if (timer) clearTimeout(timer);

      if (immediate && !isInvoke) {
        // 立即执行
        const result = func.apply(this, args);
        if (resultCallback) resultCallback(result);
        isInvoke = true;
      } else {
        // 非立即执行
        timer = setTimeout(() => {
          const result = func.apply(this, args);
          if (resultCallback) resultCallback(result);
          isInvoke = false;
        }, awit);
        // 下一次立即执行
      }
    };
    // 定时器清除cancel
    _debounce.cancel = () => {
      clearTimeout(timer);
    };
    return _debounce;
  },

  // 封装请求/请求成功后储存搜索记录
  async getsearchList() {
    let { searchContent, historyList } = this.data;
    let searchListData = await request("/search", {
      keywords: searchContent,
      limit: 10,
    });
    this.setData({
      searchList: searchListData.result.songs,
    });

    // 储存搜索的历史记录
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1);
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList,
    });
    wx.setStorageSync("searchHistory", historyList);
  },

  // 输入框回调
  handleInputChange(event) {
    this.setData({
      searchContent: event.detail.value,
    });
    const newFunc = this.debounce(this.getsearchList, 1000);
    newFunc();
    this.setData({
      newFunc,
    });

    // 判断输入框有没有值，没有值的活直接取消防抖 newFunc.cancel()
    if (!this.data.searchContent) {
      newFunc.cancel();
    }
  },

  // 清除搜索框内容
  clearSearch() {
    this.setData({
      searchContent: "",
      searchList: "",
    });

    // 执行cancel()
    this.data.newFunc.cancel();
    this.setData({
      newFunc: null,
    });
  },

  // 清空历史记录
  deleteSearchHistory() {
    const _this = this;
    wx.showModal({
      title: "提示",
      content: "确定要清空历史记录吗?",
      success(res) {
        if (res.confirm) {
          console.log("确定", this);
          // 用户点击确定时
          // 1.historyList 重置为空
          _this.setData({
            historyList: [],
          });
          // 2.删除本地储存 searchHistory
          wx.removeStorageSync("searchHistory");
        } else if (res.cancel) {
          console.log("取消");
        }
      },
    });
    // this.setData({
    //   historyList: "",
    // });

    // 删除本地储存 historyList
    // wx.removeStorageSync("searchHistory");
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
