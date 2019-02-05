export default class Vec3{
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;

        this.xLocked = this.yLocked = this.zLocked = false;
    }
    /** @type {number} */
    get r(){return this.x;}

    /** @type {number} */
    get g(){return this.y;}

    /** @type {number} */
    get b(){return this.z;}

    /** @type {number} */
    get x(){
        return this._x;
    }
    set x(value){
        if(!this.xLocked){
            this._x = value;
        }
    }

    /** @type {number} */
    get y(){
        return this._y;
    }
    set y(value){
        if(!this.yLocked){
            this._y = value;
        }
    }

    /** @type {number} */
    get z(){
        return this._z;
    }
    set z(value){
        if(!this.zLocked){
            this._z = value;
        }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    set(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * @param {boolean} x 
     * @param {boolean} y 
     * @param {boolean} z 
     */
    lock(x, y, z){
        if(x){
            this.xLocked = true;
        }
        if(y){
            this.yLocked = true;
        }
        if(z){
            this.zLocked = true;
        }
        return this;
    }

    /** @param {Vec3} other */
    add(other){
        return new Vec3(this.x + other.x * !this.xLocked, this.y + other.y * !this.yLocked, this.z + other.z * !this.zLocked).lock(this.xLocked, this.yLocked, this.zLocked);
    }

    /** @param {Vec3} other */
    sub(other){
        return new Vec3(this.x - other.x * !this.xLocked, this.y - other.y * !this.yLocked, this.z - other.z * !this.zLocked);
    }

    /** @param {number} scalar */
    multiplyScalar(scalar){
        return this.mult(new Vec3(scalar,scalar,scalar));
    }

    /** @param {Vec3} other */
    mult(other){
        return new Vec3(this.x * (other.x * !this.xLocked + this.xLocked), this.y * (other.y * !this.yLocked + this.yLocked), this.z * (other.z * !this.zLocked + this.zLocked));
    }

    /** @returns {number} magnitude of vector */
    magnitude(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /** @returns {Vec3} normalized version of this vector */
    normalized(){
        return this.multiplyScalar(1/this.magnitude());
    }

    /** @returns {THREE.Vector3} a three.js version of this vector */
    threeVec(){
        return new THREE.Vector3(this.x, this.y, this.z);
    }

    /** 
     * @param {THREE.Vector3} vec
     * @returns {Vec3} 
     */
    static fromThreeVec(vec){
        return new Vec3(vec.x, vec.y, vec.z);
    }

    /**
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {Vec3} A Vec3 with the given values
     */
    static create(x=0,y=0,z=0){
        return new Vec3(x,y,z);
    }
}