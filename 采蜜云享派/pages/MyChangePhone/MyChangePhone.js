var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyChangePhone/MyChangePhone";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

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
  clearInterval(setProgressTimer);
};


const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth: res.windowHeight
      });
    }
  });
  if (simpleLib.getGlobalData().isPlayingAudio == '1') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.playImage': '../../image/stopIcon.png',
    })
    setProgressTimer = setInterval(function () {
      simpleLib.setData(route, {
        'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      })
    }, 1000);
    backgroundAudioManager.onEnded((res) => {
      clearInterval(setProgressTimer);
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      simpleLib.setData(route, {
        'audioInfo.currentTime': '00:00',
      })
    });
  } else if (simpleLib.getGlobalData().isPlayingAudio == '3') {
    simpleLib.setData(route, {
      isShowSimpleAudio: false
    })
  } else if (simpleLib.getGlobalData().isPlayingAudio == '2') {
    simpleLib.setData(route, {
      isShowSimpleAudio: true,
      'audioInfo.title': backgroundAudioManager.title,
      'audioInfo.duration': simpleLib.timeToString(parseInt(backgroundAudioManager.duration)),
      'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
      'audioInfo.playImage': '../../image/bofangicon.png',
    })
  }
};

var onHide = function () {
  clearInterval(setProgressTimer);
}
//公用悬浮音频组件内的播放暂停事件
var playAudio = function (event) {
  var playImage = event.currentTarget.dataset.playimage;
  console.log(playImage);
  if (playImage == '../../image/stopIcon.png') {
    console.log('暂停');
    backgroundAudioManager.pause();
    //播放暂停事件
    backgroundAudioManager.onPause((res) => {
      simpleLib.getGlobalData().isPlayingAudio = '2';
      console.log('暂停了');
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
      });
    });
  } else if (playImage == '../../image/bofangicon.png') {
    console.log('播放');
    backgroundAudioManager.play();
    //正在播放事件
    backgroundAudioManager.onPlay((res) => {
      console.log('播放了');
      simpleLib.getGlobalData().isPlayingAudio = '1';
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/stopIcon.png',
      });
      setProgressTimer = setInterval(function () {
        simpleLib.setData(route, {
          'audioInfo.currentTime': simpleLib.timeToString(parseInt(backgroundAudioManager.currentTime)),
        })
      }, 1000);
    });
    //播放结束事件
    backgroundAudioManager.onEnded((res) => {
      console.log('结束了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
    //播放停止事件
    backgroundAudioManager.onStop((res) => {
      console.log('停止了');
      simpleLib.getGlobalData().isPlayingAudio = '3';
      clearInterval(setProgressTimer);
      simpleLib.setData(route, {
        'audioInfo.playImage': '../../image/bofangicon.png',
        'audioInfo.currentTime': '00:00',
      });
    });
  }
};

Page({
  data: {
    verifyText:'获取验证码',
    isVerify:false,
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onUnload: onUnload,
  onHide: onHide,
  playAudio: playAudio,
  onShow: onShow,
  getVerify: getVerify,
  phoneInputChange: phoneInputChange,
  verifyInputChange: verifyInputChange,
  press: press,
  onPullDownRefresh: onPullDownRefresh,
})