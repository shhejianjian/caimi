var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonPage/LessonPage";


var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

//获取课程内页数据
var detailData = '';
var getLessonDetail = function (courseId) {
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/course/' + courseId,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)

      var lessonData = res.data;
      if (lessonData.subscribed == 0){
        lessonData.subscribedStr = '订阅课程';
      } else if(lessonData.subscribed == 1){
        lessonData.subscribedStr = '播放全部';
      }
      if (lessonData.pricingRule != null){
        wx.hideShareMenu();
      }
      lessonData.intro = lessonData.intro.replace(/<img[^>]*src=['"]([^'"]+)[^>]*>/g, function (match, capture) {
        if (capture && capture.indexOf('http') == 0) {
          return match;
        }
        return match.replace(capture, simpleLib.baseUrl +'/image/' + capture + '.jpg');
      });
      detailData = lessonData;
      simpleLib.setData(route, {
        lessonDataInfo: lessonData,
        scribeContent: res.data.summary
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};


////评论列表
var commentArr = [];
var currentPage = 1;
var loadNewDataList = function (courseId) {
  currentPage = 1;
  commentArr = [];
  loadReplyList(courseId);
};
var loadMoreDataList = function (courseId) {
  currentPage++;
  loadReplyList(courseId);
};
var loadReplyList = function (courseId) {
  wx.request({
    url: simpleLib.baseUrl + '/public/comment?relatedId=' + courseId,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      pageNo: currentPage,
      pageSize: '10'
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      var data = res.data.content;
      if (res.statusCode == 200) {
        for (var i = 0; i < data.length; i++) {
          var date = simpleLib.getTime(data[i].submitTime);
          data[i].submitTime = date;
          if (data[i].liked == 0) {
            data[i].zanImg = '../../image/dianzanicon.png';
          } else if (data[i].liked == 1) {
            data[i].zanImg = '../../image/yizanicon.png';
          }
          commentArr.push(data[i]);
        }
        simpleLib.setData(route, {
          comments: commentArr,
        });
      }
    },
    fail: function (res) {

    }
  })
};
var onReachBottom = function () {
  loadMoreDataList(this.data.courseId);
};

//跳转视频页
var navigateToVideoDetail = function (event){
  var that = this.data;
  clickPreview();
  if (that.lessonDataInfo.subscribed == 0) {
    simpleLib.tishiToast("请先订阅该课程")
  } else if (that.lessonDataInfo.subscribed == 1) {
    var contentType = event.currentTarget.dataset.contenttype;
    var objectId = event.currentTarget.dataset.objectid;
    var courseId = event.currentTarget.dataset.courseid;
    var url = event.currentTarget.dataset.videourl;
    if(contentType == 3){
      wx.navigateTo({
        url: '/pages/VideoLessonDetail/VideoLessonDetail?objectId=' + objectId + '&courseId=' + courseId,
      })
    } else if (contentType == 2) {
      wx.navigateTo({
        url: '/pages/AudioLessonDetail/AudioLessonDetail?objectId=' + objectId + '&courseId=' + courseId,
      })
    } else if (contentType == 1) {
      wx.navigateTo({
        url: '/pages/LessonDetail/LessonDetail?objectId=' + objectId + '&courseId=' + courseId,
      })
    }
  }
};

var onload = function (options) {
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth:res.windowHeight
      });
    }
  });
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    courseId: options.objectId
  });
  console.log(this.data.courseId)
  getLessonDetail(this.data.courseId);
  loadNewDataList(this.data.courseId);
};

