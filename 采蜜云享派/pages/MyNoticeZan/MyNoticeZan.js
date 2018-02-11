var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeZan/MyNoticeZan";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getRecieveReplyList();
  getMyReplyList();
};

var changeReciveReplyList = function () {
  simpleLib.setData(route, {
    isMyOrRecieve: true
  });
};
var changeMyReplyList = function () {
  simpleLib.setData(route, {
    isMyOrRecieve: false
  });
};

//我点赞的
var myZanArr=[];
var getRecieveReplyList = function () {
  myZanArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/like/submit',
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
        var date = simpleLib.getTime(data[i].contentInfo.submitTime);
        data[i].contentInfo.date = date;
        if (data[i].contentInfo.liked==0){
          data[i].contentInfo.zanImg = '../../image/dianzanicon.png';
        } else if (data[i].contentInfo.liked == 1){
          data[i].contentInfo.zanImg = '../../image/yizanicon.png';
        }
        myZanArr.push(data[i]);
      }
      simpleLib.setData(route, {
        myZanList: myZanArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

//收到的赞
var receiveZanArr = [];
var getMyReplyList = function () {
  receiveZanArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/like/receive',
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
        receiveZanArr.push(data[i]);
      }
      simpleLib.setData(route, {
        receiveZanList: receiveZanArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var Commentdianzan = function (event){
  var commentId = event.currentTarget.dataset.commentid;
  simpleLib.setData(route, {
    prevent: true
  });
  setTimeout(() => {
    simpleLib.setData(route, {
      prevent: false
    });
  }, 1000);
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/' + commentId + '/like',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data);
      if (res.statusCode == 200) {
        getRecieveReplyList();
      }
    },
    fail: function (res) {
      wx.hideLoading();

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

var navigateToCommentDetail = function (event) {
 clickPreview();
  var commentId = event.currentTarget.dataset.commentid;
  
  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
};
var navigateToDetail = function (event){
  var commentId = event.currentTarget.dataset.commentid;
  var commentType = event.currentTarget.dataset.commenttype;
  if(commentType == 'Answer'){
    wx.navigateTo({
      url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + commentId,
    })
  } else if(commentType == 'Comment'){
    wx.navigateTo({
      url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
    })
  }
};

var navigateToWenDaSingleDetail = function (event){
  clickPreview();
  var answerId = event.currentTarget.dataset.answerid;
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + answerId,
  })
};


const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
  if (simpleLib.getGlobalData().isHuifu == '1') {
    getRecieveReplyList();
    getMyReplyList();
    simpleLib.getGlobalData().isPress = '';
    simpleLib.getGlobalData().isPressSuccess = '';
    simpleLib.getGlobalData().isHuifu = '';
  }
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
    isMyOrRecieve: true,
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onShow: onShow,
  onUnload:onUnload,
  playAudio: playAudio,
  onHide: onHide,
  changeMyReplyList: changeMyReplyList,
  changeReciveReplyList: changeReciveReplyList,
  Commentdianzan: Commentdianzan,
  navigateToCommentDetail: navigateToCommentDetail,
  navigateToWenDaSingleDetail: navigateToWenDaSingleDetail,
  navigateToDetail: navigateToDetail,
  onPullDownRefresh: onPullDownRefresh,
})