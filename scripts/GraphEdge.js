class GraphEdge {
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

    getNode(start){
        return start == this.source ? this.target : this.source;
    }
}