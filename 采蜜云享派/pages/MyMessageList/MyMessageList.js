var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMessageList/MyMessageList";



var userID = '';
var id = '';
var onload = function (options) {
  wx.getSystemInfo({
    success: function (res) {
      console.log(res.windowHeight);
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight -132
      });
    }
  });
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
  });
  wx.setNavigationBarTitle({
    title: '与 '+ options.nickName + ' 的对话'
  })
  userID = options.userId;
  getNewData();
  id = setInterval(function () {
    getNewLetter();
  }, 1000 * 5);
};

var setBottom = function (){
  setTimeout(function () {
    simpleLib.setData(route, {
      toView: 'bottom',
    });
  }, 300)
};

var onUnload = function (){
  clearInterval(id);
  messageArr = [];
};
var lasttime = 0;
var getNewLetter = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message/' + userID + '?lastMessageTime=' + lasttime,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data;
      if(data.length>0){
        lasttime = data[0].timestamp;
        for (var i = 0; i < data.length; i++) {
          messageArr.push(data[i]);
        }
        simpleLib.setData(route, {
          messageList: messageArr,
        });
        setBottom();
      }
    },
    fail: function (res) {

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


var currentPage = 1;
var currentPageSize = 15;
var getNewData = function (){
  currentPage = 1;
  currentPageSize = 15;
  messageArr = [];
  getMessageList();
  
};
var getMoreData = function (){
  currentPage++;
  currentPageSize = 8;
  getMessageList();
};

var messageArr = [];
var getMessageList = function (){
  
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message/'+userID+'/history',
    data: {
      pageNo:currentPage,
      pageSize: currentPageSize,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.getTime(data[i].timestamp);
        data[i].date = date;
        messageArr.unshift(data[i]);
      }
      lasttime = messageArr[messageArr.length-1].timestamp;
      simpleLib.setData(route, {
        messageList: messageArr
      });
      if(currentPage==1){
        setBottom();
      }
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var toupper = function (){
  getMoreData();
};


var bindConfirm = function (event){
  console.log(event.detail.value);
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message',
    data: {
      content:event.detail.value,
      toUser:{
        objectId:userID
      }
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data)
      if(res.statusCode == 200){
        simpleLib.getGlobalData().isSend = '1';
        var data = {
          avatar: simpleLib.getGlobalData().user.avatar,
          content: res.data.content,
          timestamp: res.data.sendTime,
          mine:1,
          successive:res.data.successive
        }
        messageArr.push(data);
        console.log(messageArr);
        simpleLib.setData(route, {
          textValue: '',
          messageList: messageArr,
        });
        setBottom();

        
      }
      
    },
    fail: function (res) {

    }
  })
};



Page({
  data: {
    textValue:'',
    toView:'bottom'
  },
  onLoad: onload,
  onUnload: onUnload,
  bindConfirm: bindConfirm,
  toupper: toupper,
})