$(document).ready(function () {
    output = $('#output');
    timer = $('#timer');

    mines.initEvent();
    easy.addEventListener('click', function () {

        mines.mode = 1;
        mines.initData();
        common();
    })
    medium.addEventListener('click', function () {
        mines.mode = 2;
        mines.initData();
        common();
    })
    hard.addEventListener('click', function () {
        mines.mode = 3;
        mines.initData();
        common();
    })
    custom.addEventListener('click', function () { })
    changeDiff.addEventListener('click', function () {
        popupBg.style.display = 'block';
        popupPause.style.display = 'none';
    })
    pause.addEventListener('click', function () {
        if (!mines.isPause) {
            pause.innerText = 'Resume';
            popupPause.style.display = 'block';
            clearInterval(mines.idTimer);
        } else {
            pause.innerText = 'Pause';
            popupPause.style.display = 'none';
            mines.idTimer = setInterval(function () {
                mines.timer = mines.timer + 100
                timer.html(Math.floor(mines.timer / 1000));
            }, 100);
        }
        mines.isPause = !mines.isPause;
    })
    playAgain.addEventListener('click', function () {
        // var mode = $('input:checked').val();
        mines.initData();
        common();

    })

    function common() {
        popupBg.style.display = 'none';
        clearInterval(mines.idTimer);
        playAgain.disabled = true;
        pause.disabled = true;
        playAgain.innerText = 'Play Again';
        mines.timer = 0;
        timer.html('0');
    }
});

