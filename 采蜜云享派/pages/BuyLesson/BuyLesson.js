var simpleLib = require('../libs/simple-lib.js');
var route = "pages/BuyLesson/BuyLesson";




var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getLessonDetailInfo(options.objectId);
  
};


var lessonData = '';
var getLessonDetailInfo = function (objectid) {
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/course/' + objectid,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)

      lessonData = res.data;
      lessonData.showAudio = false;
      if (lessonData.pricingRule == 1){
        lessonData.pricingRuleName = '/年';
      } else if (lessonData.pricingRule == 2) {
        lessonData.pricingRuleName = '/月';
      } else if (lessonData.pricingRule == 3) {
        lessonData.pricingRuleName = '';
      } else if (lessonData.pricingRule == 4) {
        lessonData.pricingRuleName = '/课';
      }
      
      simpleLib.setData(route, {
        lessonData: lessonData,
        scribeContent: lessonData.summary,
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};



var zhankaiquanwen = function () {
  var that = this;
  if (that.data.ZkOrSq == '阅读全文') {
    simpleLib.setData(route, {
      scribeContent: lessonData.intro,
      ZkOrSq: '收起全文'
    });
  } else if (that.data.ZkOrSq == '收起全文') {
    simpleLib.setData(route, {
      scribeContent: lessonData.summary,
      ZkOrSq: '阅读全文'
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

var BuyCourse = function (){
  clickPreview();
  if (!simpleLib.getGlobalData().user) {
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
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/course/' + lessonData.courseId + '/subscribe',
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data)
        if (res.statusCode == 200) {
          simpleLib.toast("订阅成功");
          simpleLib.getGlobalData().isSubscribe = '1';
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/LessonPage/LessonPage?objectId=' + lessonData.courseId,
            })
          }, 2000)
        }

      },
      fail: function (res) {
        simpleLib.failToast("订阅失败")
      }
    })
  }
};


var showAudio = function (){
  lessonData.showAudio = true;
  simpleLib.setData(route, {
    lessonData: lessonData,
  });
};

var playAudio = function (){
  clickPreview();
  if (this.data.playOrStop == '../../image/stopIcon.png') {
    wx.pauseBackgroundAudio({
      success: function (res) {

      }
    });
    simpleLib.setData(route, {
      playOrStop: '../../image/bofangicon.png',
    });
  } else if (this.data.playOrStop == '../../image/bofangicon.png') {
    wx.playBackgroundAudio({
      dataUrl: simpleLib.baseUrl + lessonData.foretasteUrl,
      success: function (res) {
        simpleLib.setData(route, {
          playOrStop: '../../image/stopIcon.png',
        });
      }
    });
  }
};
var onUnload = function () {
  wx.stopBackgroundAudio();
};
var onReady = function () {
  wx.onBackgroundAudioPlay(function () {
    console.log('播放了');
    songPlay();
  });
};

var inv;
var songPlay = function () {
  inv = setInterval(function () {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        console.log(res);
        if (res.status == 1) {
          simpleLib.setData(route, {
            audioCurrentTime: timeToString(parseInt(res.currentPosition)),
          })
        } else {

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


var onShareAppMessage = function () {
  return {
    title: lessonData.name,
    path: 'pages/BuyLesson/BuyLesson?objectId=' + lessonData.courseId,
    success: function (res) {
      simpleLib.toast('转发成功');
    },
    fail: function (res) {
      simpleLib.failToast('转发失败');
    }
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
    scribeContent:'',
    ZkOrSq:'阅读全文',
    audioCurrentTime:'00:00',
    playOrStop: '../../image/bofangicon.png',
  },
  onLoad: onload,
  onShareAppMessage: onShareAppMessage,
  onUnload: onUnload,
  onReady: onReady,
  zhankaiquanwen : zhankaiquanwen,
  BuyCourse: BuyCourse,
  showAudio: showAudio,
  playAudio: playAudio,
})