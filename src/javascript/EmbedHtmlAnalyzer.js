/**
 * Created by ChenXiao on 2015/3/19.
 */

require("fx.wall.street.analyzer",function(namespace){
    namespace.Analyzer=function(){
        this.item=null;
    };
    namespace.Analyzer.prototype.getItems=function(){
        var items=[];
        var count={};
        $('.table.table-condensed tr').each(function(idx,item){
            var itemTemp = fx.wall.street.analyzer.Analyzer.getItem($(this));
            if(!count[itemTemp.name]){
                items.push(itemTemp);
                count[itemTemp.name]=true;
            }
        });
        return items;
    };
    namespace.Analyzer.getItem=function(item){
        var values=[];
        item.find('td').each(function(idx){
            values.push($(this).text());
        });
        return {name:values[0].trim(),current:values[1],diff:values[2],diffPercent:values[3]};
    };
    namespace.Analyzer.prototype.getActiveItem=function(){
        var activeItem=$('.item.active');
        return fx.wall.street.analyzer.Analyzer.getItem(activeItem);
    };
    namespace.analyzer=new namespace.Analyzer();
    setInterval(function(){
        var items=namespace.analyzer.getItems();
        chrome.runtime.sendMessage({type:'UpdateItems',data:items,source:window.location.pathname});
    },1000);
});
