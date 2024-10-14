const GameDifficulty = [20, 50, 70];

//image gallery
document.querySelectorAll('#image_gallery .thumbnail').forEach(thumb => {
    thumb.addEventListener('click', function() {
        // Remove active class from all thumbnails
        document.querySelectorAll('#image_gallery .thumbnail').forEach(t => t.classList.remove('active'));
        // Add active class to clicked thumbnail
        this.classList.add('active');
        // Change the puzzle image
        game.changeImage(this.dataset.image);
    });
});

// class PuzzleState {
//     constructor(board, emptyPos, g, h, parent) {
//         this.board = board;
//         this.emptyPos = emptyPos;
//         this.g = g;
//         this.h = h;
//         this.f = g + h;
//         this.parent = parent;
//     }
// }

class Game {
    difficulty;//difficulty based on GameDifficulty array
    cols = 3;//how many colomns
    rows = 3;//how many rows
    count;//cols*rows
    blocks;//the html elements with className="puzzle_block"
    emptyBlockCoords = [2, 2];//the coordinates of the empty block
    indexes = []; //keeps track of the order of the blocks
    moveCount = 0; //

    constructor(difficultyLevel = 1) {
        this.difficulty = GameDifficulty[difficultyLevel - 1];
        this.count = this.cols * this.rows;
        this.blocks = document.getElementsByClassName("puzzle_block");//grab the blocks
        this.init();
        let moveCounterElement = document.createElement('div');
        moveCounterElement.id = 'move-counter';
        moveCounterElement.textContent = 'MOVES: 0';
        document.body.appendChild(moveCounterElement);

        this.changeImage('squirrel'); // Set gambar default
    }

