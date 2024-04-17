const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, 
        args: ['--start-maximized'] 
    });
    const page = await browser.newPage();
    await page.goto('https://www.pascalcoste-shopping.com/esthetique/fond-de-teint.html');

    await new Promise(resolve => setTimeout(resolve, 15000));

    await page.click('.amgdprcookie-button.-allow');

    await new Promise(resolve => setTimeout(resolve, 15000));

    const websiteUrl = page.url();

    
    await page.waitForSelector('.uk-margin.uk-promo-sidebar');

    
    const elementHandle = await page.$('.uk-margin.uk-promo-sidebar');

    await elementHandle.screenshot({ path: 'sidebar_snapshot.png' });
    
    await new Promise(resolve => setTimeout(resolve, 60000));

    const id = crypto.createHash('md5').update(websiteUrl).digest('hex');

    console.log('Generated ID:', id);

    const redirectionUrl = await page.evaluate(() => {
        const anchor = document.querySelector('div.uk-active a.uk-position-cover');
        return anchor ? anchor.getAttribute('href') : null;
    });

    
    console.log('Redirection URL:', redirectionUrl);

    let imgurl = await page.evaluate(() => {
        const anchor = document.querySelector('div.uk-active img.uk-cover');
        return anchor ? anchor.getAttribute('src') : null;
    });
    const imagePath = `image_${id}.png`;


    if (imgurl && imgurl.startsWith('http')) {
        const response = await page.goto(imgurl);

        fs.writeFileSync(imagePath, await response.buffer());

  
        console.log('Image URL:', imagePath);
    }

    const mediaFormat = 'Left Side Banner';
    console.log('Media Format:', mediaFormat);

    const advertisementData = {
        id: id,
        redirection_url: redirectionUrl,
        img_link: imgurl,
        image_url: imagePath,
        format: mediaFormat
    };

    fs.writeFileSync('advertisement_data.json', JSON.stringify(advertisementData, null, 2));




    await browser.close();
})();
