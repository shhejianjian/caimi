var simpleLib = require('../libs/simple-lib.js');
var route = "pages/CommentDetail/CommentDetail";

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

var onReachBottom = function () {
  getMoreReplyList(this.data.mainCommentId);
};

Page({
  data: {
    mainCommentId:'',
  },
  onLoad: onload,
  bindconfirm: bindconfirm,
  huifuComment: huifuComment,
  bindblur: bindblur,
  dianzan: dianzan,
  showReport: showReport,
  navigateToUserInfo: navigateToUserInfo,
  onReachBottom: onReachBottom,
})