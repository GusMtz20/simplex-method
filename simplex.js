'use strict'

/**
 * @module
 * Simplex method implementation
 */

const fs = require('fs')
const { readMatrix } = require('./files')

class SimplexMethod {

    constructor({ filename, toFile, outfilename }, { colHeader, rowHeader, data }) {
        this.filename = filename
        this.toFile = typeof toFile != 'undefined' ? toFile : true
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
        return new Promise((resolve, reject) => {
            while (true) {
                if (this.stopCondition()) {
                    if (this.toFile) this.writer.close()
                    break
                }

                this.__step1()
                this.__step2()
                this.__step3()

                this.print()
            }

            if (this.toFile)
                this.writer.on('close', () => { resolve() })
        })
    }

    stopCondition() {
        return this.data[0].every(x => x >= 0)
    }

    __step1() {
        this.iteration++
        
        // Detect target column
        const firstRow = this.data[0].slice()
        firstRow.pop()
        let min = { value: 9999, index: 0 }
        let max = { value: -9999, index: 0 }
        
        firstRow.forEach((elem, index) => {
            if (elem > max.value) max = { value: elem, index }
            if (elem < min.value) min = { value: elem, index }
        })

        if (min.value < 0) this.targetColIndex = min.index
        else this.targetColIndex = max.index

        // Detect target row
        const pCol = this.data.map(x => x[x.length-1])
        let minDividing = { value: 9999, index: 0 } // minimum of P/targetCol

        pCol.forEach((p, index) => {
            const current = this.data[index][this.targetColIndex]
            if (p !== 0 && current > 0 && p / current < minDividing.value)
                minDividing = { value: p / current, index }
        })
        this.targetRowIndex = minDividing.index
    }

    __step2() {
        // Add to basis variables
        this.rowHeader[this.targetRowIndex] = this.colHeader[this.targetColIndex]

        this.pivot = this.data[this.targetRowIndex][this.targetColIndex]

        // Divide target row by pivot
        this.newData = new Array(this.data.length).fill(0).map(x => new Array(this.data[0].length).fill(0))
        this.newData[this.targetRowIndex] = this.data[this.targetRowIndex].map(x => x / this.pivot)

        // Consider which columns don't need recalculation
        const doNotNeedRecalculationColIndexes = []
        this.needRecalculationColIndexes = new Array(this.data[0].length).fill().map((x, i) => i)

        this.rowHeader.forEach((header, rowIndex) => {
            if (rowIndex !== 0) {
                const colWithSameLabelIndex = this.colHeader.indexOf(header)
                doNotNeedRecalculationColIndexes.push(colWithSameLabelIndex)

                // Set column values, which are for the basis variables
                this.newData[rowIndex][colWithSameLabelIndex] = 1
            }
        })

        for (const elem of doNotNeedRecalculationColIndexes)
            this.needRecalculationColIndexes = this.needRecalculationColIndexes.filter(x => x !== elem)
    }

    __step3() {
        for (const j of this.needRecalculationColIndexes) {
            for (let i = 0; i < this.data.length; i++) {
                if (i === this.targetRowIndex) continue
                this.newData[i][j] = this.rectangleMethod(i, j)
            }
        }

        this.data = this.newData
    }

    rectangleMethod(rowIndex, colIndex) {
        return (this.data[rowIndex][colIndex] * this.pivot -
            this.data[rowIndex][this.targetColIndex] * this.data[this.targetRowIndex][colIndex]) / this.pivot
    }

    print() {
        if (this.toFile) this.printToFile()
        else this.printOnScreen()
    }

    printOnScreen() {
        const padding = 7

        console.log()
        console.log(`BFS${this.iteration}`) // Note: BFS stands for basic feasible solution

        // Print column headers
        process.stdout.write('▢'.padEnd(padding))
        for (const header of this.colHeader)
            process.stdout.write(header.padEnd(padding))
        console.log()

        // Print data
        this.data.forEach((row, i) => {
            process.stdout.write(this.rowHeader[i].padEnd(padding))
            for (const el of row)
                process.stdout.write((Math.round(el * 100) / 100).toString().padEnd(padding))
            console.log()
        })
    }

    printToFile() {
        const padding = 7

        this.writer.write('\n')
        this.writer.write(`BFS${this.iteration}\n`) // Note: BFS stands for basic feasible solution

        // Print column headers
        this.writer.write('▢'.padEnd(padding))
        for (const header of this.colHeader)
            this.writer.write(header.padEnd(padding))
        this.writer.write('\n')

        // Print data
        this.data.forEach((row, i) => {
            this.writer.write(this.rowHeader[i].padEnd(padding))
            for (const el of row)
                this.writer.write((Math.round(el * 100) / 100).toString().padEnd(padding))
            this.writer.write('\n')
        })
        // for (let i = 0; i < 1000000; i++) {
        //     this.writer.write(`${i} `)
        //     if (!(i % 100)) this.writer.write('\n')
        // }
    }

}

module.exports = SimplexMethod
