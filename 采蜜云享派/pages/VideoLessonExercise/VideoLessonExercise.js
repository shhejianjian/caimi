var simpleLib = require('../libs/simple-lib.js');
var route = "pages/VideoLessonExercise/VideoLessonExercise";


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


Page({
  data: {
    practiseName: '',
    videoUrl: '',

  },
  onLoad: onload,
})
