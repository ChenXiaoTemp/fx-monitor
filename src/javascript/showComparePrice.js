/**
 * Created by shawn on 15-9-11.
 */

require("fx.wall.street.render",function(namespace){
    /**
     * Comparator is used to show the difference between two prices.
     * @constructor
     */
    namespace.Comparator=function(dataSource){
        this.dataSource=dataSource;
        /**
         * Store the differences of two prices.
         * @type {Array}
         * @private
         */
        this.data_=[];
        this.width_=window.innerWidth;
        this.height=window.innerHeight;
        this.left_=0;
        this.top_=0;
        this.NUMBER_OF_POINTS=24*60;// one day.
        this.unit_=5;// 5 pixels
        this.maxHeight=200;
    };
    namespace.prototype.foreach=function(array,cb){
        for(var i=0;i<array.length;i++){
            cb.apply(this,array[i]);
        }
    };
    /**
     *
     * @param {} context
     */
    namespace.prototype.onPaint=function(context){
        if(!this.data_ || this.data_.length==0){
            var text="There is no data.";
            var center=[left+this.width/2,top+this.height/2];
            var textWidth=context.measureText(text).width;
            context.fillText(text,center[0],center[1]);
            return;
        }
        var widthOfBar=this.width_/this.NUMBER_OF_POINTS;
        this.foreach(this.data_,function(){

        })
        var unitHeight=this.height/this.maxHeight;
        for(var i=0;i<this.data_.length;i++){
            var data=this.data_[i];
            var x=widthOfBar*i;
            var y=data/
            context.fillRect(x,y,w,h);
        }
    };

    namespace.prototype.drawText_=function(){

    }

});