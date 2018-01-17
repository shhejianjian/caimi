var simpleLib = require('../libs/simple-lib.js');
var route = "pages/FaQiWenDa/FaQiWenDa";


var onload = function (options) {
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
  questionTitle = event.detail.value;
  simpleLib.setData(route, {
    questionTitleText: questionTitle,
  });
  getrelatedQuestionList(questionTitle);
};
var secondInputChange = function (event) {
  questionContent = event.detail.value;
  simpleLib.setData(route, {
    questionContentText: questionContent,
  });
};
var thirdInputChange = function (event) {
  
  questionTag = event.detail.value;
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
  questionPrice = event.detail.value;
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
    });
  } else if (this.data.step == 3) {
    if (addTagArr.length > 0) {
      simpleLib.setData(route, {
        step: 4,
        nextStepText:'发布'
      });
    } else {
      simpleLib.tishiToast("请至少添加一个标签");
    }
  } else if (this.data.step == 4) {
    var tagsIdList = [];
    for(var i = 0;i<addTagArr.length;i++){
      tagsIdList.push(addTagArr[i].tagId);
    }
    // if(questionPrice.length > 0){
      wx.request({
        url: simpleLib.baseUrl + '/api/v1/caimi/topic',
        data: {
          title: questionTitle,
          content: questionContent,
          reward: questionPrice,
          tags: tagsIdList,
          imageList:chooseImageListArr
        },
        header: {
          'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
        },
        method: 'POST',
        success: function (res) {
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
          simpleLib.failToast("发布失败")
        }
      })

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
    });
  } else if (this.data.step == 4) {
    simpleLib.setData(route, {
      step: 3,
      nextStepText:'下一步'
    });
  }
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
      url: simpleLib.baseUrl + '/system/file/upload',
      filePath: imgSrc[i].path,
      name: 'attachment',
      formData: {
        name: 'attachment',
        filename: i + '.jpg',
      },
      success: function (res) {
        console.log(res);
        if(res.statusCode == 200){
          var dataInfo = JSON.parse(res.data);
          chooseImageListArr.push(dataInfo.tempFilename);
          console.log(chooseImageListArr);
        }
      },
      fail: function (res) {

      },
    })
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
  },
  onLoad: onload,
  onUnload: onUnload,
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
})