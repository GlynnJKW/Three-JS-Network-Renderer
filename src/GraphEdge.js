/**
 * @property {EfficientNode} source
 * @property {EfficientNode} target
 */
export default class GraphEdge {
    constructor(src, tgt){
        this.source = src;
        this.target = tgt;
    }

    setSourceIndex(ind){
        this.sourceIndex = ind;
    }

    setTargetIndex(ind){
        this.targetIndex = ind;
    }

    /**
     * Returns the node (source or target) that is not equal to the input node
     * @param {EfficientNode} start 
     * @returns {EfficientNode} 
     */
    getNode(start){
        return start == this.source ? this.target : this.source;
    }
}