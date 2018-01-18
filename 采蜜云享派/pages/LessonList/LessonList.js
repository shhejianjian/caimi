var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonList/LessonList";



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
          lessonData[i].cover = lessonData[i].courseInfo.cover.split('.')[0] + '!128_128.jpg';
        } else {
          lessonData[i].cover = lessonData[i].cover.split('.')[0] + '!128_128.jpg';
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

var onShow = function () {
  if (simpleLib.getGlobalData().isSubscribe == '1') {
    loadNewDataList(url);
    simpleLib.getGlobalData().isSubscribe = '';
  };
};

Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  onReachBottom: onReachBottom,
  navigateToBuyLesson: navigateToBuyLesson,
})