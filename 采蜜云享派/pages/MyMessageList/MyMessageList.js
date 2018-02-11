var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMessageList/MyMessageList";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var userID = '';
var id = '';
var onload = function (options) {
  simpleLib.getGlobalData().isSend = '1';
  wx.getSystemInfo({
    success: function (res) {
      console.log(res.windowHeight);
      simpleLib.setData(route, {
        scrollViewYheight: (750 / res.screenWidth) * res.windowHeight -132
      });
    }
  });
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
  });
  wx.setNavigationBarTitle({
    title: '与 '+ options.nickName + ' 的对话'
  })
  userID = options.userId;
  getNewData();
  id = setInterval(function () {
    getNewLetter();
  }, 1000 * 5);
};

var setBottom = function (){
  setTimeout(function () {
    simpleLib.setData(route, {
      toView: 'bottom',
    });
  }, 300)
};

var onUnload = function (){
  clearInterval(id);
  messageArr = [];
  // wx.stopBackgroundAudio();
  clearInterval(setProgressTimer);
};

var lasttime = 0;
var getNewLetter = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message/' + userID + '?lastMessageTime=' + lasttime,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data;
      if(data.length>0){
        lasttime = data[0].timestamp;
        for (var i = 0; i < data.length; i++) {
          if (data[i].image){
            data[i].image= simpleLib.baseUrl + data[i].image;
          } else {
            data[i].image = '';
          }
          messageArr.push(data[i]);

        }
        simpleLib.setData(route, {
          messageList: messageArr,
        });
        setBottom();
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


var currentPage = 1;
var currentPageSize = 15;
var getNewData = function (){
  currentPage = 1;
  messageArr = [];
  getMessageList();
};
var getMoreData = function (){
  currentPage++;
  getMessageList();
};

var messageArr = [];
var getMessageList = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message/'+userID+'/history',
    data: {
      pageNo:currentPage,
      pageSize: currentPageSize,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      if(data.length>0){
        for (var i = 0; i < data.length; i++) {
          var date = simpleLib.getTime(data[i].timestamp);
          data[i].date = date;
          if (data[i].image) {
            data[i].image = simpleLib.baseUrl + data[i].image;
          } else {
            data[i].image = '';
          }
          if(data[i].voiceDuration > 20000){
            data[i].voiceDuration = 20000;
          }
          messageArr.unshift(data[i]);
        }
        lasttime = messageArr[messageArr.length - 1].timestamp;
        simpleLib.setData(route, {
          messageList: messageArr
        });
        if (currentPage == 1) {
          setBottom();
        }
      }
    },
    fail: function (res) {
      simpleLib.failToast("查询失败");
    }
  })
};

var toupper = function (){
  getMoreData();
};


var bindConfirm = function (event){
  console.log(event.detail.value);
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/message',
    data: {
      content:event.detail.value,
      toUser:{
        objectId:userID
      }
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data)
      if(res.statusCode == 200){
        simpleLib.getGlobalData().isSend = '1';
        var data = {
          avatar: simpleLib.getGlobalData().user.avatar,
          content: res.data.content,
          timestamp: res.data.sendTime,
          mine:1,
          successive:res.data.successive
        }
        messageArr.push(data);
        console.log(messageArr);
        simpleLib.setData(route, {
          textValue: '',
          messageList: messageArr,
        });
        setBottom();
      }
      
    },
    fail: function (res) {

    }
  })
};

var chooseImage = function () {
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
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
  var current = e.target.dataset.src;
  var imageList = e.currentTarget.dataset.imagelist;
  wx.previewImage({
    current: current,
    urls: imageList,
  })
};


