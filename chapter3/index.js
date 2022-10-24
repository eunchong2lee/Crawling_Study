// npm csv-parser 
const csv = require('csv-parser');
const fs = require('fs');
const puppeteer = require('puppeteer');
const {stringify} = require('csv-stringify');
// npm xlsx
const xlsx = require('xlsx');

// csv파일 parsing
const crawler = async () => {
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

crawler();