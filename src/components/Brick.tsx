import React from 'react';

import './Brick.css';

interface Props {
    colour: string;
    neighbours: string;
    x: number;
    y: number;
    size: number
}

const colourOffsets: any = {
    'red': 0,
    'green': -50,
    'blue': -100,
    'yellow': -150,
};

const neighbourPatterns = ['', 'D', 'U', 'UD', 'R', 'RD', 'RU', 'RUD', 'L', 'LD', 'LU', 'LUD', 'LR', 'LRD', 'LRU', 'LRUD'];

export default function(props: Props) {
    const xOffset = neighbourPatterns.indexOf(props.neighbours) * -50;
    console.log(xOffset);


    return <div className='brick'
     style={{
        left: props.x, top: props.y,
        backgroundPositionY: colourOffsets[props.colour], backgroundPositionX: xOffset
     }}>
        {props.size}
    </div>
}