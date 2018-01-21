var simpleLib = require('../libs/simple-lib.js');
var route = "pages/AudioLessonPractise/AudioLessonPractise";
var arrayKey = require('../libs/arrayKey.js');


var handlerTabTap = function (e) {
  
  var index = e.currentTarget.dataset.index;
  simpleLib.setData(route, {
    activeTab: e.currentTarget.dataset.index,
  });
};


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
          })
        } else {
         
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



var tabsArr = [];
var lessonData = '';
var questionArr = [];
var getAudioDetailInfo = function () {
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
        audioUrl: res.data.url,
        questionList: questionArr,
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};




var objectID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  objectID = options.objectid;
  getAudioDetailInfo();

  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight - 232
      });
    }
  });
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
  if(sureAnswerArr.length != 5){
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
        wx.redirectTo({
          url: '/pages/AudioLessonExercise/AudioLessonExercise?exerciseId=' + res.data.exerciseId + '&lessonId=' + objectID,
        })
      } else {
        simpleLib.failToast("交卷失败")
      }
    },
    fail: function (res) {
      console.log(res);
      sureAnswerArr = [];
      wx.hideLoading();
      simpleLib.failToast("交卷失败")
    }
  })

};

var onUnload = function () {
  choiceParams = {};
};


Page({
  data: {
   
    audioProgress: 0,
    audioCurrentTime: '00:00',
    practiseName: '',
    audioUrl: '',
    activeTab: 0,
    isFiveAnswer: false,
    playOrStop: '../../image/bofangicon.png',

  },
  onLoad: onload,
  onReady: onReady,
  onUnload: onUnload,
  playAudio: playAudio,
  handlerTabTap: handlerTabTap,
  commit: commit,

})