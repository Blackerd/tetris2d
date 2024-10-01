const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let boardWidth = 10;
let boardHeight = 20;
const blockSize = 24; 
const board = [];
let score = 0;

// kahi báo âm thanh
let songBackground = document.getElementById("songBackground");
let songScore = document.getElementById("songScore");
let songGameOver = document.getElementById("songGameOver");
let songGameWin = document.getElementById("songGameWin");
let songBlockRotate = document.getElementById("songBlockRotate");
let songMove = document.getElementById("songMoveTettromino");

// Mảng các khối gạch
const tetrominoes = [
    {   // I
        shape: [
            [1, 1, 1, 1]
        ],
    },
    {   // J
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
    },
    {   // L
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
    },
    {   // O
        shape: [
            [1, 1],
            [1, 1]
        ],
    },
    {   // S
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
    },
    {   // T
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
    },
    {   // Z
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
    }
];

// Mảng chứa các màu có thể sử dụng cho Tetromino
const tetrominoColors = [
    '#F6F5F2', '#B3C8CF', '#FFD1E3', '#FDFF00', '#7743DB', '#FFEA20', '#9CAFAA',
    '#FFF3C7', '#D2D180', '#FFBE98', '#A5DD9B', '#F2C18D', '#BED1CF', '#88AB8E',
    '#D0BFFF', '#FBF0B2', '#7EAA92', '#DBC4F0', '#A4907C', '#9376E0', '#EA8FEA'
];


// Tạo bảng trống
for (let r = 0; r < boardHeight; r++)
{
    // Tạo một hàng mới với các ô trống
    board[r] = [];
    // Đặt mỗi ô trong hàng thành trống
    for (let c = 0; c < boardWidth; c++) {
        board[r][c] = '';
    }
}

// Tạo hàm randomTetromino để chọn ngẫu nhiên một khối gạch
function randomTetromino()
{
    // Chọn một khối gạch ngẫu nhiên từ mảng tetrominoes
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    // Lấy khối gạch ngẫu nhiên
    const randomTetromino = tetrominoes[randomIndex];
    // Chọn một màu ngẫu nhiên từ mảng tetrominoColors
    const randomColor = tetrominoColors[Math.floor(Math.random() * tetrominoColors.length)];
    // Trả về khối gạch ngẫu nhiên và màu ngẫu nhiên
    return {
        // Trả về hình dạng và màu của khối gạch ngẫu nhiên
        shape: randomTetromino.shape,
        color: randomColor // Gán màu ngẫu nhiên cho Tetromino
    };
}
// Tạo biến currentTetromino để lưu khối gạch hiện tại
let currentTetromino = randomTetromino();
currentTetromino.col = 3;
currentTetromino.row = 0;

// Tạo hàm drawBlock để vẽ từng khối nhỏ
function drawBlock(x, y, color)
{
    
    ctx.fillStyle = color || '#DBAFA0'; // Màu mặc định cho khối gạch
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize); // Vẽ khối gạch
    ctx.strokeStyle = '#3E3232'; // Màu viền khối gạch
    ctx.lineWidth = 2; // Độ rộng của viền
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize); // Vẽ viền khối gạch


}
// Tạo hàm drawTetromino để vẽ khối gạch
function drawTetromino() {
    const shape = currentTetromino.shape; // Lấy hình dạng của khối gạch
    let color = currentTetromino.color; // Lấy màu của khối gạch

    // Duyệt qua từng hàng và cột của khối gạch
    for (let r = 0; r < shape.length; r++) {
        // Duyệt qua từng ô của hàng
        for (let c = 0; c < shape[r].length; c++) {
            // Nếu ô đang xét là khối gạch
            if (shape[r][c]) {
                drawBlock(currentTetromino.col + c, currentTetromino.row + r, color);
            }
        }
    }

}

// Tạo hàm drawBoard để vẽ bảng chơi
function drawBoard()
{
    // Duyệt qua từng hàng và cột của bảng chơi
    for (let r = 0; r < boardHeight; r++)
    {
        // Duyệt qua từng ô của hàng
        for (let c = 0; c < boardWidth; c++)
        {
            // Vẽ từng khối nhỏ của bảng chơi
            drawBlock(c, r, board[r][c] || '#0C0C0C');
        }
    }
}

// Tạo hàm eraseTetromino để xóa khối gạch
function eraseTetromino()
{
    // Lấy hình dạng của khối gạch hiện tại
    const shape = currentTetromino.shape;

    // Duyệt qua từng hàng và cột của khối gạch
    for (let r = 0; r < shape.length; r++)
    {
        // Duyệt qua từng ô của hàng
        for (let c = 0; c < shape[r].length; c++)
        {
            // Nếu ô đang xét là khối gạch
            if (shape[r][c])
            {
                // Xóa khối gạch bằng cách vẽ một khối gạch trống
                drawBlock(currentTetromino.col + c, currentTetromino.row + r, '#0C0C0C');
            }
        }
    }
}

let lastLineClearTime = Date.now(); // Biến theo dõi thời gian cuối cùng một hàng được xóa
let decreaseRotationIntervalId; // Biến lưu trữ ID của setInterval
let increaseRotationTimeoutId; // Biến lưu trữ ID của setTimeout

