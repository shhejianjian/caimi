var simpleLib = require('../libs/simple-lib.js');
var route = "pages/TagDetail/TagDetail";

var lessonSortTabs = [
  {
    name: '按订阅量',
    contentType: 'subscription',
  },
  {
    name: '最近更新',
    contentType: 'updateTime',
  },
  {
    name: '价格升序',
    contentType: 'price_asc',
  },
  {
    name: '价格降序',
    contentType: 'price_desc',
  },
];


var answerSortTabs = [
  {
    name: '关注量排序',
    contentType: 'follow',
  },
  {
    name: '赏金排序',
    contentType: 'reward',
  },
  {
    name: '回答排序',
    contentType: 'answer',
  },
];



var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    tagId: options.tagid,
    tagName: options.tagname,
    lessonSortTabs: lessonSortTabs,
    answerSortTabs: answerSortTabs,
  });
};

var onShow = function (options){
  
  getNewLessonData(this.data.tagId, lessonSortContentType);
  getNewAnswerData(this.data.tagId, answerSortContentType);
};

var currentLessonPage = 1;
var getNewLessonData = function (tagId, sortby){
  currentLessonPage = 1;
  lessonListArr = [];
  getRelatedLessonList(tagId, sortby);
};

var getMoreLessonData = function (tagId, sortby){
  currentLessonPage++;
  getRelatedLessonList(tagId, sortby);
};

var lessonListArr = [];
var getRelatedLessonList = function (tagId,sortby) {
  var that = this;
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/course?' + tagId,
    data: {
      sortBy:sortby,
      pageNo: currentLessonPage,
      pageSize:10,
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
        if (!lessonData[i].realPrice) {
          lessonData[i].realPriceStr = '';
        } else {
          lessonData[i].realPriceStr = '￥' + lessonData[i].realPrice;
        }
        lessonData[i].percentCount = Math.floor(((lessonData[i].referencePrice - lessonData[i].realPrice) / lessonData[i].referencePrice) * 100);
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


var currentAnswerPage = 1;
var getNewAnswerData = function (tagId, sortby) {
  currentAnswerPage = 1;
  questionArr = [];
  getRelatedAnswerList(tagId, sortby);
};

var getMoreAnswerData = function (tagId, sortby) {
  currentAnswerPage++;
  getRelatedAnswerList(tagId, sortby);
};
var questionArr = [];
var getRelatedAnswerList = function (tagId,sortby){
  wx.request({
    url: simpleLib.baseUrl + '/public/topic?' + tagId,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      sortBy:sortby,
      pageNo: currentAnswerPage,
      pageSize: 10,
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

var showSrt = 1;
var changeLessonList = function (){
  showSrt = 1;
  simpleLib.setData(route, {
    isLessonOrComment: 1,
  });
};
var changeCommentList = function (){
  showSrt = 2;
  simpleLib.setData(route, {
    isLessonOrComment: 2,
  });
};

var showSortList = function (){
  simpleLib.setData(route, {
    isShowBackView: true,
    openSort:true,
  });
 
};

var clickBackView = function () {
  simpleLib.setData(route, {
    isShowBackView: false,
    openSort:false,
  });
};

var lessonSortContentType = '';
var clickLessonSortItem = function (event) {
  console.log(this.data)
  var index = event.currentTarget.dataset.index;
  var sortName = event.currentTarget.dataset.sortname;
  lessonSortContentType = event.currentTarget.dataset.contenttype;
  simpleLib.setData(route, {
    lessonActiveIndex: index,
    isShowBackView: false,
    openSort: false,
  });
  simpleLib.setData(route, {
    lessonSortTitleName: sortName,
  });
  getNewLessonData(this.data.tagId, lessonSortContentType);
};

var answerSortContentType = '';
var clickAnswerSortItem = function (event){
  console.log(this.data)
  var index = event.currentTarget.dataset.index;
  var sortName = event.currentTarget.dataset.sortname;
  answerSortContentType = event.currentTarget.dataset.contenttype;
  simpleLib.setData(route, {
    answerActiveIndex: index,
    isShowBackView: false,
    openSort: false,
  });
  simpleLib.setData(route, {
    answerSortTitleName: sortName,
  });
  getNewAnswerData(this.data.tagId, answerSortContentType);
};



var onReachBottom = function () {
  if (showSrt == 1) {
    getMoreLessonData(this.data.tagId, lessonSortContentType);
  }
  if (showSrt == 2) {
    getMoreAnswerData(this.data.tagId, answerSortContentType);
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
var navigateToBuyLesson = function (event) {
  clickPreview();
  var contentType = event.currentTarget.dataset.contentype;
  var objectId = event.currentTarget.dataset.objectid;
  var subscribed = event.currentTarget.dataset.subscribed;
  var pricingRule = event.currentTarget.dataset.pricingrule;
  if (pricingRule != null && subscribed == 0) {
    wx.navigateTo({
      url: '/pages/BuyLesson/BuyLesson?objectId=' + objectId,
    })
  } else {
    wx.navigateTo({
      url: '/pages/LessonPage/LessonPage?objectId=' + objectId,
    })
  }

};
var navigateToDetail = function (event) {
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaPage/WenDaPage?topicId=' + event.currentTarget.dataset.topicid,
  })
};


Page({
  data: {
    tagId:'',
    tagName:'',
    isLessonOrComment:1,
    dianzanText: '点赞 ',
    pinglunText: '评论 ',
    isShowBackView: false,
    answerActiveIndex:-1,
    lessonActiveIndex:-1,
    lessonSortTitleName:'智能排序',
    answerSortTitleName:'智能排序'
  },
  onLoad: onload,
  onShow: onShow,
  showSortList: showSortList,
  changeCommentList: changeCommentList,
  changeLessonList: changeLessonList,
  clickBackView: clickBackView,
  clickAnswerSortItem: clickAnswerSortItem,
  clickLessonSortItem: clickLessonSortItem,
  onReachBottom: onReachBottom,
  navigateToBuyLesson: navigateToBuyLesson,
  navigateToDetail: navigateToDetail,

})
