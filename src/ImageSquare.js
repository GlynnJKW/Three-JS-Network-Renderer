import { Object3D, PlaneGeometry, TextureLoader, MeshBasicMaterial, DoubleSide, Mesh } from "three";

export default class ImageSquare extends Object3D{
    constructor(imageSrc){
        super();
        let geometry = new PlaneGeometry();
        let img = new TextureLoader().load(imageSrc);
        let material = new MeshBasicMaterial({map: img, side: DoubleSide});
        this.plane = new Mesh(geometry, material);
        this.add(this.plane);
    }
}