// Hàm mới để kiểm tra và xóa hàng đầy
function clearFullLines()
{
    // Biến để lưu số hàng đã xóa
    let linesCleared = 0;
    // Duyệt qua từng hàng từ dưới lên trên
    for (let r = boardHeight - 1; r >= 0; r--)
    {
        // Biến để kiểm tra xem hàng đầy không
        let isFull = true;
        // Duyệt qua từng cột trong hàng
        for (let c = 0; c < boardWidth; c++)
        {
            // Nếu có một ô trống thì thoát khỏi vòng lặp
            if (board[r][c] === '')
            {
                // Đánh dấu hàng không đầy
                isFull = false;
                break;
            }
        }
        // Nếu hàng đầy thì xóa hàng và đẩy các hàng phía trên xuống
        if (isFull)
        {
            // Duyệt qua từng hàng phía trên hàng đầy
            for (let y = r; y > 0; y--)
            {
                // Duyệt qua từng cột trong hàng
                for (let c = 0; c < boardWidth; c++)
                {
                    // Di chuyển các hàng phía trên xuống một hàng
                    board[y][c] = board[y-1][c];
                }
            }

            // Đặt hàng đầu tiên thành trống
            for (let c = 0; c < boardWidth; c++) {
                board[0][c] = '';
            }

            // Tăng số hàng đã xóa
            linesCleared++;
            // Giảm chỉ số hàng xuống một để kiểm tra lại hàng vừa xóa
            r++;
        }
    }
    // Nếu có hàng nào được xóa
    if (linesCleared > 0)
    {
        songScore.play(); // Chơi âm thanh khi xóa hàng 
        // Cập nhật điểm số dựa trên số hàng đã xóa
        updateScore(linesCleared);
        // Cập nhật giao diện sau khi xóa hàng

        // kiểm tra xem đã đủ điểm để chiến thắng chưa
        checkWin();


        handleLineClear(); // Tạm dừng di chuyển của chướng ngại vật khi có hàng được xóa của lv 5

        // tạm dừng di chuyển của ma mị và quỷ dị khi có hàng được xóa của lv 6
        obstaclesPaused = true;
        pauseGhostObstacles();
    }
}

// Hàm để cập nhật điểm số
function updateScore(linesCleared)
{
    // Cập nhật điểm số dựa trên số hàng đã xóa
    score += linesCleared * 10;

    // Cập nhật điểm số trong DOM hoặc console, phụ thuộc vào cách bạn hiển thị điểm
    document.getElementById('score').innerText = score;

   
}

// Tạo hàm addToBoard để thêm khối gạch vào bảng
function addToBoard() {
    const shape = currentTetromino.shape;
    const row = currentTetromino.row;
    const col = currentTetromino.col; // Thêm dòng này để lấy giá trị cột

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                let boardRow = row + r;
                let boardCol = col + c;
                // Kiểm tra xem chỉ số có hợp lệ không trước khi gán giá trị
                if (boardRow >= 0 && boardRow < boardHeight && boardCol >= 0 && boardCol < boardWidth) {
                    board[boardRow][boardCol] = currentTetromino.color;
                } 
            }
        }
    }

    clearFullLines(); // Gọi hàm để kiểm tra và xóa hàng đầy
    drawGame(); // Cập nhật giao diện sau khi thêm khối gạch vào bảng
}

// Hàm xoay khối gạch
function rotateMatrix(matrix) {
    // Chuyển đổi hàng thành cột (transpose)
    const transposed = matrix[0].map((col, i) => matrix.map(row => row[i]));

    // Đảo ngược mỗi hàng để có được phiên bản xoay của ma trận
    const rotated = transposed.map(row => row.reverse());

    return rotated;
}

// Hàm xoay khối gạch 
function rotateTetromino()
{
    // Chơi âm thanh khi xoay khối gạch
    songMove.play(); // Chơi âm thanh khi di chuyển khối gạch
    const newShape = rotateMatrix(currentTetromino.shape);

    // Kiểm tra xem sau khi xoay, Tetromino có trong không gian hợp lệ không
    const isValideMove = newShape.every((row, r) => 
        // Kiểm tra từng ô của hàng
        row.every((cell, c) => 
            // Kiểm tra xem ô đang xét có phải là ô trống không hoặc có nằm trong không gian hợp lệ của bảng chơi không
            cell === 0 ||
            (currentTetromino.col + c >= 0 && 
            currentTetromino.col + c < boardWidth &&
            currentTetromino.row + r < boardHeight &&
            board[currentTetromino.row + r][currentTetromino.col + c] === '')
        )
    );

    // Nếu vị trí mới hợp lệ, xoay Tetromino
    if (isValideMove) { 
        eraseTetromino();
        currentTetromino.shape = newShape;
        drawTetromino();
        drawGame(); // Cập nhật giao diện sau khi xoay
    }
}

// Hàm di chuyển tetromino sang trái
function moveLeft()
{
    if (canMoveLeft())
    {
        eraseTetromino();
        currentTetromino.col--;
        drawTetromino();
        drawGame();
        songMove.play(); // Chơi âm thanh khi di chuyển khối gạch
    }
}

// Hàm di chuyển tetromino sang phải
function moveRight() {
    if (canMoveRight()) {
        eraseTetromino();
        currentTetromino.col++;
        drawTetromino();
        drawGame();
        songMove.play(); // Chơi âm thanh khi di chuyển khối gạch
    }
}

// Hàm di chuyển tetromino xuống dưới
function moveDown()
{
    // Kiểm tra xem khối gạch có thể di chuyển xuống không và không va chạm với chướng ngại vật ở cấp độ 5
    if (canMoveDown() && (currentLevel !== 5 || !checkCollisionWithObstacles())) {
        eraseTetromino();
        currentTetromino.row++;
        drawTetromino();
    }
    // Nếu không thể di chuyển xuống nữa, thêm khối gạch vào bảng
    else 
    {
        addToBoard();
      
        if (checkGameOver()) { // Kiểm tra xem trò chơi có kết thúc không
            gameOver(); // Nếu có, xử lý kết thúc game
            return; // Dừng hàm để không thực hiện các bước tiếp theo
            clearInterval(gameLoopIntervalId); // Dừng vòng lặp trò chơi
        }
        resetTetromino(); // Đặt lại khối gạch sau khi va chạm
        currentTetromino = randomTetromino(); // Lấy khối gạch mới sau khi va chạm
        // Đặt vị trí của khối gạch mới ở giữa trên cùng của bảng chơi
        currentTetromino.col = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
        // Đặt hàng của khối gạch mới ở hàng đầu tiên
        currentTetromino.row = 0;
    }
    drawGame(); // Cập nhật giao diện sau khi di chuyển xuống
}

