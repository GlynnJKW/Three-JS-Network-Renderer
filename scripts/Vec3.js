export default class Vec3{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;

        this.xLocked = this.yLocked = this.zLocked = false;
    }

    get r(){return this.x;}
    get g(){return this.y;}
    get b(){return this.z;}

    get x(){
        return this._x;
    }
    set x(value){
        if(!this.xLocked){
            this._x = value;
        }
    }
    get y(){
        return this._y;
    }
    set y(value){
        if(!this.yLocked){
            this._y = value;
        }
    }
    get z(){
        return this._z;
    }
    set z(value){
        if(!this.zLocked){
            this._z = value;
        }
    }

    set(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

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

    add(other){
        return new Vec3(this.x + other.x * !this.xLocked, this.y + other.y * !this.yLocked, this.z + other.z * !this.zLocked).lock(this.xLocked, this.yLocked, this.zLocked);
    }

    sub(other){
        return new Vec3(this.x - other.x * !this.xLocked, this.y - other.y * !this.yLocked, this.z - other.z * !this.zLocked);
    }

    multiplyScalar(scalar){
        return this.mult(new Vec3(scalar,scalar,scalar));
    }

    mult(other){
        return new Vec3(this.x * (other.x * !this.xLocked + this.xLocked), this.y * (other.y * !this.yLocked + this.yLocked), this.z * (other.z * !this.zLocked + this.zLocked));
    }

    magnitude(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalized(){
        return this.multiplyScalar(1/this.magnitude());
    }

    threeVec(){
        return new THREE.Vector3(this.x, this.y, this.z);
    }

    static fromThreeVec(vec){
        return new Vec3(vec.x, vec.y, vec.z);
    }

    static create(x=0,y=0,z=0){
        return new Vec3(x,y,z);
    }
}