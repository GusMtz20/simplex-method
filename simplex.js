/**
 * @module
 * Simplex method implementation
 */

const fs = require('fs')
const { readMatrix } = require('./files')

class SimplexMethod {

    constructor({ filename, toFile, outfilename },
        { colHeader, rowHeader, data }) {
        this.filename = filename
        this.toFile = toFile !== undefined ? toFile : true
        this.outfilename = outfilename ? outfilename : 'result.txt'
        this.colHeader = colHeader
        this.rowHeader = rowHeader
        this.data = data
        this.iteration = 0

        if (this.toFile)
            this.writer = fs.createWriteStream(this.outfilename)

        // Iterations data
        this.targetRowIndex = 0
        this.targetColIndex = 0
        this.newData = []
        this.needRecalculationColIndexes = []
        this.pivot = 0
    }

    static async build(options) {
        const data = await readMatrix(options.filename)
        return new SimplexMethod(options, data)
    }

    compute() {
        return new Promise(resolve => {
            let defaultOutStream

            if (this.toFile) {
                defaultOutStream = process.stdout.write
            }

            while (!this.__stopCondition()) {
                this.__step1()
                this.__step2()
                this.__step3()

                this.print()
            }

            if (this.toFile) {
                process.stdout.write = defaultOutStream
                this.writer.end()
                this.writer.on('close', resolve)
            }

            console.log(this.data)
        })
    }

    __stopCondition() {
        return this.data[0].every(x => x >= 0)
    }

    __step1() {
        this.iteration++

        // Detect target column
        const firstRow = this.data[0].slice()
        firstRow.pop()
        let min = { value: Infinity, index: 0 }
        let max = { value: -Infinity, index: 0 }

        firstRow.forEach((elem, index) => {
            if (elem > max.value) max = { value: elem, index }
            if (elem < min.value) min = { value: elem, index }
        })

        if (min.value < 0) this.targetColIndex = min.index
        else this.targetColIndex = max.index

        // Detect target row
        const pCol = this.data.map(x => x[x.length - 1])
        // minimum of P/targetCol
        let minDividing = { value: Infinity, index: -1 }

        pCol.forEach((p, index) => {
            const current = this.data[index][this.targetColIndex]
            if (p !== 0 && current > 0 && p / current < minDividing.value)
                minDividing = { value: p / current, index }
        })

        if (minDividing.index === -1)
            throw new Error(`

                There are no solutions! But you can still see steps.
                This is because all elements in the column \
${this.targetColIndex + 1} are not greater, than 0
            `)
        this.targetRowIndex = minDividing.index
    }

    __step2() {
        // Add to basis variables
        this.rowHeader[this.targetRowIndex] = this.colHeader[
            this.targetColIndex
        ]

        this.pivot = this.data[this.targetRowIndex][this.targetColIndex]

        // Divide target row by pivot
        this.newData = new Array(this.data.length).fill(0)
            .map(() => new Array(this.data[0].length).fill(0))
        this.newData[this.targetRowIndex] = this.data[this.targetRowIndex]
            .map(x => x / this.pivot)

        // Consider which columns don't need recalculation
        const doNotNeedRecalculationColIndexes = []
        this.needRecalculationColIndexes = new Array(this.data[0].length)
            .fill().map((x, i) => i)

        this.rowHeader.forEach((header, rowIndex) => {
            if (rowIndex !== 0) {
                const colWithSameLabelIndex = this.colHeader.indexOf(header)
                doNotNeedRecalculationColIndexes.push(colWithSameLabelIndex)

                // Set column values, which are for the basis variables
                this.newData[rowIndex][colWithSameLabelIndex] = 1
            }
        })

        for (const elem of doNotNeedRecalculationColIndexes)
            this.needRecalculationColIndexes = this.needRecalculationColIndexes
                .filter(x => x !== elem)
    }

    __step3() {
        for (const j of this.needRecalculationColIndexes) {
            for (let i = 0; i < this.data.length; i++) {
                if (i === this.targetRowIndex) continue
                this.newData[i][j] = this.__rectangleMethod(i, j)
            }
        }

        this.data = this.newData
    }

    __rectangleMethod(rowIndex, colIndex) {
        return (this.data[rowIndex][colIndex] * this.pivot -
            this.data[rowIndex][this.targetColIndex] *
            this.data[this.targetRowIndex][colIndex]) / this.pivot
    }

    print() {
        const padding = 7

        if (this.toFile)
            process.stdout.write = this.writer.write.bind(this.writer)

        // Note: BFS stands for the Basic Feasible Solution
        console.log(`\nBFS${this.iteration}`)

        // Print column headers
        process.stdout.write('▢'.padEnd(padding))
        for (const header of this.colHeader)
            process.stdout.write(header.padEnd(padding))
        console.log()

        // Print the data
        this.data.forEach((row, i) => {
            process.stdout.write(this.rowHeader[i].padEnd(padding))
            for (const el of row)
                process.stdout.write((Math.round(el * 100) / 100).toString()
                    .padEnd(padding))
            console.log()
        })
    }

}

module.exports = SimplexMethod
