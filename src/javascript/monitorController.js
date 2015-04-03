/**
 * Created by ChenXiao on 2015/3/20.
 */
require("fx.wall.street.monitor",function(namespace){
    var Analyzer=load("fx.wall.street.analyzer.Analyzer");
    var RealTimeViewer=load("fx.wall.street.viewer.RealTimeViewer");
    namespace.Monitor=function(){
        this.INTERVAL=1000;
        this.analyzer=new Analyzer();
        this.realTimeViewer=new RealTimeViewer();
    };
    namespace.Monitor.prototype.onTimer=function(){
        var items=this.analyzer.getItems();
        this.realTimeViewer.show(items);
    };
    namespace.Monitor.prototype.setInterval=setInterval.bind(namespace.Monitor.prototype);
    namespace.Monitor.prototype.setWatch=function(){
          this.setInterval(this.onTimer,this.INTERVAL);
    };
});