// Tạo hàm moveTetromino để di chuyển khối gạch
function moveTetromino(direction)
{
    
    // Kiểm tra xem khối gạch có thể di chuyển xuống không
    if (!canMoveDown) {
        // Kết thúc hiệu ứng và đặt lại màu sắc của khối gạch
        isUnderEffect = false;
        drawTetromino();
    }
    // Di chuyển khối gạch theo hướng được chỉ định
    else
        if (direction === 'down') {
            moveDown();
        } else if (direction === 'left') {
            moveLeft();
        } else if (direction === 'right') {
            moveRight();
        }
}

// Tạo hàm canMoveDown để kiểm tra khả năng di chuyển xuống
function canMoveDown() {
    const shape = currentTetromino.shape;
    const col = currentTetromino.col; // Đảm bảo rằng col được khởi tạo và không phải là NaN
    const row = currentTetromino.row; // Đảm bảo rằng row được khởi tạo và không phải là NaN

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                let nextRow = row + r + 1;
                let nextCol = col + c;
                // Kiểm tra xem khối gạch có thể di chuyển xuống không
                if (nextRow >= boardHeight || nextCol < 0 || nextCol >= boardWidth || isNaN(nextRow) || isNaN(nextCol)) {
                    return false; // Không thể di chuyển xuống nữa hoặc chỉ số không hợp lệ
                }
                if (board[nextRow][nextCol]) {
                    return false; // Có một khối gạch ở vị trí tiếp theo
                }
            }
        }
    }
    return true; // Có thể di chuyển xuống
}
// Hàm kiểm tra khả năng di chuyển sang trái
function canMoveLeft() {
    const shape = currentTetromino.shape;
    const col = currentTetromino.col;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                if (col + c === 0 || board[currentTetromino.row + r][col + c - 1]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Hàm kiểm tra khả năng di chuyển sang phải
function canMoveRight() {
    const shape = currentTetromino.shape;
    const col = currentTetromino.col;

    // duyệt qua từng khối gạch
    for (let r = 0; r < shape.length; r++)
    {
        // duyệt qua từng hàng của khối gạch
        for (let c = 0; c < shape[r].length; c++)
        {
            // Nếu khối gạch đang xét là khối gạch
            if (shape[r][c])
            {
                // Nếu khối gạch đang xét nằm ở cột cuối cùng hoặc có khối gạch ở bên phải
                if (col + c === boardWidth - 1 || board[currentTetromino.row + r][col + c + 1]) {
                    return false; // Không thể di chuyển sang phải
                }
            }
        }
    }
    return true; // Có thể di chuyển sang phải
}

// lv2
// Hàm xử lý di chuyển ngẫu nhiên cho cấp độ 2
function startRandomMoves() {
    // Sử dụng Math.random() để quyết định di chuyển sang trái hoặc phải
    if (Math.random() < 0.5)
    {
        // Di chuyển sang trái nếu có thể
        if (canMoveLeft()) {
            moveTetromino('left');
        }
    }
    // Di chuyển sang phải nếu có thể
    else
    {
        if (canMoveRight()) {
            moveTetromino('right');
        }
    }
}

// Hàm để dừng di chuyển ngẫu nhiên
function stopRandomMoves() {
    clearInterval(randomMoveIntervalId);
    randomMoveIntervalId = null;
}

// hàm để tạo màu ngẫu nhiên
function getRandomColor() {
    const colors = [  '#4793AF', '#BF3131']; // Danh sách các màu bạn muốn sử dụng
    return colors[Math.floor(Math.random() * colors.length)];
}


// lv3
// Biến để theo dõi trạng thái của riseBoard
let enableRiseBoard = true;

// hàm để tạo ra một hàng mới từ dưới lên và trống 1 ô
function riseBoard() {
    if (!enableRiseBoard) {
        return; // Nếu enableRiseBoard là false, không thực hiện gì cả
    }

    // Tạo một hàng mới với màu ngẫu nhiên và một ô trống
    let newRow = Array(boardWidth).fill('').map(() => getRandomColor());
    // Đặt một ô trống ngẫu nhiên
    let emptyCellIndex = Math.floor(Math.random() * boardWidth);
    newRow[emptyCellIndex] = ''; // Đặt ô trống

    // Kiểm tra va chạm với khối gạch đang di chuyển
    let collision = currentTetromino.shape.some((row, dy) =>
    {
        // Duyệt qua từng ô của khối gạch
        return row.some((cell, dx) =>
        {
            // Nếu ô đang xét là khối gạch
            if (cell)
            {
                // Tính toán vị trí x, y của khối gạch
                let x = currentTetromino.col + dx;
                let y = currentTetromino.row + dy;
                // Kiểm tra xem khối gạch có nằm ngoài giới hạn dưới của bảng không
                if (y >= boardHeight - 1 || (board[y + 1] && board[y + 1][x] !== '')) {
                    return true;
                }
            }
            // Không có va chạm
            return false;
        });
    });

    if (collision) {
        // Xử lý va chạm, có thể là kết thúc trò chơi hoặc thêm khối gạch vào bảng
        addToBoard();
        currentTetromino = randomTetromino(); // Lấy khối gạch mới sau khi va chạm
        // Kiểm tra xem có phải game over không
        if (checkGameOver()) {
            gameOver();
            return;
        }
    } else {
        // Đẩy bảng chơi lên trên một hàng
        for (let r = 0; r < boardHeight - 1; r++) {
            board[r] = board[r + 1];
        }
        // Thêm hàng mới vào cuối bảng chơi
        board[boardHeight - 1] = newRow;
    }

    // Cập nhật giao diện sau khi thêm hàng mới
    drawGame();
}

// Hàm để bắt đầu hoặc tiếp tục riseBoard cho cấp độ 3
function startRiseBoard() {
    riseBoardIntervalId = setInterval(riseBoard, 6000);
}
// Hàm để dừng riseBoard
function stopRiseBoard() {
    clearInterval(riseBoardIntervalId);
    riseBoardIntervalId = null;
}

// lv4 
// Biến toàn cục để theo dõi số lần xoay cho cấp độ 4
let rotationCount = 0;
const maxRotations = 2; // Giới hạn số lần xoay

// Hàm để xoay Tetromino với giới hạn số lần xoay cho cấp độ 4
function rotateTetrominoWithLimit()
{

    if (rotationCount < maxRotations) {
        // Tạo hình dạng mới sau khi xoay
        const newShape = rotateMatrix(currentTetromino.shape);
        
        // Kiểm tra xem hình dạng mới có hợp lệ không (không va chạm với khối gạch khác hoặc nằm ngoài bảng)
        // Duyệt qua từng ô của hình dạng mới để kiểm tra
        // Nếu ô đang xét là ô trống hoặc nằm trong không gian hợp lệ của bảng chơi
        const isValidMove = newShape.every((row, r) => 
            // Kiểm tra từng ô của hàng mới sau khi xoay hình dạng của Tetromino
            row.every((cell, c) => 
                cell === 0 ||
                (currentTetromino.col + c >= 0 && 
                currentTetromino.col + c < boardWidth &&
                currentTetromino.row + r < boardHeight &&
                board[currentTetromino.row + r][currentTetromino.col + c] === '')
            )
        );

        // Nếu hình dạng mới hợp lệ, cập nhật hình dạng của Tetromino và tăng số lần xoay
        if (isValidMove) {
            eraseTetromino(); // Xóa Tetromino cũ trên bảng
            currentTetromino.shape = newShape; // Cập nhật hình dạng mới
            drawTetromino(); // Vẽ Tetromino mới sau khi xoay
            rotationCount++; // Tăng số lần xoay
        }
    }
    else {
        // Phát âm thanh thông báo khi số lần xoay đã đạt tối đa
        songBlockRotate.play();
    }
    return;   // Không thực hiện gì nếu không thể xoay  
}

// Hàm tạo khối gạch mới và đặt lại số lần xoay
function resetTetromino()
{
    // Tạo khối gạch mới
    currentTetromino = randomTetromino();
    // Đặt vị trí của khối gạch mới ở giữa trên cùng của bảng chơi
    currentTetromino.col = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
    currentTetromino.row = 0;
    rotationCount = 0; // Đặt lại số lần xoay cho khối gạch mới
}

// lv5
// khởi tạo vị trí cho khối gạch chữ T ở giũa màn hình
let obstacles = [
    // Khối gạch chướng ngại vật 1
    { position: { x: 7, y: 3 }, direction: 'right', shape: [[1]] },
    // Khối gạch chướng ngại vật 2
    { position: { x: 6, y: 2 }, direction: 'left', shape: [[1]] }
];

// vẽ khối gachj chướng ngại vật
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const shape = [
            [1]
        ];  // Giả định rằng mọi khối T đều giống nhau
        const color = '#FF0000'; // Màu đỏ cho khối gạch chướng ngại vật
        shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    // Vẽ mỗi ô của chướng ngại vật với màu đỏ
                    drawBlock(obstacle.position.x + x, obstacle.position.y + y, color);
                }
            });
        });
    });
}

