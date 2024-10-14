// direction matrix
const DIRECTIONS = { "U": [-1, 0], "D": [1, 0], "L": [0, -1], "R": [0, 1] };
// target matrix
const END = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];

// unicode for draw puzzle in command prompt or terminal
const left_down_angle = '\u2514';
const right_down_angle = '\u2518';
const right_up_angle = '\u2510';
const left_up_angle = '\u250C';

const middle_junction = '\u253C';
const top_junction = '\u252C';
const bottom_junction = '\u2534';
const right_junction = '\u2524';
const left_junction = '\u251C';

// bar color (Note: colorama is not available in JavaScript, so we'll use plain characters)
const bar = '|';
const dash = '\u2500';

// Line draw code
const first_line = `${left_up_angle}${dash.repeat(3)}${top_junction}${dash.repeat(3)}${top_junction}${dash.repeat(3)}${right_up_angle}`;
const middle_line = `${left_junction}${dash.repeat(3)}${middle_junction}${dash.repeat(3)}${middle_junction}${dash.repeat(3)}${right_junction}`;
const last_line = `${left_down_angle}${dash.repeat(3)}${bottom_junction}${dash.repeat(3)}${bottom_junction}${dash.repeat(3)}${right_down_angle}`;

// puzzle print function
function printPuzzle(array) {
    console.log(first_line);
    for (let a = 0; a < array.length; a++) {
        let row = '';
        for (let i of array[a]) {
            if (i === 0) {
                row += `${bar} * `;
            } else {
                row += `${bar} ${i} `;
            }
        }
        console.log(row + bar);
        if (a === 2) {
            console.log(last_line);
        } else {
            console.log(middle_line);
        }
    }
}

// Node class
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

// Main execution
let br = main([
    [6, 2, 8],
    [4, 7, 1],
    [0, 3, 5]
]);

console.log('total steps : ', br.length - 1);
console.log();
console.log(`${dash}${dash}${right_junction} INPUT ${left_junction}${dash}${dash}`);
for (let b of br) {
    if (b.dir !== '') {
        let letter = '';
        if (b.dir === 'U') letter = 'UP';
        else if (b.dir === 'R') letter = "RIGHT";
        else if (b.dir === 'L') letter = 'LEFT';
        else if (b.dir === 'D') letter = 'DOWN';
        console.log(`${dash}${dash}${right_junction} ${letter} ${left_junction}${dash}${dash}`);
    }
    printPuzzle(b.node);
    console.log();
}

console.log(`${dash}${dash}${right_junction} ABOVE IS THE OUTPUT ${left_junction}${dash}${dash}`);
