import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        // Physics Material (Game Feel)
        const defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
            friction: 0.3,
            restitution: 0.5 // Bounciness of ball
        });
        this.world.addContactMaterial(defaultContactMaterial);

        // Ground Plane Physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0, material: defaultMaterial });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);
    }

    step(dt) {
        this.world.step(1 / 60, dt, 3);
    }
}// JavaScript Document