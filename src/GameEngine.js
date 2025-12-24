import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { Player } from './entities/Player.js';
import { Teams } from './data/Teams.js';

export class GameEngine {
    constructor() {
        this.sceneManager = new SceneManager();
        this.physicsWorld = new PhysicsWorld();
        this.clock = new THREE.Clock();
        
        this.players = [];
        this.activePlayer = null; // usually QB
        this.keys = {};

        this.initInput();
        this.startMatch('KC', 'SF');
        this.animate();
    }

    initInput() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    startMatch(homeKey, awayKey) {
        // Spawn QB (User)
        this.activePlayer = new Player(
            this.sceneManager.scene,
            this.physicsWorld.world,
            Teams[homeKey],
            new THREE.Vector3(0, 0, 10),
            true
        );
        this.players.push(this.activePlayer);

        // Spawn Dummy Defense
        const defender = new Player(
            this.sceneManager.scene,
            this.physicsWorld.world,
            Teams[awayKey],
            new THREE.Vector3(0, 0, -5),
            false
        );
        this.players.push(defender);
    }

    handleInput() {
        if (!this.activePlayer) return;

        const input = new THREE.Vector3(0, 0, 0);
        if (this.keys['KeyW']) input.z = -1;
        if (this.keys['KeyS']) input.z = 1;
        if (this.keys['KeyA']) input.x = -1;
        if (this.keys['KeyD']) input.x = 1;

        this.activePlayer.move(input);
    }

    updateCamera() {
        if (!this.activePlayer) return;
        
        // Smooth Follow Camera
        const targetPos = this.activePlayer.mesh.position.clone();
        targetPos.y += 5;
        targetPos.z += 10;

        this.sceneManager.camera.position.lerp(targetPos, 0.1);
        this.sceneManager.camera.lookAt(this.activePlayer.mesh.position);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();

        this.handleInput();
        this.physicsWorld.step(dt);

        // Update all entities
        this.players.forEach(p => p.update());

        this.updateCamera();
        this.sceneManager.render();
    }
}
export class GameEngine {
    constructor() {
        this.gameState = 'MENU';
        this.sceneManager = new SceneManager();
        this.physicsWorld = new PhysicsWorld();
        this.clock = new THREE.Clock();
        this.players = [];

        // Add this to debug
        console.log("Engine Initialized. State: MENU");

        this.initMenuControls();
        this.animate();
    }

    initMenuControls() {
        const startBtn = document.getElementById('start-game-btn');
        
        // Use 'mousedown' instead of 'click' - it's more reliable in WebGL
        startBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            console.log("Button Pressed!"); 
            this.startGame();
        });
    }

    startGame() {
        // 1. Get Values
        const homeTeam = document.getElementById('home-team-select').value;
        const timeLimit = document.getElementById('quarter-length').value;
        
        this.gameTime = parseInt(timeLimit);
        this.gameState = 'PLAYING';

        // 2. Hide Menu, Show HUD
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('hud').classList.remove('hidden');

        // 3. Initialize the field and players
        this.setupMatch(homeTeam, 'SF');
        
        console.log("Game Started: " + homeTeam);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // We ALWAYS render the scene so it doesn't look frozen
        this.sceneManager.render();

        // Only run physics and input if we are playing
        if (this.gameState === 'PLAYING') {
            const dt = this.clock.getDelta();
            this.physicsWorld.step(dt);
            this.handleInput();
            this.updateClock(dt);
            
            this.players.forEach(p => p.update());
            this.updateCamera();
        }
    }
}
    updateClock(dt) {
        this.gameTime -= dt;
        if (this.gameTime < 0) this.gameTime = 0;
        
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        document.getElementById('time-display').innerText = 
            `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
populateTeamMenu() {
    const select = document.getElementById('home-team-select');
    Object.keys(Teams).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = `${Teams[key].name} (${key})`;
        select.appendChild(opt);
    });
}