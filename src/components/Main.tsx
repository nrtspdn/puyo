import React, { useState } from 'react';
import Brick from './Brick';

import './Main.css';

interface BrickData {
    colour: string;
    didMove: boolean;
    size: number;
    visited: boolean;
}

interface CurrentBrickData {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EMPTY: BrickData = {colour: '', didMove: false, size: 0, visited: false};

const SIZE = 50;
const COLS = 600 / SIZE;
const ROWS = 1000 / SIZE;
const COLOURS = ['red', 'blue', 'green', 'yellow'];

export default function Main() {
    const emptyBricks: BrickData[][] = [];
    for (let y = 0; y < ROWS; y++) {
        emptyBricks.push([]);
        for (let x = 0; x < COLS; x++) {
            emptyBricks[y].push(EMPTY);
        }
    }

    const [bricks, setBricks] = useState(emptyBricks);
    const [timerId, setTimerId] = useState(null as any);
    const [running, setRunning] = useState(false);
    const [currentBrick, setCurrentBrick] = useState({x1: 0, y1: 0, x2: 0, y2: 0} as CurrentBrickData);

    const getGroup = (y: number, x: number, groupColour: string = ''): BrickData[] => {
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
            return [];
        }

        const brick = bricks[y][x];
        if (!groupColour) {
            groupColour = brick.colour;
        }

        if (brick.colour !== groupColour || brick.didMove || brick.visited) {
            return [];
        }


        let group: BrickData[] = [];
        brick.visited = true;
        group.push(brick);

        const left = getGroup(y, x - 1, groupColour);
        if (left) {
            group.push(...left);
        }

        const right = getGroup(y, x + 1, groupColour);
        if (right) {
            group.push(...right);
        }

        const up = getGroup(y - 1, x, groupColour);
        if (up) {
            group.push(...up);
        }

        const down = getGroup(y + 1, x, groupColour);
        if (down) {
            group.push(...down);
        }

        return group;
    };

