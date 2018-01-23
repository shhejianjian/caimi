var simpleLib = require('../libs/simple-lib.js');
var route = "pages/AudioLessonExercise/AudioLessonExercise";


var onReady = function () {
  songPlay();
  if (simpleLib.getGlobalData().isplaying == true) {
    simpleLib.setData(route, {
      playOrStop: '../../image/stopIcon.png',
    });
  } else if (simpleLib.getGlobalData().isplaying == false) {
    simpleLib.setData(route, {
      playOrStop: '../../image/bofangicon.png',
    });
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

var playAudio = function () {
  clickPreview();
  if (this.data.playOrStop == '../../image/stopIcon.png') {
    wx.pauseBackgroundAudio({
      success: function (res) {
        simpleLib.getGlobalData().isplaying = false;
      }
    });
    simpleLib.setData(route, {
      playOrStop: '../../image/bofangicon.png',
    });
  } else if (this.data.playOrStop == '../../image/bofangicon.png') {
    wx.playBackgroundAudio({
      dataUrl: simpleLib.baseUrl + lessonData.url,
      success: function (res) {
        simpleLib.getGlobalData().isplaying = true;
        simpleLib.setData(route, {
          playOrStop: '../../image/stopIcon.png',
        });
      }
    });
  }
};

var songPlay = function () {
  let inv = setInterval(function () {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        console.log(res);
        if (res.status == 1) {
          simpleLib.setData(route, {
            audioProgress: res.currentPosition / res.duration * 100,
            audioCurrentTime: timeToString(parseInt(res.currentPosition)),
            playOrStop: '../../image/stopIcon.png',
          })
        } else {
          simpleLib.setData(route, {
            playOrStop: '../../image/bofangicon.png',
          });
          // clearInterval(inv);
        }
      }
    });
  }, 1000);
};

var timeToString = function (duration) {
  let str = '';
  let minute = parseInt(duration / 60) < 10 ? ('0' + parseInt(duration / 60)) : (parseInt(duration / 60));
  let second = duration % 60 < 10 ? ('0' + duration % 60) : (duration % 60);
  str = minute + ':' + second;
  return str;
};


var objectID = '';
var lessonId = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  objectID = options.exerciseId;
  lessonId = options.lessonId;
  getAudioDetailInfo();
  getQuestionListInfo();
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight - 232
      });
    }
  });
};




var getQuestionListInfo = function () {
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
          exerciseData: res.data,
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
var getAudioDetailInfo = function () {
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
        audioUrl: res.data.url,
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};

Page({
  data: {
    audioProgress: 0,
    audioCurrentTime: '00:00',
    practiseName: '',
    audioUrl: '',
    playOrStop: '../../image/bofangicon.png'
  },
  onLoad: onload,
  playAudio: playAudio,
  onReady: onReady,
})