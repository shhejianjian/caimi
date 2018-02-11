var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyNoticeAnswer/MyNoticeAnswer";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

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


var onReachBottom = function () {
  if (navibarTitle == '问答通知') {
    getMoreData(10);
  } else if (navibarTitle == '钱包明细') {
    getMoreData(13);
  }
};


const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
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
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onShow: onShow,
  playAudio: playAudio,
  onHide: onHide,
  onUnload:onUnload,
  onReachBottom: onReachBottom,
  navigateToAnswerPage: navigateToAnswerPage,
  onPullDownRefresh: onPullDownRefresh,
})