    init() {//position each block in its proper position
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let blockIdx = x + y * this.cols;
                if (blockIdx + 1 >= this.count) break;
                let block = this.blocks[blockIdx];
                this.positionBlockAtCoord(blockIdx, x, y);
                block.addEventListener('click', (e) => this.onClickOnBlock(blockIdx));
                this.indexes.push(blockIdx);
            }
        }
        this.indexes.push(this.count - 1);
        this.randomize(this.difficulty);
    }

    randomize(iterationCount) {//move a random block (x iterationCount)
        for (let i = 0; i < iterationCount; i++) {
            let randomBlockIdx = Math.floor(Math.random() * (this.count - 1));
            let moved = this.moveBlock(randomBlockIdx);
            if (!moved) i--;
        }
    }

    moveBlock(blockIdx) {//moves a block and return true if the block has moved
        let block = this.blocks[blockIdx];
        let blockCoords = this.canMoveBlock(block);
        if (blockCoords != null) {
            this.positionBlockAtCoord(blockIdx, this.emptyBlockCoords[0], this.emptyBlockCoords[1]);
            this.indexes[this.emptyBlockCoords[0] + this.emptyBlockCoords[1] * this.cols] = this.indexes[blockCoords[0] + blockCoords[1] * this.cols];
            this.emptyBlockCoords[0] = blockCoords[0];
            this.emptyBlockCoords[1] = blockCoords[1];
            return true;
        }
        return false;
    }
    canMoveBlock(block) {//return the block coordinates if he can move else return null
        let blockPos = [parseInt(block.style.left), parseInt(block.style.top)];
        let blockWidth = block.clientWidth;
        let blockCoords = [blockPos[0] / blockWidth, blockPos[1] / blockWidth];
        let diff = [Math.abs(blockCoords[0] - this.emptyBlockCoords[0]), Math.abs(blockCoords[1] - this.emptyBlockCoords[1])];
        let canMove = (diff[0] == 1 && diff[1] == 0) || (diff[0] == 0 && diff[1] == 1);
        if (canMove) return blockCoords;
        else return null;
    }

    positionBlockAtCoord(blockIdx, x, y) {//position the block at a certain coordinates
        let block = this.blocks[blockIdx];
        block.style.left = (x * block.clientWidth) + "px";
        block.style.top = (y * block.clientWidth) + "px";
    }

    onClickOnBlock(blockIdx) {//try move block and check if puzzle was solved
        if (this.moveBlock(blockIdx)) {
            this.incrementMoveCount();
            if (this.checkPuzzleSolved()) {
                setTimeout(() => alert("Puzzle Solved in " + this.moveCount + " moves!"), 600);
            }
        }

    }

    checkPuzzleSolved() {//return if puzzle was solved
        for (let i = 0; i < this.indexes.length; i++) {
            //console.log(this.indexes[i],i);
            if (i == this.emptyBlockCoords[0] + this.emptyBlockCoords[1] * this.cols) continue;
            if (this.indexes[i] != i) return false;
        }
        return true;
    }

    setDifficulty(difficultyLevel) {//set difficulty
        this.difficulty = GameDifficulty[difficultyLevel - 1];
        this.randomize(this.difficulty);
        this.moveCount = 0;
        this.updateMoveCountDisplay();
    }

    incrementMoveCount() {
        this.moveCount++;
        this.updateMoveCountDisplay();
    }

    updateMoveCountDisplay() {
        document.getElementById('move-counter').textContent = "MOVES: " + this.moveCount;
    }

    //image change
    changeImage(imagePrefix) {
        for (let i = 0; i < this.blocks.length; i++) {
            let img = this.blocks[i].querySelector('img');
            img.src = `assets/${imagePrefix}-${(i + 1).toString().padStart(2, '0')}.png`;
        }
        // Reset move counter
        this.resetMoveCounter();
        // Randomize puzzle after changing image
        this.randomize(this.difficulty);
    }

    resetMoveCounter() {
        this.moveCount = 0;
        this.updateMoveCountDisplay();
    }
    
    updateMoveCountDisplay() {
        let counterElement = document.getElementById('move-counter');
        if (counterElement) {
            counterElement.textContent = `Moves: ${this.moveCount}`;
        }
    }

    // puzzle solver
    solvePuzzle() {
        const DIRECTIONS = { "U": [-1, 0], "D": [1, 0], "L": [0, -1], "R": [0, 1] };
        const END = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];

        class Node {
            constructor(current_node, previous_node, g, h, dir) {
                this.current_node = current_node;
                this.previous_node = previous_node;
                this.g = g;
                this.h = h;
                this.dir = dir;
            }

            f() {
                return this.g + this.h;
            }
        }

        function getPos(current_state, element) {
            for (let row = 0; row < current_state.length; row++) {
                let col = current_state[row].indexOf(element);
                if (col !== -1) {
                    return [row, col];
                }
            }
        }

        function euclidianCost(current_state) {
            let cost = 0;
            for (let row = 0; row < current_state.length; row++) {
                for (let col = 0; col < current_state[0].length; col++) {
                    let pos = getPos(END, current_state[row][col]);
                    cost += Math.abs(row - pos[0]) + Math.abs(col - pos[1]);
                }
            }
            return cost;
        }

        function getAdjNode(node) {
            let listNode = [];
            let emptyPos = getPos(node.current_node, 0);

            for (let dir in DIRECTIONS) {
                let newPos = [emptyPos[0] + DIRECTIONS[dir][0], emptyPos[1] + DIRECTIONS[dir][1]];
                if (newPos[0] >= 0 && newPos[0] < node.current_node.length && newPos[1] >= 0 && newPos[1] < node.current_node[0].length) {
                    let newState = JSON.parse(JSON.stringify(node.current_node));
                    newState[emptyPos[0]][emptyPos[1]] = node.current_node[newPos[0]][newPos[1]];
                    newState[newPos[0]][newPos[1]] = 0;
                    listNode.push(new Node(newState, node.current_node, node.g + 1, euclidianCost(newState), dir));
                }
            }

            return listNode;
        }

        function getBestNode(openSet) {
            let bestNode;
            let bestF = Infinity;

            for (let node of Object.values(openSet)) {
                if (node.f() < bestF) {
                    bestNode = node;
                    bestF = node.f();
                }
            }
            return bestNode;
        }

        function buildPath(closedSet) {
            let node = closedSet[JSON.stringify(END)];
            let branch = [];

            while (node.dir) {
                branch.push({
                    dir: node.dir,
                    node: node.current_node
                });
                node = closedSet[JSON.stringify(node.previous_node)];
            }
            branch.push({
                dir: '',
                node: node.current_node
            });
            return branch.reverse();
        }

        function main(puzzle) {
            let open_set = { [JSON.stringify(puzzle)]: new Node(puzzle, puzzle, 0, euclidianCost(puzzle), "") };
            let closed_set = {};

            while (true) {
                let test_node = getBestNode(open_set);
                closed_set[JSON.stringify(test_node.current_node)] = test_node;

                if (JSON.stringify(test_node.current_node) === JSON.stringify(END)) {
                    return buildPath(closed_set);
                }

                let adj_node = getAdjNode(test_node);
                for (let node of adj_node) {
                    if (closed_set[JSON.stringify(node.current_node)] ||
                        (open_set[JSON.stringify(node.current_node)] && open_set[JSON.stringify(node.current_node)].f() < node.f())) {
                        continue;
                    }
                    open_set[JSON.stringify(node.current_node)] = node;
                }

                delete open_set[JSON.stringify(test_node.current_node)];
            }
        }

        // Convert this.indexes to 2D array
        let currentState = [];
        for (let i = 0; i < this.rows; i++) {
            currentState.push(this.indexes.slice(i * this.cols, (i + 1) * this.cols));
        }

        return main(currentState);
    }

    async solvePuzzleAnimated() {
        let solution = this.solvePuzzle();
        for (let step of solution) {
            if (step.dir) {
                let emptyPos = this.emptyBlockCoords;
                let newPos = [
                    emptyPos[1] + (step.dir === 'U' ? 1 : step.dir === 'D' ? -1 : 0),
                    emptyPos[0] + (step.dir === 'L' ? 1 : step.dir === 'R' ? -1 : 0)
                ];
                let blockIdx = newPos[1] + newPos[0] * this.cols;
                await new Promise(resolve => setTimeout(() => {
                    this.moveBlock(blockIdx);
                    resolve();
                }, 300));
            }
        }
        alert("Puzzle solved automatically!");
    }

}

var game = new Game(1);//instantiate a new Game


//taking care of the difficulty buttons
var difficulty_buttons = Array.from(document.getElementsByClassName("difficulty_button"));
difficulty_buttons.forEach((elem, idx) => {
    elem.addEventListener('click', (e) => {
        difficulty_buttons[GameDifficulty.indexOf(game.difficulty)].classList.remove("active");
        elem.classList.add("active");
        game.setDifficulty(idx + 1);
    });
});

//solver button
let solveButton = document.createElement('button');
solveButton.textContent = 'Solve Puzzle';
solveButton.addEventListener('click', () => game.solvePuzzleAnimated());
document.body.appendChild(solveButton);

// show/ hide block number
function toggleCSS() {
    var stylesheet = document.getElementById("block-number-css");
    var switchElement = document.getElementById("styleSwitch");
    if (switchElement.checked) {
        stylesheet.href = "block-number.css";
    } else {
        stylesheet.href = "";
    }
}

// Inisialisasi switch sesuai dengan keberadaan stylesheet tema
window.onload = function () {
    var stylesheet = document.getElementById("block-number-css");
    var switchElement = document.getElementById("styleSwitch");

    switchElement.checked = (stylesheet.href.indexOf("block-number.css") > -1);
}