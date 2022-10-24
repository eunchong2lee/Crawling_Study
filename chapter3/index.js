// npm csv-parser 
const csv = require('csv-parser');
const fs = require('fs');
const puppeteer = require('puppeteer');
const {stringify} = require('csv-stringify');
// npm xlsx
const xlsx = require('xlsx');

// csv파일 parsing
const csv_crawler = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const parsing = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('csv/data.csv')
            .pipe(csv(['name', 'url']))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            });

    });

    await Promise.all(parsing.map(async (r,i)=>{
        const url = r.url;
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('.score.score_left .star_score');
        const score = await page.$('.score.score_left .star_score');
        console.log(score);
        if(score) {
            // evaluate 인자로 전달하는 콜백 함수 내부에서 만큼은 브라우저 자바스크립트를 사용할 수 있다.
            // nodejs 불가능
            const score_text = await page.evaluate(element => element.textContent, score);
            r.score = score_text.trim();
        }
        await page.waitForSelector('.score.score_left .star_score');

        await page.close();
    }))

    await browser.close();
    console.log(parsing);

    fs.writeFileSync('csv/result.csv', JSON.stringify(parsing));
}

// csv_crawler();

// add_cell
function range_add_cell(range, cell) {
    var rng = xlsx.utils.decode_range(range);
    var c = typeof cell === 'string' ? xlsx.utils.decode_cell(cell) : cell;
    if (rng.s.r > c.r) rng.s.r = c.r;
    if (rng.s.c > c.c) rng.s.c = c.c;

    if (rng.e.r < c.r) rng.e.r = c.r;
    if (rng.e.c < c.c) rng.e.c = c.c;
    return xlsx.utils.encode_range(rng);
}
function add_to_sheet(sheet, cell, type, raw) {
    sheet['!ref'] = range_add_cell(sheet['!ref'], cell);
    sheet[cell] = { t: type, v: raw };
};
// xlsx puppeteer
const workbook = xlsx.readFile('xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

const xlsx_crawler = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        add_to_sheet(ws, 'C1', 's', '평점');
        for (const [i, r] of records.entries()) {
          await page.goto(r.링크);
          const text = await page.evaluate(() => {
            const score = document.querySelector('.score.score_left .star_score');
            return score.textContent;
          });
          if (text) {
            const newCell = 'C' + (i + 2);
            console.log(r.제목, '평점', text.trim(), newCell);
            add_to_sheet(ws, newCell, 'n', text.trim());
          }
          await page.waitForSelector('.score.score_left .star_score');
        }
        await page.close();
        await browser.close();
        xlsx.writeFile(workbook, 'xlsx/result.xlsx');
      } catch (e) {
        console.error(e);
      }
};

xlsx_crawler();