// cập nhật ví trí của khối gạch chướng ngại vật sau s time
function updateObstacles() {
    if (!obstaclesPaused) {
        obstacles.forEach(obstacle => {
            // Dự định vị trí tiếp theo của chướng ngại vật để kiểm tra xem có va chạm nào không
            let potentialX = obstacle.position.x + (obstacle.direction === 'right' ? 1 : -1);
            
            // Kiểm tra xem chướng ngại vật có va chạm với các khối tĩnh trên bảng
            let hasCollision = obstacle.shape.some((row, offsetY) => {
                return row.some((cell, offsetX) => {
                    if (cell) {
                        let x = potentialX + offsetX;
                        let y = obstacle.position.y + offsetY;
                        // Kiểm tra xem ô có nằm ngoài giới hạn của bảng chơi không
                        if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) {
                            return true;
                        }
                        // Xảy ra va chạm nếu ô đã được chiếm đóng
                        if (board[y][x] !== '') {
                            return true;
                        }
                    }
                    return false;
                });
            });

            // Nếu có va chạm thì kích hoạt game over
            if (hasCollision) {
                gameOver();
            } else {
                // Cập nhật vị trí chướng ngại vật nếu không có va chạm
                obstacle.position.x = potentialX;
                
                // Kiểm tra và đổi hướng nếu cần
                if(obstacle.position.x <= 0 || obstacle.position.x + obstacle.shape[0].length >= boardWidth) {
                    obstacle.direction = (obstacle.direction === 'right' ? 'left' : 'right');
                }
            }
        });
    }
}

// Hàm kiểm tra va chạm giữa khối gạch và chướng ngại vật ở cấp độ 5
function checkCollisionWithObstacles() {
    // Duyệt qua từng ô của Tetromino
    for (let r = 0; r < currentTetromino.shape.length; r++) {
        for (let c = 0; c < currentTetromino.shape[r].length; c++) {
            if (currentTetromino.shape[r][c]) {
                // Tính toán vị trí x, y của Tetromino
                let tetrominoX = currentTetromino.col + c;
                let tetrominoY = currentTetromino.row + r;

                // Duyệt qua từng chướng ngại vật
                for (let obstacle of obstacles) {
                    // Tính toán vị trí x, y của chướng ngại vật
                    let obstacleX = obstacle.position.x;
                    let obstacleY = obstacle.position.y;

                    // Kiểm tra xem có va chạm không
                    if (tetrominoX === obstacleX && tetrominoY === obstacleY) {
                        gameOver(); // Kết thúc trò chơi nếu có va chạm
                        return true; // Có va chạm
                    }
                }
            }
        }
    }
    return false; // Không có va chạm
}

// Biến để theo dõi trạng thái tạm dừng của chướng ngại vật
let obstaclesPaused = false;

// tạm ngừng di chuyển của chướng ngại vật
function handleLineClear() {
    obstaclesPaused = true;
    setTimeout(() => {
        obstaclesPaused = false;
    }, 5000);
}

// lv6
// khởi tạo mảng chứa các chướng ngại vật ma mị và quỷ dị
let ghostObstacles = [];
let ghostObstacleCount = 1;

