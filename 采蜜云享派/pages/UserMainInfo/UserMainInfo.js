var simpleLib = require('../libs/simple-lib.js');
var route = "pages/UserMainInfo/UserMainInfo";






var isSelfStr = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    isSelf: options.isSelf,
    userId: options.userId,
  });
  isSelfStr = options.isSelf;
  if(options.isSelf == 0){
    simpleLib.setData(route, {
      questionTabtitle: '他的提问',
      answerTabtitle: '他的回答'
    });
  } else if(options.isSelf == 1){
    simpleLib.setData(route, {
      questionTabtitle: '我的提问',
      answerTabtitle: '我的回答'
    });
  }  
  getUserDetailInfo(this.data.userId);
  getUserQuestionList(this.data.userId);
  getUserAnswerList(this.data.userId);
  getMyFollowList(this.data.userId);
};

var getUserDetailInfo = function (userid){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var data = res.data;
      if (data.currentUserFollow == 0){
        data.followStr = '关注';
      } else if (data.currentUserFollow == 1){
        data.followStr = '已关注';
      }
      simpleLib.setData(route, {
        userInfo: data
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

var questionListArr = [];
var getUserQuestionList = function (userid){
  questionListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid + '/topic',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.lastTime(data[i].expiredTime);
        data[i].date = date;
        if (data[i].followed == 0) {
          data[i].followStr = '关注问题';
        } else if (data[i].followed == 1) {
          data[i].followStr = '已关注';
        }
        if (data[i].bestAnswerLiked == 0) {
          data[i].likeStr = '点赞';
        } else if (data[i].bestAnswerLiked == 1) {
          data[i].likeStr = '已赞';
        }
        questionListArr.push(data[i]);
      };
      simpleLib.setData(route, {
        questionsList: questionListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};


var answerListArr = [];
var getUserAnswerList = function (userid){
  answerListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/userProfile/' + userid + '/answer',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        var date = simpleLib.getTime(data[i].submitTime);
        data[i].date = date;
        if (data[i].topicInfo.followed == 0) {
          data[i].topicInfo.followStr = '关注问题';
        } else if (data[i].topicInfo.followed == 1) {
          data[i].topicInfo.followStr = '已关注';
        }
        answerListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        answerList: answerListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var followListArr =[];
var getMyFollowList = function (userid){
  followListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/follow',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(111);
      console.log(res.data);
      var data = res.data.content;
      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.lastTime(data[i].expiredTime);
        data[i].date = date;
        if (data[i].followed == 0) {
          data[i].followStr = '关注问题';
        } else if (data[i].followed == 1) {
          data[i].followStr = '已关注';
        }
        if (data[i].bestAnswerLiked == 0) {
          data[i].likeStr = '点赞';
        } else if (data[i].bestAnswerLiked == 1) {
          data[i].likeStr = '已赞';
        }
        followListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        followList: followListArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var changeQuestionList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 1,
  });
};
var changeAnswerList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 2,
  });
}
var changeMyFollowList = function (){
  simpleLib.setData(route, {
    isQuestionOrAnswer: 3,
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

var navigateToDetail = function (event) {
  clickPreview();
 
    wx.navigateTo({
      url: '/pages/WenDaPage/WenDaPage?topicId=' + event.currentTarget.dataset.topicid,
    })
  
};

var navigateToSingleDetail = function (event) {
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId=' + event.currentTarget.dataset.topicid,
  })
};

var navigateToMessageList = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMessageList/MyMessageList?nickName=' + event.currentTarget.dataset.nickname + '&userId=' + event.currentTarget.dataset.userid,
  })
};
var navigateToNotice = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNotice/MyNotice',
  })
};

var navigateToFaQiWenDa = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/FaQiWenDa/FaQiWenDa',
  })
};

var guanzhuClick = function (event){
  var that = this;
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  var followName = event.currentTarget.dataset.followname;
  var methodStr = '';
  if(followName == '关注'){
    methodStr = 'POST';
  } else if(followName == '已关注'){
    methodStr = 'DELETE'
  }
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
      userId: userId
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: methodStr,
    success: function (res) {
      wx.hideLoading();
      if (res.statusCode == 200) {
        getUserDetailInfo(that.data.userId);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.toast("操作失败");
    }
  })
};


Page({
  data: {
    isQuestionOrAnswer:1,
    userId:'',
    dianzanText: '点赞 ',
    pinglunText: '评论 ',
  },
  onLoad: onload,
  changeQuestionList: changeQuestionList,
  changeAnswerList: changeAnswerList,
  navigateToSingleDetail: navigateToSingleDetail,
  navigateToDetail: navigateToDetail,
  navigateToMessageList: navigateToMessageList,
  navigateToNotice: navigateToNotice,
  navigateToFaQiWenDa: navigateToFaQiWenDa,
  guanzhuClick: guanzhuClick,
  changeMyFollowList: changeMyFollowList,
})