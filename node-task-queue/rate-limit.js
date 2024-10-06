const rateLimit = require('express-rate-limit');
const { commandOptions } = require('redis');

let userRequests_sec = {}; 
let userRequests_min = {};
const secondLimiter =  (req,myk) => {
    const userId = req.body.user_id;
    const now = Date.now();

    if (!userRequests_sec[userId]) {
        userRequests_sec[userId] = [];
    }
    
    userRequests_sec[userId] = userRequests_sec[userId].filter(timestamp => now - timestamp < 1000);

    if (userRequests_sec[userId].length >= 1) {
        return true; 
    }

    
    if(myk){
        userRequests_sec[userId].push(now);
    }
    
    
    return false; 
};

const taskLimiter =  (req,myk) => {
    const userId = req.body.user_id;
    const oneMinuteInMillis = 20000; 
    const now = Date.now();
    if (userRequests_min[userId]) {
        const now = Date.now();
        
        userRequests_min[userId] = userRequests_min[userId].filter(timestamp => (now - timestamp) <= oneMinuteInMillis);
    } else {
        userRequests_min[userId] = [];
    }
    if (userRequests_min[userId].length >= 5) {
        return true; 
    }
    if(myk){
        userRequests_min[userId].push(now);
    }
    
    
    return false; 
};
const remove_sec=(req)=>{
    const userId = req.body.user_id;

    userRequests_sec[userId].pop();
}
const remove_min=(req)=>{
    const userId = req.body.user_id;

    userRequests_min[userId].pop();
}

module.exports = { taskLimiter, secondLimiter ,remove_sec,remove_min};
