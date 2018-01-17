var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyFollows/MyFollows";


var FollowStr = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  wx.setNavigationBarTitle({
    title: options.title
  })
  FollowStr = options.follow;
  if(options.follow == 1){
    simpleLib.setData(route, {
      isFollowView: true
    });
  } else if(options.follow == 2){
    simpleLib.setData(route, {
      isFollowView: false
    });
  }
};

var onShow = function (){
  if (FollowStr == 1) {
    getFollowList();
  } else if (FollowStr == 2) {
    getFansList();
  }
};

var changeRecommend = function (){
  simpleLib.setData(route, {
    isRecommend: 1
  });
};

var changeSelf = function (){
  simpleLib.setData(route, {
    isRecommend: 2
  });
};

var userListArr = [];
var getFollowList = function (){
  userListArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
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
        userListArr.push(data[i]);
      }
      simpleLib.setData(route, {
        users: userListArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
};

var fansArr =[];
var getFansList = function () {
  fansArr = [];
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/fans',
    data: {
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
        fansArr.push(data[i]);
      }
      simpleLib.setData(route, {
        users: fansArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败");
    }
  })
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
        if(FollowStr == 1){
          getFollowList();
        } else if(FollowStr == 2){
          getFansList();
        }
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
        if (FollowStr == 1) {
          getFollowList();
        } else if (FollowStr == 2) {
          getFansList();
        }
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("关注失败");
    }
  })
};


////跳转至用户主页
var navigateToUserInfo = function (event) {
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId + '&isSelf=0',
  })
};

Page({
  data: {
    isRecommend:1,
  },
  onLoad: onload,
  onShow: onShow,
  changeRecommend: changeRecommend,
  changeSelf: changeSelf,
  guanzhuClick: guanzhuClick,
  deleteguanzhuClick: deleteguanzhuClick,
  navigateToUserInfo: navigateToUserInfo,
})