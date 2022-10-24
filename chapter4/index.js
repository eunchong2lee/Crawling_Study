//
const xlsx = require('xlsx');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

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

const workbook = xlsx.readFile('xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

const crawler = async () => {
    try {
      const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1920,1080'] });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      add_to_sheet(ws, 'C1', 's', '평점');
      for (const [i, r] of records.entries()) {
        await page.goto(r.링크);
        const result = await page.evaluate(() => {
          let score;
          const scoreEl = document.querySelector('.score.score_left .star_score');
          if (scoreEl) {
            let score = scoreEl.textContent
          }
          let img;
          const imgEl = document.querySelector('.poster img');
          if (imgEl) {
            img = imgEl.src;
          }
          return { score, img };
        });
        if (result.score) {
          const newCell = 'C' + (i + 2);
          console.log(r.제목, '평점', result.score.trim(), newCell);
          add_to_sheet(ws, newCell, 'n', result.score.trim());
        }
        if (result.img) {
          await page.screenshot({ path: `screenshot/${r.제목}.png`, fullPage: true }); // TODO: clip 소개(x, y, width, height)
          const imgResult = await axios.get(result.img.replace(/\?.*$/, ''), {
            responseType: 'arraybuffer',
          });
          fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data);
        }
        await page.waitForSelector(".poster img");
      }
      await page.close();
      await browser.close();
      xlsx.writeFile(workbook, 'xlsx/result.xlsx');
    } catch (e) {
      console.error(e);
    }
  };
  crawler();

crawler();