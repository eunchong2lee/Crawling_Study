const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');


const workbook = xlsx.readFile('xlsx/data.xlsx');
// console.log(Object.keys(workbook.Sheets)); 
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws); 
for (const [i, r] of records.entries()) {
    // console.log(i, r);
}

const crawler = async () => {
    await Promise.all(records.map(async(r)=>{
        const response = await axios.get(r.링크);
        console.log(r.링크);
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const star = $('.score.score_left .star_score').text().trim();
            console.log(star);
        }
    }))
}
crawler();