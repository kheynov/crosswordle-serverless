import {CrosswordGeneratorUtils, generateCrossword, shuffleWords} from "../gen/generator";

import seedrandom = require("seedrandom");

export type Cell = string[]

export type Crossword = {
    day: number,
    shuffles: number,
    crossword: Record<number, Cell>[],
}

export function genCrossword(words: string[], seed: string): Crossword {
    const crossword = generateCrossword(words, seed)

    // for (let row = 0; row < crossword.length; row++) {
    //     for (let cell = 0; cell < crossword[row].length; cell++) {
    //         process.stdout.write(`${crossword[row][cell]} `)
    //     }
    //     console.log()
    // }

    const crosswordShuffled = shuffleWords(
        crossword,
        seed
    )

    const cellsState: Record<number, Cell>[] = []
    for (let i = 0; i < crossword.length; i++) {
        if (crossword[i].filter(it => it == CrosswordGeneratorUtils.EMPTY_CELL).length == 7) continue
        cellsState.push({})
        for (let j = 0; j < crossword[i].length; j++) {
            if (crossword[i][j] == CrosswordGeneratorUtils.EMPTY_CELL) continue
            cellsState[i][j] = [crossword[i][j], crosswordShuffled.crossword[i][j]]
        }
    }
    const date: any = new Date();

    const dateStartYear: any = new Date(date.getFullYear(), 0, 0);

    const dayOfYear: any = Math.floor((date - dateStartYear) / (1000 * 60 * 60 * 24));
    return {
        day: dayOfYear,
        shuffles: crosswordShuffled.shuffles + (5 + Math.floor(seedrandom(seed.toString())() * 4)),
        crossword: cellsState,
    }
}