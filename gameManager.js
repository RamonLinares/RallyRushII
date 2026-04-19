// Define environments at the top of your script
const environments = {
    scotland: {
        id: 'scotland',
        terrainStyle: 'meadow',
        roadStyle: 'country-asphalt',
        shoulderStyle: 'grass-gravel',
        terrainColor: 0x3f7c47,
        terrainTint: 0xd6ead0,
        treeDensity: 0.2,
        treeColor: 0x2f7d3b,
        trunkColor: 0x6d4b2d,
        maxMountainHeight: 15,
        fogColor: 0x87CEEB
    },
    desert: {
        id: 'desert',
        terrainStyle: 'sand',
        roadStyle: 'sun-baked-asphalt',
        shoulderStyle: 'sand-gravel',
        terrainColor: 0xC2B280,
        terrainTint: 0xc69a58,
        treeDensity: 0,
        maxMountainHeight: 40,
        fogColor: 0xeec36a
    },
    alpine: {
        id: 'alpine',
        terrainStyle: 'snow-rock',
        roadStyle: 'cold-asphalt',
        shoulderStyle: 'snow-gravel',
        terrainColor: 0x7DFFFF,
        terrainTint: 0xe6f5f6,
        treeDensity: 0.4,
        treeColor: 0x175234,
        trunkColor: 0x4b3524,
        maxMountainHeight: 180,
        fogColor: 0x8edff2
    }
};


// Ensure this is defined outside of the GameManager class

class GameManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.game = null;
        this.playerCar = null;
        this.animationId = null;
        this.bestTimes = JSON.parse(localStorage.getItem('bestTimes') || '[]');
        this.controls = { left: false, right: false, accelerate: false, brake: false };
        this.cameraOffset = new THREE.Vector3(0, 5, 15);
        this.carPosition = new THREE.Vector3(0, 0, 0);
        this.minCameraDistance = 5;
        // Add a reference to the directional light
        this.directionalLight = null;
        // Enable shadow rendering with improved settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.trafficCars = [];
        this.maxTrafficCars = 8; // Maximum number of traffic cars
        this.activeCollision = null;
        this.collisionEffects = [];
        this.cameraShakeFrames = 0;
        this.cameraShakeDuration = 0;
        this.cameraShakeStrength = 0;
        this.lastCollisionType = null;
        // Audio elements
        this.desertMusic = document.getElementById('desertMusic');
        this.alpineMusic = document.getElementById('alpineMusic');
        this.scotlandMusic = document.getElementById('scotlandMusic');
        this.gameMusic = document.getElementById('gameMusic');
        // Initialize the game music when the page loads
    }

    initGame(environment) {
        this.resetCollisionVisuals();

        // Clear the scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        // Clear the traffic cars array to remove references to old traffic cars
        this.trafficCars = [];

        // Set up lighting with shadows (if needed)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.05);
        this.scene.add(ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(50, 100, 150);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 10;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 150;
        this.directionalLight.shadow.camera.bottom = -100;

        this.scene.add(this.directionalLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this.scene.add(hemiLight);

        // Initialize the game object
        this.game = {
            road: { length: 3000, width: 25, segments: [] },
            car: {
                position: new THREE.Vector3(0, 0, -10),
                speed: 0,
                acceleration: 0.010,
                deceleration: 0.002,
                brakePower: 0.01,
                maxSpeed: 2.5,
                minSpeed: 0,
                xOffset: 0,
                angle: 0,
                steeringAngle: 0,
                maxSteeringAngle: Math.PI / 12,
                steeringSpeed: 0.15,
                turnSpeed: 0.08,
                grip: 0.7,
                borderCollisionCooldown: 0,
                trafficCollisionCooldown: 0
            },
            terrain: { width: 300 },
            traffic: [],
            startTime: null,
            finishTime: null,
            startLine: -100,
            finishLine: -5900
        };

        // Generate the road and terrain based on the environment
        generateRoadAndTerrain(this.scene, this.game, environment);

        this.playerCar = this.createCar(0xff0000);
        this.scene.add(this.playerCar);

        this.createInitialTrafficCars();
        this.resetCarPosition();
        this.updateCameraPosition();
    }

    resetCollisionVisuals() {
        if (this.collisionEffects) {
            this.collisionEffects.forEach(effect => {
                this.scene.remove(effect.mesh);
                this.disposeObject(effect.mesh);
            });
        }

        this.activeCollision = null;
        this.collisionEffects = [];
        this.cameraShakeFrames = 0;
        this.cameraShakeDuration = 0;
        this.cameraShakeStrength = 0;
        this.lastCollisionType = null;
    }

    disposeObject(object) {
        object.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => material.dispose());
            }
        });
    }


    createCar(color) {
        const car = new THREE.Group();

        // Car body
        const carBody = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.75, 4),
            new THREE.MeshPhongMaterial({ color: color })
        );
        carBody.position.y = 0.375;
        carBody.castShadow = true;
        carBody.receiveShadow = true;
        car.add(carBody);

        // Car roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 2),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        roof.position.set(0, 1, 0.5);
        roof.castShadow = true;
        roof.receiveShadow = true;
        car.add(roof);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const wheelPositions = [
            [-1, 0, -1.5], [1, 0, -1.5],
            [-1, 0, 1.5], [1, 0, 1.5]
        ];

        wheelPositions.forEach(position => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...position);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            car.add(wheel);
        });

        return car;
    }


    createInitialTrafficCars() {
        for (let i = 0; i < this.maxTrafficCars; i++) {
            this.createTrafficCar();
        }
    }

    createTrafficCar() {
        const trafficCar = this.createCar(0x0000ff);
        const randomSegmentIndex = Math.floor(Math.random() * this.game.road.segments.length);
        const segment = this.game.road.segments[randomSegmentIndex];
        const xOffset = (Math.random() - 0.5) * (this.game.road.width * 0.8);
        trafficCar.position.set(segment.curve + xOffset, segment.y + 0.25, segment.z);
        trafficCar.rotation.y = Math.PI;
        this.scene.add(trafficCar);
        this.trafficCars.push({
            mesh: trafficCar,
            speed: 0.5 + Math.random() * 0.5,
            xOffset: xOffset
        });
    }
    resetCarPosition() {
        const startSegment = this.game.road.segments[0];
        this.game.car.position.set(startSegment.curve, startSegment.y + 0.95, this.game.startLine);
        this.game.car.speed = 0;
        this.game.car.xOffset = 0;
        this.game.car.angle = 0;
        this.game.car.angularVelocity = 0;
        this.game.car.steeringAngle = 0;
        this.carPosition.copy(this.game.car.position);

        this.playerCar.position.copy(this.game.car.position);
        this.playerCar.rotation.set(0, 0, 0);
    }

    initGameMusic() {

                // Play game music for the start screen
                this.stopAllMusic();
                if (this.gameMusic) {
                    this.gameMusic.play();
                } else {
                    console.error('Game music element not found.');
                }
    }

    startGame() {
        const selectedCircuit = document.getElementById('circuitSelect').value;
        const environment = environments[selectedCircuit]; // Use the selected environment
        // Stop all music
        this.stopAllMusic();

        // Play the corresponding music
        if (selectedCircuit === 'desert') {
            this.desertMusic.play();
        } else if (selectedCircuit === 'alpine') {
            this.alpineMusic.play();
        } else if (selectedCircuit === 'scotland') {
            this.scotlandMusic.play();
        }
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        this.initGame(environment); // Start the game with the selected circuit
        this.resetCarPosition();
        this.game.startTime = null;
        this.game.finishTime = null;
        this.animate();
    }

    stopAllMusic() {
        if (this.desertMusic) {
            this.desertMusic.pause();
            this.desertMusic.currentTime = 0;
        } else {
            console.warn('Desert music element not found.');
        }
        
        if (this.alpineMusic) {
            this.alpineMusic.pause();
            this.alpineMusic.currentTime = 0;
        } else {
            console.warn('Alpine music element not found.');
        }
        
        if (this.scotlandMusic) {
            this.scotlandMusic.pause();
            this.scotlandMusic.currentTime = 0;
        } else {
            console.warn('Scotland music element not found.');
        }
        
        if (this.gameMusic) {
            this.gameMusic.pause();
            this.gameMusic.currentTime = 0;
        } else {
            console.warn('Game music element not found.');
        }
    }
    

    endGame(time) {
        cancelAnimationFrame(this.animationId);
        this.updateBestTimes(time);
        this.displayEndScreen(time);
    }

    displayEndScreen(time) {
        // Stop circuit music and play game music for the end screen
        this.stopAllMusic();
        this.gameMusic.play();

        document.getElementById('ui').style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        endScreen.style.display = 'grid';
        document.getElementById('finalTime').textContent = `${time.toFixed(2)} s`;

        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard) { // Check if the scoreboard element exists
            scoreboard.innerHTML = '<h2>Best times</h2><ol></ol>';
            const list = scoreboard.querySelector('ol');
            this.bestTimes.forEach((t, i) => {
                const item = document.createElement('li');
                item.innerHTML = `<span>P${i + 1}</span><strong>${t.toFixed(2)} s</strong>`;
                list.appendChild(item);
            });
        }

        // Event listener for changing the circuit
        document.getElementById('changeCircuitButton').addEventListener('click', () => {
            document.getElementById('endScreen').style.display = 'none';
            document.getElementById('startScreen').style.display = 'grid';
        });

        // Event listener for restarting the game
        document.getElementById('restartButton').addEventListener('click', () => {
            document.getElementById('endScreen').style.display = 'none';
            this.startGame();
        });
    }


    restartGame() {
        document.getElementById('endScreen').style.display = 'none';
        this.startGame();
    }

    updateBestTimes(time) {
        this.bestTimes.push(time);
        this.bestTimes.sort((a, b) => a - b);
        this.bestTimes.splice(5); // Keep only top 5 times
        localStorage.setItem('bestTimes', JSON.stringify(this.bestTimes));
    }



    updateUI() {
        const speedValue = document.getElementById('speedValue');
        const timerValue = document.getElementById('timerValue');

        if (speedValue) {
            speedValue.textContent = (this.game.car.speed * 100).toFixed(0);
        }

        if (this.game.startTime && !this.game.finishTime) {
            const elapsedTime = (Date.now() - this.game.startTime) / 1000;
            if (timerValue) {
                timerValue.textContent = elapsedTime.toFixed(2);
            }
        }
    }

    updateLightPosition() {
        if (this.directionalLight && this.playerCar) {
            const offset = new THREE.Vector3(50, 100, -50);
            this.directionalLight.position.copy(this.playerCar.position).add(offset);
            this.directionalLight.target.position.copy(this.playerCar.position);
            this.directionalLight.target.updateMatrixWorld();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        if (!this.game.startTime && this.game.car.position.z <= this.game.startLine) {
            this.game.startTime = Date.now();
        }

        if (this.activeCollision) {
            this.updateCollisionAnimation();
        } else {
            this.updateCarPosition();
        }
        this.updateTraffic(); // Make sure this line is present
        this.updateCollisionEffects();
        this.updateCameraPosition();
        this.updateLightPosition(); // Add this line to update light position

        // Update the road
        if (this.roadUpdater) {
            this.roadUpdater(this.game.car.position.z);
        }

        if (!this.game.finishTime && this.game.car.position.z <= this.game.finishLine) {
            this.game.finishTime = Date.now();
            const totalTime = (this.game.finishTime - this.game.startTime) / 1000;
            this.endGame(totalTime);
        }

        this.updateUI();
        this.renderer.render(this.scene, this.camera);
    }


    updateCarPosition() {
        // Update speed
        if (this.controls.accelerate) {
            this.game.car.speed += this.game.car.acceleration;
        } else if (this.controls.brake) {
            this.game.car.speed -= this.game.car.brakePower;
        } else {
            this.game.car.speed -= this.game.car.deceleration;
        }
        this.game.car.speed = THREE.MathUtils.clamp(this.game.car.speed, this.game.car.minSpeed, this.game.car.maxSpeed);

        // Update steering
        const steeringInput = (this.controls.right ? -1 : 0) + (this.controls.left ? 1 : 0);
        const targetSteeringAngle = steeringInput * this.game.car.maxSteeringAngle;
        this.game.car.steeringAngle += (targetSteeringAngle - this.game.car.steeringAngle) * this.game.car.steeringSpeed;

        // Update car angle based on steering and speed
        this.game.car.angle += this.game.car.steeringAngle * this.game.car.speed * this.game.car.turnSpeed;

        // Calculate incidence angle between car direction and road curve
        const roadData = getRoadDataAtZ(this.game.car.position.z, this.game);
        const incidenceAngle = this.game.car.angle - Math.atan2(roadData.curve - this.game.car.xOffset, this.game.car.position.z);

        // Introduce lateral drift based on incidence angle and speed
        const lateralDrift = Math.sin(incidenceAngle) * this.game.car.speed * 0.5;
        this.game.car.xOffset -= lateralDrift;

        // Calculate movement
        const dx = Math.sin(this.game.car.angle) * this.game.car.speed;
        const dz = Math.cos(this.game.car.angle) * this.game.car.speed;

        // Update position
        this.game.car.xOffset -= dx;
        this.game.car.position.z -= dz;

        // Handle border collisions
        const borderThreshold = this.game.road.width / 2 - 1.5;
        if (Math.abs(this.game.car.xOffset) > borderThreshold) {
            if (this.game.car.borderCollisionCooldown === 0) {
                this.game.car.speed *= 0.8;
                this.game.car.borderCollisionCooldown = 30;
            }
            const pushBackForce = (Math.abs(this.game.car.xOffset) - borderThreshold) * 0.1;
            this.game.car.xOffset -= Math.sign(this.game.car.xOffset) * pushBackForce;
        }

        if (this.game.car.borderCollisionCooldown > 0) {
            this.game.car.borderCollisionCooldown--;
        }

        // Update car's position and rotation
        this.carPosition.set(this.game.car.xOffset + roadData.curve, roadData.y + 0.25, this.game.car.position.z);
        this.playerCar.position.copy(this.carPosition);

        // Apply rotations
        this.playerCar.rotation.set(0, 0, 0);
        const nextY = getRoadDataAtZ(this.game.car.position.z - 1, this.game).y;
        const pitch = Math.atan2(nextY - roadData.y, 1) * 0.1; // Reduces the pitch effect by 50%
        this.playerCar.rotateX(pitch);
        this.playerCar.rotateY(this.game.car.angle);

        // Apply a slight roll based on steering (for visual effect only)
        const maxRoll = Math.PI / 16;
        const roll = -this.game.car.steeringAngle * (maxRoll / this.game.car.maxSteeringAngle);
        this.playerCar.rotateZ(roll);
    }

    triggerTrafficCollision(trafficCar, forcedType) {
        const variants = ['spinout', 'lift-roll', 'side-slam'];
        const type = forcedType || variants[Math.floor(Math.random() * variants.length)];
        const side = Math.sign(this.playerCar.position.x - trafficCar.mesh.position.x) || (Math.random() < 0.5 ? -1 : 1);
        const borderThreshold = this.game.road.width / 2 - 2.2;
        const impactPosition = this.playerCar.position.clone().add(trafficCar.mesh.position).multiplyScalar(0.5);
        const playerStart = this.playerCar.position.clone();
        const trafficStart = trafficCar.mesh.position.clone();
        const playerRotStart = this.playerCar.rotation.clone();
        const trafficRotStart = trafficCar.mesh.rotation.clone();

        let duration = 70;
        let playerLift = 0.35;
        let trafficLift = 0.25;
        let playerSlide = 3.2;
        let trafficSlide = 4.2;
        let playerZKick = 2.8;
        let trafficZKick = -5.5;
        let playerRotPeak = new THREE.Euler(
            playerRotStart.x + 0.15,
            playerRotStart.y + side * Math.PI * 1.6,
            playerRotStart.z + side * 0.55
        );
        let trafficRotEnd = new THREE.Euler(
            trafficRotStart.x + 0.12,
            trafficRotStart.y - side * Math.PI * 1.15,
            trafficRotStart.z - side * 0.48
        );

        if (type === 'lift-roll') {
            duration = 94;
            playerLift = 2.2;
            trafficLift = 0.95;
            playerSlide = 4.4;
            trafficSlide = 3.4;
            playerZKick = 4.2;
            trafficZKick = -7.5;
            playerRotPeak = new THREE.Euler(
                playerRotStart.x + Math.PI * 2.05,
                playerRotStart.y + side * Math.PI * 1.05,
                playerRotStart.z + side * Math.PI * 1.2
            );
            trafficRotEnd = new THREE.Euler(
                trafficRotStart.x + 0.45,
                trafficRotStart.y - side * Math.PI * 0.8,
                trafficRotStart.z - side * 0.85
            );
        } else if (type === 'side-slam') {
            duration = 58;
            playerLift = 0.18;
            trafficLift = 0.18;
            playerSlide = 5.2;
            trafficSlide = 5.4;
            playerZKick = 1.6;
            trafficZKick = -3.6;
            playerRotPeak = new THREE.Euler(
                playerRotStart.x,
                playerRotStart.y + side * Math.PI * 0.72,
                playerRotStart.z + side * 0.38
            );
            trafficRotEnd = new THREE.Euler(
                trafficRotStart.x,
                trafficRotStart.y - side * Math.PI * 0.62,
                trafficRotStart.z - side * 0.5
            );
        }

        const playerPeakZ = playerStart.z + playerZKick;
        const playerPeakRoad = getRoadDataAtZ(playerPeakZ, this.game);
        const playerPeakOffset = THREE.MathUtils.clamp(this.game.car.xOffset + side * playerSlide, -borderThreshold, borderThreshold);
        const playerPeak = new THREE.Vector3(playerPeakRoad.curve + playerPeakOffset, playerPeakRoad.y + 0.25, playerPeakZ);
        const playerEndZ = playerPeakZ + 4;
        const playerEndRoad = getRoadDataAtZ(playerEndZ, this.game);
        const playerEnd = new THREE.Vector3(playerEndRoad.curve, playerEndRoad.y + 0.25, playerEndZ);
        const playerRotEnd = new THREE.Euler(0, 0, 0);

        const trafficEndZ = trafficStart.z + trafficZKick;
        const trafficEndRoad = getRoadDataAtZ(trafficEndZ, this.game);
        const trafficEndOffset = THREE.MathUtils.clamp(trafficCar.xOffset - side * trafficSlide, -borderThreshold, borderThreshold);
        const trafficEnd = new THREE.Vector3(trafficEndRoad.curve + trafficEndOffset, trafficEndRoad.y + 0.35, trafficEndZ);

        this.activeCollision = {
            type,
            trafficCar,
            frame: 0,
            duration,
            playerStart,
            playerPeak,
            playerEnd,
            trafficStart,
            trafficEnd,
            playerRotStart,
            playerRotPeak,
            playerRotEnd,
            trafficRotStart,
            trafficRotEnd,
            playerLift,
            trafficLift
        };

        this.lastCollisionType = type;
        this.game.car.speed = 0;
        this.game.car.trafficCollisionCooldown = duration + 80;
        trafficCar.speed *= 0.25;
        this.cameraShakeDuration = Math.round(duration * 0.55);
        this.cameraShakeFrames = this.cameraShakeDuration;
        this.cameraShakeStrength = type === 'lift-roll' ? 0.55 : 0.38;
        this.createCrashBurst(impactPosition, type);
    }

    updateCollisionAnimation() {
        if (!this.activeCollision) {
            return;
        }

        const collision = this.activeCollision;
        collision.frame++;
        const t = Math.min(collision.frame / collision.duration, 1);
        const crashProgress = Math.min(t / 0.7, 1);
        const settleProgress = Math.max((t - 0.7) / 0.3, 0);
        const eased = 1 - Math.pow(1 - t, 3);
        const crashEase = 1 - Math.pow(1 - crashProgress, 3);
        const settleEase = 1 - Math.pow(1 - settleProgress, 3);
        const lift = Math.sin(crashProgress * Math.PI);

        if (t < 0.7) {
            this.playerCar.position.lerpVectors(collision.playerStart, collision.playerPeak, crashEase);
            this.playerCar.position.y += lift * collision.playerLift;
            this.playerCar.rotation.set(
                THREE.MathUtils.lerp(collision.playerRotStart.x, collision.playerRotPeak.x, crashEase),
                THREE.MathUtils.lerp(collision.playerRotStart.y, collision.playerRotPeak.y, crashEase),
                THREE.MathUtils.lerp(collision.playerRotStart.z, collision.playerRotPeak.z, crashEase)
            );
        } else {
            this.playerCar.position.lerpVectors(collision.playerPeak, collision.playerEnd, settleEase);
            this.playerCar.rotation.set(
                THREE.MathUtils.lerp(collision.playerRotPeak.x, collision.playerRotEnd.x, settleEase),
                THREE.MathUtils.lerp(collision.playerRotPeak.y, collision.playerRotEnd.y, settleEase),
                THREE.MathUtils.lerp(collision.playerRotPeak.z, collision.playerRotEnd.z, settleEase)
            );
        }

        collision.trafficCar.mesh.position.lerpVectors(collision.trafficStart, collision.trafficEnd, eased);
        collision.trafficCar.mesh.position.y += lift * collision.trafficLift;
        collision.trafficCar.mesh.rotation.set(
            THREE.MathUtils.lerp(collision.trafficRotStart.x, collision.trafficRotEnd.x, eased),
            THREE.MathUtils.lerp(collision.trafficRotStart.y, collision.trafficRotEnd.y, eased),
            THREE.MathUtils.lerp(collision.trafficRotStart.z, collision.trafficRotEnd.z, eased)
        );

        this.carPosition.copy(this.playerCar.position);

        if (t >= 1) {
            const trafficRoadData = getRoadDataAtZ(collision.trafficEnd.z, this.game);
            this.game.car.position.z = collision.playerEnd.z;
            this.game.car.xOffset = 0;
            this.game.car.angle = 0;
            this.game.car.speed = 0;
            collision.trafficCar.xOffset = collision.trafficEnd.x - trafficRoadData.curve;
            collision.trafficCar.mesh.position.copy(collision.trafficEnd);
            this.playerCar.position.copy(collision.playerEnd);
            this.playerCar.rotation.set(0, 0, 0);
            this.carPosition.copy(collision.playerEnd);
            this.activeCollision = null;
        }
    }

    createCrashBurst(position, type) {
        const ringColor = type === 'lift-roll' ? 0x5fe2ff : type === 'side-slam' ? 0xff4f5f : 0xffd447;
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.3, 0.045, 8, 40),
            new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.85 })
        );
        ring.position.copy(position);
        ring.position.y += 0.3;
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);
        this.collisionEffects.push({
            mesh: ring,
            velocity: new THREE.Vector3(0, 0.02, 0),
            spin: new THREE.Vector3(0, 0, 0),
            age: 0,
            life: 34,
            startOpacity: 0.85,
            grow: 4.2
        });

        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.65, 14, 10),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.68 })
        );
        flash.position.copy(position);
        flash.position.y += 0.55;
        this.scene.add(flash);
        this.collisionEffects.push({
            mesh: flash,
            velocity: new THREE.Vector3(0, 0.015, 0),
            spin: new THREE.Vector3(0, 0, 0),
            age: 0,
            life: 18,
            startOpacity: 0.68,
            grow: 2.4
        });

        const sparkGeometry = new THREE.BoxGeometry(0.09, 0.09, 0.34);
        const debrisGeometry = new THREE.BoxGeometry(0.2, 0.12, 0.28);
        const sparkColors = [0xfff1a8, 0xff9c2e, 0xff4f5f, 0x5fe2ff];

        for (let i = 0; i < 32; i++) {
            const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
            const spark = new THREE.Mesh(
                sparkGeometry.clone(),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
            );
            spark.position.copy(position);
            spark.position.y += 0.45;
            spark.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.scene.add(spark);
            this.collisionEffects.push({
                mesh: spark,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.55,
                    0.18 + Math.random() * 0.45,
                    (Math.random() - 0.5) * 0.65
                ),
                spin: new THREE.Vector3(Math.random() * 0.35, Math.random() * 0.35, Math.random() * 0.35),
                age: 0,
                life: 28 + Math.floor(Math.random() * 24),
                startOpacity: 0.95,
                grow: 0
            });
        }

        for (let i = 0; i < 10; i++) {
            const debris = new THREE.Mesh(
                debrisGeometry.clone(),
                new THREE.MeshPhongMaterial({ color: i % 2 ? 0x222831 : 0x8f9ba5, transparent: true, opacity: 0.9 })
            );
            debris.position.copy(position);
            debris.position.y += 0.25;
            this.scene.add(debris);
            this.collisionEffects.push({
                mesh: debris,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.32,
                    0.12 + Math.random() * 0.32,
                    (Math.random() - 0.5) * 0.42
                ),
                spin: new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.22, Math.random() * 0.18),
                age: 0,
                life: 42 + Math.floor(Math.random() * 30),
                startOpacity: 0.9,
                grow: 0
            });
        }

        sparkGeometry.dispose();
        debrisGeometry.dispose();
    }

    updateCollisionEffects() {
        this.collisionEffects = this.collisionEffects.filter(effect => {
            effect.age++;
            const progress = effect.age / effect.life;
            effect.mesh.position.add(effect.velocity);
            effect.velocity.y -= 0.018;
            effect.velocity.multiplyScalar(0.985);
            effect.mesh.rotation.x += effect.spin.x;
            effect.mesh.rotation.y += effect.spin.y;
            effect.mesh.rotation.z += effect.spin.z;

            if (effect.grow) {
                const scale = 1 + progress * effect.grow;
                effect.mesh.scale.setScalar(scale);
            }

            if (effect.mesh.material && typeof effect.mesh.material.opacity === 'number') {
                effect.mesh.material.opacity = Math.max(0, effect.startOpacity * (1 - progress));
            }

            if (effect.age >= effect.life) {
                this.scene.remove(effect.mesh);
                this.disposeObject(effect.mesh);
                return false;
            }

            return true;
        });
    }



    updateTraffic() {
        if (this.game.car.trafficCollisionCooldown > 0) {
            this.game.car.trafficCollisionCooldown--;
        }

        const playerBox = new THREE.Box3().setFromObject(this.playerCar);

        this.trafficCars.forEach(trafficCar => {
            if (this.activeCollision && this.activeCollision.trafficCar === trafficCar) {
                return;
            }

            trafficCar.mesh.position.z += trafficCar.speed;

            // If car is behind the player, move it to the back of the visible road
            if (trafficCar.mesh.position.z > this.game.car.position.z + 100) {
                const lastVisibleSegment = this.game.road.segments[this.game.road.segments.length - 1];
                trafficCar.mesh.position.z = Math.min(lastVisibleSegment.z, this.game.car.position.z - 1000);
                trafficCar.xOffset = (Math.random() - 0.5) * (this.game.road.width * 0.8);
            }

            const trafficRoadData = getRoadDataAtZ(trafficCar.mesh.position.z, this.game);
            trafficCar.mesh.position.y = trafficRoadData.y + 0.25;
            trafficCar.mesh.position.x = trafficCar.xOffset + trafficRoadData.curve;

            // Correct pitch rotation for traffic cars
            const nextTrafficRoadData = getRoadDataAtZ(trafficCar.mesh.position.z + 1, this.game);
            trafficCar.mesh.rotation.set(0, Math.PI, 0);
            trafficCar.mesh.rotateX(Math.atan2(nextTrafficRoadData.y - trafficRoadData.y, 1));

            const trafficBox = new THREE.Box3().setFromObject(trafficCar.mesh);

            if (!this.activeCollision && playerBox.intersectsBox(trafficBox) && this.game.car.trafficCollisionCooldown === 0) {
                this.triggerTrafficCollision(trafficCar);
                playerBox.setFromObject(this.playerCar);
            }
        });
    }

    updateCameraPosition() {
        // Create a direction vector pointing in the same direction as the car
        const carDirection = new THREE.Vector3(
            -Math.sin(this.game.car.angle),
            0,
            -Math.cos(this.game.car.angle)
        );

        // Calculate ideal camera position
        let cameraPosition = this.carPosition.clone()
            .add(carDirection.clone().multiplyScalar(-this.cameraOffset.z))
            .add(new THREE.Vector3(0, this.cameraOffset.y, 0));

        // Check for collision with terrain
        const rayStart = this.carPosition.clone().add(new THREE.Vector3(0, this.cameraOffset.y, 0));
        const rayDirection = cameraPosition.clone().sub(rayStart).normalize();
        const ray = new THREE.Raycaster(rayStart, rayDirection);
        const intersects = ray.intersectObjects(this.scene.children, true);

        if (intersects.length > 0 && intersects[0].distance < this.cameraOffset.z) {
            // Adjust camera position to avoid clipping
            const adjustedDistance = Math.max(intersects[0].distance, this.minCameraDistance);
            cameraPosition = rayStart.add(rayDirection.multiplyScalar(adjustedDistance));
        }

        // Calculate look-at position (slightly ahead of the car)
        const lookAtPosition = this.carPosition.clone()
            .add(carDirection.clone().multiplyScalar(10)); // Look 10 units ahead

        if (this.cameraShakeFrames > 0) {
            const falloff = this.cameraShakeFrames / this.cameraShakeDuration;
            const shake = this.cameraShakeStrength * falloff;
            const shakeOffset = new THREE.Vector3(
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake * 0.5,
                (Math.random() - 0.5) * shake
            );
            cameraPosition.add(shakeOffset);
            lookAtPosition.add(shakeOffset.clone().multiplyScalar(0.35));
            this.cameraShakeFrames--;
        }

        // Set camera position
        this.camera.position.copy(cameraPosition);

        // Set camera to look at this position
        this.camera.lookAt(lookAtPosition);
    }

    setControls(controls) {
        this.controls = { ...this.controls, ...controls };
    }
}

// This function should be defined in your roadGenerator.js file
// Make sure it's accessible to the GameManager class
function getRoadDataAtZ(z, game) {
    const segmentLength = 10;
    const index = Math.floor(Math.abs(z) / segmentLength) % game.road.segments.length;
    const nextIndex = (index + 1) % game.road.segments.length;
    const segment = game.road.segments[index];
    const nextSegment = game.road.segments[nextIndex];
    const t = (Math.abs(z) % segmentLength) / segmentLength;
    return {
        y: THREE.MathUtils.lerp(segment.y, nextSegment.y, t),
        curve: THREE.MathUtils.lerp(segment.curve, nextSegment.curve, t)
    };
}
