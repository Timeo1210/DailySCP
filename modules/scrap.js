const puppeteer = require('puppeteer');

async function scrapSCPfromURL(url) {
    try {
        const launchBrowserParams = {
            args: ['--no-sandbox']
        };
        if (process.env.CHROME_EXECUTABLE_PATH !== undefined) {
            launchBrowserParams.executablePath = process.env.CHROME_EXECUTABLE_PATH
        }
        const browser = await puppeteer.launch(launchBrowserParams);
        const {page, SCPContentDOM} = await getPageAndSCPContentDOM(browser, url);
        
        const [ SCPTitle, SCPClass, SCPImageURL ] = await Promise.all([
            ScrapperAPI.getSCPTitle(browser, url),
            ScrapperAPI.getSCPClass(page, SCPContentDOM),
            ScrapperAPI.getSCPImageURL(page, SCPContentDOM)
        ]);
    
        const SCP = {
            title: SCPTitle,
            class: SCPClass,
            imgURL: SCPImageURL,
            url
        };
    
        await browser.close();
        return SCP;
    } catch(e) {
        console.error(e);
    }
}

const ScrapperAPI = {
    async getSCPTitle(browser, url) {
        try {
            const SCPNumber = getSCPNumberFromURL(url);
            let SCPInt = getSCPIntFromSCPNumber(SCPNumber);
            
            const listURL = getListURLFromSCPNumber(SCPNumber);
            SCPInt = SCPInt - (Math.trunc(SCPInt/1000) * 1000);
            const page = await browser.newPage();
            const SCPTitle = await getTextLiFromListURL(page, listURL, SCPInt);

            return SCPTitle;
        } catch(e) {
            return "";
        }
    },
    async getSCPClass(page, SCPContentDOM) {
        try {
            const classDOM = await SCPContentDOM.$('* > p:nth-of-type(2)');
            const text = await page.evaluate(el => el.textContent, classDOM);
            //                [ AFTER :        ]{SPACE}
            const classText = text.split(":")[1].trim();
            return classText;
        } catch(e) {
            return "";
        }
    },
    async getSCPImageURL(page, SCPContentDOM) {
        try {
            const imageWrapperDOM = await SCPContentDOM.$('.scp-image-block');
            const imageDOM = await imageWrapperDOM.$('img');
            const url = await page.evaluate(img => img.getAttribute('src'), imageDOM);
            return url;
        } catch(e) {
            return "";
        }
    }
}

function getSCPNumberFromURL(url) {
    return url.split("/").reverse()[0].toUpperCase();
}

function getSCPIntFromSCPNumber(SCPNumber) {
    return parseInt(SCPNumber.split("-")[1]);
}

function getListURLFromSCPNumber(SCPNumber) {
    const SCPInt = getSCPIntFromSCPNumber(SCPNumber);
    let returnURL = "http://fondationscp.wikidot.com/scp-series";
    if (SCPInt >= 1000) {
        const seriesIndex = Math.trunc(SCPInt / 1000);
        returnURL += `-${seriesIndex}`;
    }
    return returnURL;
}

async function getTextLiFromListURL(page, listURL, SCPInt) {
    if (SCPInt >= 1000) {
        SCPInt = SCPInt - (Math.trunc(SCPInt/1000) * 1000);
    }
    await page.setDefaultNavigationTimeout(0); 
    await page.goto(listURL);
    await page.waitForSelector('#page-content');

    const listSCPDOM = await page.$('#page-content > div');

    const ulList = Array.from(await listSCPDOM.$$('ul'));
    ulList.shift();
    const ulIndex = Math.trunc(SCPInt/100);
    SCPInt = SCPInt - (ulIndex * 100);
    const currentUlDOM = ulList[ulIndex];

    const liList = Array.from(await currentUlDOM.$$('li'));
    const liIndex = SCPInt;
    const currentLiDOM = liList[liIndex];
    
    const textLi = await page.evaluate(el => el.textContent, currentLiDOM);

    return textLi;
}

async function getPageAndSCPContentDOM(browser, url) {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 
    await page.goto(url);
    await page.waitForSelector('#page-content')

    const SCPContentDOM = await page.$('#page-content');
    return { page, SCPContentDOM };
}

module.exports = {
    scrapSCPfromURL
};