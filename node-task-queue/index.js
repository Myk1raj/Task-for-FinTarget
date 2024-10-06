const express = require('express'); 
const cluster = require('cluster'); 
const os = require('os'); 
const { taskLimiter, secondLimiter,remove_sec,remove_min } = require('./rate-limit'); 
const taskProcessor = require('./task-processor'); 
const {performWhileLoop_min,performWhileLoop_sec}= require('./while');

const numReplicas = 2; 
const app = express(); 
app.use(express.json()); 

const PORT = 3000;

if (cluster.isMaster) {
    
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numReplicas; i++) { 
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); 
    });

} else {
    
    app.post('/task', async (req, res) => {
        const userId = req.body.user_id;
        const taskLimitReached = taskLimiter(req, true);
        const secondLimitReached = secondLimiter(req, true);

        if (taskLimitReached) {
            try {
                performWhileLoop_min(req, userId);
                return res.status(202).send(`Task queued for user ${userId} (reason: too many requests in 20 sec)`);
            } catch (err) {
                console.error(`Error adding task for user ${userId}:`, err);
                return res.status(500).send("Internal Server Error");
            }
        }

        if (secondLimitReached) {
            try {
                performWhileLoop_sec(req, userId);
                return res.status(202).send(`Task queued for user ${userId} (reason: too many requests in one second)`);
            } catch (err) {
                console.error(`Error adding task for user ${userId}:`, err);
                return res.status(500).send("Internal Server Error");
            }
        }

        
        try {
            
            await taskProcessor.addTask(userId);  
            return res.send(`Task received for user ${userId}`);
        } catch (error) {
            console.error(`Error adding task for user ${userId}:`, error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} running on port ${PORT}`);
    });
}
