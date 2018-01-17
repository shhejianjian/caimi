var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyChangePhone/MyChangePhone";


var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });


};

var phoneNumberStr = '';
var phoneInputChange = function (event){
  phoneNumberStr = event.detail.value;
};
var verifyNumberStr = '';
var verifyInputChange = function (event){
  verifyNumberStr = event.detail.value;
};


var verifyNumber = 60;
var id = '';
var getVerify = function (){
  var that = this;
  if (that.data.isVerify == true){
    return;
  } else {
    if (!/^1[34578]\d{9}$/.test(phoneNumberStr)) {
      simpleLib.failToast("请输入正确的手机号");
      return;
    }

    id = setInterval(function () {
      verifyNumber--;
      if (verifyNumber == 0) {
        clearInterval(id);
        verifyNumber = 60;
        simpleLib.setData(route, {
          isVerify: false,
          verifyText: '获取验证码',
        });
      } else {
        simpleLib.setData(route, {
          isVerify: true,
          verifyText: verifyNumber + 's'
        });
      }
    }, 1000);

    
    wx.request({
      url: simpleLib.baseUrl + '/public/sms/verifyCode',
      data: {
        tunnel:'bind',
        phoneNo:phoneNumberStr
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          simpleLib.toast("获取验证码成功");
        } else {
          simpleLib.failToast(res.data.error);
        }
      },
      fail: function (res) {
        simpleLib.failToast("获取验证码失败");
      },
      complete: function () {

      }
    });
  }
};

var press = function (){
  if(phoneNumberStr.length == 0){
    simpleLib.tishiToast("手机号不能为空");
    return;
  }
  if(verifyNumberStr.length == 0){
    simpleLib.tishiToast("验证码不能为空");
    return;
  }
  wx.showLoading({
    title: '正在提交',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/phoneNo',
    data: {
      code: verifyNumberStr,
      phoneNo: phoneNumberStr
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method:'PUT',
    success: function (res) {
      wx.hideLoading();
      console.log(res);
      if (res.statusCode == 200) {
        simpleLib.toast("提交成功");
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 2000);

      } else {
        simpleLib.failToast("提交失败");
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("提交失败");
    }
  });

};

var onUnload = function (){
  clearInterval(id);
};

Page({
  data: {
    verifyText:'获取验证码',
    isVerify:false,
  },
  onLoad: onload,
  onUnload: onUnload,
  getVerify: getVerify,
  phoneInputChange: phoneInputChange,
  verifyInputChange: verifyInputChange,
  press: press,
})