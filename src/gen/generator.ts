let seedrandom = require('seedrandom');

export type Word = {
    text: string,
    row: number,
    column: number,
    isVertical: boolean,
}

export type ShuffledCrossword = {
    crossword: string[][],
    shuffles: number,
}

export class CrosswordGeneratorUtils {
    static readonly EMPTY_CELL: string = '_'
    static readonly ATTEMPTS_TO_FIT_WORDS: number = 50000
    static readonly GRIDS_TO_MAKE: number = 100
    static readonly GRID_SIZE: number = 7

    private grid: string[][] = Array.from(Array(CrosswordGeneratorUtils.GRID_SIZE), () => new Array(CrosswordGeneratorUtils.GRID_SIZE))

    constructor() {
        for (let row = 0; row < CrosswordGeneratorUtils.GRID_SIZE; row++) {
            for (let column = 0; column < CrosswordGeneratorUtils.GRID_SIZE; column++) {
                this.grid[row][column] = CrosswordGeneratorUtils.EMPTY_CELL
            }
        }
    }

    getGrid(): string[][] {
        return this.grid
    }

    private isValidPosition(row: number, column: number): boolean {
        return row >= 0 && row < CrosswordGeneratorUtils.GRID_SIZE && column >= 0 && column < CrosswordGeneratorUtils.GRID_SIZE
    }

    tryUpdate(word: Word): boolean {
        if (this.canBePlaced(word)) {
            this.addWord(word)
            return true
        }
        return false
    }

    private addWord(word: Word): boolean {
        for (let letterIndex = 0; letterIndex < word.text.length; letterIndex++) {
            let row = word.row
            let column = word.column
            if (word.isVertical) {
                row += letterIndex
            } else {
                column += letterIndex
            }
            this.grid[row][column] = word.text.substring(letterIndex, letterIndex + 1)[0]
        }
        return true
    }

    private canBePlaced(word: Word): boolean {
        let canBePlaced = true
        if (word.text == undefined) console.log(word)
        if (this.isValidPosition(word.row, word.column) && this.fitsOnGrid(word)) {
            let index = 0
            while (index < word.text.length) {
                const currentRow = word.isVertical ? word.row + index : word.row
                const currentColumn = !word.isVertical ? word.column + index : word.column
                if (!((word.text[index] == this.grid[currentRow][currentColumn] || CrosswordGeneratorUtils.EMPTY_CELL == this.grid[currentRow][currentColumn])
                    && this.isPlacementLegal(word, currentRow, currentColumn))) {
                    canBePlaced = false
                }
                index++
            }
        } else {
            canBePlaced = false
        }
        return canBePlaced
    }

    private isPlacementLegal(word: Word, row: number, column: number): boolean {
        const illegal: boolean = word.isVertical ?
            this.isInterference(row, column + 1, row + 1, column)
            || this.isInterference(row, column - 1, row + 1, column)
            || this.overwritingVerticalWord(row, column)
            || this.invadingTerritory(word, row, column) :
            this.isInterference(row + 1, column, row, column + 1)
            || this.isInterference(row - 1, column, row, column + 1)
            || this.overwritingHorizontalWord(row, column)
            || this.invadingTerritory(word, row, column)
        return !illegal
    }

    private isInterference(row: number, column: number, nextRow: number, nextColumn: number): boolean {
        return this.isValidPosition(row, column)
            && this.isValidPosition(nextRow, nextColumn)
            && this.isLetter(row, column)
            && this.isLetter(nextRow, nextColumn)
    }

    isLetter(row: number, column: number): boolean {
        return this.grid[row][column] != CrosswordGeneratorUtils.EMPTY_CELL
    }

    private fitsOnGrid(word: Word): boolean {
        return word.isVertical ? word.row + word.text.length <= CrosswordGeneratorUtils.GRID_SIZE : word.column + word.text.length <= CrosswordGeneratorUtils.GRID_SIZE
    }

    private overwritingHorizontalWord(row: number, column: number): boolean {
        const leftColumn = column - 1
        return this.isValidPosition(row, leftColumn) && this.isLetter(row, column) && this.isLetter(row, leftColumn)
    }

    private overwritingVerticalWord(row: number, column: number): boolean {
        const rowAbove = row - 1
        return this.isValidPosition(rowAbove, column) && this.isLetter(row, column) && this.isLetter(rowAbove, column)
    }

    private doesCharacterExist(row: number, column: number): boolean {
        return this.isValidPosition(row, column) && this.isLetter(row, column)
    }

    private endOfWord(word: Word, row: number, column: number): boolean {
        return word.isVertical ? word.row + word.text.length - 1 === row : word.column + word.text.length - 1 === column
    }

    getIntersections(): number {
        let intersections = 0
        for (let row = 0; row < CrosswordGeneratorUtils.GRID_SIZE; row++) {
            for (let column = 0; column < CrosswordGeneratorUtils.GRID_SIZE; column++) {
                if (this.isLetter(row, column)) {
                    ++intersections
                }
            }
        }
        return intersections
    }

