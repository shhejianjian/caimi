var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonDetail/LessonDetail";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var lessonListArr = [];
var getRelatedLessonList = function (courseId) {
  lessonListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course/' + courseId + '/related',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      var lessonData = res.data;
      if(lessonData){
        for (var i = 0; i < lessonData.length; i++) {
          var date = simpleLib.getTime(lessonData[i].lastUpdateTime);
          lessonData[i].date = date;
          lessonListArr.push(lessonData[i]);
        }

        simpleLib.setData(route, {
          lessons: lessonListArr
        });
      }
      
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};
var handlerTabTap = function (e) {
  var index = e.currentTarget.dataset.index;
  objectID = index;
  getArticalDetailInfo(objectID);
  loadNewDataList();
  simpleLib.setData(route, {
    activeTab: e.currentTarget.dataset.index,
  });
};

var tabsArr = [];
var lessonData = '';
// var tagListStr = '';

var getArticalDetailInfo = function (objectid) {
  wx.showLoading({
    title: '加载中',
  });
  tabsArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/lesson/' + objectid,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)

      lessonData = res.data;
      // for (var i = 0; i < lessonData.commentInfoList.length; i++) {
      //   var date = simpleLib.getTime(lessonData.commentInfoList[i].submitTime);
      //   lessonData.commentInfoList[i].submitTime = date;
      //   if (lessonData.commentInfoList[i].liked == 0) {
      //     lessonData.commentInfoList[i].zanImg = '../../image/dianzanicon.png';
      //   } else if (lessonData.commentInfoList[i].liked == 1) {
      //     lessonData.commentInfoList[i].zanImg = '../../image/yizanicon.png';
      //   }
      // }
      // for (var i = 0; i < lessonData.courseInfo.tagList.length; i++) {
      //   tagListStr = 'tag=' + lessonData.courseInfo.tagList[i].objectId;
      // }
      // console.log(tagListStr);
      for (var i = 0; i < lessonData.courseInfo.chapterList.length; i++) {
        var subData = lessonData.courseInfo.chapterList[i].lessonList;
        for (var j = 0; j < subData.length; j++) {
          subData[j].title = '第' + simpleLib.NumberToChinese(i + 1) + '章' + '/' + '第' + simpleLib.NumberToChinese(j + 1) + '课';
          tabsArr.push(subData[j]);
        }
      }
      lessonData.content = lessonData.content.replace(/<img[^>]*src=['"]([^'"]+)[^>]*>/g, function (match, capture) {
        if (capture && capture.indexOf('http') == 0) {
          return match;
        }
        return match.replace(capture, simpleLib.baseUrl +'/image/' + capture + '.jpg');
      });
      for (var i = 0; i < tabsArr.length; i++) {
        if (objectID == tabsArr[i].objectId) {
          simpleLib.setData(route, {
            practiseName: tabsArr[i].title,
          });
        }
      }
      simpleLib.setData(route, {
        lessonData: lessonData,
        tabs: tabsArr,
        activeTab: objectID,
        scribeContent: res.data.courseInfo.summary,
      });
      setTimeout(function () {
        simpleLib.setData(route, {
          toView: 'X' + objectID,
        });
      }, 300)
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
var loadNewDataList = function () {
  currentPage = 1;
  commentArr = [];
  loadReplyList();
};
var loadMoreDataList = function () {
  currentPage++;
  loadReplyList();
};
var loadReplyList = function () {
  wx.request({
    url: simpleLib.baseUrl + '/public/comment?relatedId=' + objectID,
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
  loadMoreDataList();
};



var objectID = '';
var id;
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    lessonId:options.objectId,
  });
  objectID = options.objectId;
  getArticalDetailInfo(objectID);
  loadNewDataList();
  getRelatedLessonList(options.courseId);
  readLessonTime();
  id = setInterval(function () {
    readLessonTime(60);
  }, 1000 * 60);
};
var onUnload = function (){
  clearInterval(id);
    clearInterval(setProgressTimer);
};

var readLessonTime = function (duration){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/course/lesson/' + objectID + '/read',
    data: {
      duration: duration
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      simpleLib.getGlobalData().isRead = '1';
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

var navigateToLessonPractise = function (event) {
  clickPreview();
  if (event.currentTarget.dataset.exercise){
    wx.navigateTo({
      url: '/pages/LessonDetailExercise/LessonDetailExercise?exerciseId=' + event.currentTarget.dataset.exercise.exerciseId + '&lessonId=' + objectID,
    })
  } else {
    wx.navigateTo({
      url: '/pages/LessonDetailPractise/LessonDetailPractise?objectid=' + objectID,
    })
  }
};



var comment = function () {
  clickPreview();
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
  });
};
var bindblur = function () {
  commentID = '';
  simpleLib.setData(route, {
    isClickComment: false,
    focus: false,
  });
};

var commentInputStr = '';
var bindconfirm = function (event) {
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
        console.log(res.data);
        if (res.statusCode == 200) {
          loadNewDataList();
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
        relatedType: 'Lesson',
        relatedId: objectID,
        content: commentInputStr,
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200) {
          loadNewDataList();
        }
      },
      fail: function (res) {

      }
    })
  }
};

var commentID = '';
var huifuComment = function (event) {
  clickPreview();
  commentID = event.currentTarget.dataset.commentid;
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
  });
};

var dianzan = function (event) {
  clickPreview();
  wx.showLoading({
    title: '正在加载',
  });
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
      wx.hideLoading();
      console.log(res.data);
      if (res.statusCode == 200) {
        loadNewDataList();
      }
    },
    fail: function (res) {
      wx.hideLoading();

    }
  })
};
var changeLessonList = function () {
 clickPreview();
  simpleLib.setData(route, {
    isLessonOrComment: true
  });
};
var changeCommentList = function () {
 clickPreview();
   simpleLib.setData(route, {
    isLessonOrComment: false
  });
};

var navigateToCommentDetail = function (event) {
  clickPreview();
  var commentId = event.currentTarget.dataset.commentid;
  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
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

var showReport = function (event) {
  wx.showActionSheet({
    itemList: ['回复', '举报'],
    success: function (res) {
      console.log(res.tapIndex)
      if (res.tapIndex == 0) {
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

const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function (){
  if (simpleLib.getGlobalData().jjsuccess == '1') {
    getArticalDetailInfo(objectID);
    simpleLib.getGlobalData().jjsuccess = '';
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

Page({
  data: {
    isLessonOrComment:true,
    lessonId:'',
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onShow: onShow,
  onHide: onHide,
  onUnload: onUnload,
  onReachBottom: onReachBottom,
  handlerTabTap: handlerTabTap,
  navigateToLessonPractise: navigateToLessonPractise,
  comment: comment,
  bindblur: bindblur,
  bindconfirm: bindconfirm,
  dianzan: dianzan,
  huifuComment: huifuComment,
  changeLessonList:changeLessonList,
  changeCommentList: changeCommentList,
  navigateToCommentDetail: navigateToCommentDetail,
  navigateToBuyLesson: navigateToBuyLesson,
  showReport:showReport,
  onPullDownRefresh: onPullDownRefresh,
  navigateToUserInfo: navigateToUserInfo,
})