var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyCenter/MyCenter";


var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  
};

var id = '';
var onShow = function (){
  getNewLetter();
  id = setInterval(function () {
    getNewLetter();
  }, 1000 * 60);
  loadMyCenterInfo();
 
}

var getNewLetter = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/newsInfo',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var noticecount = res.data.notice + res.data.comment + res.data.like + res.data.message;
      if(noticecount == 0){
        simpleLib.setData(route, {
          noNotice: true,
        });
      } else {
        simpleLib.setData(route, {
          noNotice: false,
        });
      }
      simpleLib.setData(route, {
        noticeCount: noticecount,
      });
    },
    fail: function (res) {

    }
  })
};

var loadMyCenterInfo = function (){
  // wx.showLoading({
  //   title: '加载中',
  // });
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + simpleLib.getGlobalData().user.userId,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      // wx.hideLoading();
      console.log(res.data)
      if(res.statusCode == 200){
        simpleLib.setData(route, {
          user: res.data
        });
      } else {
        wx.hideLoading();
      }
      
    },
    fail: function (res) {
      // wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};




var clickPreview = function () {
  clearInterval(id);
  simpleLib.setData(route, {
    prevent: true
  });
  setTimeout(() => {
    simpleLib.setData(route, {
      prevent: false
    });
  }, 1000);
};

var navigateToMyPurse = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyPurse/MyPurse',
  })
};

var navigateToFollws = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyFollows/MyFollows?follow=1&title=我的关注',
  })
};

var navigateToFans = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyFollows/MyFollows?follow=2&title=我的粉丝',
  })
};

var navigateToNotice = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNotice/MyNotice',
  })
};

var navigateToMyLessonList = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/LessonList/LessonList?lessonTypeTitle=已购课程',
  })
};

var navigateToMyUserInfo = function (event){
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId +'&isSelf=1',
  })
};

var navigateToMySetting = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMainSetting/MyMainSetting?phoneNumber=' + event.currentTarget.dataset.phonenumber,
  })
};

Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  navigateToMyPurse: navigateToMyPurse,
  navigateToFollws: navigateToFollws,
  navigateToFans: navigateToFans,
  navigateToNotice: navigateToNotice,
  navigateToMyLessonList: navigateToMyLessonList,
  navigateToMyUserInfo: navigateToMyUserInfo,
  navigateToMySetting: navigateToMySetting,
})