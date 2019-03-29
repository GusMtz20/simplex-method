'use strict'

const SimplexMethod = require('./simplex')

const filename = 'matrix.txt'

SimplexMethod.build(filename)
    .then(simplex => {
        simplex.compute()
    })
