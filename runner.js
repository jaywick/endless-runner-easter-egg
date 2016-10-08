var context, canvas;

main = function() {
    canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 300;
    canvas.style.backgroundColor = "whitesmoke";
    canvas.style.border = "lightgray solid 1px"
    document.body.style.textAlign = "center";
    document.body.appendChild(canvas);
    context = canvas.getContext("2d");

    addCharacter(35, 50);
}

addCharacter = function(w, h) {
    context.fillRect((canvas.width / 10), canvas.height - h, w, h);
}


main();