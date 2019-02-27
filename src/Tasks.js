class Task {

    constructor(func, runOnStart = true, callback = null){
        this._function = func;
        this._run = runOnStart;
        this._done = false;
        this._callbacks = [];
        if(callback && typeof callback == "function"){
            this._callbacks.push(callback);
        }
        if(runOnStart){
            this._step();
        }
    }

    async _step(){
        if(this._run && !this._done){
            const s = this._function.next();
            this._currentValue = await s.value;
            if(!s.done){
                this._step();
            }
            else{
                this._done = true;
                if(this._callbacks.length > 0){
                    for(let callback of this._callbacks){
                        callback(s.value);
                    }
                }
            }
        }
    }

    then(callback){
        if(typeof callback == "function"){
            this._callbacks.push(callback);
        }
        return this;
    }

    stop(){
        this._run = false;
        return this;
    }
    start(){
        this._run = true;
        this._step();
        return this;
    }
}


class TaskQueue {
    constructor(maxRunning){
        this._maxRunning = maxRunning;
        this._queue = [];
        this._running = [];
    }

    queue(func){
        //Create paused task and set it to call taskFinished when it ends
        const task = new Task(func, false);
        task.then(this.taskFinished.bind(this, task));

        if(this._running.length == this._maxRunning){
            this._queue.push(task);
        }
        else{
            this._running.push(task.start());
        }
        return this;
    }

    taskFinished(task){
        //Find index of finished task, delete it, and start next task in queue (if available)
        const index = this._running.findIndex(t => t == task)
        this._running.splice(index, 1);
        if(this._queue.length > 0){
            this._running.push(this._queue.shift().start());
        }
    }

    drop(){
        //replace the default queue function with a function that drops the last started task (FILO)
        this.queue = function(func){
            const task = new Task(func, false);
            task.then(this.taskFinished.bind(this, task));
            if(this._running.length == this._maxRunning){
                this._running.shift().stop();
                this._running.push(task.start());
            }
            else{
                this._running.push(task.start());
            }
            return this;    
        }
        return this;
    }

    wait(){
        this.queue = function(func){
            //Create paused task and set it to call taskFinished when it ends
            const task = new Task(func, false);
            task.then(this.taskFinished.bind(this, task));
    
            if(this._running.length == this._maxRunning){
                this._queue.push(task);
            }
            else{
                this._running.push(task.start());
            }
            return this;
        }
    }
}