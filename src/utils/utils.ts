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
    const crosswordShuffled = shuffleWords(
        crossword,
        seed
    )
    //for (row in grid) {
    //         for (cell in row) {
    //         for (cell in row) {
    //             print("$cell ")
    //         }
    //         println()
    //     }
    //     println()

    // for (let row of crossword) {
    //     for (let cell of row) {
    //         process.stdout.write(`${cell} `)
    //     }
    //     console.log()
    // }

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