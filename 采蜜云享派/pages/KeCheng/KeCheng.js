var simpleLib = require('../libs/simple-lib.js');
var route = "pages/KeCheng/KeCheng";


var getReadStaus = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/course/read/status',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
    },
    success: function (res) {
      console.log(res.data)
      
      if (res.data.lessonReadCount == 0 && res.datalessonUnreadCount==0){
        simpleLib.setData(route, {
          isRead: 2
        });
      } else {
        simpleLib.setData(route, {
          isRead: 1
        });
      }

      simpleLib.setData(route, {
        readStatus: res.data
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};


var lessonArr = [];
var getLessonList = function (){
  wx.showLoading({
    title: '加载中',
  });
  lessonArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/course/home',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    data: {
      // pageNo: '1',
      // pageSize: '10',
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      var courseData = res.data;
      for(var i = 0;i < courseData.length;i++){
        var subData = courseData[i].courseList;
        for (var j = 0; j < subData.length;j++){
          var date = simpleLib.getTime(subData[j].lastUpdateTime);
          subData[j].date = date;
          // subData[j].cover = subData[j].cover.split('.')[0]+'!128_128.jpg';
          if (!subData[j].realPrice){
            subData[j].realPriceStr = '';
          } else {
            subData[j].realPriceStr = '￥' + subData[j].realPrice;
          }
          // if (!subData[j].referencePrice) {
          //   subData[j].referencePriceStr = '';
          // } else {
          //   subData[j].referencePriceStr = '￥' + subData[j].referencePrice;
          // }
          subData[j].percentCount = Math.floor(((subData[j].referencePrice - subData[j].realPrice) / subData[j].referencePrice)*100);
          
        }
        lessonArr.push(courseData[i]);
      }
      simpleLib.setData(route, {
        lessons: lessonArr
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
    }
  })
};




var onload = function () {
  
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });

  wx.checkSession({
    success: function (res) {

      getApplicationInfo();
      
    },
    fail: function () {
      // 登录
      doLogin();
    }
  })
  
};

var onShow = function (){
  if (simpleLib.getGlobalData().isSubscribe == '1'){
    wx.checkSession({
      success: function (res) {
        getApplicationInfo();
      },
      fail: function () {
        doLogin();
      }
    })
    simpleLib.getGlobalData().isSubscribe = '';
    simpleLib.getGlobalData().isPress = '';
  };

  if (simpleLib.getGlobalData().isChangePhoto == '1'){
    wx.checkSession({
      success: function (res) {
        getApplicationInfo();
      },
      fail: function () {
        doLogin();
      }
    })
    simpleLib.getGlobalData().isChangePhoto = '';
  }

  if (simpleLib.getGlobalData().isReadLesson == '1'){
    wx.checkSession({
      success: function (res) {
        getApplicationInfo();
      },
      fail: function () {
        doLogin();
      }
    })
    simpleLib.getGlobalData().isReadLesson = '';
  }
  if (simpleLib.getGlobalData().isChangeName == '1'){
    wx.checkSession({
      success: function (res) {
        getApplicationInfo();
      },
      fail: function () {
        doLogin();
      }
    })
    simpleLib.getGlobalData().isChangeName = '';
  }

};

var doLogin = function () {
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.request({
        url: simpleLib.baseUrl+'/login/weixin',
        method: 'GET',
        data: {
          code: res.code
        },
        success: res => {
          console.log(res);
          if(res.statusCode == 200){
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
    url: simpleLib.baseUrl+'/public/getCurrentInfo',
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
        
        if (res.data.currentUser.status == 0) {
          wx.getUserInfo({
            success: res => {
              console.log(res)
              wx.request({
                url: simpleLib.baseUrl+'/api/v1/caimi/user/weixin',
                method: 'PUT',
                data: {
                  encryptedData: res.encryptedData,
                  iv: res.iv
                },
                header: {
                  'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
                },
                success: function (res) {
                  if(res.statusCode == 200){
                    getApplicationInfo();
                  }
                  
                }
              })
            }
          });
        }
        getLessonList();
        getReadStaus();
      }


    }
  })
}

var navigateToBuyLesson = function (event){
  clickPreview();
  var contentType = event.currentTarget.dataset.contentype;
  var objectId = event.currentTarget.dataset.objectid;
  var subscribed = event.currentTarget.dataset.subscribed;
  var pricingRule = event.currentTarget.dataset.pricingrule;
  if (pricingRule != null && subscribed == 0){
    wx.navigateTo({
      url: '/pages/BuyLesson/BuyLesson?objectId=' + objectId,
    })
  } else  {
      wx.navigateTo({
        url: '/pages/LessonPage/LessonPage?objectId=' + objectId,
      })
  }
  
};

var navigateToLessonList = function (event){
  clickPreview();
  var typeName = event.currentTarget.dataset.typename;
  var columnId = event.currentTarget.dataset.columnid;
  wx.navigateTo({
    url: '/pages/LessonList/LessonList?lessonTypeTitle=' + typeName + '&columnId=' + columnId,
  })
};



var bindfocus = function (event){
  
  wx.navigateTo({
    url: '/pages/LessonSearchVC/LessonSearchVC?textValue='+event.detail.value,
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

var navigateToFaQiWenDa = function () {
  clickPreview();
  wx.navigateTo({
    url: '/pages/FaQiWenDa/FaQiWenDa',
  })
};

var navigateToNotice = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNotice/MyNotice',
  })
};


var onPullDownRefresh = function (){
  wx.checkSession({
    success: function (res) {
      getApplicationInfo();

    },
    fail: function () {
      // 登录
      doLogin();
    }
  })
};

Page({
  data: {

  },
  onLoad: onload,
  onShow: onShow,
  onPullDownRefresh: onPullDownRefresh,
  navigateToBuyLesson: navigateToBuyLesson,
  navigateToLessonList: navigateToLessonList,
  bindfocus: bindfocus,
  navigateToFaQiWenDa: navigateToFaQiWenDa,
  navigateToNotice: navigateToNotice,
})