var zhankaiquanwen = function () {
  var that = this;
  if (that.data.ZkOrSq == '阅读全文') {
    simpleLib.setData(route, {
      scribeContent: that.data.lessonDataInfo.intro,
      ZkOrSq: '收起全文'
    });
  } else if (that.data.ZkOrSq == '收起全文') {
    simpleLib.setData(route, {
      scribeContent: that.data.lessonDataInfo.summary,
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

var navigateToCommentDetail = function (event){
  clickPreview();
  var commentId = event.currentTarget.dataset.commentid;

  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
};

var navigateToTagDetail = function (event){
  clickPreview();
  var tagName = event.currentTarget.dataset.tagname;
  var tagId = event.currentTarget.dataset.tagid;
  wx.navigateTo({
    url: '/pages/TagDetail/TagDetail?tagname='+tagName +'&tagid='+tagId,
  })
};

var dianzan = function (event) {
  clickPreview();
  var that = this;
  var commentId = event.currentTarget.dataset.commentid;
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/comment/' + commentId + '/like',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data);
      if (res.statusCode == 200) {
        loadNewDataList(that.data.courseId);
      }
    },
    fail: function (res) {

    }
  })
};

var commentID = '';
var huifuComment = function (event) {
  commentID = event.currentTarget.dataset.commentid;
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
    isShowFloatView: false,
  });
};

var bindblur = function () {
  commentID = '';
  simpleLib.setData(route, {
    isClickComment: false,
    focus: false,
    isShowFloatView: true,
  });
};

var commentInputStr = '';
var bindconfirm = function (event) {
  var that = this;
  commentInputStr = event.detail.value;
  if (commentID) {
    var params = {
      parent: {
        objectId: commentID
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
        console.log(res);
        if (res.statusCode == 200) {
          loadNewDataList(that.data.courseId);
          commentID = '';
        }
      },
      fail: function (res) {

      }
    })
  } else {
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/comment',
      data: {
        relatedType: 'Course',
        relatedId: that.data.courseId,
        content: commentInputStr,
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200) {
          loadNewDataList(that.data.courseId);
        }
      },
      fail: function (res) {

      }
    })
  }
};

var comment = function () {
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
    isShowFloatView: false,
  });
};


var navigateToReadLastLesson = function (event){
  clickPreview();
  var that = this.data;
  var typeName = event.currentTarget.dataset.name;
  var contentType = event.currentTarget.dataset.contenttype;
  var objectId = event.currentTarget.dataset.lastlessonid;
  console.log(objectId);
  if(typeName == '订阅课程'){
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/course/' + that.lessonDataInfo.courseId + '/subscribe',
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data)
        if (res.statusCode == 200) {
          simpleLib.toast("订阅成功");
          simpleLib.getGlobalData().isSubscribe = '1'
          getLessonDetail(that.courseId);
          // setTimeout(function () {
          //   if (contentType == 3) {
          //     wx.navigateTo({
          //       url: '/pages/VideoLessonDetail/VideoLessonDetail?objectId=' + objectId,
          //     })
          //   } else if (contentType == 2) {
          //     wx.navigateTo({
          //       url: '/pages/AudioLessonDetail/AudioLessonDetail?objectId=' + objectId,
          //     })
          //   } else if (contentType == 1) {
          //     wx.navigateTo({
          //       url: '/pages/LessonDetail/LessonDetail?objectId=' + objectId,
          //     })
          //   }
          // }, 2000)          
        }

      },
      fail: function (res) {
        simpleLib.failToast("订阅失败")
      }
    })

  } else if(typeName == '播放全部'){
    if(!objectId){
      objectId = that.lessonDataInfo.chapterList[0].lessonList[0].objectId;
    }
    if (contentType == 3) {
      wx.navigateTo({
        url: '/pages/VideoLessonDetail/VideoLessonDetail?objectId=' + objectId,
      })
    } else if (contentType == 2) {
      wx.navigateTo({
        url: '/pages/AudioLessonDetail/AudioLessonDetail?objectId=' + objectId,
      })
    } else if (contentType == 1) {
      wx.navigateTo({
        url: '/pages/LessonDetail/LessonDetail?objectId=' + objectId,
      })
    }
  }
};

