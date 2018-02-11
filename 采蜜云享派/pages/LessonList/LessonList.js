var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonList/LessonList";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var url = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  simpleLib.setData(route, {
    lessonTypeTitle: options.lessonTypeTitle
  });
  
  if (options.lessonTypeTitle == '未读课程') {
    url = '/api/v1/caimi/course/lesson/unread';
  } else if (options.lessonTypeTitle == '已读课程') {
    url = '/api/v1/caimi/course/lesson/read';
  } else if (options.lessonTypeTitle == '已购课程') {
    url = '/api/v1/caimi/course/subscribe';
  } else {
    url = '/public/course?column=' + options.columnId;
  }
  loadNewDataList(url);

};

//列表数据上拉加载
var DataListPage = 1;

var loadNewDataList = function (url) {
  DataListPage = 1;
  lessonArr = [];
  getLessonList(url);
};
var loadMoreDataList = function (url) {
  DataListPage++;
  getLessonList(url);
};

var lessonArr = [];
var getLessonList = function (url) {
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + url,
    data: {
      pageNo: DataListPage,
      pageSize: '10',
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var lessonData = res.data.content;
      for (var i = 0; i < lessonData.length; i++) {
        var date = simpleLib.getTime(lessonData[i].lastUpdateTime);
        lessonData[i].date = date;
        if(lessonData[i].courseInfo){
          lessonData[i].avatarUrl = lessonData[i].courseInfo.avatarUrl;
        } else {
          lessonData[i].avatarUrl = lessonData[i].avatarUrl;
        }
        
        lessonData[i].realPrice = '￥' + lessonData[i].realPrice;

        if(lessonData[i].courseInfo){
          lessonData[i].title = lessonData[i].courseInfo.name;
          lessonData[i].teacher = lessonData[i].courseInfo.teacher;
          lessonData[i].teacherIntro = lessonData[i].courseInfo.teacherIntro;
          lessonData[i].tips = lessonData[i].courseInfo.tips;
          lessonData[i].date = simpleLib.getTime(lessonData[i].courseInfo.lastUpdateTime);
          lessonData[i].lastUpdateContent = lessonData[i].name;
        } else {
          lessonData[i].title = lessonData[i].name;
        }

        lessonArr.push(lessonData[i]);
      }

      simpleLib.setData(route, {
        lessons: lessonArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};

var onReachBottom = function (){
  loadMoreDataList(url);
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

var navigateToBuyLesson = function (event){
  clickPreview();
  var contentType = event.currentTarget.dataset.contentype;
  var objectId = event.currentTarget.dataset.objectid;
  var subscribed = event.currentTarget.dataset.subscribed;
  var pricingRule = event.currentTarget.dataset.pricingrule;
  var lessonId = event.currentTarget.dataset.lessonid;
  if(lessonId){
    simpleLib.getGlobalData().isReadLesson = '1';
    if (contentType == 3) {
      wx.navigateTo({
        url: '/pages/VideoLessonDetail/VideoLessonDetail?objectId=' + lessonId,
      })
    } else if (contentType == 2) {
      wx.navigateTo({
        url: '/pages/AudioLessonDetail/AudioLessonDetail?objectId=' + lessonId,
      })
    } else if (contentType == 1) {
      wx.navigateTo({
        url: '/pages/LessonDetail/LessonDetail?objectId=' + lessonId,
      })
    }
  } else {
    if (pricingRule != null && subscribed == 0) {
      wx.navigateTo({
        url: '/pages/BuyLesson/BuyLesson?objectId=' + objectId,
      })
    } else {
      wx.navigateTo({
        url: '/pages/LessonPage/LessonPage?objectId=' + objectId,
      })
    }
  }
  
};

const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
  if (simpleLib.getGlobalData().isSubscribe == '1') {
    loadNewDataList(url);
    simpleLib.getGlobalData().isSubscribe = '';
  };
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
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  onReachBottom: onReachBottom,
  navigateToBuyLesson: navigateToBuyLesson,
  onPullDownRefresh: onPullDownRefresh,
})