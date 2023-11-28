var game1 = function(processingInstance) {
    with(processingInstance) {
        size(1000, 500);
        var x, y;
        x = mouseX;
        y = mouseY;
        var color = function() {
            fill(0, 0, 0);
            rect(0, 0, 1000, 500);
            fill(255, 255, 255);
            draw(x,y);
        };
    }
};
var canvas = document.getElementById("canvas");
var processingInstance = new Processing(canvas, game1);
