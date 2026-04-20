class SimplexNoise {
    constructor() {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[r]] = [this.p[r], this.p[i]];
        }
    }

    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.p[X] + Y, B = this.p[X + 1] + Y;
        return this.lerp(v, this.lerp(u, this.grad(this.p[A], x, y), 
                                         this.grad(this.p[B], x - 1, y)),
                            this.lerp(u, this.grad(this.p[A + 1], x, y - 1),
                                         this.grad(this.p[B + 1], x - 1, y - 1)));
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return ((h & 8) ? -grad : grad) * x + ((h & 4) ? -grad : grad) * y;
    }
}

function createCanvasTexture(width, height, repeatX, repeatY, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    draw(context, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function drawSpeckle(context, width, height, colors, count, minSize, maxSize, alpha = 1) {
    for (let i = 0; i < count; i++) {
        const size = minSize + Math.random() * (maxSize - minSize);
        context.globalAlpha = alpha * (0.45 + Math.random() * 0.55);
        context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        context.fillRect(Math.random() * width, Math.random() * height, size, size);
    }
    context.globalAlpha = 1;
}

function drawGrassStrokes(context, width, height, colors, count) {
    context.lineCap = 'round';
    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 5 + Math.random() * 18;
        const lean = -3 + Math.random() * 6;
        context.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
        context.globalAlpha = 0.25 + Math.random() * 0.5;
        context.lineWidth = 1 + Math.random();
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + lean, y - length);
        context.stroke();
    }
    context.globalAlpha = 1;
}

function drawWavyLines(context, width, height, color, count, alpha) {
    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = 2;
    for (let i = 0; i < count; i++) {
        const y = Math.random() * height;
        const amplitude = 4 + Math.random() * 10;
        const frequency = 0.012 + Math.random() * 0.018;
        context.beginPath();
        for (let x = 0; x <= width; x += 12) {
            const waveY = y + Math.sin(x * frequency + i) * amplitude;
            if (x === 0) {
                context.moveTo(x, waveY);
            } else {
                context.lineTo(x, waveY);
            }
        }
        context.stroke();
    }
    context.globalAlpha = 1;
}

function createRoadTexture(environment, segmentCount) {
    const repeatY = Math.max(24, segmentCount / 8);
    const palette = {
        'sun-baked-asphalt': {
            base: '#5b5147',
            flecks: ['#776c5d', '#473f38', '#8b7d67'],
            line: '#f8dfa0',
            edge: '#f2eee0'
        },
        'cold-asphalt': {
            base: '#4e5d64',
            flecks: ['#62737b', '#354249', '#8aa0a7'],
            line: '#e8f5ff',
            edge: '#f7fbff'
        },
        'country-asphalt': {
            base: '#4d5558',
            flecks: ['#667073', '#343b3d', '#7a8585'],
            line: '#f2f2e8',
            edge: '#f7f8ef'
        }
    }[environment.roadStyle] || {
        base: '#4d5558',
        flecks: ['#667073', '#343b3d', '#7a8585'],
        line: '#f2f2e8',
        edge: '#f7f8ef'
    };

    return createCanvasTexture(512, 1024, 1, repeatY, (context, width, height) => {
        context.fillStyle = palette.base;
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, palette.flecks, 5500, 1, 4, 0.75);

        context.globalAlpha = 0.2;
        context.strokeStyle = '#151719';
        context.lineWidth = 2;
        for (let i = 0; i < 26; i++) {
            const y = Math.random() * height;
            const x = Math.random() * width;
            context.beginPath();
            context.moveTo(x, y);
            context.bezierCurveTo(x + 24, y + 14, x + 42, y - 20, x + 72, y + 6);
            context.stroke();
        }
        context.globalAlpha = 1;

        context.fillStyle = palette.edge;
        context.fillRect(34, 0, 10, height);
        context.fillRect(width - 44, 0, 10, height);

        context.fillStyle = palette.line;
        const dashHeight = 86;
        const dashGap = 86;
        for (let y = 24; y < height; y += dashHeight + dashGap) {
            context.fillRect(width / 2 - 5, y, 10, dashHeight);
        }

    });
}

