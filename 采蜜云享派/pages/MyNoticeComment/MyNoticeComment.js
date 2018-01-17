var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeComment/MyNoticeComment";


var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getRecieveReplyList();
  getMyReplyList();
};

var changeReciveReplyList = function (){
  simpleLib.setData(route, {
    isMyOrRecieve: true
  });
};
var changeMyReplyList = function (){
  simpleLib.setData(route, {
    isMyOrRecieve: false
  });
};

//收到的回复
var receiveReplyArr = [];
var getRecieveReplyList = function (){
  receiveReplyArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/receive',
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
var getMyReplyList = function (){
  myReplyArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/submit',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
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


Page({
  data: {
    isMyOrRecieve:true,
  },
  onLoad: onload,
  changeMyReplyList: changeMyReplyList,
  changeReciveReplyList: changeReciveReplyList,
})