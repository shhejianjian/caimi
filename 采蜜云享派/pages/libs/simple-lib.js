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
var loadingToast = function (msg) {

  wx.showLoading({
    title: '正在加载',
    mask: true,
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
var baseUrl = "https://caimi.we.com/wc";
var imageUploadUrl = "https://caimi.we.com/img/upload/file";
var audioUploadUrl = "https://caimi.we.com/audio/upload/file";


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
          console.log(res.windowHeight)
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
    result = moment(dateTimeStamp).format(format);
  }
  else if (weekC >= 1) {
    // result = "" + parseInt(weekC) + "周前";
    result = moment(dateTimeStamp).format(format);
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

var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
var chnUnitChar = ["", "十", "百", "千"];

var SectionToChinese = function(section) {
  var strIns = '', chnStr = '';
  var unitPos = 0;
  var zero = true;
  while (section > 0) {
    var v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return chnStr;
}

var NumberToChinese = function(num) {
    var unitPos = 0;
    var strIns = '', chnStr = '';
    var needZero = false;

    if (num === 0) {
        return chnNumChar[0];
    }

    while (num > 0) {
        var section = num % 10000;
        if (needZero) {
            chnStr = chnNumChar[0] + chnStr;
        }
        strIns = SectionToChinese(section);
        strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
        chnStr = strIns + chnStr;
        needZero = (section < 1000) && (section > 0);
        num = Math.floor(num / 10000);
        unitPos++;
    }

    return chnStr;
}


var timeToString = function (duration) {
  let str = '';
  let minute = parseInt(duration / 60) < 10 ? ('0' + parseInt(duration / 60)) : (parseInt(duration / 60));
  let second = duration % 60 < 10 ? ('0' + duration % 60) : (duration % 60);
  str = minute + ':' + second;
  return str;
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
module.exports.imageUploadUrl = imageUploadUrl;
module.exports.audioUploadUrl = audioUploadUrl;
module.exports.getScreenScale = getScreenScale;
module.exports.getTime = getTime;
module.exports.lastTime = lastTime;
module.exports.getRequest = getRequest;
module.exports.loadingToast = loadingToast;
module.exports.NumberToChinese = NumberToChinese;
module.exports.timeToString = timeToString;