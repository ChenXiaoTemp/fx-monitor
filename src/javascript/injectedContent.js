/**
 * Created by ChenXiao on 2015/3/19.
 */

require('fx.wall.street.viewer', function(namespace) {
    namespace.RealTimeViewer = function() {
        this.containerId = 'fx-wall-street-vi';
        this.$dialog = $('<div ></div>')
            .html('This dialog will show every time!')
            .attr('id',this.containerId)
            .dialog({
                autoOpen: false,
                title: 'Basic Dialog'
            });
    };
    namespace.RealTimeViewer.prototype.getContainer = function() {
        return this.$dialog;
    };
    namespace.RealTimeViewer.prototype.show = function(items) {
        var $dialog=this.$dialog;
        $dialog.find('.fxItem').each(function(idx,item){

        });
    };
});