// tạo ra các chướng ngại vật ma mị và quỷ dị
function createGhostObstacles() {
    let positionX = Math.floor(boardWidth / 2); // Đặt ở giữa bảng

    for (let i = 0; i < 3; i++) {
        // Đảm bảo rằng các ma mị không nằm cùng hàng hoặc cùng cột
        while (ghostObstacles.some(obstacle => obstacle.position.x === positionX || obstacle.position.y === boardHeight - 1 - i)) {
            positionX = Math.floor(Math.random() * boardWidth);
        }
        // Thêm ma mị vào mảng
        ghostObstacles.push({
            position: { x: positionX, y: boardHeight - 5 - i }, // Đặt ở dưới cùng của bảng
            shape: [[1]] // Hình dạng đơn giản của chướng ngại vật
        });
    }
}



// vẽ chướng ngại vật ma mị và quỷ dị
function drawGhostObstacles() {
    ghostObstacles.forEach(ghostObstacle => {
        const shape = ghostObstacle.shape;
        let color = '#FF00FF'; // Màu hồng cho chướng ngại vật ma mị và quỷ dị

        // Thay đổi màu sắc để tạo hiệu ứng phát sáng
        let glow = Math.floor(Math.sin(Date.now() / 200) * 127 + 128).toString(16);
        // Màu sắc phát sáng
        color = '#' + glow + '00' + glow;

        // Vẽ chướng ngại vật ma mị và quỷ dị
        shape.forEach((row, y) =>
        {
            // Duyệt qua từng ô của hàng
            row.forEach((cell, x) => {
                if (cell) {
                    // Vẽ mỗi ô của chướng ngại vật với màu hồng
                    drawBlock(ghostObstacle.position.x + x, ghostObstacle.position.y + y, color);
                }
            });
        });
    });
}


// cập nhật vị trí của chướng ngại vật ma mị và quỷ dị
function updateGhostObstacles() {
    if (!ghostObstaclesPaused) {
        let allGhostsExited = true;

        for (let i = 0; i < ghostObstacles.length; i++) {
            ghostObstacles[i].position.y--;

            if (ghostObstacles[i].position.y >= 0) {
                allGhostsExited = false; // Có ít nhất một ma mị vẫn còn trong bảng
            }
        }

        // Xóa ma mị đã ra khỏi bảng
        ghostObstacles = ghostObstacles.filter(ghostObstacle => ghostObstacle.position.y >= 0);

        // Kiểm tra va chạm sau khi di chuyển ma mị
        if (checkCollisionWithGhostObstacles()) {
            gameOver();
            return;
        }

        // Nếu tất cả ma mị đã ra khỏi bảng, tạo đợt ma mị mới
        if (allGhostsExited && ghostObstacles.length === 0) {
            createGhostObstacles();
        }
    }
}


// Kiểm tra va chạm giữa khối gạch và chướng ngại vật ma mị và quỷ dị
function checkCollisionWithGhostObstacles()
{
    // Duyệt qua từng ô của Tetromino
    for (let r = 0; r < currentTetromino.shape.length; r++)
    {
        for (let c = 0; c < currentTetromino.shape[r].length; c++)
        {
            if (currentTetromino.shape[r][c])
            {
                // Tính toán vị trí x, y của Tetromino
                let tetrominoX = currentTetromino.col + c;
                let tetrominoY = currentTetromino.row + r;
                
                // Duyệt qua từng chướng ngại vật ma mị và quỷ dị
                for (let ghostObstacle of ghostObstacles)
                {
                    // Tính toán vị trí x, y của chướng ngại vật
                    let ghostObstacleX = ghostObstacle.position.x;
                    let ghostObstacleY = ghostObstacle.position.y;
                    
                    // Kiểm tra xem có va chạm không
                    if (tetrominoX === ghostObstacleX && tetrominoY === ghostObstacleY)
                    {
                        gameOver(); // Kết thúc trò chơi nếu có va chạm
                        return true; // Có va chạm
                    }
                }
            }
        }
    }
    return false; // Không có va chạm
}

// biến để theo dõi trạng thái tạm dừng của chướng ngại vật ma mị và quỷ dị
let ghostObstaclesPaused = false;
let ghostObstacleUpdateInterval = 300;

// Tạm dừng di chuyển của chướng ngại vật ma mị và quỷ dị
function pauseGhostObstacles() {
    ghostObstaclesPaused = true;
    setTimeout(() => {
        ghostObstaclesPaused = false;
        // Tăng tốc độ di chuyển của ma mị sau khi tạm dừng
        ghostObstacleUpdateInterval = 200; // Giảm thời gian cập nhật để tăng tốc độ
        updateGhostObstacles(); // Gọi lại để tiếp tục cập nhật vị trí
    }, 2000); // Tạm dừng trong 2 giây
}

// Đặt lại tốc độ cập nhật ma mị khi bắt đầu cấp độ hoặc sau khi game over
function resetGhostObstacleSpeed() {
    ghostObstacleUpdateInterval = 300; // Đặt lại tốc độ cập nhật mặc định
}

// Đặt lại số lượng chướng ngại vật khi bắt đầu cấp độ mới
function resetGhostObstacleCount() {
    ghostObstacleCount = 1; // Đặt lại số lượng chướng ngại vật ban đầu
}

// Bắt đầu hoặc tiếp tục cập nhật vị trí ma mị
function startGhostObstaclesMovement() {
    clearInterval(ghostObstacleInterval); // Dừng cập nhật trước đó nếu có
    ghostObstacleInterval = setInterval(updateGhostObstacles, ghostObstacleUpdateInterval);
}

// Biến để lưu trữ các interval của các hàm setInterval của từng cấp độ
let gameLoopIntervalId; // Biến để lưu trữ ID của setInterval của lv 1
let randomMoveIntervalId; // Biến để lưu trữ ID của setInterval của lv 2
let riseBoardIntervalId; // Biến để lưu trữ ID của setInterval của lv 3
let obstacleMoveInterval; // Biến để lưu trữ ID của setInterval của lv 5
let ghostObstacleInterval; // Biến để lưu trữ ID của setInterval của lv 6

