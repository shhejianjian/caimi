var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyCenter/MyCenter";


var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  
};

var id = '';
const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function (){
  getNewLetter();
  id = setInterval(function () {
    getNewLetter();
  }, 1000 * 60);
  loadMyCenterInfo();
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth: res.windowHeight
      });
    }
  });
  if (simpleLib.getGlobalData().isPlayingAudio == '1') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.playImage': '../../image/stopIcon.png',
    })
    setProgressTimer = setInterval(function () {
      simpleLib.setData(route, {
        'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      })
    }, 1000);
    backgroundAudioManager.onEnded((res) => {
      clearInterval(setProgressTimer);
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      simpleLib.setData(route, {
        'audioInfo.currentTime': '00:00',
      })
    });
  } else if (simpleLib.getGlobalData().isPlayingAudio == '3') {
    simpleLib.setData(route, {
      isShowSimpleAudio: false
    })
  } else if (simpleLib.getGlobalData().isPlayingAudio == '2') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      'audioInfo.playImage': '../../image/bofangicon.png',
    })
  }
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
  wx.showNavigationBarLoading();
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
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
      console.log(res.data)
      if(res.statusCode == 200){
        simpleLib.setData(route, {
          user: res.data
        });
      } else {
        // wx.hideLoading();
      }
      
    },
    fail: function (res) {
      // wx.hideLoading();
      wx.hideNavigationBarLoading();
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


var onPullDownRefresh = function () {
  loadMyCenterInfo();
  getNewLetter();


};

var onHide = function (){
  clearInterval(id);
  clearInterval(setProgressTimer);
};
//公用悬浮音频组件内的播放暂停事件
var playAudio = function (event) {
  var playImage = event.currentTarget.dataset.playimage;
  console.log(playImage);
  if (playImage == '../../image/stopIcon.png') {
    console.log('暂停');
    backgroundAudioManager.pause();
    //播放暂停事件
    backgroundAudioManager.onPause((res) => {
      simpleLib.getGlobalData().isPlayingAudio = '2';
      console.log('暂停了');
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
      });
    });
  } else if (playImage == '../../image/bofangicon.png') {
    console.log('播放');
    backgroundAudioManager.play();
    //正在播放事件
    backgroundAudioManager.onPlay((res) => {
      console.log('播放了');
      simpleLib.getGlobalData().isPlayingAudio = '1';
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/stopIcon.png',
      });
      setProgressTimer = setInterval(function () {
        simpleLib.setData(route, {
          'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
        })
      }, 1000);
    });
    //播放结束事件
    backgroundAudioManager.onEnded((res) => {
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
    //播放停止事件
    backgroundAudioManager.onStop((res) => {
      console.log('停止了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
  }
};

Page({
  data: {
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onHide: onHide,
  playAudio: playAudio,
  onShow: onShow,
  onPullDownRefresh: onPullDownRefresh,
  navigateToMyPurse: navigateToMyPurse,
  navigateToFollws: navigateToFollws,
  navigateToFans: navigateToFans,
  navigateToNotice: navigateToNotice,
  navigateToMyLessonList: navigateToMyLessonList,
  navigateToMyUserInfo: navigateToMyUserInfo,
  navigateToMySetting: navigateToMySetting,
})