import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.canvas = document.querySelector('#gameCanvas');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.005);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 30);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.setupLights();
        this.createStadium();
        
        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    createStadium() {
        // Procedural Turf Texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Grass base
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Yard lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        for(let i=0; i<=10; i++) {
            let y = (i / 10) * 1024;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 4); // Stretch across field

        const geometry = new THREE.PlaneGeometry(53.3, 100); // Official yards width/length approx scaled
        const material = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.8 
        });
        
        const field = new THREE.Mesh(geometry, material);
        field.rotation.x = -Math.PI / 2;
        field.receiveShadow = true;
        this.scene.add(field);

        // Simple Crowd/Stadium geometry (placeholder)
        const standGeo = new THREE.BoxGeometry(70, 10, 120);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const leftStand = new THREE.Mesh(standGeo, standMat);
        leftStand.position.set(-40, 5, 0);
        this.scene.add(leftStand);
        
        const rightStand = new THREE.Mesh(standGeo, standMat);
        rightStand.position.set(40, 5, 0);
        this.scene.add(rightStand);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
drawRoutes(playData) {
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    playData.routes.forEach(route => {
        const points = [];
        points.push(new THREE.Vector3(route.start.x, 0.1, route.start.z));
        points.push(new THREE.Vector3(route.end.x, 0.1, route.end.z));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    });
}