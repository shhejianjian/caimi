var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaSingleDetail/WenDaSingleDetail";

////拉取回答信息
var answerData = '';
var getSingleAnswerInfo = function (){
  wx.request({
    url: simpleLib.baseUrl + '/public/answer/' + answerID,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      answerData = res.data;
      if(answerData.liked == 0){
        answerData.likeText = '点    赞';
      } else if(answerData.liked == 1){
        answerData.likeText = '已 点 赞';
      }
      if (answerData.topicInfo.solved==0){
        var questiondate = simpleLib.lastTime(answerData.topicInfo.expiredTime);
        answerData.questiondate = questiondate;
      }
      var date = simpleLib.getTime(answerData.submitTime);
      answerData.date = date;

      simpleLib.setData(route, {
        answerInfo: answerData
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};
////拉取问题信息
// var getQuestionDetailInfo = function () {
//   wx.showLoading({
//     title: '加载中',
//   });
//   wx.request({
//     url: simpleLib.baseUrl + '/public/topic/' + topicID,
//     header: {
//       'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
//     },
//     success: function (res) {
//       wx.hideLoading();
//       console.log(res.data)

//       var questionData = res.data;
//       var date = simpleLib.lastTime(questionData.expiredTime);
//       questionData.date = date;

//       simpleLib.setData(route, {
//         questionInfo: questionData
//       });
//     },
//     fail: function (res) {
//       wx.hideLoading();
//       simpleLib.toast("查询失败")
//     }
//   })
// };

var answerID = '';
// var topicID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  answerID = options.answerId;
  // topicID = options.topicId;
  getSingleAnswerInfo();
  // getQuestionDetailInfo();
  loadNewDataList();
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

////跳转至用户主页
var navigateToUserInfo = function (event) {
  clickPreview();
  var userId = event.currentTarget.dataset.userid;
  wx.navigateTo({
    url: '/pages/UserMainInfo/UserMainInfo?userId=' + userId + '&isSelf=0',
  })
};

var dianzan = function (){
  clickPreview();
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/answer/' + answerID + '/like',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      if (res.statusCode == 200) {
        if (answerData.likeText == '点    赞'){
          simpleLib.toast("点赞成功");
        } else if (answerData.likeText == '已 点 赞'){
          simpleLib.toast("取消点赞");
        }
        simpleLib.getGlobalData().isPressSuccess = '1';
        simpleLib.getGlobalData().isPress = '1';
        simpleLib.getGlobalData().isHuifu = '1';
        getSingleAnswerInfo();
      } else {
        simpleLib.failToast("点赞失败");
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("点赞失败")
    }
  })

};


var comment = function () {
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

////完成回复评论
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
          simpleLib.getGlobalData().isPressSuccess = '1';
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
        relatedType: 'Answer',
        relatedId: answerID,
        content: commentInputStr,
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200) {
          simpleLib.getGlobalData().isPressSuccess = '1';
          loadNewDataList();
        }
      },
      fail: function (res) {

      }
    })
  }
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
    url: simpleLib.baseUrl + '/public/comment?relatedId=' + answerID,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      pageNo: currentPage,
      pageSize:'10'
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

////评论点赞
var liuyandianzan = function (event) {
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

////点击回复评论
var commentID = '';
var huifuComment = function (event) {
  commentID = event.currentTarget.dataset.commentid;
  simpleLib.setData(route, {
    isClickComment: true,
    focus: true,
  });
};

var navigateToCommentDetail = function (event) {
  clickPreview();
  var commentId = event.currentTarget.dataset.commentid;

  wx.navigateTo({
    url: '/pages/CommentDetail/CommentDetail?commentId=' + commentId,
  })
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

Page({
  data: {
    isClickComment: false,
    focus: false,
  },
  onLoad: onload,
  onReachBottom: onReachBottom,
  navigateToUserInfo: navigateToUserInfo,
  dianzan: dianzan,
  comment: comment,
  bindblur: bindblur,
  bindconfirm: bindconfirm,
  huifuComment: huifuComment,
  liuyandianzan: liuyandianzan,
  navigateToCommentDetail: navigateToCommentDetail,
  showReport: showReport,
  navigateToUserInfo: navigateToUserInfo,
})