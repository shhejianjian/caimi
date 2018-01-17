var simpleLib = require('../libs/simple-lib.js');
var route = "pages/LessonDetail/LessonDetail";

var lessonListArr = [];
var getRelatedLessonList = function () {
  lessonListArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course/' + objectID + '/related',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      var lessonData = res.data.content;
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
          subData[j].title = lessonData.courseInfo.chapterList[i].name + '/' + subData[j].name;
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
    baseUrl: simpleLib.baseUrl
  });
  objectID = options.objectId;
  getArticalDetailInfo(objectID);
  loadNewDataList();
  getRelatedLessonList();
  readLessonTime();
  id = setInterval(function () {
    readLessonTime(60);
  }, 1000 * 60);
};
var onUnload = function (){
  clearInterval(id);
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
          url: '/pages/ReportView/ReportView?commentId=' + event.currentTarget.dataset.commentid + '&userName=' + event.currentTarget.dataset.username + '&content=' + event.currentTarget.dataset.usercontent,
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

var onShow = function (){
  if (simpleLib.getGlobalData().jjsuccess == '1') {
    getArticalDetailInfo(objectID);
    simpleLib.getGlobalData().jjsuccess = '';
  }
};

Page({
  data: {
    isLessonOrComment:true,
  },
  onLoad: onload,
  onShow: onShow,
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
  navigateToUserInfo: navigateToUserInfo,
})