import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, world, teamData, position, isHomeTeam) {
        this.scene = scene;
        this.world = world;
        this.position = position; // Vec3
        this.isHomeTeam = isHomeTeam;
        
        // Props
        this.speed = 10;
        this.mesh = null;
        this.body = null;

        this.initVisuals(teamData);
        this.initPhysics();
    }

    initVisuals(teamData) {
        // Group holds the player parts
        this.mesh = new THREE.Group();

        const color = this.isHomeTeam ? teamData.colors.primary : 0xffffff;
        const helmetColor = teamData.colors.secondary;

        // Torso (Jersey)
        const torsoGeo = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const torsoMat = new THREE.MeshStandardMaterial({ color: color });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 1;
        this.mesh.add(torso);

        // Head (Helmet)
        const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: helmetColor,
            metalness: 0.6,
            roughness: 0.2
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.9;
        this.mesh.add(head);

        // Shadows
        this.mesh.traverse(n => { if(n.isMesh) n.castShadow = true; });

        this.scene.add(this.mesh);
    }

    initPhysics() {
        const shape = new CANNON.Cylinder(0.5, 0.5, 2, 8);
        this.body = new CANNON.Body({
            mass: 80, // kg
            position: new CANNON.Vec3(this.position.x, 2, this.position.z),
            shape: shape,
            fixedRotation: true // Keep player upright
        });
        this.world.addBody(this.body);
    }

    move(inputVector) {
        // Simple movement logic
        const velocity = new CANNON.Vec3(inputVector.x * this.speed, this.body.velocity.y, inputVector.z * this.speed);
        this.body.velocity.set(velocity.x, velocity.y, velocity.z);
        
        // Rotate mesh to face direction
        if (inputVector.length() > 0) {
            const angle = Math.atan2(inputVector.x, inputVector.z);
            this.mesh.rotation.y = angle;
        }
    }

    update() {
        // Sync Mesh with Physics Body
        this.mesh.position.copy(this.body.position);
    }
}// JavaScript Document