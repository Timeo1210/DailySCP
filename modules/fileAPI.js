const fs = require('fs');
const path = require('path');

function checkIfFileExist(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (e) {
        return false;
    }
}

function readCSVToCSVArray(csvPath) {
    try {
        const content = fs.readFileSync(csvPath).toString();
        const parsedCSV = convertCSVStringToCSVArray(content);
        return parsedCSV;
    } catch(e) {
        console.error(e);
    }
}

function writeCSVFromCSVArray(writeFilePath, contentArray) {
    try {
        keysOfContent = Object.keys(contentArray);
        const fileStream = fs.createWriteStream(writeFilePath);
        for (let i = 0; i < keysOfContent.length; i++) {
            writeToStream(`${keysOfContent[i]},${contentArray[keysOfContent[i]]}\n`, fileStream);
        }
        fileStream.close();
    } catch(e) {
        console.error(e);
    }
}

function convertCSVArrayToCSVObject(csvArray) {
    const returnObject = {};
    for (let i = 0; i < csvArray.length; i++) {
        returnObject[csvArray[i][0]] = csvArray[i][1];
    }
    return returnObject;
}

/**
 * REPLACE %ROOT% to the root path of the app
 */
function convertDefaultPathToFinalPath(defaultPath) {
    const rootPath = path.dirname(require.main.filename);
    return defaultPath.replace("%ROOT%", rootPath);
}

function createReadStreamFromFile(filePath) {
    try {
        return fs.createReadStream(filePath);
    } catch(e) {
        console.error(e);
    }
}

function createWriteStreamFromFile(filePath, flags = "w") {
    try {
        return fs.createWriteStream(filePath, {flags});
    } catch(e) {
        console.error(e);
    }
}

function writeToStream(content, writeStream) {
    try {
        writeStream.write(content);
    } catch(e) {
        console.error(e);
    }
}

function readFromFile(filePath) {
    try {
        const bitmap = fs.readFileSync(filePath);
        return bitmap;
    } catch(e) {
        console.error(e);
    }
}

function writeToFile(filePath, content = "", flag = "w") {
    try {
        fs.writeFileSync(filePath, content, {flag});
    } catch (e) {
        console.error(e);
    }
}

function convertCSVStringToCSVArray(content) {
    const contentArray = content.split("\n");
    contentArray.pop();
    const returnArray = []
    for (let lineIndex in contentArray) {
        returnLine = contentArray[lineIndex].split(",");
        returnArray.push(returnLine);
    }
    return returnArray;
}

module.exports = {
    checkIfFileExist,
    readCSVToCSVArray,
    writeCSVFromCSVArray,
    convertCSVArrayToCSVObject,
    convertDefaultPathToFinalPath,
    createReadStreamFromFile,
    createWriteStreamFromFile,
    writeToStream,
    readFromFile,
    writeToFile
};