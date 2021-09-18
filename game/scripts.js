// Variable for Board
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');


const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

var arena;
var final_qr;

console.log(params.id);

async function getInitialMessage() {
    let id = params.id ?? '61461f8db59150f9f1308f97';
    var url = `https://qr.bysonduong.com/messages/${id}`;
    const response = await fetch(url);
    var data = await response.json();
    return data
}

async function init() {
    data = await getInitialMessage();
    final_qr = data.qr_code.slice(4, data.qr_code.length - 4).map(column => column.slice(4, column.length - 4));
    board_size = final_qr.length;
    arena = createMatrix(board_size, board_size);
    context.scale(400 / board_size, 400 / board_size);


    // Clear Board on Lose
    function clearBoard() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = arena.splice(y, 1)[0].fill(0); //takes complete row out
            arena.unshift(row);
            ++y;

            player.score += rowCount * 10;
            rowCount *= 2;
        }
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

    function createPiece(type) {
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    function draw() {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid(arena);
        drawMatrix(arena, {
            x: 0,
            y: 0
        });
        drawMatrix(player.matrix, player.pos);
    }

    function drawGrid(arena) {
        arena.forEach((row, y) => {
            row.forEach((value, x) => {
                const color = final_qr[x][y] ? "#c7c7c7" : "#ffffff";
                context.fillStyle = color;
                context.fillRect(x, y, 1, 1);
            });
        });
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = "#000000";
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
            merge(arena, player);
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
    function playerRotate(dir) {
        const pos = player.pos.x;
        // initialise offset variable
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

    // Produce Random Piece / Reset Player Score on Lose
    function playerReset() {
        const pieces = 'ILJOTSZ';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        if (boundary(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
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
            playerRotate(-1);
        }
    });

    // Track Score
    function updateScore() {
        document.getElementById('score').innerText = player.score;
    }

    // Random Color for Bricks via Index
    const colors = [
        null,
        '#FF0D72',
        '#0DC2FF',
        '#0DFF72',
        '#F538FF',
        '#FF8E0D',
        '#FFE138',
        '#3877FF',
    ];

    // Game Init Settings
    const player = {
        pos: {
            x: 0,
            y: 0
        },
        matrix: null,
        score: 0,
    }

    playerReset();
    updateScore();
    update();
}

init();
