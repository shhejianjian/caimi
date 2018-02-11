var simpleLib = require('../libs/simple-lib.js');
var route = "pages/FaQiWenDa/FaQiWenDa";

var onPullDownRefresh = function () {
  setTimeout(function () {
    wx.stopPullDownRefresh();
  }, 600)
};

var onload = function (options) {
  wx.getSystemInfo({
    success: function (res) {
      simpleLib.setData(route, {
        movableHeigth: res.windowHeight
      });
    }
  });
  simpleLib.setData(route, {
    baseUrl: simpleLib.baseUrl
  });
  getrelatedTagList();
};

var questionTitle = '';
var questionContent = '';
var questionTag = '';
var questionPrice = '';

var firstInputChange = function (event){
  questionTitle = (event.detail.value).trim();
  simpleLib.setData(route, {
    questionTitleText: questionTitle,
  });
  getrelatedQuestionList(questionTitle);
};
var secondInputChange = function (event) {
  questionContent = (event.detail.value).trim();
  simpleLib.setData(route, {
    questionContentText: questionContent,
  });
};
var thirdInputChange = function (event) {
  
  questionTag = (event.detail.value).trim();
  simpleLib.setData(route, {
    creatTagText: questionTag,
  });
  if (questionTag.length == 0){
    getrelatedTagList();
  } else {
    searchrelatedTagList(questionTag);
  }
};
var forthInputChange = function (event) {
  questionPrice = (event.detail.value).trim();
  simpleLib.setData(route, {
    questionPriceText: questionPrice,
  });
};

var getrelatedQuestionList = function (keyword){
  wx.request({
    url: simpleLib.baseUrl + '/public/topic/search?keyword='+keyword,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      simpleLib.setData(route, {
        relatedQuesList: res.data.content,
      });
    },
    fail: function (res) {

    }
  })
};


var tagArr = [];
var getrelatedTagList = function () {
  tagArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/tag/basic',
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      
      tagArr = res.data;
      
      simpleLib.setData(route, {
        tagList: tagArr,
      });
    },
    fail: function (res) {

    }
  })
};


