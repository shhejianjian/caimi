var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaPage/WenDaPage";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var answerSortTabs = [
  {
    name: '按时间排序',
    contentType: '',
  },
  {
    name: '最多点赞数',
    contentType: 'likeCount',
  },
  {
    name: '最多评论数',
    contentType: 'commentCount',
  },
];


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
  var topicStatus = event.currentTarget.dataset.topicstatus;
  if(topicStatus == 4){
    simpleLib.tishiToast('该问题已关闭');
    return;
  }
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
  var isBanned = event.currentTarget.dataset.banned;
  if(isBanned == 0){
    wx.navigateTo({
      url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId=' + topicID,
    })
  }
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
    baseUrl: simpleLib.baseUrl,
    sortTabs:answerSortTabs,
  });
  topicID = options.topicId;
  getNewAnswerData(answerConentType);
  getQuestionDetailInfo();
  
};


var currentPage = 1;
var answerArr=[];
var getNewAnswerData = function (sortby){
  currentPage = 1;
  answerArr = [];
  getAnswerList(sortby);
}
var getMoreAnswerData = function (sortby) {
  currentPage++;
  getAnswerList(sortby);
}

var getAnswerList = function (sortby){
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/' + topicID + '/answer',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data:{
      pageNo:currentPage,
      pageSize:10,
      sortBy:sortby,
    },
    success: function (res) {
      console.log(res.data)
      var answerData = res.data.content;
      for(var i = 0;i<answerData.length;i++){
        var date = simpleLib.getTime(answerData[i].submitTime);
        console.log(answerData[i].submitTime,date);
        answerData[i].date = date;
        answerArr.push(answerData[i]);
      }
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
      }else if (questionData.followed == 1) {
        questionData.followStr = '已关注';
      } 
      if (questionData.self == 1 && questionData.answerCount == 0) {
        questionData.followStr = '关闭问题';
      } 
      if (questionData.status == 4) {
        questionData.followStr = '已关闭';
      } 
      
      var date = simpleLib.lastTime(questionData.expiredTime);
      questionData.date = date;


      simpleLib.setData(route, {
        questionInfo: questionData
      });
      wx.hideLoading();
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
  if(followStr == '关闭问题'){
    
    wx.showModal({
      title: '温馨提示',
      content: '确认关闭该问题？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/close',
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
                simpleLib.toast("操作成功")
                simpleLib.getGlobalData().isPress = '1';
                getQuestionDetailInfo();
              }
            },
            fail: function (res) {
              wx.hideLoading();
              simpleLib.failToast("操作失败")
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  } else if (followStr == '已关闭'){

  } else {
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
  }
};



const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
  if (simpleLib.getGlobalData().isChoose == '1') {
    getNewAnswerData(answerConentType);
    getQuestionDetailInfo();
    simpleLib.getGlobalData().isChoose = '';
  }
  if (simpleLib.getGlobalData().isPressSuccess == '1') {
    getNewAnswerData(answerConentType);
    getQuestionDetailInfo();
    simpleLib.getGlobalData().isPressSuccess = '';
    simpleLib.getGlobalData().isHuifu = '';
  }
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth: res.windowHeight
      });
    }
  });
  if (simpleLib.getGlobalData().isPlayingAudio == '1') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.playImage': '../../image/stopIcon.png',
    })
    setProgressTimer = setInterval(function () {
      simpleLib.setData(route, {
        'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      })
    }, 1000);
    backgroundAudioManager.onEnded((res) => {
      clearInterval(setProgressTimer);
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      simpleLib.setData(route, {
        'audioInfo.currentTime': '00:00',
      })
    });
  } else if (simpleLib.getGlobalData().isPlayingAudio == '3') {
    simpleLib.setData(route, {
      isShowSimpleAudio: false
    })
  } else if (simpleLib.getGlobalData().isPlayingAudio == '2') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      'audioInfo.playImage': '../../image/bofangicon.png',
    })
  }
};

var onHide = function () {
  clearInterval(setProgressTimer);
}
//公用悬浮音频组件内的播放暂停事件
var playAudio = function (event) {
  var playImage = event.currentTarget.dataset.playimage;
  console.log(playImage);
  if (playImage == '../../image/stopIcon.png') {
    console.log('暂停');
    backgroundAudioManager.pause();
    //播放暂停事件
    backgroundAudioManager.onPause((res) => {
      simpleLib.getGlobalData().isPlayingAudio = '2';
      console.log('暂停了');
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
      });
    });
  } else if (playImage == '../../image/bofangicon.png') {
    console.log('播放');
    backgroundAudioManager.play();
    //正在播放事件
    backgroundAudioManager.onPlay((res) => {
      console.log('播放了');
      simpleLib.getGlobalData().isPlayingAudio = '1';
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/stopIcon.png',
      });
      setProgressTimer = setInterval(function () {
        simpleLib.setData(route, {
          'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
        })
      }, 1000);
    });
    //播放结束事件
    backgroundAudioManager.onEnded((res) => {
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
    //播放停止事件
    backgroundAudioManager.onStop((res) => {
      console.log('停止了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
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


var previewImage = function (event){
  var imageList = event.currentTarget.dataset.imagelist;
  var index = event.currentTarget.dataset.index;
  for(var i = 0;i<imageList.length;i++){
    imageList[i] = simpleLib.baseUrl + imageList[i];
  }
  var current = imageList[index];
  wx.previewImage({
    current: current,
    urls: imageList
  })
};



var showSortList = function () {
  simpleLib.setData(route, {
    isShowBackView: true,
    openSort: true,
  });

};

var clickBackView = function () {
  simpleLib.setData(route, {
    isShowBackView: false,
    openSort: false,
  });
};

var answerConentType = '';
var clickSortItem = function (event){
  var index = event.currentTarget.dataset.index;
  var sortName = event.currentTarget.dataset.sortname;
  answerConentType = event.currentTarget.dataset.contenttype;
  simpleLib.setData(route, {
    activeIndex: index,
    isShowBackView: false,
    openSort: false,
    answerSortName: sortName,
  });
  getNewAnswerData(answerConentType);
};

var onReachBottom = function () {
  getMoreAnswerData(answerConentType);
};
var onUnload = function () {
  clearInterval(setProgressTimer);
}
Page({
  data: {
    activeIndex:-1,
    isShowBackView:false,
    answerSortName:'按时间排序',
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  onReachBottom: onReachBottom,
  onShareAppMessage: onShareAppMessage,
  navigateToRespond: navigateToRespond,
  navigateToDetail: navigateToDetail,
  shareToAnswer: shareToAnswer,
  navigateToTagDetail: navigateToTagDetail,
  guanzhuClick: guanzhuClick,
  previewImage: previewImage,
  showSortList: showSortList,
  clickBackView: clickBackView,
  clickSortItem: clickSortItem,
  onPullDownRefresh: onPullDownRefresh,
})