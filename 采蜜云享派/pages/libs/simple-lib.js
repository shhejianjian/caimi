var moment = require('../libs/moment.js');;


var getCurrentPage = function (route) {
    var pages = getCurrentPages();
    var currentPage = "";
    pages.forEach(function (page) {
        if (page.__route__ === route) {
            currentPage = page;
        }
    });
    return currentPage;
};
var getData = function (route) {
    return getCurrentPage(route).data;
};

var setData = function (route, data) {
    var currentPage = getCurrentPage(route);
    currentPage.setData(data);
};

var toast = function (msg) {
    wx.showToast({
        title: msg
    });
};

var failToast = function (msg) {
    wx.showToast({
        title: msg,
        image:'../../image/cha.png',
        mask:true
    });
};
var tishiToast = function (msg) {
  wx.showToast({
    title: msg,
    image: '../../image/tishiicon.png',
    mask: true
  });
};




var getGlobalData = function () {
    var app = getApp();
    return app.globalData;
};


var navigateTo = function (url) {
    wx.navigateTo({
        url: url
    });
};

var token = "99290192-67d2-4bac-8fc2-3949429da864";
//var baseUrl = "https://kjgk.natapp4.cc/caimi";
//var baseUrl = "http://140.143.130.252";
var baseUrl = "http://pub.caimi.group";

var getScreenWidth = function () {
    wx.getSystemInfo({
        success: function (res) {
            return res.windowWidth;
        }
    });
};

var getScreenHeight = function () {
    wx.getSystemInfo({
        success: function (res) {
            return res.windowHeight;
        }
    });
};

var getScreenScale = function () {
    wx.getSystemInfo({
        success: function (res) {
            return res.windowWidth/750;
        }
    });
}



var getTime = function (dateTimeStamp) {
  var result;
  if(!dateTimeStamp){
    result = "刚刚";
  }
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    return;
  }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var format = 'MM-DD HH:mm';
  
  if (monthC >= 1) {
    // result = "" + parseInt(monthC) + "月前";
    //result = moment(dateTimeStamp).format(format);
  }
  else if (weekC >= 1) {
    // result = "" + parseInt(weekC) + "周前";
    //result = moment(dateTimeStamp).format(format);
  }
  else if (dayC >= 1) {
     //result = "" + parseInt(dayC) + "天前";
     result = moment(dateTimeStamp).format(format);

  }
  else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  }
  else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else {
    result = "刚刚";
  }
  return result;


};


var lastTime = function (dateTimeStamp) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue =  dateTimeStamp -now;
  if (diffValue < 0) {
    return;
  }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var format = 'MM-DD HH:mm';
  var result;
  if (monthC >= 1) {
     result = "" + parseInt(monthC) + "月";
    //result = moment(dateTimeStamp).format(format);
  }
  else if (weekC >= 1) {
     result = "" + parseInt(weekC) + "周";
    //result = moment(dateTimeStamp).format(format);
  }
  else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天";
    // result = moment(dateTimeStamp).format(format);

  }
  else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时";
  }
  else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟";
  } else {
    result = "1分钟";
  }
  return result;


};



var getRequest = function (session,params,url){
  wx.request({
    url: baseUrl + url,
    data: params,
    header: {
      'Cookie': 'SESSION=' + session
    },
    success: function (res) {
      return res;
    },
    fail: function (res) {
      return res;
    },
    complete:function(res){
      return res;
    }
  })
};



//
module.exports.setData = setData;
module.exports.getData = getData;
module.exports.getCurrentPage = getCurrentPage;
module.exports.toast = toast;
module.exports.failToast = failToast;
module.exports.tishiToast = tishiToast;
module.exports.getGlobalData = getGlobalData;
module.exports.navigateTo = navigateTo;
module.exports.token = token;
module.exports.getScreenWidth = getScreenWidth;
module.exports.getScreenHeight = getScreenHeight;
module.exports.baseUrl = baseUrl;
module.exports.getScreenScale = getScreenScale;
module.exports.getTime = getTime;
module.exports.lastTime = lastTime;
module.exports.getRequest = getRequest;
