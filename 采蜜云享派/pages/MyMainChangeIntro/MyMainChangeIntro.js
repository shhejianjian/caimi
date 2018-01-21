var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMainChangeIntro/MyMainChangeIntro";

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

var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
    introText:options.userIntro
  });


};

var userIntro = '';
var bindinputChange = function (event) {
  userIntro = event.detail.value;
};

var cancel = function () {
  clickPreview();
  wx.navigateBack({
    delta: 1
  })
};
var press = function () {
  clickPreview();
  simpleLib.loadingToast();
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/profile',
    data: {
      intro: userIntro,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'PUT',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)
      if (res.statusCode == 200) {
        simpleLib.toast("修改成功");
        simpleLib.getGlobalData().isChangeIntro = '1';
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 2000);
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("修改失败")
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