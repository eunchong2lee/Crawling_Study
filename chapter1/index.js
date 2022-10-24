// npm csv-parser 
// csv파일 parsing
const csv = require('csv-parser')
const fs = require('fs')


const parser = async () => {
    const parsing = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('csv/data.csv')
            .pipe(csv(['name', 'url']))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            });

    });

    parsing.forEach((r, i) => {
        console.log(i, r);
    });
}

parser();