    // private fun invadingTerritory(word: Word, row: Int, column: Int): Boolean {
    //         val invading: Boolean
    //         val empty = !isLetter(row, column)
    //         invading = if (word.isVertical) {
    //             val weHaveNeighbors =
    //                 (doesCharacterExist(row, column - 1) || doesCharacterExist(row, column + 1)) || endOfWord(
    //                     word, row, column
    //                 ) && doesCharacterExist(row + 1, column)
    //             empty && weHaveNeighbors
    //         } else {
    //             val weHaveNeighbors =
    //                 (doesCharacterExist(row - 1, column) || doesCharacterExist(row + 1, column)) || endOfWord(
    //                     word, row, column
    //                 ) && doesCharacterExist(row, column + 1)
    //             empty && weHaveNeighbors
    //         }
    //         return invading
    //     }
    private invadingTerritory(word: Word, row: number, column: number): boolean {
        let invading: boolean
        let empty = !this.isLetter(row, column)
        if (word.isVertical) {
            let weHaveNeighbors =
                (this.doesCharacterExist(row, column - 1) || this.doesCharacterExist(row, column + 1)) || this.endOfWord(
                    word, row, column
                ) && this.doesCharacterExist(row + 1, column)
            invading = empty && weHaveNeighbors
        } else {
            let weHaveNeighbors =
                (this.doesCharacterExist(row - 1, column) || this.doesCharacterExist(row + 1, column)) || this.endOfWord(
                    word, row, column
                ) && this.doesCharacterExist(row, column + 1)
            invading = empty && weHaveNeighbors
        }
        return invading
    }
}

export function generateCrossword(words: string[], seed: string): string[][] {

    seedrandom(seed, {global: true});
    let usedWords: string[] = []
    let generatedGrids: CrosswordGeneratorUtils[] = []
    let goodStartingLetters: Set<string> = new Set()

    function isGoodWord(word: string): boolean {
        return goodStartingLetters.has(word.charAt(0))
    }

    function getUnusedWords(): string[] {
        return words.filter(word => !usedWords.includes(word))
    }

    function getRandomWord(): string {
        const words = getUnusedWords()
        return words[Math.floor(Math.random() * words.length)]
    }

    function getRandomWordWithSize(wordList: string[], size: number): string {
        return wordList.filter(word => word.length >= size)[Math.floor(Math.random() * wordList.length)]
    }

    function pushUsedWords(text: string) {
        usedWords.push(text);
        text.split('').filter(char => goodStartingLetters.add(char))
    }

    function getBestGrid(grids: CrosswordGeneratorUtils[]): CrosswordGeneratorUtils {
        let bestGrid = grids[0]
        for (let grid of grids) {
            if (grid.getIntersections() >= bestGrid.getIntersections()) {
                bestGrid = grid
            }
        }
        return bestGrid
    }

    function getAWordToTry(): string {
        let word = getRandomWord()
        let goodWord = isGoodWord(word)

        while (usedWords.includes(word) || !goodWord) {
            word = getRandomWord()
            goodWord = isGoodWord(word)
        }
        return word
    }

    function attemptToPlaceWordOnGrid(grid: CrosswordGeneratorUtils, word: Word): boolean {

        let text = getAWordToTry()
        for (let row = 0; row < CrosswordGeneratorUtils.GRID_SIZE; row++) {
            for (let column = 0; column < CrosswordGeneratorUtils.GRID_SIZE; column++) {
                word.text = text
                word.row = row
                word.column = column
                word.isVertical = Math.random() > 0.5

                if (grid.isLetter(row, column)) {
                    if (grid.tryUpdate(word)) {
                        pushUsedWords(word.text)
                        return true
                    }
                }
            }
        }
        return false
    }

    function generateGrids() {
        generatedGrids = []
        for (let gridsMade = 0; gridsMade < CrosswordGeneratorUtils.GRIDS_TO_MAKE; gridsMade++) {
            let grid = new CrosswordGeneratorUtils()
            let word: Word = {
                text: getRandomWordWithSize(getUnusedWords(), 5),
                row: 0,
                column: 0,
                isVertical: false
            }
            if (word.text == undefined) console.log(word)
            grid.tryUpdate(word)
            pushUsedWords(word.text)
            let continuousFails = 0
            for (let attempts = 0; attempts < CrosswordGeneratorUtils.ATTEMPTS_TO_FIT_WORDS; attempts++) {
                let placed = attemptToPlaceWordOnGrid(grid, word)
                if (placed) {
                    continuousFails = 0
                } else {
                    continuousFails++
                }
                if (continuousFails > 500) {
                    break
                }
            }
            generatedGrids.push(grid)
            if (grid.getIntersections() >= 25) {
                break
            }
        }
    }

    generateGrids()
    return getBestGrid(generatedGrids).getGrid()
}

export function shuffleWords(input: string[][], seed: string): ShuffledCrossword {
    let shuffles = Math.floor(input.reduce((acc: number, row: string[]) => {
        return acc + row.filter(char => char != CrosswordGeneratorUtils.EMPTY_CELL).length
    }, 0) / 2)
    let output = input.map(x => [...x])

    seedrandom(seed, {global: true});

    let lettersInWordsCoords: [number, number][] = []
    for (let row = 0; row < output.length; row++) {
        for (let column = 0; column < output[row].length; column++) {
            if (output[row][column] != CrosswordGeneratorUtils.EMPTY_CELL) {
                lettersInWordsCoords.push([row, column])
            }
        }
    }

    lettersInWordsCoords.sort(() => Math.random() - 0.5)
    lettersInWordsCoords.slice(0, shuffles).forEach((coords: [number, number]) => {
        let [row, column] = coords
        let [newRow, newColumn] = lettersInWordsCoords[Math.floor(Math.random() * lettersInWordsCoords.length)]
        let temp = output[row][column]
        output[row][column] = output[newRow][newColumn]
        output[newRow][newColumn] = temp
    })
    return {
        crossword: output,
        shuffles: shuffles,
    }
}