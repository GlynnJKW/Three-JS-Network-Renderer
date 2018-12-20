class LayeredGraph extends EfficientGraph{

    constructor(numLayers, nodesPerLayer){
        super(...arguments);
        this.layout = [];
        this.nodesPerLayer = nodesPerLayer;
        this.numLayers = numLayers;
        for(let i = 0; i < numLayers; ++i){
            this.layout.push([]);

            for(let j = 0; j < nodesPerLayer; ++j){
                let node = new EfficientNode({name: `l${i}n${j}`, position: new Vec3(i, j, 0)});
                this.layout[i][j] = node;
                this.addNode(node);
            }
        }
    }

    oscm(num = 1){
        if(num > 1){
            this.oscm(num - 1);
        }
        this.uncrossReverse();
        this.uncross();
    }

    uncross(){
        let newlayout = [];
        newlayout[this.numLayers - 1] = this.layout[this.numLayers - 1]
        
        for(let layer = this.numLayers - 2; layer >= 0; --layer){
            let layerlayout = [];
            for(let n = 0; n < this.nodesPerLayer; ++n){
                let oldnode = this.layout[layer][n];
                if(!oldnode.edges.length){
                    layerlayout[layerlayout.length >= this.nodesPerLayer ? layerlayout.length : this.nodesPerLayer] = oldnode;
                }
                else if(oldnode.edges.length == 1){
                    this._findSlot(oldnode, layerlayout, oldnode.edges[0].target.position.y);
                }
                else{
                    let median = oldnode.edges[Math.round((oldnode.edges.length - 1) / 2)].target.position.y;
                    this._findSlot(oldnode, layerlayout, median);    
                }
            }
            newlayout[layer] = layerlayout.filter(n => n != null);
            for(let n = 0; n < this.nodesPerLayer; ++n){
                newlayout[layer][n].position.set(layer, n, 0);
            }
        }

        this.layout = newlayout;
    }

    uncrossReverse(){
        let newlayout = [];
        newlayout[0] = this.layout[0];
    
        for(let layer = 1; layer < this.numLayers - 1; ++layer){
            let layerlayout = [];
            let layeredges = []
            for(let node of this.layout[layer-1]){
                layeredges = layeredges.concat(node.edges);
            }
            for(let n = 0; n < this.nodesPerLayer; ++n){
                let oldnode = this.layout[layer][n];
                let connected = layeredges.filter(e => e.target == oldnode);
                if(!connected.length){
                    layerlayout[layerlayout.length >= this.nodesPerLayer ? layerlayout.length : this.nodesPerLayer] = oldnode;
                }
                else if(connected.length == 1){
                    this._findSlot(oldnode, layerlayout, connected[0].source.position.y);
                }
                else{
                    let median = connected[Math.round((connected.length - 1) / 2)].source.position.y;
                    this._findSlot(oldnode, layerlayout, median);
                }
            }
            newlayout[layer] = layerlayout.filter(n => n != null);
            for(let n = 0; n < this.nodesPerLayer; ++n){
                newlayout[layer][n].position.set(layer, n, 0);
            }
        }
    
        this.layout = newlayout;
    }

    _findSlot(node, layout, location){
        if(location == -1){
            layout.unshift(node);
            // console.log(layout.map(n => n.name), location);
        }
        else{
            if(layout[location]){
                let parity1 = layout[location].edges.length;// % 2;
                let parity2 = node.edges.length;// % 2;
                if(parity1 != parity2){
                    if(parity2 > parity1){
                        this._findSlot(node, layout, location - 1);
                    }
                    else{
                        let newNode = layout[location];
                        layout[location] = node;
                        this._findSlot(newNode, layout, location - 1);
                    }
                }
                else{
                    let newNode = layout[location];
                    layout[location] = node;
                    this._findSlot(newNode, layout, location - 1);
                }
            }
            else{
                layout[location] = node;
                // console.log(layout.map(n => n.name), location);    
            }    
        }
    }

    
}