    const tick = () => {
        // First, move everything
        let didMove = false;
        for (let y = bricks.length - 1; y >= 0; y--) {
            for (let x = 0; x < bricks[y].length; x++) {
                bricks[y][x].didMove = false;
                if (bricks[y][x].colour === '' && y !== 0 && bricks[y-1][x].colour !== '') {
                    bricks[y][x] = bricks[y-1][x];
                    bricks[y-1][x] = EMPTY;
                    didMove = true;

                    // if (y === ROWS - 1 || bricks[y+1][x].colour === '') {
                        bricks[y][x].didMove = true;
                    // }

                    // if ()
                }
            }
        }

        // Then calculate sizes
        for (let y = 0; y < ROWS; y++) { // First we need to reset everything
            for (let x = 0; x < COLS; x++) {
                bricks[y][x].visited = false;
                bricks[y][x].size = 0;
            }
        }

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const brick = bricks[y][x];
                if (brick.didMove || !brick.colour || brick.size) {
                    continue;
                }

                const group = getGroup(y, x);
                group.forEach(brick => brick.size = group.length);
            }
        }

        // Then remove the big blobs!
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (bricks[y][x].size >= 4) {
                    bricks[y][x] = EMPTY;
                }
            }
        }

        setBricks([...bricks]);
        setCurrentBrick(b => ({x1: b.x1, y1: b.y1 + 1, x2: b.x2, y2: b.y2 + 1}));

        if (!didMove) {
            spawnBrick();
        }
    }

    const spawnBrick = () => {
        if (bricks[1][COLS / 2].colour !== '') {
            setRunning(false);
            setTimerId((timerId: any) => {
                clearInterval(timerId);
                return 0;
            });
            alert('GAME OVER');
            return;
        }

        bricks[0][COLS / 2] = {colour: COLOURS[Math.floor(Math.random() * 4)], didMove: false, size: 0, visited: false};
        bricks[1][COLS / 2] = {colour: COLOURS[Math.floor(Math.random() * 4)], didMove: false, size: 0, visited: false};
        setBricks([...bricks]);
        setCurrentBrick({x1: COLS / 2, y1: 0, x2: COLS / 2, y2: 1});
    };

    const start = () => {
        const t = setInterval(tick, 500);
        setTimerId(t);
        setRunning(true);
    }

    const getNeighbours = (y: number, x: number) => {
        if (bricks[y][x].didMove) {
            return '';
        }

        const colour = bricks[y][x].colour;
        let neighbours = '';

        if (x > 0 && bricks[y][x-1].colour === colour && !bricks[y][x-1].didMove) {
            neighbours += 'L';
        }

        if (x < COLS - 1 && bricks[y][x+1].colour === colour && !bricks[y][x+1].didMove) {
            neighbours += 'R';
        }

        if (y > 0 && bricks[y-1][x].colour === colour && !bricks[y-1][x].didMove) {
            neighbours += 'U';
        }

        if (y < ROWS - 1 && bricks[y+1][x].colour === colour && !bricks[y+1][x].didMove) {
            neighbours += 'D';
        }

        return neighbours;
    }

    const brickElements = [];
    for (let y = 0; y < bricks.length; y++) {
        for (let x = 0; x < bricks[y].length; x++) {
            if (bricks[y][x].colour !== '') {
                const neighbours = getNeighbours(y, x);
                brickElements.push(<Brick colour={bricks[y][x].colour} size={bricks[y][x].size} neighbours={neighbours} x={x*SIZE} y={y*SIZE}></Brick>);
            }
        }
    }

    document.onkeydown = (e) => {
        // if (!running) {
        //     return;
        // }

        const x1 = currentBrick.x1;
        const x2 = currentBrick.x2;
        const y1 = currentBrick.y1;
        const y2 = currentBrick.y2;

        console.log(`${e.key} ${x1} ${y1} ${x2} ${y2}`);


        if (e.key === 'ArrowDown') {
            tick();
        } else if (e.key === 'ArrowLeft' && x1 !== 0 && x2 !== 0) {
            let canMove = false;
            if (y1 !== y2) {
                canMove = !bricks[y1][x1-1].colour && !bricks[y2][x2-1].colour;
            } else if (x1 < x2) {
                canMove = !bricks[y1][x1-1].colour;
            } else {
                canMove = !bricks[y2][x2-1].colour
            }

            if (canMove) {
                if (y1 !== y2) {
                    bricks[y1][x1 - 1] = bricks[y1][x1];
                    bricks[y2][x2 - 1] = bricks[y2][x2];
                    bricks[y1][x1] = EMPTY;
                    bricks[y2][x2] = EMPTY;
                } else if (x1 < x2) {
                    bricks[y1][x1 - 1] = bricks[y1][x1];
                    bricks[y2][x2 - 1] = bricks[y2][x2];
                    bricks[y2][x2] = EMPTY;
                } else {
                    bricks[y2][x2 - 1] = bricks[y2][x2];
                    bricks[y1][x1 - 1] = bricks[y1][x1];
                    bricks[y1][x1] = EMPTY;
                }
                setBricks([...bricks]);
                setCurrentBrick({x1: x1 - 1, y1, x2: x2 - 1, y2});
            }
        } else if (e.key === 'ArrowRight' && x1 !== COLS - 1 && x2 !== COLS -1) {
            let canMove = false;
            if (y1 !== y2) {
                canMove = !bricks[y1][x1+1].colour && !bricks[y2][x2+1].colour;
            } else if (x1 > x2) {
                canMove = !bricks[y1][x1+1].colour;
            } else {
                canMove = !bricks[y2][x2+1].colour
            }

            if (canMove) {
                if (y1 !== y2) {
                    bricks[y1][x1 + 1] = bricks[y1][x1];
                    bricks[y2][x2 + 1] = bricks[y2][x2];
                    bricks[y1][x1] = EMPTY;
                    bricks[y2][x2] = EMPTY;
                } else if (x1 > x2) {
                    bricks[y1][x1 + 1] = bricks[y1][x1];
                    bricks[y2][x2 + 1] = bricks[y2][x2];
                    bricks[y2][x2] = EMPTY;
                } else {
                    bricks[y2][x2 + 1] = bricks[y2][x2];
                    bricks[y1][x1 + 1] = bricks[y1][x1];
                    bricks[y1][x1] = EMPTY;
                }
                setBricks([...bricks]);
                setCurrentBrick({x1: x1 + 1, y1, x2: x2 + 1, y2});
            }
        } else if (e.key === 'ArrowUp') {
            // 2 is always in the 'center'
            if (x1 === x2 && y1 === y2 - 1 && !bricks[y2][x2 + 1].colour) { // 1 on top -> 1 right
                bricks[y2][x2+1] = bricks[y1][x1];
                bricks[y1][x1] = EMPTY;
                setBricks([...bricks]);
                setCurrentBrick({x1: x2 + 1, y1: y2, x2, y2});
            } else if (y1 === y2 && x1 === x2 + 1 && !bricks[y2+1][x2].colour) { // 1 right -> 1 down
                bricks[y2+1][x2] = bricks[y1][x1];
                bricks[y1][x1] = EMPTY;
                setBricks([...bricks]);
                setCurrentBrick({x1: x2, y1: y2+1, x2, y2});
            } else if (x1 === x2 && y1 === y2 + 1 && !bricks[y2][x2 - 1].colour) { // 1 down -> 1 left
                bricks[y2][x2-1] = bricks[y1][x1];
                bricks[y1][x1] = EMPTY;
                setBricks([...bricks]);
                setCurrentBrick({x1: x2 - 1, y1: y2, x2, y2});
            } else if (x1 === x2 - 1 && y1 === y2) { // 1 left -> 1 up
                bricks[y2-1][x2] = bricks[y1][x1];
                bricks[y1][x1] = EMPTY;
                setBricks([...bricks]);
                setCurrentBrick({x1: x2, y1: y2 - 1, x2, y2});
            }
        }
    };

    return <div id='board'>
        {brickElements}
        <button onClick={tick} style={{position: 'absolute', left: -100}}>Tick</button>
        <button onClick={spawnBrick} style={{position: 'absolute', left: -160}}>Spawn</button>
        <button onClick={start} style={{position: 'absolute', left: -220}}>Start</button>
    </div>
}
