import { Vec3 } from '.';

//#region typedefs
    /**
     * @typedef {Object} NodeVisInfo
     * @property {Vec3} color - the color to render the node as
     */

    /**
     * @typedef {Object} EdgeVisInfo
     * @property {Vec3} color - the color to render the edge as
     * @property {number} intensity - the weight of the edge
     */
//#endregion

/**
 * Default visualization function
 * @param {EfficientNode} node 
 * @return {NodeVisInfo}
 */
function StandardNodeVisFunction(node){
    let c = node.color;
    if(!c){ c = new Vec3(1,1,1); }
    return {color: c}
}

/**
 * Default visualization function
 * @param {GraphEdge} edge 
 * @return {EdgeVisInfo} 
 */
function StandardEdgeVisFunction(edge){
    let c = edge.color;
    if(!c){ c = new Vec3(1,1,1); }
    let i = edge.intensity;
    if(i == null){
        i = 0.5;
    }
    return {color: c, intensity: i}
}

/**
 * Color as gradient of intensity between red (0) and green (1)
 * @param {GraphEdge} edge 
 * @return {EdgeVisInfo} the visual info
 */
function RedGreenEdgeVisFunction(edge){
    let i = edge.intensity;
    if(i == null){
        i = 0.5;
    }
    let c = new Vec3(1 - i, i, 0);
    return {color: c, intensity: i}
}

export { StandardNodeVisFunction, StandardEdgeVisFunction, RedGreenEdgeVisFunction }