var simpleLib = require('../libs/simple-lib.js');
var route = "pages/TagDetail/TagDetail";




var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    tagId: options.tagid,
    tagName: options.tagname,
  });
  
  getRelatedLessonList(this.data.tagId);
  getRelatedAnswerList(this.data.tagId);
};


var lessonListArr = [];
var getRelatedLessonList = function (tagId) {
  var that = this;
  wx.showLoading({
    title: '加载中',
  });
  lessonListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course?' + tagId,
    data: {
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
        lessonListArr.push(lessonData[i]);
      }

      simpleLib.setData(route, {
        lessons: lessonListArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};

var questionArr = [];
var getRelatedAnswerList = function (tagId){
  questionArr
  wx.request({
    url: simpleLib.baseUrl + '/public/topic',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      tag: tagId
    },
    success: function (res) {
      console.log(res.data.content)
      var questionData = res.data.content;
      for (var i = 0; i < questionData.length; i++) {
        questionData[0].isPublic = 1;
        var date = simpleLib.lastTime(questionData[i].expiredTime);
        questionData[i].date = date;
        if (questionData[i].followed == 0) {
          questionData[i].followStr = '关注问题';
        } else if (questionData[i].followed == 1) {
          questionData[i].followStr = '已关注';
        }
        if (questionData[i].bestAnswerLiked == 0) {
          questionData[i].likeStr = '点赞';
        } else if (questionData[i].bestAnswerLiked == 1) {
          questionData[i].likeStr = '已赞';
        }

        questionArr.push(questionData[i]);
      }

      simpleLib.setData(route, {
        questionList: questionArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};


var changeLessonList = function (){
  simpleLib.setData(route, {
    isLessonOrComment: 1
  });
};
var changeCommentList = function (){
  simpleLib.setData(route, {
    isLessonOrComment: 2
  });
};

var showSortList = function (){
  
};


Page({
  data: {
    tagId:'',
    tagName:'',
    isLessonOrComment:1,
    dianzanText: '点赞 ',
    pinglunText: '评论 ',
  },
  onLoad: onload,
  showSortList: showSortList,
  changeCommentList: changeCommentList,
  changeLessonList: changeLessonList,
})