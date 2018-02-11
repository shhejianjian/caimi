var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMainSingleInfo/MyMainSingleInfo";
var moment = require('../libs/moment.js');;

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var onload = function () {
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl,
  });
  
  
};

var getUerInfo = function (){
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/profile',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      if (res.data.gender == 1) {
        res.data.genderText = '男';
      } else if (res.data.gender == 2) {
        res.data.genderText = '女';
      } else {
        res.data.genderText = '';
      }
      if(res.data.birthday){
        var format = 'YYYY-MM-DD';
        res.data.birthday = moment(res.data.birthday).format(format);
      }
      if (res.data.province){
        res.data.cityList = [res.data.province,res.data.city,res.data.area];
        res.data.cityText = res.data.province+'-'+res.data.city+'-'+res.data.area;
      } else {
        res.data.cityList = ['上海市', '上海市', '浦东新区'];
        res.data.cityText = '';
      }
      simpleLib.setData(route, {
        user: res.data,
      });
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

var navigateToChangName = function (event){
  clickPreview();
    wx.navigateTo({
    url: '/pages/MyMainChangeName/MyMainChangeName?userNickname='+event.currentTarget.dataset.username,
  })
};
var navigateToChangIntro = function (event){
  clickPreview();
  wx.navigateTo({
    url: '/pages/MyMainChangeIntro/MyMainChangeIntro?userIntro='+event.currentTarget.dataset.userintro,
  })
};

var changePhoto = function (){
  clickPreview();
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      imageList: res.tempFilePaths,
        uploadImg(res.tempFilePaths[0]);
    }
  })
};


var uploadImg = function (imgSrc) {
  wx.uploadFile({
    url: simpleLib.imageUploadUrl,
    filePath: imgSrc,
    name: 'file',
    formData: {
      name: 'file',
      filename: imgSrc + '.jpg',
    },
    success: function (res) {
      var data = JSON.parse(res.data);
      console.log(data);
      wx.request({
        url: simpleLib.baseUrl + '/api/v1/caimi/user/avatar',
        data: {
          avatar: data.fileName,
        },
        header: {
          'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
        },
        method: 'PUT',
        success: function (res) {
          console.log(res)
          if (res.statusCode == 200) {
            simpleLib.getGlobalData().isChangePhoto = '1';
            simpleLib.toast('上传成功');
            getUerInfo();
          }
        },
        fail: function (rea) {

        },
      })
    },
    fail: function (res) {

      simpleLib.failToast('上传失败');
    },
  })
};

var bindPickerChange = function (event){
  console.log(event.detail.value);
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/profile',
    data: {
      gender: event.detail.value,
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
        getUerInfo();
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("修改失败")
    }
  })
};

var bindRegionChange = function (event){
  console.log(event.detail.value);
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/profile',
    data: {
      province: event.detail.value[0],
      city: event.detail.value[1],
      area: event.detail.value[2],
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
        getUerInfo();
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("修改失败")
    }
  })

};

var bindDateChange = function (event){
  console.log(event.detail.value);
  wx.showLoading({
    title: '正在加载',
  });
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/user/profile',
    data: {
      birthday: event.detail.value,
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
        getUerInfo();
      }
    },
    fail: function (res) {
      wx.hideLoading();
      simpleLib.failToast("修改失败")
    }
  })

};


const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
  getUerInfo();
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
    genderText:'',
    genderArr: ['未知','男', '女'],
    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  playAudio: playAudio,
  onHide: onHide,
  onShow: onShow,
  onUnload:onUnload,
  navigateToChangName: navigateToChangName,
  navigateToChangIntro: navigateToChangIntro,
  changePhoto: changePhoto,
  bindPickerChange: bindPickerChange,
  onPullDownRefresh: onPullDownRefresh,
  bindRegionChange: bindRegionChange,
  bindDateChange: bindDateChange,
})
