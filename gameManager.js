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
        this.cameraOffset = new THREE.Vector3(0, 4.6, 12);
        this.carPosition = new THREE.Vector3(0, 0, 0);
        this.minCameraDistance = 5;
        // Add a reference to the directional light
        this.directionalLight = null;
        // Enable shadow rendering with improved settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.trafficCars = [];
        this.maxTrafficCars = 10; // Maximum number of traffic cars
        this.trafficVehicleTypes = ['muscle', 'suv', 'hatchback', 'pickup', 'supercar'];
        this.gltfLoader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
        this.vehicleModelCache = {};
        this.vehicleModelAssets = {
            carConcept: { url: 'assets/models/car_concept.glb' },
            milkTruck: { url: 'assets/models/cesium_milk_truck.glb' }
        };
        this.vehicleAssetSpecs = {
            rally: {
                asset: 'carConcept',
                width: 2.26,
                length: 4.48,
                height: 1.28,
                yaw: 0,
                groundOffset: -0.2
            },
            supercar: {
                asset: 'carConcept',
                width: 2.34,
                length: 4.62,
                height: 1.22,
                yaw: 0,
                groundOffset: -0.2
            },
            muscle: {
                asset: 'carConcept',
                width: 2.34,
                length: 4.62,
                height: 1.32,
                yaw: 0,
                groundOffset: -0.2
            },
            hatchback: {
                asset: 'carConcept',
                width: 2.08,
                length: 4.12,
                height: 1.34,
                yaw: 0,
                groundOffset: -0.2
            },
            suv: {
                asset: 'milkTruck',
                width: 2.45,
                length: 5.1,
                height: 1.88,
                yaw: Math.PI / 2,
                groundOffset: -0.2
            },
            pickup: {
                asset: 'milkTruck',
                width: 2.36,
                length: 5.2,
                height: 1.78,
                yaw: Math.PI / 2,
                groundOffset: -0.2
            }
        };
        this.trafficPaints = [
            { body: 0x1558ff, accent: 0xf7fbff, stripe: 0xffd447 },
            { body: 0xff7a1a, accent: 0x181c22, stripe: 0xffffff },
            { body: 0x2bd17e, accent: 0x061016, stripe: 0x5fe2ff },
            { body: 0xf2e94e, accent: 0x141820, stripe: 0xff4f5f },
            { body: 0x7c43ff, accent: 0xf7fbff, stripe: 0x68ff9a },
            { body: 0xd9e2ec, accent: 0x10141b, stripe: 0x5fe2ff }
        ];
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
            const child = this.scene.children[0];
            this.scene.remove(child);
            this.disposeObject(child);
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

        this.playerCar = this.createCar(0xe30f24, 'rally', {
            palette: { body: 0xe30f24, accent: 0xf7fbff, stripe: 0x5fe2ff }
        });
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
        object.userData.disposed = true;
        object.traverse(child => {
            if (child.geometry) {
                if (!child.userData.keepGeometry) {
                    child.geometry.dispose();
                }
            }

            if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    if (!material.userData.keepTextureMaps) {
                        ['map', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach(key => {
                            if (material[key]) {
                                material[key].dispose();
                            }
                        });
                    }
                    material.dispose();
                });
            }
        });
    }


    createVehicleMaterials(palette) {
        return {
            body: new THREE.MeshPhysicalMaterial({
                color: palette.body,
                metalness: 0.46,
                roughness: 0.26,
                clearcoat: 0.65,
                clearcoatRoughness: 0.18
            }),
            accent: new THREE.MeshPhysicalMaterial({
                color: palette.accent,
                metalness: 0.34,
                roughness: 0.28,
                clearcoat: 0.45,
                clearcoatRoughness: 0.2
            }),
            stripe: new THREE.MeshPhysicalMaterial({
                color: palette.stripe || palette.accent,
                metalness: 0.24,
                roughness: 0.24,
                clearcoat: 0.5,
                clearcoatRoughness: 0.16
            }),
            glass: new THREE.MeshStandardMaterial({
                color: 0x101a25,
                metalness: 0.1,
                roughness: 0.08,
                transparent: true,
                opacity: 0.76
            }),
            dark: new THREE.MeshStandardMaterial({
                color: 0x080b10,
                metalness: 0.38,
                roughness: 0.5
            }),
            tire: new THREE.MeshStandardMaterial({
                color: 0x050608,
                metalness: 0.05,
                roughness: 0.78
            }),
            rim: new THREE.MeshStandardMaterial({
                color: 0xcfd7df,
                metalness: 0.72,
                roughness: 0.22
            }),
            brake: new THREE.MeshStandardMaterial({
                color: 0xff4f5f,
                metalness: 0.45,
                roughness: 0.3
            }),
            headlight: new THREE.MeshStandardMaterial({
                color: 0xf8fbff,
                emissive: 0xddeeff,
                emissiveIntensity: 0.55,
                metalness: 0.1,
                roughness: 0.18
            }),
            tailLight: new THREE.MeshStandardMaterial({
                color: 0xff2c42,
                emissive: 0xff1530,
                emissiveIntensity: 0.65,
                metalness: 0.1,
                roughness: 0.2
            })
        };
    }

    getVehicleSpec(type) {
        const specs = {
            rally: {
                width: 2.18,
                length: 4.35,
                bodyHeight: 0.76,
                cabinWidth: 1.42,
                cabinLength: 1.72,
                cabinHeight: 0.66,
                cabinZ: -0.12,
                wheelRadius: 0.43,
                wheelWidth: 0.34,
                stance: 1.2,
                spoiler: true,
                roofScoop: true,
                splitter: true,
                stripe: 'center',
                speedBase: 0.82
            },
            muscle: {
                width: 2.34,
                length: 4.95,
                bodyHeight: 0.72,
                cabinWidth: 1.48,
                cabinLength: 1.55,
                cabinHeight: 0.58,
                cabinZ: 0.2,
                wheelRadius: 0.47,
                wheelWidth: 0.38,
                stance: 1.28,
                spoiler: true,
                hoodScoop: true,
                stripe: 'dual',
                speedBase: 0.72
            },
            suv: {
                width: 2.38,
                length: 4.65,
                bodyHeight: 1.05,
                cabinWidth: 1.78,
                cabinLength: 2.15,
                cabinHeight: 0.76,
                cabinZ: -0.02,
                wheelRadius: 0.52,
                wheelWidth: 0.42,
                stance: 1.32,
                roofRails: true,
                bullbar: true,
                stripe: 'side',
                speedBase: 0.56
            },
            hatchback: {
                width: 2.04,
                length: 3.72,
                bodyHeight: 0.88,
                cabinWidth: 1.48,
                cabinLength: 1.65,
                cabinHeight: 0.72,
                cabinZ: 0.06,
                wheelRadius: 0.39,
                wheelWidth: 0.31,
                stance: 1.12,
                spoiler: true,
                roofScoop: true,
                stripe: 'side',
                speedBase: 0.78
            },
            pickup: {
                width: 2.3,
                length: 5.18,
                bodyHeight: 0.96,
                cabinWidth: 1.58,
                cabinLength: 1.36,
                cabinHeight: 0.72,
                cabinZ: -0.72,
                wheelRadius: 0.5,
                wheelWidth: 0.42,
                stance: 1.3,
                openBed: true,
                rollBar: true,
                bullbar: true,
                stripe: 'side',
                speedBase: 0.52
            },
            supercar: {
                width: 2.42,
                length: 4.62,
                bodyHeight: 0.58,
                cabinWidth: 1.28,
                cabinLength: 1.36,
                cabinHeight: 0.46,
                cabinZ: 0.05,
                wheelRadius: 0.44,
                wheelWidth: 0.42,
                stance: 1.36,
                spoiler: true,
                splitter: true,
                diffuser: true,
                stripe: 'center',
                speedBase: 0.9
            }
        };

        return specs[type] || specs.rally;
    }

    addVehicleBox(parent, material, size, position, name) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
        mesh.position.set(position[0], position[1], position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = name || 'vehicle-part';
        parent.add(mesh);
        return mesh;
    }

    addVehicleMesh(parent, geometry, material, position, name) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1], position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = name || 'vehicle-part';
        parent.add(mesh);
        return mesh;
    }

    createLongitudinalPrismGeometry(bands) {
        const vertices = [];
        const indices = [];

        bands.forEach(band => {
            vertices.push(
                -band.halfWidth, band.bottomY, band.z,
                band.halfWidth, band.bottomY, band.z,
                -band.topHalfWidth, band.topY, band.z,
                band.topHalfWidth, band.topY, band.z
            );
        });

        for (let i = 0; i < bands.length - 1; i++) {
            const a = i * 4;
            const b = (i + 1) * 4;

            indices.push(
                a, b, b + 1, a, b + 1, a + 1,
                a + 2, a + 3, b + 3, a + 2, b + 3, b + 2,
                a, a + 2, b + 2, a, b + 2, b,
                a + 1, b + 1, b + 3, a + 1, b + 3, a + 3
            );
        }

        indices.push(0, 1, 3, 0, 3, 2);

        const rear = (bands.length - 1) * 4;
        indices.push(rear, rear + 2, rear + 3, rear, rear + 3, rear + 1);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }

    createVehicleBodyGeometry(spec, type) {
        const halfWidth = spec.width * 0.5;
        const halfLength = spec.length * 0.5;
        const topY = spec.bodyHeight + 0.12;
        const isTruckLike = type === 'suv' || type === 'pickup';
        const isSupercar = type === 'supercar';

        const noseTop = topY * (isSupercar ? 0.58 : isTruckLike ? 0.82 : 0.7);
        const tailTop = topY * (type === 'pickup' ? 0.96 : isTruckLike ? 0.9 : isSupercar ? 0.62 : 0.76);
        const shoulderInset = isTruckLike ? 0.04 : isSupercar ? 0.14 : 0.09;

        return this.createLongitudinalPrismGeometry([
            {
                z: -halfLength,
                bottomY: 0.22,
                topY: noseTop,
                halfWidth: halfWidth * (isSupercar ? 0.78 : 0.84),
                topHalfWidth: halfWidth * (isSupercar ? 0.68 : 0.74)
            },
            {
                z: -halfLength * 0.62,
                bottomY: 0.12,
                topY,
                halfWidth,
                topHalfWidth: halfWidth * (1 - shoulderInset)
            },
            {
                z: halfLength * 0.48,
                bottomY: 0.12,
                topY: topY * (type === 'pickup' ? 0.96 : 0.98),
                halfWidth,
                topHalfWidth: halfWidth * (1 - shoulderInset)
            },
            {
                z: halfLength,
                bottomY: 0.2,
                topY: tailTop,
                halfWidth: halfWidth * (isSupercar ? 0.82 : 0.88),
                topHalfWidth: halfWidth * (isSupercar ? 0.72 : 0.78)
            }
        ]);
    }

    createTaperedBoxGeometry(bottomWidth, bottomLength, height, topWidth, topLength, topZOffset = 0) {
        const bottomHalfWidth = bottomWidth * 0.5;
        const topHalfWidth = topWidth * 0.5;
        const bottomHalfLength = bottomLength * 0.5;
        const topHalfLength = topLength * 0.5;

        const vertices = [
            -bottomHalfWidth, 0, -bottomHalfLength,
            bottomHalfWidth, 0, -bottomHalfLength,
            bottomHalfWidth, 0, bottomHalfLength,
            -bottomHalfWidth, 0, bottomHalfLength,
            -topHalfWidth, height, -topHalfLength + topZOffset,
            topHalfWidth, height, -topHalfLength + topZOffset,
            topHalfWidth, height, topHalfLength + topZOffset,
            -topHalfWidth, height, topHalfLength + topZOffset
        ];
        const indices = [
            0, 1, 2, 0, 2, 3,
            4, 7, 6, 4, 6, 5,
            0, 4, 5, 0, 5, 1,
            1, 5, 6, 1, 6, 2,
            2, 6, 7, 2, 7, 3,
            3, 7, 4, 3, 4, 0
        ];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }

    createDoorDecalMaterial(type, palette) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(250, 253, 255, 0.95)';
        context.fillRect(24, 24, 208, 80);
        context.strokeStyle = '#10141b';
        context.lineWidth = 8;
        context.strokeRect(24, 24, 208, 80);
        context.fillStyle = `#${(palette.stripe || palette.body).toString(16).padStart(6, '0')}`;
        context.fillRect(24, 24, 56, 80);
        context.fillStyle = '#10141b';
        context.font = '700 44px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const labels = {
            rally: 'R2',
            muscle: 'V8',
            suv: '4X',
            hatchback: 'GT',
            pickup: 'PK',
            supercar: 'SC'
        };
        context.fillText(labels[type] || 'RR', 146, 66);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        return new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    createWheel(spec, materials, x, z, isFront) {
        const wheel = new THREE.Group();
        wheel.position.set(x, spec.wheelRadius - 0.18, z);
        wheel.userData.isFront = isFront;

        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(spec.wheelRadius, spec.wheelRadius, spec.wheelWidth, 28),
            materials.tire
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        tire.receiveShadow = true;
        wheel.add(tire);
        wheel.userData.tire = tire;

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(spec.wheelRadius * 0.56, spec.wheelRadius * 0.56, spec.wheelWidth + 0.035, 18),
            materials.rim
        );
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheel.add(rim);

        const brake = new THREE.Mesh(
            new THREE.CylinderGeometry(spec.wheelRadius * 0.32, spec.wheelRadius * 0.32, spec.wheelWidth + 0.05, 14),
            materials.brake
        );
        brake.rotation.z = Math.PI / 2;
        brake.castShadow = true;
        wheel.add(brake);

        for (let i = 0; i < 6; i++) {
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(spec.wheelWidth + 0.06, 0.035, spec.wheelRadius * 0.78),
                materials.rim
            );
            spoke.rotation.x = (Math.PI / 6) * i;
            spoke.castShadow = true;
            wheel.add(spoke);
        }

        return wheel;
    }

    addVehicleWheels(car, spec, materials) {
        const wheelX = spec.width * 0.5 + 0.06;
        const frontZ = -spec.length * 0.34;
        const rearZ = spec.length * 0.34;
        const positions = [
            [-wheelX, frontZ, true],
            [wheelX, frontZ, true],
            [-wheelX, rearZ, false],
            [wheelX, rearZ, false]
        ];

        positions.forEach(([x, z, isFront]) => {
            const wheel = this.createWheel(spec, materials, x, z, isFront);
            car.userData.wheels.push(wheel);
            car.add(wheel);
        });
    }

    addVehicleLights(car, spec, materials) {
        const frontZ = -spec.length * 0.5 - 0.015;
        const rearZ = spec.length * 0.5 + 0.015;
        const lightY = spec.bodyHeight * 0.55;
        const lightX = spec.width * 0.34;

        this.addVehicleBox(car, materials.headlight, [0.34, 0.13, 0.05], [-lightX, lightY, frontZ], 'left-headlight');
        this.addVehicleBox(car, materials.headlight, [0.34, 0.13, 0.05], [lightX, lightY, frontZ], 'right-headlight');
        this.addVehicleBox(car, materials.tailLight, [0.32, 0.14, 0.05], [-lightX, lightY, rearZ], 'left-taillight');
        this.addVehicleBox(car, materials.tailLight, [0.32, 0.14, 0.05], [lightX, lightY, rearZ], 'right-taillight');
        this.addVehicleBox(car, materials.dark, [spec.width * 0.54, 0.16, 0.05], [0, lightY - 0.02, frontZ - 0.01], 'front-grille');
    }

    addVehicleTrim(car, spec, materials, type) {
        const halfLength = spec.length * 0.5;
        const bodyTop = spec.bodyHeight + 0.12;

        this.addVehicleFenders(car, spec, materials);
        this.addVehicleMirrors(car, spec, materials);
        this.addVehicleExhausts(car, spec, materials, type);
        this.addVehicleDecals(car, spec, materials, type);

        this.addVehicleBox(car, materials.dark, [spec.width * 0.92, 0.18, 0.16], [0, 0.18, -halfLength - 0.05], 'front-splitter');
        this.addVehicleBox(car, materials.dark, [spec.width * 0.86, 0.2, 0.16], [0, 0.2, halfLength + 0.04], 'rear-diffuser');
        this.addVehicleBox(car, materials.dark, [0.08, 0.16, spec.length * 0.62], [-spec.width * 0.52, 0.4, 0.05], 'left-side-skirt');
        this.addVehicleBox(car, materials.dark, [0.08, 0.16, spec.length * 0.62], [spec.width * 0.52, 0.4, 0.05], 'right-side-skirt');

        if (spec.stripe === 'center') {
            this.addVehicleBox(car, materials.stripe, [0.18, 0.035, spec.length * 0.72], [0, bodyTop, -0.05], 'center-stripe');
        } else if (spec.stripe === 'dual') {
            this.addVehicleBox(car, materials.stripe, [0.14, 0.035, spec.length * 0.68], [-0.19, bodyTop, -0.05], 'left-racing-stripe');
            this.addVehicleBox(car, materials.stripe, [0.14, 0.035, spec.length * 0.68], [0.19, bodyTop, -0.05], 'right-racing-stripe');
        } else if (spec.stripe === 'side') {
            this.addVehicleBox(car, materials.stripe, [0.04, 0.12, spec.length * 0.62], [-spec.width * 0.53, spec.bodyHeight * 0.62, 0.02], 'left-side-livery');
            this.addVehicleBox(car, materials.stripe, [0.04, 0.12, spec.length * 0.62], [spec.width * 0.53, spec.bodyHeight * 0.62, 0.02], 'right-side-livery');
        }

        if (spec.spoiler) {
            this.addVehicleBox(car, materials.dark, [spec.width * 0.84, 0.08, 0.18], [0, spec.bodyHeight + 0.42, halfLength - 0.18], 'spoiler-wing');
            this.addVehicleBox(car, materials.dark, [0.08, 0.36, 0.08], [-spec.width * 0.32, spec.bodyHeight + 0.22, halfLength - 0.18], 'spoiler-left-mount');
            this.addVehicleBox(car, materials.dark, [0.08, 0.36, 0.08], [spec.width * 0.32, spec.bodyHeight + 0.22, halfLength - 0.18], 'spoiler-right-mount');
        }

        if (spec.roofScoop || spec.hoodScoop) {
            const z = spec.roofScoop ? spec.cabinZ - 0.35 : -halfLength * 0.34;
            const y = spec.roofScoop ? spec.bodyHeight + spec.cabinHeight + 0.22 : bodyTop + 0.12;
            this.addVehicleBox(car, materials.dark, [0.38, 0.16, 0.5], [0, y, z], 'air-scoop');
        }

        if (spec.roofRails) {
            this.addVehicleBox(car, materials.dark, [0.08, 0.08, spec.cabinLength * 0.95], [-spec.cabinWidth * 0.48, spec.bodyHeight + spec.cabinHeight + 0.16, spec.cabinZ], 'left-roof-rail');
            this.addVehicleBox(car, materials.dark, [0.08, 0.08, spec.cabinLength * 0.95], [spec.cabinWidth * 0.48, spec.bodyHeight + spec.cabinHeight + 0.16, spec.cabinZ], 'right-roof-rail');
        }

        if (spec.bullbar) {
            this.addVehicleBox(car, materials.dark, [spec.width * 0.78, 0.08, 0.08], [0, 0.56, -halfLength - 0.22], 'bullbar-top');
            this.addVehicleBox(car, materials.dark, [0.08, 0.5, 0.08], [-spec.width * 0.36, 0.42, -halfLength - 0.22], 'bullbar-left');
            this.addVehicleBox(car, materials.dark, [0.08, 0.5, 0.08], [spec.width * 0.36, 0.42, -halfLength - 0.22], 'bullbar-right');
        }

        if (spec.openBed) {
            this.addVehicleBox(car, materials.dark, [spec.width * 0.78, 0.12, 1.34], [0, spec.bodyHeight + 0.08, halfLength * 0.46], 'truck-bed-liner');
        }

        if (spec.rollBar) {
            this.addVehicleBox(car, materials.dark, [spec.width * 0.65, 0.1, 0.08], [0, spec.bodyHeight + 0.78, 0.58], 'rollbar-top');
            this.addVehicleBox(car, materials.dark, [0.08, 0.78, 0.08], [-spec.width * 0.32, spec.bodyHeight + 0.42, 0.58], 'rollbar-left');
            this.addVehicleBox(car, materials.dark, [0.08, 0.78, 0.08], [spec.width * 0.32, spec.bodyHeight + 0.42, 0.58], 'rollbar-right');
        }

        if (type === 'supercar') {
            this.addVehicleBox(car, materials.dark, [spec.width * 0.62, 0.06, 0.5], [0, bodyTop + 0.03, -halfLength * 0.28], 'hood-vent');
            this.addVehicleBox(car, materials.dark, [0.18, 0.18, 0.44], [-spec.width * 0.62, 0.62, -0.35], 'left-intake');
            this.addVehicleBox(car, materials.dark, [0.18, 0.18, 0.44], [spec.width * 0.62, 0.62, -0.35], 'right-intake');
        }
    }

    addVehicleFenders(car, spec, materials) {
        const wheelX = spec.width * 0.5 + 0.025;
        const frontZ = -spec.length * 0.34;
        const rearZ = spec.length * 0.34;

        [-1, 1].forEach(side => {
            [frontZ, rearZ].forEach(z => {
                this.addVehicleBox(
                    car,
                    materials.body,
                    [0.18, spec.wheelRadius * 0.72, spec.wheelRadius * 1.85],
                    [side * wheelX, spec.wheelRadius + 0.04, z],
                    side < 0 ? 'left-fender-flare' : 'right-fender-flare'
                );
                this.addVehicleBox(
                    car,
                    materials.dark,
                    [0.09, spec.wheelRadius * 0.58, spec.wheelRadius * 1.38],
                    [side * (wheelX + 0.02), spec.wheelRadius + 0.02, z],
                    side < 0 ? 'left-wheel-arch-shadow' : 'right-wheel-arch-shadow'
                );
            });
        });
    }

    addVehicleMirrors(car, spec, materials) {
        const mirrorY = spec.bodyHeight + spec.cabinHeight * 0.58;
        const mirrorZ = spec.cabinZ - spec.cabinLength * 0.36;
        const mirrorX = spec.cabinWidth * 0.5 + 0.18;

        [-1, 1].forEach(side => {
            this.addVehicleBox(car, materials.dark, [0.24, 0.045, 0.045], [side * mirrorX, mirrorY, mirrorZ], 'mirror-arm');
            this.addVehicleBox(car, materials.glass, [0.24, 0.16, 0.1], [side * (mirrorX + 0.12), mirrorY + 0.02, mirrorZ], 'side-mirror');
        });
    }

    addVehicleExhausts(car, spec, materials, type) {
        const count = type === 'supercar' || type === 'muscle' ? 2 : 1;
        const spacing = 0.32;

        for (let i = 0; i < count; i++) {
            const exhaust = new THREE.Mesh(
                new THREE.CylinderGeometry(0.07, 0.07, 0.42, 16),
                materials.rim
            );
            exhaust.rotation.x = Math.PI / 2;
            exhaust.position.set((i - (count - 1) / 2) * spacing, 0.28, spec.length * 0.5 + 0.15);
            exhaust.castShadow = true;
            exhaust.receiveShadow = true;
            exhaust.name = 'exhaust-pipe';
            car.add(exhaust);
        }
    }

    addVehicleDecals(car, spec, materials, type) {
        const decalMaterial = this.createDoorDecalMaterial(type, {
            body: materials.body.color.getHex(),
            stripe: materials.stripe.color.getHex()
        });
        const geometry = new THREE.PlaneGeometry(0.88, 0.42);
        const decalY = spec.bodyHeight * 0.72;
        const decalZ = spec.cabinZ + spec.cabinLength * 0.12;

        [-1, 1].forEach(side => {
            const decal = new THREE.Mesh(geometry, decalMaterial);
            decal.position.set(side * (spec.width * 0.5 + 0.095), decalY, decalZ);
            decal.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
            decal.name = side < 0 ? 'left-door-decal' : 'right-door-decal';
            car.add(decal);
        });
    }

    canUseAssetVehicle(type) {
        return this.gltfLoader && this.vehicleAssetSpecs[type] && this.vehicleModelAssets[this.vehicleAssetSpecs[type].asset];
    }

    createAssetVehicle(color, type, options = {}) {
        if (!this.canUseAssetVehicle(type)) {
            return null;
        }

        const spec = this.getVehicleSpec(type);
        const assetSpec = this.vehicleAssetSpecs[type];
        const palette = {
            body: color,
            accent: 0xffffff,
            stripe: 0x5fe2ff,
            ...(options.palette || {})
        };
        const car = new THREE.Group();
        car.userData.vehicleType = type;
        car.userData.wheels = [];
        car.userData.assetVehicle = true;
        car.userData.assetReady = false;
        car.userData.assetName = assetSpec.asset;

        const proxyMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const proxy = new THREE.Mesh(
            new THREE.BoxGeometry(assetSpec.width, assetSpec.height || spec.bodyHeight + spec.cabinHeight, assetSpec.length),
            proxyMaterial
        );
        proxy.position.y = (assetSpec.height || 1.4) * 0.5 - 0.18;
        proxy.name = 'vehicle-collision-proxy';
        car.add(proxy);

        this.loadVehicleModel(assetSpec.asset)
            .then(source => {
                if (car.userData.disposed) {
                    return;
                }

                const model = source.clone(true);
                this.prepareAssetVehicleModel(model, type, palette, assetSpec);
                car.add(model);
                car.userData.assetReady = true;
            })
            .catch(error => {
                console.warn(`Falling back to procedural ${type} vehicle.`, error);
                if (car.userData.disposed) {
                    return;
                }

                const materials = this.createVehicleMaterials(palette);
                this.populateProceduralCar(car, spec, materials, type);
                car.userData.assetReady = false;
                car.userData.assetFallback = true;
            });

        return car;
    }

    loadVehicleModel(assetName) {
        const asset = this.vehicleModelAssets[assetName];
        if (!asset) {
            return Promise.reject(new Error(`Unknown vehicle model: ${assetName}`));
        }

        if (this.vehicleModelCache[assetName]) {
            return this.vehicleModelCache[assetName];
        }

        this.vehicleModelCache[assetName] = new Promise((resolve, reject) => {
            this.gltfLoader.load(
                asset.url,
                gltf => resolve(gltf.scene),
                undefined,
                reject
            );
        });

        return this.vehicleModelCache[assetName];
    }

    prepareAssetVehicleModel(model, type, palette, assetSpec) {
        model.name = `${type}-mesh-model`;
        model.rotation.y = assetSpec.yaw || 0;

        model.traverse(child => {
            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.keepGeometry = true;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            const clonedMaterials = materials.map(material => this.cloneAssetMaterial(material, palette, type));
            child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];

            const name = `${child.name || ''} ${child.material.name || ''}`.toLowerCase();
            if (/wheel(front|rear)|wheels|tire|rim/.test(name) && !/steering/.test(name)) {
                child.userData.assetWheel = true;
            }
        });

        this.normalizeAssetVehicle(model, assetSpec);
    }

    cloneAssetMaterial(material, palette, type) {
        const cloned = material.clone();
        const name = (cloned.name || '').toLowerCase();
        cloned.userData.keepTextureMaps = true;

        const isGlass = /glass|window|windshield/.test(name);
        const isTire = /tire|rubber|wheel/.test(name);
        const isLight = /headlight|brakelight|signallight|taillight/.test(name);
        const isPaint = /paint|body|toycar|truck/.test(name) && !isGlass && !isTire && !isLight;

        if (isPaint && cloned.color) {
            cloned.color.setHex(palette.body);
            if ('metalness' in cloned) {
                cloned.metalness = Math.max(cloned.metalness || 0, 0.34);
            }
            if ('roughness' in cloned) {
                cloned.roughness = Math.min(cloned.roughness || 0.38, 0.34);
            }
            if ('clearcoat' in cloned) {
                cloned.clearcoat = Math.max(cloned.clearcoat || 0, 0.55);
                cloned.clearcoatRoughness = Math.min(cloned.clearcoatRoughness || 0.22, 0.18);
            }
        } else if (isGlass && cloned.color) {
            cloned.color.setHex(0x121c28);
            cloned.transparent = true;
            cloned.opacity = Math.min(cloned.opacity || 0.8, 0.76);
            if ('roughness' in cloned) {
                cloned.roughness = 0.05;
            }
        } else if (isLight && cloned.emissive) {
            cloned.emissiveIntensity = Math.max(cloned.emissiveIntensity || 0.4, 0.65);
        }

        if (type === 'supercar' && isPaint && cloned.color) {
            cloned.color.offsetHSL(0.02, 0.08, -0.03);
        }

        return cloned;
    }

    normalizeAssetVehicle(model, assetSpec) {
        model.updateMatrixWorld(true);
        const sourceBox = new THREE.Box3().setFromObject(model);
        const sourceSize = sourceBox.getSize(new THREE.Vector3());
        const widthScale = assetSpec.width / Math.max(sourceSize.x, 0.001);
        const lengthScale = assetSpec.length / Math.max(sourceSize.z, 0.001);
        const heightScale = (assetSpec.height || sourceSize.y) / Math.max(sourceSize.y, 0.001);
        const scale = Math.min(widthScale, lengthScale, heightScale);

        model.scale.multiplyScalar(scale);
        model.updateMatrixWorld(true);

        const fittedBox = new THREE.Box3().setFromObject(model);
        const center = fittedBox.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y += (assetSpec.groundOffset || 0) - fittedBox.min.y;
    }

    populateProceduralCar(car, spec, materials, type) {
        this.addVehicleBox(car, materials.dark, [spec.width * 0.96, 0.24, spec.length * 0.94], [0, 0.24, 0.05], 'underbody');
        this.addVehicleMesh(car, this.createVehicleBodyGeometry(spec, type), materials.body, [0, 0, 0], 'sculpted-body');
        this.addVehicleBox(car, materials.accent, [spec.width * 0.72, 0.045, spec.length * 0.34], [0, spec.bodyHeight + 0.16, -spec.length * 0.28], 'hood-panel');
        this.addVehicleBox(car, materials.accent, [spec.width * 0.68, 0.04, spec.length * 0.26], [0, spec.bodyHeight + 0.12, spec.length * 0.34], 'rear-deck-panel');

        const cabinTopScale = type === 'suv' || type === 'pickup' ? 0.82 : type === 'supercar' ? 0.58 : 0.68;
        const cabinLengthScale = type === 'suv' || type === 'pickup' ? 0.9 : type === 'supercar' ? 0.64 : 0.72;
        const cabinZOffset = type === 'muscle' ? 0.06 : type === 'supercar' ? -0.08 : 0;
        this.addVehicleMesh(
            car,
            this.createTaperedBoxGeometry(
                spec.cabinWidth,
                spec.cabinLength,
                spec.cabinHeight,
                spec.cabinWidth * cabinTopScale,
                spec.cabinLength * cabinLengthScale,
                cabinZOffset
            ),
            materials.glass,
            [0, spec.bodyHeight + 0.12, spec.cabinZ],
            'tapered-glass-cabin'
        );
        this.addVehicleBox(car, materials.dark, [0.08, spec.cabinHeight * 0.88, spec.cabinLength * 0.94], [-spec.cabinWidth * 0.52, spec.bodyHeight + spec.cabinHeight * 0.5 + 0.14, spec.cabinZ], 'left-window-frame');
        this.addVehicleBox(car, materials.dark, [0.08, spec.cabinHeight * 0.88, spec.cabinLength * 0.94], [spec.cabinWidth * 0.52, spec.bodyHeight + spec.cabinHeight * 0.5 + 0.14, spec.cabinZ], 'right-window-frame');
        this.addVehicleBox(car, materials.dark, [spec.cabinWidth * 0.78, 0.08, 0.08], [0, spec.bodyHeight + spec.cabinHeight + 0.17, spec.cabinZ - spec.cabinLength * 0.46], 'windshield-header');
        this.addVehicleBox(car, materials.dark, [spec.cabinWidth * 0.78, 0.08, 0.08], [0, spec.bodyHeight + spec.cabinHeight + 0.17, spec.cabinZ + spec.cabinLength * 0.46], 'rear-window-header');

        this.addVehicleLights(car, spec, materials);
        this.addVehicleWheels(car, spec, materials);
        this.addVehicleTrim(car, spec, materials, type);
    }

    createCar(color, type = 'rally', options = {}) {
        const spec = this.getVehicleSpec(type);
        const palette = {
            body: color,
            accent: 0xffffff,
            stripe: 0x5fe2ff,
            ...(options.palette || {})
        };
        const assetVehicle = this.createAssetVehicle(color, type, options);
        if (assetVehicle) {
            return assetVehicle;
        }

        const materials = this.createVehicleMaterials(palette);
        const car = new THREE.Group();
        car.userData.vehicleType = type;
        car.userData.wheels = [];

        this.populateProceduralCar(car, spec, materials, type);

        return car;
    }

    animateVehicleWheels(car, amount, steeringAngle = 0) {
        if (!car || !car.userData.wheels) {
            return;
        }

        car.userData.wheels.forEach(wheel => {
            if (wheel.userData.tire) {
                wheel.userData.tire.rotation.x += amount;
            }
            if (wheel.userData.isFront) {
                wheel.rotation.y = steeringAngle;
            }
        });
    }

    getRandomTrafficType() {
        return this.trafficVehicleTypes[Math.floor(Math.random() * this.trafficVehicleTypes.length)];
    }

    getRandomTrafficPaint() {
        return this.trafficPaints[Math.floor(Math.random() * this.trafficPaints.length)];
    }


    createInitialTrafficCars() {
        for (let i = 0; i < this.maxTrafficCars; i++) {
            this.createTrafficCar();
        }
    }

    createTrafficCar() {
        const vehicleType = this.getRandomTrafficType();
        const paint = this.getRandomTrafficPaint();
        const trafficCar = this.createCar(paint.body, vehicleType, { palette: paint });
        const spec = this.getVehicleSpec(vehicleType);
        const randomSegmentIndex = Math.floor(Math.random() * this.game.road.segments.length);
        const segment = this.game.road.segments[randomSegmentIndex];
        const xOffset = (Math.random() - 0.5) * (this.game.road.width * 0.8);
        trafficCar.position.set(segment.curve + xOffset, segment.y + 0.25, segment.z);
        trafficCar.rotation.y = Math.PI;
        this.scene.add(trafficCar);
        this.trafficCars.push({
            mesh: trafficCar,
            speed: spec.speedBase + Math.random() * 0.28,
            xOffset: xOffset,
            vehicleType
        });
    }
    resetCarPosition() {
        const startSegment = this.game.road.segments[0];
        this.game.car.position.set(startSegment.curve, startSegment.y + 0.25, this.game.startLine);
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
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

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
        this.animationId = null;
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
        this.animateVehicleWheels(this.playerCar, this.game.car.speed * 0.72, this.game.car.steeringAngle * 0.85);
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
        this.animateVehicleWheels(this.playerCar, 0.18 * (1 - t), 0);
        this.animateVehicleWheels(collision.trafficCar.mesh, 0.2 * (1 - t), 0);

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
            this.animateVehicleWheels(trafficCar.mesh, trafficCar.speed * 0.72, 0);

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
