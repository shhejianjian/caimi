var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyPurse/MyPurse";


var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
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

var navigateToPurseDetail = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyNoticeAnswer/MyNoticeAnswer?title=钱包明细',
  })
};



Page({
  data: {

  },
  onLoad: onload,
  navigateToPurseDetail: navigateToPurseDetail,
})