var searchrelatedTagList = function (keyword) {
  tagArr = [];
  wx.request({
    url: simpleLib.baseUrl + '/public/tag/search?keyword='+keyword,
    data: {
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data)
      var data = res.data.content;
      for(var i = 0;i<data.length;i++){
        if(data[i].parent){
          data[i].name = data[i].parent.name+'/'+data[i].name;
        }
        tagArr.push(data[i]);
      }
      
      simpleLib.setData(route, {
        tagList: tagArr
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

var navigateToWenDaPage = function (event){
  clickPreview();
  var topicId = event.currentTarget.dataset.topicid;
  wx.navigateTo({
    url: '/pages/WenDaPage/WenDaPage?topicId=' + topicId,
  })
};


var addTagArr = [];
var addTagClick = function (event){
  console.log(addTagArr);
  if (addTagArr.length == 4) {
    simpleLib.tishiToast('最多添加4个标签');
    return;
  }
  clickPreview();
  var tagData = {
    name: '',
    tagId: '',
    isBase: true,
  };
  var tagName = event.currentTarget.dataset.tagname;
  var tagId = event.currentTarget.dataset.tagid;
  tagData.name = tagName;
  tagData.tagId = tagId;
  for (var i = 0; i < addTagArr.length;i++){
    if(tagId == addTagArr[i].tagId){
      return;
    }
  }
  addTagArr.push(tagData);
  if (addTagArr.length>0){
    simpleLib.setData(route, {
      addtagList: addTagArr, 
      isEnable: false
    });
  }
  
};


var deleteTag = function (event){
  var name = event.currentTarget.dataset.name;
  var index = event.currentTarget.dataset.index;
  wx.showModal({
    title: '温馨提示',
    content: '确认删除”'+name+'"标签？',
    success: function (res) {
      if(res.confirm){
        addTagArr.splice(index, 1);
        simpleLib.setData(route, {
          addtagList: addTagArr,
        });
        if (addTagArr.length == 0) {
          simpleLib.setData(route, {
            isEnable: true,
          });
        }
      }
    }
  })
};



var creatAndAddClick = function (event){
  
  if(addTagArr.length == 4){
    simpleLib.tishiToast('最多添加4个标签');
    return;
  }
  clickPreview();
  console.log(questionTag);
  wx.request({
    url: simpleLib.baseUrl + '/api/v1/caimi/tag',
    data: {
      scope: 2,
      basic:0,
      name: questionTag,
    },
    header: {
      'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        simpleLib.toast("创建成功");
        var tagData = {
          name: '',
          tagId: '',
          isBase: false,
        };
        tagData.name = res.data.name;
        tagData.tagId = res.data.objectId;
        for (var i = 0; i < addTagArr.length; i++) {
          if (res.data.objectId == addTagArr[i].tagId) {
            return;
          }
        }
        addTagArr.push(tagData);
        simpleLib.setData(route, {
          addtagList: addTagArr,
        });
        console.log(addTagArr);
      } else {
        simpleLib.failToast(res.data.error);
      }
    },
    fail: function (res) {
      simpleLib.failToast("创建失败")
    }
  })
};

var nextStep = function(){
  clickPreview();
  if(this.data.step == 1){
    if(questionTitle.length > 0){
      simpleLib.setData(route, {
        step: 2,
        cancelText: '上一步'
      });
    } else {
      simpleLib.tishiToast("请输入问题标题");
    }
    
  } else if(this.data.step == 2){
    
      simpleLib.setData(route, {
        step: 3,
        nextStepText: '发布'
      });
    
  } else if (this.data.step == 3) {
    if (addTagArr.length > 0) {
      // simpleLib.setData(route, {
      //   step: 4,
        
      // });
      var tagsIdList = [];
      for (var i = 0; i < addTagArr.length; i++) {
        tagsIdList.push(addTagArr[i].tagId);
      }
      var price = 0;
      if (questionPrice.length == 0) {
        price = 0;
      } else {
        price = questionPrice;
      }
      simpleLib.loadingToast();
      wx.request({
        url: simpleLib.baseUrl + '/api/v1/caimi/topic',
        data: {
          title: questionTitle,
          content: questionContent,
          reward: price,
          tags: tagsIdList,
          imageList: chooseImageListArr
        },
        header: {
          'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
        },
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          console.log(res.data)
          if (res.statusCode == 200) {
            simpleLib.toast("发布成功");
            simpleLib.getGlobalData().isPress = '1';
            setTimeout(function () {
              wx.redirectTo({
                url: '/pages/WenDaPage/WenDaPage?topicId=' + res.data.topicId,
              })
            }, 2000);
          } else {

            simpleLib.failToast(res.data.error)
          }
        },
        fail: function (res) {
          wx.hideLoading();
          simpleLib.failToast("发布失败")
        }
      })
    } else {
      simpleLib.tishiToast("请至少添加一个标签");
    }
    
  // } else if (this.data.step == 4) {
    

    // } else {
    //   simpleLib.tishiToast("请输入问题悬赏金额");
    // }



    // wx.navigateTo({
    //   url: '/pages/WenDaSingleDetail/WenDaSingleDetail',
    // })
  }

};

var cancelOrPastStep = function (){
  if(this.data.step == 1){
    wx.navigateBack({
      delta: 1
    })
  } else if(this.data.step == 2){
    simpleLib.setData(route, {
      step:1,
      cancelText: '取消'
    });
  } else if(this.data.step == 3){
    simpleLib.setData(route, {
      step: 2,
      nextStepText: '下一步'
    });

  }
  // } else if (this.data.step == 4) {
  //   simpleLib.setData(route, {
  //     step: 3,
      
  //   });
  // }
};

var showToastModel = function (){
  simpleLib.setData(route, {
    showZRSM:true
  });
};

var hideZRSM = function (){
  simpleLib.setData(route, {
    showZRSM: false
  });
}

var onUnload = function (){
  addTagArr = [];
  clearInterval(setProgressTimer);
};



var chooseImage = function () {
  wx.chooseImage({
    count: 9, // 默认9
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
        if(res.statusCode == 200){
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

const backgroundAudioManager = wx.getBackgroundAudioManager();
var setProgressTimer = '';
var onShow = function () {
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
    step:1,
    cancelText:'取消',
    nextStepText:'下一步',
    creatTagText:'',
    questionTitleText:'',
    questionContentText:'',
    questionPriceText:'',
    isEnable:true,
    showZRSM:false,
    imageList:[],
    chooseImageListArr :[],

    isShowSimpleAudio: false,
    'audioInfo.title': '',
    'audioInfo.currentTime': '00:00'
  },
  onLoad: onload,
  onUnload: onUnload,

  playAudio: playAudio,
  onShow: onShow,
  onHide:onHide,

  nextStep: nextStep,
  addTagClick: addTagClick,
  cancelOrPastStep: cancelOrPastStep,
  firstInputChange: firstInputChange,
  secondInputChange: secondInputChange,
  thirdInputChange: thirdInputChange,
  forthInputChange: forthInputChange,
  creatAndAddClick: creatAndAddClick,
  navigateToWenDaPage: navigateToWenDaPage,
  showToastModel: showToastModel,
  hideZRSM: hideZRSM,
  deleteTag: deleteTag,
  chooseImage: chooseImage,
  previewImage: previewImage,
  onPullDownRefresh: onPullDownRefresh,
})