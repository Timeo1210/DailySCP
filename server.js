if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// ENV FILE PATH
const allDefaultPathKey = ["BACKUP_DATABASE_FILEPATH", "NEXTSCP_FILEPATH", "NEXTSCP_IMAGE_BIN_FILEPATH", "NEXTSCP_IMAGE_FILEPATH"];

// LOAD DATABASE
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => {
    console.log('Connected to database');
    
    /* DELETE DATABASE
    db.dropDatabase((err) => {
        console.error(err)
    })
    */
    
    
});


const TwitterAPI = require(__dirname + '/modules/twitterAPI.js');
const FileAPI = require(__dirname + '/modules/fileAPI.js');
const GenerateSCP = require(__dirname + "/modules/generateSCP.js");

// LOAD ENV FILE PATH
for (let i = 0; i < allDefaultPathKey.length; i++) {
    process.env[allDefaultPathKey[i]] = FileAPI.convertDefaultPathToFinalPath(process.env[allDefaultPathKey[i]]);
    if (!FileAPI.checkIfFileExist(process.env[allDefaultPathKey[i]])) {
        FileAPI.writeToFile(process.env[allDefaultPathKey[i]], "", "wx");
    }
}

if (process.env.EXECUTE_ONCE_MAIN_WITHOUT_TWEET === "true") {
    Main(false).then(() => {
        setTimeout(() => {
            process.exit(0)
        }, 1000)
    });
}

async function Main(tweet = true) {
    
    console.log("---GET SCP---");
    const SCPArray = FileAPI.readCSVToCSVArray(process.env.NEXTSCP_FILEPATH);
    const SCP = FileAPI.convertCSVArrayToCSVObject(SCPArray);
    
    console.log("---TWEET SCP---");
    if (tweet) await TwitterAPI.postTweet(SCP);

    console.log("---SCRAP NEXTSCP---");
    const newSCP = await GenerateSCP.generateSCP();
    if (newSCP.imgURL === "BIN") {
        console.log("---POST IMAGE ON TWITTER---");
        const newMediaId = await TwitterAPI.postImage(process.env.NEXTSCP_IMAGE_BIN_FILEPATH);
        newSCP.imgURL = newMediaId;
    }
    await FileAPI.writeCSVFromCSVArray(process.env.NEXTSCP_FILEPATH, newSCP);

    console.log("---END---");
}

var mainWasExecuted = false;
const loopHour = parseInt(process.env.LOOP_EXECUTE_HOUR) || 20;
const loopMinute = parseInt(process.env.LOOP_EXECUTE_MINUTE) || 0;
setInterval(async () => {
    const date = new Date(); 
    if (date.getHours() === loopHour && date.getMinutes() === loopMinute) {
        if (!mainWasExecuted) {
            Main();
            mainWasExecuted = true;
        }
    } else {
        mainWasExecuted = false;
    }
}, 60000);

