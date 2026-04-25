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

function loadImageIntoTexture(texture, url) {
    const loader = new THREE.TextureLoader();
    loader.load(url, (loadedTexture) => {
        texture.image = loadedTexture.image;
        texture.needsUpdate = true;
        loadedTexture.dispose();
    }, undefined, () => {
        // Keep the procedural fallback when the optional local asset is unavailable.
    });
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

function createLakeSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#78b7cb');
    skyGradient.addColorStop(0.42, '#a6ccd4');
    skyGradient.addColorStop(0.72, '#c7d9d7');
    skyGradient.addColorStop(1, '#d6dfd7');
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const drawCloudCluster = (cx, cy, width, height, puffCount, opacity, warmth = 0) => {
        context.save();
        context.globalCompositeOperation = 'source-over';
        for (let i = 0; i < puffCount; i++) {
            const t = i / Math.max(1, puffCount - 1);
            const x = cx + (t - 0.5) * width + Math.sin(i * 1.71 + width * 0.01) * width * 0.08;
            const y = cy + Math.sin(t * Math.PI) * -height * (0.16 + Math.random() * 0.22) + (Math.random() - 0.5) * height * 0.48;
            const rx = width * (0.055 + Math.random() * 0.075);
            const ry = height * (0.18 + Math.random() * 0.22);
            const cloud = context.createRadialGradient(x - rx * 0.22, y - ry * 0.34, 0, x, y, Math.max(rx, ry));
            cloud.addColorStop(0, `rgba(255,${Math.round(255 - warmth * 8)},${Math.round(255 - warmth * 18)},${opacity})`);
            cloud.addColorStop(0.42, `rgba(234,242,244,${opacity * 0.58})`);
            cloud.addColorStop(0.78, `rgba(150,171,178,${opacity * 0.22})`);
            cloud.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = cloud;
            context.beginPath();
            context.ellipse(x, y, rx, ry, Math.sin(i * 0.6) * 0.06, 0, Math.PI * 2);
            context.fill();
        }

        context.globalCompositeOperation = 'source-atop';
        context.globalAlpha = opacity * 0.16;
        context.fillStyle = '#78909a';
        context.beginPath();
        context.ellipse(cx, cy + height * 0.18, width * 0.45, height * 0.24, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    };

    for (let x = -120; x < canvas.width + 220; x += 180 + Math.random() * 130) {
        drawCloudCluster(
            x + Math.random() * 80,
            92 + Math.random() * 150,
            220 + Math.random() * 210,
            54 + Math.random() * 58,
            10 + Math.floor(Math.random() * 10),
            0.34 + Math.random() * 0.2,
            0.6
        );
    }

    for (let x = -260; x < canvas.width + 320; x += 260 + Math.random() * 180) {
        drawCloudCluster(
            x + Math.random() * 120,
            250 + Math.random() * 140,
            330 + Math.random() * 330,
            70 + Math.random() * 78,
            12 + Math.floor(Math.random() * 12),
            0.28 + Math.random() * 0.18,
            0.2
        );
    }

    for (let x = -180; x < canvas.width + 260; x += 360 + Math.random() * 240) {
        drawCloudCluster(
            x + Math.random() * 160,
            430 + Math.random() * 90,
            520 + Math.random() * 420,
            82 + Math.random() * 70,
            14 + Math.floor(Math.random() * 14),
            0.18 + Math.random() * 0.12,
            0.1
        );
    }

    const haze = context.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
    haze.addColorStop(0, 'rgba(198,218,216,0)');
    haze.addColorStop(0.42, 'rgba(211,222,216,0.28)');
    haze.addColorStop(1, 'rgba(224,226,210,0.58)');
    context.fillStyle = haze;
    context.fillRect(0, canvas.height * 0.48, canvas.width, canvas.height * 0.52);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function createCoastalSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#5faed2');
    skyGradient.addColorStop(0.36, '#94c8dd');
    skyGradient.addColorStop(0.68, '#c6dcd9');
    skyGradient.addColorStop(1, '#e5e0c6');
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const sun = context.createRadialGradient(125, 135, 0, 125, 135, 420);
    sun.addColorStop(0, 'rgba(255,247,202,0.95)');
    sun.addColorStop(0.16, 'rgba(255,237,177,0.5)');
    sun.addColorStop(0.46, 'rgba(255,224,154,0.16)');
    sun.addColorStop(1, 'rgba(255,224,154,0)');
    context.fillStyle = sun;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const seededUnit = seed => {
        const value = Math.sin(seed * 127.1 + 41.7) * 43758.5453;
        return value - Math.floor(value);
    };

    const drawCloudBank = (y, height, opacity, seedOffset, scale = 1) => {
        context.save();
        context.filter = 'blur(9px)';
        const base = context.createLinearGradient(0, y - height * 0.55, 0, y + height * 0.78);
        base.addColorStop(0, 'rgba(255,255,255,0)');
        base.addColorStop(0.22, `rgba(255,252,240,${opacity * 0.38})`);
        base.addColorStop(0.58, `rgba(230,236,232,${opacity * 0.28})`);
        base.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = base;
        context.beginPath();
        context.moveTo(-120, y + height * 0.28);
        for (let x = -120; x <= canvas.width + 140; x += 70) {
            const wave = Math.sin(x * 0.006 + seedOffset) * height * 0.1
                + Math.sin(x * 0.014 + seedOffset * 1.7) * height * 0.055;
            context.lineTo(x, y + wave);
        }
        for (let x = canvas.width + 140; x >= -120; x -= 70) {
            const wave = Math.sin(x * 0.005 + seedOffset * 0.6) * height * 0.08;
            context.lineTo(x, y + height * 0.58 + wave);
        }
        context.closePath();
        context.fill();

        for (let i = 0; i < Math.ceil(22 * scale); i++) {
            const t = i / Math.max(1, Math.ceil(22 * scale) - 1);
            const jitter = seededUnit(seedOffset + i * 3.19);
            const x = -180 + t * (canvas.width + 360) + (seededUnit(seedOffset + i * 5.7) - 0.5) * 90;
            const puffY = y + (seededUnit(seedOffset + i * 7.3) - 0.5) * height * 0.45
                + Math.sin(t * Math.PI * 2 + seedOffset) * height * 0.08;
            const rx = height * (1.05 + seededUnit(seedOffset + i * 11.1) * 1.4);
            const ry = height * (0.22 + seededUnit(seedOffset + i * 13.7) * 0.22);
            const cloud = context.createRadialGradient(x - rx * 0.18, puffY - ry * 0.3, 0, x, puffY, Math.max(rx, ry));
            cloud.addColorStop(0, `rgba(255,252,241,${opacity * 0.68})`);
            cloud.addColorStop(0.46, `rgba(238,242,238,${opacity * 0.42})`);
            cloud.addColorStop(0.82, `rgba(136,159,168,${opacity * 0.12})`);
            cloud.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = cloud;
            context.beginPath();
            context.ellipse(x, puffY, rx, ry, Math.sin(i * 0.67 + seedOffset) * 0.06, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = opacity * 0.16;
        context.fillStyle = '#7e99a3';
        context.beginPath();
        context.ellipse(canvas.width * 0.52, y + height * 0.42, canvas.width * 0.56, height * 0.22, 0, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        context.filter = 'none';
        context.restore();
    };

    drawCloudBank(120, 150, 0.54, 1.7, 1.25);
    drawCloudBank(265, 120, 0.3, 5.1, 1);
    drawCloudBank(405, 105, 0.18, 9.4, 0.82);

    const seaHaze = context.createLinearGradient(0, canvas.height * 0.52, 0, canvas.height);
    seaHaze.addColorStop(0, 'rgba(197,219,216,0)');
    seaHaze.addColorStop(0.44, 'rgba(219,226,211,0.22)');
    seaHaze.addColorStop(1, 'rgba(238,225,187,0.54)');
    context.fillStyle = seaHaze;
    context.fillRect(0, canvas.height * 0.52, canvas.width, canvas.height * 0.48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function createJungleSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#6e9eaa');
    skyGradient.addColorStop(0.34, '#8fb7b4');
    skyGradient.addColorStop(0.68, '#a8bfae');
    skyGradient.addColorStop(1, '#597f61');
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const stormBand = context.createLinearGradient(0, 0, 0, canvas.height * 0.58);
    stormBand.addColorStop(0, 'rgba(58,75,78,0.5)');
    stormBand.addColorStop(0.45, 'rgba(94,112,109,0.34)');
    stormBand.addColorStop(1, 'rgba(128,150,142,0)');
    context.fillStyle = stormBand;
    context.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    const drawRainCloud = (cx, cy, width, height, opacity, seed) => {
        context.save();
        context.filter = 'blur(10px)';
        for (let i = 0; i < 18; i++) {
            const t = i / 17;
            const x = cx + (t - 0.5) * width + Math.sin(seed + i * 1.7) * width * 0.08;
            const y = cy + Math.sin(t * Math.PI) * -height * 0.16 + Math.cos(seed * 0.7 + i) * height * 0.18;
            const rx = width * (0.07 + (Math.sin(seed + i * 2.1) * 0.5 + 0.5) * 0.08);
            const ry = height * (0.22 + (Math.cos(seed + i * 1.3) * 0.5 + 0.5) * 0.18);
            const cloud = context.createRadialGradient(x - rx * 0.2, y - ry * 0.35, 0, x, y, Math.max(rx, ry));
            cloud.addColorStop(0, `rgba(214,226,221,${opacity * 0.68})`);
            cloud.addColorStop(0.52, `rgba(126,146,141,${opacity * 0.42})`);
            cloud.addColorStop(1, 'rgba(64,78,76,0)');
            context.fillStyle = cloud;
            context.beginPath();
            context.ellipse(x, y, rx, ry, Math.sin(seed + i) * 0.08, 0, Math.PI * 2);
            context.fill();
        }
        context.filter = 'none';
        context.restore();
    };

    for (let x = -260; x < canvas.width + 320; x += 320) {
        drawRainCloud(x + 120, 112 + Math.sin(x * 0.01) * 24, 520, 150, 0.56, x * 0.03);
    }
    for (let x = -180; x < canvas.width + 260; x += 420) {
        drawRainCloud(x + 150, 310 + Math.cos(x * 0.008) * 26, 620, 120, 0.34, x * 0.019 + 9);
    }

    context.globalAlpha = 0.2;
    context.strokeStyle = '#e2f3ef';
    context.lineWidth = 1.2;
    for (let i = 0; i < 340; i++) {
        const x = Math.random() * canvas.width;
        const y = 85 + Math.random() * canvas.height * 0.78;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - 20 - Math.random() * 18, y + 58 + Math.random() * 40);
        context.stroke();
    }
    context.globalAlpha = 1;

    const canopyHaze = context.createLinearGradient(0, canvas.height * 0.44, 0, canvas.height);
    canopyHaze.addColorStop(0, 'rgba(116,143,133,0)');
    canopyHaze.addColorStop(0.45, 'rgba(112,141,120,0.34)');
    canopyHaze.addColorStop(1, 'rgba(47,88,51,0.64)');
    context.fillStyle = canopyHaze;
    context.fillRect(0, canvas.height * 0.44, canvas.width, canvas.height * 0.56);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function createRoadTexture(environment, segmentCount) {
    const repeatY = environment.roadStyle === 'mud-road'
        ? Math.max(7, segmentCount / 28)
        : Math.max(24, segmentCount / 8);
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
        },
        'city-asphalt': {
            base: '#262d32',
            flecks: ['#47525a', '#161c21', '#687177', '#889197'],
            line: '#ffd24e',
            edge: '#f7f7f2'
        },
        'wet-asphalt': {
            base: '#0f2028',
            flecks: ['#1f3942', '#071219', '#426571', '#84a8b0'],
            line: '#d7f7ff',
            edge: '#e8fbff'
        },
        'mud-road': {
            base: '#3f2d22',
            flecks: ['#5a4130', '#251912', '#756047', '#8a744f', '#1d130d'],
            line: null,
            edge: null
        },
        'coastal-asphalt': {
            base: '#525b60',
            flecks: ['#758087', '#363f45', '#a0a494', '#c3bd9a'],
            line: '#fff3c8',
            edge: '#fbfbf4'
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

        if (environment.roadStyle === 'mud-road') {
            drawSpeckle(context, width, height, palette.flecks, 2300, 1, 3, 0.24);
            context.globalAlpha = 0.26;
            palette.flecks.forEach((color, colorIndex) => {
                context.fillStyle = color;
                for (let i = 0; i < 210; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    context.beginPath();
                    context.ellipse(
                        x,
                        y,
                        1.2 + Math.random() * 4.4,
                        0.45 + Math.random() * 1.5,
                        Math.random() * Math.PI,
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                }
            });
            context.globalAlpha = 1;

            const rutGradient = context.createLinearGradient(0, 0, width, 0);
            rutGradient.addColorStop(0, 'rgba(45,31,22,0)');
            rutGradient.addColorStop(0.18, 'rgba(30,20,14,0.32)');
            rutGradient.addColorStop(0.27, 'rgba(117,93,62,0.16)');
            rutGradient.addColorStop(0.5, 'rgba(66,44,28,0.06)');
            rutGradient.addColorStop(0.73, 'rgba(117,93,62,0.16)');
            rutGradient.addColorStop(0.82, 'rgba(30,20,14,0.32)');
            rutGradient.addColorStop(1, 'rgba(45,31,22,0)');
            context.fillStyle = rutGradient;
            context.fillRect(0, 0, width, height);

            context.globalAlpha = 0.24;
            context.strokeStyle = '#21150f';
            context.lineWidth = 7;
            [width * 0.28, width * 0.72].forEach((rutX, rutIndex) => {
                context.beginPath();
                for (let y = -20; y <= height + 20; y += 26) {
                    const wobble = Math.sin(y * 0.018 + rutIndex * 3.1) * 8 + Math.sin(y * 0.047) * 2.4;
                    if (y <= -20) {
                        context.moveTo(rutX + wobble, y);
                    } else {
                        context.lineTo(rutX + wobble, y);
                    }
                }
                context.stroke();
            });

            context.globalAlpha = 0.032;
            context.strokeStyle = '#806744';
            context.lineWidth = 0.9;
            for (let i = 0; i < 14; i++) {
                const x = width * (0.12 + Math.random() * 0.76);
                context.beginPath();
                context.moveTo(x + Math.sin(i) * 4, 0);
                for (let y = 0; y <= height; y += 42) {
                    context.lineTo(x + Math.sin(y * 0.018 + i) * (5 + Math.random() * 4), y);
                }
                context.stroke();
            }

            context.globalAlpha = 0.2;
            context.strokeStyle = '#160f0b';
            context.lineWidth = 6;
            for (let i = 0; i < 18; i++) {
                const x = width * (0.14 + Math.random() * 0.72);
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(x - 18 - Math.random() * 28, y + Math.random() * 10);
                context.bezierCurveTo(
                    x + Math.random() * 22,
                    y - 8 - Math.random() * 18,
                    x + 34 + Math.random() * 42,
                    y + 8 + Math.random() * 24,
                    x + 72 + Math.random() * 36,
                    y - 4 + Math.random() * 16
                );
                context.stroke();
            }

            context.globalAlpha = 0.46;
            for (let i = 0; i < 46; i++) {
                const x = width * (0.14 + Math.random() * 0.72);
                const y = Math.random() * height;
                const rx = 7 + Math.random() * 20;
                const ry = 2 + Math.random() * 7;
                const puddle = context.createRadialGradient(x, y, 0, x, y, rx);
                puddle.addColorStop(0, 'rgba(104,128,111,0.55)');
                puddle.addColorStop(0.48, 'rgba(63,83,73,0.32)');
                puddle.addColorStop(1, 'rgba(39,32,25,0)');
                context.fillStyle = puddle;
                context.beginPath();
                context.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
                context.fill();
            }

            context.globalAlpha = 1;
            return;
        }

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

        if (palette.edge) {
            context.fillStyle = palette.edge;
            context.fillRect(34, 0, 10, height);
            context.fillRect(width - 44, 0, 10, height);
        }

        if (palette.line) {
            context.fillStyle = palette.line;
            const dashHeight = 86;
            const dashGap = 86;
            for (let y = 24; y < height; y += dashHeight + dashGap) {
                context.fillRect(width / 2 - 5, y, 10, dashHeight);
            }
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

    if (environment.terrainStyle === 'urban') {
        return createCanvasTexture(512, 512, 6, repeatY, (context, width, height) => {
            context.fillStyle = '#59636b';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#909aa1', '#3d474f', '#242b31', '#aeb7bd'], 7600, 1, 5, 0.68);
            context.globalAlpha = 0.22;
            context.strokeStyle = '#1d252b';
            context.lineWidth = 2;
            for (let x = 0; x < width; x += 46) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = 0; y < height; y += 58) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }
            context.globalAlpha = 1;
        });
    }

    if (environment.terrainStyle === 'lake-country') {
        const texture = createCanvasTexture(512, 512, 7, repeatY, (context, width, height) => {
            context.fillStyle = '#426a3f';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#6f9557', '#2f5133', '#9fb979', '#223d2b', '#80785b'], 7600, 1, 6, 0.78);
            drawGrassStrokes(context, width, height, ['#88ac6c', '#587a4f', '#c0cc8a', '#314f35'], 2100);
            context.globalAlpha = 0.2;
            context.strokeStyle = '#7c725a';
            context.lineWidth = 2;
            for (let i = 0; i < 36; i++) {
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(Math.random() * width, y);
                context.bezierCurveTo(width * 0.28, y + 14, width * 0.56, y - 18, width, y + 8);
                context.stroke();
            }
            context.globalAlpha = 1;
        });

        return texture;
    }

    if (environment.terrainStyle === 'jungle-night' || environment.terrainStyle === 'rainforest') {
        const isRainforest = environment.terrainStyle === 'rainforest';
        return createCanvasTexture(512, 512, 8, repeatY, (context, width, height) => {
            context.fillStyle = isRainforest ? '#2d5b35' : '#082118';
            context.fillRect(0, 0, width, height);
            drawSpeckle(
                context,
                width,
                height,
                isRainforest
                    ? ['#3f7f43', '#17391f', '#69a857', '#264529', '#7a5a34', '#1f2b18']
                    : ['#155437', '#03100c', '#23824e', '#0a3528'],
                isRainforest ? 10400 : 9200,
                1,
                7,
                isRainforest ? 0.78 : 0.9
            );
            drawGrassStrokes(
                context,
                width,
                height,
                isRainforest ? ['#78a95c', '#2f713e', '#b1b766', '#1a4b2d', '#4c7d3d'] : ['#1d7844', '#0e5933', '#35a15d', '#061c15'],
                isRainforest ? 3800 : 3000
            );
            drawWavyLines(context, width, height, isRainforest ? '#214224' : '#02090d', 26, isRainforest ? 0.16 : 0.2);
            if (isRainforest) {
                context.globalAlpha = 0.2;
                context.fillStyle = '#1d1711';
                for (let i = 0; i < 80; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    context.beginPath();
                    context.ellipse(x, y, 4 + Math.random() * 18, 1.2 + Math.random() * 5, Math.random() * Math.PI, 0, Math.PI * 2);
                    context.fill();
                }
                context.globalAlpha = 1;
            }
        });
    }

    if (environment.terrainStyle === 'mediterranean') {
        return createCanvasTexture(512, 512, 7, repeatY, (context, width, height) => {
            context.fillStyle = '#91aa66';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#a7c174', '#617d4a', '#e0d27a', '#f5e7a8'], 7000, 1, 6, 0.66);
            drawGrassStrokes(context, width, height, ['#a4c073', '#5d9059', '#dfcb70'], 1550);
            drawWavyLines(context, width, height, '#dcc16f', 20, 0.14);
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

    if (environment.shoulderStyle === 'concrete') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = '#747d83';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#9ba3a7', '#525b61', '#30383e'], 3600, 1, 4, 0.72);
            context.globalAlpha = 0.22;
            context.strokeStyle = '#293136';
            for (let y = 0; y < height; y += 64) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }
            context.globalAlpha = 1;
        });
    }

    if (environment.shoulderStyle === 'dark-mud' || environment.shoulderStyle === 'jungle-mud') {
        const isJungleMud = environment.shoulderStyle === 'jungle-mud';
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = isJungleMud ? '#463622' : '#172418';
            context.fillRect(0, 0, width, height);
            drawSpeckle(
                context,
                width,
                height,
                isJungleMud ? ['#6e5935', '#21160e', '#2f4f2f', '#7a6a45', '#12351f'] : ['#223a25', '#0a120c', '#2f5030', '#314029'],
                isJungleMud ? 6200 : 5000,
                1,
                5,
                0.86
            );
            drawWavyLines(context, width, height, isJungleMud ? '#1d130d' : '#07120e', 18, isJungleMud ? 0.24 : 0.2);
            if (isJungleMud) {
                context.globalAlpha = 0.38;
                for (let i = 0; i < 34; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const puddle = context.createRadialGradient(x, y, 0, x, y, 12 + Math.random() * 22);
                    puddle.addColorStop(0, 'rgba(83,103,83,0.5)');
                    puddle.addColorStop(0.62, 'rgba(52,62,48,0.22)');
                    puddle.addColorStop(1, 'rgba(30,22,14,0)');
                    context.fillStyle = puddle;
                    context.beginPath();
                    context.ellipse(x, y, 10 + Math.random() * 24, 3 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
                    context.fill();
                }
                context.globalAlpha = 1;
            }
        });
    }

    if (environment.shoulderStyle === 'limestone-gravel') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = '#c8bf98';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#f0e5ba', '#9a8e6a', '#d6ca96', '#746c52'], 4400, 1, 5, 0.76);
        });
    }

    return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
        context.fillStyle = '#6f7657';
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, ['#9a9b7a', '#575840', '#c8c8aa', '#3d6a35'], 4300, 1, 5, 0.82);
        drawGrassStrokes(context, width, height, ['#82a85d', '#53743d', '#b4c171'], 420);
    });
}

