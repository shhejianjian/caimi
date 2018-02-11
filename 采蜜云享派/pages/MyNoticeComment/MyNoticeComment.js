var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeComment/MyNoticeComment";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
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
    isMyOrRecieve:true,
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
  changeMyReplyList: changeMyReplyList,
  changeReciveReplyList: changeReciveReplyList,
  navigateToDetailPage: navigateToDetailPage,
  onPullDownRefresh: onPullDownRefresh,
  navigateToCommentDetail: navigateToCommentDetail,
})