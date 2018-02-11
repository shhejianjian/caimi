var simpleLib = require('../libs/simple-lib.js');
var route = "pages/AudioLessonDetail/AudioLessonDetail";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var lessonListArr = [];
var getRelatedLessonList = function (couesrId){
  lessonListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course/' + couesrId +'/related' ,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      var data = res.data;
      if (data){
        for (var i = 0; i < data.length; i++) {
          var date = simpleLib.getTime(data[i].lastUpdateTime);
          data[i].date = date;
          lessonListArr.push(data[i]);
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

var audioIndex = '';
var handlerTabTap = function (e) {
  clickPreview();
  var index = e.currentTarget.dataset.index;
  if(audioIndex != index){
    wx.stopBackgroundAudio();
    simpleLib.getGlobalData().isplaying = false;
    simpleLib.setData(route, {
      playOrStop: '../../image/bofangicon.png',
      audioCurrentTime:'00:00',
      audioProgress: 0,
    });
  }
  audioIndex = e.currentTarget.dataset.index;
  objectID = index;
  getVideoDetailInfo(objectID);
  loadNewDataList();
  simpleLib.setData(route, {
    activeTab: e.currentTarget.dataset.index,
    practiseName: e.currentTarget.dataset.name,
  });
  
};





var tabsArr = [];
var getVideoDetailInfo = function (objectid) {
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

      var audioLessonData = res.data;

      for (var i = 0; i < audioLessonData.courseInfo.chapterList.length; i++) {
        var subData = audioLessonData.courseInfo.chapterList[i].lessonList;
        for (var j = 0; j < subData.length; j++) {
          subData[j].title = '第' + simpleLib.NumberToChinese(i+1) + '章' + '/' + '第' + simpleLib.NumberToChinese(j+1) +'课';
          tabsArr.push(subData[j]);
        }
      }
      audioLessonData.courseInfo.intro = audioLessonData.courseInfo.intro.replace(/<img[^>]*src=['"]([^'"]+)[^>]*>/g, function (match, capture) {
        if (capture && capture.indexOf('http') == 0) {
          return match;
        }
        return match.replace(capture, simpleLib.baseUrl+'/image/' + capture + '.jpg');
      });
      for (var i = 0; i < tabsArr.length; i++) {
        if (objectID == tabsArr[i].objectId) {
          simpleLib.setData(route, {
            practiseName: tabsArr[i].title,
          });
        }
      }
      simpleLib.setData(route, {
        lessonData: audioLessonData,
        videoUrl: res.data.url,
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




const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var playAudio = function (){
  clickPreview();
  console.log(this.data.playOrStop);
  if (this.data.playOrStop == '../../image/stopIcon.png'){
    console.log('暂停')
    backgroundAudioManager.pause();
    //播放暂停事件
    backgroundAudioManager.onPause((res) => {
      simpleLib.getGlobalData().isPlayingAudio = '2';
      console.log('暂停了');
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        playOrStop: '../../image/bofangicon.png',
      });
    });
  } else if (this.data.playOrStop == '../../image/bofangicon.png'){
    console.log('播放')
    backgroundAudioManager.src = simpleLib.baseUrl + this.data.lessonData.url;
    backgroundAudioManager.title = this.data.lessonData.name;
    backgroundAudioManager.play();
    //正在播放事件
    backgroundAudioManager.onPlay((res) => {
      console.log('播放了');
      simpleLib.getGlobalData().isPlayingAudio = '1';
      simpleLib.setData(route, {
        playOrStop: '../../image/stopIcon.png',
      });
      setProgressTimer = setInterval(function () {
        console.log(backgroundAudioManager.paused);
        simpleLib.setData(route, {
          audioProgress: parseInt(backgroundAudioManager.currentTime) / parseInt(backgroundAudioManager.duration) * 100,
          audioCurrentTime: timeToString(parseInt(backgroundAudioManager.currentTime)),
        })
      }, 1000);
    });
    //播放结束事件
    backgroundAudioManager.onEnded((res) => {
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      console.log(backgroundAudioManager.paused);
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        playOrStop: '../../image/bofangicon.png',
        audioCurrentTime: '00:00',
        audioProgress: 0,
      });
    });
    //播放停止事件
    backgroundAudioManager.onStop((res) => {
      console.log('停止了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        playOrStop: '../../image/bofangicon.png',
        audioCurrentTime: '00:00',
        audioProgress: 0,
      });
    });
  }
};

var playPastAudio = function (){
  for(var i = 0;i<tabsArr.length;i++){
    if(objectID == tabsArr[i].objectId){
      if(i != 0){
        objectID = tabsArr[i-1].objectId;
        var title = tabsArr[i - 1].title;
        simpleLib.getGlobalData().isplaying = false;
        backgroundAudioManager.stop();
        simpleLib.setData(route, {
          playOrStop: '../../image/bofangicon.png',
          audioCurrentTime: '00:00',
          audioProgress: 0,
        });
        audioIndex = objectID;
        getVideoDetailInfo(objectID);
        loadNewDataList();
        simpleLib.setData(route, {
          activeTab: objectID,
          practiseName: title,
        });
      }
    }
  }
};
var playNextAudio = function (){
  for (var i = 0; i < tabsArr.length; i++) {
    if (objectID == tabsArr[i].objectId) {
      if (i != tabsArr.length-1) {
        objectID = tabsArr[i+1].objectId;
        var title = tabsArr[i+1].title;
        simpleLib.getGlobalData().isplaying = false;
        backgroundAudioManager.stop();
        simpleLib.setData(route, {
          playOrStop: '../../image/bofangicon.png',
          audioCurrentTime: '00:00',
          audioProgress: 0,
        });
        audioIndex = objectID;
        getVideoDetailInfo(objectID);
        loadNewDataList();
        simpleLib.setData(route, {
          activeTab: objectID,
          practiseName: title,
        });
      }
    }
  }
};


var onReady = function (){
  // wx.onBackgroundAudioPlay(function () {
  //   console.log('播放了');
  //   songPlay();
  // });
};

var onShow = function (){
  // if (simpleLib.getGlobalData().isplaying == true) {
  //   simpleLib.setData(route, {
  //     playOrStop: '../../image/stopIcon.png',
  //   });
  // } else if (simpleLib.getGlobalData().isplaying == false) {
  //   simpleLib.setData(route, {
  //     playOrStop: '../../image/bofangicon.png',
  //   });
  // }
  if (simpleLib.getGlobalData().jjsuccess == '1'){
    getVideoDetailInfo();
    simpleLib.getGlobalData().jjsuccess = '';
  }

  if (simpleLib.getGlobalData().isPlayingAudio == '1'){
    simpleLib.setData(route, {
      playOrStop: '../../image/stopIcon.png',
    });
    setProgressTimer = setInterval(function () {
      simpleLib.setData(route, {
        audioProgress: backgroundAudioManager.currentTime / backgroundAudioManager.duration * 100,
        audioCurrentTime: timeToString(parseInt(backgroundAudioManager.currentTime)),
      })
    }, 1000);
  } else if (simpleLib.getGlobalData().isPlayingAudio == '2'){
    simpleLib.setData(route, {
      playOrStop: '../../image/bofangicon.png',
      audioProgress: backgroundAudioManager.currentTime / backgroundAudioManager.duration * 100,
      audioCurrentTime: timeToString(parseInt(backgroundAudioManager.currentTime)),
    });
  }


}
  
// var inv = '';
// var songPlay = function (){
//   inv = setInterval(function () {
//     wx.getBackgroundAudioPlayerState({
//       success: function (res) {
//         console.log(res);
//         audioCurrent = res.currentPosition;
//         if (res.status == 1) {
//           simpleLib.setData(route,{
//             audioProgress: res.currentPosition / res.duration * 100,
//             audioCurrentTime: timeToString(parseInt(res.currentPosition)),
//           })
//         } else {

//         }
//       }
//     });
//   }, 1000);
// };

var timeToString = function (duration){
  let str = '';
  let minute = parseInt(duration / 60) < 10 ? ('0' + parseInt(duration / 60)) : (parseInt(duration / 60));
  let second = duration % 60 < 10 ? ('0' + duration % 60) : (duration % 60);
  str = minute + ':' + second;
  return str;
};




var objectID = '';
var Duration = 0;
var id1 = '';
var id2 = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    lessonId: options.objectId,
  });
  objectID = options.objectId;

  getVideoDetailInfo(objectID);
  loadNewDataList();
  getRelatedLessonList(options.courseId);
  readLessonTime();
  id1 = setInterval(function () {
    readLessonTime(60);
  }, 1000 * 60);
  id2 = setInterval(function () {
    Duration++;
  }, 1000);

  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight - 232
      });
    }
  });
};


