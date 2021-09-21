// Variable for Board
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');


const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

var arena;
var final_qr, turn_qr, next_qr, piece_move = '';
var globalMove = 0;

// console.log(params.id);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getInitialMessage() {
    let id = params.id ?? '55b2191997ed47dea9a2b3d66c88cfd8';
    var url = `https://qr.bysonduong.com/messages/${id}`;
    const response = await fetch(url);
    var data = await response.json();
    return data;
}

async function init() {
    data = await getInitialMessage();
    // final_qr = data.qr_code.slice(4, data.qr_code.length - 4).map(column => column.slice(4, column.length - 4));
    final_qr = data.qr_code;
    console.log(final_qr);
    console.log(final_qr.length, final_qr[0].length);
    final_qr.forEach((row, y) => {
        row.forEach((value, x) => {
            final_qr[y][x] = value ? 2 : 1;
        })
    })
    next_qr = final_qr.map(function (arr) {
        return arr.slice();
    }); // Clone the array
    next_qr = Array.from(Array(final_qr.length), () => Array(final_qr[0].length).fill(0));

    turn_qr = data.moves_matrix;
    piece_move = data.moves_shape;

    append_row = final_qr.length - turn_qr.length;
    for (let i = 0; i < append_row; i++) {
        turn_qr = [Array(final_qr[0].length).fill(Math.max(...turn_qr[0]) + 1), ...turn_qr]
    }

    console.log(turn_qr);
    board_size = final_qr.length;
    arena = createMatrix(board_size, board_size);
    context.scale(400 / board_size, 400 / board_size);


    // Clear Board on Lose
    function clearBoard() {
        let rowCount = 1;
        // outer: for (let y = arena.length - 1; y > 0; --y) {
        //     for (let x = 0; x < arena[y].length; ++x) {
        //         if (arena[y][x] === 0) {
        //             continue outer;
        //         }
        //     }
        //     const row = arena.splice(y, 1)[0].fill(0); //takes complete row out
        //     arena.unshift(row);
        //     ++y;

        //     player.score += rowCount * 10;
        //     rowCount *= 2;
        // }
    }

    // Create Boundaries to prevent out of canvas movement
    function boundary(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                        arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }


    function rotateMatrix(array) {
        var result = [];
        array.forEach(function (a, i, aa) {
            a.forEach(function (b, j, bb) {
                result[bb.length - j - 1] = result[bb.length - j - 1] || [];
                result[bb.length - j - 1][i] = b;
            });
        });
        return result;
    }

    function compareMatrix(array1, array2) {
        const a = getMatrixMask(array1)
        const b = getMatrixMask(array2)
        return a.toString() === b.toString();
    }
    function getMatrixMask(array1) {
        const a = Array.from(Array(array1.length), () => Array(array1[0].length).fill(0));

        array1.forEach((row, y) => {
            row.forEach((value, x) => {
                a[y][x] = value ? 1 : 0;
            })
        })
        return a;
    }

    function stripMatrix(matrix) {
        let offset = { x: -1, y: -1 };
        let offsetMax = { x: -1, y: -1 };
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    if (offset.x === -1 && offset.y === -1) {
                        offset.x = x;
                        offset.y = y;
                    } else {
                        offset.x = Math.min(x, offset.x)
                        offsetMax.x = Math.max(x, offsetMax.x)
                        offsetMax.y = Math.max(y, offsetMax.y)
                    }
                }
            });
        });
        const block = matrix.slice(offset.y, offsetMax.y + 1).map((arr) => {
            return arr.slice(offset.x, offsetMax.x + 1)
        })
        return block;
    }
    function getTPiece(block) {
        var res;
        var strippedPlayer = stripMatrix(player.matrix);

        for (let i = 0; i < 4; i++) {
            block = rotateMatrix(block);
            if (compareMatrix(strippedPlayer, block)) {
                break;
            }
        };

        var sum = []
        const mask = getMatrixMask(strippedPlayer);
        const temp_arr = [0, 0, 0];
        if (mask.length > mask[0].length) {
            sum = mask.reduce((a, b) => a.map((x, i) => x + b[i]));
            if (sum[0] < sum[1]) {
                res = block.map((item, index) => { return [...item, 0] })
            } else {
                res = block.map((item, index) => { return [0, ...item] })
            }

        } else {
            sum = mask.map(r => r.reduce((a, b) => a + b));
            console.log(sum);
            if (sum[0] < sum[1]) {
                res = [...block, temp_arr]
            } else {
                res = [temp_arr, ...block]
            }
        };
        return res;
    }
    function getZPiece(block) {
        var res;
        var strippedPlayer = stripMatrix(player.matrix);

        for (let i = 0; i < 4; i++) {
            block = rotateMatrix(block);
            if (compareMatrix(strippedPlayer, block)) {
                break;
            }
        };

        const mask = getMatrixMask(strippedPlayer);
        const temp_arr = [0, 0, 0];
        if (mask.length > mask[0].length) {
            res = block.map((item, index) => { return [...item, 0] });
        } else {
            res = [temp_arr, ...block]
        };
        return res;
    }
    function getIPiece(block) {
        var res;
        var strippedPlayer = stripMatrix(player.matrix);

        for (let i = 0; i < 4; i++) {
            block = rotateMatrix(block);
            if (compareMatrix(strippedPlayer, block)) {
                break;
            }
        };

        const mask = getMatrixMask(strippedPlayer);
        const temp_arr = [0, 0, 0, 0];
        if (mask.length > mask[0].length) {
            res = block.map((item, index) => { return [0, ...item, 0, 0] });
        } else {
            res = [temp_arr, ...block, temp_arr, temp_arr]
        };
        return res;
    }


    function getPiece(player) {
        console.log(piece_move[globalMove - 1]);
        let offset = { x: -1, y: -1 };
        let offsetMax = { x: -1, y: -1 };
        next_qr = Array.from(Array(final_qr.length), () => Array(final_qr[0].length).fill(0));
        try {

            arena.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (turn_qr[y][x] === globalMove) {
                        next_qr[y][x] = final_qr[y][x];
                    };
                });
            });
        } catch {

        }
        try {
            next_qr.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        if (offset.x === -1 && offset.y === -1) {
                            offset.x = x;
                            offset.y = y;
                        } else {
                            offset.x = Math.min(x, offset.x)
                            offsetMax.x = Math.max(x, offsetMax.x)
                            offsetMax.y = Math.max(y, offsetMax.y)
                        }
                    }
                });
            });

            const block = next_qr.slice(offset.y, offsetMax.y + 1).map((arr) => {
                return arr.slice(offset.x, offsetMax.x + 1)
            })
            if ('TLJ'.indexOf(piece_move[globalMove - 1]) > -1) {
                player.matrix = getTPiece(block);
            } else if ('ZS'.indexOf(piece_move[globalMove - 1]) > -1) {
                player.matrix = getZPiece(block);
            } else if (piece_move[globalMove - 1] === 'I') {
                player.matrix = getIPiece(block);
            } else {
                player.matrix = block;
            }

            for (let i = 0; i < getRndInteger(0, 4); i++) {
                player.matrix = rotateMatrix(player.matrix);
            }


        } catch {

        }
    }

    function createPiece(move) {

        if (move === 'T') {
            return [
                [0, 0, 0],
                [1, 2, 2],
                [0, 1, 0],
            ];
        } else if (move === 'O') {
            return [
                [2, 1],
                [2, 1],
            ];
        } else if (move === 'L') {
            return [
                [0, 1, 0],
                [0, 1, 0],
                [0, 2, 1],
            ];
        } else if (move === 'J') {
            return [
                [0, 2, 0],
                [0, 2, 0],
                [1, 2, 0],
            ];
        } else if (move === 'I') {
            return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
            ];
        } else if (move === 'S') {
            return [
                [0, 2, 2],
                [2, 2, 0],
                [0, 0, 0],
            ];
        } else if (move === 'Z') {
            return [
                [2, 2, 0],
                [0, 2, 2],
                [0, 0, 0],
            ];
        }
    }

    function draw() {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawHint(arena, globalMove);
        drawMatrix(arena, {
            x: 0,
            y: 0
        });
        drawMatrix(player.matrix, player.pos);
    }

    // function drawGrid(arena) {
    //     arena.forEach((row, y) => {
    //         row.forEach((value, x) => {
    //             const color = (final_qr[y][x] === 2) ? "#000000" : "#000000";
    //             context.fillStyle = color;
    //             context.fillRect(x, y, 1, 1);
    //         });
    //     });
    // }

    function drawHint(arena, move) {
        arena.forEach((row, y) => {
            row.forEach((value, x) => {
                try {
                    if (turn_qr[y][x] === move) {
                        const color = (final_qr[y][x] === 2) ? "#290b0b" : "#2b2b2b";
                        context.fillStyle = color;
                        context.fillRect(x, y, 1, 1);
                    };
                } catch {

                }
            });
        });
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // Merge to boundard and piece when it touches bottom
    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    // Movement for Down
    function playerDrop() {
        player.pos.y++;
        if (boundary(arena, player)) {
            player.pos.y--;
            if (isCorrect(player)) {
                merge(arena, player);
            }
            playerReset();
            clearBoard();
            updateScore();
        }
        dropCounter = 0;
    }

    // Movement for Left/Right
    function playerMove(offset) {
        player.pos.x += offset;
        if (boundary(arena, player)) {
            player.pos.x -= offset;
        }
    }

    // Movement for Rotation - Clockwise and Anti-Clockwise
    function playerRotate(player, dir) {
        const pos = player.pos.x;
        // initialise offset variable
        console.log('rotate');
        let offset = 1;
        rotate(player.matrix, dir);
        // Check collision
        while (boundary(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    // Addon to confine to boundary
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                        matrix[y][x],
                        matrix[x][y],
                    ];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    // If the peace is correct
    function isCorrect(player) {
        let res = true;
        try {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        if (turn_qr[y + player.pos.y][x + player.pos.x] !== globalMove) {
                            res = false;
                        }
                    }
                });
            });
            return res;
        } catch {
            return res;
        }
    }

    // Produce Random Piece / Reset Player Score on Lose
    function playerReset() {
        if (isCorrect(player)) {
            globalMove++;
        } else {
            player.score--;
        }
        // const pieces = 'ILJOTSZ';
        // player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);

        player.matrix = createPiece(piece_move[globalMove - 1]);
        getPiece(player);

        console.log(player.matrix);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        if (boundary(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 100;
            updateScore();
            globalMove = 1;
        }
    }

    // Timer Count
    let dropCounter = 0; // prevent animation from dropping past canvas
    let dropInterval = 600; // drop speed

    // Incremental Time
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }

    // Movement Controls
    document.addEventListener('keydown', event => {
        if (event.keyCode === 37) { // KeyLeft : Move Left
            playerMove(-1);
        } else if (event.keyCode === 39) { // KeyRight : Move Right
            playerMove(1);
        } else if (event.keyCode === 40) { // KeyDown : Move Down 1 Step
            playerDrop();
        } else if (event.keyCode === 40 * 2) {

        } else if (event.keyCode === 38) { // Q : Rotate Anti-Clockwise
            playerRotate(player, -1);
        }
    });

    // Track Score
    function updateScore() {
        document.getElementById('score').innerText = player.score;
    }

    // Random Color for Bricks via Index
    const colors = [
        null,
        '#ffffff',
        '#8c0000',
        // '#290b0b',
        // '#2b2b2b',
        // '#FF8E0D',
        // '#FFE138',
        // '#3877FF',
    ];

    // Game Init Settings
    const player = {
        pos: {
            x: 0,
            y: 0
        },
        matrix: null,
        score: 100,
    }

    if (turn_qr && piece_move && final_qr) {
        playerReset();
        updateScore();
        update();
    }
}

init();
