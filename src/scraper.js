const puppeteer = require('puppeteer');

const getMatchup = async (blueChamp, redChamp, lane) => {
    const browser = await puppeteer.launch();
    return new Promise(async (resolve, reject) => {
        try {
            const page = await browser.newPage();
            const url = `https://lolalytics.com/lol/${blueChamp}?lane=${lane}&vs=${redChamp}&vslane=${lane}`;
            console.log(url);
            await page.goto(url);
            try {
                await page.waitForSelector('.ChampionHeader_headervs__25ruZ', { timeout: 5000 });
            } catch (err) {
                browser.close();
                return reject('no data!');
            }
            const wr = await page.evaluate(() => {
                let headerText = document.querySelector('.ChampionHeader_headervs__25ruZ');
                let winrate = headerText.children[5].children[0].innerHTML;
                winrate = winrate.substring(0, winrate.indexOf('%'));
                let numberGames = headerText.children[5].children[1].innerHTML;
                numberGames = numberGames.substring(0, numberGames.indexOf('<'));
                return [winrate, numberGames];
            });
            browser.close();
            return resolve(wr);
        } catch (err) {
            browser.close();
            return reject(err);
        }
    })
}

module.exports = { getMatchup }

