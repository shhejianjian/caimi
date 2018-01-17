var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaPage/WenDaPage";


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

var navigateToRespond = function (event){
  clickPreview();
  var name = event.currentTarget.dataset.answertext;
  var answerId = event.currentTarget.dataset.answerid;
  if (name == '回    答'){
    if (!simpleLib.getGlobalData().user){
      wx.checkSession({
        success: function (res) {

          getApplicationInfo();

        },
        fail: function () {
          // 登录
          doLogin();
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/WenDaRespond/WenDaRespond?topicId=' + topicID,
      })
    }
    
    
  } else if (name == '查看我的回答'){
    wx.navigateTo({
      url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + answerId + '&topicId=' + topicID,
    })
  } else if (name == '评    选') {
    if(answerArr.length>0){
      wx.navigateTo({
        url: '/pages/WenDaChooseAnswer/WenDaChooseAnswer?topicId=' + topicID,
      })
    }
  }
};

var navigateToTagDetail = function (event){
  clickPreview();
  var tagName = event.currentTarget.dataset.tagname;
  var tagId = event.currentTarget.dataset.tagid;
  wx.navigateTo({
    url: '/pages/TagDetail/TagDetail?tagname=' + tagName + '&tagid=' + tagId,
  })
};

var navigateToDetail = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId='+topicID,
  })
};

var shareToAnswer = function (){

  
};

var onShareAppMessage = function () {
  return {
    title: questionDataInfo.title,
    path: 'pages/WenDaPage/WenDaPage?topicId=' + topicID,
    success: function (res) {
      simpleLib.toast('转发成功');
    },
    fail: function (res) {
      simpleLib.failToast('转发失败');
    }
  }
};

var topicID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  topicID = options.topicId;
  getQuestionDetailInfo();
  getAnswerList();
};

var answerArr=[];
var getAnswerList = function (){
  answerArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/' + topicID + '/answer',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      var answerData = res.data.content;
      for(var i = 0;i<answerData.length;i++){
        var date = simpleLib.getTime(answerData[i].submitTime);
        answerData[i].date = date;
        answerArr.push(answerData[i]);
      }
      // if (answerArr.length > 0) {
      //   simpleLib.setData(route, {
      //     isNoAnswer: 0
      //   });
      // } else {
      //   simpleLib.setData(route, {
      //     isNoAnswer: 1
      //   });
      // }
      simpleLib.setData(route, {
        answerInfo: answerArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};

var questionDataInfo = '';
var getQuestionDetailInfo = function (){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/'+topicID,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      questionDataInfo = res.data;
      var questionData = res.data;
      if (questionData.answered == 0) {
        questionData.answerText = '回    答';
      } else if (questionData.answered == 1) {
        questionData.answerText = '查看我的回答';
      }
      if(questionData.self == 1){
        questionData.answerText = '评    选';
        
      };
      if (questionData.followed == 0) {
        questionData.followStr = '关注问题';
      } else if (questionData.followed == 1) {
        questionData.followStr = '已关注';
      }
      var date = simpleLib.lastTime(questionData.expiredTime);
      questionData.date = date;

      simpleLib.setData(route, {
        questionInfo: questionData
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};


var guanzhuClick = function (event){
  clickPreview();
  var followStr = event.currentTarget.dataset.followstr;
  wx.showLoading({
    title: '加载中',
  });
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/follow',
      data: {
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if (res.statusCode == 200) {
          simpleLib.getGlobalData().isPress = '1';
          getQuestionDetailInfo();
        }
      },
      fail: function (res) {
        wx.hideLoading();
        simpleLib.failToast("关注失败")
      }
    })
};

var onShow = function (){
  if (simpleLib.getGlobalData().isChoose == '1') {
    getAnswerList();
    getQuestionDetailInfo();
    simpleLib.getGlobalData().isChoose = '';
  }
  if (simpleLib.getGlobalData().isPressSuccess == '1'){
    getAnswerList();
    getQuestionDetailInfo();
    simpleLib.getGlobalData().isPressSuccess = '';
    simpleLib.getGlobalData().isHuifu = '';
  }

};


var doLogin = function () {
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.request({
        url: simpleLib.baseUrl + '/login/weixin',
        method: 'GET',
        data: {
          code: res.code
        },
        success: res => {
          console.log(res);
          if (res.statusCode == 200) {
            simpleLib.getGlobalData().SESSION = res.data.jsessionid;
            getApplicationInfo();
          }
        }
      })
    }
  })
};

var getApplicationInfo = function () {

  wx.request({
    url: simpleLib.baseUrl + '/public/getCurrentInfo',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      if (!res.data.currentUser) {
        doLogin();
      } else {
        console.log(res.data.currentUser)
        simpleLib.setData(route, {
          user: res.data.currentUser
        });
        simpleLib.getGlobalData().user = res.data.currentUser;
        wx.navigateTo({
          url: '/pages/WenDaRespond/WenDaRespond?topicId=' + topicID,
        })
        if (res.data.currentUser.status == 0) {
          wx.getUserInfo({
            success: res => {
              console.log(res)
              wx.request({
                url: simpleLib.baseUrl + '/api/v1/caimi/user/weixin',
                method: 'PUT',
                data: {
                  encryptedData: res.encryptedData,
                  iv: res.iv
                },
                header: {
                  'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
                },
                success: function (res) {
                  if (res.statusCode == 200) {
                    getApplicationInfo();
                  }

                }
              })
            }
          });
        }
      }


    }
  })
}



Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  onShareAppMessage: onShareAppMessage,
  navigateToRespond: navigateToRespond,
  navigateToDetail: navigateToDetail,
  shareToAnswer: shareToAnswer,
  navigateToTagDetail: navigateToTagDetail,
  guanzhuClick: guanzhuClick,
})