var guanzhuClick = function (event){
  var that = this;
  clickPreview();
  var teacherId = event.currentTarget.dataset.teacherid;
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/follow',
    data: {
      userId:teacherId
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      if(res.statusCode == 200){
        getLessonDetail(that.data.courseId);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.toast("关注失败");
    }
  })
};

var deleteguanzhuClick = function (event){
  var that = this;
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
        getLessonDetail(that.data.courseId);
      };

    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("关注失败");
    }
  })
};

const backgroundAudioManager = wx.getBackgroundAudioManager();


var setProgressTimer = '';
var onShow = function (){
  commentID = '';
  if (simpleLib.getGlobalData().isRead == '1'){
    getLessonDetail(this.data.courseId);
    simpleLib.getGlobalData().isRead = '';
  }
  
  if (simpleLib.getGlobalData().isHuifu == '1') {
    loadNewDataList(this.data.courseId);
    simpleLib.getGlobalData().isPress = '';
    simpleLib.getGlobalData().isPressSuccess = '';
    simpleLib.getGlobalData().isHuifu = '';
  }


  if (simpleLib.getGlobalData().isPlayingAudio == '1'){
    simpleLib.setData(route, {
      isShowSimpleAudio:true,
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
  } else if (simpleLib.getGlobalData().isPlayingAudio == '3'){
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
var onHide = function (){
  clearInterval(setProgressTimer);
}

var showReport = function (event) {
  var showContent = event.currentTarget.dataset.content;
  wx.showActionSheet({
    itemList: ['回复', '举报'],
    success: function (res) {
      console.log(res.tapIndex)
      if(res.tapIndex == 0){
        simpleLib.setData(route, {
          isClickComment: true,
          focus: true,
          isShowFloatView: false,
        });
      } else if(res.tapIndex == 1){
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

var navigateToUserInfo = function (event){
  
  var userId = event.currentTarget.dataset.userid;
  var isSelf = '';
  if (userId == simpleLib.getGlobalData().user.userId){
    isSelf = 1;
  } else {
    isSelf = 0;
  }
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId + '&isSelf=' + isSelf,
  })
};


var onShareAppMessage = function () {
  
    return {
      title: detailData.name,
      path: 'pages/LessonPage/LessonPage?objectId=' + detailData.courseId,
      success: function (res) {
        simpleLib.toast('转发成功');
      },
      fail: function (res) {
        simpleLib.failToast('转发失败');
      }
    }
  
};

//公用悬浮音频组件内的播放暂停事件
var playAudio = function (event) {
  var playImage = event.currentTarget.dataset.playimage;
  console.log(playImage);
  if (playImage == '../../image/stopIcon.png'){
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
  } else if (playImage == '../../image/bofangicon.png'){
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
    scribeContent: '',
    ZkOrSq: '阅读全文',
    isClickComment: false,
    focus: false,
    isShowFloatView:true,
    courseId:'',
    lessonDataInfo:'',

    isShowSimpleAudio:false,
    'audioInfo.title':'',
    'audioInfo.currentTime': '00:00'

  },
  onLoad: onload,

  onHide: onHide,
  onUnload: onUnload,
  playAudio: playAudio,

  onShow: onShow,
  onShareAppMessage: onShareAppMessage,
  onReachBottom: onReachBottom,
  zhankaiquanwen: zhankaiquanwen,
  navigateToCommentDetail: navigateToCommentDetail,
  navigateToTagDetail: navigateToTagDetail,
  navigateToVideoDetail: navigateToVideoDetail,
  dianzan: dianzan,
  huifuComment: huifuComment,
  bindconfirm: bindconfirm,
  bindblur: bindblur,
  comment: comment,
  navigateToReadLastLesson: navigateToReadLastLesson,
  guanzhuClick: guanzhuClick,
  deleteguanzhuClick: deleteguanzhuClick,
  showReport: showReport,
  navigateToUserInfo: navigateToUserInfo,
  onPullDownRefresh: onPullDownRefresh,
  
})