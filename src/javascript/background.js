var namespace = require("fx.wall.street.controller", function(namespace) {
  namespace.ItemController = function() {
    // Save it using the Chrome extension storage API.
    var self=this;
    this.name = {
      "欧元/美元": {
        highestPrice: null,
        lowestPrice: null,
        openPrice: null,
        closePrice: null,
        time: null,
        change: 4.9,
        defaultChangeThr:4.9,
        changeStep:4.9
      }
    };
    chrome.storage.local.get('fxMonitorMonitoring', function(item) {
      if(item!==undefined&&item.fxMonitorMonitoring!==undefined){
        self.name=item.fxMonitorMonitoring;
        self.initialize();
      }
    });
    this.timeThreshold = 60*5 * 1000;
    this.defaultChangeStep=5;
    this.defaultGapThreshold = 5;
    this.updateCount = 0;
    this.updateCountTotal = 0;
    this.gold={};
    this.silver={};
    this.eur={};
    this.usd={};
    this.compareDiffThr=0.6;
    this.compareDiffStep=0.1;
    this.lastSilverGoldDiffThr=this.compareDiffThr;
    this.lastGoldUsdDiffThr=this.compareDiffThr;
    this.goldSilverDiff=0;
    this.goldUsdDiff=0;
    this.goldSilverMain="未知";
    this.goldUsdMain="未知";
  };
  namespace.ItemController.prototype.initialize=function(){
    for(var key in this.name){
      if(this.name[key].time!==undefined){
         this.name[key].time=null;
      }
    }
  };
  namespace.ItemController.prototype.formatPrice = function(price, digit) {
    return price.toFixed(digit + 0.000000001);
  };
  function formatPercent(value){
    if(value==0){
      return ''+value;
    }
    var text=''+value;
    var res='';
    var idx=0;
    for(var i=0;i<text.length;i++){
      if(text[i]!='.' && text[i]!='0'&&text[i]!='-'){
        idx=i;
        break;
      }
    }
    res=text.substr(0,idx+2)+'%';
    return res;
  }
  namespace.ItemController.prototype.checkCompareDiff=function(){
    var goldDiff=parseFloat(this.gold.diffPercent);
    var silverDiff=parseFloat(this.silver.diffPercent);
    var eurDiff=parseFloat(this.eur.diffPercent);
    var usdDiff=parseFloat(this.usd.diffPercent);
    var silverGoldDiff=goldDiff-silverDiff;
    var goldUsdDiff=goldDiff+usdDiff;
    this.goldSilverDiff=formatPercent(silverGoldDiff);
    this.goldUsdDiff=formatPercent(goldUsdDiff);
    var goldSilverMain=(Math.abs(goldDiff)>Math.abs(silverDiff)?("黄金("+goldDiff+")"):("白银("+silverDiff+")"));
    var goldUsdMain=(Math.abs(goldDiff)>Math.abs(usdDiff)?("黄金("+goldDiff+")"):("美元指数("+usdDiff+")"));
    this.goldSilverMain=goldSilverMain;
    this.goldUsdMain=goldUsdMain;
    var silverGoldDiffAbs=Math.abs(silverGoldDiff);
    if(silverGoldDiffAbs>this.lastSilverGoldDiffThr){
       this.lastSilverGoldDiffThr=Math.abs(silverGoldDiff)+this.compareDiffStep;
       var content="黄金白银波动异常,波动差:"+formatPercent(silverGoldDiff)+" 主波动:"+goldSilverMain+"";
       this.showInfo({title: '提醒', content: content});
    }
    else if(this.lastSilverGoldDiffThr>this.compareDiffThr&&silverGoldDiffAbs<this.compareDiffThr-this.compareDiffStep){
      this.lastSilverGoldDiffThr=this.compareDiffThr;
      var content="黄金白银恢复正常,波动差:"+formatPercent(silverGoldDiff);
      this.showInfo({title: '提醒', content: content});
    }
    var goldUsdDiffAbs=Math.abs(goldUsdDiff);
    if(goldUsdDiffAbs>this.lastGoldUsdDiffThr){
      this.lastGoldUsdDiffThr=Math.abs(goldUsdDiffAbs)+this.compareDiffStep;
      var content="黄金美元波动异常,波动差:"+formatPercent(goldUsdDiff)+" 主波动:"+goldUsdMain;
      this.showInfo({title: '提醒', content: content});
    }
    else if(this.lastGoldUsdDiffThr>this.compareDiffThr&&goldUsdDiffAbs<this.compareDiffThr-this.compareDiffStep){
      this.lastGoldUsdDiffThr=this.compareDiffThr;
      var content="黄金美元恢复正常,波动差:"+formatPercent(goldUsdDiff);
      this.showInfo({title: '提醒', content: content});
    }
  };
  namespace.ItemController.prototype.updateItems = function(items) {
    var name = this.name;
    var count = 0;
    var idx = -1;
    var firstIdx = -1;
    var nowTime = new Date();
    for (var i = 0; i < items.length; i++) {
      var itemName = items[i].name;
      switch(itemName){
        case "黄金":
            this.gold=items[i];
              break;
        case "白银":
            this.silver=items[i];
              break;
        case "美元指数":
            this.usd=items[i];
              break;
        case "欧元/美元":
            this.eur=items[i];
              break;
      }
      if (this.name[itemName] !== undefined) {
        if (this.name[itemName].time === null) {
          this.name[itemName].time = new Date();
          this.name[itemName].openPrice = items[i].current;
          this.name[itemName].closePrice = items[i].current;
          this.name[itemName].highestPrice = items[i].current;
          this.name[itemName].lowestPrice = items[i].current;
        }
        else {
          var digit = 0;
          var priceStr = '' + items[i].current;
          for (var k = priceStr.length - 1; k >= 0; k--) {
            if (priceStr[k] !== '.') {
              digit++;
            }
          }
          var gap = Math.abs(this.name[itemName].highestPrice - this.name[itemName].lowestPrice)+0.0000000001;
          var gapTmp = gap * 10000 / items[i].current;
          if (gapTmp > this.name[itemName].change) {
            this.name[itemName].change = gapTmp+this.name[itemName].changeStep;
            var content = itemName + "波动" + this.formatPrice(gap, digit-1) + ' 当前价格:' + items[i].current;
            this.showInfo({title: '提醒', content: content});
          }
          if (nowTime.getTime() - this.name[itemName].time.getTime() > this.timeThreshold) {
            this.name[itemName].time = null;
            if (this.name[itemName].defaultChangeThr !== undefined) {
              this.name[itemName].change = this.name[itemName].defaultChangeThr;
            }
            else {
              this.name[itemName].change=this.defaultGapThreshold;
              this.name[itemName].changeStep=this.defaultChangeStep;
            }
          }
          else {
            this.name[itemName].lowestPrice = Math.min(this.name[itemName].lowestPrice, items[i].current);
            this.name[itemName].highestPrice = Math.max(this.name[itemName].highestPrice, items[i].current);
            this.name[itemName].closePrice = items[i].current;
          }
        }
      }
    }
    this.checkCompareDiff();
    for (var i = 0; i < items.length; i++) {
      if (name[items[i].name]) {
        count++;
        if (firstIdx == -1) {
          firstIdx = i;
        }
        if (count - this.updateCount == 1) {
          idx = i;
          this.updateCount = count;
          break;
        }
      }
    }
    if (firstIdx == -1) {
      return;
    }
    if (idx == -1) {
      idx = firstIdx;
      this.updateCount = 1;
    }
    var item = items[idx];
    this.updateCountTotal++;
    chrome.tabs.query({active: true}, function(tabs) {
      for (var j = 0; j < tabs.length; j++) {
        var tabId = tabs[j].id;
        var price = '$' + item.current;
        var text = '';
        var textFour = '';
        var l = 0;
        for (var k = price.length - 2; k >= 0; k--) {
          l++;
          if (l > 4) {
            break;
          }
          text = price[k] + text;
        }
        if (text[0] == '.') {
          text = text.substr(1);
        }
        if (text.length < 4) {
          text = price.substr(price.length - 4);
        }
        chrome.browserAction.setTitle({title: price, tabId: tabId});
        chrome.browserAction.setBadgeText({text: text, tabId: tabId});
        if (count > 1 && itemController.updateCountTotal & 1) {
          chrome.browserAction.setBadgeBackgroundColor({
            color: '#FF0000',
            tabId: tabId
          });
        }
        else {
          chrome.browserAction.setBadgeBackgroundColor({
            color: '#0000FF',
            tabId: tabId
          });
        }

      }
    });
  };
  namespace.NewsController = function() {
    this.news = [];
    this.showNews = true;
  };
  namespace.NewsController.prototype.show = function(news) {
    this.showInfo({title: news.title, content: news.content,url:news.url});
  };
  namespace.NewsController.prototype.showInfo = function(info) {
    var notification = new Notification(info.title, {
      icon: 'image/FX48.png',
      body: info.content
    });
    notification.addEventListener('click', function() {
      notification.close();
      if(info.url){
        window.open("http://live.wallstreetcn.com/"+info.url,'_blank');
      }
      else{
        window.open("www.baidu.com","_blank");
      }
    });
    var closeFunction = function() {
      arguments.callee.notification.close();
    };
    closeFunction.notification = notification;
    setTimeout(closeFunction, 10000);
  };
  namespace.ItemController.prototype.showInfo = function(info) {
    var notification = new Notification(info.title, {
      icon: 'image/FX48.png',
      body: info.content
    });
    var closeFunction = function() {
      arguments.callee.notification.close();
    };
    closeFunction.notification = notification;
    setTimeout(closeFunction, 10000);
  };
  namespace.NewsController.prototype.insertNews = function(news) {
    var newsTemp=[];
    for(var i=0;i<news.length;i++){
      if(news[i].importance>=3){
        newsTemp.push(news[i]);
      }
    }
    if (news.length == 0) {
      return;
    }
    globalNews = globalNews.concat(newsTemp);
    while (globalNews.length > 100) {
      globalNews.shift();
    }
    if (this.showNews) {
      this.show(news[0]);
    }
  };
  namespace.NewsController.prototype.list = function(cb) {
    cb(this.news);
  };
});
var itemController = new namespace.ItemController();
var newsController = new namespace.NewsController();
chrome.storage.local.get("name", function(data) {
  if (data.name !== undefined && data.name !== null) {
    itemController.name = data.name;
  }
});
var globalItems = null;
var globalNews = [];
var backgroundTick = new Date().getTime();
var threshold = 10000;
var started = false;
var showRestartTips = function() {
  var notification = new Notification(new Date().toString(), {
    icon: 'image/FX48.png',
    body: "Retart Monitor..."
  });
  var closeFunction = function() {
    arguments.callee.notification.close();
  };
  closeFunction.notification = notification;
  setTimeout(closeFunction, 5000);
};
var restartBackground = function() {
  var watcher = document.getElementById('fx-watcher');
  if (watcher != null) {
    watcher.parentNode.removeChild(watcher);
  }
  var wrapper = document.getElementById('fx-watcher-wrap');
  var iframe = document.createElement('iframe');
  iframe.src = "http://live.wallstreetcn.com/";
  iframe.id = "fx-watcher";
  wrapper.appendChild(iframe);
  threshold = 100000;
  showRestartTips();
};
var intervalTimer = null;
var startMonitorBackground = function() {
  threshold = 10000;
  intervalTimer = setInterval(function() {
    var now = new Date().getTime();
    console.log('debug.');
    if (now - backgroundTick > threshold) {
      restartBackground();
      clearInterval(intervalTimer);
    }
  }, 60000);
};
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (sender.tab) {
      switch (request.type) {
        case 'UpdateItems':
          var items = request.data;
          itemController.updateItems(items);
          globalItems = items;
          break;
        case 'NewsNotification':
          newsController.insertNews(request.data);
          break;
      }
    }
    else {
      switch (request.type) {
        case 'UpdateItems':
          var items = request.data;
            for(var i=0;i<items.length;i++){
              if(items[i].current!==undefined){
                if(/N\/A/.test(items[i].current)){
                  backgroundTick=0;
                }
                else{
                  backgroundTick = new Date().getTime();
                }
                break;
              }
            }
          itemController.updateItems(items);
          globalItems = items;
          if (!started) {
            started = true;
            startMonitorBackground();
          }
          break;
        case 'NewsTips':
        case 'NewsNotification':
          newsController.insertNews(request.data);
          break;
        case 'QueryInfo':
          sendResponse({
            items: globalItems,
            news: globalNews,
            enableBackground: document.getElementById('fx-watcher') != null,
            currentPrice: itemController.name,
            enableShowNews: newsController.showNews,
            goldSilverDiff:itemController.goldSilverDiff,
            goldUsdDiff:itemController.goldUsdDiff,
            goldSilverMain:itemController.goldSilverMain,
            goldUsdMain:itemController.goldUsdMain
          });
          break;
        case 'QueryNews':
          sendResponse(globalNews);
          break;
        case 'QueryBackground':
          sendResponse(document.getElementById('fx-watcher') != null);
          break;
        case 'ChangeItem':
          if(request.data){
             itemController.name = request.data;
          }
          break;
        case 'ShowNews':
          newsController.showNews = request.data;
          break;
        case 'SelectItem':
          var data = request.data;
          if (!data.select) {
            if (itemController.name[data.name]) {
              delete itemController.name[data.name];
            }
          }
          else {
            itemController.name[data.name] = {
              highestPrice: 0,
              lowestPrice: 0,
              openPrice: 0,
              closePrice: 0,
              time: null,
              change: this.defaultChangeThr,
              defaultChangeThr:this.defaultChangeThr,
              changeStep:this.defaultChangeStep
            };
          }
          chrome.storage.local.set({"fxMonitorMonitoring":itemController.name});
          break;
        case 'EnableBackground':
          var node = null;
          if (request.data) {
            node = document.getElementById('fx-watcher');
            if (node) {
              if (node.parentNode != null) {
                node.parentNode.removeChild(node);
              }
            }
          }
          else {
            node = document.getElementById('fx-watcher');
            if (!node) {
              var bodyNode = document.getElementsByTagName('body')[0];
              var iFrame = document.createElement('iframe');
              iFrame.src = "http://live.wallstreetcn.com/";
              bodyNode.appendChild(iFrame);
            }
          }
          break;
      }
    }
  });
startMonitorBackground();

