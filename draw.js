var game = function(processingInstance) {
    with(processingInstance) {
        size(400, 400);
    }
};
var canvas = document.getElementById("canvas");
var processingInstance = new Processing(canvas, game);