// biến để lưu cấp độ hiện tại, mặc định là 1
let currentLevel = 1;

// Hàm startGame để bắt đầu trò chơi
function startGame(selectedLevel)
{
    // chạy nhạc nền khi bắt đầu game
    songBackground.play();
    // Dừng tất cả các intervals trước khi bắt đầu một cấp độ mới
    clearInterval(gameLoopIntervalId);
    clearInterval(randomMoveIntervalId);
    clearInterval(riseBoardIntervalId);
    clearInterval(obstacleMoveInterval);
    clearInterval(ghostObstacleInterval);


    currentLevel = selectedLevel; // Lưu cấp độ hiện tại

    resetGame(); // Đặt lại trò chơi trước khi bắt đầu một cấp độ mới
    eraseTetromino();

    // Đặt lại điểm số về 0
    score = 0;
    document.getElementById('score').innerText = score;
    // Đặt trạng thái game thành đang chạy và không tạm dừng
    gamePaused = false;
    // Cập nhật văn bản nút thành "Pause" khi bắt đầu game mới
    pauseContinueButton.textContent = 'Pause';


    if (selectedLevel === 6)
    {
        /// đặt lại số ma mị và quỷ dị
        ghostObstacles = [];
        ghostObstacleCount = 1;
        createGhostObstacles();

    }

    // Đặt lại biến rotationCount nếu cấp độ là 4
    if (currentLevel === 4)
    {
        // Đặt lại số lần xoay cho khối gạch mới
        rotationCount = 0;

        // Nếu đã có setInterval cho việc giảm số lần xoay, hãy dừng nó trước khi tạo mới
        clearInterval(decreaseRotationIntervalId);
        
     
    }
     // Đặt lại kích thước bảng chơi về mặc định
     boardWidth = 10;
     boardHeight = 20;
    
    // đặt lại kích thước của canvas
    canvas.width = boardWidth * blockSize;
    canvas.height = boardHeight * blockSize;
    
    // Tạo bảng trống mới
    drawBoard();

    // Khởi tạo game dựa trên cấp độ được chọn
    switch(selectedLevel) {
        case 1:
            // Khởi tạo game cho cấp độ 1
            gameLoopIntervalId = setInterval(function() {
                moveTetromino('down');
            }, 500);
            break;
        case 2:
            // Khởi tạo game cho cấp độ 2
            gameLoopIntervalId = setInterval(function() {
                moveTetromino('down');
            }, 400);
            randomMoveIntervalId = setInterval(startRandomMoves, 1000);
            break;
        case 3:
            // Khởi tạo game cho cấp độ 3
            gameLoopIntervalId = setInterval(function() {
                moveTetromino('down');
            }, 400);
            riseBoardIntervalId = setInterval(riseBoard, 5000);
            break;
        case 4:
              // Khởi tạo game cho cấp độ 4
              gameLoopIntervalId = setInterval(function() {
                moveTetromino('down');
            }, 300);
            rotationCount = 0; // Đặt lại số lần xoay cho khối gạch mới
            // khi ở lv4 làm cho bảng game rộng hơn
            boardWidth = 12;
            boardHeight = 24;
            // Tạo bảng trống mới
            for (let r = 0; r < boardHeight; r++) {
                board[r] = [];
                for (let c = 0; c < boardWidth; c++) {
                    board[r][c] = '';
                }
            }
            canvas.width = boardWidth * blockSize;
            canvas.height = boardHeight * blockSize;
            drawBoard();
            break;
        case 5:
            // Khởi tạo game cho cấp độ 5
            obstacles = [
                { position: { x: 3, y: 7 }, direction: 'right', shape: [[1]] }, // Thêm hình dạng của chướng ngại vật
                { position: { x: 6, y: 10 }, direction: 'left', shape: [[1]] }  // Thêm hình dạng của chướng ngại vật
            ];
            // Đặt vị trí xuất hiện ban đầu cho Tetromino
            currentTetromino.col = Math.floor(boardWidth / 2) - 2;
            currentTetromino.row = 0;
            gameLoopIntervalId = setInterval(function ()
            {
                moveTetromino('down');
                drawGame(); // Vẽ cả trò chơi, bao gồm cả chướng ngại vật
                drawObstacles(); // Vẽ chướng ngại vật
                checkCollisionWithObstacles(); // Kiểm tra va chạm giữa Tetromino và chướng ngại vật
            }, 400);
            obstacleMoveInterval = setInterval(updateObstacles, 300); // Cập nhật vị trí chướng ngại vật mỗi giây
            boardWidth = 12;
            boardHeight = 24;
            // Tạo bảng trống mới
            for (let r = 0; r < boardHeight; r++) {
                board[r] = [];
                for (let c = 0; c < boardWidth; c++) {
                    board[r][c] = '';
                }
            }
            canvas.width = boardWidth * blockSize;
            canvas.height = boardHeight * blockSize;
            drawBoard();
            break;
        case 6:
            // Đặt vị trí xuất hiện ban đầu cho Tetromino
            currentTetromino.col = Math.floor(boardWidth / 2) - 2;
            currentTetromino.row = 0;

            gameLoopIntervalId = setInterval(function ()
            {
                moveTetromino('down');
                drawGame(); // Vẽ cả trò chơi, bao gồm cả chướng ngại vật
                drawGhostObstacles(); // Vẽ chướng ngại vật ma mị và quỷ dị
                checkCollisionWithGhostObstacles(); // Kiểm tra va chạm giữa Tetromino và chướng ngại vật
            }, 400);
            ghostObstacleInterval = setInterval(updateGhostObstacles, 300); // Cập nhật vị trí chướng ngại vật mỗi giây
            boardWidth = 12;
            boardHeight = 24;
            // Tạo bảng trống mới
            for (let r = 0; r < boardHeight; r++) {
                board[r] = [];
                for (let c = 0; c < boardWidth; c++) {
                    board[r][c] = '';
                }
            }
            canvas.width = boardWidth * blockSize;
            canvas.height = boardHeight * blockSize;
            drawBoard();
            break;
        default:
            console.error('Invalid level selected');
            return; // Dừng hàm nếu cấp độ không hợp lệ
    }

    gameRunning = true; // Đặt trạng thái trò chơi thành đang chạy
    drawGame(); // Vẽ trò chơi
}

