var game1 = function(processingInstance) {
    with(processingInstance) {
        var x, y;
        x = mouseX;
        y = mouseY;
        var color = function() {
            draw(x,y);
        };
    }
};
var canvas = document.getElementById("canvas");
var processingInstance = new Processing(canvas, game1);