var readLessonTime = function (duration) {
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

// var minute = '0';
// var second = '0';
 var audioCurrent = '';
// var MusicStart = function (event){
//   audioCurrent = parseInt(event.detail.currentTime);
//   var progress = parseInt((event.detail.currentTime / event.detail.duration) * 100);
//   minute = Math.floor(event.detail.currentTime / 60 % 60);
//   second = Math.floor(event.detail.currentTime % 60);
//   if (minute < 10) {
//     minute = "0" + minute;
//   }
//   if (second < 10) {
//     second = "0" + second;
//   }
//   simpleLib.setData(route, {
//     audioProgress: progress,
//     audioCurrentTime: minute + ':' + second,
//     playOrStop: '../../image/stopIcon.png',
//   });
// };

var onUnload = function () {
  // wx.stopBackgroundAudio();
  clearInterval(setProgressTimer);
  clearInterval(id1);
  clearInterval(id2);
  // simpleLib.getGlobalData().isplaying = '';
  // console.log(audioCurrent);
  // wx.request({
  //   url: simpleLib.baseUrl + '/api/v1/caimi/course/lesson/' + objectID + '/read',
  //   data: {
  //     duration: Duration,
  //     progress: audioCurrent
  //   },
  //   header: {
  //     'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
  //   },
  //   method: 'POST',
  //   success: function (res) {
  //     console.log(res);

  //   },
  //   fail: function (res) {

  //   }
  // })
};

var changeLessonList = function (){
  clickPreview();
  simpleLib.setData(route, {
    isLessonOrComment: 1,
  });
};
var changeCommentList = function (){
  clickPreview();
  simpleLib.setData(route, {
    isLessonOrComment: 2,
  });
};
var changeArtical = function (){
  clickPreview();
  simpleLib.setData(route, {
    isLessonOrComment: 3,
  });
};
var navigateToCommentDetail = function (event) {
  clickPreview();
  var commentId = event.currentTarget.dataset.commentid;
  
  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
};

var navigateToLessonPractise = function (event){
  clickPreview();
  // audioContext.pause();
  if (event.currentTarget.dataset.exercise) {
    wx.navigateTo({
      url: '/pages/AudioLessonExercise/AudioLessonExercise?exerciseId=' + event.currentTarget.dataset.exercise.exerciseId + '&lessonId=' + objectID +'&audioCurrent=' + audioCurrent,
    })
  } else {
    wx.navigateTo({
      url: '/pages/AudioLessonPractise/AudioLessonPractise?objectid=' + objectID + '&audioCurrent=' + audioCurrent,
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
        simpleLib.failToast("回复失败")
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
        simpleLib.failToast("回复失败")
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
      simpleLib.failToast("点赞失败")

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
        commentID = event.currentTarget.dataset.commentid;
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

Page({
  data: {
    lessonData:'',
    audioProgress:0,
    audioCurrentTime:'00:00',
    activeTab:0,
    isLessonOrComment:1,
    practiseName: '',
    playOrStop:'../../image/bofangicon.png',
    toView: '',
    lessonId:'',
  },
  onLoad: onload,
  onReachBottom: onReachBottom,
  onShow: onShow,
  onReady: onReady,
  onUnload: onUnload,
  playAudio: playAudio,
  handlerTabTap: handlerTabTap,
  changeLessonList: changeLessonList,
  changeCommentList: changeCommentList,
  navigateToCommentDetail: navigateToCommentDetail,
  navigateToLessonPractise: navigateToLessonPractise,
  comment: comment,
  bindblur: bindblur,
  bindconfirm: bindconfirm,
  dianzan: dianzan,
  huifuComment: huifuComment,
  changeArtical: changeArtical,
  navigateToBuyLesson: navigateToBuyLesson,
  showReport: showReport,
  playNextAudio: playNextAudio,
  playPastAudio: playPastAudio,
  navigateToUserInfo: navigateToUserInfo,
  onPullDownRefresh: onPullDownRefresh,
})