var chooseImageListArr = [];
var uploadImg = function (imgSrc) {
  console.log(imgSrc);
  chooseImageListArr = [];
    wx.uploadFile({
      url: simpleLib.imageUploadUrl,
      filePath: imgSrc[0].path,
      name: 'file',
      formData: {
        name: 'file',
        filename: imgSrc[0] + '.jpg',
      },
      success: function (res) {
        
        if (res.statusCode == 200) {
          var dataInfo = JSON.parse(res.data);
          console.log(dataInfo);
          var showImage = [];
          showImage.push(imgSrc[0].path);
          chooseImageListArr.push({
            fileInfo: dataInfo
          });
          wx.request({
            url: simpleLib.baseUrl + '/api/v1/caimi/message',
            data: {
              content: '',
              toUser: {
                objectId: userID
              },
              imageAttachment : chooseImageListArr[0]
            },
            header: {
              'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
            },
            method: 'POST',
            success: function (res) {
              console.log(res.data);
              
              if (res.statusCode == 200) {
                simpleLib.getGlobalData().isSend = '1';
                var data = {
                  avatar: simpleLib.getGlobalData().user.avatar,
                  image: showImage,
                  timestamp: res.data.sendTime,
                  mine: 1,
                  successive: res.data.successive,
                }
                messageArr.push(data);
                console.log(messageArr);
                simpleLib.setData(route, {
                  textValue: '',
                  messageList: messageArr,
                });
                setBottom();
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
};


var showYuyinView = function (){
  backgroundAudioManager.pause();
  backgroundAudioManager.onPause((res) => {
    simpleLib.getGlobalData().isPlayingAudio = '2';
    console.log('暂停了');
    clearInterval(setProgressTimer);
    simpleLib.setData(route, {
      'audioInfo.playImage': '../../image/bofangicon.png',
    });
  });
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

  if (this.data.isHideYuyinView){
    simpleLib.setData(route, {
      isHideYuyinView: false,
    });
  } else {
    simpleLib.setData(route, {
      isHideYuyinView: true,
    });
  }
  
};


var timeNumber = 0;
var timer = '';
var recordFile = '';
var startRecord = function (event){
  timer = setInterval(function () {
    timeNumber += 100;
  }, 100);
  wx.showLoading({
    title: '正在说话',
  })
  wx.startRecord({
    success: function (res) {
      console.log(res);
      if (res.errMsg == "startRecord:ok"){
        recordFile = res.tempFilePath;
      }  
    },
    fail: function (res) {
      //录音失败
    }
  })
};

var endRecord = function (event){
  clearInterval(timer);
  wx.stopRecord({
    success: function (res) {
      wx.hideLoading();
      
      setTimeout(function () {
        if (timeNumber <= 1000){
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
                  url: simpleLib.baseUrl + '/api/v1/caimi/message',
                  data: {
                    content: '',
                    toUser: {
                      objectId: userID
                    },
                    voiceAttachment: voiceArr[0]
                  },
                  header: {
                    'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
                  },
                  method: 'POST',
                  success: function (res) {
                    console.log(res.data)
                    if (res.data.duration > 20) {
                      res.data.duration = 20;
                    }
                    if (res.statusCode == 200) {
                      simpleLib.getGlobalData().isSend = '1';
                      timeNumber = 0;
                      var data = {
                        avatar: simpleLib.getGlobalData().user.avatar,
                        voice: voiceListArr[0],
                        timestamp: res.data.sendTime,
                        mine: 1,
                        successive: res.data.successive,
                        voiceDuration: res.data.duration * 1000,
                      }
                      messageArr.push(data);
                      console.log(messageArr);
                      simpleLib.setData(route, {
                        textValue: '',
                        messageList: messageArr,
                      });
                      setBottom();
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

      },300);
      
    },
  });
};

var playVoice = function (event){
  backgroundAudioManager.pause();
  backgroundAudioManager.onPause((res) => {
    simpleLib.getGlobalData().isPlayingAudio = '2';
    console.log('暂停了');
    clearInterval(setProgressTimer);
    simpleLib.setData(route, {
      'audioInfo.playImage': '../../image/bofangicon.png',
    });
  });
  var voiceUrl = event.currentTarget.dataset.voiceurl;
  var isMine = event.currentTarget.dataset.ismine;
  var messageId = event.currentTarget.dataset.messageid;
  if(isMine == 0){
    wx.request({
      url: simpleLib.baseUrl +'/caimi/message/'+messageId+'/read',
      data:{
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method:'POST',
      success: function (res) {
        if(res.statusCode == 200){
          console.log(messageArr);
          for (var i = 0;i<messageArr.length;i++){
            if(messageId == messageArr[i].messageId){
              messageArr[i].status = 2;
            }
          }
          simpleLib.setData(route, {
            messageList: messageArr,
          });
        }
        
      },
      fail: function (res) {

      },
    })
  }
  var audioUrl = '';
  if (voiceUrl.indexOf("https") > -1) {
    audioUrl = voiceUrl;
  } else {
    audioUrl = simpleLib.baseUrl + voiceUrl;
  }
  wx.playBackgroundAudio({
    dataUrl: audioUrl,
    success: function (res) {
      console.log(res);
    },
    complete: function (res) {

    }
  })

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
    textValue:'',
    toView:'bottom',
    isHideYuyinView:true,
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onUnload: onUnload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  bindConfirm: bindConfirm,
  toupper: toupper,
  chooseImage: chooseImage,
  previewImage: previewImage,
  startRecord: startRecord,
  endRecord: endRecord,
  playVoice: playVoice,
  showYuyinView: showYuyinView,
  onPullDownRefresh: onPullDownRefresh,
})