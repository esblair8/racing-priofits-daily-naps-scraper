const fs = require('fs')
const converter = require('json-2-csv')

const dir = `/${process.cwd().split('/').slice(1, 3).join('/')}/Documents/Selections`

module.exports = (selections, file) => {
    const filePath = `${dir}/${file}`
    if (fs.existsSync(filePath)) {
        console.info('File already exists.')
        return converter.json2csvAsync(selections, { prependHeader: false })
            .then(function (rows) {
                console.info('Appending to file.')
                fs.appendFileSync(filePath, rows + '\n', { prependHeader: true })
                return filePath
            })
    } else {
        console.info("Output file doesn't exist.")
        console.info('Creating file.')
        fs.mkdirSync(dir, { recursive: true })
        return converter.json2csvAsync(selections, { prependHeader: true })
            .then(function (rows, err) {
                console.info('Writing to file.')
                fs.appendFileSync(filePath, rows + '\n', { flag: 'a' })
                return filePath
            })
    }
}