// Tạo biến gameRunning để kiểm tra trạng thái của game
let gameRunning = false;

// Tạo hàm drawGame để vẽ trò chơi
function drawGame() {
    drawBoard();
    drawTetromino();
    // Vẽ các phần của trò chơi dựa trên cấp độ hiện tại của game 
    switch (currentLevel)
    {
        case 5:
            drawObstacles();
            break;
        case 6:
            drawGhostObstacles();
            break;
    }
        
}

// Hàm resetGame để đặt lại trò chơi
function resetGame() {
    // Đặt lại bảng chơi và các biến trạng thái khác
    board.forEach(row => row.fill(''));
    // Tạo khối gạch mới
    currentTetromino = randomTetromino();
    score = 0;
    // Đặt lại số lần xoay cho cấp độ 4
    rotationCount = 0;

    // đặt lai số con ma mị và quỷ dị cho cấp độ 6
    ghostObstacles = [];
    // Có thể cần vẽ lại bảng chơi trống hoặc thiết lập lại giao diện
    drawBoard();
    drawGame();
}
// Vẽ trò chơi lần đầu tiên
drawGame();

// Biến để lưu trạng thái của vòng lặp game
let gameLoop;

// hàm để kết thúc game
function gameOver()
{   
    songGameOver.play();
     // dừng chạy nhạc nền khi tạm dừng game
     songBackground.pause();
    // Dừng tất cả các hành động trò chơi
    clearInterval(gameLoopIntervalId);
    gameLoopIntervalId = null;
    // Dừng di chuyển ngẫu nhiên nếu có
    clearTimeout(increaseRotationTimeoutId);
    increaseRotationTimeoutId = null;
    // Dừng các hành động riêng biệt cho từng cấp độ
    clearTimeout(decreaseRotationIntervalId);

    // dừng cá hành đông ở lv5
    clearInterval(obstacleMoveInterval);
    // Dừng riseBoard nếu có
    stopRiseBoard();

    // dừng các hành động ở lv6
    clearInterval(ghostObstacleInterval);
    
 
    gameRunning = false;

    // Cập nhật điểm số và hiển thị thông báo game over
    document.getElementById('gameOverScore').innerText = score;
    document.getElementById('gameOverMessage').style.display = 'flex'; // Sử dụng 'flex' nếu bạn muốn sử dụng flexbox
}


// hàm để kiểm tra xem game đã kết thúc chưa
function checkGameOver() {
    // Kiểm tra xem hàng đầu tiên có bất kỳ khối gạch nào không
    for (let c = 0; c < boardWidth; c++) {
        if (board[0][c] !== '') {
            return true; // Game over nếu hàng đầu tiên không trống
        }
    }
    return false; // Không phải game over nếu hàng đầu tiên trống
}

// thiết lập số điểm cần đạt ở mỗi cấp độ để chiến thắng
const levelTargets = {
    1: 30,
    2: 30,
    3: 30,
    4: 30,
    5: 30,
    6: 20
};

// kiểm tra chiến thắng ở mỗi cấp độ 
function checkWin()
{
    // Kiểm tra xem điểm số hiện tại có đạt mục tiêu của cấp độ không
    if (score >= levelTargets[currentLevel])
    {
        gameWin();
    }
}

// hàm để kết thúc game khi chiến thắng
function gameWin()
{
    songGameWin.play();
     // dừng chạy nhạc nền khi tạm dừng game
     songBackground.pause();
    // Dừng tất cả các hành động trò chơi
    gameRunning = false;
     
    clearInterval(gameLoopIntervalId);
    clearInterval(randomMoveIntervalId);
    clearInterval(riseBoardIntervalId);
    clearInterval(obstacleMoveInterval);
    clearInterval(ghostObstacleInterval);

    // Hiển thị thông báo chiến thắng
    document.getElementById('gameWinMessage').style.display = 'flex'; // Sử dụng 'flex' nếu bạn muốn sử dụng flexbox


}
    

let gamePaused = false;

// Hàm tạm dừng game
function pauseGame() {
    if (!gamePaused)
    {
        // dừng chạy nhạc nền khi tạm dừng game
        songBackground.pause();
        // Dừng game nếu hiện tại không ở trạng thái paused
        clearInterval(gameLoopIntervalId); // Dừng vòng lặp trò chơi cho cấp độ 1 
        clearInterval(randomMoveIntervalId); // Dừng di chuyển ngẫu nhiên cho cấp độ 2 
        clearInterval(riseBoardIntervalId); // Dừng riseBoard cho cấp độ 3 
        clearInterval(decreaseRotationIntervalId); // Dừng giảm số lần xoay cho cấp độ 4
        clearInterval(obstacleMoveInterval); // Dừng di chuyển của chướng ngại vật cho cấp độ 5
        clearInterval(ghostObstacleInterval); // Dừng di chuyển của chướng ngại vật ma mị và quỷ dị của cấp độ 6
        gameRunning = false;
        gamePaused = true;
        pauseContinueButton.textContent = 'Continue'; // Thay đổi văn bản nút thành "Continue"
    }
}

// Hàm tiếp tục game
function continueGame()
{
    if (gamePaused)
    {
        // tiếp tục chạy nhạc nền khi tiếp tục game
        songBackground.play();
        gamePaused = false;
        gameRunning = true;
        // Khởi động lại các hàm setInterval dựa trên cấp độ hiện tại
        switch (currentLevel)
        {
            case 1:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 500);
                break;
            case 2:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 400);
                randomMoveIntervalId = setInterval(startRandomMoves, 1000);
                break;
            case 3:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 400);
                riseBoardIntervalId = setInterval(riseBoard, 5000);
                break;
            case 4:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 300);
                break;
            case 5:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 300);
                break;
            case 6:
                gameLoopIntervalId = setInterval(function ()
                {
                    moveTetromino('down');
                }, 300);
                // Bắt đầu hoặc tiếp tục cập nhật vị trí ma mị
                startGhostObstaclesMovement();

                break;
            default:
                return; // Dừng hàm nếu cấp độ không hợp lệ
        }
        pauseContinueButton.textContent = 'Pause'; // Thay đổi văn bản nút thành "Pause"
    }
}

