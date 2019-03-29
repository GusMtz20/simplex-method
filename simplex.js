'use strict'

/**
 * @module
 * Simplex method implementation
 */

const { readMatrix, writeResult } = require('./files')

readMatrix('matrix.txt')
    .then(data => {
        console.log(data)
        return data
    })
    .then(data => {
        writeResult('result.txt', data)
    })
