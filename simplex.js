'use strict'

/**
 * @module
 * Simplex method implementation
 */

const { readMatrix, writeResult } = require('./files')

// readMatrix('matrix.txt')
//     .then(data => {
//         console.log(data)
//         return data
//     })
//     .then(data => {
//         writeResult('result.txt', data)
//     })

class SimplexMethod {

    constructor(filename, { colHeader, rowHeader, data }) {
        this.filename = filename
        this.colHeader = colHeader
        this.rowHeader = rowHeader
        this.data = data

        // Iterations data
        this.targetRowIndex = 0
        this.targetColIndex = 0
        this.newData = []
        this.needRecalculationColIndexes = []
        this.pivot = 0
    }

    static async build(filename) {
        const data = await readMatrix(filename)
        return new SimplexMethod(filename, data)
    }

    compute() {
        this.__step1()
        this.__step2()
        this.__step3()

        console.log(this.data)

        this.__step1()
        this.__step2()
        this.__step3()

        // console.log(this.targetRowIndex)
        // console.log(this.targetColIndex)

        console.log(this.data)
    }

    __step1() {
        // Detect target column
        const firstRow = this.data[0]
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

}

module.exports = SimplexMethod
