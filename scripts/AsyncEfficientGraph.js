import EfficientGraph from './EfficientGraph';
import { sleep } from './Util';

export default class AsyncEfficientGraph extends EfficientGraph {

    constructor(){
        super();
        this.edgeTasks = [];
    }

    //wrap
    async shiftIntensity(index, intensity, time, numsteps){
        if(this.edgeTasks[index] == undefined){
            this.edgeTasks[index] = new TaskQueue(1).drop();
        }
        let tasks = this.edgeTasks[index];
        tasks.queue(this._shiftIntensity(index, intensity, time, numsteps));
    }

    //Asynchronously shift the intensity value of given index to the correct value
    * _shiftIntensity(index, intensity, time = 1, numsteps = 5){
        const originalIntensity = this.edgeObject.geometry.attributes.intensity.array[index * 4];
        const step = time/numsteps;
        const sleeptime = step * 1000;
        const percentStep = 1/numsteps;
        yield sleep(0);

        let timePercent = 1/numsteps;
        while(timePercent <= 1){
            let t = timePercent;
            //let t = EasingFunctions.easeInOutQuad(timePercent)
            let i = originalIntensity * (1 - t) + intensity * t;
            this.updateIntensity(index, i);
            timePercent += percentStep;
            yield sleep(sleeptime);
        }
    }

};