const puppeteer = require('puppeteer');
const url = 'https://lolalytics.com/lol/nunu?vs=khazix&vslane=jungle';


// my example
async function getMatchups(blueChamp, redChamp, lane) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://lolalytics.com/lol/${blueChamp}?lane=${lane}&vs=${redChamp}&vslane=${lane}`);
            //setTimeout(() => { return resolve("No data") }, 1000);
            await page.waitForSelector('.ChampionHeader_headervs__25ruZ');
            let wr = await page.evaluate(() => {
                let headerText = document.querySelector('.ChampionHeader_headervs__25ruZ');
                const innerText = headerText.children[5].children[0].innerHTML;
                return innerText.substring(0, innerText.indexOf('<'));
            });
            browser.close();
            return resolve(wr);
        } catch (err) {
            return reject(err)
        }
    })
}

getMatchups('nunu', 'khazix', 'jungle').then(console.log).catch(console.error);

