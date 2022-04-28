const SimplexMethod = require('./simplex')

const options = {
    // the name of a file with a matrix to be solved
    filename: 'inputs/matrix1.txt',
    // [optional] prints the result & steps to a file, not to the console
    toFile: true,
    // [optional] where to save the result; is needed only if the toFile option
    // is true
    // outfilename: 'result.txt'
}

SimplexMethod.build(options)
    .then(simplex => {
        simplex.compute()
    })
