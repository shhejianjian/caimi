var simpleLib = require('../libs/simple-lib.js');
var arrayKey = require('../libs/arrayKey.js');
var route = "pages/LessonDetailPractise/LessonDetailPractise";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var objectID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  objectID = options.objectid;
  getLessonDetailInfo();

};


var tabsArr = [];
var lessonData = '';
var questionArr = [];
var getLessonDetailInfo = function () {
  wx.showLoading({
    title: '加载中',
  });
  tabsArr = [];
  questionArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/lesson/' + objectID,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
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
      questionArr = lessonData.questionList;
      simpleLib.setData(route, {
        lessonData: lessonData,
        videoUrl: res.data.url,
        questionList: questionArr,
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};

var choiceParams = {};
var choiceAnswerArr = [];
var choiceAnswerIdArr = [];
var handlerTabTap = function (e) {
  var objectId = e.currentTarget.dataset.objectid;
  var questionId = e.currentTarget.dataset.questionid;
  choiceParams[questionId] = objectId;
  for (var i = 0; i < questionArr.length; i++) {
    var questionInfoArr = questionArr[i].optionInfoList;
    for (var j = 0; j < questionInfoArr.length; j++) {
      if (objectId == questionInfoArr[j].objectId) {
        questionInfoArr[j].isChoose = true;
        var questionParams = {
          question: {
            objectId: questionId
          },
          choice: questionInfoArr[j].objectId
        }
        choiceAnswerArr.push(questionInfoArr[j]);
        choiceAnswerIdArr.push(questionParams);
      } else if (objectId != questionInfoArr[j].objectId && questionId == questionArr[i].objectId) {
        questionInfoArr[j].isChoose = false;
      }
    }
  }
  if (arrayKey.keys(choiceParams).length == 5) {
    simpleLib.setData(route, {
      isFiveAnswer: true,
    });
  }
  simpleLib.setData(route, {
    questionList: questionArr,
  });
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

var sureAnswerArr = [];
var commit = function () {
  clickPreview();

  console.log(choiceParams);
  for (let key in choiceParams) {
    console.log(key);
    var questionParams = {
      question: {
        objectId: key
      },
      choice: choiceParams[key]
    }
    sureAnswerArr.push(questionParams);
  }
  console.log(sureAnswerArr);
  if (sureAnswerArr.length != 5) {
    return;
  }
  wx.showLoading({
    title: '正在交卷',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/course/lesson/' + objectID + '/exercise',
    data: {
      detailList: sureAnswerArr
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      sureAnswerArr = [];
      console.log(res);
      if (res.statusCode == 200) {
        simpleLib.getGlobalData().jjsuccess = '1';
        simpleLib.toast("提交成功");
        wx.redirectTo({
          url: '/pages/LessonDetailExercise/LessonDetailExercise?exerciseId=' + res.data.exerciseId + '&lessonId=' + objectID,
        })
      } else {
        simpleLib.failToast(res.data.error);
      }
    },
    fail: function (res) {
      console.log(res);
      sureAnswerArr = [];
      wx.hideLoading();
      simpleLib.failToast("提交失败");
    }
  })

};

var onUnload = function () {
  choiceParams = {};
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

Page({
  data: {
    practiseName: '',
    isFiveAnswer: false,
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onUnload: onUnload,
  playAudio: playAudio,
  onShow: onShow,
  onHide: onHide,
  handlerTabTap: handlerTabTap,
  commit: commit,
  onPullDownRefresh: onPullDownRefresh,
})