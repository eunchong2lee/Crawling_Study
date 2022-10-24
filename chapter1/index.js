// npm csv-parser 
const csv = require('csv-parser')
const fs = require('fs')
// npm xlsx
const xlsx = require('xlsx');

// csv파일 parsing
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

// parser();


// xlsx-1
const xlsx_parser1 = () => {
    const workbook = xlsx.readFile('xlsx/data.xlsx');
    // console.log(Object.keys(workbook.Sheets)); 
    const ws = workbook.Sheets.영화목록;
    const records = xlsx.utils.sheet_to_json(ws); 
    for (const [i, r] of records.entries()) {
    console.log(i, r);
    }
}

// xlsx_parser1();

// xlsx-2

const xlsx_parser2 = () => {
    const workbook = xlsx.readFile('xlsx/data.xlsx');

    const ws = workbook.Sheets[workbook.SheetNames[0]];
    console.log(ws['!ref']);
    ws['!ref'] = ws['!ref'].split(':').map((v, i) => {
    if (i === 0) { return 'A2'; }
        return v;
    }).join(':');

    const records = xlsx.utils.sheet_to_json(ws, { header: 'A'});
    console.log(records);

    for (const [i, r] of records.entries()) {
        console.log(i, r);
    }
}
xlsx_parser2();