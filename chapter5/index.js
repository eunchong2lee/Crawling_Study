const puppeteer = require('puppeteer'); 

const crawler = async () => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('https://unsplash.com');
      let result = [];
      while (result.length <= 30) {
        const srcs = await page.evaluate(() => {
          window.scrollTo(0, 0);
          let imgs = [];
          const imgEls = document.querySelectorAll('.nDTlD'); 
          if (imgEls.length) {
            imgEls.forEach((v) => {
              let img = v.querySelector('img._2zEKz'); 
              if (img && img.src) {
                imgs.push(img.src);
              }
              v.parentElement.removeChild(v);
            });
          }
          
          window.scrollBy(0, 100);
          setTimeout(() => {
            window.scrollBy(0, 200);
          }, 500);
          return imgs;
        });
        result = result.concat(srcs);
        await page.waitForSelector('figure');
      }
      console.log(result);
      await page.close();
      await browser.close();
    } catch (e) {
      console.error(e);
    }
  };
  
  crawler();