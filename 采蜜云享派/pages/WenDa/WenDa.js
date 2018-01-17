var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDa/WenDa";


var sorts = [
  {
    name: '关注量排序',
    contentType: 'follow',
  },
  {
    name: '赏金排序',
    contentType: 'reward',
  },
  {
    name: '回答排序',
    contentType: 'answer',
  },
]



var initTabs = function () {
  simpleLib.setData(route, {
    sortList: sorts,
  });
  getMenuList();
};


var subAllMenu = {
  name:'全部',
  objectId:'',
};

var getMenuList = function (){
  wx.request({
    url: simpleLib.baseUrl + '/public/tag/system',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      var data = res.data;
      console.log(data);
      mainTagId = data[0].objectId;
      for(var i = 0;i<data.length;i++){
        data[i].childList.unshift(subAllMenu);
      }
      simpleLib.setData(route, {
        menuList: data,
      });
      
    },
    fail: function (res) {

      simpleLib.failToast("查询失败");
    }
  })
};









var questionArr = [];
var loadQuestionListDetail = function (sortby,solved,tagId){
  questionArr = [];
  // wx.showLoading({
  //   title: '加载中',
  // });
  wx.request({
    url: simpleLib.baseUrl + '/public/topic',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      sortBy: sortby,
      solved: solved,
      tag:tagId
    },
    success: function (res) {
      // wx.hideLoading();
      console.log(res.data.content)
      var questionData = res.data.content;
      for(var i = 0;i < questionData.length;i++){
        questionData[0].isPublic = 1;
        var date = simpleLib.lastTime(questionData[i].expiredTime);
        questionData[i].date = date;
        if (questionData[i].followed == 0){
          questionData[i].followStr = '关注问题';
        } else if (questionData[i].followed == 1){
          questionData[i].followStr = '已关注';
        }
        if (questionData[i].bestAnswerLiked == 0) {
          questionData[i].likeStr = '点赞';
        } else if (questionData[i].bestAnswerLiked == 1) {
          questionData[i].likeStr = '已赞';
        }

        questionArr.push(questionData[i]);
      }
      
      simpleLib.setData(route, {
        questionList: questionArr
      });
    },
    fail: function (res) {
      // wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};



var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  initTabs();
  
};

var showFirstSortList = function (){
  simpleLib.setData(route, {
    showNavIndex: 1,
    openSort: true,
    isShowBackView: true,
  });
};

var showSecondSortList = function (){
  simpleLib.setData(route, {
    openSort:true,
    showNavIndex: 2,
    isShowBackView: true,
  });
};
var clickBackView = function (){
  simpleLib.setData(route, {
    openSort:false,
    showNavIndex: 0,
    isShowBackView: false,
  });
  tagID = '';
};

var typeIndex = '';
var clickSortItem = function (event){
  typeIndex = event.currentTarget.dataset.index;
  var name = event.currentTarget.dataset.name;
  simpleLib.setData(route, {
    itemIndex: typeIndex,
    isShowBackView: false,
    openSort:false,
    sortName:name,
  });
  loadQuestionListDetail(typeIndex, solvedStr,tagID);
};


var tagID = '';
var mainTagId = '';

var clickMainMenu = function (event){
  var index = event.currentTarget.dataset.menuindex;
  var tagId = event.currentTarget.dataset.tagid;
  var menuName = event.currentTarget.dataset.menuname;
  tagID = tagId;
  mainTagId = tagId;
  simpleLib.setData(route, {
    menuIndex: index,
    selectedMainIndex:index,
    selectedSubIndex:-1,
    menuName: menuName,
  });
  console.log(menuName+'/'+tagId);
};
var clickSubMenu = function (event){
  var index = event.currentTarget.dataset.subindex;
  var tagId = event.currentTarget.dataset.tagid;
  var subMenuName = event.currentTarget.dataset.name;
  if(index != 0){
    tagID = tagId;
  } else {
    tagID = mainTagId;
  }
  simpleLib.setData(route, {
    selectedSubIndex: index,
    isShowBackView: false,
    openSort: false,
  });
  loadQuestionListDetail(typeIndex, solvedStr, tagID);
  console.log(subMenuName + '/' + tagId);
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

var solvedStr = '0';
var clickJiejue = function (){
  clickPreview();
  var that = this;
  if (that.data.kaiguanImage == '../../image/kaiguan-selected.png'){
    solvedStr = '0';
    simpleLib.setData(route, {
      kaiguanImage: '../../image/kaiguan-normal.png',
      jiejueText:'未解决'
    });
  } else if (that.data.kaiguanImage == '../../image/kaiguan-normal.png') {
    solvedStr = '1';
    simpleLib.setData(route, {
      kaiguanImage: '../../image/kaiguan-selected.png',
      jiejueText:'已解决'
    });
  }
  loadQuestionListDetail(typeIndex, solvedStr,tagID);
};


var navigateToDetail = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaPage/WenDaPage?topicId=' + event.currentTarget.dataset.topicid,
  })
};

var navigateToFaQiWenDa = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/FaQiWenDa/FaQiWenDa',
  })
};

var followQuestion = function (event){
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + event.currentTarget.dataset.topicid + '/follow',
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
        loadQuestionListDetail(typeIndex, solvedStr,tagID);
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("关注失败")
    }
  })
};


var navigateToSingleDetail = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/WenDaSingleDetail/WenDaSingleDetail?answerId=' + event.currentTarget.dataset.answerid + '&topicId=' + event.currentTarget.dataset.topicid,
  })
};

var onShow = function (){

    loadQuestionListDetail(typeIndex, solvedStr,tagID);

}

var bindfocus = function (event) {

  wx.navigateTo({
    url: '/pages/LessonSearchVC/LessonSearchVC?textValue=' + event.detail.value,
  })
};

var navigateToNotice = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNotice/MyNotice',
  })
};


Page({
  data: {
    kaiguanImage:'../../image/kaiguan-normal.png',
    showNavIndex:0,
    isShowBackView:false,
    itemIndex:-10,
    sortName:'智能排序',
    menuName:'股票',
    openSort:false,
    menuIndex:0,
    selectedMainIndex:0,
    selectedSubIndex:-1,
    dianzanText:'点赞 ',
    pinglunText:'评论 ',
    jiejueText:'未解决'
  },
  onLoad: onload,
  onShow: onShow,
  bindfocus: bindfocus,
  clickJiejue: clickJiejue,
  navigateToDetail: navigateToDetail,
  navigateToFaQiWenDa: navigateToFaQiWenDa,
  showFirstSortList: showFirstSortList,
  showSecondSortList: showSecondSortList,
  clickBackView: clickBackView,
  clickSortItem: clickSortItem,
  clickMainMenu: clickMainMenu,
  clickSubMenu: clickSubMenu,
  followQuestion: followQuestion,
  navigateToSingleDetail: navigateToSingleDetail,
  navigateToNotice: navigateToNotice,
})