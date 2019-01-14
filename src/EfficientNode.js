import Vec3 from './Vec3';

export default class EfficientNode {
    constructor(options={}){
        this.name = options.name ? options.name : Date.now().toFixed();
        this.position = options.position ? options.position : new Vec3(0,0,0);
        if(options.physics){
            this.forces = new Vec3(0,0,0);
            this.velocity = new Vec3(0,0,0);
        }
        this.edges = [];
        this.color = options.color ? options.color : new Vec3(1,1,1);
        this.gnid = 0; //graph node id number
    }

    get startPos(){
        return this.position;
    }

    get endPos(){
        return this.position;
    }
}