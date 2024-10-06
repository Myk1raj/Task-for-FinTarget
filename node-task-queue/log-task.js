const fs = require('fs');
const logFilePath = './task-log.txt';  
const formatDateTime = () => {
    const now = new Date();
    return `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`; 
};

const logTask = (userId) => {
    const logMessage = `${userId}-task completed at ${formatDateTime()}\n`;
    fs.appendFileSync(logFilePath, logMessage);
};

module.exports = logTask;
