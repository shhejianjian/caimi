var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeComment/MyNoticeComment";

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

var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getNewReceiveData();
  getNewmyReplyData();
};

var isReceiveStr = 1;
var changeReciveReplyList = function (){
  isReceiveStr = 1;
  simpleLib.setData(route, {
    isMyOrRecieve: true
  });
};
var changeMyReplyList = function (){
  isReceiveStr = 2;
  simpleLib.setData(route, {
    isMyOrRecieve: false
  });
};

//收到的回复
var receiveReplyArr = [];
var receivePage = 1;
var getNewReceiveData = function (){
  receivePage = 1;
  receiveReplyArr = [];
  getRecieveReplyList();
};
var getMoreReceiveData = function () {
  receivePage++;
  getRecieveReplyList();
};

var getRecieveReplyList = function (){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/receive',
    data: {
      pageNo:receivePage,
      pageSize:10,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.getTime(data[i].submitTime);
        data[i].date = date;
        var item;
        if(data[i].replyList.length>0){ 
          item = data[i].replyList[0];
          data[i].replyList = undefined;
          item.replyList= [data[i]];
        } else {
          item = data[i];
        }
        receiveReplyArr.push(item);
      }
      console.log(receiveReplyArr);
      simpleLib.setData(route, {
        receiveReplyList: receiveReplyArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

//我回复的
var myReplyArr = [];
var myReplyPage = 1;
var getNewmyReplyData = function () {
  myReplyPage = 1;
  myReplyArr = [];
  getMyReplyList();
};
var getMoremyReplyData = function () {
  myReplyPage++;
  getMyReplyList();
};
var getMyReplyList = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/submit',
    data: {
      pageNo: myReplyPage,
      pageSize:10,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      var data = res.data.content;
      for (var i = 0; i < data.length; i++) {
          var date = simpleLib.getTime(data[i].submitTime);
          data[i].date = date;
          var item;
          if (data[i].replyList.length > 0) {
            item = data[i].replyList[0];
            data[i].replyList = undefined;
            item.replyList = [data[i]];

          } else {
            item = data[i];
          }
          myReplyArr.push(item);
      }
      simpleLib.setData(route, {
        myReplyList: myReplyArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var onReachBottom = function () {
  if(isReceiveStr == 1){
    getMoreReceiveData();
  } else if (isReceiveStr == 2){
    getMoremyReplyData();
  }
};

var navigateToDetailPage = function (event){
  clickPreview();
  var relatedId = event.currentTarget.dataset.relatedid;
  var relatedType = event.currentTarget.dataset.relatedtype;
  if (relatedType == "Course"){
    wx.navigateTo({
      url: '/pages/LessonPage/LessonPage?objectId=' + relatedId,
    })
  } else if(relatedType == "Answer"){
    wx.navigateTo({
      url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + relatedId,
    })
  }
};

var navigateToCommentDetail = function (event){
  clickPreview();
  var commentId = event.currentTarget.dataset.commentid;
  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
};

Page({
  data: {
    isMyOrRecieve:true,
  },
  onLoad: onload,
  onReachBottom: onReachBottom,
  changeMyReplyList: changeMyReplyList,
  changeReciveReplyList: changeReciveReplyList,
  navigateToDetailPage: navigateToDetailPage,
  navigateToCommentDetail: navigateToCommentDetail,
})