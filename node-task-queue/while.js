const taskProcessor = require('./task-processor'); 
const { taskLimiter, secondLimiter, remove_sec, remove_min } = require('./rate-limit'); 

const waitForLimitReset = (checkLimitFunc, interval = 1000) => {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (!checkLimitFunc()) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval);
    });
};

const performWhileLoop_min = async (req, userID) => {
    console.log("performWhileLoop_min");
    await waitForLimitReset(() => taskLimiter(req, false));
    await taskProcessor.addTask(userID);
};

const performWhileLoop_sec = async (req, userID) => {
    await waitForLimitReset(() => secondLimiter(req, false), 100); // Check every 100ms for second limits
    await taskProcessor.addTask(userID);
};

module.exports = { performWhileLoop_min, performWhileLoop_sec };
