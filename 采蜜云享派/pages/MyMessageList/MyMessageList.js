var simpleLib = require('../libs/simple-lib.js');
var route = "pages/MyMessageList/MyMessageList";



var userID = '';
var id = '';
var onload = function (options) {
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
          if (data[i].imageList.length > 0){
            data[i].imageList[0] = simpleLib.baseUrl + data[i].imageList[0];
          } else {
            data[i].imageList = [];
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
  currentPageSize = 15;
  messageArr = [];
  getMessageList();
  
};
var getMoreData = function (){
  currentPage++;
  currentPageSize = 8;
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
      for (var i = 0; i < data.length; i++) {
        var date = simpleLib.getTime(data[i].timestamp);
        data[i].date = date;
        if (data[i].imageList.length>0) {
          data[i].imageList[0] = simpleLib.baseUrl + data[i].imageList[0];
        } else {
          data[i].imageList = [];
        }
        messageArr.unshift(data[i]);
      }
      lasttime = messageArr[messageArr.length-1].timestamp;
      simpleLib.setData(route, {
        messageList: messageArr
      });
      if(currentPage==1){
        setBottom();
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
      url: simpleLib.baseUrl + '/system/file/upload',
      filePath: imgSrc[0].path,
      name: 'attachment',
      formData: {
        name: 'attachment',
        filename: imgSrc[0] + '.jpg',
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          var dataInfo = JSON.parse(res.data);
          chooseImageListArr.push(dataInfo);
          wx.request({
            url: simpleLib.baseUrl + '/api/v1/caimi/message',
            data: {
              content: '',
              toUser: {
                objectId: userID
              },
              imageList: chooseImageListArr
            },
            header: {
              'Cookie': 'SESSION=' + simpleLib.getGlobalData().SESSION
            },
            method: 'POST',
            success: function (res) {
              console.log(res.data)
              if (res.statusCode == 200) {
                simpleLib.getGlobalData().isSend = '1';
                var data = {
                  avatar: simpleLib.getGlobalData().user.avatar,
                  imageList: imgSrc[0].path,
                  timestamp: res.data.sendTime,
                  mine: 1,
                  successive: res.data.successive
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


Page({
  data: {
    textValue:'',
    toView:'bottom'
  },
  onLoad: onload,
  onUnload: onUnload,
  bindConfirm: bindConfirm,
  toupper: toupper,
  chooseImage: chooseImage,
  previewImage: previewImage,
})