function createLakeShoreTexture(environment, segmentCount) {
    const repeatY = Math.max(22, segmentCount / 9);
    const texture = createCanvasTexture(512, 512, 2.4, repeatY, (context, width, height) => {
        context.fillStyle = '#5e6255';
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, ['#8f9484', '#363c38', '#b6b49d', '#68705d', '#252b2a'], 8800, 1, 8, 0.86);
        context.globalAlpha = 0.34;
        context.strokeStyle = '#c8c4aa';
        context.lineWidth = 2;
        for (let i = 0; i < 90; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + 18 + Math.random() * 36, y + (Math.random() - 0.5) * 10);
            context.stroke();
        }
        context.globalAlpha = 1;
    });

    if (environment.lakeBiome?.assetTextures?.rockyShore) {
        return loadImageIntoTexture(texture, environment.lakeBiome.assetTextures.rockyShore);
    }
    return texture;
}

function createLakeWaterTexture(segmentCount) {
    const repeatY = Math.max(4, segmentCount / 110);
    return createCanvasTexture(512, 512, 1.2, repeatY, (context, width, height) => {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#082633');
        gradient.addColorStop(0.48, '#114559');
        gradient.addColorStop(1, '#061c28');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        for (let i = 0; i < 86; i++) {
            const y = Math.random() * height;
            const x = Math.random() * width;
            const length = 18 + Math.random() * 62;
            context.globalAlpha = 0.035 + Math.random() * 0.11;
            context.strokeStyle = Math.random() > 0.68 ? '#e7f7ff' : '#5ca9b8';
            context.lineWidth = 1 + Math.random() * 2;
            context.beginPath();
            context.moveTo(x, y);
            context.bezierCurveTo(x + length * 0.32, y - 6, x + length * 0.68, y + 7, x + length, y);
            context.stroke();
        }

        context.globalAlpha = 0.1;
        drawSpeckle(context, width, height, ['#c9f6ff', '#63a6b8', '#0b3344'], 260, 1, 3, 0.9);
        context.globalAlpha = 1;
    });
}

function createLakeWaterNormalTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(size, size);

    function heightAt(x, y) {
        return Math.sin(x * 0.038 + y * 0.014) * 0.72
            + Math.sin(y * 0.046 - x * 0.012) * 0.54
            + Math.sin((x + y) * 0.024) * 0.32
            + Math.sin(x * 0.12 - y * 0.085) * 0.16
            + Math.sin((x - y) * 0.17) * 0.08;
    }

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const left = heightAt(x - 1, y);
            const right = heightAt(x + 1, y);
            const down = heightAt(x, y - 1);
            const up = heightAt(x, y + 1);
            const dx = (right - left) * 0.115;
            const dy = (up - down) * 0.115;
            const length = Math.hypot(dx, dy, 1);
            const index = (y * size + x) * 4;
            imageData.data[index] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
            imageData.data[index + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255);
            imageData.data[index + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
            imageData.data[index + 3] = 255;
        }
    }

    context.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    return texture;
}

function createLakeRockTexture() {
    return createCanvasTexture(256, 256, 1.7, 1.7, (context, width, height) => {
        const baseGradient = context.createLinearGradient(0, 0, width, height);
        baseGradient.addColorStop(0, '#8d9284');
        baseGradient.addColorStop(0.45, '#5d665d');
        baseGradient.addColorStop(1, '#adb09f');
        context.fillStyle = baseGradient;
        context.fillRect(0, 0, width, height);

        drawSpeckle(context, width, height, ['#d7d6c4', '#3e473f', '#6e7669', '#a9aa98', '#262d29'], 3400, 1, 4, 0.62);

        context.globalAlpha = 0.38;
        for (let i = 0; i < 42; i++) {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const length = 24 + Math.random() * 95;
            const curve = -28 + Math.random() * 56;
            context.strokeStyle = Math.random() > 0.45 ? '#2e3833' : '#c7c5ad';
            context.lineWidth = 0.8 + Math.random() * 1.8;
            context.beginPath();
            context.moveTo(startX, startY);
            context.bezierCurveTo(
                startX + length * 0.35,
                startY + curve,
                startX + length * 0.68,
                startY - curve * 0.4,
                startX + length,
                startY + Math.random() * 18 - 9
            );
            context.stroke();
        }

        context.globalAlpha = 0.22;
        for (let y = 0; y < height; y += 16) {
            context.strokeStyle = y % 32 === 0 ? '#dae0cc' : '#2f3934';
            context.lineWidth = 1;
            context.beginPath();
            for (let x = 0; x <= width; x += 10) {
                const waveY = y + Math.sin(x * 0.05 + y * 0.21) * 4;
                if (x === 0) {
                    context.moveTo(x, waveY);
                } else {
                    context.lineTo(x, waveY);
                }
            }
            context.stroke();
        }
        context.globalAlpha = 1;
    });
}

function createMediterraneanStoneTexture() {
    return createCanvasTexture(512, 512, 2.2, 2.2, (context, width, height) => {
        const baseGradient = context.createLinearGradient(0, 0, width, height);
        baseGradient.addColorStop(0, '#b8aa8d');
        baseGradient.addColorStop(0.46, '#d3c5a7');
        baseGradient.addColorStop(1, '#8f846f');
        context.fillStyle = baseGradient;
        context.fillRect(0, 0, width, height);

        drawSpeckle(context, width, height, ['#fff0c8', '#6f6858', '#a4977c', '#d8ceb4', '#4e4a40'], 5200, 1, 5, 0.58);
        context.globalAlpha = 0.34;
        context.strokeStyle = '#5d574b';
        context.lineWidth = 2;
        const rowHeight = 34;
        for (let y = 0; y < height + rowHeight; y += rowHeight) {
            const offset = (Math.floor(y / rowHeight) % 2) * 42;
            context.beginPath();
            context.moveTo(0, y + Math.sin(y * 0.11) * 2);
            context.lineTo(width, y + Math.cos(y * 0.08) * 2);
            context.stroke();
            for (let x = -offset; x < width; x += 84 + Math.random() * 18) {
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + Math.sin(x * 0.2) * 3, y + rowHeight);
                context.stroke();
            }
        }
        context.globalAlpha = 0.28;
        for (let i = 0; i < 62; i++) {
            context.strokeStyle = Math.random() > 0.5 ? '#fff5d6' : '#463f35';
            context.lineWidth = 0.8 + Math.random() * 1.4;
            const x = Math.random() * width;
            const y = Math.random() * height;
            context.beginPath();
            context.moveTo(x, y);
            context.bezierCurveTo(x + 20, y - 8, x + 45, y + 13, x + 74, y + Math.random() * 18 - 9);
            context.stroke();
        }
        context.globalAlpha = 1;
    });
}

function createTerracottaRoofTexture() {
    return createCanvasTexture(512, 512, 1.5, 2.5, (context, width, height) => {
        const roofGradient = context.createLinearGradient(0, 0, width, height);
        roofGradient.addColorStop(0, '#e27e43');
        roofGradient.addColorStop(0.55, '#a8432c');
        roofGradient.addColorStop(1, '#6c2b22');
        context.fillStyle = roofGradient;
        context.fillRect(0, 0, width, height);
        drawSpeckle(context, width, height, ['#ffd18c', '#792b20', '#c45b33', '#3c1a17'], 3600, 1, 4, 0.52);

        context.globalAlpha = 0.32;
        for (let x = -14; x < width + 20; x += 31) {
            const tileGradient = context.createLinearGradient(x, 0, x + 16, 0);
            tileGradient.addColorStop(0, '#5b231b');
            tileGradient.addColorStop(0.5, '#e1864e');
            tileGradient.addColorStop(1, '#5e241b');
            context.strokeStyle = tileGradient;
            context.lineWidth = 9;
            context.beginPath();
            context.moveTo(x, 0);
            context.bezierCurveTo(x + 8, height * 0.28, x - 8, height * 0.62, x + 6, height);
            context.stroke();
        }
        context.globalAlpha = 0.24;
        context.strokeStyle = '#ffe1a5';
        context.lineWidth = 1.2;
        for (let y = 28; y < height; y += 38) {
            context.beginPath();
            context.moveTo(0, y + Math.sin(y) * 2);
            context.lineTo(width, y + Math.cos(y) * 2);
            context.stroke();
        }
        context.globalAlpha = 1;
    });
}

function createCoastalWaterMaterial() {
    const material = createLakeWaterMaterial();
    material.uniforms.deepColor.value.setHex(0x064a62);
    material.uniforms.waterColor.value.setHex(0x1285a0);
    material.uniforms.shallowColor.value.setHex(0x57c0bd);
    material.uniforms.foamColor.value.setHex(0xe6f3ee);
    material.uniforms.skyColor.value.setHex(0x87bfd2);
    material.uniforms.sunColor.value.setHex(0xffefc8);
    material.uniforms.sunDirection.value.set(0.48, 0.78, 0.38).normalize();
    material.uniforms.distortionScale.value = 0.16;
    material.uniforms.noiseScale.value = 0.78;
    return material;
}

function createLakeWaterMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            normalSampler: { value: createLakeWaterNormalTexture() },
            distortionScale: { value: 0.11 },
            noiseScale: { value: 1.0 },
            deepColor: { value: new THREE.Color(0x0b3441) },
            waterColor: { value: new THREE.Color(0x246c72) },
            shallowColor: { value: new THREE.Color(0x5f9b91) },
            foamColor: { value: new THREE.Color(0xc8ddd6) },
            skyColor: { value: new THREE.Color(0x8ab7bd) },
            sunColor: { value: new THREE.Color(0xf6ead2) },
            sunDirection: { value: new THREE.Vector3(0.22, 0.84, 0.5).normalize() },
            opacity: { value: 1.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vModelPosition;
            varying vec3 vSurfaceX;
            varying vec3 vSurfaceY;
            varying vec3 vSurfaceZ;

            uniform float time;

            void main() {
                vUv = uv;
                vec3 transformed = position;
                float shoreFade = smoothstep(0.06, 0.42, uv.x);
                float swellA = sin(position.x * 0.027 + position.z * 0.017 + time * 0.22);
                float swellB = sin(position.x * -0.019 + position.z * 0.031 - time * 0.18);
                transformed.y += (swellA * 0.026 + swellB * 0.018) * shoreFade;
                vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
                vWorldPosition = worldPosition.xyz;
                vModelPosition = transformed;
                vSurfaceX = normalize(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]));
                vSurfaceY = normalize(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]));
                vSurfaceZ = normalize(vec3(modelMatrix[2][0], modelMatrix[2][1], modelMatrix[2][2]));
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vModelPosition;
            varying vec3 vSurfaceX;
            varying vec3 vSurfaceY;
            varying vec3 vSurfaceZ;

            uniform float time;
            uniform float distortionScale;
            uniform float noiseScale;
            uniform sampler2D normalSampler;
            uniform vec3 deepColor;
            uniform vec3 waterColor;
            uniform vec3 shallowColor;
            uniform vec3 foamColor;
            uniform vec3 skyColor;
            uniform vec3 sunColor;
            uniform vec3 sunDirection;
            uniform float opacity;

            void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, in float shiny, in float spec, in float diffuse, inout vec3 diffuseColor, inout vec3 specularColor) {
                vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));
                float direction = max(0.0, dot(eyeDirection, reflection));
                specularColor += pow(direction, shiny) * sunColor * spec;
                diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * diffuse;
            }

            vec3 getNoise(in vec2 uv) {
                vec2 uv0 = uv / (84.0 * noiseScale) + vec2(time / 38.0, time / 47.0);
                vec2 uv1 = uv / (112.0 * noiseScale) - vec2(time / -53.0, time / 61.0);
                vec2 uv2 = uv / (vec2(211.0, 173.0) * noiseScale) + vec2(time / 97.0, time / 89.0);
                vec2 uv3 = uv / (vec2(54.0, 67.0) * noiseScale) - vec2(time / 79.0, time / -83.0);
                vec4 noise = texture2D(normalSampler, uv0)
                    + texture2D(normalSampler, uv1)
                    + texture2D(normalSampler, uv2)
                    + texture2D(normalSampler, uv3);
                return noise.xyz * 0.5 - 1.0;
            }

            void main() {
                vec3 worldToEye = cameraPosition - vWorldPosition;
                vec3 eyeDirection = normalize(worldToEye);
                vec3 noise = getNoise(vModelPosition.xz);
                vec3 distortedCoord = (noise.x * vSurfaceX + noise.y * vSurfaceZ) * distortionScale;
                vec3 distortedNormal = normalize(distortedCoord + vSurfaceY);
                if (dot(eyeDirection, vSurfaceY) < 0.0) {
                    distortedNormal *= -1.0;
                }

                vec3 diffuseLight = vec3(0.0);
                vec3 specularLight = vec3(0.0);
                sunLight(distortedNormal, eyeDirection, 96.0, 0.48, 0.22, diffuseLight, specularLight);

                float theta = max(dot(eyeDirection, distortedNormal), 0.0);
                float reflectance = 0.1 + 0.54 * pow(1.0 - theta, 4.0);
                float depthFade = smoothstep(0.06, 0.92, vUv.x);
                vec3 baseWater = mix(shallowColor, waterColor, smoothstep(0.02, 0.54, vUv.x));
                baseWater = mix(baseWater, deepColor, depthFade * 0.78);
                vec3 scatter = (0.34 + 0.66 * max(dot(distortedNormal, eyeDirection), 0.0)) * baseWater;
                vec3 reflectionColor = mix(skyColor, deepColor, smoothstep(0.15, 0.92, depthFade)) + specularLight;
                vec3 color = mix(scatter + diffuseLight * 0.18, reflectionColor, reflectance);

                vec3 detailNoise = getNoise(vModelPosition.xz * 2.2 + vec2(37.0, -19.0));
                float shimmer = clamp((noise.x * 0.32 + noise.y * 0.22 + detailNoise.z * 0.46) * 0.5 + 0.5, 0.0, 1.0);
                float brokenGlint = smoothstep(0.66, 0.98, shimmer + reflectance * 0.24)
                    * smoothstep(0.14, 0.94, vUv.x);
                float rippleContrast = (shimmer - 0.5) * smoothstep(0.08, 0.92, vUv.x);
                color += vec3(0.038, 0.07, 0.064) * rippleContrast;
                color += vec3(0.105, 0.16, 0.15) * brokenGlint * (0.16 + reflectance * 0.34);

                float shoreFoam = (1.0 - smoothstep(0.014, 0.115, vUv.x))
                    * (0.5 + 0.5 * sin(vWorldPosition.z * 0.17 + time * 1.08))
                    * (0.52 + 0.48 * sin(vWorldPosition.x * 0.23 - time * 0.73));
                color = mix(color, foamColor, shoreFoam * 0.08);
                color = clamp(color, 0.0, 1.0);
                gl_FragColor = vec4(color, opacity);
            }
        `,
        transparent: false,
        depthWrite: true,
        side: THREE.DoubleSide
    });
}

function createConiferSpriteTexture(variant = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const palette = [
        {
            shadow: '#08251f',
            dark: '#123d30',
            mid: '#2c6344',
            light: '#5f8f62',
            trunk: '#4a3022'
        },
        {
            shadow: '#061b1a',
            dark: '#17372e',
            mid: '#355b3d',
            light: '#729168',
            trunk: '#3c2a21'
        },
        {
            shadow: '#0a2018',
            dark: '#20412d',
            mid: '#476d3d',
            light: '#8ca65f',
            trunk: '#523b29'
        }
    ][variant % 3];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.shadowColor = 'rgba(0, 0, 0, 0.32)';
    context.shadowBlur = 8;
    context.shadowOffsetY = 4;

    const trunkGradient = context.createLinearGradient(110, 0, 146, 0);
    trunkGradient.addColorStop(0, '#211610');
    trunkGradient.addColorStop(0.45, palette.trunk);
    trunkGradient.addColorStop(1, '#150d09');
    context.fillStyle = trunkGradient;
    context.beginPath();
    context.moveTo(112, 494);
    context.lineTo(122, 132);
    context.lineTo(138, 132);
    context.lineTo(146, 494);
    context.closePath();
    context.fill();

    for (let tier = 0; tier < 18; tier++) {
        const t = tier / 17;
        const centerY = 116 + t * 328;
        const tierWidth = 34 + t * 98 + Math.sin(tier * 1.7 + variant) * 6;
        const tierHeight = 32 + t * 30;
        const colorPick = tier % 3 === 0 ? palette.light : tier % 3 === 1 ? palette.mid : palette.dark;
        const branchGradient = context.createLinearGradient(128 - tierWidth, centerY, 128 + tierWidth, centerY + tierHeight);
        branchGradient.addColorStop(0, palette.shadow);
        branchGradient.addColorStop(0.35, colorPick);
        branchGradient.addColorStop(0.72, palette.mid);
        branchGradient.addColorStop(1, palette.shadow);
        context.fillStyle = branchGradient;
        context.beginPath();
        context.moveTo(128, centerY - tierHeight * 0.58);
        for (let i = 0; i <= 8; i++) {
            const u = i / 8;
            const jitter = Math.sin((i + tier) * 1.93 + variant * 2.1) * 7;
            context.lineTo(128 + tierWidth * (u - 0.5) * 2, centerY + tierHeight * (0.25 + Math.abs(u - 0.5) * 0.65) + jitter);
        }
        context.closePath();
        context.fill();

        context.globalAlpha = 0.22;
        context.strokeStyle = palette.light;
        context.lineWidth = 1.6;
        for (let stroke = 0; stroke < 7; stroke++) {
            const side = stroke % 2 === 0 ? -1 : 1;
            const branchLength = tierWidth * (0.25 + (stroke / 7) * 0.48);
            const y = centerY - tierHeight * 0.12 + stroke * 4;
            context.beginPath();
            context.moveTo(128, y);
            context.lineTo(128 + side * branchLength, y + tierHeight * 0.25 + Math.sin(stroke + tier) * 4);
            context.stroke();
        }
        context.globalAlpha = 1;
    }

    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-atop';
    context.globalAlpha = 0.12;
    drawSpeckle(context, canvas.width, canvas.height, ['#dce9bb', '#0d231d', '#ffffff'], 180, 1, 3, 0.7);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function generateRoadAndTerrain(scene, game, environment) {
    const terrainNoise = new SimplexNoise();
    const roadNoise = new SimplexNoise();
    const lakeNoise = new SimplexNoise();
    const terrainProfile = {
        heightRange: environment.mountainHeightRange || environment.maxMountainHeight * 2,
        heightPower: environment.mountainHeightPower || 1,
        noiseScale: environment.mountainNoiseScale || 0.01,
        noiseGain: environment.mountainNoiseGain || 0.34,
        roadsideDelay: environment.mountainRoadsideDelay || 0,
        roadsidePower: environment.mountainRoadsidePower || 1
    };
    
    function generateMountainHeight(x, z) {
        const rawNoise = terrainNoise.noise2D(x * terrainProfile.noiseScale, z * terrainProfile.noiseScale);
        const normalizedNoise = THREE.MathUtils.clamp(rawNoise * terrainProfile.noiseGain, -1, 1);
        const liftedNoise = (normalizedNoise + 1) * 0.5;
        return Math.pow(liftedNoise, terrainProfile.heightPower) * terrainProfile.heightRange;
    }

    function getTerrainLiftFactor(normalizedDistance) {
        const delay = THREE.MathUtils.clamp(terrainProfile.roadsideDelay, 0, 0.9);
        const t = THREE.MathUtils.clamp((normalizedDistance - delay) / Math.max(0.1, 1 - delay), 0, 1);
        const smoothT = t * t * (3 - 2 * t);
        return Math.pow(smoothT, terrainProfile.roadsidePower);
    }

    function generateRoadCurve(z) {
        return roadNoise.noise2D(z * 0.002, 0) * 40;
    }

    const segmentLength = 10;
    const extraSegmentsAfterFinish = 100;
    const totalSegments = Math.ceil(Math.abs(game.finishLine) / segmentLength) + extraSegmentsAfterFinish;
    const roadElevationAmplitude = Number.isFinite(environment.roadElevationAmplitude)
        ? environment.roadElevationAmplitude
        : 10;
    
    function createRoadSegment(index) {
        const z = -index * segmentLength;
        const curve = generateRoadCurve(z);
        const y = Math.sin(z * 0.01) * roadElevationAmplitude; // Gentle road elevation changes
        
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
    const shoulderWidth = environment.shoulderWidth || 4;
    const localUp = new THREE.Vector3(0, 1, 0);
    const lowestRoadY = game.road.segments.reduce((lowest, segment) => Math.min(lowest, segment.y), Infinity);
    const lakeBiome = environment.id === 'lakes'
        ? {
            waterLevelOffset: 1.05,
            waterDepth: 1.6,
            shoreWidth: 5.5,
            minShoreDistance: 8.5,
            maxShoreDistance: 36,
            guardrailDistance: 22,
            horizonWaterExtension: 130,
            causeways: [
                { center: -960, width: 1120 },
                { center: -3150, width: 1220 },
                { center: -5050, width: 960 }
            ],
            ...environment.lakeBiome
        }
        : null;
    const coastalBiome = environment.id === 'coastal'
        ? {
            seaSide: -1,
            seaLevelOffset: 3.6,
            shoreWidth: 7,
            minShoreDistance: 10,
            maxShoreDistance: 22,
            horizonWaterExtension: 260,
            wallDistance: 1.15,
            hillsideMinDistance: 12,
            ...environment.coastalBiome
        }
        : null;
    if (lakeBiome) {
        lakeBiome.waterLevel = Number.isFinite(lakeBiome.waterLevel)
            ? lakeBiome.waterLevel
            : lowestRoadY - lakeBiome.waterLevelOffset;
    }
    if (coastalBiome) {
        coastalBiome.seaLevel = Number.isFinite(coastalBiome.seaLevel)
            ? coastalBiome.seaLevel
            : lowestRoadY - coastalBiome.seaLevelOffset;
    }

    function smoothStep(edge0, edge1, value) {
        const t = THREE.MathUtils.clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    function smoothBand(z, center, width) {
        const halfWidth = Math.max(1, width * 0.5);
        const t = THREE.MathUtils.clamp(1 - Math.abs(z - center) / halfWidth, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function getLakeSideIntensity(side, z) {
        if (!lakeBiome) {
            return 0;
        }

        const causewayIntensity = lakeBiome.causeways.reduce((max, band) => {
            return Math.max(max, smoothBand(z, band.center, band.width));
        }, 0);
        const basinNoise = (lakeNoise.noise2D(z * 0.0012, side * 8.31) + 1) * 0.5;

        if (side < 0) {
            return THREE.MathUtils.clamp(0.76 + causewayIntensity * 0.18 + basinNoise * 0.08, 0, 1);
        }

        return THREE.MathUtils.clamp(causewayIntensity * 0.92 + Math.max(0, basinNoise - 0.68) * 0.34, 0, 1);
    }

    function getLakeShoreProfile(side, z, roadData = null) {
        if (!lakeBiome) {
            return { active: false, intensity: 0, shoreDistance: terrainWidth + shoulderWidth, waterLevel: 0 };
        }

        const terrainRoadData = roadData || getLinearRoadDataAtZ(z);
        const intensity = getLakeSideIntensity(side, z);
        const active = intensity > 0.16;
        const broadNoise = lakeNoise.noise2D(z * 0.0045, side * 17.13);
        const detailNoise = lakeNoise.noise2D(z * 0.018, side * 3.7);
        const causewayPull = lakeBiome.causeways.reduce((max, band) => {
            return Math.max(max, smoothBand(z, band.center, band.width * 0.72));
        }, 0);
        const baseDistance = side < 0
            ? 15 - intensity * 5 - causewayPull * 2.5
            : 38 - intensity * 27 - causewayPull * 3.5;
        const shoreDistance = THREE.MathUtils.clamp(
            baseDistance + broadNoise * 7.5 + detailNoise * 2.2,
            lakeBiome.minShoreDistance,
            lakeBiome.maxShoreDistance
        );
        const waterLevel = lakeBiome.waterLevel;

        return { active, intensity, shoreDistance, waterLevel };
    }

    function getLakeAdjustedTerrainHeight(x, z, baseHeight, roadData = null) {
        if (!lakeBiome) {
            return baseHeight;
        }

        const terrainRoadData = roadData || getLinearRoadDataAtZ(z);
        const side = x < terrainRoadData.curve ? -1 : 1;
        const distanceFromRoadEdge = Math.abs(x - terrainRoadData.curve) - halfRoadWidth;
        const profile = getLakeShoreProfile(side, z, terrainRoadData);

        if (!profile.active || distanceFromRoadEdge < profile.shoreDistance - lakeBiome.shoreWidth * 1.45) {
            return baseHeight;
        }

        const shoreNoise = lakeNoise.noise2D(x * 0.05, z * 0.013) * 0.18;
        const shoreStart = profile.shoreDistance - lakeBiome.shoreWidth;
        const waterStart = profile.shoreDistance + lakeBiome.shoreWidth * 0.55;
        const waterT = smoothStep(shoreStart, waterStart, distanceFromRoadEdge);
        const shorelineY = profile.waterLevel + 0.22 + shoreNoise;
        const underwaterY = profile.waterLevel - lakeBiome.waterDepth * (0.75 + profile.intensity * 0.45);
        const carvedY = THREE.MathUtils.lerp(shorelineY, underwaterY, waterT);
        const carveStrength = smoothStep(profile.shoreDistance - lakeBiome.shoreWidth * 1.5, profile.shoreDistance + lakeBiome.shoreWidth * 0.7, distanceFromRoadEdge);

        return THREE.MathUtils.lerp(baseHeight, Math.min(baseHeight, carvedY), carveStrength);
    }

    function isPointInLakeWater(x, z) {
        if (!lakeBiome) {
            return false;
        }

        const terrainRoadData = getLinearRoadDataAtZ(z);
        const side = x < terrainRoadData.curve ? -1 : 1;
        const distanceFromRoadEdge = Math.abs(x - terrainRoadData.curve) - halfRoadWidth;
        const profile = getLakeShoreProfile(side, z, terrainRoadData);
        return profile.active && distanceFromRoadEdge > profile.shoreDistance + lakeBiome.shoreWidth * 0.45;
    }

    function getCoastalShoreProfile(side, z, roadData = null) {
        if (!coastalBiome || side !== coastalBiome.seaSide) {
            return { active: false, shoreDistance: terrainWidth + shoulderWidth, seaLevel: 0 };
        }

        const terrainRoadData = roadData || getLinearRoadDataAtZ(z);
        const broadNoise = lakeNoise.noise2D(z * 0.0022, 71.4);
        const detailNoise = lakeNoise.noise2D(z * 0.013, 14.8);
        const curveShelter = Math.abs(terrainRoadData.curve) / 58;
        const shoreDistance = THREE.MathUtils.clamp(
            14.5 + broadNoise * 4.8 + detailNoise * 1.7 - curveShelter * 1.6,
            coastalBiome.minShoreDistance,
            coastalBiome.maxShoreDistance
        );

        return { active: true, shoreDistance, seaLevel: coastalBiome.seaLevel };
    }

    function getCoastalAdjustedTerrainHeight(x, z, baseHeight, roadData = null) {
        if (!coastalBiome) {
            return baseHeight;
        }

        const terrainRoadData = roadData || getLinearRoadDataAtZ(z);
        const side = x < terrainRoadData.curve ? -1 : 1;
        const distanceFromRoadEdge = Math.abs(x - terrainRoadData.curve) - halfRoadWidth;

        if (side === coastalBiome.seaSide) {
            const profile = getCoastalShoreProfile(side, z, terrainRoadData);
            const protectedRoadside = shoulderWidth + 0.35;
            if (distanceFromRoadEdge <= protectedRoadside) {
                return baseHeight;
            }

            const cliffStart = shoulderWidth + 0.65;
            const upperBankEnd = Math.max(cliffStart + 2, profile.shoreDistance - coastalBiome.shoreWidth * 0.62);
            const waterStart = profile.shoreDistance + coastalBiome.shoreWidth * 0.55;
            const bankT = smoothStep(cliffStart, waterStart, distanceFromRoadEdge);
            const shelfT = smoothStep(protectedRoadside, upperBankEnd, distanceFromRoadEdge);
            const rockNoise = lakeNoise.noise2D(x * 0.041, z * 0.017) * 0.26 + lakeNoise.noise2D(x * 0.12, z * 0.036) * 0.08;
            const upperY = THREE.MathUtils.lerp(baseHeight, terrainRoadData.y - 0.18, shelfT);
            const cliffY = THREE.MathUtils.lerp(upperY, profile.seaLevel - 0.68, bankT) + rockNoise * (1 - bankT * 0.35);
            return Math.min(baseHeight, cliffY);
        }

        const hillsideT = smoothStep(shoulderWidth + coastalBiome.hillsideMinDistance, terrainWidth * 0.82, distanceFromRoadEdge);
        const cliffNoise = lakeNoise.noise2D(x * 0.009, z * 0.006) * 2.4 + lakeNoise.noise2D(x * 0.024, z * 0.012) * 0.8;
        return baseHeight + Math.max(0, hillsideT * (4.2 + cliffNoise));
    }

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
            const leftRoadX = segment.curve - halfRoadWidth;
            const rightRoadX = segment.curve + halfRoadWidth;
            const leftTerrainStartX = leftRoadX - shoulderWidth;
            const rightTerrainStartX = rightRoadX + shoulderWidth;
            const v = i / game.road.segments.length;

            // Road vertices
            roadPositions.push(leftRoadX, segment.y, segment.z);
            roadPositions.push(rightRoadX, segment.y, segment.z);
            roadUVs.push(0, v);
            roadUVs.push(1, v);

            // Left terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const normalizedDistance = j / terrainSteps;
                const x = leftTerrainStartX - normalizedDistance * terrainWidth;
                leftTerrainPositions.push(x, getTerrainHeightAt(x, segment.z), segment.z);
                leftTerrainUVs.push(normalizedDistance, v);
            }

            // Right terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const normalizedDistance = j / terrainSteps;
                const x = rightTerrainStartX + normalizedDistance * terrainWidth;
                rightTerrainPositions.push(x, getTerrainHeightAt(x, segment.z), segment.z);
                rightTerrainUVs.push(normalizedDistance, v);
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
    const isMudRoad = environment.roadStyle === 'mud-road';
    const road = new THREE.Mesh(roadGeometry, new THREE.MeshPhongMaterial({
        map: roadTexture,
        bumpMap: isMudRoad ? roadTexture : null,
        bumpScale: isMudRoad ? 0.08 : 0,
        shininess: isMudRoad ? 28 : environment.roadStyle === 'wet-asphalt' ? 42 : environment.roadStyle === 'city-asphalt' ? 24 : 14,
        specular: isMudRoad ? 0x394f42 : environment.roadStyle === 'wet-asphalt' ? 0x446875 : 0x222222
    }));
    road.receiveShadow = true;

    const terrainTexture = createTerrainTexture(environment, game.road.segments.length);
    const terrainMaterial = new THREE.MeshPhongMaterial({
        color: environment.terrainTint || 0xffffff,
        map: terrainTexture,
        bumpMap: terrainTexture,
        bumpScale: environment.terrainStyle === 'snow-rock' ? 0.18 : environment.terrainStyle === 'rainforest' ? 0.34 : 0.28,
        side: THREE.DoubleSide,
        flatShading: false,
        shininess: environment.terrainStyle === 'snow-rock' ? 8 : environment.terrainStyle === 'rainforest' ? 9 : 3,
        specular: environment.terrainStyle === 'rainforest' ? 0x243824 : 0x111111
    });

    const shoulderTexture = createShoulderTexture(environment, game.road.segments.length);
    const shoulderMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: shoulderTexture,
        bumpMap: environment.shoulderStyle === 'jungle-mud' ? shoulderTexture : null,
        bumpScale: environment.shoulderStyle === 'jungle-mud' ? 0.16 : 0,
        side: THREE.DoubleSide,
        shininess: environment.shoulderStyle === 'jungle-mud' ? 18 : 4,
        specular: environment.shoulderStyle === 'jungle-mud' ? 0x344634 : 0x111111
    });

    const leftTerrain = new THREE.Mesh(leftTerrainGeometry, terrainMaterial);
    const rightTerrain = new THREE.Mesh(rightTerrainGeometry, terrainMaterial);
    const leftShoulder = new THREE.Mesh(createShoulderGeometry(-1), shoulderMaterial);
    const rightShoulder = new THREE.Mesh(createShoulderGeometry(1), shoulderMaterial);
    
    leftTerrain.receiveShadow = true;
    rightTerrain.receiveShadow = true;
    leftShoulder.receiveShadow = true;
    rightShoulder.receiveShadow = true;
    leftTerrain.userData.cameraOccluder = true;
    rightTerrain.userData.cameraOccluder = true;
    game.cameraOccluders = [leftTerrain, rightTerrain];

    scene.add(road, leftShoulder, rightShoulder, leftTerrain, rightTerrain);

    const stageDecorStats = {
        style: environment.id || 'default',
        guardrails: 0,
        snowBanks: 0,
        hazardMarkers: 0,
        cacti: 0,
        sandDrifts: 0,
        rockClusters: 0,
        fenceSegments: 0,
        stoneWalls: 0,
        trees: 0,
        buildings: 0,
        streetLights: 0,
        waterFeatures: 0,
        lakeSurfaces: 0,
        shorelineRocks: 0,
        conifers: 0,
        reeds: 0,
        driftwood: 0,
        totalInstancedProps: 0,
        docks: 0,
        jungleLanterns: 0,
        junglePlants: 0,
        rainStreaks: 0,
        mudPuddles: 0,
        palms: 0,
        villas: 0,
        seaWalls: 0,
        billboards: 0,
        boats: 0,
        cabins: 0,
        canopy: 0,
        clouds: 0,
        coastalDetails: 0,
        activePointLights: 0
    };
    game.stageDecor = stageDecorStats;

    function getLinearRoadDataAtZ(z) {
        const maxIndex = game.road.segments.length - 1;
        const rawIndex = Math.max(0, Math.min(maxIndex, Math.abs(z) / segmentLength));
        const index = Math.floor(rawIndex);
        const nextIndex = Math.min(maxIndex, index + 1);
        const t = rawIndex - index;
        const segment = game.road.segments[index];
        const nextSegment = game.road.segments[nextIndex];

        return {
            curve: THREE.MathUtils.lerp(segment.curve, nextSegment.curve, t),
            y: THREE.MathUtils.lerp(segment.y, nextSegment.y, t)
        };
    }

    function getTerrainHeightAt(x, z) {
        const roadData = getLinearRoadDataAtZ(z);
        const distanceFromRoadCenter = Math.abs(x - roadData.curve);
        const normalizedDistance = Math.min(Math.max((distanceFromRoadCenter - halfRoadWidth - shoulderWidth) / terrainWidth, 0), 1);
        const baseHeight = roadData.y;
        const heightOffset = generateMountainHeight(x, z) * getTerrainLiftFactor(normalizedDistance);

        const lakeAdjustedHeight = getLakeAdjustedTerrainHeight(x, z, baseHeight + heightOffset, roadData);
        return getCoastalAdjustedTerrainHeight(x, z, lakeAdjustedHeight, roadData);
    }

    function getPropGroundSamples(x, z, footprint = 0) {
        if (footprint <= 0) {
            return [getTerrainHeightAt(x, z)];
        }

        return [
            getTerrainHeightAt(x, z),
            getTerrainHeightAt(x + footprint, z),
            getTerrainHeightAt(x - footprint, z),
            getTerrainHeightAt(x, z + footprint),
            getTerrainHeightAt(x, z - footprint)
        ];
    }

    function getPropGroundY(x, z, footprint = 0) {
        return Math.min(...getPropGroundSamples(x, z, footprint));
    }

    function getPropHighGroundY(x, z, footprint = 0) {
        return Math.max(...getPropGroundSamples(x, z, footprint));
    }

    function getTerrainNormalAt(x, z, radius = 1.5) {
        const xTangent = new THREE.Vector3(
            radius * 2,
            getTerrainHeightAt(x + radius, z) - getTerrainHeightAt(x - radius, z),
            0
        );
        const zTangent = new THREE.Vector3(
            0,
            getTerrainHeightAt(x, z + radius) - getTerrainHeightAt(x, z - radius),
            radius * 2
        );
        return zTangent.cross(xTangent).normalize();
    }

    function getRoadsidePose(z, side, offsetFromRoadEdge) {
        const roadData = getRoadDataAtZ(z, game);
        const terrainRoadData = getLinearRoadDataAtZ(z);
        const x = terrainRoadData.curve + side * (halfRoadWidth + offsetFromRoadEdge);
        return {
            x,
            y: getTerrainHeightAt(x, z),
            z,
            yaw: -roadData.curvatureAngle,
            roadY: terrainRoadData.y,
            curve: terrainRoadData.curve
        };
    }

    function addDecorMesh(group, mesh, statsKey) {
        const isNewCircuit = ['city', 'lakes', 'jungle', 'coastal'].includes(environment.id);
        const majorShadowKeys = new Set(['buildings', 'cabins', 'villas']);
        const castsUsefulShadow = !isNewCircuit || majorShadowKeys.has(statsKey);
        mesh.castShadow = castsUsefulShadow;
        mesh.receiveShadow = castsUsefulShadow;
        group.add(mesh);
        if (statsKey) {
            stageDecorStats[statsKey] += 1;
        }
        return mesh;
    }

    function addDecorGroup(group, object, statsKey) {
        const isNewCircuit = ['city', 'lakes', 'jungle', 'coastal'].includes(environment.id);
        const majorShadowKeys = new Set(['cabins', 'villas']);
        const castsUsefulShadow = !isNewCircuit || majorShadowKeys.has(statsKey);
        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow = castsUsefulShadow;
                child.receiveShadow = castsUsefulShadow;
            }
        });
        group.add(object);
        if (statsKey) {
            stageDecorStats[statsKey] += 1;
        }
        return object;
    }

    function addDecorPointLight(group, color, intensity, distance, decay, position, limit = 8) {
        if (stageDecorStats.activePointLights >= limit) {
            return null;
        }

        const light = new THREE.PointLight(color, intensity, distance, decay);
        light.position.copy(position);
        light.castShadow = false;
        group.add(light);
        stageDecorStats.activePointLights += 1;
        return light;
    }

    function addStageDecor() {
        const decor = new THREE.Group();
        decor.name = `stage-decor-${environment.id || 'default'}`;

        if (environment.id === 'alpine') {
            addAlpineRoadsideDecor(decor);
        } else if (environment.id === 'desert') {
            addDesertRoadsideDecor(decor);
        } else if (environment.id === 'city') {
            addCityRoadsideDecor(decor);
        } else if (environment.id === 'lakes') {
            addLakeRoadsideDecor(decor);
        } else if (environment.id === 'jungle') {
            addJungleRoadsideDecor(decor);
        } else if (environment.id === 'coastal') {
            addCoastalRoadsideDecor(decor);
        } else {
            addScotlandRoadsideDecor(decor);
        }

        if (decor.children.length > 0) {
            scene.add(decor);
        }
    }

    function addStreetLight(decor, x, y, z, color = 0xfff1b8, height = 5.2) {
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x293138, shininess: 22 });
        const glowMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, height, 8), poleMaterial);
        pole.name = 'stage-light-pole';
        pole.position.set(x, y + height * 0.5, z);
        addDecorMesh(decor, pole);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.08), poleMaterial);
        arm.name = 'stage-light-arm';
        arm.position.set(x, y + height - 0.25, z);
        addDecorMesh(decor, arm);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), glowMaterial);
        bulb.name = 'stage-light-glow';
        bulb.position.set(x, y + height - 0.38, z - 0.55);
        addDecorMesh(decor, bulb, 'streetLights');

        if (environment.nightRace) {
            addDecorPointLight(decor, color, 0.95, 18, 2, bulb.position, 10);
        }
    }

    function addPalmTree(decor, x, y, z, scale = 1) {
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8f6840, shininess: 5 });
        const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x2f7445, shininess: 8 });
        const palm = new THREE.Group();
        palm.name = 'coastal-palm';

        const trunkHeight = (4.1 + Math.random() * 1.4) * scale;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, trunkHeight, 8), trunkMaterial);
        trunk.position.y = trunkHeight * 0.5;
        trunk.rotation.z = (Math.random() - 0.5) * 0.16;
        palm.add(trunk);

        for (let i = 0; i < 7; i++) {
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.28 * scale, 2.7 * scale, 7), leafMaterial);
            leaf.position.y = trunkHeight + 0.32 * scale;
            leaf.rotation.x = Math.PI / 2 + 0.18;
            leaf.rotation.y = (i / 7) * Math.PI * 2;
            leaf.position.x = Math.sin(leaf.rotation.y) * 0.34 * scale;
            leaf.position.z = Math.cos(leaf.rotation.y) * 0.34 * scale;
            palm.add(leaf);
        }

        palm.position.set(x, y, z);
        palm.rotation.y = Math.random() * Math.PI * 2;
        palm.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        decor.add(palm);
        stageDecorStats.palms += 1;
    }

    function createSignTexture(title, subtitle, background = '#151b22', accent = '#ffd84e') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 192;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, background);
        gradient.addColorStop(0.62, '#24313b');
        gradient.addColorStop(1, '#11171d');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = accent;
        context.fillRect(0, 0, 18, canvas.height);
        context.fillRect(0, canvas.height - 16, canvas.width, 16);
        context.fillStyle = 'rgba(255,255,255,0.12)';
        for (let x = 44; x < canvas.width; x += 48) {
            context.fillRect(x, 18, 20, 10);
        }
        context.fillStyle = '#f8fbff';
        context.font = '700 54px Arial Black, Impact, sans-serif';
        context.fillText(title, 52, 88);
        context.fillStyle = accent;
        context.font = '700 28px Arial, sans-serif';
        context.fillText(subtitle, 54, 132);
        const texture = new THREE.CanvasTexture(canvas);
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
        return texture;
    }

    function createCabin(scale = 1) {
        const cabin = new THREE.Group();
        cabin.name = 'lake-cabin';
        const wood = new THREE.MeshPhongMaterial({ color: 0x7b5b36, shininess: 7 });
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x33463d, shininess: 8 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.6 * scale, 2.3 * scale, 4.2 * scale), wood);
        body.position.y = 1.15 * scale;
        cabin.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8 * scale, 1.35 * scale, 4), roofMaterial);
        roof.position.y = 2.85 * scale;
        roof.rotation.y = Math.PI / 4;
        roof.scale.z = 1.22;
        cabin.add(roof);
        const porch = new THREE.Mesh(new THREE.BoxGeometry(4.9 * scale, 0.18 * scale, 1.2 * scale), wood);
        porch.position.set(0, 0.16 * scale, -2.65 * scale);
        cabin.add(porch);
        return cabin;
    }

    function createBoat(scale = 1, color = 0xd9f2f6) {
        const boat = new THREE.Group();
        boat.name = 'stage-boat';
        const hullMaterial = new THREE.MeshPhongMaterial({ color, shininess: 22 });
        const trimMaterial = new THREE.MeshPhongMaterial({ color: 0x26363d, shininess: 16 });
        const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4 * scale, 0.42 * scale, 1.1 * scale), hullMaterial);
        hull.position.y = 0.22 * scale;
        boat.add(hull);
        const bow = new THREE.Mesh(new THREE.ConeGeometry(0.58 * scale, 1.2 * scale, 4), hullMaterial);
        bow.position.set(0, 0.22 * scale, -1.18 * scale);
        bow.rotation.x = Math.PI / 2;
        boat.add(bow);
        const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.9 * scale, 0.32 * scale, 0.72 * scale), trimMaterial);
        cockpit.position.set(0, 0.62 * scale, 0.15 * scale);
        boat.add(cockpit);
        return boat;
    }

    function addCityRoadsideDecor(decor) {
        const buildingMaterials = [
            new THREE.MeshPhongMaterial({ color: 0x66717a, shininess: 10 }),
            new THREE.MeshPhongMaterial({ color: 0x8b8479, shininess: 8 }),
            new THREE.MeshPhongMaterial({ color: 0x4f5d67, shininess: 12 }),
            new THREE.MeshPhongMaterial({ color: 0x9a927f, shininess: 7 })
        ];
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.48 });
        const barrierMaterial = new THREE.MeshPhongMaterial({ color: 0xd7dde0, shininess: 12 });
        const startZ = game.startLine - 70;
        const endZ = game.finishLine + 130;

        for (let z = startZ; z > endZ; z -= 96) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 11 + Math.random() * 17);
                const width = 7 + Math.random() * 7;
                const depth = 6 + Math.random() * 9;
                const height = 7 + Math.random() * 18;
                const building = new THREE.Mesh(
                    new THREE.BoxGeometry(width, height, depth),
                    buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)]
                );
                building.name = 'city-building';
                building.position.set(pose.x, getPropGroundY(pose.x, z, 2.5) + height * 0.5, z);
                building.rotation.y = pose.yaw + (Math.random() - 0.5) * 0.08;
                addDecorMesh(decor, building, 'buildings');

                for (let row = 0; row < Math.min(5, Math.floor(height / 3)); row++) {
                    const windows = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.78, 0.42), windowMaterial);
                    windows.name = 'city-window-strip';
                    windows.position.set(pose.x - side * (width * 0.5 + 0.01), building.position.y - height * 0.32 + row * 2.1, z);
                    windows.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
                    decor.add(windows);
                }
            });
        }

        for (let z = startZ - 15; z > endZ; z -= 72) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 1.4);
                const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 8.5), barrierMaterial);
                barrier.name = 'city-concrete-barrier';
                barrier.position.set(pose.x, pose.roadY + 0.31, z);
                barrier.rotation.y = pose.yaw;
                addDecorMesh(decor, barrier);
            });
        }

        for (let z = startZ - 20; z > endZ; z -= 170) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 3.25);
                addStreetLight(decor, pose.x, pose.roadY, z, 0xffecb0, 5.6);
            });
        }

        const signTexture = createSignTexture('RALLY CITY', 'DOWNTOWN EXPRESS', '#14212b', '#ffd84e');
        const signMaterial = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
        const gantryMaterial = new THREE.MeshPhongMaterial({ color: 0x222a31, shininess: 30 });
        for (let z = startZ - 180; z > endZ; z -= 760) {
            const roadData = getLinearRoadDataAtZ(z);
            const roadPose = getRoadDataAtZ(z, game);
            const width = game.road.width + 8;
            const beam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.32, 0.34), gantryMaterial);
            beam.name = 'city-overhead-gantry';
            beam.position.set(roadData.curve, roadData.y + 6.3, z);
            beam.rotation.y = -roadPose.curvatureAngle;
            addDecorMesh(decor, beam);

            [-1, 1].forEach(side => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.34, 6.4, 0.34), gantryMaterial);
                post.name = 'city-gantry-post';
                post.position.set(roadData.curve + side * (halfRoadWidth + 3.8), roadData.y + 3.15, z);
                addDecorMesh(decor, post);
            });

            const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.6), signMaterial);
            sign.name = 'city-overhead-sign';
            sign.position.set(roadData.curve, roadData.y + 5.25, z + 0.2);
            sign.rotation.y = -roadPose.curvatureAngle;
            addDecorMesh(decor, sign, 'billboards');
        }

        for (let z = startZ - 140; z > endZ; z -= 420) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 5.8 + Math.random() * 3);
            const billboard = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.1), signMaterial);
            billboard.name = 'city-billboard';
            billboard.position.set(pose.x, pose.roadY + 4.4, z);
            billboard.rotation.y = side > 0 ? -Math.PI / 2 + pose.yaw : Math.PI / 2 + pose.yaw;
            addDecorMesh(decor, billboard, 'billboards');
        }

        const crosswalkMaterial = new THREE.MeshBasicMaterial({ color: 0xf4f8f5, transparent: true, opacity: 0.72 });
        for (let z = startZ - 260; z > endZ; z -= 920) {
            const roadData = getLinearRoadDataAtZ(z);
            const roadPose = getRoadDataAtZ(z, game);
            for (let i = -3; i <= 3; i++) {
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(game.road.width * 0.62, 0.025, 0.16), crosswalkMaterial);
                stripe.name = 'city-crosswalk-stripe';
                stripe.position.set(roadData.curve, roadData.y + 0.045, z + i * 0.45);
                stripe.rotation.y = -roadPose.curvatureAngle;
                decor.add(stripe);
            }
        }
    }

    function addLakeRoadsideDecor(decor) {
        const shoreTexture = createLakeShoreTexture(environment, game.road.segments.length);
        const waterMaterial = createLakeWaterMaterial();
        const shoreMaterial = new THREE.MeshPhongMaterial({
            color: 0xb9b39b,
            map: shoreTexture,
            bumpMap: shoreTexture,
            bumpScale: 0.18,
            shininess: 5,
            side: THREE.DoubleSide
        });
        const cliffMaterial = new THREE.MeshBasicMaterial({
            color: 0xb6b993,
            map: shoreTexture,
            side: THREE.DoubleSide
        });
        const railMaterial = new THREE.MeshPhongMaterial({ color: 0xa9b0ae, specular: 0xd5e0df, shininess: 36 });
        const railShadowMaterial = new THREE.MeshPhongMaterial({ color: 0x49575a, shininess: 18 });
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0x7c8684, shininess: 18 });
        const lakeRockTexture = createLakeRockTexture();
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0xc5c5b4,
            map: lakeRockTexture,
            bumpMap: lakeRockTexture,
            bumpScale: 0.22,
            shininess: 7,
            specular: 0x232b28,
            flatShading: true,
            vertexColors: true
        });
        const reedMaterial = new THREE.MeshPhongMaterial({ color: 0x5f7642, shininess: 4 });
        const driftwoodMaterial = new THREE.MeshPhongMaterial({ color: 0x6d5139, shininess: 5 });
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4b3528, shininess: 4 });
        const coniferMaterials = [0, 1, 2].map(variant => new THREE.MeshLambertMaterial({
            map: createConiferSpriteTexture(variant),
            alphaTest: 0.28,
            side: THREE.DoubleSide,
            depthWrite: true
        }));
        const forestFloorMaterial = new THREE.MeshBasicMaterial({
            color: 0x163d27,
            transparent: true,
            opacity: 0.48,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const startZ = game.startLine - 90;
        const endZ = game.finishLine + 150;
        const sampleStride = 3;
        const railSegmentLength = 28;
        const localForward = new THREE.Vector3(0, 0, 1);

        function addInstanced(name, geometry, material, placements) {
            if (placements.length === 0) {
                geometry.dispose();
                return null;
            }

            const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
            const matrix = new THREE.Matrix4();
            mesh.name = name;
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            placements.forEach((placement, index) => {
                const rotation = new THREE.Euler(placement.rotation?.x || 0, placement.rotation?.y || 0, placement.rotation?.z || 0);
                const quaternion = new THREE.Quaternion().setFromEuler(rotation);
                const scale = placement.scale || new THREE.Vector3(1, 1, 1);
                matrix.compose(placement.position, quaternion, scale);
                mesh.setMatrixAt(index, matrix);
                if (placement.color) {
                    mesh.setColorAt(index, placement.color);
                }
            });
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
            decor.add(mesh);
            stageDecorStats.totalInstancedProps += placements.length;
            return mesh;
        }

        function buildRibbonMesh(rows, columns, material, name, statsKey, uvStep = 0.06) {
            if (rows.length < 2) {
                return null;
            }

            const positions = [];
            const uvs = [];
            const indices = [];

            rows.forEach((row, rowIndex) => {
                row.points.forEach((point, columnIndex) => {
                    positions.push(point.x, point.y, point.z);
                    uvs.push(columnIndex / Math.max(1, columns - 1), rowIndex * uvStep);
                });

                if (rowIndex < rows.length - 1) {
                    const rowStart = rowIndex * columns;
                    const nextStart = (rowIndex + 1) * columns;
                    for (let columnIndex = 0; columnIndex < columns - 1; columnIndex++) {
                        const a = rowStart + columnIndex;
                        const b = nextStart + columnIndex;
                        const c = rowStart + columnIndex + 1;
                        const d = nextStart + columnIndex + 1;
                        indices.push(a, b, c, c, b, d);
                    }
                }
            });

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            mesh.receiveShadow = true;
            decor.add(mesh);
            if (statsKey) {
                stageDecorStats[statsKey] += 1;
            }
            return mesh;
        }

        function addLakeSurface(side) {
            let rows = [];
            let chunkIndex = 0;
            const waterColumnWeights = [0, 0.02, 0.05, 0.09, 0.15, 0.24, 0.36, 0.5, 0.64, 0.78, 0.9, 0.97, 1];
            const waterColumns = waterColumnWeights.length;

            function flush() {
                if (rows.length >= 2) {
                    const capLength = 76;
                    const cappedRows = [
                        createWaterCapRow(rows[0], capLength, 0.06, 17),
                        createWaterCapRow(rows[0], capLength * 0.72, 0.2, 29),
                        createWaterCapRow(rows[0], capLength * 0.42, 0.46, 41),
                        createWaterCapRow(rows[0], capLength * 0.18, 0.72, 53),
                        ...rows,
                        createWaterCapRow(rows[rows.length - 1], -capLength * 0.18, 0.72, 67),
                        createWaterCapRow(rows[rows.length - 1], -capLength * 0.42, 0.46, 79),
                        createWaterCapRow(rows[rows.length - 1], -capLength * 0.72, 0.2, 91),
                        createWaterCapRow(rows[rows.length - 1], -capLength, 0.06, 103)
                    ];
                    const mesh = buildRibbonMesh(cappedRows, waterColumns, waterMaterial, `lake-continuous-water-${side}-${chunkIndex}`, 'lakeSurfaces', 0.018);
                    if (mesh) {
                        mesh.onBeforeRender = () => {
                            waterMaterial.uniforms.time.value = performance.now() * 0.001;
                        };
                        stageDecorStats.waterFeatures += 1;
                    }
                    chunkIndex += 1;
                }
                rows = [];
            }

            function createWaterCapRow(row, zOffset, spread, seed) {
                const innerDistance = row.points[0].distance;
                const outerDistance = row.points[row.points.length - 1].distance;
                const protectedInnerDistance = innerDistance + lakeBiome.shoreWidth * 2.4;
                return {
                    points: row.points.map((point, columnIndex) => {
                        const columnT = columnIndex / Math.max(1, row.points.length - 1);
                        const arcT = Math.sin(columnT * Math.PI * 0.5);
                        const edgeJitter = lakeNoise.noise2D((point.z + seed) * 0.018, side * 73.1 + columnIndex * 9.7) * 3.2 * columnT;
                        const capZ = point.z + zOffset * arcT + edgeJitter;
                        const capRoadData = getLinearRoadDataAtZ(capZ);
                        const capSpread = Math.pow(columnT, 1.38) * spread;
                        const distance = THREE.MathUtils.lerp(
                            protectedInnerDistance,
                            outerDistance,
                            capSpread
                        );
                        return {
                            x: capRoadData.curve + side * (halfRoadWidth + distance),
                            distance,
                            y: point.y,
                            z: capZ
                        };
                    })
                };
            }

            for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getLakeShoreProfile(side, segment.z, roadData);
                if (!profile.active) {
                    flush();
                    continue;
                }

                const innerDistance = profile.shoreDistance + lakeBiome.shoreWidth * 0.38;
                const horizonNoise = lakeNoise.noise2D(segment.z * 0.004, side * 51.7) * 28
                    + lakeNoise.noise2D(segment.z * 0.012, side * 12.9) * 8;
                const outerDistance = terrainWidth + shoulderWidth + lakeBiome.horizonWaterExtension + horizonNoise;
                const y = profile.waterLevel + 0.04;
                rows.push({
                    points: waterColumnWeights.map((weight, columnIndex) => {
                        const shoreWobble = lakeNoise.noise2D(segment.z * 0.043, side * 33.4) * 1.3 * (1 - weight);
                        const waterlineDrift = lakeNoise.noise2D(segment.z * 0.018, side * 19.2 + columnIndex * 2.1) * 3.6 * weight;
                        const t = weight * weight * (3 - 2 * weight);
                        const distance = THREE.MathUtils.lerp(innerDistance + shoreWobble, outerDistance, t);
                        return {
                            x: roadData.curve + side * (halfRoadWidth + distance),
                            distance,
                            y,
                            z: segment.z + waterlineDrift
                        };
                    })
                });
            }
            flush();
        }

        function addDistantRidge(side) {
            const rows = [];
            const material = new THREE.MeshBasicMaterial({
                color: side < 0 ? 0x263f3b : 0x405348,
                side: THREE.DoubleSide
            });

            for (let i = 0; i < game.road.segments.length; i += sampleStride * 4) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getLakeShoreProfile(side, segment.z, roadData);
                const outerDistance = terrainWidth + shoulderWidth + lakeBiome.horizonWaterExtension * 0.72;
                const nearX = roadData.curve + side * (halfRoadWidth + outerDistance);
                const farX = roadData.curve + side * (halfRoadWidth + outerDistance + 92);
                const ridgeNoise = lakeNoise.noise2D(segment.z * 0.0026, side * 41.7);
                const foothillY = (profile.active ? profile.waterLevel : roadData.y) + 0.25;
                const peakY = roadData.y + 5 + (ridgeNoise + 1) * 3.8;

                rows.push({
                    points: [
                        { x: nearX, y: foothillY, z: segment.z },
                        { x: farX, y: peakY, z: segment.z }
                    ]
                });
            }

            const ridge = buildRibbonMesh(rows, 2, material, `lake-distant-ridge-${side}`, null, 0.035);
            if (ridge) {
                ridge.receiveShadow = false;
            }
        }

        function addShoreRibbon(side) {
            let rows = [];
            let chunkIndex = 0;

            function flush() {
                buildRibbonMesh(rows, 3, shoreMaterial, `lake-rocky-shoreline-${side}-${chunkIndex}`, null, 0.045);
                chunkIndex += rows.length >= 2 ? 1 : 0;
                rows = [];
            }

            for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getLakeShoreProfile(side, segment.z, roadData);
                if (!profile.active) {
                    flush();
                    continue;
                }

                const distances = [
                    Math.max(shoulderWidth + 1.1, profile.shoreDistance - lakeBiome.shoreWidth * 1.2),
                    profile.shoreDistance - lakeBiome.shoreWidth * 0.18,
                    profile.shoreDistance + lakeBiome.shoreWidth * 0.65
                ];
                rows.push({
                    points: distances.map(distance => {
                        const x = roadData.curve + side * (halfRoadWidth + distance);
                        const y = Math.max(getTerrainHeightAt(x, segment.z), profile.waterLevel + 0.03) + 0.035;
                        return { x, y, z: segment.z };
                    })
                });
            }
            flush();
        }

        function addLakeBankCliffs(side) {
            let rows = [];
            let chunkIndex = 0;

            function flush() {
                if (rows.length >= 2) {
                    const mesh = buildRibbonMesh(rows, 4, cliffMaterial, `lake-bank-cliff-${side}-${chunkIndex}`, null, 0.04);
                    if (mesh) {
                        mesh.receiveShadow = true;
                    }
                    chunkIndex += 1;
                }
                rows = [];
            }

            for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getLakeShoreProfile(side, segment.z, roadData);
                if (!profile.active) {
                    flush();
                    continue;
                }

                const topDistance = shoulderWidth + 0.18;
                const upperDistance = Math.max(
                    topDistance + 0.7,
                    Math.max(shoulderWidth + 0.85, profile.shoreDistance - lakeBiome.shoreWidth * 1.34)
                );
                const midDistance = Math.max(
                    upperDistance + 1.0,
                    profile.shoreDistance - lakeBiome.shoreWidth * 0.62
                );
                const toeDistance = Math.max(
                    midDistance + 1.2,
                    profile.shoreDistance + lakeBiome.shoreWidth * 0.42
                );
                const topX = roadData.curve + side * (halfRoadWidth + topDistance);
                const upperX = roadData.curve + side * (halfRoadWidth + upperDistance);
                const midX = roadData.curve + side * (halfRoadWidth + midDistance);
                const toeX = roadData.curve + side * (halfRoadWidth + toeDistance);
                const topY = roadData.y + 0.025;
                const upperY = Math.max(getTerrainHeightAt(upperX, segment.z), profile.waterLevel + 0.58) + 0.02;
                const toeY = profile.waterLevel - 0.22;
                const midNoise = lakeNoise.noise2D(segment.z * 0.026, side * 61.3) * 0.22;
                const midY = Math.max(THREE.MathUtils.lerp(upperY, toeY, 0.5) + midNoise, toeY + 0.28);

                if (topY - toeY < 0.55) {
                    flush();
                    continue;
                }

                rows.push({
                    points: [
                        { x: topX, y: topY, z: segment.z },
                        { x: upperX, y: upperY, z: segment.z },
                        { x: midX, y: midY, z: segment.z },
                        { x: toeX, y: toeY, z: segment.z }
                    ]
                });
            }
            flush();
        }

        function alignGuardrail(mesh, z, side, offsetFromRoadEdge, heightOffset) {
            const front = getRoadsidePose(z - railSegmentLength * 0.5, side, offsetFromRoadEdge);
            const rear = getRoadsidePose(z + railSegmentLength * 0.5, side, offsetFromRoadEdge);
            const start = new THREE.Vector3(rear.x, rear.roadY + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.roadY + heightOffset, front.z);
            const direction = end.clone().sub(start).normalize();

            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(localForward, direction);
        }

        function addLakeGuardrails() {
            const topRailGeometry = new THREE.BoxGeometry(0.24, 0.24, railSegmentLength);
            const lowerRailGeometry = new THREE.BoxGeometry(0.18, 0.18, railSegmentLength);
            const postGeometry = new THREE.BoxGeometry(0.22, 1.22, 0.22);
            let railIndex = 0;

            for (let z = startZ; z > endZ; z -= 34) {
                [-1, 1].forEach(side => {
                    const profile = getLakeShoreProfile(side, z);
                    if (!profile.active || profile.shoreDistance > lakeBiome.guardrailDistance) {
                        return;
                    }

                    const pose = getRoadsidePose(z, side, 0.9);
                    const topRail = new THREE.Mesh(topRailGeometry, railMaterial);
                    topRail.name = 'lake-guardrail-top';
                    alignGuardrail(topRail, z, side, 0.9, 0.92);
                    addDecorMesh(decor, topRail, 'guardrails');

                    const lowerRail = new THREE.Mesh(lowerRailGeometry, railShadowMaterial);
                    lowerRail.name = 'lake-guardrail-lower';
                    alignGuardrail(lowerRail, z, side, 0.9, 0.52);
                    addDecorMesh(decor, lowerRail, 'guardrails');

                    if (railIndex % 2 === 0) {
                        const post = new THREE.Mesh(postGeometry, postMaterial);
                        post.name = 'lake-guardrail-post';
                        post.position.set(pose.x, pose.roadY + 0.62, z);
                        post.rotation.y = pose.yaw;
                        addDecorMesh(decor, post);
                    }
                });
                railIndex += 1;
            }
        }

        function collectConifers() {
            const trees = [];

            function addForestFloorBelts() {
                [-1, 1].forEach(side => {
                    let rows = [];
                    let chunkIndex = 0;

                    function flush() {
                        if (rows.length >= 2) {
                            buildRibbonMesh(rows, 2, forestFloorMaterial, `lake-forest-floor-belt-${side}-${chunkIndex}`, null, 0.03);
                            chunkIndex += 1;
                        }
                        rows = [];
                    }

                    for (let i = 0; i < game.road.segments.length; i += sampleStride * 4) {
                        const segment = game.road.segments[i];
                        if (segment.z > startZ) {
                            continue;
                        }
                        if (segment.z < endZ) {
                            break;
                        }

                        const roadData = getLinearRoadDataAtZ(segment.z);
                        const profile = getLakeShoreProfile(side, segment.z, roadData);
                        if (profile.active && profile.shoreDistance < 20) {
                            flush();
                            continue;
                        }

                        const nearDistance = profile.active
                            ? Math.max(shoulderWidth + 5, profile.shoreDistance - 13)
                            : 18;
                        const farDistance = profile.active
                            ? Math.max(nearDistance + 8, profile.shoreDistance - 3.5)
                            : Math.min(terrainWidth - 5, 92);

                        rows.push({
                            points: [nearDistance, farDistance].map(distance => {
                                const x = roadData.curve + side * (halfRoadWidth + distance);
                                return { x, y: getTerrainHeightAt(x, segment.z) + 0.03, z: segment.z };
                            })
                        });
                    }
                    flush();
                });
            }

            function tryAddTree(roadData, side, offsetFromRoadEdge, z, scale, yaw, variant) {
                const x = roadData.curve + side * (halfRoadWidth + offsetFromRoadEdge);
                if (isPointInLakeWater(x, z)) {
                    return;
                }

                const normal = getTerrainNormalAt(x, z, 2.4);
                if (normal.y < 0.7) {
                    return;
                }

                trees.push({
                    x,
                    y: getPropGroundY(x, z, 1.8),
                    z,
                    scale,
                    yaw,
                    variant
                });
            }

            function addCluster(side, z, roadData, profile) {
                if (profile.active && profile.shoreDistance < 14) {
                    return;
                }

                const shorelineLimited = profile.active;
                const nearDistance = shorelineLimited ? 8.5 : 11;
                const farDistance = shorelineLimited
                    ? Math.max(nearDistance + 4, profile.shoreDistance - 5.2)
                    : Math.min(terrainWidth - 8, 104);
                const forestWidth = farDistance - nearDistance;
                if (forestWidth < 5) {
                    return;
                }

                const baseCount = shorelineLimited
                    ? 5 + Math.floor(Math.random() * 7)
                    : 22 + Math.floor(Math.random() * 18);
                const centerOffset = nearDistance + forestWidth * (0.38 + Math.random() * 0.46);
                const zSpread = shorelineLimited ? 58 + profile.shoreDistance : 146;
                const xSpread = Math.max(5, forestWidth * (shorelineLimited ? 0.62 : 0.62));

                for (let i = 0; i < baseCount; i++) {
                    const radial = Math.pow(Math.random(), 0.58);
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    const offset = THREE.MathUtils.clamp(
                        centerOffset + direction * radial * xSpread * 0.5 + (Math.random() - 0.5) * 3.2,
                        nearDistance,
                        farDistance
                    );
                    const treeZ = z + (Math.random() - 0.5) * zSpread;
                    const treeRoadData = getLinearRoadDataAtZ(treeZ);
                    const scale = 0.78 + Math.random() * 0.72;
                    tryAddTree(
                        treeRoadData,
                        side,
                        offset,
                        treeZ,
                        scale,
                        Math.random() * Math.PI * 2,
                        Math.floor(Math.random() * coniferMaterials.length)
                    );
                }
            }

            addForestFloorBelts();

            for (let z = startZ - 60; z > endZ; z -= 82) {
                const roadData = getLinearRoadDataAtZ(z);
                [-1, 1].forEach(side => {
                    const profile = getLakeShoreProfile(side, z, roadData);
                    const clusterChance = profile.active ? 0.58 + profile.intensity * 0.22 : 1;
                    if (Math.random() < clusterChance) {
                        addCluster(side, z, roadData, profile);
                    }
                });
            }

            for (let z = startZ - 35; z > endZ; z -= 38) {
                const roadData = getLinearRoadDataAtZ(z);
                [-1, 1].forEach(side => {
                    const profile = getLakeShoreProfile(side, z, roadData);
                    if (profile.active && profile.shoreDistance < 22) {
                        return;
                    }

                    const farDistance = profile.active
                        ? profile.shoreDistance - (7 + Math.random() * 4)
                        : 28 + Math.random() * 72;
                    const scale = profile.active ? 0.72 + Math.random() * 0.34 : 0.68 + Math.random() * 0.54;
                    tryAddTree(
                        roadData,
                        side,
                        farDistance,
                        z + (Math.random() - 0.5) * 22,
                        scale,
                        Math.random() * Math.PI * 2,
                        Math.floor(Math.random() * coniferMaterials.length)
                    );
                });
            }

            const trunkPlacements = [];
            const foliagePlacements = coniferMaterials.map(() => []);

            trees.forEach(tree => {
                const trunkHeight = 2.8 * tree.scale;
                const foliageHeight = 6.6 * tree.scale;
                const foliageWidth = 3.65 * tree.scale;
                trunkPlacements.push({
                    position: new THREE.Vector3(tree.x, tree.y + trunkHeight * 0.5, tree.z),
                    rotation: { y: tree.yaw },
                    scale: new THREE.Vector3(0.22 * tree.scale, trunkHeight, 0.22 * tree.scale)
                });

                for (let cardIndex = 0; cardIndex < 3; cardIndex++) {
                    foliagePlacements[tree.variant].push({
                        position: new THREE.Vector3(tree.x, tree.y + foliageHeight * 0.52, tree.z),
                        rotation: { y: tree.yaw + cardIndex * Math.PI / 3 + (Math.random() - 0.5) * 0.08 },
                        scale: new THREE.Vector3(foliageWidth, foliageHeight, 1)
                    });
                }
            });

            addInstanced('lake-conifer-trunks', new THREE.CylinderGeometry(1, 1, 1, 7), trunkMaterial, trunkPlacements);
            coniferMaterials.forEach((material, index) => {
                addInstanced(`lake-conifer-foliage-${index}`, new THREE.PlaneGeometry(1, 1), material, foliagePlacements[index]);
            });
            stageDecorStats.conifers += trees.length;
            stageDecorStats.trees += trees.length;
        }

        function collectShoreProps() {
            const rocks = [];
            const reeds = [];
            const driftwood = [];

            function getShorePlacement(side, z, minDistance, distanceForProfile) {
                const propRoadData = getLinearRoadDataAtZ(z);
                const propProfile = getLakeShoreProfile(side, z, propRoadData);
                if (!propProfile.active) {
                    return null;
                }

                const requestedDistance = distanceForProfile(propProfile);
                const distance = Math.max(minDistance, requestedDistance);
                const x = propRoadData.curve + side * (halfRoadWidth + distance);
                return { x, distance, roadData: propRoadData, profile: propProfile };
            }

            for (let z = startZ - 10; z > endZ; z -= 34) {
                const roadData = getLinearRoadDataAtZ(z);
                [-1, 1].forEach(side => {
                    const profile = getLakeShoreProfile(side, z, roadData);
                    if (!profile.active) {
                        return;
                    }

                    const rockCount = 1 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < rockCount; i++) {
                        const rockZ = z + (Math.random() - 0.5) * 22;
                        const placement = getShorePlacement(
                            side,
                            rockZ,
                            shoulderWidth + 1.65,
                            propProfile => propProfile.shoreDistance - lakeBiome.shoreWidth * 0.45 + Math.random() * lakeBiome.shoreWidth * 1.35
                        );
                        if (!placement) {
                            continue;
                        }
                        const y = Math.max(getPropGroundY(placement.x, rockZ, 1.2), placement.profile.waterLevel - 0.05);
                        const scale = 0.45 + Math.random() * 0.95;
                        const tint = new THREE.Color().setHSL(
                            0.12 + Math.random() * 0.04,
                            0.08 + Math.random() * 0.05,
                            0.42 + Math.random() * 0.18
                        );
                        rocks.push({
                            position: new THREE.Vector3(placement.x, y + scale * 0.42, rockZ),
                            rotation: { x: (Math.random() - 0.5) * 0.2, y: Math.random() * Math.PI, z: (Math.random() - 0.5) * 0.2 },
                            scale: new THREE.Vector3(scale * (1.1 + Math.random() * 0.8), scale * (0.35 + Math.random() * 0.25), scale * (0.8 + Math.random() * 0.8)),
                            color: tint
                        });
                    }

                    const reedCount = 2 + Math.floor(Math.random() * 4);
                    for (let i = 0; i < reedCount; i++) {
                        const reedZ = z + (Math.random() - 0.5) * 18;
                        const placement = getShorePlacement(
                            side,
                            reedZ,
                            shoulderWidth + 1.85,
                            propProfile => propProfile.shoreDistance + lakeBiome.shoreWidth * (0.18 + Math.random() * 0.8)
                        );
                        if (!placement) {
                            continue;
                        }
                        const height = 0.8 + Math.random() * 1.15;
                        reeds.push({
                            position: new THREE.Vector3(placement.x, placement.profile.waterLevel + height * 0.48, reedZ),
                            rotation: { x: (Math.random() - 0.5) * 0.12, y: Math.random() * Math.PI, z: (Math.random() - 0.5) * 0.22 },
                            scale: new THREE.Vector3(1, height, 1)
                        });
                    }

                    if (Math.random() < 0.18) {
                        const woodZ = z + (Math.random() - 0.5) * 20;
                        const placement = getShorePlacement(
                            side,
                            woodZ,
                            shoulderWidth + 1.8,
                            propProfile => propProfile.shoreDistance - lakeBiome.shoreWidth * 0.1 + Math.random() * lakeBiome.shoreWidth
                        );
                        if (!placement) {
                            return;
                        }
                        driftwood.push({
                            position: new THREE.Vector3(
                                placement.x,
                                Math.max(getPropGroundY(placement.x, woodZ, 1.4), placement.profile.waterLevel + 0.02) + 0.08,
                                woodZ
                            ),
                            rotation: { x: (Math.random() - 0.5) * 0.08, y: Math.random() * Math.PI, z: (Math.random() - 0.5) * 0.08 },
                            scale: new THREE.Vector3(2.6 + Math.random() * 2.4, 0.14, 0.18 + Math.random() * 0.16)
                        });
                    }
                });
            }

            addInstanced('lake-shore-rocks', new THREE.DodecahedronGeometry(1, 0), rockMaterial, rocks);
            addInstanced('lake-reeds', new THREE.CylinderGeometry(0.04, 0.06, 1, 5), reedMaterial, reeds);
            addInstanced('lake-driftwood', new THREE.BoxGeometry(1, 1, 1), driftwoodMaterial, driftwood);
            stageDecorStats.shorelineRocks += rocks.length;
            stageDecorStats.rockClusters += Math.ceil(rocks.length / 5);
            stageDecorStats.reeds += reeds.length;
            stageDecorStats.driftwood += driftwood.length;
        }

        function createLakeSailboat(scale = 1) {
            const sailboat = new THREE.Group();
            sailboat.name = 'lake-sailboat';
            const hullMaterial = new THREE.MeshPhongMaterial({ color: 0xf1f4eb, shininess: 28 });
            const mastMaterial = new THREE.MeshPhongMaterial({ color: 0x514437, shininess: 12 });
            const sailMaterial = new THREE.MeshBasicMaterial({ color: 0xf6f1dd, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
            const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6 * scale, 0.34 * scale, 0.96 * scale), hullMaterial);
            hull.position.y = 0.22 * scale;
            sailboat.add(hull);
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 3.3 * scale, 8), mastMaterial);
            mast.position.y = 1.86 * scale;
            sailboat.add(mast);
            const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.75 * scale, 2.55 * scale), sailMaterial);
            sail.position.set(0.68 * scale, 2.0 * scale, 0);
            sail.rotation.z = -0.18;
            sailboat.add(sail);
            return sailboat;
        }

        function addBoatsAndDocks() {
            for (let z = startZ - 240; z > endZ; z -= 720) {
                const sideCandidates = Math.random() > 0.35 ? [-1, 1] : [1, -1];
                const side = sideCandidates.find(candidate => getLakeShoreProfile(candidate, z).active);
                if (!side) {
                    continue;
                }

                const roadData = getLinearRoadDataAtZ(z);
                const profile = getLakeShoreProfile(side, z, roadData);
                const boat = createLakeSailboat(0.85 + Math.random() * 0.28);
                boat.position.set(
                    roadData.curve + side * (halfRoadWidth + profile.shoreDistance + 34 + Math.random() * 32),
                    profile.waterLevel + 0.1,
                    z + (Math.random() - 0.5) * 28
                );
                boat.rotation.y = -getRoadDataAtZ(z, game).curvatureAngle + side * (0.75 + Math.random() * 0.3);
                addDecorGroup(decor, boat, 'boats');
            }

            for (let z = startZ - 620; z > endZ; z -= 1700) {
                const side = getLakeShoreProfile(-1, z).active ? -1 : 1;
                const roadData = getLinearRoadDataAtZ(z);
                const profile = getLakeShoreProfile(side, z, roadData);
                if (!profile.active || profile.shoreDistance < 13) {
                    continue;
                }

                const dock = new THREE.Mesh(new THREE.BoxGeometry(12, 0.18, 2.1), driftwoodMaterial);
                dock.name = 'lake-low-wood-dock';
                dock.position.set(roadData.curve + side * (halfRoadWidth + profile.shoreDistance + 3.4), profile.waterLevel + 0.16, z);
                dock.rotation.y = -getRoadDataAtZ(z, game).curvatureAngle;
                addDecorMesh(decor, dock, 'docks');
            }
        }

        function addLakeClouds() {
            stageDecorStats.clouds += 1;
        }

        [-1, 1].forEach(side => {
            addLakeSurface(side);
            addShoreRibbon(side);
            addLakeBankCliffs(side);
            addDistantRidge(side);
        });
        addLakeGuardrails();
        collectShoreProps();
        collectConifers();
        addBoatsAndDocks();
        addLakeClouds();
    }

    function addJungleRoadsideDecor(decor) {
        const jungleAssetCache = environment.assetCache || {};
        const palmAssets = [
            jungleAssetCache.palmDetailedTall,
            jungleAssetCache.palmTall,
            jungleAssetCache.palmBend,
            jungleAssetCache.palmDetailedShort
        ].filter(Boolean);
        const plantAssets = [
            jungleAssetCache.bushLargeTriangle,
            jungleAssetCache.bushDetailed,
            jungleAssetCache.plantFlatTall,
            jungleAssetCache.grassLeafsLarge,
            jungleAssetCache.grassLeafs
        ].filter(Boolean);
        const detailAssets = [
            jungleAssetCache.logLarge,
            jungleAssetCache.stumpOld,
            jungleAssetCache.rockLarge,
            jungleAssetCache.rockSmall
        ].filter(Boolean);
        const rainforestNoise = new SimplexNoise();
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2f20, shininess: 5 });
        const canopyMaterial = new THREE.MeshPhongMaterial({ color: 0x1d5d33, shininess: 7, specular: 0x102414 });
        const canopyDarkMaterial = new THREE.MeshPhongMaterial({ color: 0x103d27, shininess: 5, specular: 0x08160d });
        const leafCardMaterial = new THREE.MeshPhongMaterial({
            color: 0x2f8a49,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            shininess: 12,
            specular: 0x18391f
        });
        const fernMaterial = new THREE.MeshPhongMaterial({
            color: 0x4b9d4a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.86,
            shininess: 9,
            specular: 0x1f3c22
        });
        const palmLeafMaterial = new THREE.MeshPhongMaterial({
            color: 0x237d43,
            side: THREE.DoubleSide,
            shininess: 14,
            specular: 0x1d3c23
        });
        const tropicalLeafMaterial = new THREE.MeshPhongMaterial({
            color: 0x2f9651,
            side: THREE.DoubleSide,
            shininess: 18,
            specular: 0x2e5f34
        });
        const tropicalLeafDarkMaterial = new THREE.MeshPhongMaterial({
            color: 0x14522f,
            side: THREE.DoubleSide,
            shininess: 12,
            specular: 0x17351d
        });
        const puddleMaterial = new THREE.MeshPhongMaterial({
            color: 0x415346,
            transparent: true,
            opacity: 0.48,
            depthWrite: false,
            shininess: 72,
            specular: 0xa5c8b6
        });
        const startZ = game.startLine - 70;
        const endZ = game.finishLine + 150;

        function cloneJungleMaterial(material) {
            if (!material) {
                return material;
            }

            const cloned = material.clone();
            cloned.userData.keepTextureMaps = true;
            if ('roughness' in cloned) {
                cloned.roughness = Math.max(cloned.roughness || 0.58, 0.78);
            }
            if ('metalness' in cloned) {
                cloned.metalness = Math.min(cloned.metalness || 0, 0.06);
            }
            if (cloned.color) {
                cloned.color.offsetHSL(0.02, 0.03, -0.02);
            }
            cloned.needsUpdate = true;
            return cloned;
        }

        function createJungleAssetClone(asset, targetHeight = 6, maxFootprint = 7) {
            if (!asset?.scene) {
                return null;
            }

            const wrapper = new THREE.Group();
            wrapper.name = `jungle-asset-${asset.assetName || 'model'}`;
            const clone = asset.scene.clone(true);
            clone.traverse(child => {
                if (!child.isMesh) {
                    return;
                }

                child.castShadow = false;
                child.receiveShadow = true;
                child.userData.keepGeometry = true;
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(cloneJungleMaterial);
                } else {
                    child.material = cloneJungleMaterial(child.material);
                }
            });

            const sourceBox = new THREE.Box3().setFromObject(clone);
            const size = sourceBox.getSize(new THREE.Vector3());
            const heightScale = targetHeight / Math.max(0.001, size.y);
            const footprintScale = maxFootprint / Math.max(0.001, Math.max(size.x, size.z));
            clone.scale.multiplyScalar(Math.min(heightScale, footprintScale));

            const fittedBox = new THREE.Box3().setFromObject(clone);
            const center = fittedBox.getCenter(new THREE.Vector3());
            clone.position.x -= center.x;
            clone.position.z -= center.z;
            clone.position.y -= fittedBox.min.y;
            wrapper.add(clone);
            return wrapper;
        }

        function pickAsset(assets) {
            if (!assets.length) {
                return null;
            }
            return assets[Math.floor(Math.random() * assets.length)];
        }

        function addInstanced(name, geometry, material, placements, statsKey = 'junglePlants') {
            if (!placements.length) {
                geometry.dispose();
                return null;
            }

            const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
            mesh.name = name;
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            placements.forEach((placement, index) => {
                position.set(placement.x, placement.y, placement.z);
                quaternion.setFromEuler(new THREE.Euler(
                    placement.rotationX || 0,
                    placement.rotationY || 0,
                    placement.rotationZ || 0
                ));
                scale.set(placement.scaleX || placement.scale || 1, placement.scaleY || placement.scale || 1, placement.scaleZ || placement.scale || 1);
                matrix.compose(position, quaternion, scale);
                mesh.setMatrixAt(index, matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
            decor.add(mesh);
            stageDecorStats.totalInstancedProps += placements.length;
            if (statsKey) {
                stageDecorStats[statsKey] += placements.length;
            }
            return mesh;
        }

        function createLeafBladeGeometry(width = 1, height = 1) {
            const shape = new THREE.Shape();
            shape.moveTo(0, -0.5 * height);
            shape.bezierCurveTo(width * 0.55, -height * 0.28, width * 0.5, height * 0.26, 0, height * 0.5);
            shape.bezierCurveTo(-width * 0.5, height * 0.26, -width * 0.55, -height * 0.28, 0, -height * 0.5);
            const geometry = new THREE.ShapeGeometry(shape, 8);
            geometry.computeVertexNormals();
            return geometry;
        }

        function getJunglePoint(z, side, offset) {
            const roadData = getLinearRoadDataAtZ(z);
            const x = roadData.curve + side * (halfRoadWidth + shoulderWidth + offset);
            return {
                x,
                y: getPropGroundY(x, z, 1.6),
                z,
                roadY: roadData.y,
                yaw: -getRoadDataAtZ(z, game).curvatureAngle
            };
        }

        function addUnderstoryRibbons() {
            const texture = createCanvasTexture(512, 512, 2, Math.max(28, game.road.segments.length / 6), (context, width, height) => {
                context.fillStyle = '#123d25';
                context.fillRect(0, 0, width, height);
                drawSpeckle(context, width, height, ['#1f6133', '#0b2619', '#337a3c', '#496a31', '#6a5630'], 7600, 1, 7, 0.75);
                drawGrassStrokes(context, width, height, ['#4d994c', '#1e6a37', '#79a85a', '#102f1f'], 2600);
                context.globalAlpha = 0.22;
                context.fillStyle = '#0b2015';
                for (let i = 0; i < 140; i++) {
                    context.beginPath();
                    context.ellipse(
                        Math.random() * width,
                        Math.random() * height,
                        4 + Math.random() * 18,
                        1.2 + Math.random() * 6,
                        Math.random() * Math.PI,
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                }
                context.globalAlpha = 1;
            });
            const material = new THREE.MeshPhongMaterial({
                color: 0x6c8f5e,
                map: texture,
                bumpMap: texture,
                bumpScale: 0.1,
                side: THREE.DoubleSide,
                shininess: 7,
                specular: 0x1c2b1c
            });

            [-1, 1].forEach(side => {
                const positions = [];
                const uvs = [];
                const indices = [];
                const innerDistance = shoulderWidth + 0.2;
                const outerDistance = shoulderWidth + 16;
                game.road.segments.forEach((segment, index) => {
                    const v = index / Math.max(1, game.road.segments.length - 1);
                    [innerDistance, outerDistance].forEach((distance, column) => {
                        const x = segment.curve + side * (halfRoadWidth + distance);
                        const y = getTerrainHeightAt(x, segment.z) + 0.085;
                        positions.push(x, y, segment.z);
                        uvs.push(column, v);
                    });
                    if (index < game.road.segments.length - 1) {
                        const base = index * 2;
                        indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
                    }
                });
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
                const mesh = new THREE.Mesh(geometry, material);
                mesh.name = `jungle-understory-floor-${side}`;
                mesh.receiveShadow = true;
                decor.add(mesh);
                stageDecorStats.junglePlants += Math.floor(game.road.segments.length / 3);
            });
        }

        function addMudPuddles() {
            const puddleGeometry = new THREE.CircleGeometry(1, 22);
            for (let z = startZ - 16; z > endZ; z -= 46) {
                const roadData = getLinearRoadDataAtZ(z);
                const roadPose = getRoadDataAtZ(z, game);
                const count = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const onRoad = Math.random() < 0.58;
                    const side = Math.random() < 0.5 ? -1 : 1;
                    const lateral = onRoad
                        ? (Math.random() - 0.5) * (game.road.width * 0.78)
                        : side * (halfRoadWidth + 0.6 + Math.random() * (shoulderWidth * 0.7));
                    const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial.clone());
                    puddle.name = 'jungle-mud-puddle';
                    puddle.position.set(roadData.curve + lateral, roadData.y + 0.062, z + (Math.random() - 0.5) * 18);
                    puddle.rotation.set(-Math.PI / 2, 0, -roadPose.curvatureAngle + (Math.random() - 0.5) * 0.72);
                    puddle.scale.set(1.4 + Math.random() * 2.8, 0.45 + Math.random() * 1.15, 1);
                    addDecorMesh(decor, puddle, 'mudPuddles');
                }
            }
        }

        function addRainField() {
            const streakCount = 760;
            const positions = new Float32Array(streakCount * 6);
            const seeds = [];
            for (let i = 0; i < streakCount; i++) {
                seeds.push({
                    x: (Math.random() - 0.5) * 155,
                    z: (Math.random() - 0.5) * 235,
                    y: Math.random() * 42,
                    speed: 21 + Math.random() * 18,
                    length: 4.8 + Math.random() * 4.2,
                    slant: 1.0 + Math.random() * 1.8
                });
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.LineBasicMaterial({
                color: 0xd8f1ee,
                transparent: true,
                opacity: 0.38,
                depthWrite: false
            });
            const rain = new THREE.LineSegments(geometry, material);
            rain.name = 'jungle-rain-streaks';
            rain.frustumCulled = false;
            rain.renderOrder = 20;
            rain.onBeforeRender = (renderer, activeScene, camera) => {
                const t = performance.now() * 0.001;
                const playerZ = game?.car?.position?.z || camera.position.z;
                for (let i = 0; i < streakCount; i++) {
                    const seed = seeds[i];
                    const base = i * 6;
                    const wrappedY = 26 - ((seed.y + t * seed.speed) % 42);
                    const wrappedX = camera.position.x + seed.x + Math.sin(t * 0.7 + seed.z) * 2.2;
                    const wrappedZ = playerZ + seed.z;
                    positions[base] = wrappedX;
                    positions[base + 1] = camera.position.y + wrappedY;
                    positions[base + 2] = wrappedZ;
                    positions[base + 3] = wrappedX - seed.slant;
                    positions[base + 4] = camera.position.y + wrappedY - seed.length;
                    positions[base + 5] = wrappedZ + seed.slant * 0.35;
                }
                geometry.attributes.position.needsUpdate = true;
            };
            decor.add(rain);
            stageDecorStats.rainStreaks += streakCount;
        }

        function collectDenseForest() {
            const trunks = [];
            const highLeaves = [];
            const highDarkLeaves = [];
            const broadleafCards = [];
            const ferns = [];

            for (let z = startZ; z > endZ; z -= 26) {
                [-1, 1].forEach(side => {
                    const localDensity = 0.72 + Math.max(0, rainforestNoise.noise2D(z * 0.006, side * 4.1)) * 0.28;
                    const treeCount = 2 + (Math.random() < localDensity ? 1 : 0);
                    for (let i = 0; i < treeCount; i++) {
                        const inOpeningCorridor = z > startZ - 1250;
                        const offset = (inOpeningCorridor ? 8 : 14) + Math.random() * (inOpeningCorridor ? 68 : 96);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 18, side, offset);
                        if (getTerrainNormalAt(point.x, point.z, 2.6).y < 0.62) {
                            continue;
                        }

                        const height = 7.2 + Math.random() * 8.8;
                        const trunkRadius = 0.23 + Math.random() * 0.22;
                        trunks.push({
                            x: point.x,
                            y: point.y + height * 0.5,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: (Math.random() - 0.5) * 0.11,
                            scaleX: trunkRadius,
                            scaleY: height,
                            scaleZ: trunkRadius
                        });

                        const highLeafCount = 5 + Math.floor(Math.random() * 4);
                        for (let leafIndex = 0; leafIndex < highLeafCount; leafIndex++) {
                            const angle = (leafIndex / highLeafCount) * Math.PI * 2 + Math.random() * 0.24;
                            const leafLength = 3.2 + Math.random() * 3.9;
                            const highLeaf = {
                                x: point.x + Math.cos(angle) * (0.65 + Math.random() * 0.85),
                                y: point.y + height * (0.76 + Math.random() * 0.16),
                                z: point.z + Math.sin(angle) * (0.65 + Math.random() * 0.85),
                                rotationX: -0.1 + Math.random() * 0.2,
                                rotationY: angle,
                                rotationZ: (Math.random() - 0.5) * 0.72,
                                scaleX: 1.25 + Math.random() * 1.2,
                                scaleY: leafLength,
                                scaleZ: 1
                            };
                            (Math.random() < 0.46 ? highDarkLeaves : highLeaves).push(highLeaf);
                        }
                    }

                    for (let i = 0; i < 6; i++) {
                        const offset = 2.4 + Math.random() * 22;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 28, side, offset);
                        const height = 1.7 + Math.random() * 2.4;
                        broadleafCards.push({
                            x: point.x,
                            y: point.y + height * 0.48,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: (Math.random() - 0.5) * 0.42,
                            scaleX: 1.25 + Math.random() * 1.35,
                            scaleY: height,
                            scaleZ: 1
                        });
                    }

                    for (let i = 0; i < 8; i++) {
                        const offset = 2.2 + Math.random() * 18;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 30, side, offset);
                        const height = 0.9 + Math.random() * 1.45;
                        ferns.push({
                            x: point.x,
                            y: point.y + height * 0.45,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: (Math.random() - 0.5) * 0.55,
                            scaleX: 0.65 + Math.random() * 0.75,
                            scaleY: height,
                            scaleZ: 1
                        });
                    }
                });
            }

            addInstanced('jungle-instanced-trunks', new THREE.CylinderGeometry(1, 1.32, 1, 7), trunkMaterial, trunks, 'trees');
            addInstanced('jungle-high-broadleaf-crowns', createLeafBladeGeometry(1.0, 1.0), tropicalLeafMaterial, highLeaves, 'trees');
            addInstanced('jungle-high-dark-broadleaf-crowns', createLeafBladeGeometry(0.9, 1.0), tropicalLeafDarkMaterial, highDarkLeaves, 'trees');
            addInstanced('jungle-broadleaf-cards', createLeafBladeGeometry(1, 1), leafCardMaterial, broadleafCards, 'junglePlants');
            addInstanced('jungle-fern-cards', createLeafBladeGeometry(0.72, 1), fernMaterial, ferns, 'junglePlants');
        }

        function addRoadsideTropicalWall() {
            const trunks = [];
            const crownLeaves = [];
            const darkLeaves = [];
            const floorLeaves = [];

            for (let z = startZ - 16; z > endZ; z -= 52) {
                [-1, 1].forEach(side => {
                    const inOpeningCorridor = z > startZ - 1050;
                    const groveCount = inOpeningCorridor
                        ? 3
                        : 1 + (Math.random() < 0.54 ? 1 : 0);
                    for (let i = 0; i < groveCount; i++) {
                        const offset = (inOpeningCorridor ? 2.2 : 3.8) + Math.random() * (inOpeningCorridor ? 13 : 24);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 34, side, offset);
                        if (getTerrainNormalAt(point.x, point.z, 2.4).y < 0.5) {
                            continue;
                        }

                        const height = 3.2 + Math.random() * 5.6;
                        const trunkRadius = 0.12 + Math.random() * 0.18;
                        trunks.push({
                            x: point.x,
                            y: point.y + height * 0.5,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: side * (0.05 + Math.random() * 0.08),
                            scaleX: trunkRadius,
                            scaleY: height,
                            scaleZ: trunkRadius
                        });

                        const leafCount = 7 + Math.floor(Math.random() * 4);
                        for (let leafIndex = 0; leafIndex < leafCount; leafIndex++) {
                            const angle = (leafIndex / leafCount) * Math.PI * 2 + Math.random() * 0.22;
                            const leafLength = 2.4 + Math.random() * 3.8;
                            const placement = {
                                x: point.x + Math.cos(angle) * (0.42 + Math.random() * 0.38),
                                y: point.y + height * (0.72 + Math.random() * 0.18),
                                z: point.z + Math.sin(angle) * (0.42 + Math.random() * 0.38),
                                rotationX: -0.08 + Math.random() * 0.16,
                                rotationY: angle,
                                rotationZ: (Math.random() - 0.5) * 0.62,
                                scaleX: 1.0 + Math.random() * 0.9,
                                scaleY: leafLength,
                                scaleZ: 1
                            };
                            (Math.random() < 0.36 ? darkLeaves : crownLeaves).push(placement);
                        }
                    }

                    const undergrowthCount = inOpeningCorridor ? 12 : 7;
                    for (let i = 0; i < undergrowthCount; i++) {
                        const offset = 0.85 + Math.random() * (inOpeningCorridor ? 9 : 13);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 40, side, offset);
                        const leafLength = 2.0 + Math.random() * 3.8;
                        floorLeaves.push({
                            x: point.x,
                            y: point.y + leafLength * 0.42,
                            z: point.z,
                            rotationY: point.yaw + (Math.random() - 0.5) * 0.9,
                            rotationZ: (Math.random() - 0.5) * 0.78,
                            scaleX: 1.35 + Math.random() * 2.1,
                            scaleY: leafLength,
                            scaleZ: 1
                        });
                    }
                });
            }

            addInstanced('jungle-roadside-tropical-trunks', new THREE.CylinderGeometry(1, 0.75, 1, 7), trunkMaterial, trunks, 'trees');
            addInstanced('jungle-roadside-banana-leaves', createLeafBladeGeometry(1.0, 1.0), tropicalLeafMaterial, crownLeaves, 'junglePlants');
            addInstanced('jungle-roadside-dark-leaves', createLeafBladeGeometry(0.92, 1.0), tropicalLeafDarkMaterial, darkLeaves, 'junglePlants');
            addInstanced('jungle-roadside-floor-leaves', createLeafBladeGeometry(0.72, 1.0), fernMaterial, floorLeaves, 'junglePlants');
        }

        function placeOpeningAssetGrove() {
            const openingEnd = Math.max(endZ, startZ - 1280);
            for (let z = startZ - 36; z > openingEnd; z -= 42) {
                [-1, 1].forEach(side => {
                    const palmsThisStep = 1 + (Math.random() < 0.68 ? 1 : 0);
                    for (let i = 0; i < palmsThisStep; i++) {
                        const asset = pickAsset(palmAssets);
                        const offset = 6 + Math.random() * 26;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 26, side, offset);
                        const palm = asset
                            ? createJungleAssetClone(asset, 10.5 + Math.random() * 6.5, 8.4)
                            : createRainforestPalm(0.96 + Math.random() * 0.34);
                        if (!palm || getTerrainNormalAt(point.x, point.z, 2.4).y < 0.5) {
                            continue;
                        }
                        palm.name = asset ? `jungle-opening-palm-${asset.assetName}` : 'jungle-opening-procedural-palm';
                        palm.position.set(point.x, point.y, point.z);
                        palm.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, palm, 'trees');
                        stageDecorStats.palms += 1;
                    }

                    for (let i = 0; i < 4; i++) {
                        const asset = pickAsset(plantAssets);
                        if (!asset) {
                            continue;
                        }
                        const offset = 1.8 + Math.random() * 13;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 32, side, offset);
                        const plant = createJungleAssetClone(asset, 1.4 + Math.random() * 2.8, 4.6);
                        if (!plant || getTerrainNormalAt(point.x, point.z, 2.0).y < 0.48) {
                            continue;
                        }
                        plant.name = `jungle-opening-understory-${asset.assetName}`;
                        plant.position.set(point.x, point.y + 0.025, point.z);
                        plant.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, plant, 'junglePlants');
                    }
                });
            }
        }

        function placeDownloadedPlants() {
            for (let z = startZ - 12; z > endZ; z -= 96) {
                [-1, 1].forEach(side => {
                    const roadCurve = Math.abs(getLinearRoadDataAtZ(z).curve);
                    const clusterExtra = roadCurve > 22 && Math.random() < 0.38 ? 1 : 0;
                    const palmsThisStep = (Math.random() < 0.68 ? 1 : 0) + clusterExtra;
                    for (let i = 0; i < palmsThisStep; i++) {
                        const asset = pickAsset(palmAssets);
                        if (!asset) {
                            continue;
                        }
                        const offset = 5.2 + Math.random() * 30;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 34, side, offset);
                        const targetHeight = 8.0 + Math.random() * 7.0;
                        const palm = createJungleAssetClone(asset, targetHeight, 7.4);
                        if (!palm) {
                            continue;
                        }
                        palm.name = `jungle-downloaded-palm-${asset.assetName}`;
                        palm.position.set(point.x, point.y, point.z);
                        palm.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, palm, 'trees');
                        stageDecorStats.palms += 1;
                    }

                    const plantCount = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < plantCount; i++) {
                        const asset = pickAsset(plantAssets);
                        if (!asset) {
                            continue;
                        }
                        const offset = 2.8 + Math.random() * 20;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 34, side, offset);
                        const plant = createJungleAssetClone(asset, 0.9 + Math.random() * 2.4, 3.8);
                        if (!plant) {
                            continue;
                        }
                        plant.name = `jungle-downloaded-understory-${asset.assetName}`;
                        plant.position.set(point.x, point.y + 0.02, point.z);
                        plant.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, plant, 'junglePlants');
                    }

                    if (Math.random() < 0.22) {
                        const asset = pickAsset(detailAssets);
                        if (!asset) {
                            return;
                        }
                        const offset = 8 + Math.random() * 36;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 28, side, offset);
                        const detail = createJungleAssetClone(asset, 0.8 + Math.random() * 1.8, 4.2);
                        if (!detail) {
                            return;
                        }
                        detail.name = `jungle-downloaded-ground-detail-${asset.assetName}`;
                        detail.position.set(point.x, point.y + 0.025, point.z);
                        detail.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, detail, asset.assetName?.includes('rock') ? 'rockClusters' : 'junglePlants');
                    }
                });
            }
        }

        function createRainforestPalm(scale = 1) {
            const palm = new THREE.Group();
            palm.name = 'jungle-rainforest-palm';
            const trunkHeight = (7.2 + Math.random() * 4.6) * scale;
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18 * scale, 0.38 * scale, trunkHeight, 8),
                trunkMaterial
            );
            trunk.position.y = trunkHeight * 0.5;
            trunk.rotation.z = (Math.random() - 0.5) * 0.15;
            palm.add(trunk);

            const leafGeometry = createLeafBladeGeometry(1, 1);
            const leafCount = 9 + Math.floor(Math.random() * 4);
            for (let i = 0; i < leafCount; i++) {
                const leaf = new THREE.Mesh(leafGeometry, palmLeafMaterial);
                const angle = (i / leafCount) * Math.PI * 2 + Math.random() * 0.18;
                const length = (3.8 + Math.random() * 2.4) * scale;
                leaf.position.set(Math.cos(angle) * 0.55 * scale, trunkHeight + 0.15 * scale, Math.sin(angle) * 0.55 * scale);
                leaf.rotation.set(
                    Math.PI / 2 + 0.52 + Math.random() * 0.22,
                    angle,
                    (Math.random() - 0.5) * 0.28
                );
                leaf.scale.set(0.82 * scale, length, 1);
                palm.add(leaf);
            }

            if (Math.random() < 0.58) {
                for (let i = 0; i < 3; i++) {
                    const vineHeight = (2.0 + Math.random() * 2.2) * scale;
                    const vine = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.025 * scale, 0.035 * scale, vineHeight, 5),
                        canopyDarkMaterial
                    );
                    const angle = Math.random() * Math.PI * 2;
                    vine.position.set(Math.cos(angle) * 0.5 * scale, trunkHeight - vineHeight * 0.42, Math.sin(angle) * 0.5 * scale);
                    vine.rotation.z = (Math.random() - 0.5) * 0.18;
                    palm.add(vine);
                }
            }

            return palm;
        }

        function placeProceduralPalms() {
            for (let z = startZ - 35; z > endZ; z -= 86) {
                [-1, 1].forEach(side => {
                    const count = 1 + (Math.random() < 0.28 ? 1 : 0);
                    for (let i = 0; i < count; i++) {
                        const offset = 3.2 + Math.random() * 15;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 38, side, offset);
                        if (getTerrainNormalAt(point.x, point.z, 2.2).y < 0.58) {
                            continue;
                        }
                        const palm = createRainforestPalm(0.72 + Math.random() * 0.42);
                        palm.position.set(point.x, point.y, point.z);
                        palm.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, palm, 'trees');
                        stageDecorStats.palms += 1;
                    }
                });
            }
        }

        function addCanopyTunnels() {
            const vineMaterial = new THREE.MeshPhongMaterial({ color: 0x2d4f28, shininess: 6 });
            const drippingLeafMaterial = new THREE.MeshPhongMaterial({ color: 0x1f6938, shininess: 10, side: THREE.DoubleSide });
            for (let z = startZ - 120; z > endZ; z -= 310) {
                const roadData = getLinearRoadDataAtZ(z);
                const roadPose = getRoadDataAtZ(z, game);
                const arch = new THREE.Group();
                arch.name = 'rainforest-canopy-tunnel';
                [-1, 1].forEach(side => {
                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 8.4, 7), vineMaterial);
                    trunk.position.set(side * (halfRoadWidth + 4.2), 4.1, 0);
                    trunk.rotation.z = -side * (0.22 + Math.random() * 0.1);
                    arch.add(trunk);
                });
                for (let i = 0; i < 7; i++) {
                    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + Math.random() * 1.5, 3.2 + Math.random() * 2.2), drippingLeafMaterial);
                    leaf.position.set((Math.random() - 0.5) * (game.road.width + 7), 7.2 + Math.random() * 1.7, (Math.random() - 0.5) * 6);
                    leaf.rotation.set(Math.PI / 2 + 0.4 + Math.random() * 0.5, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
                    arch.add(leaf);
                }
                arch.position.set(roadData.curve, roadData.y, z);
                arch.rotation.y = -roadPose.curvatureAngle;
                addDecorGroup(decor, arch, 'canopy');
            }
        }

        addUnderstoryRibbons();
        addMudPuddles();
        addRainField();
        addRoadsideTropicalWall();
        placeOpeningAssetGrove();
        collectDenseForest();
        placeProceduralPalms();
        placeDownloadedPlants();
        addCanopyTunnels();
    }

    function addCoastalRoadsideDecor(decor) {
        const stoneTexture = createMediterraneanStoneTexture();
        const roofTexture = createTerracottaRoofTexture();
        const waterMaterial = createCoastalWaterMaterial();
        const stoneMaterial = new THREE.MeshPhongMaterial({
            color: 0xd1c4a8,
            map: stoneTexture,
            bumpMap: stoneTexture,
            bumpScale: 0.18,
            shininess: 8,
            specular: 0x252018
        });
        const retainingStoneMaterial = new THREE.MeshPhongMaterial({
            color: 0xa99f86,
            map: stoneTexture,
            bumpMap: stoneTexture,
            bumpScale: 0.28,
            shininess: 6,
            specular: 0x201c16,
            side: THREE.DoubleSide
        });
        const limestoneBarrierMaterial = new THREE.MeshPhongMaterial({
            color: 0xd9d0b8,
            specular: 0x3a342b,
            shininess: 12
        });
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0xc15c34,
            map: roofTexture,
            bumpMap: roofTexture,
            bumpScale: 0.08,
            shininess: 10
        });
        const villaMaterial = new THREE.MeshPhongMaterial({
            color: 0xe6dec7,
            map: stoneTexture,
            bumpMap: stoneTexture,
            bumpScale: 0.08,
            shininess: 7
        });
        const rockTexture = createLakeRockTexture();
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0xa69f8f,
            map: rockTexture,
            bumpMap: rockTexture,
            bumpScale: 0.25,
            shininess: 6,
            specular: 0x202018,
            flatShading: true,
            vertexColors: true
        });
        const metalMaterial = new THREE.MeshPhongMaterial({ color: 0x9fa6a2, specular: 0xd9e5e1, shininess: 34 });
        const darkMetalMaterial = new THREE.MeshPhongMaterial({ color: 0x485052, shininess: 14 });
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x5f3d28, shininess: 5 });
        const cypressMaterial = new THREE.MeshLambertMaterial({ color: 0x123f2d });
        const pineMaterial = new THREE.MeshLambertMaterial({ color: 0x2c5d36 });
        const bushMaterials = [
            new THREE.MeshLambertMaterial({ color: 0x536d35 }),
            new THREE.MeshLambertMaterial({ color: 0x6f7e42 }),
            new THREE.MeshLambertMaterial({ color: 0x315d32 })
        ];
        const flowerMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xd44878 }),
            new THREE.MeshBasicMaterial({ color: 0xf07553 }),
            new THREE.MeshBasicMaterial({ color: 0xb746b8 })
        ];
        const sailMaterial = new THREE.MeshBasicMaterial({ color: 0xfff4d8, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const boatHullMaterial = new THREE.MeshPhongMaterial({ color: 0xf2efe5, shininess: 28 });
        const startZ = game.startLine + 180;
        const endZ = game.finishLine + 170;
        const sampleStride = 3;
        const railSegmentLength = 30;
        const localForward = new THREE.Vector3(0, 0, 1);
        const coastalAssetCache = environment.assetCache || {};
        const villaAssets = ['villaD', 'villaE', 'villaN', 'villaT', 'villaU']
            .map(key => coastalAssetCache[key])
            .filter(asset => asset?.scene);
        const villaDetailAssets = {
            planter: coastalAssetCache.planter
        };

        function addInstanced(name, geometry, material, placements, receiveShadow = true) {
            if (placements.length === 0) {
                geometry.dispose();
                return null;
            }

            const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
            const matrix = new THREE.Matrix4();
            mesh.name = name;
            mesh.castShadow = false;
            mesh.receiveShadow = receiveShadow;
            placements.forEach((placement, index) => {
                const rotation = new THREE.Euler(placement.rotation?.x || 0, placement.rotation?.y || 0, placement.rotation?.z || 0);
                const quaternion = new THREE.Quaternion().setFromEuler(rotation);
                matrix.compose(placement.position, quaternion, placement.scale || new THREE.Vector3(1, 1, 1));
                mesh.setMatrixAt(index, matrix);
                if (placement.color) {
                    mesh.setColorAt(index, placement.color);
                }
            });
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
            decor.add(mesh);
            stageDecorStats.totalInstancedProps += placements.length;
            return mesh;
        }

        function buildRibbonMesh(rows, columns, material, name, statsKey, uvStep = 0.04) {
            if (rows.length < 2) {
                return null;
            }

            const positions = [];
            const uvs = [];
            const indices = [];
            rows.forEach((row, rowIndex) => {
                row.points.forEach((point, columnIndex) => {
                    positions.push(point.x, point.y, point.z);
                    uvs.push(columnIndex / Math.max(1, columns - 1), rowIndex * uvStep);
                });

                if (rowIndex < rows.length - 1) {
                    const rowStart = rowIndex * columns;
                    const nextStart = (rowIndex + 1) * columns;
                    for (let columnIndex = 0; columnIndex < columns - 1; columnIndex++) {
                        const a = rowStart + columnIndex;
                        const b = nextStart + columnIndex;
                        const c = rowStart + columnIndex + 1;
                        const d = nextStart + columnIndex + 1;
                        indices.push(a, b, c, c, b, d);
                    }
                }
            });

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            mesh.receiveShadow = true;
            decor.add(mesh);
            if (statsKey) {
                stageDecorStats[statsKey] += 1;
            }
            return mesh;
        }

        function roadSideX(roadData, side, distanceFromRoadEdge) {
            return roadData.curve + side * (halfRoadWidth + distanceFromRoadEdge);
        }

        function alignAlongRoad(mesh, z, side, offsetFromRoadEdge, heightOffset, length = railSegmentLength) {
            const front = getRoadsidePose(z - length * 0.5, side, offsetFromRoadEdge);
            const rear = getRoadsidePose(z + length * 0.5, side, offsetFromRoadEdge);
            const start = new THREE.Vector3(rear.x, rear.roadY + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.roadY + heightOffset, front.z);
            const direction = end.clone().sub(start).normalize();
            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(localForward, direction);
        }

        function addSeaSurface() {
            const rows = [];
            const weights = [0, 0.025, 0.07, 0.14, 0.24, 0.38, 0.56, 0.76, 1];
            for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getCoastalShoreProfile(-1, segment.z, roadData);
                const innerDistance = profile.shoreDistance + 1.2 + lakeNoise.noise2D(segment.z * 0.025, 8.9) * 0.7;
                const outerDistance = terrainWidth + shoulderWidth + coastalBiome.horizonWaterExtension
                    + lakeNoise.noise2D(segment.z * 0.0028, 30.1) * 55;
                rows.push({
                    points: weights.map((weight, columnIndex) => {
                        const t = weight * weight * (3 - 2 * weight);
                        const distance = THREE.MathUtils.lerp(innerDistance, outerDistance, t);
                        const waterlineDrift = lakeNoise.noise2D(segment.z * 0.016, columnIndex * 7.3) * 4.5 * weight;
                        return {
                            x: roadSideX(roadData, -1, distance),
                            y: profile.seaLevel + 0.04,
                            z: segment.z + waterlineDrift
                        };
                    })
                });
            }

            const sea = buildRibbonMesh(rows, weights.length, waterMaterial, 'coastal-mediterranean-sea', 'waterFeatures', 0.018);
            if (sea) {
                sea.onBeforeRender = () => {
                    waterMaterial.uniforms.time.value = performance.now() * 0.001;
                };
            }
        }

        function addCliffsAndShoreline() {
            const cliffRows = [];
            const shoreRows = [];
            for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                const segment = game.road.segments[i];
                if (segment.z > startZ) {
                    continue;
                }
                if (segment.z < endZ) {
                    break;
                }

                const roadData = getLinearRoadDataAtZ(segment.z);
                const profile = getCoastalShoreProfile(-1, segment.z, roadData);
                const topDistance = shoulderWidth + 0.18;
                const ledgeDistance = Math.max(topDistance + 1.4, profile.shoreDistance - coastalBiome.shoreWidth * 0.72);
                const toeDistance = profile.shoreDistance + coastalBiome.shoreWidth * 0.42;
                const farShoreDistance = profile.shoreDistance + coastalBiome.shoreWidth * 1.35;
                const rockNoise = lakeNoise.noise2D(segment.z * 0.018, 91.6) * 0.28;

                cliffRows.push({
                    points: [
                        { x: roadSideX(roadData, -1, topDistance), y: roadData.y + 0.025, z: segment.z },
                        { x: roadSideX(roadData, -1, topDistance + 2.1), y: roadData.y - 0.08 + rockNoise, z: segment.z },
                        { x: roadSideX(roadData, -1, ledgeDistance), y: profile.seaLevel + 0.66 + rockNoise * 0.5, z: segment.z },
                        { x: roadSideX(roadData, -1, toeDistance), y: profile.seaLevel - 0.2, z: segment.z }
                    ]
                });

                shoreRows.push({
                    points: [
                        { x: roadSideX(roadData, -1, ledgeDistance - 0.8), y: profile.seaLevel + 0.22, z: segment.z },
                        { x: roadSideX(roadData, -1, toeDistance), y: profile.seaLevel + 0.06, z: segment.z },
                        { x: roadSideX(roadData, -1, farShoreDistance), y: profile.seaLevel + 0.02, z: segment.z }
                    ]
                });
            }

            buildRibbonMesh(cliffRows, 4, retainingStoneMaterial, 'coastal-rocky-cliff', null, 0.035);
            buildRibbonMesh(shoreRows, 3, stoneMaterial, 'coastal-limestone-shore', null, 0.04);
        }

        function addRoadsideWalls() {
            const seaWallLength = 34;
            const seaWallStep = 78;
            const wallGeometry = new THREE.BoxGeometry(0.48, 0.72, seaWallLength);
            const capGeometry = new THREE.BoxGeometry(0.64, 0.14, seaWallLength);
            const railGeometry = new THREE.BoxGeometry(0.16, 0.16, seaWallLength * 0.72);
            const postGeometry = new THREE.BoxGeometry(0.28, 1.05, 0.28);
            const terraceWallGeometry = new THREE.BoxGeometry(0.62, 1.12, 15);

            let railIndex = 0;
            for (let z = startZ - 8; z > endZ; z -= seaWallStep) {
                const seaWall = new THREE.Mesh(wallGeometry, limestoneBarrierMaterial);
                seaWall.name = 'coastal-sea-parapet';
                alignAlongRoad(seaWall, z, -1, coastalBiome.wallDistance, 0.38, seaWallLength);
                addDecorMesh(decor, seaWall, 'seaWalls');

                const cap = new THREE.Mesh(capGeometry, limestoneBarrierMaterial);
                cap.name = 'coastal-sea-parapet-cap';
                alignAlongRoad(cap, z, -1, coastalBiome.wallDistance, 0.78, seaWallLength);
                addDecorMesh(decor, cap);

                if (railIndex % 2 === 0) {
                    const topRail = new THREE.Mesh(railGeometry, metalMaterial);
                    topRail.name = 'coastal-sea-rail';
                    alignAlongRoad(topRail, z, -1, 1.82, 1.05, seaWallLength * 0.72);
                    addDecorMesh(decor, topRail, 'guardrails');

                    const pose = getRoadsidePose(z, -1, 1.82);
                    const post = new THREE.Mesh(postGeometry, darkMetalMaterial);
                    post.name = 'coastal-sea-rail-post';
                    post.position.set(pose.x, pose.roadY + 0.56, z);
                    post.rotation.y = pose.yaw;
                    addDecorMesh(decor, post);
                }
                railIndex += 1;
            }

            for (let z = startZ - 70; z > endZ; z -= 148) {
                if (Math.random() < 0.22) {
                    continue;
                }
                const offset = 5 + Math.random() * 7;
                const wallLength = 12 + Math.random() * 7;
                const wall = new THREE.Mesh(terraceWallGeometry, retainingStoneMaterial);
                wall.name = 'coastal-hillside-retaining-wall';
                wall.scale.z = wallLength / 15;
                alignAlongRoad(wall, z, 1, offset, 0.58, wallLength);
                addDecorMesh(decor, wall, 'stoneWalls');

                if (Math.random() < 0.7) {
                    const upper = getRoadsidePose(z + (Math.random() - 0.5) * 28, 1, 15 + Math.random() * 20);
                    const terrace = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.95, 12 + Math.random() * 10), stoneMaterial);
                    terrace.name = 'coastal-terrace-wall';
                    terrace.position.set(upper.x, getPropGroundY(upper.x, upper.z, 1.2) + 0.48, upper.z);
                    terrace.rotation.y = upper.yaw + (Math.random() - 0.5) * 0.28;
                    addDecorMesh(decor, terrace, 'stoneWalls');
                }
            }
        }

        function cloneAssetMaterial(material) {
            if (!material) {
                return material;
            }

            const cloned = material.clone();
            cloned.userData.keepTextureMaps = true;
            if ('roughness' in cloned) {
                cloned.roughness = Math.max(cloned.roughness || 0.55, 0.72);
            }
            if ('metalness' in cloned) {
                cloned.metalness = Math.min(cloned.metalness || 0, 0.08);
            }
            if (cloned.color) {
                cloned.color.offsetHSL(0.012, -0.03, 0.035);
            }
            cloned.needsUpdate = true;
            return cloned;
        }

        function createCoastalAssetClone(asset, targetWidth = 11, targetDepth = 9) {
            if (!asset?.scene) {
                return null;
            }

            const wrapper = new THREE.Group();
            wrapper.name = `coastal-asset-${asset.assetName || 'model'}`;
            const clone = asset.scene.clone(true);
            clone.traverse(child => {
                if (!child.isMesh) {
                    return;
                }

                child.castShadow = true;
                child.receiveShadow = true;
                child.userData.keepGeometry = true;
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(cloneAssetMaterial);
                } else {
                    child.material = cloneAssetMaterial(child.material);
                }
            });

            const sourceBox = new THREE.Box3().setFromObject(clone);
            const size = sourceBox.getSize(new THREE.Vector3());
            const widthScale = targetWidth / Math.max(0.001, size.x);
            const depthScale = targetDepth / Math.max(0.001, size.z);
            clone.scale.multiplyScalar(Math.min(widthScale, depthScale));

            const fittedBox = new THREE.Box3().setFromObject(clone);
            const center = fittedBox.getCenter(new THREE.Vector3());
            clone.position.x -= center.x;
            clone.position.z -= center.z;
            clone.position.y -= fittedBox.min.y;
            wrapper.add(clone);
            return wrapper;
        }

        function createCoastalVillaModel(scale = 1) {
            if (villaAssets.length === 0) {
                return createMediterraneanVilla(scale);
            }

            const asset = villaAssets[Math.floor(Math.random() * villaAssets.length)];
            const targetWidth = (11.5 + Math.random() * 5.5) * scale;
            const targetDepth = (8.8 + Math.random() * 5.2) * scale;
            const villa = createCoastalAssetClone(asset, targetWidth, targetDepth);
            if (villa) {
                villa.name = `coastal-downloaded-villa-${asset.assetName}`;
                return villa;
            }

            return createMediterraneanVilla(scale);
        }

        function createCoastalDetailAsset(key, targetWidth, targetDepth) {
            return createCoastalAssetClone(villaDetailAssets[key], targetWidth, targetDepth);
        }

        function createMediterraneanVilla(scale = 1) {
            const villa = new THREE.Group();
            villa.name = 'coastal-stone-villa';
            const bodyWidth = (5.2 + Math.random() * 3.4) * scale;
            const bodyDepth = (5.6 + Math.random() * 2.4) * scale;
            const bodyHeight = (3.0 + Math.random() * 1.1) * scale;
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth), villaMaterial);
            body.position.y = bodyHeight * 0.5;
            villa.add(body);

            const roof = new THREE.Mesh(new THREE.ConeGeometry(bodyWidth * 0.76, 1.25 * scale, 4), roofMaterial);
            roof.position.y = bodyHeight + 0.72 * scale;
            roof.rotation.y = Math.PI / 4;
            roof.scale.z = bodyDepth / Math.max(0.001, bodyWidth);
            villa.add(roof);

            if (Math.random() < 0.45) {
                const towerWidth = bodyWidth * 0.38;
                const tower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, bodyHeight * 1.42, towerWidth), villaMaterial);
                tower.position.set(bodyWidth * 0.32, bodyHeight * 0.71, -bodyDepth * 0.18);
                villa.add(tower);
                const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(towerWidth * 0.86, 0.9 * scale, 4), roofMaterial);
                towerRoof.position.set(tower.position.x, bodyHeight * 1.42 + 0.45 * scale, tower.position.z);
                towerRoof.rotation.y = Math.PI / 4;
                villa.add(towerRoof);
            }

            const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x29333a, specular: 0xb4d5e0, shininess: 45 });
            const shutterMaterial = new THREE.MeshPhongMaterial({ color: 0x416c5e, shininess: 12 });
            for (let i = 0; i < 4; i++) {
                const x = (i % 2 === 0 ? -0.24 : 0.24) * bodyWidth;
                const y = bodyHeight * (i < 2 ? 0.58 : 0.28);
                const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(0.62 * scale, 0.72 * scale, 0.06 * scale), windowMaterial);
                frontWindow.position.set(x, y, -bodyDepth * 0.505);
                villa.add(frontWindow);
                const leftShutter = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.78 * scale, 0.07 * scale), shutterMaterial);
                leftShutter.position.set(x - 0.46 * scale, y, -bodyDepth * 0.51);
                villa.add(leftShutter);
                const rightShutter = leftShutter.clone();
                rightShutter.position.x = x + 0.46 * scale;
                villa.add(rightShutter);
            }

            const balcony = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth * 0.62, 0.14 * scale, 0.72 * scale), stoneMaterial);
            balcony.position.set(0, bodyHeight * 0.49, -bodyDepth * 0.62);
            villa.add(balcony);
            return villa;
        }

        function createCypressTree(scale = 1) {
            const tree = new THREE.Group();
            tree.name = 'coastal-cypress';
            const trunkHeight = 3.1 * scale;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * scale, 0.18 * scale, trunkHeight, 7), trunkMaterial);
            trunk.position.y = trunkHeight * 0.5;
            tree.add(trunk);

            const crownHeight = 5.8 * scale;
            const crown = new THREE.Mesh(new THREE.ConeGeometry(0.74 * scale, crownHeight, 10), cypressMaterial);
            crown.position.y = trunkHeight + crownHeight * 0.42;
            tree.add(crown);

            const lowerCrown = new THREE.Mesh(new THREE.ConeGeometry(0.95 * scale, crownHeight * 0.62, 10), cypressMaterial);
            lowerCrown.position.y = trunkHeight + crownHeight * 0.24;
            tree.add(lowerCrown);
            return tree;
        }

        function createStonePine(scale = 1) {
            const pine = new THREE.Group();
            pine.name = 'coastal-stone-pine';
            const trunkHeight = (3.6 + Math.random() * 1.6) * scale;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, trunkHeight, 7), trunkMaterial);
            trunk.position.y = trunkHeight * 0.5;
            trunk.rotation.z = (Math.random() - 0.5) * 0.1;
            pine.add(trunk);

            const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.65 * scale, 10, 8), pineMaterial);
            canopy.name = 'coastal-pine-canopy';
            canopy.scale.set(1.75, 0.58, 1.32);
            canopy.position.y = trunkHeight + 0.95 * scale;
            pine.add(canopy);

            const lowerCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.15 * scale, 10, 8), pineMaterial);
            lowerCanopy.scale.set(1.65, 0.45, 1.2);
            lowerCanopy.position.set(0.45 * scale, trunkHeight + 0.35 * scale, -0.25 * scale);
            pine.add(lowerCanopy);
            return pine;
        }

        function createFlowerBush(scale = 1) {
            const bush = new THREE.Group();
            bush.name = 'coastal-bougainvillea-bush';
            for (let i = 0; i < 3; i++) {
                const foliage = new THREE.Mesh(new THREE.SphereGeometry((0.58 + Math.random() * 0.28) * scale, 8, 6), bushMaterials[i % bushMaterials.length]);
                foliage.scale.y = 0.58 + Math.random() * 0.22;
                foliage.position.set((Math.random() - 0.5) * 0.9 * scale, 0.42 * scale, (Math.random() - 0.5) * 0.7 * scale);
                bush.add(foliage);
            }
            if (Math.random() < 0.58) {
                for (let i = 0; i < 6; i++) {
                    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 6, 4), flowerMaterials[i % flowerMaterials.length]);
                    flower.position.set((Math.random() - 0.5) * 1.25 * scale, 0.64 * scale + Math.random() * 0.45 * scale, (Math.random() - 0.5) * 0.95 * scale);
                    bush.add(flower);
                }
            }
            return bush;
        }

        function placeHillsideVillas() {
            function addVillaGarden(villa, z, offset, scale, yaw) {
                const wallPose = getRoadsidePose(z, 1, Math.max(5.2, offset - 6.4));
                const wall = new THREE.Mesh(new THREE.BoxGeometry(10.5 * scale, 0.72 * scale, 0.32 * scale), stoneMaterial);
                wall.name = 'coastal-villa-front-stone-wall';
                wall.position.set(wallPose.x, getPropGroundY(wallPose.x, wallPose.z, 1.1) + 0.36 * scale, wallPose.z);
                wall.rotation.y = yaw + (Math.random() - 0.5) * 0.18;
                addDecorMesh(decor, wall, 'stoneWalls');

                for (let i = 0; i < 3; i++) {
                    const bushZ = z + (Math.random() - 0.5) * 9;
                    const bushOffset = Math.max(6, offset - 8 + Math.random() * 9);
                    const bushRoadData = getLinearRoadDataAtZ(bushZ);
                    const x = roadSideX(bushRoadData, 1, bushOffset);
                    const bush = createFlowerBush(0.78 + Math.random() * 0.55);
                    bush.position.set(x, getPropGroundY(x, bushZ, 1.2), bushZ);
                    bush.rotation.y = Math.random() * Math.PI * 2;
                    addDecorGroup(decor, bush, 'coastalDetails');
                }

                if (Math.random() < 0.72) {
                    const cypressZ = z + (Math.random() - 0.5) * 14;
                    const cypressOffset = offset + 4 + Math.random() * 9;
                    const cypressRoadData = getLinearRoadDataAtZ(cypressZ);
                    const x = roadSideX(cypressRoadData, 1, cypressOffset);
                    const cypress = createCypressTree(0.72 + Math.random() * 0.45);
                    cypress.position.set(x, getPropGroundY(x, cypressZ, 1.4), cypressZ);
                    cypress.rotation.y = Math.random() * Math.PI * 2;
                    addDecorGroup(decor, cypress, 'trees');
                }

                if (villaDetailAssets.planter?.scene && Math.random() < 0.6) {
                    const planterZ = z + 2 + (Math.random() - 0.5) * 7;
                    const planterOffset = Math.max(7, offset - 5 + Math.random() * 4);
                    const planterRoadData = getLinearRoadDataAtZ(planterZ);
                    const x = roadSideX(planterRoadData, 1, planterOffset);
                    const planter = createCoastalDetailAsset('planter', 2.4 * scale, 1.7 * scale);
                    if (planter) {
                        planter.name = 'coastal-villa-planter';
                        planter.position.set(x, getPropGroundY(x, planterZ, 0.8), planterZ);
                        planter.rotation.y = yaw + (Math.random() - 0.5) * 0.3;
                        addDecorGroup(decor, planter, 'coastalDetails');
                    }
                }

            }

            for (let z = game.startLine - 210; z > endZ; z -= 250) {
                const isOpeningCluster = z > game.startLine - 900;
                const clusterCount = isOpeningCluster || Math.random() < 0.72 ? 2 : 1;
                for (let i = 0; i < clusterCount; i++) {
                    const villaZ = z - i * (28 + Math.random() * 22) + (Math.random() - 0.5) * 22;
                    const roadData = getLinearRoadDataAtZ(villaZ);
                    const nearRoad = i === 0 || Math.random() < 0.56;
                    const offset = nearRoad
                        ? 14 + Math.random() * 13
                        : 28 + Math.random() * 32;
                    const x = roadSideX(roadData, 1, offset);
                    const normal = getTerrainNormalAt(x, villaZ, 3.6);
                    if (normal.y < 0.38) {
                        continue;
                    }

                    const scale = (i === 0 ? 1.28 + Math.random() * 0.38 : 0.95 + Math.random() * 0.28)
                        + (isOpeningCluster ? 0.2 : 0);
                    const villa = createCoastalVillaModel(scale);
                    villa.position.set(x, getPropHighGroundY(x, villaZ, 3.8), villaZ);
                    const yaw = -getRoadDataAtZ(villaZ, game).curvatureAngle + Math.PI + (Math.random() - 0.5) * 0.32;
                    villa.rotation.y = yaw;
                    addDecorGroup(decor, villa, 'villas');

                    const terrace = new THREE.Mesh(new THREE.BoxGeometry(14 * scale, 0.2, 10 * scale), stoneMaterial);
                    terrace.name = 'coastal-villa-terrace-pad';
                    terrace.position.set(villa.position.x, villa.position.y + 0.03, villa.position.z);
                    terrace.rotation.y = villa.rotation.y;
                    addDecorMesh(decor, terrace, 'coastalDetails');

                    addVillaGarden(villa, villaZ, offset, scale, yaw);
                }
            }
        }

        function placeVegetation() {
            for (let z = startZ - 25; z > endZ; z -= 76) {
                const roadData = getLinearRoadDataAtZ(z);
                const isCluster = Math.random() < 0.64;
                const clusterCount = isCluster ? 2 + Math.floor(Math.random() * 4) : 1;
                for (let i = 0; i < clusterCount; i++) {
                    const offset = 6 + Math.random() * 72;
                    const treeZ = z + (Math.random() - 0.5) * 34;
                    const treeRoadData = getLinearRoadDataAtZ(treeZ);
                    const x = roadSideX(treeRoadData, 1, offset);
                    const y = getPropGroundY(x, treeZ, 1.8);
                    const normal = getTerrainNormalAt(x, treeZ, 2.4);
                    if (normal.y < 0.5) {
                        continue;
                    }

                    const scale = 0.72 + Math.random() * 0.72;
                    const tree = Math.random() < 0.45 ? createCypressTree(scale) : createStonePine(scale);
                    tree.position.set(x, y, treeZ);
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    addDecorGroup(decor, tree, 'trees');
                }
            }

            for (let z = startZ - 10; z > endZ; z -= 52) {
                [1, -1].forEach(side => {
                    if (side < 0 && Math.random() < 0.78) {
                        return;
                    }
                    const roadData = getLinearRoadDataAtZ(z);
                    const offset = side > 0 ? 3.4 + Math.random() * 14 : 2.8 + Math.random() * 5.8;
                    const x = roadSideX(roadData, side, offset);
                    if (side < 0) {
                        const profile = getCoastalShoreProfile(-1, z, roadData);
                        if (offset > profile.shoreDistance - 1.6) {
                            return;
                        }
                    }
                    const bush = createFlowerBush(0.7 + Math.random() * 0.42);
                    bush.position.set(x, getPropGroundY(x, z, 1.1), z + (Math.random() - 0.5) * 12);
                    bush.rotation.y = Math.random() * Math.PI * 2;
                    addDecorGroup(decor, bush, 'coastalDetails');
                });
            }
        }

        function addRocksAndBoats() {
            const rockPlacements = [];
            for (let z = startZ - 18; z > endZ; z -= 34) {
                const roadData = getLinearRoadDataAtZ(z);
                const profile = getCoastalShoreProfile(-1, z, roadData);
                if (Math.random() < 0.74) {
                    const rockCount = 1 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < rockCount; i++) {
                        const rockZ = z + (Math.random() - 0.5) * 24;
                        const rockRoadData = getLinearRoadDataAtZ(rockZ);
                        const rockProfile = getCoastalShoreProfile(-1, rockZ, rockRoadData);
                        const distance = rockProfile.shoreDistance - 1.2 + Math.random() * coastalBiome.shoreWidth * 1.6;
                        const x = roadSideX(rockRoadData, -1, distance);
                        const y = Math.max(getPropGroundY(x, rockZ, 1.2), rockProfile.seaLevel - 0.04);
                        const scale = 0.35 + Math.random() * 1.1;
                        const tint = new THREE.Color().setHSL(0.11 + Math.random() * 0.04, 0.09, 0.42 + Math.random() * 0.16);
                        rockPlacements.push({
                            position: new THREE.Vector3(x, y + scale * 0.38, rockZ),
                            rotation: { x: (Math.random() - 0.5) * 0.22, y: Math.random() * Math.PI, z: (Math.random() - 0.5) * 0.16 },
                            scale: new THREE.Vector3(scale * (1.2 + Math.random() * 0.9), scale * (0.34 + Math.random() * 0.32), scale * (0.8 + Math.random() * 0.85)),
                            color: tint
                        });
                    }
                }

                if (Math.random() < 0.18) {
                    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.22), stoneMaterial);
                    wall.name = 'coastal-road-marker-stone';
                    wall.position.set(roadSideX(roadData, 1, 4.4), roadData.y + 0.76, z);
                    wall.rotation.y = -getRoadDataAtZ(z, game).curvatureAngle + Math.PI / 2;
                    addDecorMesh(decor, wall, 'coastalDetails');
                }
            }

            addInstanced('coastal-shore-boulders', new THREE.DodecahedronGeometry(1, 0), rockMaterial, rockPlacements);
            stageDecorStats.shorelineRocks += rockPlacements.length;
            stageDecorStats.rockClusters += Math.ceil(rockPlacements.length / 5);

            for (let z = startZ - 280; z > endZ; z -= 760) {
                const roadData = getLinearRoadDataAtZ(z);
                const profile = getCoastalShoreProfile(-1, z, roadData);
                const sailboat = new THREE.Group();
                sailboat.name = 'coastal-mediterranean-sailboat';
                const hull = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.38, 1.08), boatHullMaterial);
                hull.position.y = 0.25;
                sailboat.add(hull);
                const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 3.9, 8), boatHullMaterial);
                mast.position.y = 2.05;
                sailboat.add(mast);
                const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 3.05), sailMaterial);
                sail.position.set(0.82, 2.25, 0);
                sail.rotation.z = -0.22;
                sailboat.add(sail);
                sailboat.position.set(
                    roadSideX(roadData, -1, profile.shoreDistance + 54 + Math.random() * 78),
                    profile.seaLevel + 0.12,
                    z + (Math.random() - 0.5) * 48
                );
                sailboat.rotation.y = -getRoadDataAtZ(z, game).curvatureAngle + 0.52 + Math.random() * 0.36;
                addDecorGroup(decor, sailboat, 'boats');
            }
        }

        addSeaSurface();
        addCliffsAndShoreline();
        addRoadsideWalls();
        placeHillsideVillas();
        placeVegetation();
        addRocksAndBoats();
    }

    function addAlpineRoadsideDecor(decor) {
        const railMaterial = new THREE.MeshPhongMaterial({ color: 0xd6e0e4, shininess: 32 });
        const railShadowMaterial = new THREE.MeshPhongMaterial({ color: 0x6f7f85, shininess: 12 });
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0x8fa1a6, shininess: 18 });
        const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x59666c, shininess: 4 });
        const markerRedMaterial = new THREE.MeshPhongMaterial({ color: 0xd8213d, shininess: 18 });
        const markerWhiteMaterial = new THREE.MeshPhongMaterial({ color: 0xf6fbff, shininess: 14 });
        const railLength = 17;
        const railGeometry = new THREE.BoxGeometry(0.28, 0.28, railLength);
        const postGeometry = new THREE.BoxGeometry(0.28, 1.25, 0.28);
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const markerGeometry = new THREE.BoxGeometry(0.18, 0.86, 0.12);
        const startZ = game.startLine - 42;
        const endZ = game.finishLine + 80;
        const localForward = new THREE.Vector3(0, 0, 1);

        function alignGuardrail(mesh, z, side, offsetFromRoadEdge, heightOffset) {
            const front = getRoadsidePose(z - railLength * 0.5, side, offsetFromRoadEdge);
            const rear = getRoadsidePose(z + railLength * 0.5, side, offsetFromRoadEdge);
            const start = new THREE.Vector3(rear.x, rear.roadY + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.roadY + heightOffset, front.z);
            const direction = end.clone().sub(start).normalize();

            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(localForward, direction);
        }

        let railIndex = 0;
        for (let z = startZ; z > endZ; z -= 18) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 0.85);
                const topRail = new THREE.Mesh(railGeometry, railMaterial);
                topRail.name = 'alpine-guardrail-top';
                alignGuardrail(topRail, z, side, 0.85, 0.92);
                addDecorMesh(decor, topRail, 'guardrails');

                const lowerRail = new THREE.Mesh(railGeometry, railShadowMaterial);
                lowerRail.name = 'alpine-guardrail-lower';
                alignGuardrail(lowerRail, z, side, 0.85, 0.52);
                addDecorMesh(decor, lowerRail, 'guardrails');

                if (railIndex % 2 === 0) {
                    const post = new THREE.Mesh(postGeometry, postMaterial);
                    post.name = 'alpine-guardrail-post';
                    post.position.set(pose.x, pose.roadY + 0.62, z);
                    post.rotation.y = pose.yaw;
                    addDecorMesh(decor, post);
                }
            });
            railIndex += 1;
        }

        for (let z = startZ - 18; z > endZ; z -= 86) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 1.35);
                const lower = new THREE.Mesh(markerGeometry, markerWhiteMaterial);
                lower.name = 'alpine-hazard-marker';
                lower.position.set(pose.x, pose.roadY + 0.65, z);
                lower.rotation.y = pose.yaw;
                addDecorMesh(decor, lower);

                const upper = new THREE.Mesh(markerGeometry, markerRedMaterial);
                upper.name = 'alpine-hazard-marker';
                upper.position.set(pose.x, pose.roadY + 1.3, z);
                upper.rotation.y = pose.yaw;
                addDecorMesh(decor, upper, 'hazardMarkers');
            });
        }

        for (let z = startZ - 40; z > endZ; z -= 122) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 12 + Math.random() * 16);
            const rocksInCluster = 2 + Math.floor(Math.random() * 3);
            let placedRocks = 0;
            for (let i = 0; i < rocksInCluster; i++) {
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.name = 'alpine-rock';
                rock.scale.set(0.85 + Math.random() * 0.95, 0.42 + Math.random() * 0.45, 0.75 + Math.random() * 0.95);
                const rockX = pose.x + side * Math.random() * 3.4;
                const rockZ = z + (Math.random() - 0.5) * 7;
                const terrainNormal = getTerrainNormalAt(rockX, rockZ, 2);
                if (terrainNormal.y < 0.78) {
                    continue;
                }
                const lowGroundY = getPropGroundY(rockX, rockZ, 2.4);
                const highGroundY = getPropHighGroundY(rockX, rockZ, 2.4);
                if (highGroundY - lowGroundY > 0.8) {
                    continue;
                }
                const rockLift = Math.max(rock.scale.x, rock.scale.y, rock.scale.z) * 0.86;
                rock.position.set(rockX, highGroundY + rockLift, rockZ);
                rock.quaternion.setFromUnitVectors(localUp, terrainNormal);
                rock.rotateY(Math.random() * Math.PI);
                rock.rotateX((Math.random() - 0.5) * 0.08);
                rock.rotateZ((Math.random() - 0.5) * 0.08);
                addDecorMesh(decor, rock);
                placedRocks += 1;
            }
            if (placedRocks > 0) {
                stageDecorStats.rockClusters += 1;
            }
        }
    }

    function createCactus(material) {
        const cactus = new THREE.Group();
        const trunkHeight = 2.8 + Math.random() * 2.4;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, trunkHeight, 9), material);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        cactus.add(trunk);

        [-1, 1].forEach(side => {
            if (Math.random() < 0.68) {
                const armHeight = 0.9 + Math.random() * 0.8;
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, armHeight, 8), material);
                arm.position.set(side * 0.62, trunkHeight * (0.52 + Math.random() * 0.18), 0);
                arm.rotation.z = side * Math.PI / 2;
                arm.castShadow = true;
                arm.receiveShadow = true;
                cactus.add(arm);

                const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, armHeight * 0.85, 8), material);
                tip.position.set(side * (0.62 + armHeight * 0.48), arm.position.y + armHeight * 0.32, 0);
                tip.castShadow = true;
                tip.receiveShadow = true;
                cactus.add(tip);
            }
        });

        return cactus;
    }

    function addDesertRoadsideDecor(decor) {
        const cactusMaterial = new THREE.MeshPhongMaterial({ color: 0x2d7440, shininess: 4 });
        const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x8c6a43, shininess: 4 });
        const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xf2d06a, shininess: 12 });
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const markerGeometry = new THREE.BoxGeometry(0.3, 1.55, 0.2);
        const startZ = game.startLine - 70;
        const endZ = game.finishLine + 100;

        for (let z = startZ - 22; z > endZ; z -= 108) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.74) {
                    const pose = getRoadsidePose(z, side, 10 + Math.random() * 28);
                    const cactus = createCactus(cactusMaterial);
                    const cactusZ = z + (Math.random() - 0.5) * 18;
                    cactus.name = 'desert-cactus';
                    cactus.position.set(pose.x, getPropGroundY(pose.x, cactusZ, 1.2), cactusZ);
                    cactus.rotation.y = Math.random() * Math.PI;
                    decor.add(cactus);
                    stageDecorStats.cacti += 1;
                }
            });
        }

        for (let z = startZ - 50; z > endZ; z -= 132) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 12 + Math.random() * 30);
            const rocksInCluster = 2 + Math.floor(Math.random() * 4);
            let placedRocks = 0;
            for (let i = 0; i < rocksInCluster; i++) {
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.name = 'desert-rock';
                rock.scale.set(0.9 + Math.random() * 2.4, 0.45 + Math.random() * 0.95, 0.8 + Math.random() * 2);
                const rockX = pose.x + side * Math.random() * 4;
                const rockZ = z + (Math.random() - 0.5) * 9;
                const terrainNormal = getTerrainNormalAt(rockX, rockZ, 2);
                if (terrainNormal.y < 0.86) {
                    continue;
                }
                const lowGroundY = getPropGroundY(rockX, rockZ, 2.2);
                const highGroundY = getPropHighGroundY(rockX, rockZ, 2.2);
                if (highGroundY - lowGroundY > 0.8) {
                    continue;
                }
                rock.position.set(rockX, highGroundY + rock.scale.y * 0.96, rockZ);
                rock.quaternion.setFromUnitVectors(localUp, terrainNormal);
                rock.rotateY(Math.random() * Math.PI);
                rock.rotateX((Math.random() - 0.5) * 0.08);
                rock.rotateZ((Math.random() - 0.5) * 0.08);
                addDecorMesh(decor, rock);
                placedRocks += 1;
            }
            if (placedRocks > 0) {
                stageDecorStats.rockClusters += 1;
            }
        }

        for (let z = startZ - 12; z > endZ; z -= 96) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 1.8);
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.name = 'desert-road-marker';
                marker.position.set(pose.x, pose.roadY + 0.78, z);
                marker.rotation.y = pose.yaw;
                addDecorMesh(decor, marker);
            });
        }
    }

    function addScotlandRoadsideDecor(decor) {
        const woodMaterial = new THREE.MeshPhongMaterial({ color: 0x7b5837, shininess: 6 });
        const stoneMaterial = new THREE.MeshPhongMaterial({ color: 0x8b9180, shininess: 3 });
        const darkStoneMaterial = new THREE.MeshPhongMaterial({ color: 0x5d6657, shininess: 2 });
        const wildflowerMaterial = new THREE.MeshPhongMaterial({ color: 0xd7ce63, shininess: 8 });
        const fenceRailLength = 17;
        const wallLength = 12;
        const postGeometry = new THREE.BoxGeometry(0.18, 1.02, 0.18);
        const railGeometry = new THREE.BoxGeometry(0.18, 0.15, fenceRailLength);
        const wallGeometry = new THREE.BoxGeometry(0.72, 0.58, wallLength);
        const capStoneGeometry = new THREE.DodecahedronGeometry(0.38, 0);
        const flowerGeometry = new THREE.ConeGeometry(0.12, 0.38, 6);
        const startZ = game.startLine - 58;
        const endZ = game.finishLine + 100;

        function getGroundedRoadsidePoint(z, side, offsetFromRoadEdge, footprint = 0) {
            const pose = getRoadsidePose(z, side, offsetFromRoadEdge);
            return {
                ...pose,
                y: getPropGroundY(pose.x, z, footprint)
            };
        }

        function alignLongRoadsideMesh(mesh, z, side, offsetFromRoadEdge, length, heightOffset, footprint = 0) {
            const front = getGroundedRoadsidePoint(z - length * 0.5, side, offsetFromRoadEdge, footprint);
            const rear = getGroundedRoadsidePoint(z + length * 0.5, side, offsetFromRoadEdge, footprint);
            const start = new THREE.Vector3(rear.x, rear.y + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.y + heightOffset, front.z);
            const center = start.clone().add(end).multiplyScalar(0.5);
            const terrainNormal = getTerrainNormalAt(center.x, center.z);
            const forward = end.clone().sub(start);

            if (forward.lengthSq() < 0.0001) {
                forward.set(0, 0, -1);
            }

            forward.normalize();
            const right = terrainNormal.clone().cross(forward);
            if (right.lengthSq() < 0.0001) {
                right.set(1, 0, 0);
            }
            right.normalize();
            const adjustedUp = forward.clone().cross(right).normalize();
            const basis = new THREE.Matrix4().makeBasis(right, adjustedUp, forward);

            mesh.position.copy(center);
            mesh.quaternion.setFromRotationMatrix(basis);
        }

        for (let z = startZ; z > endZ; z -= 30) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.72) {
                    const pose = getGroundedRoadsidePoint(z, side, 2.8);
                    const rail = new THREE.Mesh(railGeometry, woodMaterial);
                    rail.name = 'scotland-fence-rail';
                    alignLongRoadsideMesh(rail, z, side, 2.8, fenceRailLength, 0.78);
                    addDecorMesh(decor, rail, 'fenceSegments');

                    const post = new THREE.Mesh(postGeometry, woodMaterial);
                    post.name = 'scotland-fence-post';
                    post.position.set(pose.x, pose.y + 0.52, z);
                    post.rotation.y = pose.yaw;
                    post.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(localUp, getTerrainNormalAt(pose.x, z, 0.8)));
                    addDecorMesh(decor, post);
                }
            });
        }

        for (let z = startZ - 25; z > endZ; z -= 128) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 4.6);
            const wall = new THREE.Mesh(wallGeometry, stoneMaterial);
            wall.name = 'scotland-stone-wall';
            alignLongRoadsideMesh(wall, z, side, 4.6, wallLength, 0.29);
            addDecorMesh(decor, wall, 'stoneWalls');

            for (let i = -2; i <= 2; i++) {
                const stone = new THREE.Mesh(capStoneGeometry, darkStoneMaterial);
                stone.name = 'scotland-wall-stone';
                stone.scale.set(0.95 + Math.random() * 0.38, 0.34 + Math.random() * 0.18, 0.68 + Math.random() * 0.38);
                const stoneX = pose.x + side * (Math.random() - 0.5) * 0.4;
                const stoneZ = z + i * 3.2;
                stone.position.set(stoneX, getPropGroundY(stoneX, stoneZ, 0.8) + 0.42, stoneZ);
                stone.rotation.set(Math.random() * 0.25, pose.yaw + Math.random(), Math.random() * 0.2);
                addDecorMesh(decor, stone);
            }
        }

        for (let z = startZ - 12; z > endZ; z -= 78) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 10 + Math.random() * 16);
                for (let i = 0; i < 5; i++) {
                    const flower = new THREE.Mesh(flowerGeometry, wildflowerMaterial);
                    flower.name = 'scotland-wildflower';
                    const flowerX = pose.x + (Math.random() - 0.5) * 5;
                    const flowerZ = z + (Math.random() - 0.5) * 8;
                    flower.position.set(flowerX, getPropGroundY(flowerX, flowerZ, 0.18) + 0.18, flowerZ);
                    flower.rotation.y = Math.random() * Math.PI;
                    addDecorMesh(decor, flower);
                }
            });
        }
    }

    addStageDecor();

    // Place trees if the environment has any
    if (environment.treeDensity > 0 && environment.id !== 'lakes') {
        const treeDensity = environment.treeDensity;
        const minDistanceBetweenTrees = 10;
        const trees = [];
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: environment.trunkColor || 0x8B4513, shininess: 4 });
        const leafMaterial = new THREE.MeshPhongMaterial({ color: environment.treeColor || 0x228B22, shininess: 7 });
        const leafShadeMaterial = new THREE.MeshPhongMaterial({
            color: environment.terrainStyle === 'snow-rock' ? 0x0d3f2c : 0x275f31,
            shininess: 5
        });

        function addTreePart(tree, mesh) {
            const castsUsefulShadow = !['city', 'lakes', 'jungle', 'coastal'].includes(environment.id);
            mesh.castShadow = castsUsefulShadow;
            mesh.receiveShadow = castsUsefulShadow;
            tree.add(mesh);
            return mesh;
        }

        function createTree(x, y, z) {
            const tree = new THREE.Group();
            tree.name = 'roadside-tree';
            const trunkHeight = environment.terrainStyle === 'snow-rock' ? 2.1 + Math.random() * 0.8 : 2.4 + Math.random() * 1.2;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, trunkHeight, 7), trunkMaterial);
            trunk.position.y = trunkHeight / 2;
            addTreePart(tree, trunk);

            if (environment.terrainStyle === 'snow-rock') {
                const tiers = 3 + Math.floor(Math.random() * 2);
                for (let i = 0; i < tiers; i++) {
                    const radius = 1.55 - i * 0.24 + Math.random() * 0.18;
                    const height = 1.9 - i * 0.18 + Math.random() * 0.22;
                    const leaves = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 9), i === 0 ? leafShadeMaterial : leafMaterial);
                    leaves.position.set((Math.random() - 0.5) * 0.16, trunkHeight + i * 0.72 + height * 0.28, (Math.random() - 0.5) * 0.16);
                    leaves.rotation.y = Math.random() * Math.PI;
                    leaves.scale.x = 0.88 + Math.random() * 0.2;
                    leaves.scale.z = 0.92 + Math.random() * 0.18;
                    addTreePart(tree, leaves);
                }
            } else {
                const crownGeometry = new THREE.DodecahedronGeometry(1, 1);
                const blobs = [
                    { x: 0, y: trunkHeight + 1.45, z: 0, s: [1.55, 1.15, 1.45], mat: leafMaterial },
                    { x: -0.74, y: trunkHeight + 1.1, z: 0.1, s: [1.18, 0.95, 1.1], mat: leafShadeMaterial },
                    { x: 0.7, y: trunkHeight + 1.2, z: -0.12, s: [1.12, 0.9, 1.16], mat: leafMaterial },
                    { x: 0.12, y: trunkHeight + 2.12, z: -0.08, s: [1.05, 0.92, 1.0], mat: leafMaterial }
                ];

                blobs.forEach(blob => {
                    const leaves = new THREE.Mesh(crownGeometry, blob.mat);
                    leaves.position.set(blob.x, blob.y, blob.z);
                    leaves.scale.set(blob.s[0], blob.s[1], blob.s[2]);
                    leaves.rotation.set(Math.random() * 0.25, Math.random() * Math.PI, Math.random() * 0.2);
                    addTreePart(tree, leaves);
                });

                const branchLength = 1.3;
                const branchGeometry = new THREE.CylinderGeometry(0.06, 0.1, branchLength, 6);
                branchGeometry.translate(0, branchLength / 2, 0);
                [-1, 1].forEach(side => {
                    const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
                    branch.position.set(side * 0.12, trunkHeight * 0.74, 0);
                    branch.rotation.z = -side * 0.88;
                    branch.rotation.y = side * 0.28;
                    addTreePart(tree, branch);
                });
            }

            tree.position.set(x, y, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            tree.scale.setScalar(0.86 + Math.random() * 0.28);
            return tree;
        }

        function placeTrees(startZ, endZ) {
            for (let z = startZ; z > endZ; z -= minDistanceBetweenTrees) {
                const roadData = getLinearRoadDataAtZ(z);
                const halfRoadWidth = game.road.width / 2;
                const terrainWidth = game.terrain.width;

                [-1, 1].forEach(side => {
                    if (Math.random() < treeDensity) {
                        const treeOffset = halfRoadWidth + shoulderWidth + 4 + Math.random() * (terrainWidth - 4);
                        const x = roadData.curve + side * treeOffset;

                        const y = getTerrainHeightAt(x, z);
                        
                        const tooClose = trees.some(tree => {
                            const dx = tree.position.x - x;
                            const dz = tree.position.z - z;
                            return Math.sqrt(dx * dx + dz * dz) < minDistanceBetweenTrees;
                        });

                        if (Math.abs(x - roadData.curve) > halfRoadWidth + shoulderWidth + 3 && !tooClose) {
                            const tree = createTree(x, y, z);
                            trees.push(tree);
                            stageDecorStats.trees += 1;
                            scene.add(tree);
                        }
                    }
                });
            }
        }

        placeTrees(game.startLine - 40, game.finishLine + 120);
    }
    
    if (scene.background?.isTexture) {
        scene.background.dispose();
    }
    scene.background = environment.id === 'lakes'
        ? createLakeSkyTexture()
        : environment.id === 'coastal'
            ? createCoastalSkyTexture()
            : environment.id === 'jungle'
                ? createJungleSkyTexture()
                : new THREE.Color(environment.fogColor);
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
