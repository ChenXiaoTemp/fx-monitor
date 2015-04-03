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
        var $pricesNode = $('#show-prices');
        for (var i = 0; i < info.items.length; i++) {
            var item = info.items[i];
            var node = $('<tr></tr>').append($('<td></td>').append($('<input type="checkbox"/>').attr('fx-name', item.name).prop('checked', info.currentPrice[item.name]).click(function() {
                var value = $(this).prop('checked');
                var name = $(this).attr('fx-name');
                chrome.runtime.sendMessage({type: 'SelectItem', data: {select: value, name: name}});
            }))).append($('<td></td>').text(item.name)).append($('<td></td>').text(item.current)).append($('<td></td>').text(item.diffPercent));
            $pricesNode.append(node);
        }
    });
    $('#show-news').click()
});
