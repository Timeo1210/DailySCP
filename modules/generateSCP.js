const DatabaseAPI = require('./databaseAPI');
const FileAPI = require('./fileAPI');
const Scrap = require('./scrap');
const axios = require('axios').default;

async function generateSCP() {
    let isSCPValid = false;
    let SCP = {};
    const backupFileStream = FileAPI.createWriteStreamFromFile(process.env.BACKUP_DATABASE_FILEPATH, "a");
    while (isSCPValid === false) {
        const SCPNumber = await generateSCPNumber();

        await DatabaseAPI.addSCPNumber(SCPNumber);
        await FileAPI.writeToStream(`${SCPNumber}\n`, backupFileStream);

        const url = getURLFromSCPNumber(SCPNumber);
        SCP = await Scrap.scrapSCPfromURL(url);
        
        isSCPValid = checkIfSCPIsValid(SCP);
    }

    await backupFileStream.end();

    // TO OPTIMISE
    if (SCP.imgURL.length > 1) {
        SCP.imgURL = await getSCPImage(SCP.imgURL);
    }

    return SCP;
}

function getTweetTextFromSCP(SCP) {
    return `${SCP.title}\nClasse : ${SCP.class}\n${SCP.url}`;
}

async function getSCPImage(imgURL) {
    try {
        await downloadSCPImage(imgURL, process.env.NEXTSCP_IMAGE_FILEPATH);
        FileAPI.writeToFile(process.env.NEXTSCP_IMAGE_BIN_FILEPATH, FileAPI.readFromFile(process.env.NEXTSCP_IMAGE_FILEPATH));
        return "BIN";
    } catch (e) {
        return "";
    }
}

function downloadSCPImage(SCPImageURL, writeFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const writeFileStream = FileAPI.createWriteStreamFromFile(writeFilePath);
            axios({
                url: SCPImageURL,
                responseType: 'stream'
            }).then((request) => {
                if (request.headers['content-type'] !== "text/html; charset=utf-8") {
                    request.data.pipe(writeFileStream)
                        .on("finish", () => resolve())
                        .on("error", (e) => reject(e));
                } else {
                    reject();
                }
            }).catch((e) => {
                reject(e);
            })
        } catch(e) {
            reject(e);
        }
    })
}

async function generateSCPNumber() {
    try {
        let newSCPNumber = null;
        while (newSCPNumber === null) {
            const randomNumber = Math.floor(Math.random() * (6000 - 2) + 2);
            const randomStringNumber = convertNumberToSCPStringNumber(randomNumber);
            const queryDatabase = await DatabaseAPI.getSCPFromNumber(randomStringNumber);
            if (queryDatabase.length === 0) {
                newSCPNumber = randomStringNumber;
            }
        }
        return newSCPNumber;
    } catch(e) {
        console.error(e);
    }
}

function convertNumberToSCPStringNumber(randomNumber) {
    let SCPStringNumber = randomNumber.toString();
    if (randomNumber < 100) {
        if (randomNumber < 10) {
            SCPStringNumber = "0" + SCPStringNumber;
        }
        SCPStringNumber = "0" + SCPStringNumber;
    }
    return SCPStringNumber;
}

function getURLFromSCPNumber(SCPNumber) {
    return `http://fondationscp.wikidot.com/scp-${SCPNumber}`;
}

function checkIfSCPIsValid(SCP = null) {
    try {
        if (
            typeof SCP.title === "string" && SCP.title.length > 1
            && typeof SCP.class === "string" && SCP.class.length > 1
        ) return true;
    } catch (e) {
        return false;
    }
    return false;
}

module.exports = {
    generateSCP,
    getTweetTextFromSCP
};