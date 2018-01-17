var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMainSetting/MyMainSetting";



var onload = function (options) {
  console.log(options.phoneNumber)
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    phoneNumber: options.phoneNumber
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

var navigateToSingleInfo = function (){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMainSingleInfo/MyMainSingleInfo',
  })
};


var navigateToBindPhone = function (){
  clickPreview();
  var that = this;
  if(this.data.phoneNumber != 'null'){
    return;
  }
  
  wx.navigateTo({
    url: '/pages/MyChangePhone/MyChangePhone',
  })
};

Page({
  data: {
    phoneNumber:'',
  },
  onLoad: onload,
  navigateToSingleInfo: navigateToSingleInfo,
  navigateToBindPhone: navigateToBindPhone,
})