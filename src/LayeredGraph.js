import PickableGraph from './PickableGraph';
import EfficientNode from './EfficientNode';
import Vec3 from './Vec3';

export default class LayeredGraph extends PickableGraph{

    constructor(numLayers, nodesPerLayer, layoutMethod="SPREADMAX", createOnStartup=true){
        super(...arguments);
        this.directed = true;
        this.layout = [];
        if(typeof nodesPerLayer == "number"){
            this.nodesPerLayer = new Array(numLayers).fill(nodesPerLayer);
        }
        else if(typeof nodesPerLayer == "object" && nodesPerLayer.length == numLayers){
            this.nodesPerLayer = nodesPerLayer;
        }
        else{
            throw "Parameter 'nodesPerLayer' in constructor is invalid - not a number or array of length numLayers";
        }
        this.numLayers = numLayers;
        this.layoutMethod = layoutMethod

        for(let i = 0; i < numLayers; ++i){
            this.layout.push([]);
            
            if(createOnStartup){
                for(let j = 0; j < this.nodesPerLayer[i]; ++j){
                    let pos = new Vec3(i, j, 0);

                    let node = new EfficientNode({name: `l${i}n${j}`, position: pos});
                    this.addNode(node, i, j);
                }
            }
        }
        this._equalizeLayout(this.layoutMethod);
    }

    _equalizeLayout(method){
        let maxNPL = Math.max(...this.nodesPerLayer);
        let minNPL = Math.min(...this.nodesPerLayer);
        if(method != "SPREADMIN" && method != "SPREADMAX" && method != "CENTER" && method != "NONE"){
            return;
        }

        for(let i = 0; i < this.numLayers; ++i){
            for(let j = 0; j < this.nodesPerLayer[i]; ++j){
                if(method == "SPREADMAX"){
                    this.layout[i][j].position.y = j * (maxNPL / this.nodesPerLayer[i]);
                }
                else if(method == "SPREADMIN"){
                    this.layout[i][j].position.y = j * (minNPL / this.nodesPerLayer[i]);
                }
                else if(method == "CENTER"){
                    this.layout[i][j].position.y = j + (maxNPL - this.nodesPerLayer[i]) / 2;
                }       
                else if(method == "NONE"){
                    this.layout[i][j].position.y = j;
                }     
            }
        }
    }

    /**
     * Adds node to graph in the given layer and position
     * @param {EfficientNode} node 
     * @param {number} layer 
     * @param {number} position 
     */
    addNode(node, layer, position){
        this.layout[layer][position] = node;
        super.addNode(node);
    }

    /**
     * One-sided crossing minimization
     * @param {number} [num=100] the number of times to iterate the minimization function 
     */
    oscm(num = 100){
        if(num > 1){
            this.oscm(num - 1);
        }
        this.uncrossReverse();
        this.uncross();
    }

    //TODO: uncross and uncrossReverse need to be fixed for layers that have different numbers of nodes

    /**
     * Attempts to minimize crossing by using the midpoint heuristic
     */
    uncross(){
        this._equalizeLayout("NONE");
        let newlayout = [];
        newlayout[this.numLayers - 1] = this.layout[this.numLayers - 1]
        
        for(let layer = this.numLayers - 2; layer >= 0; --layer){
            let ratio = this.nodesPerLayer[layer] / this.nodesPerLayer[layer + 1];
            let layerlayout = [];
            let unconnected = [];
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                let oldnode = this.layout[layer][n];
                if(!oldnode.edges.length){
                    unconnected.push(oldnode);
                }
                else if(oldnode.edges.length == 1){
                    this._findSlot(oldnode, layerlayout, Math.round(oldnode.edges[0].target.position.y * ratio));
                }
                else{
                    let median = Math.round(oldnode.edges[Math.round((oldnode.edges.length - 1) / 2)].target.position.y * ratio);
                    this._findSlot(oldnode, layerlayout, median);    
                }
            }
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                if(layerlayout[n] == null){
                    layerlayout[n] = unconnected.shift();
                }
            }
            newlayout[layer] = layerlayout.filter(n => n != null);
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                newlayout[layer][n].position.set(layer, n, 0);
            }
        }

        this.layout = newlayout;
        this._equalizeLayout(this.layoutMethod);
    }

    /**
     * Attempts to minimize crossing by using the midpoint heuristic
     */
    uncrossReverse(){
        this._equalizeLayout("NONE");
        let newlayout = [];
        newlayout[0] = this.layout[0];
    
        for(let layer = 1; layer < this.numLayers; ++layer){
            let ratio = this.nodesPerLayer[layer] / this.nodesPerLayer[layer - 1];
            let layerlayout = [];
            let layeredges = [];
            let unconnected = [];
            for(let node of this.layout[layer-1]){
                layeredges = layeredges.concat(node.edges);
            }
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                let oldnode = this.layout[layer][n];
                let connected = layeredges.filter(e => e.target == oldnode);
                if(!connected.length){
                    unconnected.push(oldnode);
                }
                else if(connected.length == 1){
                    this._findSlot(oldnode, layerlayout, Math.round(connected[0].source.position.y * ratio));
                }
                else{
                    let median = Math.round(connected[Math.round((connected.length - 1) / 2)].source.position.y * ratio);
                    this._findSlot(oldnode, layerlayout, median);
                }
            }
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                if(layerlayout[n] == null){
                    layerlayout[n] = unconnected.shift();
                }
            }
            newlayout[layer] = layerlayout.filter(n => n != null);
            for(let n = 0; n < this.nodesPerLayer[layer]; ++n){
                newlayout[layer][n].position.set(layer, n, 0);
            }
        }
    
        this.layout = newlayout;
        this._equalizeLayout(this.layoutMethod);
    }

    /**
     * @param {EfficientNode} node 
     * @param {Array<EfficientNode>} layout 
     * @param {number} location 
     */
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