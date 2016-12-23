/**
 * Created by ChenXiao on 2015/3/25.
 */
$(document).ready(function() {
    chrome.runtime.sendMessage({type: 'QueryInfo'}, function(info) {
        /* items: globalItems,
         news: globalNews,
         enableBackground: document.getElementById('fx-watcher') != null,
         currentPrice:itemController.name,
         enableShowNews:newsController.showNews*/
        var $showNews=$('#show-news');
        $showNews.prop('checked',info.enableShowNews);
        $showNews.click(function() {
            chrome.runtime.sendMessage({type: 'ShowNews', data: $(this).prop('checked')});
        });
        var $currentPricesNode = $('#current-show-prices');
        var $pricesNode = $('#avaliable-show-prices');
        for (var i = 0; i < info.items.length; i++) {
            var item = info.items[i];
            if(info.currentPrice[item.name]){
                var node = $('<tr></tr>').append($('<td></td>').append($('<input type="checkbox"/>').attr('fx-name', item.name).prop('checked', info.currentPrice[item.name]).click(function() {
                    var value = $(this).prop('checked');
                    var name = $(this).attr('fx-name');
                    chrome.runtime.sendMessage({type: 'SelectItem', data: {select: value, name: name}});
                    location.reload();
                }))).append($('<td></td>').text(item.name)).append($('<td></td>').text(item.current)).append($('<td></td>').text(item.diffPercent));
                $currentPricesNode.append(node);
            }
        }
        for (var i = 0; i < info.items.length; i++) {
            var item = info.items[i];
            if(!info.currentPrice[item.name]){
                var node = $('<tr></tr>').append($('<td></td>').append($('<input type="checkbox"/>').attr('fx-name', item.name).prop('checked', info.currentPrice[item.name]).click(function() {
                    var value = $(this).prop('checked');
                    var name = $(this).attr('fx-name');
                    chrome.runtime.sendMessage({type: 'SelectItem', data: {select: value, name: name}});
                    var $tr=$(this).parents('tr');
                    location.reload();
                }))).append($('<td></td>').text(item.name)).append($('<td></td>').text(item.current)).append($('<td></td>').text(item.diffPercent));
                $pricesNode.append(node);
            }
        }
        var $goldSilverDiff=$('#gold-silver-diff');
        $goldSilverDiff.text(info.goldSilverDiff);
        var $goldUsdDiff=$('#gold-usd-diff');
        $goldUsdDiff.text(info.goldUsdDiff);
        var $goldSilverMain=$('#gold-silver-main');
        $goldSilverMain.text(info.goldSilverMain);
        var $goldUsdMain=$('#gold-usd-main');
        $goldUsdMain.text(info.goldUsdMain);
    });
    $('#show-news').click()
});
