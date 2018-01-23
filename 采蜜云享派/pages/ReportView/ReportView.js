var simpleLib = require('../libs/simple-lib.js');
var route = "pages/ReportView/ReportView";

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

var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    commentId:options.commentId,
    userNickName:options.userName,
    userContent:options.content,
    commentType:options.relatedType
  });
  getReportReason();
};

var getReportReason = function (){
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/system/code/tree?tag=ReportReason',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      simpleLib.setData(route, {
        reportReason: res.data,
        reasonId:res.data[0].objectId
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.toast("查询失败")
    }
  })
};

var chooseReportItem = function (event){
  simpleLib.setData(route, {
    reasonId: event.currentTarget.dataset.reasonindex,
  });
};

var commit = function (){
  clickPreview();
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/contentReport',
    data: {
      relatedId:this.data.commentId,
      relatedType:this.data.commentType,
      reportReason: {
        objectId: this.data.reasonId
      },
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: "POST",
    success: function (res) {
      console.log(res);
      if (res.statusCode == 200) {
        simpleLib.toast("举报成功");
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      } else {
        simpleLib.failToast("网络不稳定");
      }
    },
    fail: function (res) {
      simpleLib.failToast("举报失败");
    },
  });
};

Page({
  data: {
    userNickName : '',
    userContent:'',
    commentId:'',
    reasonId:'',
    commentType:'',
  },
  onLoad: onload,
  chooseReportItem: chooseReportItem,
  commit: commit,
})