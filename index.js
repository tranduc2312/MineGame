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
    bomNums: 40,
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
        mines.handleLeftClick(pos);
    },
    rightClickEvent: function (e) {
        var pos = mines.caculateZone(e);
        if (mines.matrixSt[pos.i][pos.j] == 0) {
            mines.matrixSt[pos.i][pos.j] = 2;
            mines.compute(pos.i, pos.j, flagImg, null);
        }
        else if (mines.matrixSt[pos.i][pos.j] == 2) {
            mines.matrixSt[pos.i][pos.j] = 0;
            var bombSquare = mines.square - mines.padSquare;
            mines.ctx.clearRect(pos.i * mines.square + 2, pos.j * mines.square + 2,
                bombSquare + 5, bombSquare + 5);
        }

    },
    handleLeftClick: function (pos) {
        var data = mines.matrix[pos.i][pos.j];
        if (mines.matrixSt[pos.i][pos.j] == 0) {
            if (data != 'x') {
                if (data != 0) {
                    mines.matrixSt[pos.i][pos.j] = 1;
                    mines.compute(pos.i, pos.j, null, data);
                    if (mines.isWin(mines.matrix, mines.matrixSt)) {
                        alert("Success!")
                    }
                } else {
                    mines.matrixSt[pos.i][pos.j] = 1;
                    mines.compute(pos.i, pos.j, null, data);
                    mines.findZeroNear(pos.i, pos.j);
                }
            }
            else {
                mines.matrixSt[pos.i][pos.j] = 1;
                mines.compute(pos.i, pos.j, bomImg, null);
                alert("End Game!");
            }
        }
        else if (mines.matrixSt[pos.i][pos.j] == 1) {
            var count = 0;
            var i = pos.i, j = pos.j;
            var status = 2
            // for (var u = -1; u <= 1; u++)
            //     for (var v = -1; v <= 1; v++)
            //         if (u != 0 && v != 0)
            //             if (i >= -1 * u && i < mines.boardwidth + -1 * u && j >= -1 * v && j < mines.boardheight + -1 * v
            //                 && mines.matrixSt[i + u][j + v] == status) {
            //                 count++;
            //             }
            // console.log(count);
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
                // for (var u = -1; u <= 1; u++)
                //     for (var v = -1; v <= 1; v++)
                //         if (u != 0 && v != 0)
                //             if (i >= -1 * u && i < mines.boardwidth + -1 * u && j >= -1 * v && j < mines.boardheight + -1 * v
                //                 && mines.matrixSt[i + u][j + v] == status) {
                //                 mines.handleLeftClick(new mines.Pos(i + u, j + v));
                //             }
                if (i < mines.boardwidth - 1 && mines.matrixSt[i + 1][j] == status) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j));
                }
                if (i > 0 && mines.matrixSt[i - 1][j] == status) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j));
                }
                if (j < mines.boardheight - 1 && mines.matrixSt[i][j + 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i, j + 1));
                }
                if (j > 0 && mines.matrixSt[i][j - 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i, j - 1));
                }
                if (i < mines.boardwidth - 1 && j < mines.boardheight - 1 && mines.matrixSt[i + 1][j + 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j + 1));
                }
                if (i > 0 && j > 0 && mines.matrixSt[i - 1][j - 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j - 1));
                }
                if (i < mines.boardwidth - 1 && j > 0 && mines.matrixSt[i + 1][j - 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i + 1, j - 1));
                }
                if (i > 0 && j < mines.boardheight - 1 && mines.matrixSt[i - 1][j + 1] == status) {
                    mines.handleLeftClick(new mines.Pos(i - 1, j + 1));
                }
            }
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
        return new mines.Pos(zonex, zoney); //{ 'zoneX': zonex, 'zoneY': zoney };
    },
    randomMine: function () {
        mines.matrix = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));
        mines.matrixSt = new Array(mines.boardwidth).fill().map(entry => Array(mines.boardheight));
        var bomX = 'x';
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
            mines.matrix[bom.row][bom.col] = bomX;
        })
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
        console.log(list.length);
        while (list.length > 0) {
            // debugger;
            pos = list.shift();
            if (pos.i < mines.boardwidth - 1 && mines.matrixSt[pos.i + 1][pos.j] == 0) {
                mines.matrixSt[pos.i + 1][pos.j] = 1;
                var data = mines.matrix[pos.i + 1][pos.j];
                mines.compute(pos.i + 1, pos.j, null, data);
                if (mines.matrix[pos.i + 1][pos.j] == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j));
            }
            if (pos.i > 0 && mines.matrixSt[pos.i - 1][pos.j] == 0) {
                mines.matrixSt[pos.i - 1][pos.j] = 1;
                var data = mines.matrix[pos.i - 1][pos.j];
                mines.compute(pos.i - 1, pos.j, null, data);
                if (mines.matrix[pos.i - 1][pos.j] == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j));
            }
            if (pos.j < mines.boardheight - 1 && mines.matrixSt[pos.i][pos.j + 1] == 0) {
                mines.matrixSt[pos.i][pos.j + 1] = 1;
                var data = mines.matrix[pos.i][pos.j + 1];
                mines.compute(pos.i, pos.j + 1, null, data);
                if (mines.matrix[pos.i][pos.j + 1] == '0')
                    list.push(new mines.Pos(pos.i, pos.j + 1));
            }
            if (pos.j > 0 && mines.matrixSt[pos.i][pos.j - 1] == 0) {
                mines.matrixSt[pos.i][pos.j - 1] = 1;
                var data = mines.matrix[pos.i][pos.j - 1];
                mines.compute(pos.i, pos.j - 1, null, data);
                if (mines.matrix[pos.i][pos.j - 1] == '0')
                    list.push(new mines.Pos(pos.i, pos.j - 1));
            }
            if (pos.i < mines.boardwidth - 1 && pos.j < mines.boardheight - 1
                && mines.matrixSt[pos.i + 1][pos.j + 1] == 0) {
                mines.matrixSt[pos.i + 1][pos.j + 1] = 1;
                var data = mines.matrix[pos.i + 1][pos.j + 1];
                mines.compute(pos.i + 1, pos.j + 1, null, data);
                if (mines.matrix[pos.i + 1][pos.j + 1] == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j + 1));
            }
            if (pos.i > 0 && pos.j > 0 && mines.matrixSt[pos.i - 1][pos.j - 1] == 0) {
                mines.matrixSt[pos.i - 1][pos.j - 1] = 1;
                var data = mines.matrix[pos.i - 1][pos.j - 1];
                mines.compute(pos.i - 1, pos.j - 1, null, data);
                if (mines.matrix[pos.i - 1][pos.j - 1] == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j - 1));
            }
            if (pos.i < mines.boardwidth - 1 && pos.j > 0 && mines.matrixSt[pos.i + 1][pos.j - 1] == 0) {
                mines.matrixSt[pos.i + 1][pos.j - 1] = 1;
                var data = mines.matrix[pos.i + 1][pos.j - 1];
                mines.compute(pos.i + 1, pos.j - 1, null, data);
                if (mines.matrix[pos.i + 1][pos.j - 1] == '0')
                    list.push(new mines.Pos(pos.i + 1, pos.j - 1));
            }
            if (pos.i > 0 && pos.j < mines.boardheight - 1 && mines.matrixSt[pos.i - 1][pos.j + 1] == 0) {
                mines.matrixSt[pos.i - 1][pos.j + 1] = 1;
                var data = mines.matrix[pos.i - 1][pos.j + 1];
                mines.compute(pos.i - 1, pos.j + 1, null, data);
                if (mines.matrix[pos.i - 1][pos.j + 1] == '0')
                    list.push(new mines.Pos(pos.i - 1, pos.j + 1));
            }
            console.log(list);
        }
    },
    Pos: function (i, j) {
        this.i = i;
        this.j = j;
    }
}