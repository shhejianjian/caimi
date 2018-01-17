var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNotice/MyNotice";


var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getMessageListInfo();
};

var onShow = function (){
  getNewLetter();
  if (simpleLib.getGlobalData().isSend == '1'){
    getMessageListInfo();
  }
};

var getNewLetter = function () {
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/newsInfo',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res)
      
      simpleLib.setData(route, {
        noticeCount: res.data,
      });
    },
    fail: function (res) {

    }
  })
};

//私信列表
var messageListArr=[];
var getMessageListInfo = function (){
  messageListArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message/conversation',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data.content;
      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.getTime(data[i].lastMessageInfo.timestamp);
        data[i].date = date;
        messageListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        messageList: messageListArr
      });
      
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

var clickPreview = function () {
  simpleLib.setData(route, {
    prevent: true
  });
  setTimeout(() => {
    simpleLib.setData(route, {
      prevent: false
    });
  }, 1000);
};

var navigateToMyNoticeComment = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNoticeComment/MyNoticeComment',
  })
};

var navigateToMyNoticeZan = function (){
 clickPreview();
  wx.navigateTo({
    url: '/pages/MyNoticeZan/MyNoticeZan',
  })
};

var navigateToMyNoticeAnswer = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNoticeAnswer/MyNoticeAnswer?title=问答通知',
  })
};

var navigateToMessageList = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMessageList/MyMessageList?nickName=' + event.currentTarget.dataset.nickname + '&userId=' + event.currentTarget.dataset.userid,
  })
};

Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  navigateToMyNoticeComment: navigateToMyNoticeComment,
  navigateToMyNoticeZan: navigateToMyNoticeZan,
  navigateToMyNoticeAnswer: navigateToMyNoticeAnswer,
  navigateToMessageList: navigateToMessageList,
})