function createTerrainTexture(environment, segmentCount) {
    const repeatY = Math.max(24, segmentCount / 7);

    if (environment.terrainStyle === 'sand') {
        return createCanvasTexture(512, 512, 7, repeatY, (context, width, height) => {
            context.fillStyle = '#cdbb82';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#e1cf98', '#b89d64', '#a98851', '#f0dda5'], 7200, 1, 5, 0.7);
            drawWavyLines(context, width, height, '#8f7543', 28, 0.16);
            drawWavyLines(context, width, height, '#f4dea0', 16, 0.14);
        });
    }

    if (environment.terrainStyle === 'snow-rock') {
        return createCanvasTexture(512, 512, 6, repeatY, (context, width, height) => {
            context.fillStyle = '#d9f1f4';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#f7ffff', '#b8d6dc', '#8fa7ad', '#63777e'], 5000, 1, 6, 0.52);
            context.globalAlpha = 0.26;
            context.strokeStyle = '#607078';
            context.lineWidth = 5;
            for (let i = 0; i < 34; i++) {
                const x = Math.random() * width;
                context.beginPath();
                context.moveTo(x, Math.random() * height);
                context.lineTo(x + 50 + Math.random() * 120, Math.random() * height);
                context.stroke();
            }
            context.globalAlpha = 1;
        });
    }

    return createCanvasTexture(512, 512, 7, repeatY, (context, width, height) => {
        context.fillStyle = '#497b3a';
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, ['#5f9348', '#315b2d', '#79a85a', '#b6c06a'], 6000, 1, 6, 0.62);
        drawGrassStrokes(context, width, height, ['#88b25c', '#6d9949', '#adc770', '#3b6a35'], 1800);

        context.globalAlpha = 0.35;
        drawSpeckle(context, width, height, ['#d8d177', '#b8a0d8', '#ffffff'], 95, 1, 3, 0.7);
        context.globalAlpha = 1;
    });
}

function createShoulderTexture(environment, segmentCount) {
    const repeatY = Math.max(24, segmentCount / 7);

    if (environment.shoulderStyle === 'sand-gravel') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = '#b8965f';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#d3b77b', '#80653f', '#eee0b4', '#594536'], 4200, 1, 5, 0.85);
            drawWavyLines(context, width, height, '#785d39', 12, 0.16);
        });
    }

    if (environment.shoulderStyle === 'snow-gravel') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = '#b7c8c9';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#f5ffff', '#82939a', '#58646a', '#d3e8eb'], 4000, 1, 5, 0.76);
        });
    }

    return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
        context.fillStyle = '#6f7657';
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, ['#9a9b7a', '#575840', '#c8c8aa', '#3d6a35'], 4300, 1, 5, 0.82);
        drawGrassStrokes(context, width, height, ['#82a85d', '#53743d', '#b4c171'], 420);
    });
}

