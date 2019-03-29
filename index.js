'use strict'

const SimplexMethod = require('./simplex')

const filename = 'matrix3.txt'

const { readMatrix } = require('./files')

// readMatrix(filename)
//     .then(data => {
//         console.log(data)
//     })

SimplexMethod.build(filename, true)
    .then(simplex => {
        simplex.compute()
    })
