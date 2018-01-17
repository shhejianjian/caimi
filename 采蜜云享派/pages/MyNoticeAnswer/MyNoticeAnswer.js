var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeAnswer/MyNoticeAnswer";


var navibarTitle = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    navigateTitle:options.title
  });
  wx.setNavigationBarTitle({
    title: options.title
  })
  navibarTitle = options.title;
  if(options.title == '问答通知'){
    getNewData(10);
  } else if(options.title == '钱包明细'){
    getNewData(13);
  }
};

var currentPage = 1;
var getNewData = function (titleType) {
  currentPage = 1;
  myAnswerArr = [];
  getAnswerList(titleType);

};
var getMoreData = function (titleType) {
  currentPage++;
  getAnswerList(titleType);
};



var myAnswerArr = [];
var getAnswerList = function (titleType){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/notice/receive',
    data: {
      type: titleType,
      pageNo: currentPage,
      pageSize: 10,
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
        var date = simpleLib.getTime(data[i].sendTime);
        data[i].date = date;
        myAnswerArr.push(data[i]);
      }
      simpleLib.setData(route, {
        answerList: myAnswerArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

var getUpdateAnswerList = function (titleType,page) {
  myAnswerArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/notice/receive',
    data: {
      type: titleType,
      pageNo: 1,
      pageSize: page*10,
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
        var date = simpleLib.getTime(data[i].sendTime);
        data[i].date = date;
        myAnswerArr.push(data[i]);
      }
      simpleLib.setData(route, {
        answerList: myAnswerArr
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

var navigateToAnswerPage = function (event){
  clickPreview();
  var readStatus = event.currentTarget.dataset.readstatus;
  var noticeId = event.currentTarget.dataset.noticeid;
  var answerType = event.currentTarget.dataset.answertype;
  var topicId = event.currentTarget.dataset.topicid;

  if(readStatus == 0){
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/notice/receive/' + noticeId + '/read',
      data: {
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data);
        if(res.statusCode == 200){
          simpleLib.getGlobalData().isReadTopic = '1';
        }
      },
      fail: function (res) {

      }
    })
  }
  if(answerType==12){
    wx.navigateTo({
      url: '/pages/WenDaPage/WenDaPage?topicId=' + topicId,
    })
  } else {
    var answerId = event.currentTarget.dataset.answerid;
    wx.navigateTo({
      url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + answerId,
    })
  }

  
};


var onShow = function (){
  if (navibarTitle == '问答通知') {
    if (simpleLib.getGlobalData().isReadTopic == '1') {
      getUpdateAnswerList(10, currentPage);
      simpleLib.getGlobalData().isReadTopic = '';
    }
  } else if (navibarTitle == '钱包明细') {
    if (simpleLib.getGlobalData().isReadTopic == '1') {
      getUpdateAnswerList(13, currentPage);
      simpleLib.getGlobalData().isReadTopic = '';
    }
  }
  

};

var onReachBottom = function () {
  if (navibarTitle == '问答通知') {
    getMoreData(10);
  } else if (navibarTitle == '钱包明细') {
    getMoreData(13);
  }
};

Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  onReachBottom: onReachBottom,
  navigateToAnswerPage: navigateToAnswerPage,
})