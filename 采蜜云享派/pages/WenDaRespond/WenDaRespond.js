var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaRespond/WenDaRespond";


var topicID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  topicID = options.topicId;

};


var inputStr = '';
var bindinputChange = function (event){
  inputStr = event.detail.value;
};

var cancel = function (){
  wx.navigateBack({
    delta: 1
  })
};

var press = function (){
  if(inputStr.length == 0){
    simpleLib.tishiToast("请填写回答内容");
    return;
  }
  simpleLib.setData(route, {
    prevent: true
  });
  setTimeout(() => {
    simpleLib.setData(route, {
      prevent: false
    });
  }, 1000);
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/answer',
    data:{
      content:inputStr,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method:'POST',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      if(res.statusCode == 200){
        simpleLib.toast("发布成功");
        simpleLib.getGlobalData().isPressSuccess = '1';
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        },2000);
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("发布失败")
    }
  })
};

Page({
  data: {

  },
  onLoad: onload,
  bindinputChange: bindinputChange,
  cancel: cancel,
  press: press,
})