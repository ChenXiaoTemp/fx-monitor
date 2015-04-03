/**
 * Created by ChenXiao on 2015/3/19.
 */

require("fx.wall.street.analyzer", function(namespace) {
    namespace.Analyzer = function() {
        this.item = null;
    };
    namespace.Analyzer.prototype.getItems = function() {
        var items = [];
        var count = {};
        $('.item').each(function(idx, item) {
            var itemTemp = fx.wall.street.analyzer.Analyzer.getItem($(this));
            if(!count[itemTemp.name]){
                items.push(itemTemp);
                count[itemTemp.name]=true;
            }
        });
        return items;
    };
    namespace.Analyzer.getItem = function(item) {
        var title = item.find('.title')[0].innerText;
        var priceCurrent = item.find('.price-current')[0].innerText;
        var priceDiff = item.find('.price-diff')[0].innerText;
        var priceDiffPercent = item.find('.price-diff-percent')[0].innerText;
        return {name: title.trim(), current: priceCurrent, diff: priceDiff, diffPercent: priceDiffPercent};
    };
    namespace.Analyzer.prototype.getActiveItem = function() {
        var activeItem = $('.item.active');
        return fx.wall.street.analyzer.Analyzer.getItem(activeItem);
    };
    namespace.analyzer = new namespace.Analyzer();
    setInterval(function() {
        var items = namespace.analyzer.getItems();
        chrome.runtime.sendMessage({type: 'UpdateItems', data: items, source: window.location.pathname});
    }, 1000);
});
