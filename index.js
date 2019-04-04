'use strict'

const SimplexMethod = require('./simplex')

const options = {
    filename: 'matrix.txt', // name of the file with matrix to be solved
    toFile: true, // [optional] print result & steps to a file, not to the console
    // outfilename: 'result.txt' // [optional] where to save result. Need only if toFile option is true
}

SimplexMethod.build(options)
    .then(simplex => {
        simplex.compute()
    })
