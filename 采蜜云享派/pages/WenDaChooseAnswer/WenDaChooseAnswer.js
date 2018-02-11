var simpleLib = require('../libs/simple-lib.js');
var route = "pages/WenDaChooseAnswer/WenDaChooseAnswer";
var arrayKey = require('../libs/arrayKey.js');

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var answerArr = [];
var getAnswerList = function () {
  answerArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/' + topicID + '/answer',
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      console.log(res.data)
      var answerData = res.data.content;
      for (var i = 0; i < answerData.length; i++) {
        var date = simpleLib.getTime(answerData[i].submitTime);
        answerData[i].date = date;
        answerData[i].isChoose = '0';
        answerArr.push(answerData[i]);
      }
      simpleLib.setData(route, {
        answerInfo: answerArr
      });
    },
    fail: function (res) {
      simpleLib.failToast("查询失败")
    }
  })
};


var questionData = '';
var getQuestionDetailInfo = function () {
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/' + topicID,
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res.data)

      questionData = res.data;
      
      var date = simpleLib.lastTime(questionData.expiredTime);
      questionData.date = date;

      simpleLib.setData(route, {
        questionInfo: questionData
      });
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("查询失败")
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

var checkNum = 0;
var changePoint = function (event){
  clickPreview();
  var answerId = event.currentTarget.dataset.answerid;
  var index = event.currentTarget.dataset.index;
  if(answerArr[index].isChoose == '0'){
    answerArr[index].isChoose = '1';
    checkNum++;
  } else if (answerArr[index].isChoose == '1'){
    checkNum--;
    answerArr[index].isChoose = '0';
  }

  console.log(checkNum);
  
  if (checkNum > 0) {
    simpleLib.setData(route, {
      isThreeAnswer: true,
    });
  } else {
    simpleLib.setData(route, {
      isThreeAnswer: false,
    });
  }
  
  if (checkNum > 3) {
    console.log('不能再选了');
    answerArr[index].isChoose = '0';
    checkNum--;
  }

  simpleLib.setData(route, {
    answerInfo: answerArr
  });
};

var sureAnswerArr = [];
var commit = function (){
  clickPreview();
  for(var i = 0;i<answerArr.length;i++){
    if(answerArr[i].isChoose == '1'){
      sureAnswerArr.push(answerArr[i].answerId);
    }
  }
  console.log(sureAnswerArr);
  if(sureAnswerArr.length == 0){
    simpleLib.toast("请至少选出一个优质答案");
  } else {
    wx.request({
      url: simpleLib.baseUrl + '/api/v1/caimi/topic/' + topicID + '/choice',
      data: {
        answerList: sureAnswerArr,
      },
      header: {
        'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
      },
      method: 'POST',
      success: function (res) {
        sureAnswerArr = [];
        console.log(res.data);
        if (res.statusCode == 200) {
          simpleLib.toast("提交成功");
          simpleLib.getGlobalData().isChoose = '1';
          setTimeout(function () {
            wx.navigateBack({
              url: '/pages/WenDaPage/WenDaPage?topicId=' + topicID,
            })
          }, 2000);
        }
      },
      fail: function (res) {
        sureAnswerArr = [];
        simpleLib.failToast("提交失败")
      }
    })
  }

};

var topicID = '';
var id;
var onload = function (options) {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  topicID = options.topicId;
  getQuestionDetailInfo();
  getAnswerList();
  id = setInterval(function () {
    var date = simpleLib.lastTime(questionData.expiredTime);
    questionData.date = date;
    console.log(date);
    simpleLib.setData(route, {
      questionInfo: questionData
    });
  }, 1000);

};
var onUnload = function () {
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
    isThreeAnswer:false,
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload: onUnload,
  changePoint: changePoint,
  commit:commit,
  onPullDownRefresh: onPullDownRefresh,
})