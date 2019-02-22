import Vec3 from './Vec3';

/**
 * @property {string} name
 * @property {Vec3} position
 * @property {GraphEdge[]} edges
 * @property {Vec3} color
 * @property {number} gnid - the id number of this node inside of its parent graph
 */
export default class EfficientNode {
    /**
     * 
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {Vec3} [options.position]
     * @param {boolean} [options.physics]
     * @param {Vec3} [options.color]
     */
    constructor(options={}){
        this.name = options.name ? options.name : Date.now().toFixed();
        this.position = options.position ? options.position : new Vec3(0,0,0);
        if(options.physics){
            this.forces = new Vec3(0,0,0);
            this.velocity = new Vec3(0,0,0);
        }
        this.edges = [];
        this.parentEdges = [];
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