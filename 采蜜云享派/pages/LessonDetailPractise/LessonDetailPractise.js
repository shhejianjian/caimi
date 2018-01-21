var simpleLib = require('../libs/simple-lib.js');
var arrayKey = require('../libs/arrayKey.js');
var route = "pages/LessonDetailPractise/LessonDetailPractise";


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

Page({
  data: {
    practiseName: '',
    isFiveAnswer: false,
  },
  onLoad: onload,
  onUnload: onUnload,
  handlerTabTap: handlerTabTap,
  commit: commit,
})