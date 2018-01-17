var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonSearchVC/LessonSearchVC";





var lessonListArr = [];
var getLessonListInfo = function (keyword){
  wx.showLoading({
    title: '加载中',
  });
  lessonListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course/search',
    data: {
      keyword:keyword,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method:'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.getTime(data[i].lastUpdateTime);
        data[i].date = date;
        data[i].cover = data[i].cover.split('.')[0] + '!128_128.jpg';
        if (!data[i].realPrice) {
          data[i].realPrice = '';
        } else {
          data[i].realPrice = '￥' + data[i].realPrice;
        }
        lessonListArr.push(data[i]);
      }

      simpleLib.setData(route, {
        lessons: lessonListArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("搜索失败");
    }
  })
};

var answerListArr = [];
var getAnswerListInfo = function (keyword){
  answerListArr = [];
  wx.showLoading({
    title: '加载中',
  });
  
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/search',
    data: {
      keyword: keyword,
      solved:0,
      pageSize:3
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data.content;

      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.lastTime(data[i].expiredTime);
        data[i].date = date;
        if (data[i].followed == 0) {
          data[i].followStr = '关注问题';
        } else if (data[i].followed == 1) {
          data[i].followStr = '已关注';
        }
        answerListArr.push(data[i]);
      }

      simpleLib.setData(route, {
        noSolveList: answerListArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("搜索失败");
    }
  })
};


var solvedAnswerListArr = [];
var getYiJieJueListInfo = function (keyword){
  solvedAnswerListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/search',
    data: {
      keyword: keyword,
      solved: 1,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;

      for (var i = 0; i < data.length; i++) {
        if (data[i].bestAnswerLiked == 0) {
          data[i].likeStr = '点赞  ';
        } else if (data[i].bestAnswerLiked == 1) {
          data[i].likeStr = '已赞  ';
        }
        solvedAnswerListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        solvedList: solvedAnswerListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("搜索失败");
    }
  })
};

var userListInfo = [];
var getUserListInfo = function (keyword) {
  userListInfo = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/search',
    data: {
      keyword: keyword,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        if (data[i].userId == simpleLib.getGlobalData().user.userId){
          data[i].isSelf = 1;
        } else {
          data[i].isSelf = 0;
        }
        userListInfo.push(data[i]);
      };

      simpleLib.setData(route, {
        users: userListInfo
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("搜索失败");
    }
  })
};



var searchLesson = function() {
  simpleLib.setData(route, {
    searchType: 1,
  });
  getLessonListInfo(keyword);
};

var searchAnswer = function () {
  simpleLib.setData(route, {
    searchType: 2,
  });
  // url = '/public/topic/search';
  getAnswerListInfo(keyword);
  getYiJieJueListInfo(keyword);
};

var searchUser = function () {
  simpleLib.setData(route, {
    searchType: 3,
  });
  // url = '/public/userProfile/search';
  getUserListInfo(keyword);
};

var keyword = '';
var searchInputChange = function (event){
  keyword = event.detail.value;
  if (this.data.searchType == 1){
    getLessonListInfo(keyword);
  } else if (this.data.searchType == 2){
    getAnswerListInfo(keyword);
    getYiJieJueListInfo(keyword);
  } else if (this.data.searchType == 3) {
    getUserListInfo(keyword);
  }
};


var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    textValue: options.textValue
  });
  keyword = options.textValue;
  getLessonListInfo(keyword);

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

var navigateToDetail = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaPage/WenDaPage?topicId=' + event.currentTarget.dataset.topicid,
  })
};

var followQuestion = function (event) {
  clickPreview();
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + event.currentTarget.dataset.topicid + '/follow',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        simpleLib.toast("关注成功");
        getAnswerListInfo(keyword);
      }
    },
    fail: function (res) {
      simpleLib.failToast("关注失败")
    }
  })
};

var navigateToSingleDetail = function (event) {
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId=' + event.currentTarget.dataset.topicid,
  })
};

var navigateToUserInfo = function (event){
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  var isSelf = event.currentTarget.dataset.isself;
  
  var userId = event.currentTarget.dataset.userid;
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId + '&isSelf=' + isSelf,
  })

};


var guanzhuClick = function (event) {
  clickPreview();
  var teacherId = event.currentTarget.dataset.teacherid;
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
      userId: teacherId
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      if (res.statusCode == 200) {
        simpleLib.getGlobalData().isGuanzhu = '1';
        getUserListInfo(keyword);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.toast("关注失败");
    }
  })
};

var deleteguanzhuClick = function (event) {
  clickPreview();
  var teacherId = event.currentTarget.dataset.teacherid;
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
      userId: teacherId
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'DELETE',
    success: function (res) {
      wx.hideLoading();
      if (res.statusCode == 200) {
        simpleLib.getGlobalData().isGuanzhu = '1';
        getUserListInfo(keyword);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("关注失败");
    }
  })
};


Page({
  data: {
    searchType:1,
    pinglunText:'评论  '
  },
  onLoad: onload,
  searchLesson: searchLesson,
  searchAnswer: searchAnswer,
  searchUser: searchUser,
  searchInputChange: searchInputChange,
  navigateToBuyLesson: navigateToBuyLesson,
  navigateToDetail: navigateToDetail,
  followQuestion: followQuestion,
  navigateToSingleDetail: navigateToSingleDetail,
  navigateToUserInfo: navigateToUserInfo,
  guanzhuClick: guanzhuClick,
  deleteguanzhuClick: deleteguanzhuClick,
})