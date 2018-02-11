var simpleLib = require('../libs/simple-lib.js');
var route = "pages/CommentDetail/CommentDetail";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var loadQuestionInfo = function (){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/comment/' + commentId,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {},
    method: 'GET',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data);
      if (res.statusCode == 200) {
        var date = simpleLib.getTime(res.data.submitTime);
        res.data.submitTime = date;
        if (res.data.liked == 0) {
           res.data.zanImg = '../../image/dianzanicon.png';
        } else if (res.data.liked == 1) {
          res.data.zanImg = '../../image/yizanicon.png';
        }
        simpleLib.setData(route, {
          commentData: res.data,
        });
      }
    },
    fail: function (res) {
      wx.hideLoading();
    }
  })
};

var currentPage = 1;
var replyListArr = [];
var getNewReplyList = function (commnetid){
  currentPage = 1;
  replyListArr = [];
  loadReplyList(commnetid);
};
var getMoreReplyList = function (commnetid) {
  currentPage++;
  loadReplyList(commnetid);
};

var loadReplyList = function (commnetid){
  wx.request({
    url: simpleLib.baseUrl + '/public/comment?originId=' + commnetid,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      pageNo:currentPage,
      pageSize:10,
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        for (var i = 0; i < res.data.content.length; i++) {
          var date = simpleLib.getTime(res.data.content[i].submitTime);
          res.data.content[i].submitTime = date;
          if (res.data.content[i].liked == 0) {
            res.data.content[i].zanImg = '../../image/dianzanicon.png';
          } else if (res.data.content[i].liked == 1) {
            res.data.content[i].zanImg = '../../image/yizanicon.png';
          }
          if (res.data.content[i].parent.commentId == commnetid) {
            res.data.content[i].isHuifuComment = false;
          } else {
            res.data.content[i].isHuifuComment = true;
          }
          replyListArr.push(res.data.content[i]);
        }
        simpleLib.setData(route, {
          comments: replyListArr,
        });
      }
    },
    fail: function (res) {

    }
  })
};


var loadNewUpdateReplyList = function (commnetid,page) {
  replyListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/comment?originId=' + commnetid,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      pageNo: 1,
      pageSize: page*10,
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        for (var i = 0; i < res.data.content.length; i++) {
          var date = simpleLib.getTime(res.data.content[i].submitTime);
          res.data.content[i].submitTime = date;
          if (res.data.content[i].liked == 0) {
            res.data.content[i].zanImg = '../../image/dianzanicon.png';
          } else if (res.data.content[i].liked == 1) {
            res.data.content[i].zanImg = '../../image/yizanicon.png';
          }
          if (res.data.content[i].parent.commentId == commnetid) {
            res.data.content[i].isHuifuComment = false;
          } else {
            res.data.content[i].isHuifuComment = true;
          }
          replyListArr.push(res.data.content[i]);
        }
        simpleLib.setData(route, {
          comments: replyListArr,
        });
      }
    },
    fail: function (res) {

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

var huifuComment = function (event) {
  clickPreview();
  commentId = event.currentTarget.dataset.commentid;
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
  });
};

var bindblur = function () {
  
  simpleLib.setData(route, {
    isClickComment: false,
    focus: false,
  });
};

var commentInputStr = '';
var bindconfirm = function (event) {
  var that = this;
  commentInputStr = event.detail.value;
  var params = {
    parent: {
      objectId: commentId
    },
    content: commentInputStr,
  }
  console.log(params)
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment',

    data: params,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        loadNewUpdateReplyList(that.data.mainCommentId,currentPage);
        simpleLib.getGlobalData().isHuifu == '1';
      }
    },
    fail: function (res) {

    }
  })
};

var dianzan = function (event) {
  var that = this;
  clickPreview();
  var commentID = event.currentTarget.dataset.commentid;
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/' + commentID + '/like',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        loadNewUpdateReplyList(that.data.mainCommentId,currentPage);
        loadQuestionInfo();
        simpleLib.getGlobalData().isHuifu = '1';
      }
    },
    fail: function (res) {

    }
  })
};

var commentId = '';
var onload = function (options) {
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth: res.windowHeight
      });
    }
  });
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    mainCommentId: options.commentId,
  });
  commentId = options.commentId;
  loadQuestionInfo();
  getNewReplyList(this.data.mainCommentId);
  
};


var showReport = function (event) {
  wx.showActionSheet({
    itemList: ['回复', '举报'],
    success: function (res) {
      console.log(res.tapIndex)
      if (res.tapIndex == 0) {
        commentId = event.currentTarget.dataset.commentid;
        simpleLib.setData(route, {
          isClickComment: true,
          focus: true,
          isShowFloatView: false,
        });
      } else if (res.tapIndex == 1) {
        wx.navigateTo({
          url: '/pages/ReportView/ReportView?commentId=' + event.currentTarget.dataset.commentid + '&userName=' + event.currentTarget.dataset.username + '&content=' + event.currentTarget.dataset.usercontent + '&relatedType=' + event.currentTarget.dataset.relatedtype,
        })
      }
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
};

var navigateToUserInfo = function (event) {
  var userId = event.currentTarget.dataset.userid;
  var isSelf = '';
  if (userId == simpleLib.getGlobalData().user.userId) {
    isSelf = 1;
  } else {
    isSelf = 0;
  }
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId + '&isSelf=' + isSelf,
  })
};

var onReachBottom = function () {
  getMoreReplyList(this.data.mainCommentId);
};


const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
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
var onUnload = function () {
  clearInterval(setProgressTimer);
}
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


Page({
  data: {
    mainCommentId:'',
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,

  onHide: onHide,
  onUnload: onUnload,
  playAudio: playAudio,
  onShow: onShow,

  bindconfirm: bindconfirm,
  huifuComment: huifuComment,
  bindblur: bindblur,
  dianzan: dianzan,
  showReport: showReport,
  navigateToUserInfo: navigateToUserInfo,
  onReachBottom: onReachBottom,
  onPullDownRefresh: onPullDownRefresh,
})