var mines = {
    ctx: null,
    the_canvas: null,
    boardwidth: 0,
    boardheight: 0,
    matrix: [],
    matrixSt: [],
    square: 60,
    padSquare: 10,
    bomNums: 0,
    isFirstClick: false,
    isEndGame: false,
    mode: 1,
    isPause: false,
    timer: 0,
    idTimer: 0,
    initEvent: function () {
        mines.the_canvas = document.getElementById("canvas1");
        mines.the_canvas.addEventListener('click', mines.clickEvent);
        mines.the_canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
            mines.rightClickEvent(e);
        });
    },
    initData: function () {
        mines.isFirstClick = false;
        mines.isEndGame = false;
        mines.square = 60;
        mines.boardwidth = mines.mode * 8;
        mines.boardheight = mines.mode * 8;
        mines.bomNums = mines.mode ** mines.mode * 10;
        if (mines.mode != 1) {
            mines.square = 30;
        }
        if (mines.mode == 3) {
            mines.boardwidth = 32;
            mines.boardheight = 16;
        }
        mines.createBoard();
        mines.initMap();
        // mines.randomMine();
        $('#mainboard').css('width', mines.square * mines.boardwidth + 5);
        $('#menu').css('height', mines.square * mines.boardheight + 5);
        output.html(mines.bomNums);
    },
    createBoard: function () {
        if (mines.the_canvas && mines.the_canvas.getContext) {
            mines.ctx = mines.the_canvas.getContext("2d");
            if (mines.ctx) {
                mines.the_canvas.width = mines.boardwidth * mines.square;
                mines.the_canvas.height = mines.boardheight * mines.square;
                mines.ctx.beginPath();
                for (var i = 0; i < mines.the_canvas.width; i = i + mines.square) {
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
        if (!mines.isEndGame) {
            var pos = mines.caculateZone(e);
            if (!mines.isFirstClick) {
                mines.isFirstClick = true;
                mines.randomMine(pos);
                playAgain.disabled = false;
                pause.disabled = false;
                clearInterval(mines.idTimer);
                mines.idTimer = setInterval(function () {
                    mines.timer = mines.timer + 100
                    timer.html(Math.floor(mines.timer / 1000));
                }, 100);
            }
            mines.handleLeftClick(pos);
        }
    },
    rightClickEvent: function (e) {
        if (!mines.isEndGame) {
            var pos = mines.caculateZone(e);
            if (mines.matrixSt[pos.i][pos.j] == 0) {
                mines.matrixSt[pos.i][pos.j] = 2;
                mines.compute(pos.i, pos.j, flagImg);
                mines.bomNums--;
                output.html(mines.bomNums);
            }
            else if (mines.matrixSt[pos.i][pos.j] == 2) {
                mines.matrixSt[pos.i][pos.j] = 3;
                mines.compute(pos.i, pos.j, flagDoubtImg);
                mines.bomNums++;
                output.html(mines.bomNums);
            }
            else if (mines.matrixSt[pos.i][pos.j] == 3) {
                mines.matrixSt[pos.i][pos.j] = 0;
                var bombSquare = mines.square - mines.padSquare;
                mines.ctx.clearRect(pos.i * mines.square + 2, pos.j * mines.square + 2,
                    bombSquare + 5, bombSquare + 5);
                output.html(mines.bomNums);
            }
        }
    },
    handleLeftClick: function (pos) {
        var data = mines.matrix[pos.i][pos.j];
        if (mines.matrixSt[pos.i][pos.j] == 0 || mines.matrixSt[pos.i][pos.j] == 3) {
            if (data != 'x') {
                if (data != 0) {
                    mines.matrixSt[pos.i][pos.j] = 1;
                    mines.compute(pos.i, pos.j, data);
                    if (mines.isWin(mines.matrix, mines.matrixSt)) {
                        alert("Success!");
                        mines.isEndGame = true;
                        clearInterval(mines.idTimer);
                        pause.disabled = true;
                    }
                } else {
                    mines.matrixSt[pos.i][pos.j] = 1;
                    mines.compute(pos.i, pos.j, data);
                    mines.findZeroNear(pos.i, pos.j);
                }
            }
            else {
                mines.matrixSt[pos.i][pos.j] = 1;
                mines.compute(pos.i, pos.j, bomImg);
                // alert("End Game!");
                mines.openAllMines();
                mines.isEndGame = true;
                playAgain.innerText = 'Play Again';
                clearInterval(mines.idTimer);
                pause.disabled = true;
            }
        }
        else if (mines.matrixSt[pos.i][pos.j] == 1) {
            var count = 0;
            var i = pos.i, j = pos.j;
            var status = 2;
            if (i < mines.boardwidth - 1 && mines.matrixSt[i + 1][j] == status) {
                count++;
            }
            if (i > 0 && mines.matrixSt[i - 1][j] == status) {
                count++;
            }
            if (j < mines.boardheight - 1 && mines.matrixSt[i][j + 1] == status) {
                count++;
            }
            if (j > 0 && mines.matrixSt[i][j - 1] == status) {
                count++;
            }
            if (i < mines.boardwidth - 1 && j < mines.boardheight - 1 && mines.matrixSt[i + 1][j + 1] == status) {
                count++;
            }
            if (i > 0 && j > 0 && mines.matrixSt[i - 1][j - 1] == status) {
                count++;
            }
            if (i < mines.boardwidth - 1 && j > 0 && mines.matrixSt[i + 1][j - 1] == status) {
                count++;
            }
            if (i > 0 && j < mines.boardheight - 1 && mines.matrixSt[i - 1][j + 1] == status) {
                count++;
            }
            if (mines.matrix[i][j] == count) {
                status = 0;
                status3 = 3;
                if (i < mines.boardwidth - 1 &&
                    (mines.matrixSt[i + 1][j] == status || mines.matrixSt[i + 1][j] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j));
                }
                if (i > 0 &&
                    (mines.matrixSt[i - 1][j] == status || mines.matrixSt[i - 1][j] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j));
                }
                if (j < mines.boardheight - 1 &&
                    (mines.matrixSt[i][j + 1] == status || mines.matrixSt[i][j + 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i, j + 1));
                }
                if (j > 0 &&
                    (mines.matrixSt[i][j - 1] == status || mines.matrixSt[i][j - 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i, j - 1));
                }
                if (i < mines.boardwidth - 1 && j < mines.boardheight - 1 &&
                    (mines.matrixSt[i + 1][j + 1] == status || mines.matrixSt[i + 1][j + 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j + 1));
                }
                if (i > 0 && j > 0 &&
                    (mines.matrixSt[i - 1][j - 1] == status || mines.matrixSt[i - 1][j - 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j - 1));
                }
                if (i < mines.boardwidth - 1 && j > 0 &&
                    (mines.matrixSt[i + 1][j - 1] == status || mines.matrixSt[i + 1][j - 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j - 1));
                }
                if (i > 0 && j < mines.boardheight - 1 &&
                    (mines.matrixSt[i - 1][j + 1] == status || mines.matrixSt[i - 1][j + 1] == status3)) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j + 1));
                }
            }
        }
    },
    compute: function (x, y, data) {
        var padding = mines.padSquare / 2;
        var bombSquare = mines.square - mines.padSquare;
        mines.ctx.clearRect(x * mines.square + 2, y * mines.square + 2, bombSquare + 5, bombSquare + 5);
        // if (image != null) {
        if (typeof data == 'object') {
            mines.ctx.drawImage(data, x * mines.square + padding,
                y * mines.square + padding, bombSquare, bombSquare);
        }
        else {
            // else if (text != null) {
            mines.ctx.font = mines.square * 2 / 3 + "px Arial";
            mines.ctx.fillStyle = "white bold";
            mines.ctx.textAlign = "center";
            mines.ctx.fillText(data, x * mines.square + mines.square / 2,
                y * mines.square + mines.square * 3 / 4, bombSquare, bombSquare);
        }
    },
    caculateZone: function (e) {
        var zonex = Math.floor((e.clientX - e.target.offsetLeft) / mines.square);
        var zoney = Math.floor((e.clientY - e.target.offsetTop) / mines.square);
        return new mines.Pos(zonex, zoney); //{ 'zoneX': zonex, 'zoneY': zoney };
    },
    initMap: function () {
        mines.matrix = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));
        mines.matrixSt = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));
        for (var i = 0; i < mines.boardwidth; i++) {
            for (var j = 0; j < mines.boardheight; j++) {
                mines.matrix[i][j] = 0;
                mines.matrixSt[i][j] = 0;
            }
        }
    },
    randomMine: function (pos) {
        var listRandom = new Set();
        do {
            var bomX = 'x';
            var index = parseInt(Math.random() * mines.boardwidth * mines.boardheight);
            var bom = mines.getIndexBomMap(index);
            if (!((bom.row == pos.i && bom.col == pos.j)
                || (bom.row == pos.i && bom.col == pos.j + 1)
                || (bom.row == pos.i && bom.col == pos.j - 1)
                || (bom.row == pos.i + 1 && bom.col == pos.j)
                || (bom.row == pos.i + 1 && bom.col == pos.j + 1)
                || (bom.row == pos.i + 1 && bom.col == pos.j - 1)
                || (bom.row == pos.i - 1 && bom.col == pos.j)
                || (bom.row == pos.i - 1 && bom.col == pos.j + 1)
                || (bom.row == pos.i - 1 && bom.col == pos.j - 1))) {
                listRandom.add(index);
                mines.matrix[bom.row][bom.col] = bomX;
            }

        } while (listRandom.size != mines.bomNums)

        // listRandom.forEach(v => {
        //     var bom = mines.getIndexBomMap(v);
        //     console.log(bom);
        //     mines.matrix[bom.row][bom.col] = bomX;
        // })
        for (var i = 0; i < mines.boardwidth; i++) {
            for (var j = 0; j < mines.boardheight; j++) {
                if (mines.matrix[i][j] == bomX) {
                    //mines.compute(i, j, bomImg, null);
                }
                else {
                    var count = 0;
                    if (i < mines.boardwidth - 1 && mines.matrix[i + 1][j] == bomX) {
                        count++;
                    }
                    if (i > 0 && mines.matrix[i - 1][j] == bomX) {
                        count++;
                    }
                    if (j < mines.boardheight - 1 && mines.matrix[i][j + 1] == bomX) {
                        count++;
                    }
                    if (j > 0 && mines.matrix[i][j - 1] == bomX) {
                        count++;
                    }
                    if (i < mines.boardwidth - 1 && j < mines.boardheight - 1 && mines.matrix[i + 1][j + 1] == bomX) {
                        count++;
                    }
                    if (i > 0 && j > 0 && mines.matrix[i - 1][j - 1] == bomX) {
                        count++;
                    }
                    if (i < mines.boardwidth - 1 && j > 0 && mines.matrix[i + 1][j - 1] == bomX) {
                        count++;
                    }
                    if (i > 0 && j < mines.boardheight - 1 && mines.matrix[i - 1][j + 1] == bomX) {
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
    },
    findZeroNear: function (zoneX, zoneY) {
        var pos = new mines.Pos(zoneX, zoneY);
        // Thuat toan to mau loang
        var list = [];
        list.push(pos);
        // console.log(list.length);
        while (list.length > 0) {
            // debugger;
            pos = list.shift();
            if (pos.i < mines.boardwidth - 1 &&
                (mines.matrixSt[pos.i + 1][pos.j] == 0 || mines.matrixSt[pos.i + 1][pos.j] == 3)) {
                mines.matrixSt[pos.i + 1][pos.j] = 1;
                var data = mines.matrix[pos.i + 1][pos.j];
                mines.compute(pos.i + 1, pos.j, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j));
            }
            if (pos.i > 0 &&
                (mines.matrixSt[pos.i - 1][pos.j] == 0 || mines.matrixSt[pos.i - 1][pos.j] == 3)) {
                mines.matrixSt[pos.i - 1][pos.j] = 1;
                var data = mines.matrix[pos.i - 1][pos.j];
                mines.compute(pos.i - 1, pos.j, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j));
            }
            if (pos.j < mines.boardheight - 1 &&
                (mines.matrixSt[pos.i][pos.j + 1] == 0 || mines.matrixSt[pos.i][pos.j + 1] == 3)) {
                mines.matrixSt[pos.i][pos.j + 1] = 1;
                var data = mines.matrix[pos.i][pos.j + 1];
                mines.compute(pos.i, pos.j + 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i, pos.j + 1));
            }
            if (pos.j > 0 &&
                (mines.matrixSt[pos.i][pos.j - 1] == 0 || mines.matrixSt[pos.i][pos.j - 1] == 3)) {
                mines.matrixSt[pos.i][pos.j - 1] = 1;
                var data = mines.matrix[pos.i][pos.j - 1];
                mines.compute(pos.i, pos.j - 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i, pos.j - 1));
            }
            if (pos.i < mines.boardwidth - 1 && pos.j < mines.boardheight - 1
                && (mines.matrixSt[pos.i + 1][pos.j + 1] == 0 || mines.matrixSt[pos.i + 1][pos.j + 1] == 3)) {
                mines.matrixSt[pos.i + 1][pos.j + 1] = 1;
                var data = mines.matrix[pos.i + 1][pos.j + 1];
                mines.compute(pos.i + 1, pos.j + 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j + 1));
            }
            if (pos.i > 0 && pos.j > 0 &&
                (mines.matrixSt[pos.i - 1][pos.j - 1] == 0 || mines.matrixSt[pos.i - 1][pos.j - 1] == 3)) {
                mines.matrixSt[pos.i - 1][pos.j - 1] = 1;
                var data = mines.matrix[pos.i - 1][pos.j - 1];
                mines.compute(pos.i - 1, pos.j - 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j - 1));
            }
            if (pos.i < mines.boardwidth - 1 && pos.j > 0 &&
                (mines.matrixSt[pos.i + 1][pos.j - 1] == 0 || mines.matrixSt[pos.i + 1][pos.j - 1] == 3)) {
                mines.matrixSt[pos.i + 1][pos.j - 1] = 1;
                var data = mines.matrix[pos.i + 1][pos.j - 1];
                mines.compute(pos.i + 1, pos.j - 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j - 1));
            }
            if (pos.i > 0 && pos.j < mines.boardheight - 1 &&
                (mines.matrixSt[pos.i - 1][pos.j + 1] == 0 || mines.matrixSt[pos.i - 1][pos.j + 1] == 3)) {
                mines.matrixSt[pos.i - 1][pos.j + 1] = 1;
                var data = mines.matrix[pos.i - 1][pos.j + 1];
                mines.compute(pos.i - 1, pos.j + 1, data);
                if (data == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j + 1));
            }
            // console.log(list);
        }
    },
    openAllMines: function () {
        for (var i = 0; i < mines.boardwidth; i++)
            for (var j = 0; j < mines.boardheight; j++)
                if (mines.matrix[i][j] == 'x') {
                    mines.compute(i, j, bomImg);
                }
    },
    Pos: function (i, j) {
        this.i = i;
        this.j = j;
    }
}
