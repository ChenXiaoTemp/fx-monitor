require("fx.wall.street.analyzer", function(namespace) {
  namespace.TipsAnalyzer = function() {
    this.item = null;
    this.lastUrl = {};
    this.changed = false;
  };
  namespace.TipsAnalyzer.prototype.getActiveItems = function() {
    var items = this.getItems();
    var now = new Date();
    var result = [];
    var gapThr = [30 * 60, 15 * 60, 5 * 60];
    for (var i = 0; i < items.length; i++) {
      var temp = items[i];
      var gap = (temp.time.getTime() - now.getTime()) / 1000;
      for (var j = 0; j < gapThr.length; j++) {
        if (Math.abs(gap - gapThr[j]) < 20) {
          result.push(temp);
          break;
        }
      }
    }
    return result;
  };
  namespace.TipsAnalyzer.prototype.getItems = function() {
    var items = [];
    $('.nano-content.content li.item').each(function(idx, item) {
      items.push(fx.wall.street.analyzer.TipsAnalyzer.getItem($(this)));
    });
    return items;
  };
  namespace.TipsAnalyzer.parseTime = function(timeStr) {
    var pattern = /(\d\d):(\d\d)/;
    var values = pattern.exec(timeStr);
    var time = new Date();
    time.setHours(values[1], values[2], 0, 0);
    return time;
  };
  namespace.TipsAnalyzer.getItem = function(item) {
    var timeStr = item.find('.time').text();
    var importance = item.find('.col-custom-8.important').attr('data-value');
    var title = item.find('.col-custom-8.title').text();
    var country = item.find('.col-custom-4.country').text();
    var actual = item.find('.col-custom-4 price.actual .value').text();
    var forecast = item.find('.col-custom-4 price.forecast .value').text();
    var previous = item.find('col-custom-4 price.previous .value').text();
    var time = fx.wall.street.analyzer.TipsAnalyzer.parseTime(timeStr);
    var leftTime = (time.getTime() - new Date().getTime()) / (60 * 1000);
    var impt = "";
    for (var i = 0; i < importance; i++) {
      impt += '*';
    }
    return {
      time: time,
      timeContent: timeStr,
      country: country,
      actual: actual,
      forecast: forecast,
      previous: previous,
      url: '',
      title: impt + ' ' + country,
      importance: importance,
      leftTime: leftTime,
      content: '' + title + ' 将在 ' + timeStr + '分钟后到来。\n 剩余 :' + leftTime.toFixed(0) + ' 分钟'
    }
  };
  namespace.tipsAnalyzer = new namespace.TipsAnalyzer();
  setTimeout(function() {
    setInterval(function() {
      var items = fx.wall.street.analyzer.tipsAnalyzer.getActiveItems();
      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          chrome.runtime.sendMessage({
            type: 'NewsTips',
            data: [items[0]],
            source: window.location.pathname
          });
        }
      }
    }, 60000);
  }, 2000);
});
