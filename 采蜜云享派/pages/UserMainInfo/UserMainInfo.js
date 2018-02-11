var simpleLib = require('../libs/simple-lib.js');
var route = "pages/UserMainInfo/UserMainInfo";



var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};


var isSelfStr = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    isSelf: options.isSelf,
    userId: options.userId,
  });
  isSelfStr = options.isSelf;
  if(options.isSelf == 0){
    simpleLib.setData(route, {
      questionTabtitle: '他的提问',
      answerTabtitle: '他的回答'
    });
  } else if(options.isSelf == 1){
    simpleLib.setData(route, {
      questionTabtitle: '我的提问',
      answerTabtitle: '我的回答'
    });
  }  
  getUserDetailInfo(this.data.userId);
  getNewQuestionList(this.data.userId);
  getNewAnswerList(this.data.userId);
  getNewFollowList(this.data.userId);
};

var getUserDetailInfo = function (userid){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data;
      if (data.currentUserFollow == 0){
        data.followStr = '关注';
      } else if (data.currentUserFollow == 1){
        data.followStr = '已关注';
      }
      simpleLib.setData(route, {
        userInfo: data
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};


var questionListPage = 1;
var questionListArr = [];
var getNewQuestionList = function (userid){
  questionListPage = 1;
  questionListArr = [];
  getUserQuestionList(userid);
};
var getMoreQuestionList = function (userid) {
  questionListPage++;
  getUserQuestionList(userid);
};
var getUserQuestionList = function (userid){
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid + '/topic',
    data: {
      pageNo:questionListPage,
      pageSize:10,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.lastTime(data[i].expiredTime);
        data[i].date = date;
        if (data[i].followed == 0) {
          data[i].followStr = '关注问题';
        } else if (data[i].followed == 1) {
          data[i].followStr = '已关注';
        }
        if (data[i].bestAnswerLiked == 0) {
          data[i].likeStr = '点赞';
        } else if (data[i].bestAnswerLiked == 1) {
          data[i].likeStr = '已赞';
        }
        questionListArr.push(data[i]);
      };
      simpleLib.setData(route, {
        questionsList: questionListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};


var answerListPage = 1;
var answerListArr = [];
var getNewAnswerList = function (userid) {
  answerListPage = 1;
  answerListArr = [];
  getUserAnswerList(userid);
};
var getMoreAnswerList = function (userid) {
  answerListPage++;
  getUserAnswerList(userid);
};
var getUserAnswerList = function (userid){
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid + '/answer',
    data: {
      pageNo:answerListPage,
      pageSize:10,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.getTime(data[i].submitTime);
        data[i].date = date;
        if (data[i].topicInfo.followed == 0) {
          data[i].topicInfo.followStr = '关注问题';
        } else if (data[i].topicInfo.followed == 1) {
          data[i].topicInfo.followStr = '已关注';
        }
        answerListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        answerList: answerListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var followListPage = 1;
var followListArr = [];
var getNewFollowList = function (userid) {
  followListPage = 1;
  followListArr = [];
  getMyFollowList(userid);
};
var getMoreFollowList = function (userid) {
  followListPage++;
  getMyFollowList(userid);
};
var getMyFollowList = function (userid){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/follow',
    data: {
      pageNO:followListPage,
      pageSize:10,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(111);
      console.log(res.data);
      var data = res.data.content;
      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.lastTime(data[i].expiredTime);
        data[i].date = date;
        if (data[i].followed == 0) {
          data[i].followStr = '关注问题';
        } else if (data[i].followed == 1) {
          data[i].followStr = '已关注';
        }
        if (data[i].bestAnswerLiked == 0) {
          data[i].likeStr = '点赞';
        } else if (data[i].bestAnswerLiked == 1) {
          data[i].likeStr = '已赞';
        }
        followListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        followList: followListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var changeQuestionList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 1,
  });
};
var changeAnswerList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 2,
  });
}
var changeMyFollowList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 3,
  });
};

var onReachBottom = function () {
  var that = this;
  if (that.data.isQuestionOrAnswer == 1){
    getMoreQuestionList(that.data.userId);
  } else if (that.data.isQuestionOrAnswer == 2){
    getMoreAnswerList(that.data.userId);
  } else if (that.data.isQuestionOrAnswer == 3) {
    getMoreFollowList(that.data.userId);
  }
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

var navigateToDetail = function (event) {
  clickPreview();
 
    wx.navigateTo({
      url: '/pages/WenDaPage/WenDaPage?topicId=' + event.currentTarget.dataset.topicid,
    })
  
};

var navigateToSingleDetail = function (event) {
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId=' + event.currentTarget.dataset.topicid,
  })
};

var navigateToMessageList = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMessageList/MyMessageList?nickName=' + event.currentTarget.dataset.nickname + '&userId=' + event.currentTarget.dataset.userid,
  })
};
var navigateToNotice = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNotice/MyNotice',
  })
};

var navigateToFaQiWenDa = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/FaQiWenDa/FaQiWenDa',
  })
};

var guanzhuClick = function (event){
  var that = this;
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  var followName = event.currentTarget.dataset.followname;
  var methodStr = '';
  if(followName == '关注'){
    methodStr = 'POST';
  } else if(followName == '已关注'){
    methodStr = 'DELETE'
  }
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
      userId: userId
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: methodStr,
    success: function (res) {
      wx.hideLoading();
      if (res.statusCode == 200) {
        getUserDetailInfo(that.data.userId);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.toast("操作失败");
    }
  })
};

const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
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
};

var onHide = function () {
  clearInterval(setProgressTimer);
}
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
var onUnload = function () {
  clearInterval(setProgressTimer);
}
Page({
  data: {
    isQuestionOrAnswer:1,
    userId:'',
    dianzanText: '点赞 ',
    pinglunText: '评论 ',
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  onReachBottom: onReachBottom,
  changeQuestionList: changeQuestionList,
  changeAnswerList: changeAnswerList,
  navigateToSingleDetail: navigateToSingleDetail,
  navigateToDetail: navigateToDetail,
  navigateToMessageList: navigateToMessageList,
  navigateToNotice: navigateToNotice,
  navigateToFaQiWenDa: navigateToFaQiWenDa,
  guanzhuClick: guanzhuClick,
  changeMyFollowList: changeMyFollowList,
  onPullDownRefresh: onPullDownRefresh,
})