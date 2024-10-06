const Queue = require('bull');
const logTask = require('./log-task');  

const taskQueue = new Queue('task-queue', {
    redis: { host: '127.0.0.1', port: 6379 }  
});

const addTask = async (userId) => {
    await taskQueue.add({ user_id: userId });
};

taskQueue.process(async (job) => {
    const { user_id } = job.data;

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        logTask(user_id); // Log task completion
        console.log(`Task completed for user ${user_id}`); 
    } catch (error) {
        console.error(`Error processing task for user ${user_id}:`, error);
    }
});

taskQueue.on('completed', (job) => {
});

taskQueue.on('failed', (job, err) => {
});

module.exports = { addTask };
