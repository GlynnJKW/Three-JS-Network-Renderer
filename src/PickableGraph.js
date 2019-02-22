import * as THREE from 'three';
import EfficientGraph from './EfficientGraph';

/**
 * @extends EfficientGraph
 */
export default class PickableGraph extends EfficientGraph{
    /**
     * Stop displaying the edges and change the material to the picking material (color based on index)
     */
    prepareForPicking(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.remove(this.edgeObject.mesh);
        }

        if(this.nodesObject && this.nodesObject.mesh){
            this.nodesObject.mesh.material.defines.SELECTION_BUFFER = true;
            this.nodesObject.mesh.material.needsUpdate = true;
        }

        // Modify visualization function so that the color of the node is = to its id
        this._savedFunction = this.nodeVisFunction;
        this.nodeVisFunction = (node) => {
            let info = this._savedFunction(node);
            info.color = new THREE.Color().setHex(node.gnid + 1);
            return info;
        }
        this.updateVis();
    }

    /**
     * Display the edges and change the material back to default
     */
    revertToNormal(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.add(this.edgeObject.mesh);
        }

        if(this.nodesObject && this.nodesObject.mesh){
            this.nodesObject.mesh.material.defines.SELECTION_BUFFER = false;
            this.nodesObject.mesh.material.needsUpdate = true;
        }

        this.nodeVisFunction = this._savedFunction;
        this.updateVis();
    }
}