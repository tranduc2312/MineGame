$(document).ready(function () {
    output = $('#output');
    mines.init();
});

var mines = {
    ctx: null,
    the_canvas: null,
    boardwidth: 16,
    boardheight: 16,
    matrix: [],
    matrixSt: [],
    square: 40,
    padSquare: 10,
    bomNums: 30,
    bomImg: null,
    flagImg: null,
    init: function () {
        mines.createBoard();
        mines.randomMine();
        the_canvas.addEventListener('click', mines.clickEvent);
        the_canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
            mines.rightClickEvent(e);
        });
    },
    createBoard: function () {
        the_canvas = document.getElementById("canvas1");
        if (the_canvas && the_canvas.getContext) {
            mines.ctx = the_canvas.getContext("2d");
            if (mines.ctx) {
                the_canvas.width = mines.boardwidth * mines.square;
                the_canvas.height = mines.boardheight * mines.square;
                mines.ctx.beginPath();
                for (var i = 0; i < the_canvas.width; i = i + mines.square) {
                    mines.ctx.moveTo(i, 0);
                    mines.ctx.lineTo(i, mines.boardheight * mines.square);
                    mines.ctx.moveTo(0, i);
                    mines.ctx.lineTo(mines.boardwidth * mines.square, i);
                }
                mines.ctx.strokeStyle = 'white';
                mines.ctx.lineWidth = 3;
                mines.ctx.stroke();
                mines.ctx.closePath();
            }
        }
    },
    clickEvent: function (e) {
        var pos = mines.caculateZone(e);
        var data = mines.matrix[pos.zoneX][pos.zoneY];
        //console.table(mines.matrixSt);
        if (mines.matrixSt[pos.zoneX][pos.zoneY] == 0) {
            if (data != 'x') {
                mines.matrixSt[pos.zoneX][pos.zoneY] = 1;
                mines.compute(pos.zoneX, pos.zoneY, null, data);
                if (mines.isWin(mines.matrix, mines.matrixSt)) {
                    alert("Success!")
                }
            }
            else {
                mines.matrixSt[pos.zoneX][pos.zoneY] = 1;
                mines.compute(pos.zoneX, pos.zoneY, bomImg, null);
                alert("End Game!");
            }
        }
    },
    rightClickEvent: function (e) {
        var pos = mines.caculateZone(e);
        if (mines.matrixSt[pos.zoneX][pos.zoneY] == 0) {
            mines.matrixSt[pos.zoneX][pos.zoneY] = 2;
            mines.compute(pos.zoneX, pos.zoneY, flagImg, null);
        }
        else if (mines.matrixSt[pos.zoneX][pos.zoneY] == 2) {
            mines.matrixSt[pos.zoneX][pos.zoneY] = 0;
            var bombSquare = mines.square - mines.padSquare;
            mines.ctx.clearRect(pos.zoneX * mines.square + 2, pos.zoneY * mines.square + 2,
                bombSquare + 5, bombSquare + 5);
        }

    },
    compute: function (x, y, image, text) {
        var padding = mines.padSquare / 2;
        var bombSquare = mines.square - mines.padSquare;
        mines.ctx.clearRect(x * mines.square + 2, y * mines.square + 2, bombSquare + 5, bombSquare + 5);
        if (image != null) {
            mines.ctx.drawImage(image, x * mines.square + padding,
                y * mines.square + padding, bombSquare, bombSquare);
        }
        else if (text != null) {
            mines.ctx.font = "25px Arial";
            mines.ctx.fillStyle = "white bold";
            mines.ctx.textAlign = "center";
            mines.ctx.fillText(text, x * mines.square + 20,
                y * mines.square + 30, bombSquare, bombSquare);
        }
    },
    caculateZone: function (e) {
        var zonex = Math.floor((e.clientX - e.target.offsetLeft) / mines.square);
        var zoney = Math.floor((e.clientY - e.target.offsetTop) / mines.square);
        return { 'zoneX': zonex, 'zoneY': zoney };
    },
    randomMine: function () {
        mines.matrix = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));
        mines.matrixSt = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));

        var listRandom = new Set();
        do {
            listRandom.add(parseInt(Math.random() * mines.boardwidth * mines.boardheight))
        } while (listRandom.size != mines.bomNums)

        for (var i = 0; i < mines.boardwidth; i++) {
            for (var j = 0; j < mines.boardheight; j++) {
                mines.matrix[i][j] = 0;
                mines.matrixSt[i][j] = 0;
            }
        }
        listRandom.forEach(v => {
            var bom = mines.getIndexBomMap(v);
            console.log(bom);
            mines.matrix[bom.row][bom.col] = 'x';
        })
        for (var i = 0; i < mines.boardwidth; i++) {
            for (var j = 0; j < mines.boardheight; j++) {
                if (mines.matrix[i][j] == 'x') {
                    //mines.compute(i, j, bomImg, null);
                }
                else {
                    var count = 0;
                    if (i < mines.boardwidth - 1 && mines.matrix[i + 1][j] == 'x') {
                        count++;
                    }
                    if (i > 0 && mines.matrix[i - 1][j] == 'x') {
                        count++;
                    }
                    if (j < mines.boardheight - 1 && mines.matrix[i][j + 1] == 'x') {
                        count++;
                    }
                    if (j > 0 && mines.matrix[i][j - 1] == 'x') {
                        count++;
                    }
                    if (i < mines.boardwidth - 1 && j < mines.boardheight - 1 && mines.matrix[i + 1][j + 1] == 'x') {
                        count++;
                    }
                    if (i > 0 && j > 0 && mines.matrix[i - 1][j - 1] == 'x') {
                        count++;
                    }
                    if (i < mines.boardwidth - 1 && j > 0 && mines.matrix[i + 1][j - 1] == 'x') {
                        count++;
                    }
                    if (i > 0 && j < mines.boardheight - 1 && mines.matrix[i - 1][j + 1] == 'x') {
                        count++;
                    }
                    mines.matrix[i][j] = count;
                    //mines.compute(i, j, null, count);
                }
            }
        }
        console.log(listRandom);
        console.table(mines.matrix);

    },
    getIndexBomMap: function (n) {
        var row = n / mines.boardheight;
        var col = n % mines.boardwidth == 0 ? mines.boardwidth - 1 : n % mines.boardwidth - 1;
        return { 'row': Math.floor(row), 'col': col };
    },
    isWin: function (arr1, arr2) {
        for (var i = 0; i < mines.boardwidth; i++) {
            for (var j = 0; j < mines.boardheight; j++) {
                if (arr2[i][j] != 1 && arr1[i][j] != 'x') {
                    return false;
                }
            }
        }
        return true;
    }
}