const mongoose = require('mongoose');
const SCP_Model = require("../models/SCP.js");

async function getSCPFromNumber(SCPNumber) {
    const queryDatabase = await SCP_Model.find({
        number: SCPNumber
    })
    return queryDatabase;
}

async function addSCPNumber(SCPNumber) {
    try {
        const newSCPNumber = new SCP_Model({
            number: SCPNumber
        });
        await newSCPNumber.save()
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    getSCPFromNumber,
    addSCPNumber
}