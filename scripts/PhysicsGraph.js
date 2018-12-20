class PhysicsGraph extends Graph {
    constructor(){
        super();
        this.movableNodes = [];
        this.nodes = [];
        // this.nodePositions = [];
        this.edges = [];
        this.lookup = [];
        this.repulsion = 1.0;
        this.damping = 0.9;
        this.springconstant = 10.0;
        this.directed = false;
        this.maxVelocity = 1;
        // this.numNeighbors = 100;
    }

    AddFidget(){
        const scale = Math.pow(this.nodes.length/10, 0.5);
        for(let n of this.nodes.filter(n => !n.locked)){
            n.position.set(Math.random() * scale - scale/2, Math.random()  * scale - scale/2, Math.random() * scale - scale/2);
        }
    }

    //Do num ticks of physics simulation on the force-directed layout algorithm
    async TickForceLayout(num=1){
        this.movableNodes = this.nodes.filter(n => !n.locked);
        for(let i = 0; i < num; ++i){
            // this.nearestneighbors = Flann.fromDataset(this.nodePositions).multiQuery(this.nodePositions, this.numNeighbors);
            await Promise.all([this.applyCoulombsLaw(),  this.applyHookesLaw(), this.attractToCenter()]);
            this.updateVelocity();
            this.updatePosition();
        }
        if(this.edgeObject){
            this.updateEdgeGeom()
        }
        else{
            this.setEdgeGeom();
        }    
    }

    startSim(tickrate = 25){
        this.simRunning = true;
        this.tickSim(tickrate);
    }

    async tickSim(tickrate){
        // console.log(this.simRunning);
        if(this.simRunning){
            this.TickForceLayout();
            await sleep(tickrate);
            this.tickSim(tickrate)
        }
    }

    stopSim(){
        this.simRunning = false;
    }

    //Apply forces from Coulomb's law (nodes repel each other quadratically)
    async applyCoulombsLaw(){
        for(let n1 of this.movableNodes){
            for(let n2 of this.nodes){
                if(n1 !== n2){
                    let p1 = Vec3.fromThreeVec(n1.position);
                    let p2 = Vec3.fromThreeVec(n2.position);

                    let distance = p1.sub(p2).magnitude();
                    //Make sure not to divide by 0;
                    if(distance <= 0.01) continue;
                    let direction = p1.sub(p2).normalized();

                    let scalar = 1.0 / (distance * distance * 0.5)
                    let force = direction.multiplyScalar(this.repulsion).multiplyScalar(scalar);
                    n1.forces = n1.forces.add(force);
                    n2.forces = n2.forces.add(force.multiplyScalar(-1));
                }
            }
        }
    }

    //Apply forces from Hooke's law (edges act like springs)
    async applyHookesLaw(){
        for(let e of this.edges){
            let n1 = e.source;
            let n2 = e.target;
            let p1 = Vec3.fromThreeVec(n1.position);
            let p2 = Vec3.fromThreeVec(n2.position);

            let distance = p1.sub(p2).magnitude();
            //Make sure not to divide by 0;
            if(distance <= 0.01) continue;
            let direction = p1.sub(p2).normalized();


            let l = e.edgeLength ? e.edgeLength : 5.0;
            let displacement = l - distance;

            let force = direction.multiplyScalar(this.springconstant * displacement * 0.5);
            n1.forces = n1.forces.add(force);
            n2.forces = n2.forces.add(force.multiplyScalar(-1));
        }
    }

    //Attract all nodes toward the center of the graph
    async attractToCenter(){
        for(let n of this.movableNodes){
            let p = Vec3.fromThreeVec(n.position);
            let direction = p.multiplyScalar(-1.0);
            n.forces = n.forces.add(direction.multiplyScalar(this.repulsion / 500));
        }
    }

    updateVelocity(){
        for(let n of this.movableNodes){
            n.velocity = n.velocity.add(n.forces).multiplyScalar(this.damping);
            if(n.velocity.magnitude() > this.maxVelocity){
                n.velocity = n.velocity.normalized().multiplyScalar(this.maxVelocity);
            }
        }
        for(let n of this.nodes){
            n.forces.set(0,0,0);
        }
    }

    updatePosition(){
        for(let n of this.movableNodes){
            n.position.add(n.velocity);
            // this.nodePositions[n.gnid] = [n.position.x, n.position.y, n.position.z];
        }
    }
};