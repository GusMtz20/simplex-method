'use strict'

const fs = require('fs')
const { createInterface } = require('readline')

const readMatrix = filename => new Promise((resolve, reject) => {
    let firstLine = true
    let colHeader = []
    const rowHeader = []
    let data = []

    const reader = createInterface({
        input: fs.createReadStream(filename)
    })

    reader.on('line', line => {
        // The line preprocessing
        line = line.split(' ').filter(x => x !== '')

        if (firstLine) {
            colHeader = line.slice(1)
            firstLine = false
        } else {
            rowHeader.push(line[0])
            data.push(line.slice(1))
        }
    })

    reader.on('close', () => {
        // The data postprocessing
        data = data.map(x => x.map(xx => parseFloat(xx)))

        resolve({ colHeader, rowHeader, data })
    })
})

const writeResult = (filename, { colHeader, rowHeader, data }) => {
    const writer = fs.createWriteStream(filename)

    writer.write(colHeader.join(' '))

    rowHeader.forEach((header, i) => {
        writer.write('\n')
        writer.write([header].concat(data[i]).join(' '))
    })

    writer.end()
}

module.exports = {
    readMatrix,
    writeResult
}