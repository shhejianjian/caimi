var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaRespond/WenDaRespond";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var topicID = '';
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  topicID = options.topicId;

  wx.getSetting({
    success(res) {
      console.log(res);
      if (!res.authSetting['scope.record']) {
        wx.authorize({
          scope: 'scope.record',
          success() {
            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
          }
        })
      }
    }
  })

};


var inputStr = '';
var bindinputChange = function (event){
  inputStr = (event.detail.value).trim();
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
  simpleLib.loadingToast();
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/answer',
    data:{
      content:inputStr,
      imageList: chooseImageListArr
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



var chooseImage = function () {
  wx.chooseImage({
    count: 9, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      console.log(res);
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      simpleLib.setData(route, {
        imageList: res.tempFilePaths,
      });
      uploadImg(res.tempFiles);
    }
  })
};
//查看已压缩的图片
var previewImage = function (e) {
  var current = e.target.dataset.src
  wx.previewImage({
    current: current,
    urls: this.data.imageList
  })
};

var chooseImageListArr = [];
var uploadImg = function (imgSrc) {
  chooseImageListArr = [];
  for (var i = 0; i < imgSrc.length; i++) {
    wx.uploadFile({
      url: simpleLib.imageUploadUrl,
      filePath: imgSrc[i].path,
      name: 'file',
      formData: {
        name: 'file',
        filename: i + '.jpg',
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          var dataInfo = JSON.parse(res.data);

          chooseImageListArr.push({
            fileInfo:dataInfo
          });
          console.log(chooseImageListArr);
        }
      },
      fail: function (res) {

      },
    })
  }
};


var timeNumber = 0;
var timer = '';
var recordFile = '';
var startRecord = function (){
  timer = setInterval(function () {
    timeNumber += 100;
  }, 100);
  wx.showLoading({
    title: '正在说话',
  })
  wx.startRecord({
    success: function (res) {
      console.log(res);
      if (res.errMsg == "startRecord:ok") {
        recordFile = res.tempFilePath;
      }
    },
    fail: function (res) {
      //录音失败
    }
  })
};
var endRecord = function (){
  clearInterval(timer);
  wx.stopRecord({
    success: function (res) {
      wx.hideLoading();

      setTimeout(function () {
        if (timeNumber <= 1000) {
          simpleLib.tishiToast('时间过短请重试');
          timeNumber = 0;
        } else {
          console.log(recordFile);

          wx.uploadFile({
            url: simpleLib.audioUploadUrl,
            filePath: recordFile,
            name: 'attachment',
            formData: {
              name: 'attachment',
              filename: recordFile,
            },
            header: {
              'content-type': 'multipart/form-data'
            },
            success: function (res) {
              console.log(res);

              if (res.statusCode == 200) {
                var dataInfo = JSON.parse(res.data);
                console.log(dataInfo);
                var voiceListArr = [];
                voiceListArr.push(dataInfo.link);
                var voiceArr = [];
                voiceArr.push({
                  fileInfo: dataInfo
                });
                wx.request({
                  url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/answer',
                  data: {
                    content: '',
                    voiceList: voiceArr
                  },
                  header: {
                    'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
                  },
                  method: 'POST',
                  success: function (res) {
                    console.log(res.data)
                   
                    if (res.statusCode == 200) {
                      simpleLib.toast("发布成功");
                      simpleLib.getGlobalData().isPressSuccess = '1';
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 1
                        })
                      }, 2000);
                    }

                  },
                  fail: function (res) {

                  }
                })
              }
            },
            fail: function (res) {

            },
          })
        }

      }, 300);

    },
  });
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
var onUnload = function () {
  clearInterval(setProgressTimer);
}
Page({
  data: {

    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  bindinputChange: bindinputChange,
  cancel: cancel,
  chooseImage: chooseImage,
  press: press,
  previewImage: previewImage,
  startRecord: startRecord,
  endRecord: endRecord,
  onPullDownRefresh: onPullDownRefresh,
})