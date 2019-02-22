import { Vec3 } from '.';

//#region typedefs
    /**
     * @typedef {Object} NodeVisInfo
     * @property {Vec3} color - the color to render the node as
     * @property {number} width - the width of the node
     */

    /**
     * @typedef {Object} EdgeVisInfo
     * @property {Vec3} color - the color to render the edge as
     * @property {number} width - the weight of the edge
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
    return {color: c, width: 1}
}

/**
 * Color as gradient of intensity between red (0) and green (1)
 * @param {GraphEdge} edge 
 * @return {EdgeVisInfo} the visual info
 */
function StandardEdgeVisFunction(edge){
    let i = edge.intensity;
    let w = 0;
    if(i != null){
        w = Math.abs(0.5 - i) * 2;
    }
    let c = new Vec3(1 - i, i, 0);
    return {color: c, width: w}
}

export { StandardNodeVisFunction, StandardEdgeVisFunction, RedGreenEdgeVisFunction }