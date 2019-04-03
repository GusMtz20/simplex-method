'use strict'

const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const SimplexMethod = require('../simplex')

/**
 * Deletes folder with all folders and files in it
 * @param {string} dirname - Name of the folder
 * @returns {Promise} Status of removing a directory
 */
const rmdir = dirname => new Promise((resolve, reject) => {
    if (fs.existsSync(dirname)) {
        if (!fs.lstatSync(dirname).isDirectory())
            reject('You are trying to delete a file')

        const files = fs.readdirSync(dirname, { withFileTypes: true })
        for (const file of files) {
            if (file.isDirectory())
                rmdir(dirname + '/' + file.name)
            else
                fs.unlinkSync(dirname + '/' + file.name)
        }
        fs.rmdirSync(dirname)
        resolve('success')
    } else {
        resolve('There is no such folder')
    }
})

describe('Test simplex method implementation', () => {

    const testFolder = 'temp'

    before(() => {
        if (!fs.existsSync(testFolder))
            fs.mkdirSync(testFolder)
    })

    // after(async() => {
    //     await rmdir(testFolder)
    // })

    it('should be OK #1', done => {
        const outfilename = path.join(testFolder, 'out.txt')

        const options = {
            filename: 'matrix.txt',
            outfilename
        }

        SimplexMethod.build(options)
            .then(simplex => {
                return simplex.compute()
            })
            .then(() => {
                fs.readFile(outfilename, 'utf8', (err, data) => {
                    console.log(data)
                    done()
                })
            })
    })

})
