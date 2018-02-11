var simpleLib = require('../libs/simple-lib.js');
var route = "pages/VideoLessonExercise/VideoLessonExercise";


var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var objectID = '';
var lessonId = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  objectID = options.exerciseId;
  lessonId = options.lessonId;

  getVideoDetailInfo();
  getQuestionListInfo();

  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight - 452
      });
    }
  });
};


var getQuestionListInfo = function (){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/course/exercise/' + objectID,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data);
      if (res.statusCode == 200) {
        simpleLib.setData(route, {
          exerciseData : res.data,
          questionList: res.data.questionList,
        });
      }
    },
    fail: function (res) {
      wx.hideLoading();
    }
  })
};


var tabsArr = [];
var lessonData = '';
var getVideoDetailInfo = function () {
  tabsArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/lesson/' + lessonId,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)

      lessonData = res.data;
      for (var i = 0; i < lessonData.courseInfo.chapterList.length; i++) {
        var subData = lessonData.courseInfo.chapterList[i].lessonList;
        for (var j = 0; j < subData.length; j++) {
          subData[j].title = lessonData.courseInfo.chapterList[i].name + '/' + subData[j].name;
          tabsArr.push(subData[j]);
        }
      }
      for (var i = 0; i < tabsArr.length; i++) {
        if (objectID == tabsArr[i].objectId) {
          simpleLib.setData(route, {
            practiseName: tabsArr[i].title,
          });
        }
      }
      simpleLib.setData(route, {
        lessonData: lessonData,
        videoUrl: res.data.url,
      });
    },
    fail: function (res) {
      simpleLib.toast("查询失败")
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
    practiseName: '',
    videoUrl: '',
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  onPullDownRefresh: onPullDownRefresh,
})
