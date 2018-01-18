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
      url: simpleLib.baseUrl + '/system/file/upload',
      filePath: imgSrc[i].path,
      name: 'attachment',
      formData: {
        name: 'attachment',
        filename: i + '.jpg',
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          var dataInfo = JSON.parse(res.data);

          chooseImageListArr.push(dataInfo);
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

  },
  onLoad: onload,
  bindinputChange: bindinputChange,
  cancel: cancel,
  chooseImage: chooseImage,
  press: press,
  previewImage: previewImage,
})