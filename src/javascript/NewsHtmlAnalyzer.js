/**
 * Created by ChenXiao on 2015/3/19.
 */

require("fx.wall.street.analyzer",function(namespace){
    namespace.NewsAnalyzer=function(){
        this.item=null;
        this.lastUrl={};
        this.changed=false;
    };
    namespace.NewsAnalyzer.prototype.getNewItems=function(){
        var items=[];
        $('.news.type-text.new').each(function(idx,item){
            var item=fx.wall.street.analyzer.NewsAnalyzer.getItem($(this));
            var newsAnalyzer=fx.wall.street.analyzer.newsAnalyzer;
            if(!newsAnalyzer.lastUrl[item.url]){
                newsAnalyzer.changed=true;
                items.push(item);
            }
            $(this).removeClass('new');
        });
        if(this.changed){
            this.lastUrl={};
            for(var i=0;i<items.length;i++){
                this.lastUrl[items[i].url]=true;
            }
            this.changed=false;
        }
        return items;
    };
    namespace.NewsAnalyzer.prototype.getItems=function(){
        var items=[];
        $('.news.type-text').each(function(idx,item){
            items.push(fx.wall.street.analyzer.NewsAnalyzer.getItem($(this)));
        });
        return items;
    };
    namespace.NewsAnalyzer.getItem=function(item){
         var time=item.find('.time').text();
         var title=time;
         var url=$(item.find('a')[0]).attr('href');
         var content=item.find('.content').text();
        return {time:time,url:url,content:content,title:title}
    };
    namespace.newsAnalyzer=new namespace.NewsAnalyzer();
    setTimeout(function(){
        var items1=fx.wall.street.analyzer.newsAnalyzer.getItems();
        chrome.runtime.sendMessage({type:'NewsNotification',data:items1,source:window.location.pathname});
        setInterval(function(){
            var items2=fx.wall.street.analyzer.newsAnalyzer.getNewItems();
            if(items2.length>0){
                chrome.runtime.sendMessage({type:'NewsNotification',data:items2,source:window.location.pathname});
            }
        },1000);
    },2000);
});