// Xử lý sự kiện bàn phím
document.addEventListener('keydown', function (e)
{
    if (gameRunning) {
        // Kiểm tra nếu cấp độ hiện tại là 4 để đảo ngược điều khiển
        if (currentLevel === 4) {
            switch (e.key) {
                case 'ArrowLeft':
                    // Di chuyển sang phải thay vì sang trái
                    moveTetromino('right');
                    songMove.play();
                    break;
                case 'ArrowRight':
                    // Di chuyển sang trái thay vì sang phải
                    moveTetromino('left');
                    break;
                case 'ArrowUp':
                    // Nếu ở cấp độ 4, hãy sử dụng hàm xoay có giới hạn số lần
                    rotateTetrominoWithLimit();
                    break;
                case 'ArrowDown':
                    // Nếu ở cấp độ 4, hãy thực hiện hard drop
                    hardDrop();
                    break;
            }
        } else {
            // Xử lý điều khiển bình thường cho các cấp độ khác
            switch (e.key) {
                case 'ArrowUp':
                    rotateTetromino();
                    break;
                case 'ArrowDown':
                    moveTetromino('down');
                    break;
                case 'ArrowLeft':
                    moveTetromino('left');
                    break;
                case 'ArrowRight':
                    moveTetromino('right');
                    break;
            }
        }
    }
});
// Hàm hard drop để di chuyển Tetromino xuống dưới cùng ngay lập tức
function hardDrop() {
    // Di chuyển Tetromino xuống dưới cùng ngay lập tức và kiểm tra va chạm với các khối gạch khác 
    while (canMoveDown() && (currentLevel !== 5 || !checkCollisionWithObstacles()) ) {
        currentTetromino.row++;
    }
    // Kiểm tra va chạm với chướng ngại vật ma mị ở cấp độ 6 trước khi thêm Tetromino vào bảng
    if (currentLevel === 6 && checkCollisionWithGhostObstacles())
    {
        gameOver();
        return;
    }
    
    // Thêm Tetromino vào bảng
    addToBoard();
    
    // Kiểm tra game over
    if (checkGameOver()) {
        gameOver();
    } else {
        // Chuẩn bị Tetromino mới
        currentTetromino = randomTetromino();
        currentTetromino.col = Math.floor(boardWidth / 2) - Math.floor(currentTetromino.shape[0].length / 2);
        currentTetromino.row = 0;
        rotationCount = 0; // Đặt lại số lần xoay cho Tetromino mới
    }
    
    // Vẽ trạng thái game
    drawGame();
}

// Xử lý sự kiện click cho nút "Pause/Continue"
const pauseContinueButton = document.getElementById('pauseContinueButton');
// Gắn sự kiện click vào nút "Pause/Continue"
pauseContinueButton.addEventListener('click', function ()
{
    if (gameRunning) {
        pauseGame();
    } else {
        continueGame();
    }
});

// Lấy tất cả các nút level
const levelButtons = document.querySelectorAll('.level');

// Gắn sự kiện click vào từng nút level
levelButtons.forEach(button => {
    button.addEventListener('click', function ()
    {
         // Ẩn thông báo game over nếu nó đang hiển thị
        document.getElementById('gameOverMessage').style.display = 'none';
        // ẩn thông báo game win nếu nó đang hiển thị
        document.getElementById('gameWinMessage').style.display = 'none';
        // Gọi hàm startGame với cấp độ tương ứng khi nút được nhấp
        startGame(parseInt(this.value));

        // Xóa lớp 'active' từ tất cả các nút trước
        levelButtons.forEach(btn => btn.classList.remove('active'));

          // Thêm lớp 'active' cho nút được click
        this.classList.add('active');

         // Ẩn tất cả thông tin level
         const infoDivs = document.querySelectorAll('.infoLevel1, .infoLevel2, .infoLevel3, .infoLevel4, .infoLevel5, .infoLevel6');
         infoDivs.forEach(div => div.style.display = 'none');
 
         // Hiển thị thông tin level tương ứng
         const infoDiv = document.querySelector('.infoLevel' + this.value);
         infoDiv.style.display = 'block';
    });
});


// Xử lý sự kiện click cho nút "play again " khi game Over
document.getElementById('restartButtonGameOver').addEventListener('click', function ()
{
    // Ẩn thông báo game over
    document.getElementById('gameOverMessage').style.display = 'none';
    // ẩn thông báo game win
    score = 0;
    document.getElementById('score').innerText = score;
    // Bắt đầu trò chơi mới ở cấp độ hiện tại
    startGame(currentLevel);
});

// Xử lý sự kiện click cho nút "play again " khi game win
document.getElementById('restartButtonGameWin').addEventListener('click', function ()
{
    // Ẩn thông báo game win
    document.getElementById('gameWinMessage').style.display = 'none';
    // ẩn thông báo game win
    // Đặt lại điểm số và các biến trạng thái khác nếu cần
    score = 0;
    // Bắt đầu trò chơi mới ở cấp độ hiện tại
    startGame(currentLevel);
});

document.getElementById('infoButton').addEventListener('click', function() {
    var infoDiv = document.querySelector('.info');
    if (infoDiv.style.display === 'none' || infoDiv.style.display === '') {
        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
});


// xử lý nút mute sound 
document.getElementById('muteSound').addEventListener('click', function() {
    songBackground.muted = !songBackground.muted;
    songMove.muted = !songMove.muted;
    songGameOver.muted = !songGameOver.muted;
    songGameWin.muted = !songGameWin.muted;
});