function generateRoadAndTerrain(scene, game, environment) {
    const terrainNoise = new SimplexNoise();
    const roadNoise = new SimplexNoise();
    
    function generateMountainHeight(x, z) {
        return (terrainNoise.noise2D(x * 0.01, z * 0.01) + 1) * environment.maxMountainHeight;
    }

    function generateRoadCurve(z) {
        return roadNoise.noise2D(z * 0.002, 0) * 40;
    }

    const segmentLength = 10;
    const extraSegmentsAfterFinish = 100;
    const totalSegments = Math.ceil(Math.abs(game.finishLine) / segmentLength) + extraSegmentsAfterFinish;
    
    function createRoadSegment(index) {
        const z = -index * segmentLength;
        const curve = generateRoadCurve(z);
        const y = Math.sin(z * 0.01) * 10; // Gentle road elevation changes
        
        const nextZ = -(index + 1) * segmentLength;
        const nextCurve = generateRoadCurve(nextZ);
        const dx = nextCurve - curve;
        const dz = segmentLength;
        const curvatureAngle = Math.atan2(dx, dz);
        
        return { z, y, curve, curvatureAngle };
    }

    for (let i = 0; i < totalSegments; i++) {
        game.road.segments.push(createRoadSegment(i));
    }

    const roadGeometry = new THREE.BufferGeometry();
    const leftTerrainGeometry = new THREE.BufferGeometry();
    const rightTerrainGeometry = new THREE.BufferGeometry();
    
    const halfRoadWidth = game.road.width / 2;
    const terrainWidth = game.terrain.width;
    const terrainSteps = 10;

    function updateGeometries() {
        const roadPositions = [];
        const roadIndices = [];
        const roadUVs = [];
        const leftTerrainPositions = [];
        const leftTerrainIndices = [];
        const leftTerrainUVs = [];
        const rightTerrainPositions = [];
        const rightTerrainIndices = [];
        const rightTerrainUVs = [];

        game.road.segments.forEach((segment, i) => {
            const leftX = segment.curve - halfRoadWidth;
            const rightX = segment.curve + halfRoadWidth;
            const v = i / game.road.segments.length;

            // Road vertices
            roadPositions.push(leftX, segment.y, segment.z);
            roadPositions.push(rightX, segment.y, segment.z);
            roadUVs.push(0, v);
            roadUVs.push(1, v);

            // Left terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const x = leftX - (j / terrainSteps) * terrainWidth;
                const heightOffset = generateMountainHeight(x, segment.z) * (j / terrainSteps);
                leftTerrainPositions.push(x, segment.y + heightOffset, segment.z);
                leftTerrainUVs.push(j / terrainSteps, v);
            }

            // Right terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const x = rightX + (j / terrainSteps) * terrainWidth;
                const heightOffset = generateMountainHeight(x, segment.z) * (j / terrainSteps);
                rightTerrainPositions.push(x, segment.y + heightOffset, segment.z);
                rightTerrainUVs.push(j / terrainSteps, v);
            }

            if (i < game.road.segments.length - 1) {
                const j = i * 2;
                roadIndices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);

                const k = i * (terrainSteps + 1);
                for (let m = 0; m < terrainSteps; m++) {
                    leftTerrainIndices.push(
                        k + m, k + terrainSteps + 1 + m, k + m + 1,
                        k + m + 1, k + terrainSteps + 1 + m, k + terrainSteps + 2 + m
                    );
                    rightTerrainIndices.push(
                        k + m, k + terrainSteps + 1 + m, k + m + 1,
                        k + m + 1, k + terrainSteps + 1 + m, k + terrainSteps + 2 + m
                    );
                }
            }
        });

        roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
        roadGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(roadUVs, 2));
        roadGeometry.setIndex(roadIndices);
        roadGeometry.computeVertexNormals();

        leftTerrainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(leftTerrainPositions, 3));
        leftTerrainGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(leftTerrainUVs, 2));
        leftTerrainGeometry.setIndex(leftTerrainIndices);
        leftTerrainGeometry.computeVertexNormals();

        rightTerrainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rightTerrainPositions, 3));
        rightTerrainGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(rightTerrainUVs, 2));
        rightTerrainGeometry.setIndex(rightTerrainIndices);
        rightTerrainGeometry.computeVertexNormals();
    }

    updateGeometries();

    function createShoulderGeometry(side) {
        const shoulderGeometry = new THREE.BufferGeometry();
        const shoulderPositions = [];
        const shoulderIndices = [];
        const shoulderUVs = [];
        const shoulderWidth = 4;

        game.road.segments.forEach((segment, i) => {
            const roadEdgeX = segment.curve + side * halfRoadWidth;
            const shoulderEdgeX = roadEdgeX + side * shoulderWidth;
            const y = segment.y + 0.04;
            const v = i / game.road.segments.length;

            shoulderPositions.push(roadEdgeX, y, segment.z);
            shoulderPositions.push(shoulderEdgeX, y, segment.z);
            shoulderUVs.push(0, v);
            shoulderUVs.push(1, v);

            if (i < game.road.segments.length - 1) {
                const index = i * 2;
                shoulderIndices.push(index, index + 1, index + 2, index + 1, index + 3, index + 2);
            }
        });

        shoulderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shoulderPositions, 3));
        shoulderGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(shoulderUVs, 2));
        shoulderGeometry.setIndex(shoulderIndices);
        shoulderGeometry.computeVertexNormals();
        return shoulderGeometry;
    }

    const roadTexture = createRoadTexture(environment, game.road.segments.length);
    const road = new THREE.Mesh(roadGeometry, new THREE.MeshPhongMaterial({
        map: roadTexture,
        shininess: 14
    }));
    road.receiveShadow = true;

    const terrainTexture = createTerrainTexture(environment, game.road.segments.length);
    const terrainMaterial = new THREE.MeshPhongMaterial({
        color: environment.terrainTint || 0xffffff,
        map: terrainTexture,
        bumpMap: terrainTexture,
        bumpScale: environment.terrainStyle === 'snow-rock' ? 0.18 : 0.28,
        side: THREE.DoubleSide,
        flatShading: false,
        shininess: environment.terrainStyle === 'snow-rock' ? 8 : 3
    });

    const shoulderTexture = createShoulderTexture(environment, game.road.segments.length);
    const shoulderMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: shoulderTexture,
        side: THREE.DoubleSide,
        shininess: 4
    });

    const leftTerrain = new THREE.Mesh(leftTerrainGeometry, terrainMaterial);
    const rightTerrain = new THREE.Mesh(rightTerrainGeometry, terrainMaterial);
    const leftShoulder = new THREE.Mesh(createShoulderGeometry(-1), shoulderMaterial);
    const rightShoulder = new THREE.Mesh(createShoulderGeometry(1), shoulderMaterial);
    
    leftTerrain.receiveShadow = true;
    rightTerrain.receiveShadow = true;
    leftShoulder.receiveShadow = true;
    rightShoulder.receiveShadow = true;

    scene.add(road, leftShoulder, rightShoulder, leftTerrain, rightTerrain);

    // Place trees if the environment has any
    if (environment.treeDensity > 0) {
        const treeDensity = environment.treeDensity;
        const minDistanceBetweenTrees = 10;
        const trees = [];

        function createTree(x, y, z) {
            const tree = new THREE.Group();
            const trunkHeight = 2;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, trunkHeight, 8), new THREE.MeshPhongMaterial({ color: environment.trunkColor || 0x8B4513 }));
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            tree.add(trunk);
            
            const leavesHeight = 4;
            const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.5, leavesHeight, 8), new THREE.MeshPhongMaterial({ color: environment.treeColor || 0x228B22 }));
            leaves.position.y = trunkHeight + leavesHeight / 2;
            leaves.castShadow = true;
            leaves.receiveShadow = true;
            tree.add(leaves);
            
            tree.position.set(x, y, z);
            return tree;
        }

        function getTerrainHeightAt(x, z) {
            const segmentIndex = Math.floor(Math.abs(z) / segmentLength) % game.road.segments.length;
            const segment = game.road.segments[segmentIndex];
            const terrainWidth = game.terrain.width;
            const halfRoadWidth = game.road.width / 2;
            
            const distanceFromRoadCenter = Math.abs(x - segment.curve);
            const normalizedDistance = Math.min(Math.max((distanceFromRoadCenter - halfRoadWidth) / terrainWidth, 0), 1);
            
            const baseHeight = segment.y;
            const heightOffset = generateMountainHeight(x, z) * normalizedDistance;
            
            return baseHeight + heightOffset;
        }

        function placeTrees(startZ, endZ) {
            for (let z = startZ; z > endZ; z -= minDistanceBetweenTrees) {
                const segmentIndex = Math.floor(Math.abs(z) / segmentLength) % game.road.segments.length;
                const segment = game.road.segments[segmentIndex];
                const halfRoadWidth = game.road.width / 2;
                const terrainWidth = game.terrain.width;

                [-1, 1].forEach(side => {
                    if (Math.random() < treeDensity) {
                        let x;
                        if (side === -1) {
                            x = segment.curve - halfRoadWidth - Math.random() * terrainWidth;
                        } else {
                            x = segment.curve + halfRoadWidth + Math.random() * terrainWidth;
                        }

                        const y = getTerrainHeightAt(x, z);
                        
                        const tooClose = trees.some(tree => {
                            const dx = tree.position.x - x;
                            const dz = tree.position.z - z;
                            return Math.sqrt(dx * dx + dz * dz) < minDistanceBetweenTrees;
                        });

                        if (Math.abs(x - segment.curve) > halfRoadWidth + 5 && !tooClose) {
                            const tree = createTree(x, y, z);
                            trees.push(tree);
                            scene.add(tree);
                        }
                    }
                });
            }
        }

        placeTrees(0, game.finishLine * 10);
    }
    
    scene.background = new THREE.Color(environment.fogColor);
    scene.fog = new THREE.FogExp2(environment.fogColor, environment.fogDensity || 0.00115);

    function createBannerTexture(label) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        const squareSize = 32;

        context.fillStyle = '#22242b';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#15171d');
        gradient.addColorStop(0.5, '#343741');
        gradient.addColorStop(1, '#15171d');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let x = 0; x < canvas.width; x += squareSize) {
            for (let y = 0; y < canvas.height; y += squareSize) {
                if (((x / squareSize) + (y / squareSize)) % 2 === 0) {
                    context.fillStyle = 'rgba(255, 255, 255, 0.92)';
                } else {
                    context.fillStyle = 'rgba(20, 20, 24, 0.95)';
                }
                if (x < squareSize * 4 || x >= canvas.width - squareSize * 4) {
                    context.fillRect(x, y, squareSize, squareSize);
                }
            }
        }

        context.strokeStyle = '#f4f1df';
        context.lineWidth = 10;
        context.strokeRect(96, 36, canvas.width - 192, canvas.height - 72);

        context.fillStyle = '#f4f1df';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '900 112px Arial, sans-serif';
        context.fillText(label, canvas.width / 2, 108);

        context.font = '900 44px Arial, sans-serif';
        context.fillStyle = '#ffd447';
        context.fillText('RALLYRUSHII', canvas.width / 2, 190);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
        return texture;
    }

    function createRallyStructure(scene, game, zPosition, isFinishLine) {
        const poleHeight = 10;
        const poleWidth = 0.5;
        const poleDepth = 0.5;
        const bannerWidth = game.road.width; // Match the road's width
        const bannerHeight = 3;
    
        // Get the road data at the specified zPosition
        const roadData = getRoadDataAtZ(zPosition, game);
    
        // Create poles
        const poleGeometry = new THREE.BoxGeometry(poleWidth, poleHeight, poleDepth);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
    
        // Position poles
        leftPole.position.set(roadData.curve - bannerWidth / 2, roadData.y + poleHeight / 2, zPosition);
        rightPole.position.set(roadData.curve + bannerWidth / 2, roadData.y + poleHeight / 2, zPosition);
    
        const bannerTexture = createBannerTexture(isFinishLine ? 'FINISH' : 'START');
    
        // Create banner
        const bannerGeometry = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
        const bannerMaterial = new THREE.MeshBasicMaterial({ map: bannerTexture, side: THREE.DoubleSide });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(roadData.curve, roadData.y + poleHeight - bannerHeight / 2, zPosition);
    
        // Ensure the banner is facing the correct direction
        banner.rotation.y = Math.PI; // Rotate the banner to face the player
    
        // Add to scene
        scene.add(leftPole, rightPole, banner);
    
        if (isFinishLine) {
            // Add a finish line tape on the ground
            const lineGeometry = new THREE.PlaneGeometry(bannerWidth, 0.2);
            const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const finishLine = new THREE.Mesh(lineGeometry, lineMaterial);
            finishLine.rotation.x = -Math.PI / 2;
            finishLine.position.set(roadData.curve, roadData.y + 0.1, zPosition);
            scene.add(finishLine);
        }
    }
    
    createRallyStructure(scene, game, game.startLine, false); // Place at the start line
    createRallyStructure(scene, game, game.finishLine, true); // Place at the finish line
}

function getRoadDataAtZ(z, game) {
    const segmentLength = 10;
    const maxIndex = game.road.segments.length - 1;
    const rawIndex = Math.max(0, Math.min(maxIndex, Math.abs(z) / segmentLength));
    const index = Math.floor(rawIndex);
    const t = rawIndex - index;
    const getSegment = offset => game.road.segments[Math.max(0, Math.min(maxIndex, index + offset))];
    const previousSegment = getSegment(-1);
    const segment = getSegment(0);
    const nextSegment = getSegment(1);
    const followingSegment = getSegment(2);
    const smoothValue = (p0, p1, p2, p3) => {
        const t2 = t * t;
        const t3 = t2 * t;

        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    };
    const curve = smoothValue(previousSegment.curve, segment.curve, nextSegment.curve, followingSegment.curve);
    const y = smoothValue(previousSegment.y, segment.y, nextSegment.y, followingSegment.y);
    const nextCurve = smoothValue(segment.curve, nextSegment.curve, followingSegment.curve, getSegment(3).curve);

    return {
        y,
        curve,
        curvatureAngle: Math.atan2(nextCurve - curve, segmentLength)
    };
}
