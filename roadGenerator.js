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

function loadImageIntoTexture(texture, url, options = {}) {
    const loader = new THREE.TextureLoader();
    loader.load(url, (loadedTexture) => {
        if (options.drawToCanvas || typeof options.afterDraw === 'function') {
            const canvas = options.reuseTextureCanvas && texture.image?.getContext
                ? texture.image
                : document.createElement('canvas');
            canvas.width = options.width || 1024;
            canvas.height = options.height || canvas.width;
            const context = canvas.getContext('2d');
            if (options.smoothDownscale) {
                const scale = THREE.MathUtils.clamp(options.downscaleFactor || 0.5, 0.15, 0.9);
                const scratch = document.createElement('canvas');
                scratch.width = Math.max(16, Math.round(canvas.width * scale));
                scratch.height = Math.max(16, Math.round(canvas.height * scale));
                const scratchContext = scratch.getContext('2d');
                scratchContext.imageSmoothingEnabled = true;
                scratchContext.imageSmoothingQuality = 'high';
                scratchContext.drawImage(loadedTexture.image, 0, 0, scratch.width, scratch.height);
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                context.drawImage(scratch, 0, 0, canvas.width, canvas.height);
            } else {
                context.drawImage(loadedTexture.image, 0, 0, canvas.width, canvas.height);
            }
            if (typeof options.afterDraw === 'function') {
                options.afterDraw(context, canvas.width, canvas.height, loadedTexture.image);
            }
            texture.image = canvas;
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = options.anisotropy || texture.anisotropy;
        } else {
            texture.image = loadedTexture.image;
        }
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

function createJungleLeafTexture(width = 512, height = 512, repeatX = 2, repeatY = 2) {
    return createCanvasTexture(width, height, repeatX, repeatY, (context, w, h) => {
        const gradient = context.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#0b281c');
        gradient.addColorStop(0.42, '#1d5b35');
        gradient.addColorStop(0.68, '#2e7540');
        gradient.addColorStop(1, '#102f21');
        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);

        for (let i = 0; i < 360; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const leafLength = 16 + Math.random() * 62;
            const leafWidth = 4 + Math.random() * 16;
            const angle = Math.random() * Math.PI * 2;
            context.save();
            context.translate(x, y);
            context.rotate(angle);
            context.globalAlpha = 0.22 + Math.random() * 0.38;
            context.fillStyle = ['#0d3524', '#1f6a3e', '#2e8447', '#173f2c', '#4f8b48'][Math.floor(Math.random() * 5)];
            context.beginPath();
            context.ellipse(0, 0, leafWidth, leafLength, 0, 0, Math.PI * 2);
            context.fill();
            context.globalAlpha *= 0.9;
            context.strokeStyle = '#b0c878';
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(0, -leafLength * 0.72);
            context.lineTo(0, leafLength * 0.72);
            context.stroke();
            context.restore();
        }

        context.globalAlpha = 0.32;
        drawSpeckle(context, w, h, ['#07170f', '#113621', '#2c703a', '#668a45'], 2500, 1, 4, 0.75);
        context.globalAlpha = 1;
    });
}

function createJungleBarkTexture(width = 256, height = 512, repeatX = 1.2, repeatY = 2.5) {
    return createCanvasTexture(width, height, repeatX, repeatY, (context, w, h) => {
        const gradient = context.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#25170f');
        gradient.addColorStop(0.32, '#54331f');
        gradient.addColorStop(0.64, '#302015');
        gradient.addColorStop(1, '#6b4a2e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);

        for (let i = 0; i < 90; i++) {
            const x = Math.random() * w;
            context.globalAlpha = 0.22 + Math.random() * 0.36;
            context.strokeStyle = Math.random() < 0.5 ? '#140d09' : '#80603c';
            context.lineWidth = 1 + Math.random() * 3;
            context.beginPath();
            context.moveTo(x, -20);
            for (let y = 0; y < h + 24; y += 34) {
                context.lineTo(x + Math.sin(y * 0.026 + i) * (3 + Math.random() * 5), y);
            }
            context.stroke();
        }

        drawSpeckle(context, w, h, ['#1a0f09', '#4a2d1b', '#7c5a37', '#2f2517'], 1200, 1, 4, 0.42);
        context.globalAlpha = 1;
    });
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

function createJungleSkyTexture(environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const isRainy = !environment.disableRain;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    if (isNight) {
        skyGradient.addColorStop(0, '#101a26');
        skyGradient.addColorStop(0.34, '#1b2a35');
        skyGradient.addColorStop(0.68, '#253c3a');
        skyGradient.addColorStop(1, '#173421');
    } else if (isRainy) {
        skyGradient.addColorStop(0, '#66797b');
        skyGradient.addColorStop(0.32, '#879794');
        skyGradient.addColorStop(0.64, '#a5afa0');
        skyGradient.addColorStop(1, '#4f7a52');
    } else {
        skyGradient.addColorStop(0, '#67b9d0');
        skyGradient.addColorStop(0.34, '#9bd0cf');
        skyGradient.addColorStop(0.68, '#c1d8bc');
        skyGradient.addColorStop(1, '#6aa05a');
    }
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (isRainy || isNight) {
        const stormBand = context.createLinearGradient(0, 0, 0, canvas.height * 0.58);
        stormBand.addColorStop(0, isNight ? 'rgba(4,9,16,0.64)' : 'rgba(42,53,55,0.56)');
        stormBand.addColorStop(0.38, isNight ? 'rgba(17,27,34,0.52)' : 'rgba(72,86,86,0.42)');
        stormBand.addColorStop(0.76, isNight ? 'rgba(42,58,58,0.24)' : 'rgba(116,132,126,0.2)');
        stormBand.addColorStop(1, 'rgba(128,150,142,0)');
        context.fillStyle = stormBand;
        context.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    }

    const drawRainCloud = (cx, cy, width, height, opacity, seed) => {
        context.save();
        context.filter = 'blur(18px)';
        for (let i = 0; i < 28; i++) {
            const t = i / 17;
            const x = cx + (t - 0.5) * width + Math.sin(seed + i * 1.7) * width * 0.08;
            const y = cy + Math.sin(t * Math.PI) * -height * 0.16 + Math.cos(seed * 0.7 + i) * height * 0.18;
            const rx = width * (0.07 + (Math.sin(seed + i * 2.1) * 0.5 + 0.5) * 0.08);
            const ry = height * (0.22 + (Math.cos(seed + i * 1.3) * 0.5 + 0.5) * 0.18);
            const cloud = context.createRadialGradient(x - rx * 0.2, y - ry * 0.35, 0, x, y, Math.max(rx, ry));
            cloud.addColorStop(0, `rgba(194,202,196,${opacity * 0.72})`);
            cloud.addColorStop(0.42, `rgba(91,103,101,${opacity * 0.62})`);
            cloud.addColorStop(0.82, `rgba(47,57,58,${opacity * 0.32})`);
            cloud.addColorStop(1, 'rgba(33,41,42,0)');
            context.fillStyle = cloud;
            context.beginPath();
            context.ellipse(x, y, rx, ry, Math.sin(seed + i) * 0.08, 0, Math.PI * 2);
            context.fill();
        }
        context.filter = 'none';
        context.restore();
    };

    if (isRainy || isNight) {
        const cloudStrength = isRainy ? 1 : 0.56;
        for (let x = -340; x < canvas.width + 420; x += 260) {
            drawRainCloud(x + 120, 116 + Math.sin(x * 0.01) * 20, 620, 190, 0.58 * cloudStrength, x * 0.03);
        }
        for (let x = -260; x < canvas.width + 320; x += 360) {
            drawRainCloud(x + 150, 288 + Math.cos(x * 0.008) * 22, 760, 150, 0.34 * cloudStrength, x * 0.019 + 9);
        }
    }

    context.save();
    context.filter = isRainy || isNight ? 'blur(26px)' : 'blur(16px)';
    const cloudSheetCount = isRainy || isNight ? 34 : 14;
    for (let i = 0; i < cloudSheetCount; i++) {
        const y = 26 + Math.random() * 390;
        const cloudSheet = context.createLinearGradient(0, y - 90, 0, y + 90);
        cloudSheet.addColorStop(0, 'rgba(28,36,38,0)');
        cloudSheet.addColorStop(0.5, isRainy || isNight
            ? `rgba(${42 + Math.floor(Math.random() * 28)},${52 + Math.floor(Math.random() * 30)},${54 + Math.floor(Math.random() * 28)},${0.05 + Math.random() * 0.13})`
            : `rgba(236,248,232,${0.035 + Math.random() * 0.045})`);
        cloudSheet.addColorStop(1, 'rgba(96,112,112,0)');
        context.fillStyle = cloudSheet;
        context.beginPath();
        context.ellipse(
            Math.random() * canvas.width,
            y,
            440 + Math.random() * 760,
            54 + Math.random() * 120,
            (Math.random() - 0.5) * 0.12,
            0,
            Math.PI * 2
        );
        context.fill();
    }
    context.restore();

    const canopyHaze = context.createLinearGradient(0, canvas.height * 0.44, 0, canvas.height);
    canopyHaze.addColorStop(0, 'rgba(116,143,133,0)');
    canopyHaze.addColorStop(0.45, isRainy || isNight ? 'rgba(112,141,120,0.26)' : 'rgba(158,190,135,0.16)');
    canopyHaze.addColorStop(1, isRainy || isNight ? 'rgba(47,88,51,0.52)' : 'rgba(91,143,71,0.32)');
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

function createTokyoSkyTexture(environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const isRainy = !environment.disableRain;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    if (isNight) {
        skyGradient.addColorStop(0, '#07101d');
        skyGradient.addColorStop(0.32, '#17253a');
        skyGradient.addColorStop(0.62, '#2e4052');
        skyGradient.addColorStop(1, '#111923');
    } else if (isRainy) {
        skyGradient.addColorStop(0, '#647681');
        skyGradient.addColorStop(0.38, '#87949b');
        skyGradient.addColorStop(0.68, '#a0a7a8');
        skyGradient.addColorStop(1, '#5e6870');
    } else {
        skyGradient.addColorStop(0, '#5da3d4');
        skyGradient.addColorStop(0.36, '#91bdd5');
        skyGradient.addColorStop(0.68, '#c0c8c7');
        skyGradient.addColorStop(1, '#727f88');
    }
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const glow = context.createRadialGradient(
        canvas.width * (isNight ? 0.72 : 0.22),
        canvas.height * (isNight ? 0.22 : 0.18),
        0,
        canvas.width * (isNight ? 0.72 : 0.22),
        canvas.height * (isNight ? 0.22 : 0.18),
        isNight ? 420 : 520
    );
    glow.addColorStop(0, isNight ? 'rgba(154,206,255,0.36)' : 'rgba(255,229,166,0.46)');
    glow.addColorStop(0.35, isNight ? 'rgba(66,124,202,0.16)' : 'rgba(255,211,135,0.16)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.filter = isRainy ? 'blur(18px)' : 'blur(11px)';
    for (let i = 0; i < (isRainy ? 28 : 16); i++) {
        const x = -220 + i * 120 + Math.sin(i * 1.77) * 82;
        const y = 85 + Math.cos(i * 0.91) * 58 + (isRainy ? 54 : 0);
        const cloud = context.createRadialGradient(x, y, 0, x, y, 240 + (i % 5) * 32);
        cloud.addColorStop(0, isRainy
            ? `rgba(74,86,94,${0.18 + (i % 4) * 0.035})`
            : `rgba(245,248,244,${0.08 + (i % 3) * 0.025})`);
        cloud.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = cloud;
        context.beginPath();
        context.ellipse(x, y, 300 + (i % 7) * 36, 46 + (i % 5) * 14, Math.sin(i) * 0.08, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();

    const haze = context.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
    haze.addColorStop(0, 'rgba(255,255,255,0)');
    haze.addColorStop(0.46, isNight ? 'rgba(51,82,112,0.18)' : 'rgba(207,218,214,0.2)');
    haze.addColorStop(1, isNight ? 'rgba(8,14,21,0.28)' : 'rgba(104,116,122,0.18)');
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

function createTokyoFacadeTexture(variant = 0, environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const basePalettes = [
        ['#1d2932', '#52626b'],
        ['#25272d', '#5f6269'],
        ['#182635', '#48627a'],
        ['#302c32', '#74656b'],
        ['#202b2d', '#566a67'],
        ['#2a3039', '#68737f']
    ];
    const palette = basePalettes[variant % basePalettes.length];
    const base = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    base.addColorStop(0, palette[1]);
    base.addColorStop(0.42, palette[0]);
    base.addColorStop(1, '#111820');
    context.fillStyle = base;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.globalAlpha = 0.22;
    context.fillStyle = '#d7eef5';
    for (let x = 24; x < canvas.width; x += 54) {
        context.fillRect(x, 0, 2, canvas.height);
    }
    for (let y = 42; y < canvas.height; y += 78) {
        context.fillRect(0, y, canvas.width, 2);
    }
    context.globalAlpha = 1;

    const windowColors = isNight
        ? ['#ffe19a', '#99efff', '#ff8fd1', '#d7f3ff', '#f6f0cb']
        : ['#bad8e8', '#d8edf4', '#9bb7c4', '#f0ead0'];
    for (let y = 48; y < canvas.height - 38; y += 52) {
        for (let x = 34; x < canvas.width - 30; x += 44) {
            const lit = Math.sin((x + 17) * 0.19 + (y + variant * 23) * 0.11) > (isNight ? -0.26 : 0.34);
            context.globalAlpha = lit ? (isNight ? 0.82 : 0.48) : 0.13;
            context.fillStyle = lit
                ? windowColors[(Math.floor(x / 44) + Math.floor(y / 52) + variant) % windowColors.length]
                : '#14202a';
            context.fillRect(x, y, 15 + ((x + y + variant) % 3) * 4, 18);
        }
    }
    context.globalAlpha = 1;

    if (variant % 2 === 0) {
        const accent = ['#ff4ea1', '#34d5ff', '#ffe15c', '#ff5b49'][variant % 4];
        context.fillStyle = accent;
        context.globalAlpha = isNight ? 0.8 : 0.42;
        context.fillRect(canvas.width * 0.68, 0, 18, canvas.height);
        context.globalAlpha = 1;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function createTokyoSkylineTexture(variant = 0, environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const skylineColor = isNight
        ? ['rgba(5,10,18,0.96)', 'rgba(11,19,30,0.9)', 'rgba(18,29,42,0.82)'][variant % 3]
        : ['rgba(52,65,73,0.9)', 'rgba(70,83,91,0.82)', 'rgba(91,105,111,0.72)'][variant % 3];
    let x = -30;
    while (x < canvas.width + 40) {
        const seed = Math.sin((x + 31 * variant) * 0.083) * 0.5 + 0.5;
        const width = 28 + seed * 82;
        const height = 95 + (Math.cos((x + variant * 47) * 0.037) * 0.5 + 0.5) * (variant % 2 ? 270 : 390);
        context.fillStyle = skylineColor;
        context.fillRect(x, canvas.height - height, width, height);
        if (width > 58) {
            context.fillRect(x + width * 0.18, canvas.height - height - 18, width * 0.2, 20);
            context.fillRect(x + width * 0.62, canvas.height - height - 26, width * 0.12, 30);
        }

        context.globalAlpha = isNight ? 0.54 : 0.16;
        context.fillStyle = isNight
            ? ['#ffe08c', '#71e9ff', '#ff7ac5'][Math.floor(seed * 9) % 3]
            : '#d8edf3';
        for (let wx = x + 8; wx < x + width - 8; wx += 16) {
            for (let wy = canvas.height - height + 18; wy < canvas.height - 16; wy += 27) {
                if (Math.sin(wx * 0.17 + wy * 0.13 + variant * 2.1) > (isNight ? -0.18 : 0.42)) {
                    context.fillRect(wx, wy, 5, 8);
                }
            }
        }
        context.globalAlpha = 1;
        x += width + 5 + seed * 8;
    }

    const fade = context.createLinearGradient(0, 0, 0, canvas.height);
    fade.addColorStop(0, 'rgba(255,255,255,0)');
    fade.addColorStop(0.72, isNight ? 'rgba(33,57,82,0.12)' : 'rgba(170,190,196,0.1)');
    fade.addColorStop(1, isNight ? 'rgba(1,4,8,0.26)' : 'rgba(63,72,76,0.18)');
    context.fillStyle = fade;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    if (THREE.sRGBEncoding) {
        texture.encoding = THREE.sRGBEncoding;
    }
    return texture;
}

function createDesertSkyTexture(environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const isRainy = !environment.disableRain;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    if (isNight) {
        skyGradient.addColorStop(0, '#071327');
        skyGradient.addColorStop(0.42, '#1c2940');
        skyGradient.addColorStop(0.74, '#4c342a');
        skyGradient.addColorStop(1, '#1b100d');
    } else if (isRainy) {
        skyGradient.addColorStop(0, '#8c9aa0');
        skyGradient.addColorStop(0.4, '#c0b09a');
        skyGradient.addColorStop(0.72, '#d19152');
        skyGradient.addColorStop(1, '#a76434');
    } else {
        skyGradient.addColorStop(0, '#4f95c6');
        skyGradient.addColorStop(0.38, '#8fb7ce');
        skyGradient.addColorStop(0.68, '#e6b26b');
        skyGradient.addColorStop(1, '#b86836');
    }
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const sunX = canvas.width * 0.2;
    const sunY = canvas.height * 0.42;
    const sunGlow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, isNight ? 300 : 520);
    sunGlow.addColorStop(0, isNight ? 'rgba(255,217,146,0.2)' : 'rgba(255,237,178,0.92)');
    sunGlow.addColorStop(0.22, isNight ? 'rgba(255,162,84,0.1)' : 'rgba(255,193,103,0.34)');
    sunGlow.addColorStop(1, 'rgba(255,180,90,0)');
    context.fillStyle = sunGlow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (!isNight) {
        context.fillStyle = 'rgba(255,242,192,0.84)';
        context.beginPath();
        context.arc(sunX, sunY, 40, 0, Math.PI * 2);
        context.fill();
    }

    context.save();
    context.filter = isRainy ? 'blur(18px)' : 'blur(8px)';
    for (let i = 0; i < 18; i++) {
        const y = canvas.height * (0.18 + i * 0.026);
        const x = -220 + i * 145 + Math.sin(i * 1.4) * 80;
        const cloud = context.createLinearGradient(x, y, x + 420, y + 40);
        cloud.addColorStop(0, 'rgba(255,238,204,0)');
        cloud.addColorStop(0.5, isRainy ? 'rgba(92,82,78,0.18)' : 'rgba(255,235,199,0.22)');
        cloud.addColorStop(1, 'rgba(255,238,204,0)');
        context.fillStyle = cloud;
        context.beginPath();
        context.ellipse(x, y, 240 + (i % 5) * 40, 18 + (i % 3) * 6, Math.sin(i) * 0.08, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();

    const drawMesaLayer = (baseY, color, alpha, seedOffset, heightScale) => {
        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, canvas.height);
        context.lineTo(0, baseY);
        let x = -90;
        while (x < canvas.width + 120) {
            const seed = Math.sin((x + seedOffset) * 0.017) * 0.5 + 0.5;
            const plateauWidth = 82 + seed * 240;
            const height = (52 + seed * 116) * heightScale;
            context.lineTo(x, baseY - height * 0.18);
            context.lineTo(x + plateauWidth * 0.16, baseY - height);
            context.lineTo(x + plateauWidth * 0.76, baseY - height * (0.88 + seed * 0.1));
            context.lineTo(x + plateauWidth, baseY - height * 0.22);
            x += plateauWidth + 46 + seed * 70;
        }
        context.lineTo(canvas.width, canvas.height);
        context.closePath();
        context.fill();
        context.globalAlpha = 1;
    };

    drawMesaLayer(canvas.height * 0.74, isNight ? '#171a22' : '#8b4d33', 0.32, 13, 0.56);
    drawMesaLayer(canvas.height * 0.84, isNight ? '#0d1017' : '#6f3826', 0.6, 91, 0.82);

    const dust = context.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
    dust.addColorStop(0, 'rgba(255,226,164,0)');
    dust.addColorStop(0.55, isNight ? 'rgba(113,65,41,0.22)' : 'rgba(244,186,105,0.34)');
    dust.addColorStop(1, isNight ? 'rgba(30,14,11,0.48)' : 'rgba(170,88,42,0.4)');
    context.fillStyle = dust;
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

function createHighlandSkyTexture(environment = {}) {
    const isNight = Boolean(environment.nightRace);
    const isRainy = !environment.disableRain;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    if (isNight) {
        skyGradient.addColorStop(0, '#07111c');
        skyGradient.addColorStop(0.44, '#1e3441');
        skyGradient.addColorStop(0.72, '#33443e');
        skyGradient.addColorStop(1, '#1b241d');
    } else if (isRainy) {
        skyGradient.addColorStop(0, '#728895');
        skyGradient.addColorStop(0.42, '#a4b4b9');
        skyGradient.addColorStop(0.72, '#c0c6bd');
        skyGradient.addColorStop(1, '#789064');
    } else {
        skyGradient.addColorStop(0, '#5f95c9');
        skyGradient.addColorStop(0.42, '#98b9d6');
        skyGradient.addColorStop(0.72, '#d8d8c8');
        skyGradient.addColorStop(1, '#7fa35a');
    }
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const sunX = canvas.width * 0.36;
    const sunY = canvas.height * 0.42;
    const sunGlow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, 480);
    sunGlow.addColorStop(0, isNight ? 'rgba(160,205,255,0.12)' : 'rgba(255,245,190,0.58)');
    sunGlow.addColorStop(0.38, isNight ? 'rgba(103,133,160,0.08)' : 'rgba(255,236,174,0.16)');
    sunGlow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = sunGlow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    function drawOvercastLayer(y, height, opacity, seedOffset, dark = false) {
        context.save();
        context.globalAlpha = opacity;
        context.filter = `blur(${dark ? 34 : 24}px)`;
        const band = context.createLinearGradient(0, y - height * 0.35, 0, y + height * 1.15);
        if (dark) {
            band.addColorStop(0, isNight ? 'rgba(12,22,30,0)' : 'rgba(42,57,63,0)');
            band.addColorStop(0.38, isNight ? 'rgba(21,34,43,0.62)' : 'rgba(56,72,78,0.38)');
            band.addColorStop(0.72, isNight ? 'rgba(9,17,24,0.45)' : 'rgba(39,52,58,0.32)');
            band.addColorStop(1, 'rgba(30,42,48,0)');
        } else {
            band.addColorStop(0, 'rgba(240,244,240,0)');
            band.addColorStop(0.42, isNight ? 'rgba(134,158,166,0.22)' : 'rgba(224,230,224,0.42)');
            band.addColorStop(0.74, isNight ? 'rgba(94,118,128,0.16)' : 'rgba(206,214,210,0.28)');
            band.addColorStop(1, 'rgba(240,244,240,0)');
        }
        context.fillStyle = band;
        context.beginPath();
        context.moveTo(-80, y);
        for (let x = -80; x <= canvas.width + 80; x += 120) {
            const wave = Math.sin(x * 0.006 + seedOffset) * height * 0.18
                + Math.sin(x * 0.017 + seedOffset * 0.7) * height * 0.08;
            context.lineTo(x, y + wave);
        }
        for (let x = canvas.width + 80; x >= -80; x -= 120) {
            const wave = Math.sin(x * 0.005 + seedOffset + 2.1) * height * 0.14
                + Math.sin(x * 0.014 + seedOffset) * height * 0.1;
            context.lineTo(x, y + height + wave);
        }
        context.closePath();
        context.fill();
        context.restore();
    }

    drawOvercastLayer(canvas.height * 0.12, canvas.height * 0.19, isRainy ? 0.72 : 0.42, 1.2, true);
    drawOvercastLayer(canvas.height * 0.2, canvas.height * 0.18, isRainy ? 0.58 : 0.36, 4.6, false);
    drawOvercastLayer(canvas.height * 0.31, canvas.height * 0.16, isRainy ? 0.45 : 0.24, 8.4, true);
    drawOvercastLayer(canvas.height * 0.43, canvas.height * 0.14, isRainy ? 0.28 : 0.16, 12.1, false);

    const mist = context.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
    mist.addColorStop(0, 'rgba(255,255,255,0)');
    mist.addColorStop(0.54, isNight ? 'rgba(70,91,92,0.16)' : 'rgba(224,230,220,0.24)');
    mist.addColorStop(1, isNight ? 'rgba(15,22,19,0.28)' : 'rgba(110,130,100,0.14)');
    context.fillStyle = mist;
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

function createRoadTexture(environment, segmentCount) {
    const approximateRoadLength = segmentCount * 10;
    const repeatY = Number.isFinite(environment.roadTextureRepeatY)
        ? environment.roadTextureRepeatY
        : Number.isFinite(environment.roadTextureMetersPerTile)
            ? Math.max(1, approximateRoadLength / environment.roadTextureMetersPerTile)
        : environment.roadStyle === 'mud-road'
            ? Math.max(7, segmentCount / 28)
            : Math.max(24, segmentCount / 8);
    const palette = {
        'sun-baked-asphalt': {
            base: '#62564c',
            flecks: ['#76685b', '#443a33', '#92816b', '#c19a63'],
            line: '#f4d882',
            edge: '#f2ead6'
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
        'highland-asphalt': {
            base: '#30373a',
            flecks: ['#4d5759', '#1b2022', '#6c7472', '#82908a'],
            line: '#f1f3ea',
            edge: '#f9faf3'
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

    const drawRoadMarkings = (context, width, height) => {
        context.save();
        if (environment.roadStyle === 'sun-baked-asphalt') {
            context.globalAlpha = 0.74;
        } else if (environment.roadStyle === 'highland-asphalt') {
            context.globalAlpha = 0.9;
        }
        if (palette.edge) {
            context.fillStyle = palette.edge;
            const edgeWidth = environment.roadStyle === 'sun-baked-asphalt' || environment.roadStyle === 'highland-asphalt' ? 7 : 10;
            context.fillRect(34, 0, edgeWidth, height);
            context.fillRect(width - 34 - edgeWidth, 0, edgeWidth, height);
        }

        if (!palette.line) {
            context.restore();
            return;
        }

        context.fillStyle = palette.line;
        const dashHeight = environment.roadStyle === 'city-asphalt' ? 74 : environment.roadStyle === 'sun-baked-asphalt' ? 96 : environment.roadStyle === 'highland-asphalt' ? 78 : 86;
        const dashGap = environment.roadStyle === 'city-asphalt' ? 74 : environment.roadStyle === 'sun-baked-asphalt' ? 110 : environment.roadStyle === 'highland-asphalt' ? 104 : 86;
        const dashWidth = environment.roadStyle === 'city-asphalt' ? 8 : environment.roadStyle === 'sun-baked-asphalt' || environment.roadStyle === 'highland-asphalt' ? 7 : 10;
        for (let y = 24; y < height; y += dashHeight + dashGap) {
            context.fillRect(width / 2 - dashWidth / 2, y, dashWidth, dashHeight);
        }

        if (environment.roadStyle === 'city-asphalt') {
            context.fillStyle = 'rgba(248,248,242,0.78)';
            [width * 0.33, width * 0.67].forEach(laneX => {
                for (let y = 38; y < height; y += 108) {
                    context.fillRect(laneX - 2, y, 4, 52);
                }
            });
        }
        context.restore();
    };

    const finishCityAsphalt = (context, width, height) => {
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = 'rgba(24, 29, 34, 0.46)';
        context.fillRect(0, 0, width, height);

        const centerWear = context.createLinearGradient(0, 0, width, 0);
        centerWear.addColorStop(0, 'rgba(0,0,0,0)');
        centerWear.addColorStop(0.18, 'rgba(8,11,14,0.32)');
        centerWear.addColorStop(0.5, 'rgba(60,67,72,0.1)');
        centerWear.addColorStop(0.82, 'rgba(8,11,14,0.32)');
        centerWear.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = centerWear;
        context.fillRect(0, 0, width, height);

        context.globalAlpha = 0.2;
        context.strokeStyle = '#10151a';
        context.lineWidth = 18;
        [width * 0.28, width * 0.72].forEach((tireX, index) => {
            context.beginPath();
            for (let y = -24; y <= height + 24; y += 42) {
                const wobble = Math.sin(y * 0.011 + index * 2.3) * 4.5;
                if (y <= -24) {
                    context.moveTo(tireX + wobble, y);
                } else {
                    context.lineTo(tireX + wobble, y);
                }
            }
            context.stroke();
        });
        context.globalAlpha = 1;
        drawRoadMarkings(context, width, height);
        context.restore();
    };

    const finishDesertAsphalt = (context, width, height) => {
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = 'rgba(96, 78, 58, 0.14)';
        context.fillRect(0, 0, width, height);

        const centerWear = context.createLinearGradient(0, 0, width, 0);
        centerWear.addColorStop(0, 'rgba(0,0,0,0)');
        centerWear.addColorStop(0.23, 'rgba(57,46,39,0.16)');
        centerWear.addColorStop(0.5, 'rgba(117,102,86,0.08)');
        centerWear.addColorStop(0.77, 'rgba(57,46,39,0.16)');
        centerWear.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = centerWear;
        context.fillRect(0, 0, width, height);

        context.globalAlpha = 0.14;
        context.strokeStyle = '#2e2925';
        context.lineWidth = 13;
        [width * 0.31, width * 0.69].forEach((tireX, index) => {
            context.beginPath();
            for (let y = -28; y <= height + 28; y += 44) {
                const wobble = Math.sin(y * 0.01 + index * 2.4) * 3.5 + Math.sin(y * 0.031) * 1.4;
                if (y <= -28) {
                    context.moveTo(tireX + wobble, y);
                } else {
                    context.lineTo(tireX + wobble, y);
                }
            }
            context.stroke();
        });

        context.globalAlpha = 0.18;
        context.strokeStyle = '#322b25';
        context.lineWidth = 1.5;
        for (let i = 0; i < 24; i++) {
            const x = width * (0.16 + Math.random() * 0.68);
            const y = Math.random() * height;
            context.beginPath();
            context.moveTo(x, y);
            context.bezierCurveTo(
                x + 16 + Math.random() * 24,
                y + (Math.random() - 0.5) * 20,
                x + 48 + Math.random() * 30,
                y + (Math.random() - 0.5) * 32,
                x + 80 + Math.random() * 38,
                y + (Math.random() - 0.5) * 22
            );
            context.stroke();
        }

        context.globalAlpha = 1;
        drawRoadMarkings(context, width, height);

        const sandEdge = context.createLinearGradient(0, 0, width, 0);
        sandEdge.addColorStop(0, 'rgba(216,164,92,0.3)');
        sandEdge.addColorStop(0.11, 'rgba(216,164,92,0.12)');
        sandEdge.addColorStop(0.22, 'rgba(216,164,92,0)');
        sandEdge.addColorStop(0.78, 'rgba(216,164,92,0)');
        sandEdge.addColorStop(0.89, 'rgba(216,164,92,0.13)');
        sandEdge.addColorStop(1, 'rgba(216,164,92,0.32)');
        context.fillStyle = sandEdge;
        context.fillRect(0, 0, width, height);
        context.restore();
    };

    const texture = createCanvasTexture(512, 1024, 1, repeatY, (context, width, height) => {
        context.fillStyle = palette.base;
        context.fillRect(0, 0, width, height);

        if (environment.roadStyle === 'mud-road') {
            const mudBase = context.createLinearGradient(0, 0, width, 0);
            mudBase.addColorStop(0, '#2c2117');
            mudBase.addColorStop(0.18, '#5b442b');
            mudBase.addColorStop(0.48, '#3c2a1d');
            mudBase.addColorStop(0.82, '#604a30');
            mudBase.addColorStop(1, '#2b1e15');
            context.fillStyle = mudBase;
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, palette.flecks, 6200, 1, 5, 0.42);
            context.globalAlpha = 0.26;
            palette.flecks.forEach((color, colorIndex) => {
                context.fillStyle = color;
                for (let i = 0; i < 360; i++) {
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

            context.globalAlpha = 0.42;
            context.strokeStyle = '#1c120c';
            context.lineWidth = 11;
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

            context.globalAlpha = 0.18;
            context.strokeStyle = '#8c714b';
            context.lineWidth = 3.2;
            [width * 0.25, width * 0.75].forEach((rutX, rutIndex) => {
                context.beginPath();
                for (let y = -20; y <= height + 20; y += 32) {
                    const wobble = Math.sin(y * 0.016 + rutIndex * 2.7) * 9 + Math.sin(y * 0.05) * 2;
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

            context.globalAlpha = 0.28;
            for (let i = 0; i < 34; i++) {
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

        if (environment.roadStyle === 'sun-baked-asphalt') {
            const sunBase = context.createLinearGradient(0, 0, width, 0);
            sunBase.addColorStop(0, '#4a4038');
            sunBase.addColorStop(0.2, '#706255');
            sunBase.addColorStop(0.5, '#6a5e54');
            sunBase.addColorStop(0.8, '#756653');
            sunBase.addColorStop(1, '#4b4138');
            context.fillStyle = sunBase;
            context.fillRect(0, 0, width, height);

            drawSpeckle(context, width, height, palette.flecks, 2600, 1, 3, 0.24);

            context.globalAlpha = 0.24;
            context.strokeStyle = '#2f2925';
            context.lineWidth = 16;
            [width * 0.31, width * 0.69].forEach((tireX, index) => {
                context.beginPath();
                for (let y = -32; y <= height + 32; y += 44) {
                    const wobble = Math.sin(y * 0.01 + index * 2.4) * 4.2 + Math.sin(y * 0.031) * 1.6;
                    if (y <= -32) {
                        context.moveTo(tireX + wobble, y);
                    } else {
                        context.lineTo(tireX + wobble, y);
                    }
                }
                context.stroke();
            });

            context.globalAlpha = 0.32;
            context.strokeStyle = '#241f1c';
            context.lineWidth = 2.2;
            for (let i = 0; i < 32; i++) {
                const x = width * (0.16 + Math.random() * 0.68);
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(x, y);
                context.bezierCurveTo(
                    x + 12 + Math.random() * 28,
                    y + (Math.random() - 0.5) * 24,
                    x + 46 + Math.random() * 34,
                    y + (Math.random() - 0.5) * 40,
                    x + 78 + Math.random() * 44,
                    y + (Math.random() - 0.5) * 26
                );
                context.stroke();
            }

            context.globalAlpha = 1;
            drawRoadMarkings(context, width, height);

            const sandEdge = context.createLinearGradient(0, 0, width, 0);
            sandEdge.addColorStop(0, 'rgba(216,164,92,0.42)');
            sandEdge.addColorStop(0.1, 'rgba(216,164,92,0.18)');
            sandEdge.addColorStop(0.22, 'rgba(216,164,92,0)');
            sandEdge.addColorStop(0.78, 'rgba(216,164,92,0)');
            sandEdge.addColorStop(0.9, 'rgba(216,164,92,0.2)');
            sandEdge.addColorStop(1, 'rgba(216,164,92,0.44)');
            context.fillStyle = sandEdge;
            context.fillRect(0, 0, width, height);

            context.globalAlpha = 0.2;
            drawWavyLines(context, width, height, '#d4a365', 12, 0.1);
            context.globalAlpha = 1;
            return;
        }

        if (environment.roadStyle === 'highland-asphalt') {
            const highlandBase = context.createLinearGradient(0, 0, width, 0);
            highlandBase.addColorStop(0, '#1f2527');
            highlandBase.addColorStop(0.17, '#353d3f');
            highlandBase.addColorStop(0.5, '#30373a');
            highlandBase.addColorStop(0.83, '#394143');
            highlandBase.addColorStop(1, '#1d2325');
            context.fillStyle = highlandBase;
            context.fillRect(0, 0, width, height);

            drawSpeckle(context, width, height, palette.flecks, 2600, 1, 2, 0.18);

            context.globalAlpha = 0.18;
            context.strokeStyle = '#111518';
            context.lineWidth = 12;
            [width * 0.3, width * 0.7].forEach((tireX, index) => {
                context.beginPath();
                for (let y = -24; y <= height + 24; y += 40) {
                    const wobble = Math.sin(y * 0.012 + index * 2.7) * 2.8 + Math.sin(y * 0.033) * 1.2;
                    if (y <= -24) {
                        context.moveTo(tireX + wobble, y);
                    } else {
                        context.lineTo(tireX + wobble, y);
                    }
                }
                context.stroke();
            });

            context.globalAlpha = 0.2;
            context.strokeStyle = '#0f1315';
            context.lineWidth = 1.6;
            for (let i = 0; i < 18; i++) {
                const x = width * (0.14 + Math.random() * 0.72);
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(x, y);
                context.bezierCurveTo(
                    x + 12 + Math.random() * 24,
                    y + (Math.random() - 0.5) * 18,
                    x + 38 + Math.random() * 28,
                    y + (Math.random() - 0.5) * 26,
                    x + 66 + Math.random() * 34,
                    y + (Math.random() - 0.5) * 18
                );
                context.stroke();
            }

            context.globalAlpha = 1;
            drawRoadMarkings(context, width, height);

            const wetEdge = context.createLinearGradient(0, 0, width, 0);
            wetEdge.addColorStop(0, 'rgba(121,144,119,0.24)');
            wetEdge.addColorStop(0.13, 'rgba(121,144,119,0.08)');
            wetEdge.addColorStop(0.28, 'rgba(121,144,119,0)');
            wetEdge.addColorStop(0.72, 'rgba(121,144,119,0)');
            wetEdge.addColorStop(0.87, 'rgba(121,144,119,0.08)');
            wetEdge.addColorStop(1, 'rgba(121,144,119,0.24)');
            context.fillStyle = wetEdge;
            context.fillRect(0, 0, width, height);
            return;
        }

        if (environment.roadStyle === 'city-asphalt') {
            drawSpeckle(context, width, height, palette.flecks, 1600, 1, 2, 0.22);
        } else {
            drawSpeckle(context, width, height, palette.flecks, 5500, 1, 4, 0.75);
        }

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

        drawRoadMarkings(context, width, height);

    });

    if (environment.roadStyle === 'mud-road') {
        const mudTextureUrl = environment.terrainStyle === 'rainforest'
            ? 'assets/textures/jungle_road_mud_custom.png'
            : 'assets/textures/polyhaven/mud_forest_diff_1k.jpg';
        return loadImageIntoTexture(texture, mudTextureUrl);
    }

    if (environment.roadStyle === 'city-asphalt') {
        return loadImageIntoTexture(texture, 'assets/textures/tokyo_asphalt_texture.png', {
            drawToCanvas: true,
            reuseTextureCanvas: true,
            width: 512,
            height: 1024,
            smoothDownscale: true,
            downscaleFactor: 0.42,
            afterDraw: finishCityAsphalt
        });
    }

    if (environment.roadStyle === 'sun-baked-asphalt') {
        return loadImageIntoTexture(texture, 'assets/textures/desert_asphalt_texture.png', {
            drawToCanvas: true,
            reuseTextureCanvas: true,
            width: 512,
            height: 1024,
            smoothDownscale: true,
            downscaleFactor: 0.56,
            afterDraw: finishDesertAsphalt
        });
    }

    return texture;
}

function createJungleMudNormalTexture(segmentCount, environment = {}) {
    const approximateRoadLength = segmentCount * 10;
    const repeatY = Number.isFinite(environment.roadTextureRepeatY)
        ? environment.roadTextureRepeatY
        : Number.isFinite(environment.roadTextureMetersPerTile)
            ? Math.max(1, approximateRoadLength / environment.roadTextureMetersPerTile)
        : Math.max(7, segmentCount / 28);
    const texture = createCanvasTexture(512, 1024, 1, repeatY, (context, width, height) => {
        context.fillStyle = '#8080ff';
        context.fillRect(0, 0, width, height);
        context.globalAlpha = 0.42;
        context.strokeStyle = '#5f64cf';
        context.lineWidth = 9;
        [width * 0.28, width * 0.72].forEach((rutX, rutIndex) => {
            context.beginPath();
            for (let y = -20; y <= height + 20; y += 24) {
                const wobble = Math.sin(y * 0.018 + rutIndex * 3.1) * 8 + Math.sin(y * 0.047) * 2.4;
                if (y <= -20) {
                    context.moveTo(rutX + wobble, y);
                } else {
                    context.lineTo(rutX + wobble, y);
                }
            }
            context.stroke();
        });
        context.globalAlpha = 0.22;
        drawSpeckle(context, width, height, ['#6b70db', '#9aa0ff', '#777ce8', '#555ac6'], 3600, 1, 4, 0.62);
        context.globalAlpha = 1;
    });
    return loadImageIntoTexture(texture, 'assets/textures/polyhaven/mud_forest_nor_gl_1k.jpg');
}

function createTerrainTexture(environment, segmentCount, terrainWidth = 300) {
    const approximateRoadLength = segmentCount * 10;
    const repeatY = Number.isFinite(environment.terrainTextureMetersPerTile)
        ? Math.max(1, approximateRoadLength / environment.terrainTextureMetersPerTile)
        : Math.max(24, segmentCount / 7);

    if (environment.terrainStyle === 'sand') {
        const terrainRepeatX = Number.isFinite(environment.terrainTextureRepeatX)
            ? environment.terrainTextureRepeatX
            : Number.isFinite(environment.terrainTextureLateralMetersPerTile)
                ? Math.max(1, terrainWidth / environment.terrainTextureLateralMetersPerTile)
                : 2.2;
        const texture = createCanvasTexture(1024, 1024, terrainRepeatX, repeatY, (context, width, height) => {
            const base = context.createLinearGradient(0, 0, width, height);
            base.addColorStop(0, '#d7a766');
            base.addColorStop(0.42, '#c98b49');
            base.addColorStop(1, '#a9683c');
            context.fillStyle = base;
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#e7bd79', '#b8743f', '#8d5032', '#f0d391', '#c48042'], 5600, 1, 4, 0.28);
            context.globalAlpha = 1;
        });
        const mirroredWrap = THREE.MirroredRepeatWrapping || THREE.RepeatWrapping;
        texture.wrapS = mirroredWrap;
        texture.wrapT = mirroredWrap;

        if (environment.terrainTextureUrl) {
            return loadImageIntoTexture(texture, environment.terrainTextureUrl, {
                drawToCanvas: true,
                width: 1024,
                height: 1024,
                smoothDownscale: true,
                downscaleFactor: 0.72,
                anisotropy: 8
            });
        }

        return texture;
    }

    if (environment.terrainStyle === 'highland') {
        const terrainRepeatX = Number.isFinite(environment.terrainTextureRepeatX)
            ? environment.terrainTextureRepeatX
            : Number.isFinite(environment.terrainTextureLateralMetersPerTile)
                ? Math.max(1, terrainWidth / environment.terrainTextureLateralMetersPerTile)
                : 2.6;
        const texture = createCanvasTexture(1024, 1024, terrainRepeatX, repeatY, (context, width, height) => {
            const base = context.createLinearGradient(0, 0, width, height);
            base.addColorStop(0, '#6f8f45');
            base.addColorStop(0.32, '#4f7139');
            base.addColorStop(0.58, '#7a6c3f');
            base.addColorStop(0.82, '#5e4932');
            base.addColorStop(1, '#31452f');
            context.fillStyle = base;
            context.fillRect(0, 0, width, height);

            drawSpeckle(context, width, height, ['#7fab4e', '#34562e', '#96b75e', '#4d6b36', '#6d5835'], 9800, 1, 4, 0.5);
            drawGrassStrokes(context, width, height, ['#8fb65b', '#547c3b', '#b5bf62', '#3e5f33'], 2600);

            context.globalAlpha = 0.34;
            for (let i = 0; i < 72; i++) {
                const y = Math.random() * height;
                const bandHeight = 8 + Math.random() * 26;
                const x = Math.random() * width;
                const bandWidth = 120 + Math.random() * 340;
                context.fillStyle = ['#6b3d2e', '#7a4e32', '#8a6a38', '#5e3f51'][i % 4];
                context.beginPath();
                context.ellipse(x, y, bandWidth, bandHeight, (Math.random() - 0.5) * 0.22, 0, Math.PI * 2);
                context.fill();
            }

            context.globalAlpha = 0.24;
            context.strokeStyle = '#4b5148';
            context.lineWidth = 5;
            for (let i = 0; i < 44; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(x, y);
                context.bezierCurveTo(
                    x + 52 + Math.random() * 110,
                    y - 22 - Math.random() * 42,
                    x + 150 + Math.random() * 140,
                    y + 16 + Math.random() * 54,
                    x + 260 + Math.random() * 180,
                    y + (Math.random() - 0.5) * 80
                );
                context.stroke();
            }

            context.globalAlpha = 0.22;
            drawSpeckle(context, width, height, ['#a99f82', '#74756a', '#c3bda0', '#55584f'], 2200, 1, 3, 0.42);
            context.globalAlpha = 1;
        });
        const mirroredWrap = THREE.MirroredRepeatWrapping || THREE.RepeatWrapping;
        texture.wrapS = mirroredWrap;
        texture.wrapT = mirroredWrap;
        return texture;
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
            context.fillStyle = '#46525b';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#7d8b92', '#313b43', '#222a31', '#9da8ad', '#59656d'], 8600, 1, 5, 0.7);
            context.globalAlpha = 0.2;
            context.fillStyle = '#273139';
            for (let i = 0; i < 42; i++) {
                const blockX = Math.floor(Math.random() * 10) * 52 + Math.random() * 10;
                const blockY = Math.floor(Math.random() * 9) * 58 + Math.random() * 10;
                context.fillRect(blockX, blockY, 28 + Math.random() * 42, 20 + Math.random() * 34);
            }
            context.globalAlpha = 0.28;
            context.strokeStyle = '#151d23';
            context.lineWidth = 2.2;
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
            context.globalAlpha = 0.16;
            context.strokeStyle = '#d5dde0';
            context.lineWidth = 1;
            for (let i = 0; i < 34; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + 18 + Math.random() * 52, y + (Math.random() - 0.5) * 12);
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
        const terrainRepeatX = Number.isFinite(environment.terrainTextureRepeatX)
            ? environment.terrainTextureRepeatX
            : isRainforest && Number.isFinite(environment.terrainTextureLateralMetersPerTile)
                ? Math.max(1, terrainWidth / environment.terrainTextureLateralMetersPerTile)
                : isRainforest ? 5 : 8;
        const terrainRepeatY = repeatY;
        const texture = createCanvasTexture(512, 512, terrainRepeatX, terrainRepeatY, (context, width, height) => {
            context.fillStyle = isRainforest ? '#426d42' : '#082118';
            context.fillRect(0, 0, width, height);
            drawSpeckle(
                context,
                width,
                height,
                isRainforest
                    ? ['#4f7d45', '#386138', '#5f884e', '#345332', '#6b7250']
                    : ['#155437', '#03100c', '#23824e', '#0a3528'],
                isRainforest ? 13500 : 9200,
                1,
                isRainforest ? 3 : 7,
                isRainforest ? 0.34 : 0.9
            );
            if (isRainforest) {
                drawSpeckle(context, width, height, ['#45683a', '#55794a', '#314d31', '#69754e'], 4600, 2, 5, 0.22);
            } else {
                drawGrassStrokes(context, width, height, ['#1d7844', '#0e5933', '#35a15d', '#061c15'], 3000);
                drawWavyLines(context, width, height, '#02090d', 26, 0.2);
            }
        });

        if (isRainforest && environment.terrainTextureUrl) {
            return loadImageIntoTexture(texture, environment.terrainTextureUrl, {
                drawToCanvas: true,
                width: 1024,
                height: 1024,
                anisotropy: 8
            });
        }

        return texture;
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
            const shoulderBase = context.createLinearGradient(0, 0, width, 0);
            shoulderBase.addColorStop(0, '#8e5936');
            shoulderBase.addColorStop(0.45, '#c8894d');
            shoulderBase.addColorStop(1, '#dfb06c');
            context.fillStyle = shoulderBase;
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#d9a35d', '#7f4c32', '#f2c77d', '#5e3929', '#bd7541'], 5200, 1, 5, 0.78);
            drawWavyLines(context, width, height, '#6f3e2a', 18, 0.14);
            context.globalAlpha = 0.32;
            drawWavyLines(context, width, height, '#f3c77a', 10, 0.12);
            context.globalAlpha = 1;
        });
    }

    if (environment.shoulderStyle === 'snow-gravel') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            context.fillStyle = '#b7c8c9';
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#f5ffff', '#82939a', '#58646a', '#d3e8eb'], 4000, 1, 5, 0.76);
        });
    }

    if (environment.shoulderStyle === 'moor-gravel') {
        return createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
            const base = context.createLinearGradient(0, 0, width, 0);
            base.addColorStop(0, '#28331f');
            base.addColorStop(0.42, '#4d5f36');
            base.addColorStop(0.72, '#6b623b');
            base.addColorStop(1, '#2f251d');
            context.fillStyle = base;
            context.fillRect(0, 0, width, height);
            drawSpeckle(context, width, height, ['#7c8b4d', '#2c3f24', '#8a643f', '#a59c72', '#1b2419'], 5600, 1, 5, 0.76);
            drawGrassStrokes(context, width, height, ['#8ca85d', '#526d3c', '#a58a51', '#33482a'], 1200);
            context.globalAlpha = 0.22;
            drawWavyLines(context, width, height, '#2a2019', 16, 0.2);
            context.globalAlpha = 1;
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
        const texture = createCanvasTexture(256, 512, 1, repeatY, (context, width, height) => {
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
        return texture;
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
        const curveScale = environment.terrainStyle === 'rainforest'
            ? THREE.MathUtils.clamp(environment.jungleGeneration?.trailCurve ?? 0.45, 0, 1.5)
            : 1;
        return roadNoise.noise2D(z * 0.002, 0) * 40 * curveScale;
    }

    const cityHighwaySections = environment.id === 'city'
        ? [
            { start: 760, topStart: 1040, topEnd: 2480, end: 2820, height: 30 },
            { start: 3260, topStart: 3500, topEnd: 4620, end: 4940, height: 24 },
            { start: 5120, topStart: 5360, topEnd: 6200, end: 6600, height: 20 }
        ]
        : [];

    function ease01(value) {
        const t = THREE.MathUtils.clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function getCityHighwayElevation(z) {
        if (cityHighwaySections.length === 0) {
            return 0;
        }

        const distance = Math.abs(z);
        return cityHighwaySections.reduce((height, section) => {
            if (distance < section.start || distance > section.end) {
                return height;
            }
            if (distance < section.topStart) {
                return Math.max(height, section.height * ease01((distance - section.start) / (section.topStart - section.start)));
            }
            if (distance <= section.topEnd) {
                return Math.max(height, section.height);
            }
            return Math.max(height, section.height * (1 - ease01((distance - section.topEnd) / (section.end - section.topEnd))));
        }, 0);
    }

    const segmentLength = 10;
    const extraSegmentsAfterFinish = 100;
    const totalSegments = Math.ceil(Math.abs(game.finishLine) / segmentLength) + extraSegmentsAfterFinish;
    const roadElevationAmplitude = Number.isFinite(environment.roadElevationAmplitude)
        ? environment.roadElevationAmplitude
        : 10;
    const rainforestRidgeBands = environment.terrainStyle === 'rainforest'
        ? [-1, 1].reduce((bandsBySide, side) => {
            bandsBySide[side] = [];
            for (let z = game.startLine - 80; z > game.finishLine - 260; z -= 560 + Math.random() * 360) {
                bandsBySide[side].push({
                    center: z - Math.random() * 280,
                    width: 360 + Math.random() * 520,
                    height: 5.5 + Math.random() * 14,
                    shoulder: 2 + Math.random() * 20
                });
            }
            return bandsBySide;
        }, {})
        : null;
    
    function createRoadSegment(index) {
        const z = -index * segmentLength;
        const curve = generateRoadCurve(z);
        const highwayElevation = getCityHighwayElevation(z);
        const y = Math.sin(z * 0.01) * roadElevationAmplitude + highwayElevation; // Gentle road elevation changes
        
        const nextZ = -(index + 1) * segmentLength;
        const nextCurve = generateRoadCurve(nextZ);
        const dx = nextCurve - curve;
        const dz = segmentLength;
        const curvatureAngle = Math.atan2(dx, dz);
        
        return { z, y, curve, curvatureAngle, highwayElevation };
    }

    for (let i = 0; i < totalSegments; i++) {
        game.road.segments.push(createRoadSegment(i));
    }

    const roadGeometry = new THREE.BufferGeometry();
    const leftTerrainGeometry = new THREE.BufferGeometry();
    const rightTerrainGeometry = new THREE.BufferGeometry();
    
    const halfRoadWidth = game.road.width / 2;
    const terrainWidth = game.terrain.width;
    const terrainSteps = environment.terrainStyle === 'rainforest' ? 22 : environment.terrainStyle === 'highland' ? 34 : environment.terrainStyle === 'sand' ? 16 : 10;
    const shoulderWidth = Number.isFinite(environment.shoulderWidth) ? environment.shoulderWidth : 4;
    const hasShoulders = shoulderWidth > 0.001;
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
            hillsideHeight: 16,
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

    function getTerrainDistanceFromRoad(normalizedDistance, z, side) {
        if (environment.terrainStyle === 'highland') {
            const easedDistance = Math.pow(normalizedDistance, 1.58) * terrainWidth;
            const edgeLock = smoothStep(0.08, 0.24, normalizedDistance);
            const farLock = 1 - smoothStep(0.88, 1, normalizedDistance);
            const broadJitter = terrainNoise.noise2D(z * 0.0032 + side * 7.6, normalizedDistance * 3.8) * 5.2;
            const ribJitter = Math.sin(z * 0.0048 + side * 2.1 + normalizedDistance * 6.3) * 1.8;
            return THREE.MathUtils.clamp(
                easedDistance + (broadJitter + ribJitter) * edgeLock * farLock,
                0,
                terrainWidth
            );
        }

        if (environment.terrainStyle !== 'rainforest') {
            return normalizedDistance * terrainWidth;
        }

        const edgeLock = smoothStep(0.04, 0.2, normalizedDistance);
        const farLock = 1 - smoothStep(0.86, 1, normalizedDistance);
        const roughness = edgeLock * farLock * (0.25 + normalizedDistance * 0.75);
        const baseDistance = Math.pow(normalizedDistance, 1.45) * terrainWidth;
        const broadJitter = terrainNoise.noise2D(z * 0.0054 + side * 11.7, normalizedDistance * 4.2 + side * 2.6) * 5.8;
        const ribJitter = Math.sin(z * 0.0062 + side * 3.4 + normalizedDistance * 8.1) * 2.4;
        const detailJitter = terrainNoise.noise2D(z * 0.017 + side * 3.2, normalizedDistance * 11.5) * 1.8;

        return THREE.MathUtils.clamp(baseDistance + (broadJitter + ribJitter + detailJitter) * roughness, 0, terrainWidth);
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
            43 + broadNoise * 8.8 + detailNoise * 2.7 - curveShelter * 1.2,
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

            const cliffStart = shoulderWidth + 3.2;
            const upperBankEnd = Math.max(cliffStart + 2, profile.shoreDistance - coastalBiome.shoreWidth * 0.62);
            const waterStart = profile.shoreDistance + coastalBiome.shoreWidth * 0.55;
            const bankT = smoothStep(cliffStart, waterStart, distanceFromRoadEdge);
            const shelfT = smoothStep(protectedRoadside, upperBankEnd, distanceFromRoadEdge);
            const rockNoise = lakeNoise.noise2D(x * 0.041, z * 0.017) * 0.26 + lakeNoise.noise2D(x * 0.12, z * 0.036) * 0.08;
            const upperY = THREE.MathUtils.lerp(baseHeight, terrainRoadData.y - 0.18, shelfT);
            const cliffY = THREE.MathUtils.lerp(upperY, profile.seaLevel - 0.68, bankT) + rockNoise * (1 - bankT * 0.35);
            return Math.min(baseHeight, cliffY);
        }

        const hillsideT = smoothStep(shoulderWidth + coastalBiome.hillsideMinDistance, terrainWidth * 0.88, distanceFromRoadEdge);
        const nearSlopeT = smoothStep(shoulderWidth + 3.5, shoulderWidth + coastalBiome.hillsideMinDistance + 34, distanceFromRoadEdge);
        const ridgeT = Math.max(hillsideT, nearSlopeT * 0.48);
        const cliffNoise = lakeNoise.noise2D(x * 0.009, z * 0.006) * 3.9 + lakeNoise.noise2D(x * 0.024, z * 0.012) * 1.4;
        return baseHeight + Math.max(0, ridgeT * ((coastalBiome.hillsideHeight || 16) + cliffNoise));
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
            if (environment.roadStyle === 'mud-road') {
                roadUVs.push(0.06, v);
                roadUVs.push(0.94, v);
            } else {
                roadUVs.push(0, v);
                roadUVs.push(1, v);
            }

            // Left terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const normalizedDistance = j / terrainSteps;
                const terrainDistance = getTerrainDistanceFromRoad(normalizedDistance, segment.z, -1);
                const x = leftTerrainStartX - terrainDistance;
                leftTerrainPositions.push(x, getTerrainHeightAt(x, segment.z), segment.z);
                leftTerrainUVs.push(normalizedDistance, v);
            }

            // Right terrain vertices
            for (let j = 0; j <= terrainSteps; j++) {
                const normalizedDistance = j / terrainSteps;
                const terrainDistance = getTerrainDistanceFromRoad(normalizedDistance, segment.z, 1);
                const x = rightTerrainStartX + terrainDistance;
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
            const roadEdgeY = environment.shoulderStyle === 'jungle-mud' ? segment.y - 0.006 : segment.y + 0.04;
            const shoulderEdgeY = environment.terrainStyle === 'highland'
                ? getTerrainHeightAt(shoulderEdgeX, segment.z) + 0.006
                : roadEdgeY;
            const v = i / game.road.segments.length;

            shoulderPositions.push(roadEdgeX, roadEdgeY, segment.z);
            shoulderPositions.push(shoulderEdgeX, shoulderEdgeY, segment.z);
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
    const isRainforestMud = isMudRoad && environment.terrainStyle === 'rainforest';
    const isRainyWeather = !environment.disableRain;
    const roadNormalTexture = isMudRoad ? createJungleMudNormalTexture(game.road.segments.length, environment) : null;
    const roadBrightness = Number.isFinite(environment.roadTextureBrightness)
        ? environment.roadTextureBrightness
        : 1;
    const road = new THREE.Mesh(roadGeometry, new THREE.MeshPhongMaterial({
        map: roadTexture,
        normalMap: roadNormalTexture,
        emissive: isMudRoad && roadBrightness > 1 ? (isRainforestMud ? 0x3a2818 : 0x302416) : 0x000000,
        emissiveIntensity: isMudRoad ? Math.max(0, Math.min(isRainforestMud ? 0.22 : 0.18, (roadBrightness - 1) * (isRainforestMud ? 0.62 : 0.5))) : 0,
        shininess: isRainforestMud ? 12 : isMudRoad ? 9 : isRainyWeather ? (environment.roadStyle === 'city-asphalt' ? 54 : 38) : environment.roadStyle === 'wet-asphalt' ? 42 : environment.roadStyle === 'city-asphalt' ? 24 : 14,
        specular: isRainforestMud ? 0x5a3b22 : isMudRoad ? 0x282018 : isRainyWeather ? 0x5f6e70 : environment.roadStyle === 'wet-asphalt' ? 0x446875 : 0x222222
    }));
    road.receiveShadow = true;

    const terrainTexture = createTerrainTexture(environment, game.road.segments.length, terrainWidth);
    const terrainMaterialColor = environment.terrainTextureUrl && Number.isFinite(environment.terrainTextureTint)
        ? environment.terrainTextureTint
        : environment.terrainTint || 0xffffff;
    const terrainMaterial = new THREE.MeshPhongMaterial({
        color: terrainMaterialColor,
        map: terrainTexture,
        bumpMap: environment.terrainStyle === 'rainforest' ? null : terrainTexture,
        bumpScale: environment.terrainStyle === 'snow-rock' ? 0.18 : environment.terrainStyle === 'rainforest' ? 0 : 0.28,
        side: THREE.DoubleSide,
        flatShading: false,
        shininess: environment.terrainStyle === 'snow-rock' ? 8 : environment.terrainStyle === 'rainforest' ? 9 : 3,
        specular: environment.terrainStyle === 'rainforest' ? 0x243824 : 0x111111
    });

    const shoulderTexture = hasShoulders ? createShoulderTexture(environment, game.road.segments.length) : null;
    const shoulderMaterial = hasShoulders
        ? new THREE.MeshPhongMaterial({
            color: environment.shoulderStyle === 'jungle-mud' ? 0x2f2418 : 0xffffff,
            map: shoulderTexture,
            side: THREE.DoubleSide,
            shininess: environment.shoulderStyle === 'jungle-mud' ? 1 : 4,
            specular: environment.shoulderStyle === 'jungle-mud' ? 0x080604 : 0x111111
        })
        : null;

    const leftTerrain = new THREE.Mesh(leftTerrainGeometry, terrainMaterial);
    const rightTerrain = new THREE.Mesh(rightTerrainGeometry, terrainMaterial);
    const leftShoulder = hasShoulders ? new THREE.Mesh(createShoulderGeometry(-1), shoulderMaterial) : null;
    const rightShoulder = hasShoulders ? new THREE.Mesh(createShoulderGeometry(1), shoulderMaterial) : null;
    
    leftTerrain.receiveShadow = true;
    rightTerrain.receiveShadow = true;
    if (leftShoulder) {
        leftShoulder.receiveShadow = true;
    }
    if (rightShoulder) {
        rightShoulder.receiveShadow = true;
    }
    leftTerrain.userData.cameraOccluder = true;
    rightTerrain.userData.cameraOccluder = true;
    game.cameraOccluders = [leftTerrain, rightTerrain];

    scene.add(road, leftTerrain, rightTerrain);
    if (leftShoulder) {
        scene.add(leftShoulder);
    }
    if (rightShoulder) {
        scene.add(rightShoulder);
    }

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
        highlandDetails: 0,
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
            y: THREE.MathUtils.lerp(segment.y, nextSegment.y, t),
            highwayElevation: THREE.MathUtils.lerp(segment.highwayElevation || 0, nextSegment.highwayElevation || 0, t)
        };
    }

    function getTerrainHeightAt(x, z) {
        const roadData = getLinearRoadDataAtZ(z);
        const distanceFromRoadCenter = Math.abs(x - roadData.curve);
        const distanceFromRoadEdge = distanceFromRoadCenter - halfRoadWidth;
        const normalizedDistance = Math.min(Math.max((distanceFromRoadCenter - halfRoadWidth - shoulderWidth) / terrainWidth, 0), 1);
        let baseHeight = roadData.y;
        if (environment.id === 'city' && roadData.highwayElevation > 0.01) {
            const groundDrop = roadData.highwayElevation * smoothStep(shoulderWidth + 2.5, shoulderWidth + 28, distanceFromRoadEdge);
            baseHeight -= groundDrop;
        }
        let heightOffset = generateMountainHeight(x, z) * getTerrainLiftFactor(normalizedDistance);

        if (environment.terrainStyle === 'rainforest') {
            const bankScale = THREE.MathUtils.clamp((environment.jungleGeneration?.bankHeight ?? 2.5) / 2.5, 0.25, 2.35);
            const side = x < roadData.curve ? -1 : 1;
            const broadNoise = (terrainNoise.noise2D(z * 0.0026, side * 12.4) + 1) * 0.5;
            const detailNoise = (terrainNoise.noise2D((x + side * 31) * 0.014, z * 0.007) + 1) * 0.5;
            const oppositeNoise = (terrainNoise.noise2D(z * 0.0021 + 37, -side * 8.5) + 1) * 0.5;
            const crossNoise = terrainNoise.noise2D((distanceFromRoadEdge + side * 40) * 0.026, z * 0.0058);
            const asymmetry = THREE.MathUtils.clamp(0.52 + broadNoise * 0.78 - oppositeNoise * 0.34, 0.12, 1.22);
            const bands = rainforestRidgeBands?.[side] || [];
            const ridge = bands.reduce((active, band) => {
                const strength = smoothBand(z, band.center, band.width);
                if (strength <= active.strength) {
                    return active;
                }
                return { ...band, strength };
            }, { strength: 0, height: 0, shoulder: 18 });
            const opening = smoothStep(0.16, 0.84, 1 - ridge.strength) * (0.5 + broadNoise * 0.5);
            const slopePocket = THREE.MathUtils.clamp(
                0.36 + ridge.strength * 0.54 + terrainNoise.noise2D(z * 0.0044 + side * 23.8, 19.4) * 0.36,
                0.12,
                1.18
            );
            const sideOpening = smoothStep(0.22, 0.82, (Math.sin(z * 0.0041 + side * 1.7) + 1) * 0.5);
            const brokenLift = THREE.MathUtils.clamp(0.24 + slopePocket * 0.34 + sideOpening * 0.58, 0.16, 1.08);
            const baseLift = smoothStep(shoulderWidth + 1.8, terrainWidth * 0.72, distanceFromRoadEdge);
            const closeRidgeCenter = 16 + ridge.shoulder * ridge.strength + opening * 18 + broadNoise * 12;
            const midRidgeCenter = closeRidgeCenter + 34 + oppositeNoise * 28;
            const farRidgeCenter = midRidgeCenter + 44 + detailNoise * 34;
            const closeShelf = smoothBand(distanceFromRoadEdge, closeRidgeCenter, 34 + broadNoise * 22) * (3.6 + ridge.height * 0.3) * asymmetry * slopePocket * (0.55 + sideOpening * 0.55);
            const midShelf = smoothBand(distanceFromRoadEdge, midRidgeCenter, 46 + oppositeNoise * 30) * (8.8 + ridge.height * 0.5) * (0.42 + broadNoise * 0.48 + sideOpening * 0.36);
            const farShelf = smoothBand(distanceFromRoadEdge, farRidgeCenter, 76 + detailNoise * 34) * (12.5 + ridge.height * 0.82) * (0.34 + asymmetry * 0.38 + sideOpening * 0.44);
            const gullyCenter = closeRidgeCenter + 20 + oppositeNoise * 24;
            const gully = smoothBand(distanceFromRoadEdge, gullyCenter, 22 + detailNoise * 22) * (3.4 + detailNoise * 7.2) * (0.25 + opening * 0.75);
            const pocketCut = smoothBand(
                distanceFromRoadEdge,
                10 + opening * 26 + oppositeNoise * 18,
                26 + broadNoise * 24
            ) * (1.12 - sideOpening * 0.62) * (1 - slopePocket * 0.55) * (3.5 + oppositeNoise * 6.5);
            const moundNoise = terrainNoise.noise2D((x + side * 90) * 0.031, z * 0.018);
            const fineNoise = terrainNoise.noise2D((x - side * 18) * 0.072, z * 0.039);
            const ripple = (crossNoise * 4.8 + moundNoise * 6.6 + fineNoise * 1.8) * baseLift * (0.22 + normalizedDistance * 0.78);

            heightOffset *= 0.2 + baseLift * (0.25 + asymmetry * 0.16 + brokenLift * 0.48);
            heightOffset += (closeShelf + midShelf + farShelf - gully - pocketCut) * bankScale + ripple;
            heightOffset *= smoothStep(2.4, 11, distanceFromRoadEdge);
            heightOffset = Math.max(heightOffset, -0.35 + baseLift * 0.2);
        }

        if (environment.terrainStyle === 'highland') {
            const side = x < roadData.curve ? -1 : 1;
            const roadProtect = smoothStep(shoulderWidth + 1.5, shoulderWidth + 16, distanceFromRoadEdge);
            const broadNoise = (terrainNoise.noise2D(z * 0.0017 + side * 9.8, side * 13.4) + 1) * 0.5;
            const ridgeNoise = (terrainNoise.noise2D((x + side * 80) * 0.006, z * 0.0028) + 1) * 0.5;
            const fineNoise = terrainNoise.noise2D((x - side * 21) * 0.035, z * 0.018);
            const glenPinch = (Math.sin(z * 0.0018 + side * 1.7) + 1) * 0.5;
            const oppositePinch = (Math.sin(z * 0.0015 - side * 2.8) + 1) * 0.5;
            const slopeStart = 18 + broadNoise * 28 + glenPinch * 18;
            const lowerSlope = smoothStep(slopeStart, slopeStart + 74, distanceFromRoadEdge);
            const upperSlope = smoothStep(78 + oppositePinch * 42, terrainWidth * 0.92, distanceFromRoadEdge);
            const valleyFloor = smoothStep(2.5, 42, distanceFromRoadEdge);
            const sideWeight = 0.76 + broadNoise * 0.44 + side * Math.sin(z * 0.0011) * 0.12;
            const lowerRoll = smoothBand(distanceFromRoadEdge, 34 + broadNoise * 42, 74 + glenPinch * 30)
                * (3.8 + ridgeNoise * 7.4);
            const ridgeWall = Math.pow(upperSlope, 0.86)
                * (34 + ridgeNoise * 46 + glenPinch * 18)
                * sideWeight;
            const cragBand = smoothBand(distanceFromRoadEdge, 118 + broadNoise * 84, 58 + ridgeNoise * 42)
                * (10 + ridgeNoise * 21);
            const screeFan = smoothBand(distanceFromRoadEdge, 72 + oppositePinch * 56, 46 + broadNoise * 36)
                * (4 + Math.abs(fineNoise) * 8);
            const gully = smoothBand(distanceFromRoadEdge, 56 + broadNoise * 76, 24 + ridgeNoise * 36)
                * (5 + oppositePinch * 9 + Math.abs(fineNoise) * 5);
            const terraceCut = smoothBand(distanceFromRoadEdge, 20 + glenPinch * 22, 30 + broadNoise * 18)
                * (1.8 + oppositePinch * 2.6);
            const moorRipple = (fineNoise * 4.2 + Math.sin(z * 0.008 + normalizedDistance * 7.4 + side) * 2.2)
                * valleyFloor
                * (0.28 + normalizedDistance * 0.72);

            heightOffset *= 0.12 + upperSlope * 0.28 + lowerSlope * 0.1;
            heightOffset += lowerRoll + ridgeWall + cragBand + screeFan * 0.6 + moorRipple;
            heightOffset -= (gully + terraceCut) * roadProtect;
            const shoulderTie = smoothStep(shoulderWidth + 0.75, shoulderWidth + 58, distanceFromRoadEdge);
            const nearRoadRiseLimit = THREE.MathUtils.lerp(
                0.18,
                24,
                smoothStep(shoulderWidth + 18, shoulderWidth + 96, distanceFromRoadEdge)
            );
            heightOffset *= shoulderTie;
            heightOffset = Math.min(heightOffset, nearRoadRiseLimit);
            heightOffset = Math.max(heightOffset, -0.55 * roadProtect * shoulderTie);
        }

        if (environment.terrainStyle === 'sand') {
            const side = x < roadData.curve ? -1 : 1;
            const roadProtect = smoothStep(shoulderWidth + 2.5, shoulderWidth + 16, distanceFromRoadEdge);
            const farLift = smoothStep(shoulderWidth + 18, terrainWidth * 0.92, distanceFromRoadEdge);
            const duneNoise = terrainNoise.noise2D((x + side * 41) * 0.012, z * 0.0048);
            const broadNoise = terrainNoise.noise2D(z * 0.0016 + side * 12.7, normalizedDistance * 3.2);
            const fineNoise = terrainNoise.noise2D((x - side * 25) * 0.052, z * 0.019);
            const duneRidge = Math.sin(z * 0.006 + side * 1.4 + normalizedDistance * 7.6) * (1.4 + normalizedDistance * 4.2);
            const washCenter = 38 + (broadNoise + 1) * 26 + Math.sin(z * 0.003 + side) * 10;
            const dryWash = smoothBand(distanceFromRoadEdge, washCenter, 22 + Math.abs(broadNoise) * 24)
                * smoothStep(12, terrainWidth * 0.74, distanceFromRoadEdge)
                * (1.6 + Math.abs(fineNoise) * 2.6);
            const mesaRise = smoothStep(terrainWidth * 0.46, terrainWidth * 0.95, distanceFromRoadEdge)
                * (10 + Math.max(0, broadNoise) * 18 + Math.max(0, duneNoise) * 10);

            heightOffset *= 0.2 + farLift * 0.46;
            heightOffset += (duneNoise * 5.2 + fineNoise * 1.1 + duneRidge) * roadProtect * (0.28 + normalizedDistance * 0.72);
            heightOffset += mesaRise * farLift;
            heightOffset -= dryWash * roadProtect;
            heightOffset = Math.max(heightOffset, -1.2 * roadProtect);
        }

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

    function getSceneryCullRadius(statsKey) {
        const largeProps = new Set([
            'buildings',
            'cabins',
            'villas',
            'boats',
            'docks',
            'stoneWalls',
            'seaWalls',
            'canopy',
            'rockClusters',
            'sandDrifts'
        ]);
        const smallProps = new Set([
            'junglePlants',
            'coastalDetails',
            'highlandDetails',
            'hazardMarkers',
            'fenceSegments',
            'guardrails'
        ]);
        if (largeProps.has(statsKey)) {
            return 150;
        }
        if (smallProps.has(statsKey)) {
            return 55;
        }
        return 85;
    }

    function registerSceneryCull(object, statsKey) {
        if (!object?.position || !Number.isFinite(object.position.z)) {
            return;
        }
        game.sceneryCullObjects = game.sceneryCullObjects || [];
        object.userData = object.userData || {};
        object.userData.sceneryCull = {
            z: object.position.z,
            radius: getSceneryCullRadius(statsKey)
        };
        game.sceneryCullObjects.push(object);
    }

    function addDecorMesh(group, mesh, statsKey) {
        const majorShadowKeys = new Set(['buildings', 'cabins', 'villas', 'stoneWalls']);
        const castsUsefulShadow = majorShadowKeys.has(statsKey);
        mesh.castShadow = castsUsefulShadow;
        mesh.receiveShadow = castsUsefulShadow;
        group.add(mesh);
        registerSceneryCull(mesh, statsKey);
        if (statsKey) {
            stageDecorStats[statsKey] += 1;
        }
        return mesh;
    }

    function addDecorGroup(group, object, statsKey) {
        const majorShadowKeys = new Set(['cabins', 'villas', 'buildings', 'stoneWalls']);
        const castsUsefulShadow = majorShadowKeys.has(statsKey);
        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow = castsUsefulShadow;
                child.receiveShadow = castsUsefulShadow;
            }
        });
        group.add(object);
        registerSceneryCull(object, statsKey);
        if (statsKey) {
            stageDecorStats[statsKey] += 1;
        }
        return object;
    }

    function addDecorPointLight(group, color, intensity, distance, decay, position, limit = 8) {
        const decorativeLightLimit = Number.isFinite(environment.decorativeLightLimit)
            ? Math.max(0, environment.decorativeLightLimit)
            : 0;
        const effectiveLimit = Math.min(limit, decorativeLightLimit);
        if (stageDecorStats.activePointLights >= effectiveLimit) {
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

    function addGenericRainEffect() {
        const isNight = Boolean(environment.nightRace);
        const dropCount = environment.id === 'jungle' ? 2400 : 1900;
        const rainHeight = 84;
        const rainDepth = 196;
        const rainSpread = environment.id === 'city' ? 94 : 82;
        const rainPositions = new Float32Array(dropCount * 2 * 3);
        const rainColors = new Float32Array(dropCount * 2 * 3);
        const rainSeeds = [];
        const rainColor = new THREE.Color(isNight ? 0xeaf8ff : 0xd6edf3);
        const windX = environment.id === 'coastal' ? -1.45 : environment.id === 'desert' ? -0.75 : -1.05;
        const windZ = environment.id === 'coastal' ? -0.65 : -0.35;

        for (let i = 0; i < dropCount; i++) {
            const brightness = 0.5 + Math.random() * 0.68;
            rainSeeds.push({
                lateral: (Math.random() - 0.5) * rainSpread * 2,
                depthUnit: Math.random(),
                vertical: Math.random() * rainHeight,
                length: 5.8 + Math.random() * 10.8,
                speed: 46 + Math.random() * 48,
                phase: Math.random() * rainHeight,
                windX: windX * (0.65 + Math.random() * 0.7),
                windZ: windZ * (0.65 + Math.random() * 0.7),
                brightness
            });

            for (let vertex = 0; vertex < 2; vertex++) {
                const colorIndex = (i * 2 + vertex) * 3;
                const fade = vertex === 0 ? 0.62 : 1;
                rainColors[colorIndex] = rainColor.r * brightness * fade;
                rainColors[colorIndex + 1] = rainColor.g * brightness * fade;
                rainColors[colorIndex + 2] = rainColor.b * brightness * fade;
            }
        }

        const rainGeometry = new THREE.BufferGeometry();
        const rainPositionAttribute = new THREE.BufferAttribute(rainPositions, 3);
        const rainColorAttribute = new THREE.BufferAttribute(rainColors, 3);
        if (rainPositionAttribute.setUsage && THREE.DynamicDrawUsage) {
            rainPositionAttribute.setUsage(THREE.DynamicDrawUsage);
        }
        rainGeometry.setAttribute('position', rainPositionAttribute);
        rainGeometry.setAttribute('color', rainColorAttribute);

        const rainMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: isNight ? 0.72 : 0.56,
            depthWrite: false,
            depthTest: true
        });

        const rainLines = new THREE.LineSegments(rainGeometry, rainMaterial);
        rainLines.name = 'stage-world-rain-streaks';
        rainLines.frustumCulled = false;
        rainLines.renderOrder = 860;
        scene.add(rainLines);

        const splashCount = 240;
        const splashSegmentsPerImpact = 3;
        const splashVerticesPerImpact = splashSegmentsPerImpact * 2;
        const splashPositions = new Float32Array(splashCount * splashVerticesPerImpact * 3);
        const splashColors = new Float32Array(splashCount * splashVerticesPerImpact * 3);
        const splashColor = new THREE.Color(0xdcebed);
        const splashSeeds = [];
        const splashGeometry = new THREE.BufferGeometry();
        const splashPositionAttribute = new THREE.BufferAttribute(splashPositions, 3);
        const splashColorAttribute = new THREE.BufferAttribute(splashColors, 3);
        if (splashPositionAttribute.setUsage && THREE.DynamicDrawUsage) {
            splashPositionAttribute.setUsage(THREE.DynamicDrawUsage);
            splashColorAttribute.setUsage(THREE.DynamicDrawUsage);
        }
        splashGeometry.setAttribute('position', splashPositionAttribute);
        splashGeometry.setAttribute('color', splashColorAttribute);
        const splashMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: isNight ? 0.4 : 0.3,
            depthWrite: false,
            depthTest: true
        });
        const splashLines = new THREE.LineSegments(splashGeometry, splashMaterial);
        splashLines.name = 'stage-rain-road-splashes';
        splashLines.frustumCulled = false;
        splashLines.renderOrder = 40;
        scene.add(splashLines);

        function getSplashRelativeZ() {
            const roll = Math.random();
            if (roll < 0.68) {
                return -16 + Math.random() * 44;
            }
            if (roll < 0.9) {
                return 12 + Math.random() * 36;
            }
            return -18 - Math.random() * 42;
        }

        function getSplashLateralOffset(roadData, carPosition, isCloseBand) {
            const halfRoadWidth = game.road.width * 0.5;
            if (isCloseBand && carPosition && Math.random() < 0.72) {
                const carLateral = THREE.MathUtils.clamp(carPosition.x - roadData.curve, -halfRoadWidth * 0.66, halfRoadWidth * 0.66);
                const side = Math.random() < 0.5 ? -1 : 1;
                const sideSpray = side * (2.8 + Math.random() * 5.6) + (Math.random() - 0.5) * 1.1;
                return THREE.MathUtils.clamp(carLateral + sideSpray, -halfRoadWidth * 0.88, halfRoadWidth * 0.88);
            }
            return (Math.random() - 0.5) * game.road.width * 0.9;
        }

        function respawnSplash(seed, carZ, carPosition = null) {
            const z = carZ + getSplashRelativeZ();
            const roadData = getLinearRoadDataAtZ(z);
            const isCloseBand = Math.abs(z - carZ) <= 28;
            seed.x = roadData.curve + getSplashLateralOffset(roadData, carPosition, isCloseBand);
            seed.y = roadData.y + 0.075;
            seed.z = z;
            seed.age = Math.random() * 0.18;
            seed.life = 0.11 + Math.random() * 0.2;
            seed.size = (isCloseBand ? 0.3 : 0.22) + Math.random() * (isCloseBand ? 0.48 : 0.34);
            seed.angle = Math.random() * Math.PI;
        }

        for (let i = 0; i < splashCount; i++) {
            const seed = {};
            respawnSplash(seed, game.startLine);
            seed.age = Math.random() * seed.life;
            splashSeeds.push(seed);
        }

        const cameraForward = new THREE.Vector3();
        const cameraRight = new THREE.Vector3();
        const rainAnchor = new THREE.Vector3();
        const fallbackForward = new THREE.Vector3(0, 0, -1);
        let rainTime = 0;

        game.stageEffects = game.stageEffects || [];
        game.stageEffects.push({
            type: 'rain',
            update(deltaSeconds, activeGame, activeCamera, activeCameraMode = null) {
                rainTime += deltaSeconds;
                const carPosition = activeGame?.car?.position || null;
                const carZ = carPosition?.z ?? game.startLine;
                const carSpeed = Math.max(0, activeGame?.car?.speed || 0);
                const carMaxSpeed = Math.max(0.001, activeGame?.car?.maxSpeed || 2.5);
                const speedRatio = THREE.MathUtils.clamp(carSpeed / carMaxSpeed, 0, 1);
                const isCockpitMode = activeCameraMode?.type === 'cockpit';
                const isInteriorCockpit = activeCameraMode?.id === 'cockpitInterior';
                const nearDepth = isInteriorCockpit ? 0.55 : isCockpitMode ? 0.35 : -16;
                const depthRange = isCockpitMode ? rainDepth * 0.92 : rainDepth * 1.05;
                const motionSweep = THREE.MathUtils.lerp(4.5, 24, Math.pow(speedRatio, 0.72));
                if (activeCamera) {
                    activeCamera.getWorldDirection(cameraForward);
                    cameraForward.y = 0;
                    if (cameraForward.lengthSq() < 0.0001) {
                        cameraForward.copy(fallbackForward);
                    } else {
                        cameraForward.normalize();
                    }
                    cameraRight.setFromMatrixColumn(activeCamera.matrixWorld, 0);
                    cameraRight.y = 0;
                    cameraRight.addScaledVector(cameraForward, -cameraRight.dot(cameraForward));
                    if (cameraRight.lengthSq() < 0.0001) {
                        cameraRight.set(1, 0, 0);
                    } else {
                        cameraRight.normalize();
                    }
                    if (isCockpitMode || !carPosition) {
                        rainAnchor.copy(activeCamera.position);
                    } else {
                        rainAnchor.set(carPosition.x, activeCamera.position.y, carPosition.z);
                    }
                } else {
                    cameraForward.copy(fallbackForward);
                    cameraRight.set(1, 0, 0);
                    rainAnchor.set(carPosition?.x || 0, (carPosition?.y || 0) + 8, carZ);
                }

                rainSeeds.forEach((seed, index) => {
                    const wrappedY = ((seed.vertical + seed.phase - rainTime * seed.speed) % rainHeight + rainHeight) % rainHeight;
                    let depth;
                    if (isCockpitMode) {
                        depth = nearDepth + seed.depthUnit * depthRange;
                    } else if (seed.depthUnit < 0.5) {
                        depth = nearDepth + seed.depthUnit * 72;
                    } else if (seed.depthUnit < 0.82) {
                        depth = 20 + (seed.depthUnit - 0.5) / 0.32 * 78;
                    } else {
                        depth = 98 + (seed.depthUnit - 0.82) / 0.18 * (depthRange - 98);
                    }
                    const topX = rainAnchor.x + cameraForward.x * depth + cameraRight.x * seed.lateral;
                    const topY = rainAnchor.y + wrappedY - 12;
                    const topZ = rainAnchor.z + cameraForward.z * depth + cameraRight.z * seed.lateral;
                    const offset = index * 6;
                    rainPositions[offset] = topX;
                    rainPositions[offset + 1] = topY;
                    rainPositions[offset + 2] = topZ;
                    rainPositions[offset + 3] = topX + seed.windX - cameraForward.x * motionSweep;
                    rainPositions[offset + 4] = topY - seed.length;
                    rainPositions[offset + 5] = topZ + seed.windZ - cameraForward.z * motionSweep;
                });
                rainPositionAttribute.needsUpdate = true;

                splashSeeds.forEach((seed, index) => {
                    seed.age += deltaSeconds;
                    if (seed.age >= seed.life || seed.z > carZ + 54 || seed.z < carZ - 66) {
                        respawnSplash(seed, carZ, carPosition);
                    }

                    const t = THREE.MathUtils.clamp(seed.age / seed.life, 0, 1);
                    const fade = Math.sin(t * Math.PI);
                    const radius = seed.size * (0.45 + t * 1.25);
                    const y = seed.y + 0.01 * fade;
                    const baseVertex = index * splashVerticesPerImpact;
                    for (let segment = 0; segment < splashSegmentsPerImpact; segment++) {
                        const angle = seed.angle + segment * Math.PI / splashSegmentsPerImpact + Math.sin(index + segment) * 0.18;
                        const dx = Math.cos(angle) * radius;
                        const dz = Math.sin(angle) * radius * 0.62;
                        const brightness = fade * (0.42 + segment * 0.16);
                        const vertexA = (baseVertex + segment * 2) * 3;
                        const vertexB = vertexA + 3;
                        splashPositions[vertexA] = seed.x - dx;
                        splashPositions[vertexA + 1] = y;
                        splashPositions[vertexA + 2] = seed.z - dz;
                        splashPositions[vertexB] = seed.x + dx;
                        splashPositions[vertexB + 1] = y;
                        splashPositions[vertexB + 2] = seed.z + dz;
                        splashColors[vertexA] = splashColor.r * brightness;
                        splashColors[vertexA + 1] = splashColor.g * brightness;
                        splashColors[vertexA + 2] = splashColor.b * brightness;
                        splashColors[vertexB] = splashColor.r * brightness;
                        splashColors[vertexB + 1] = splashColor.g * brightness;
                        splashColors[vertexB + 2] = splashColor.b * brightness;
                    }
                });
                splashPositionAttribute.needsUpdate = true;
                splashColorAttribute.needsUpdate = true;
            },
            setIntensity(value) {
                rainMaterial.opacity = THREE.MathUtils.clamp(value, 0, 1);
                splashMaterial.opacity = THREE.MathUtils.clamp(value * 0.68, 0, 0.68);
                rainLines.visible = rainMaterial.opacity > 0.01;
                splashLines.visible = splashMaterial.opacity > 0.01;
            }
        });
        stageDecorStats.rainStreaks += dropCount + splashCount;
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
        const isNight = Boolean(environment.nightRace);
        const startZ = game.startLine + 170;
        const endZ = game.finishLine - 520;
        const facadeMaterials = Array.from({ length: 6 }, (_, index) => new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: createTokyoFacadeTexture(index, environment),
            shininess: isNight ? 30 : 18,
            specular: isNight ? 0x38506b : 0x1d252b,
            emissive: isNight ? 0x111827 : 0x000000,
            emissiveIntensity: isNight ? 0.46 : 0.08
        }));
        const darkGlassMaterial = new THREE.MeshPhongMaterial({
            color: 0x17242e,
            shininess: 42,
            specular: 0x566978,
            emissive: isNight ? 0x07101b : 0x000000,
            emissiveIntensity: isNight ? 0.28 : 0.02
        });
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x1a2028, shininess: 18, specular: 0x222831 });
        const barrierMaterial = new THREE.MeshPhongMaterial({ color: 0xd0d5d6, shininess: 14, specular: 0x283037 });
        const curbMaterial = new THREE.MeshPhongMaterial({ color: 0x5f676b, shininess: 10 });
        const gantryMaterial = new THREE.MeshPhongMaterial({ color: 0x18212a, shininess: 28, specular: 0x35404a });
        const railMaterial = new THREE.MeshPhongMaterial({ color: 0x2a323b, shininess: 18, specular: 0x3a4650 });
        const crosswalkMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f7f2, transparent: true, opacity: 0.82 });

        function addTokyoObject(object, statsKey, options = {}) {
            object.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = Boolean(options.castShadow);
                    child.receiveShadow = options.receiveShadow !== false;
                }
            });
            decor.add(object);
            if (object?.position && Number.isFinite(object.position.z)) {
                object.userData = object.userData || {};
                object.userData.sceneryCull = {
                    z: Number.isFinite(options.cullZ) ? options.cullZ : object.position.z,
                    radius: Number.isFinite(options.cullRadius) ? options.cullRadius : getSceneryCullRadius(statsKey)
                };
                game.sceneryCullObjects = game.sceneryCullObjects || [];
                game.sceneryCullObjects.push(object);
            }
            if (statsKey) {
                stageDecorStats[statsKey] += Number.isFinite(options.count) ? options.count : 1;
            }
            return object;
        }

        function createTokyoSignTexture(label, options = {}) {
            const vertical = Boolean(options.vertical);
            const canvas = document.createElement('canvas');
            canvas.width = vertical ? 256 : 512;
            canvas.height = vertical ? 640 : 192;
            const context = canvas.getContext('2d');
            const accent = options.accent || '#45d8ff';
            const secondary = options.secondary || '#ff4da6';
            const background = options.background || '#08111c';
            const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, background);
            gradient.addColorStop(0.55, '#142335');
            gradient.addColorStop(1, '#05080d');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = accent;
            context.lineWidth = vertical ? 10 : 8;
            context.strokeRect(9, 9, canvas.width - 18, canvas.height - 18);
            context.fillStyle = secondary;
            context.globalAlpha = isNight ? 0.82 : 0.42;
            for (let i = 0; i < 8; i++) {
                const x = vertical ? 22 + (i % 2) * (canvas.width - 58) : 34 + i * 52;
                const y = vertical ? 52 + i * 66 : canvas.height - 28;
                context.fillRect(x, y, vertical ? 14 : 26, vertical ? 36 : 7);
            }
            context.globalAlpha = 1;
            context.fillStyle = '#f9fbff';
            context.shadowColor = accent;
            context.shadowBlur = isNight ? 18 : 4;
            if (vertical) {
                const compactLabel = label.replace(/\s+/g, '');
                const fontSize = compactLabel.length > 7 ? 38 : 46;
                context.font = `800 ${fontSize}px Arial Black, Impact, sans-serif`;
                context.textAlign = 'center';
                compactLabel.split('').slice(0, 10).forEach((letter, index) => {
                    context.fillText(letter, canvas.width * 0.5, 92 + index * (fontSize + 10));
                });
            } else {
                context.font = '800 46px Arial Black, Impact, sans-serif';
                context.textAlign = 'left';
                context.fillText(label, 34, 78);
                context.shadowBlur = isNight ? 9 : 2;
                context.fillStyle = accent;
                context.font = '700 27px Arial, sans-serif';
                context.fillText(options.subtitle || 'TOKYO ROUTE', 36, 126);
            }
            context.shadowBlur = 0;

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.anisotropy = 4;
            if (THREE.sRGBEncoding) {
                texture.encoding = THREE.sRGBEncoding;
            }
            return texture;
        }

        const verticalSignMaterials = [
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('SHIBUYA', { vertical: true, accent: '#ff4da6', secondary: '#39e8ff' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('AKIBA', { vertical: true, accent: '#48f7a4', secondary: '#ffd84e' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('GINZA', { vertical: true, accent: '#ffe15c', secondary: '#ff5d53' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('RAMEN', { vertical: true, accent: '#ff684f', secondary: '#f5f2dc' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('HOTEL', { vertical: true, accent: '#75d8ff', secondary: '#ff8fd1' }), transparent: true })
        ];
        const storefrontMaterials = [
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('TOKYO FM', { accent: '#48dfff', secondary: '#ff4fa3', subtitle: 'ON AIR 24H' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('SHUTO C1', { accent: '#52ffa9', secondary: '#ffd84e', subtitle: 'INNER LOOP' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('RALLY TOKYO', { accent: '#ff4fa3', secondary: '#50e9ff', subtitle: 'NIGHT RUN' }), transparent: true }),
            new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('GINZA EXIT', { accent: '#ffe15c', secondary: '#ff6d58', subtitle: 'NEXT 400M' }), transparent: true })
        ];

        function createTokyoBuilding(width, height, depth, material, side, detailLevel) {
            const building = new THREE.Group();
            building.name = 'city-tokyo-building';

            const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
            body.name = 'city-tokyo-building-body';
            body.position.y = height * 0.5;
            building.add(body);

            const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 1.04, 0.45, depth * 1.04), roofMaterial);
            cap.name = 'city-tokyo-roof-cap';
            cap.position.y = height + 0.22;
            building.add(cap);

            if (height > 44 && detailLevel > 0.45) {
                const equipment = new THREE.Mesh(
                    new THREE.BoxGeometry(width * 0.34, 0.8 + Math.random() * 0.9, depth * 0.28),
                    roofMaterial
                );
                equipment.name = 'city-tokyo-rooftop-equipment';
                equipment.position.set((Math.random() - 0.5) * width * 0.26, height + 0.82, (Math.random() - 0.5) * depth * 0.32);
                building.add(equipment);
            }

            if (height > 62 && detailLevel > 0.68) {
                const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 5.5 + Math.random() * 6, 6), roofMaterial);
                antenna.name = 'city-tokyo-roof-antenna';
                antenna.position.set((Math.random() - 0.5) * width * 0.35, height + antenna.geometry.parameters.height * 0.5, (Math.random() - 0.5) * depth * 0.36);
                building.add(antenna);
            }

            const signFaceX = -side * (width * 0.5 + 0.04);
            const verticalSignChance = THREE.MathUtils.clamp((detailLevel - 0.28) * 0.24, 0, 0.18);
            const hasVerticalSign = detailLevel > 0.28 && Math.random() < verticalSignChance;
            if (hasVerticalSign) {
                const signHeight = Math.min(height * 0.62, 18 + Math.random() * 22);
                const signWidth = 1.5 + Math.random() * 1.1;
                const sign = new THREE.Mesh(
                    new THREE.PlaneGeometry(signWidth, signHeight),
                    verticalSignMaterials[Math.floor(Math.random() * verticalSignMaterials.length)]
                );
                sign.name = 'city-tokyo-neon-vertical-sign';
                sign.position.set(signFaceX, Math.max(5, height * (0.42 + Math.random() * 0.18)), (Math.random() - 0.5) * depth * 0.54);
                sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
                building.add(sign);
            }

            const storefrontChance = hasVerticalSign
                ? 0.07
                : THREE.MathUtils.clamp(0.06 + detailLevel * 0.16, 0.08, 0.22);
            if (detailLevel > 0.12 && Math.random() < storefrontChance) {
                const storefront = new THREE.Mesh(
                    new THREE.PlaneGeometry(Math.max(4.2, depth * 0.72), 1.7),
                    storefrontMaterials[Math.floor(Math.random() * storefrontMaterials.length)]
                );
                storefront.name = 'city-tokyo-storefront-sign';
                storefront.position.set(signFaceX, 3.1, 0);
                storefront.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
                building.add(storefront);
            }

            return building;
        }

        function placeBuildingRows() {
            const randomRange = range => range[0] + Math.random() * (range[1] - range[0]);
            const blockStep = 92;
            const blockRows = [
                { offset: [16, 21], zSlots: [-29, 0, 29], width: [8.5, 13], depth: [16, 22], height: [24, 66], cullRadius: 225, detail: 0.98 },
                { offset: [34, 47], zSlots: [-24, 24], width: [14, 23], depth: [22, 34], height: [48, 122], cullRadius: 340, detail: 0.66 },
                { offset: [64, 92], zSlots: [0], width: [24, 38], depth: [28, 48], height: [82, 176], cullRadius: 500, detail: 0.34, every: 3 }
            ];

            [-1, 1].forEach(side => {
                let blockIndex = 0;
                for (let blockZ = startZ - (side > 0 ? 34 : 0); blockZ > endZ; blockZ -= blockStep) {
                    const hasCrossStreetGap = blockIndex % 9 === 5;
                    blockRows.forEach((row, rowIndex) => {
                        if (row.every && blockIndex % row.every !== (side > 0 ? 1 : 0)) {
                            return;
                        }

                        row.zSlots.forEach(slot => {
                            if (hasCrossStreetGap && rowIndex === 0 && Math.abs(slot) < 1) {
                                return;
                            }

                            const actualZ = blockZ + slot + (Math.random() - 0.5) * 3.6;
                            if (actualZ > startZ + 34 || actualZ < endZ - 34) {
                                return;
                            }

                            const offset = randomRange(row.offset);
                            const pose = getRoadsidePose(actualZ, side, offset);
                            const width = randomRange(row.width);
                            const depth = randomRange(row.depth);
                            const height = randomRange(row.height);
                            const materialIndex = Math.floor(Math.random() * facadeMaterials.length);
                            const material = rowIndex === 0 && Math.random() < 0.22 ? darkGlassMaterial : facadeMaterials[materialIndex];
                            const building = createTokyoBuilding(width, height, depth, material, side, row.detail * (0.68 + Math.random() * 0.55));
                            building.position.set(
                                pose.x,
                                getPropGroundY(pose.x, actualZ, Math.max(width, depth) * 0.55) + 0.02,
                                actualZ
                            );
                            building.rotation.y = pose.yaw + (Math.random() - 0.5) * 0.028;
                            addTokyoObject(building, 'buildings', {
                                cullRadius: row.cullRadius
                            });
                        });
                    });
                    blockIndex += 1;
                }
            });
        }

        function addSkylinePanels() {
            const skylineMaterials = [
                new THREE.MeshBasicMaterial({
                    map: createTokyoSkylineTexture(0, environment),
                    transparent: true,
                    depthWrite: false,
                    side: THREE.DoubleSide
                }),
                new THREE.MeshBasicMaterial({
                    map: createTokyoSkylineTexture(1, environment),
                    transparent: true,
                    depthWrite: false,
                    side: THREE.DoubleSide
                })
            ];
            const layers = [
                { distance: 188, height: 78, step: 360, material: skylineMaterials[0], count: 8 },
                { distance: 312, height: 124, step: 420, material: skylineMaterials[1], count: 12 }
            ];

            layers.forEach((layer, layerIndex) => {
                [-1, 1].forEach(side => {
                    for (let z = startZ - layerIndex * 110; z > endZ; z -= layer.step) {
                        const roadData = getLinearRoadDataAtZ(z);
                        const roadPose = getRoadDataAtZ(z, game);
                        const x = roadData.curve + side * (halfRoadWidth + layer.distance);
                        const panel = new THREE.Mesh(new THREE.PlaneGeometry(layer.step * 1.24, layer.height), layer.material);
                        panel.name = 'city-tokyo-distant-skyline';
                        panel.position.set(x, getPropGroundY(x, z, 44) + layer.height * 0.5 - 1.2, z);
                        panel.rotation.y = side > 0 ? -Math.PI / 2 - roadPose.curvatureAngle : Math.PI / 2 - roadPose.curvatureAngle;
                        addTokyoObject(panel, 'buildings', {
                            cullRadius: 560,
                            count: layer.count,
                            receiveShadow: false
                        });
                    }
                });
            });
        }

        function getTokyoRoadAlignedPlacement(z, side, offsetFromRoadEdge, heightOffset, length) {
            const front = getRoadsidePose(z - length * 0.5, side, offsetFromRoadEdge);
            const rear = getRoadsidePose(z + length * 0.5, side, offsetFromRoadEdge);
            const start = new THREE.Vector3(rear.x, rear.roadY + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.roadY + heightOffset, front.z);
            const forward = end.clone().sub(start).normalize();
            const right = localUp.clone().cross(forward).normalize();
            const up = forward.clone().cross(right).normalize();
            const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
            return {
                position: start.clone().add(end).multiplyScalar(0.5),
                quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix)
            };
        }

        function getTokyoRoadSurfacePlacement(z, heightOffset, length) {
            const front = getLinearRoadDataAtZ(z - length * 0.5);
            const rear = getLinearRoadDataAtZ(z + length * 0.5);
            const start = new THREE.Vector3(rear.curve, rear.y + heightOffset, z + length * 0.5);
            const end = new THREE.Vector3(front.curve, front.y + heightOffset, z - length * 0.5);
            const forward = end.clone().sub(start).normalize();
            const right = localUp.clone().cross(forward).normalize();
            const up = forward.clone().cross(right).normalize();
            const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
            return {
                position: start.clone().add(end).multiplyScalar(0.5),
                quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix)
            };
        }

        function addRoadsideBarriers() {
            const barrierLength = 7.8;
            for (let z = startZ - 10; z > endZ; z -= 58) {
                [-1, 1].forEach(side => {
                    const placement = getTokyoRoadAlignedPlacement(z, side, 0.9, 0, barrierLength);
                    const barrier = new THREE.Group();
                    barrier.name = 'city-tokyo-road-edge-barrier';
                    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.76, barrierLength), barrierMaterial);
                    wall.position.y = 0.38;
                    barrier.add(wall);
                    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, barrierLength + 0.12), curbMaterial);
                    cap.position.y = 0.82;
                    barrier.add(cap);
                    if (Math.floor(Math.abs(z) / 54) % 3 === 0) {
                        const reflector = new THREE.Mesh(
                            new THREE.PlaneGeometry(0.34, 0.18),
                            new THREE.MeshBasicMaterial({ color: side > 0 ? 0xff344d : 0x4fd9ff, transparent: true, opacity: 0.76 })
                        );
                        reflector.position.set(-side * 0.255, 0.56, 0);
                        reflector.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
                        barrier.add(reflector);
                    }
                    barrier.position.copy(placement.position);
                    barrier.quaternion.copy(placement.quaternion);
                    addTokyoObject(barrier, 'guardrails', { cullRadius: 70 });
                });
            }
        }

        function addTokyoStreetLights() {
            const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x1d2730, shininess: 24 });
            const glowMaterials = [
                new THREE.MeshBasicMaterial({ color: 0xffe9af, transparent: true, opacity: 0.82 }),
                new THREE.MeshBasicMaterial({ color: 0x9feeff, transparent: true, opacity: 0.7 })
            ];

            for (let z = startZ - 28; z > endZ; z -= 220) {
                [-1, 1].forEach(side => {
                    const pose = getRoadsidePose(z, side, 3.2);
                    const height = 7.8 + Math.random() * 1.4;
                    const lamp = new THREE.Group();
                    lamp.name = 'city-tokyo-streetlight';
                    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, height, 8), poleMaterial);
                    pole.position.y = height * 0.5;
                    lamp.add(pole);
                    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.08), poleMaterial);
                    arm.position.set(-side * 0.98, height - 0.28, 0);
                    lamp.add(arm);
                    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glowMaterials[Math.floor(Math.random() * glowMaterials.length)]);
                    bulb.position.set(-side * 2.0, height - 0.34, 0);
                    lamp.add(bulb);
                    lamp.position.set(pose.x, pose.roadY, z);
                    lamp.rotation.y = pose.yaw;
                    addTokyoObject(lamp, 'streetLights', { cullRadius: 105 });

                    if (isNight) {
                        const lightPosition = new THREE.Vector3(-side * 2.0, height - 0.34, 0)
                            .applyAxisAngle(localUp, lamp.rotation.y)
                            .add(lamp.position);
                        addDecorPointLight(decor, bulb.material.color.getHex(), 0.72, 19, 2, lightPosition, 14);
                    }
                });
            }
        }

        function addElevatedHighwaySupports() {
            const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x81888b, shininess: 10, specular: 0x2b3033 });
            const deckEdgeMaterial = new THREE.MeshPhongMaterial({ color: 0xb9bfc1, shininess: 12, specular: 0x30363a });

            for (let z = startZ - 70; z > endZ; z -= 92) {
                const roadData = getLinearRoadDataAtZ(z);
                if ((roadData.highwayElevation || 0) < 2.4) {
                    continue;
                }
                const roadPose = getRoadDataAtZ(z, game);
                const groundY = roadData.y - roadData.highwayElevation + 0.18;
                const columnHeight = Math.max(1.2, roadData.y - groundY - 0.38);

                if (Math.floor(Math.abs(z) / 184) % 2 === 0) {
                    [-1, 1].forEach(side => {
                        const support = new THREE.Group();
                        support.name = 'city-tokyo-elevated-highway-support';
                        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, columnHeight, 10), supportMaterial);
                        column.position.set(side * (halfRoadWidth * 0.58), groundY + columnHeight * 0.5, 0);
                        support.add(column);
                        const head = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.45, 1.3), supportMaterial);
                        head.position.set(side * (halfRoadWidth * 0.58), roadData.y - 0.32, 0);
                        support.add(head);
                        support.position.set(roadData.curve, 0, z);
                        support.rotation.y = -roadPose.curvatureAngle;
                        addTokyoObject(support, 'buildings', { cullRadius: 170, count: 0 });
                    });
                }

                if (Math.floor(Math.abs(z) / 184) % 2 === 1) {
                    [-1, 1].forEach(side => {
                        const placement = getTokyoRoadAlignedPlacement(z, side, 0.42, 0.54, 68);
                        const deckWall = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.05, 68), deckEdgeMaterial);
                        deckWall.name = 'city-tokyo-elevated-highway-sidewall';
                        deckWall.position.copy(placement.position);
                        deckWall.quaternion.copy(placement.quaternion);
                        addTokyoObject(deckWall, 'guardrails', { cullRadius: 128 });
                    });
                }
            }
        }

        function addPedestrianOverpasses() {
            const deckMaterial = new THREE.MeshPhongMaterial({ color: 0xc7ccca, shininess: 16, specular: 0x384047 });
            const railMat = new THREE.MeshPhongMaterial({ color: 0x303941, shininess: 16, specular: 0x3c4650 });
            const stairMaterial = new THREE.MeshPhongMaterial({ color: 0xaeb5b4, shininess: 8, specular: 0x2e3436 });
            const signMaterial = new THREE.MeshBasicMaterial({
                map: createTokyoSignTexture('PEDESTRIAN DECK', { accent: '#55e4ff', secondary: '#ffe15c', subtitle: 'TOKYO CROSSING' }),
                transparent: true
            });

            for (let z = startZ - 580; z > endZ; z -= 1120) {
                const roadData = getLinearRoadDataAtZ(z);
                if ((roadData.highwayElevation || 0) > 5.5) {
                    continue;
                }
                const roadPose = getRoadDataAtZ(z, game);
                const overpass = new THREE.Group();
                overpass.name = 'city-tokyo-pedestrian-overpass';
                const deckWidth = game.road.width + 24;
                const deckY = roadData.y + 6.4;
                const deck = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.34, 2.7), deckMaterial);
                deck.position.y = deckY;
                overpass.add(deck);

                [-1, 1].forEach(side => {
                    const railA = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 0.16, 0.12), railMat);
                    railA.position.set(0, deckY + 0.72, side * 1.16);
                    overpass.add(railA);

                    const stairTower = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.1, 2.2), stairMaterial);
                    stairTower.name = 'city-tokyo-overpass-stair';
                    stairTower.position.set(side * (halfRoadWidth + 8.5), roadData.y + 3.05, 0);
                    overpass.add(stairTower);

                    const ramp = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 2.0), stairMaterial);
                    ramp.name = 'city-tokyo-overpass-stair-ramp';
                    ramp.position.set(side * (halfRoadWidth + 13.0), roadData.y + 2.95, -2.7);
                    ramp.rotation.z = side * 0.42;
                    overpass.add(ramp);
                });

                const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.7), signMaterial);
                sign.name = 'city-tokyo-overpass-sign';
                sign.position.set(0, deckY + 1.0, 1.42);
                overpass.add(sign);

                overpass.position.set(roadData.curve, 0, z);
                overpass.rotation.y = -roadPose.curvatureAngle;
                addTokyoObject(overpass, 'buildings', { cullRadius: 190, count: 1 });
            }
        }

        function addGantrySigns() {
            const signMaterials = [
                new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('SHUTO EXPWY', { accent: '#47dfff', secondary: '#ff4da6', subtitle: 'TOKYO C1' }), transparent: true }),
                new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('SHIBUYA EXIT', { accent: '#54ffa8', secondary: '#ffd84e', subtitle: 'LEFT 600M' }), transparent: true }),
                new THREE.MeshBasicMaterial({ map: createTokyoSignTexture('BAY ROUTE', { accent: '#ffe15c', secondary: '#4bdfff', subtitle: 'RAINBOW BRIDGE' }), transparent: true })
            ];

            for (let z = startZ - 220; z > endZ; z -= 680) {
                const roadData = getLinearRoadDataAtZ(z);
                const roadPose = getRoadDataAtZ(z, game);
                const gantry = new THREE.Group();
                gantry.name = 'city-tokyo-overhead-gantry';
                const width = game.road.width + 11;
                const beam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.34, 0.36), gantryMaterial);
                beam.position.y = 7.1;
                gantry.add(beam);
                [-1, 1].forEach(side => {
                    const post = new THREE.Mesh(new THREE.BoxGeometry(0.34, 7.1, 0.34), gantryMaterial);
                    post.position.set(side * (halfRoadWidth + 4.6), 3.55, 0);
                    gantry.add(post);
                });
                const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 3.0), signMaterials[Math.floor(Math.random() * signMaterials.length)]);
                sign.name = 'city-tokyo-overhead-route-sign';
                sign.position.set(0, 5.7, 0.22);
                gantry.add(sign);
                gantry.position.set(roadData.curve, roadData.y, z);
                gantry.rotation.y = -roadPose.curvatureAngle;
                addTokyoObject(gantry, 'billboards', { cullRadius: 185 });
            }
        }

        function addZebraCrosswalks() {
            for (let z = startZ - 315; z > endZ; z -= 860) {
                const crossing = new THREE.Group();
                crossing.name = 'city-tokyo-zebra-crosswalk';
                const stripeCount = 8;
                const crossingWidth = game.road.width * 0.74;
                const stripeWidth = 0.46;
                const stripeLength = 5.4;
                const placement = getTokyoRoadSurfacePlacement(z, 0.095, stripeLength);
                const stripeGap = (crossingWidth - stripeCount * stripeWidth) / (stripeCount - 1);
                const firstStripeX = -crossingWidth * 0.5 + stripeWidth * 0.5;
                for (let i = 0; i < stripeCount; i++) {
                    const stripe = new THREE.Mesh(new THREE.BoxGeometry(stripeWidth, 0.018, stripeLength), crosswalkMaterial);
                    stripe.name = 'city-tokyo-crosswalk-stripe';
                    stripe.position.x = firstStripeX + i * (stripeWidth + stripeGap);
                    crossing.add(stripe);
                }
                crossing.position.copy(placement.position);
                crossing.quaternion.copy(placement.quaternion);
                addTokyoObject(crossing, null, { cullRadius: 105 });
            }
        }

        function addTokyoLandmarks() {
            const redMaterial = new THREE.MeshPhongMaterial({ color: 0xdb2f2f, shininess: 22, emissive: isNight ? 0x240202 : 0x000000, emissiveIntensity: isNight ? 0.35 : 0 });
            const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f1e8, shininess: 18 });
            const steelMaterial = new THREE.MeshPhongMaterial({ color: 0xaab4bc, shininess: 36, specular: 0x6f7d86, emissive: isNight ? 0x101820 : 0x000000, emissiveIntensity: isNight ? 0.2 : 0 });
            const glassMaterial = new THREE.MeshBasicMaterial({ color: isNight ? 0x9be8ff : 0xb9dce6, transparent: true, opacity: isNight ? 0.78 : 0.42 });
            const deckMaterial = new THREE.MeshBasicMaterial({ color: isNight ? 0xffd36b : 0xf4e2a4, transparent: true, opacity: isNight ? 0.9 : 0.58 });

            const towerZ = game.finishLine + 430;
            const towerPose = getRoadsidePose(towerZ, 1, 86);
            const tower = new THREE.Group();
            tower.name = 'city-tokyo-tower-landmark';
            let y = 0;
            for (let i = 0; i < 11; i++) {
                const segmentHeight = 8.9;
                const radius = 2.15 - i * 0.145;
                const section = new THREE.Mesh(
                    new THREE.CylinderGeometry(Math.max(0.42, radius * 0.74), radius, segmentHeight, 4, 1, true),
                    i % 2 === 0 ? redMaterial : whiteMaterial
                );
                section.position.y = y + segmentHeight * 0.5;
                tower.add(section);

                if (i % 2 === 0) {
                    const brace = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.8, 0.18, 0.18), i % 4 === 0 ? whiteMaterial : redMaterial);
                    brace.name = 'city-tokyo-tower-cross-brace';
                    brace.position.y = y + segmentHeight * 0.5;
                    brace.rotation.y = Math.PI / 4;
                    tower.add(brace);
                    const braceB = brace.clone();
                    braceB.rotation.y = -Math.PI / 4;
                    tower.add(braceB);
                }
                y += segmentHeight;
            }
            const deck = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 5.6, 2.4, 12), deckMaterial);
            deck.position.y = 54;
            tower.add(deck);
            const upperDeck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.1, 1.7, 10), deckMaterial);
            upperDeck.position.y = 87;
            tower.add(upperDeck);
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.28, 34, 8), redMaterial);
            mast.position.y = 116;
            tower.add(mast);
            tower.position.set(towerPose.x, getPropGroundY(towerPose.x, towerZ, 8), towerZ);
            tower.rotation.y = towerPose.yaw + 0.28;
            addTokyoObject(tower, 'buildings', { cullRadius: 1300, count: 5 });

            const skytreeZ = game.finishLine + 780;
            const skytreePose = getRoadsidePose(skytreeZ, -1, 138);
            const skytree = new THREE.Group();
            skytree.name = 'city-tokyo-skytree-landmark';
            const baseLegRadius = 10;
            [-1, 1].forEach(side => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 76, 8), steelMaterial);
                leg.name = 'city-tokyo-skytree-sloped-leg';
                leg.position.set(side * baseLegRadius * 0.34, 38, 0);
                leg.rotation.z = -side * 0.12;
                skytree.add(leg);
            });
            const core = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.86, 124, 12), steelMaterial);
            core.name = 'city-tokyo-skytree-core';
            core.position.y = 62;
            skytree.add(core);
            const lowerDeck = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 6.2, 3.2, 18), glassMaterial);
            lowerDeck.name = 'city-tokyo-skytree-observation-deck';
            lowerDeck.position.y = 74;
            skytree.add(lowerDeck);
            const upperDeckMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.9, 2.4, 18), glassMaterial);
            upperDeckMesh.name = 'city-tokyo-skytree-upper-deck';
            upperDeckMesh.position.y = 101;
            skytree.add(upperDeckMesh);
            const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.28, 44, 8), steelMaterial);
            spire.name = 'city-tokyo-skytree-spire';
            spire.position.y = 145;
            skytree.add(spire);
            skytree.position.set(skytreePose.x, getPropGroundY(skytreePose.x, skytreeZ, 8), skytreeZ);
            skytree.rotation.y = skytreePose.yaw - 0.18;
            addTokyoObject(skytree, 'buildings', { cullRadius: 1500, count: 5 });
        }

        placeBuildingRows();
        addSkylinePanels();
        addRoadsideBarriers();
        addTokyoStreetLights();
        addElevatedHighwaySupports();
        addPedestrianOverpasses();
        addGantrySigns();
        addZebraCrosswalks();
        addTokyoLandmarks();
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
        const rainforestNoise = new SimplexNoise();
        const barkTexture = loadImageIntoTexture(createJungleBarkTexture(256, 512, 1.1, 4), 'assets/textures/polyhaven/bark_willow_diff_1k.jpg');
        const barkNormalTexture = loadImageIntoTexture(createJungleBarkTexture(256, 512, 1.1, 4), 'assets/textures/polyhaven/bark_willow_nor_gl_1k.jpg');
        const leafTexture = createJungleLeafTexture(512, 512, 3, 3);
        const leafDarkTexture = createJungleLeafTexture(512, 512, 2.2, 2.2);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2f20, map: barkTexture, shininess: 3, specular: 0x15100c });
        const trunkDarkMaterial = new THREE.MeshPhongMaterial({ color: 0x2d1f16, map: barkTexture, shininess: 3, specular: 0x100c08 });
        const canopyMaterial = new THREE.MeshPhongMaterial({ color: 0x1d5d33, map: leafTexture, shininess: 5, specular: 0x0d1c10 });
        const canopyDarkMaterial = new THREE.MeshPhongMaterial({ color: 0x103d27, map: leafDarkTexture, shininess: 4, specular: 0x07110a });
        const canopyShadowMaterial = new THREE.MeshPhongMaterial({ color: 0x0b2b1d, map: leafDarkTexture, shininess: 3, specular: 0x050b07 });
        const canopyHighlightMaterial = new THREE.MeshPhongMaterial({ color: 0x2d7440, map: leafTexture, shininess: 6, specular: 0x142917 });
        const vineMaterial = new THREE.MeshPhongMaterial({ color: 0x263d20, shininess: 4 });
        const rootMaterial = new THREE.MeshPhongMaterial({ color: 0x352717, shininess: 4 });
        const leafCardMaterial = new THREE.MeshPhongMaterial({
            color: 0x256f3f,
            map: leafTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.78,
            shininess: 9,
            specular: 0x18391f
        });
        const fernMaterial = new THREE.MeshPhongMaterial({
            color: 0x3f8240,
            map: leafTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.82,
            shininess: 9,
            specular: 0x1f3c22
        });
        const palmLeafMaterial = new THREE.MeshPhongMaterial({
            color: 0x237d43,
            map: leafTexture,
            side: THREE.DoubleSide,
            shininess: 14,
            specular: 0x1d3c23
        });
        const tropicalLeafMaterial = new THREE.MeshPhongMaterial({
            color: 0x2f9651,
            map: leafTexture,
            side: THREE.DoubleSide,
            shininess: 18,
            specular: 0x2e5f34
        });
        const tropicalLeafDarkMaterial = new THREE.MeshPhongMaterial({
            color: 0x14522f,
            map: leafDarkTexture,
            side: THREE.DoubleSide,
            shininess: 12,
            specular: 0x17351d
        });
        const generation = {
            complexity: 0.75,
            trailLength: Math.abs(game.finishLine - game.startLine),
            trailWidth: game.road.width,
            trailCurve: 0.45,
            bankHeight: 2.5,
            density: 1,
            canopyCover: 0.95,
            treeCount: 24,
            understoryHeight: 6.5,
            rockCount: 24,
            vines: 12,
            ...(environment.jungleGeneration || {})
        };
        const detail = (min, max) => Math.max(min, Math.round(min + (max - min) * generation.complexity));
        const densityScale = THREE.MathUtils.clamp(generation.density, 0, 1.35);
        const canopyScale = THREE.MathUtils.clamp(generation.canopyCover, 0, 1.2);
        const treeScale = densityScale * THREE.MathUtils.clamp(generation.treeCount / 34, 0, 2.2);
        const understoryScale = densityScale * THREE.MathUtils.clamp(generation.understoryHeight / 7.2, 0, 2);
        const vineScale = densityScale * THREE.MathUtils.clamp(generation.vines / 18, 0, 2.2);
        const rockScale = THREE.MathUtils.clamp(generation.rockCount / 30, 0, 2.2);
        const scaledStep = (base, scale) => base / Math.max(0.22, scale);
        const startZ = game.startLine + 70;
        const postFinishVegetation = Math.max(0, generation.postFinishVegetation ?? 720);
        const endZ = game.finishLine - postFinishVegetation;
        const jungleAssetCache = environment.assetCache || {};
        const tallTreeAssets = ['tallTreeA', 'tallTreeB', 'tallTreeC']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const smallTreeAssets = ['smallTreeA', 'smallTreeB']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const fernAssets = ['fernA', 'fernB']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const kenneyTreeAssets = ['palmDetailedTall', 'palmTall', 'palmBend', 'palmDetailedShort']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const kenneyUnderstoryAssets = ['bushLargeTriangle', 'bushDetailed', 'plantFlatTall', 'grassLeafsLarge', 'grassLeafs']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const kenneyGroundAssets = ['logLarge', 'stumpOld', 'rockLarge', 'rockSmall']
            .map(key => jungleAssetCache[key])
            .filter(asset => asset?.scene);
        const tallTreeLimit = tallTreeAssets.length ? Math.round(14 * treeScale) : 0;
        const smallTreeLimit = smallTreeAssets.length ? Math.round(18 * treeScale) : 0;
        const fernLimit = fernAssets.length ? Math.round(54 * understoryScale) : 0;
        const kenneyTreeLimit = kenneyTreeAssets.length ? Math.round(22 * treeScale) : 0;
        const kenneyUnderstoryLimit = kenneyUnderstoryAssets.length ? Math.round(86 * understoryScale) : 0;
        const kenneyGroundLimit = kenneyGroundAssets.length ? Math.round(34 * Math.max(densityScale, rockScale)) : 0;

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

        function cloneJungleAssetMaterial(material) {
            if (!material) {
                return material;
            }

            const cloned = material.clone();
            cloned.userData.keepTextureMaps = true;
            if ('roughness' in cloned) {
                cloned.roughness = Math.max(cloned.roughness || 0.5, 0.8);
            }
            if ('metalness' in cloned) {
                cloned.metalness = Math.min(cloned.metalness || 0, 0.04);
            }
            if (cloned.color) {
                cloned.color.offsetHSL(-0.015, 0.02, -0.025);
            }
            cloned.needsUpdate = true;
            return cloned;
        }

        function getGeometryTriangleCount(geometry) {
            if (!geometry) {
                return 0;
            }
            if (geometry.index) {
                return Math.floor(geometry.index.count / 3);
            }
            return Math.floor((geometry.attributes?.position?.count || 0) / 3);
        }

        function getAssetBatchData(asset) {
            if (!asset?.scene) {
                return null;
            }
            if (asset.userData?.jungleBatchData) {
                return asset.userData.jungleBatchData;
            }

            asset.scene.updateMatrixWorld(true);
            const sourceBox = new THREE.Box3().setFromObject(asset.scene);
            const size = sourceBox.getSize(new THREE.Vector3());
            const center = sourceBox.getCenter(new THREE.Vector3());
            const normalizeMatrix = new THREE.Matrix4()
                .makeTranslation(-center.x, -sourceBox.min.y, -center.z);
            const meshes = [];
            let meshCount = 0;
            let materialCount = 0;
            let triangleCount = 0;

            asset.scene.traverse(child => {
                if (!child.isMesh) {
                    return;
                }

                const material = Array.isArray(child.material)
                    ? child.material.map(cloneJungleAssetMaterial)
                    : cloneJungleAssetMaterial(child.material);
                meshes.push({
                    name: child.name || `mesh-${meshes.length}`,
                    geometry: child.geometry,
                    material,
                    localMatrix: child.matrixWorld.clone(),
                    triangles: getGeometryTriangleCount(child.geometry)
                });
                meshCount += 1;
                materialCount += Array.isArray(child.material) ? child.material.length : 1;
                triangleCount += getGeometryTriangleCount(child.geometry);
            });

            const data = {
                assetName: asset.assetName || asset.key || 'jungle-asset',
                height: Math.max(0.001, size.y),
                normalizeMatrix,
                meshes,
                audit: {
                    asset: asset.assetName || asset.key || 'jungle-asset',
                    meshes: meshCount,
                    materials: materialCount,
                    triangles: triangleCount
                }
            };
            asset.userData = asset.userData || {};
            asset.userData.jungleBatchData = data;
            return data;
        }

        function createJungleAssetClone(asset, targetHeight = 14) {
            if (!asset?.scene) {
                return null;
            }

            const wrapper = new THREE.Group();
            wrapper.name = `jungle-uploaded-asset-${asset.assetName || asset.key || 'model'}`;
            const clone = asset.scene.clone(true);
            clone.traverse(child => {
                if (!child.isMesh) {
                    return;
                }

                child.castShadow = false;
                child.receiveShadow = true;
                child.userData.keepGeometry = true;
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(cloneJungleAssetMaterial);
                } else {
                    child.material = cloneJungleAssetMaterial(child.material);
                }
            });

            const sourceBox = new THREE.Box3().setFromObject(clone);
            const size = sourceBox.getSize(new THREE.Vector3());
            clone.scale.multiplyScalar(targetHeight / Math.max(0.001, size.y));

            const fittedBox = new THREE.Box3().setFromObject(clone);
            const center = fittedBox.getCenter(new THREE.Vector3());
            clone.position.x -= center.x;
            clone.position.z -= center.z;
            clone.position.y -= fittedBox.min.y;
            wrapper.add(clone);
            return wrapper;
        }

        function createJungleBillboardTexture(label, colorTop, colorBottom) {
            const canvas = document.createElement('canvas');
            canvas.width = 192;
            canvas.height = 384;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            const trunk = context.createLinearGradient(88, 0, 108, 0);
            trunk.addColorStop(0, '#2c1d12');
            trunk.addColorStop(0.5, '#5b3922');
            trunk.addColorStop(1, '#1c120b');
            context.fillStyle = trunk;
            context.fillRect(88, 156, 16, 212);

            for (let layer = 0; layer < 5; layer++) {
                const y = 72 + layer * 40;
                const width = 132 - layer * 10;
                const height = 80 - layer * 7;
                const leafGradient = context.createLinearGradient(0, y - height * 0.6, 0, y + height * 0.7);
                leafGradient.addColorStop(0, colorTop);
                leafGradient.addColorStop(0.58, colorBottom);
                leafGradient.addColorStop(1, 'rgba(9,48,24,0.18)');
                context.fillStyle = leafGradient;
                context.beginPath();
                context.moveTo(96, y - height * 0.62);
                context.bezierCurveTo(96 - width * 0.56, y - height * 0.1, 96 - width * 0.5, y + height * 0.42, 96, y + height * 0.58);
                context.bezierCurveTo(96 + width * 0.5, y + height * 0.42, 96 + width * 0.56, y - height * 0.1, 96, y - height * 0.62);
                context.fill();
            }

            context.globalAlpha = 0.7;
            context.strokeStyle = colorTop;
            context.lineWidth = 7;
            for (let i = 0; i < 16; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const y = 72 + (i % 8) * 25;
                const length = 36 + (i % 5) * 8;
                context.beginPath();
                context.moveTo(96, y);
                context.quadraticCurveTo(96 + side * length * 0.45, y + 14, 96 + side * length, y + 34);
                context.stroke();
            }
            context.globalAlpha = 1;

            context.fillStyle = colorBottom;
            for (let i = 0; i < 9; i++) {
                const y = 82 + i * 22;
                context.beginPath();
                context.ellipse(96 + Math.sin(i * 2.1) * 20, y, 48 - i * 2, 18, Math.sin(i) * 0.2, 0, Math.PI * 2);
                context.fill();
            }

            context.globalAlpha = 0.38;
            context.fillStyle = '#d6f2a8';
            for (let i = 0; i < 80; i++) {
                context.fillRect(36 + Math.random() * 120, 42 + Math.random() * 190, 1 + Math.random() * 3, 1 + Math.random() * 4);
            }
            context.globalAlpha = 1;

            const texture = new THREE.CanvasTexture(canvas);
            texture.name = label;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.anisotropy = 2;
            if (THREE.sRGBEncoding) {
                texture.encoding = THREE.sRGBEncoding;
            }
            return texture;
        }

        function createJungleInstancedAssetBatch(asset, placements, statsKey, options = {}) {
            const data = getAssetBatchData(asset);
            if (!data || !placements.length || !data.meshes.length) {
                return null;
            }

            const group = new THREE.Group();
            group.name = `jungle-instanced-${data.assetName}`;
            const maxCount = placements.length;
            const fullMeshes = data.meshes.map((entry, meshIndex) => {
                const mesh = new THREE.InstancedMesh(entry.geometry, entry.material, maxCount);
                mesh.name = `jungle-instanced-${data.assetName}-${meshIndex}`;
                mesh.castShadow = false;
                mesh.receiveShadow = true;
                mesh.frustumCulled = false;
                mesh.count = 0;
                group.add(mesh);
                return { mesh, entry };
            });

            const billboardTexture = createJungleBillboardTexture(
                `${data.assetName}-billboard`,
                options.billboardTop || 'rgba(109,165,78,0.96)',
                options.billboardBottom || 'rgba(22,91,43,0.94)'
            );
            const billboardMaterial = new THREE.MeshBasicMaterial({
                map: billboardTexture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: 0xffffff
            });
            const billboard = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1.9), billboardMaterial, maxCount);
            billboard.name = `jungle-billboard-${data.assetName}`;
            billboard.castShadow = false;
            billboard.receiveShadow = false;
            billboard.frustumCulled = false;
            billboard.count = 0;
            group.add(billboard);

            decor.add(group);
            stageDecorStats.totalInstancedProps += placements.length;
            if (statsKey) {
                stageDecorStats[statsKey] += placements.length;
            }

            const placementMatrix = new THREE.Matrix4();
            const scaleMatrix = new THREE.Matrix4();
            const normalizedMatrix = new THREE.Matrix4();
            const finalMatrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            const billboardScale = new THREE.Vector3();
            const billboardQuaternion = new THREE.Quaternion();
            const billboardMatrix = new THREE.Matrix4();

            const batch = {
                type: 'jungleInstancedVegetation',
                asset: data.assetName,
                statsKey,
                placements,
                audit: data.audit,
                fullMeshes,
                billboard,
                billboardEnabled: options.billboardEnabled === true,
                nearDistance: options.nearDistance || 245,
                farDistance: options.farDistance || 620,
                update(deltaSeconds, activeGame, activeCamera) {
                    const carZ = activeGame?.car?.position?.z ?? game.startLine;
                    const cameraQuaternion = activeCamera?.quaternion || billboardQuaternion.identity();
                    let fullCount = 0;
                    let billboardCount = 0;

                    placements.forEach(placement => {
                        const dz = Math.abs(placement.z - carZ);
                        if (dz > batch.farDistance || placement.z > carZ + 110 || placement.z < carZ - 560) {
                            return;
                        }

                        position.set(placement.x, placement.y, placement.z);
                        quaternion.setFromEuler(new THREE.Euler(placement.rotationX || 0, placement.rotationY || 0, placement.rotationZ || 0));
                        const uniformScale = placement.targetHeight / data.height;
                        scale.set(uniformScale, uniformScale, uniformScale);
                        placementMatrix.compose(position, quaternion, scale);

                        if (!batch.billboardEnabled || dz <= batch.nearDistance) {
                            fullMeshes.forEach(({ mesh, entry }) => {
                                finalMatrix
                                    .copy(placementMatrix)
                                    .multiply(data.normalizeMatrix)
                                    .multiply(entry.localMatrix);
                                mesh.setMatrixAt(fullCount, finalMatrix);
                            });
                            fullCount += 1;
                        } else {
                            position.y = placement.y + placement.targetHeight * 0.5;
                            billboardScale.set(placement.targetHeight * 0.5, placement.targetHeight, 1);
                            billboardMatrix.compose(position, cameraQuaternion, billboardScale);
                            billboard.setMatrixAt(billboardCount, billboardMatrix);
                            billboardCount += 1;
                        }
                    });

                    fullMeshes.forEach(({ mesh }) => {
                        mesh.count = fullCount;
                        mesh.instanceMatrix.needsUpdate = true;
                        mesh.visible = fullCount > 0;
                    });
                    billboard.count = billboardCount;
                    billboard.instanceMatrix.needsUpdate = true;
                    billboard.visible = batch.billboardEnabled && billboardCount > 0;
                    batch.visibleFull = fullCount;
                    batch.visibleBillboards = billboardCount;
                }
            };

            game.stageEffects = game.stageEffects || [];
            game.stageEffects.push(batch);
            game.jungleAssetDiagnostics = game.jungleAssetDiagnostics || [];
            game.jungleAssetDiagnostics.push({
                ...data.audit,
                placements: placements.length,
                instancedDrawCalls: data.meshes.length,
                statsKey
            });
            return batch;
        }

        function placeUploadedJungleTrees() {
            let placedTallTrees = 0;
            let placedSmallTrees = 0;
            let placedFerns = 0;
            let placedKenneyTrees = 0;
            let placedKenneyUnderstory = 0;
            let placedKenneyGround = 0;
            const placementsByAsset = new Map();

            function addAssetPlacement(asset, placement) {
                if (!asset) {
                    return;
                }
                const key = asset.assetName || asset.key || asset.url || `asset-${placementsByAsset.size}`;
                if (!placementsByAsset.has(key)) {
                    placementsByAsset.set(key, {
                        asset,
                        statsKey: placement.statsKey,
                        options: placement.options || {},
                        placements: []
                    });
                }
                placementsByAsset.get(key).placements.push(placement);
            }

            function addBatchedAsset(asset, point, targetHeight, statsKey, options = {}) {
                addAssetPlacement(asset, {
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    rotationY: Math.random() * Math.PI * 2,
                    targetHeight,
                    statsKey,
                    options
                });
            }

            for (let z = startZ - 58; z > endZ; z -= scaledStep(185, treeScale)) {
                [-1, 1].forEach(side => {
                    const canPlaceTall = placedTallTrees < tallTreeLimit && tallTreeAssets.length > 0;
                    const canPlaceSmall = placedSmallTrees < smallTreeLimit && smallTreeAssets.length > 0;
                    if (!canPlaceTall && !canPlaceSmall) {
                        return;
                    }

                    const useTallTree = canPlaceTall && (placedTallTrees < 4 || Math.random() < 0.46 || !canPlaceSmall);
                    const assetList = useTallTree ? tallTreeAssets : smallTreeAssets;
                    const asset = assetList[Math.floor(Math.random() * assetList.length)];
                    const targetHeight = useTallTree
                        ? 24 + Math.random() * 18
                        : 7.5 + Math.random() * 9;
                    const offset = useTallTree
                        ? 11 + Math.random() * 26
                        : 5.4 + Math.random() * 17;
                    const treeZ = z + (Math.random() - 0.5) * 54;
                    const point = getJunglePoint(treeZ, side, offset, 5.2);
                    if (getTerrainNormalAt(point.x, point.z, 2.4).y < 0.55) {
                        return;
                    }

                    const tree = createJungleAssetClone(asset, targetHeight);
                    if (!tree) {
                        return;
                    }
                    tree.name = useTallTree ? 'jungle-uploaded-tall-tree' : 'jungle-uploaded-small-tree';
                    tree.position.set(point.x, point.y, point.z);
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    tree.frustumCulled = true;
                    addDecorGroup(decor, tree, 'trees');
                    if (useTallTree) {
                        placedTallTrees += 1;
                    } else {
                        placedSmallTrees += 1;
                    }
                });

                if (fernAssets.length && placedFerns < fernLimit) {
                    [-1, 1].forEach(side => {
                        if (placedFerns >= fernLimit) {
                            return;
                        }
                        const fernCount = 2 + Math.floor(Math.random() * 3);
                        for (let i = 0; i < fernCount && placedFerns < fernLimit; i++) {
                            const fernZ = z + (Math.random() - 0.5) * 68;
                            const point = getJunglePoint(fernZ, side, 2.2 + Math.random() * 10, 2.2);
                            if (getTerrainNormalAt(point.x, point.z, 1.6).y < 0.52) {
                                continue;
                            }

                            const fernAsset = fernAssets[Math.floor(Math.random() * fernAssets.length)];
                            addAssetPlacement(fernAsset, {
                                x: point.x,
                                y: point.y,
                                z: point.z,
                                rotationY: Math.random() * Math.PI * 2,
                                targetHeight: 1.0 + Math.random() * 1.6,
                                statsKey: 'junglePlants',
                                options: {
                                    nearDistance: 160,
                                    farDistance: 380,
                                    billboardEnabled: true,
                                    billboardTop: 'rgba(97,170,74,0.94)',
                                    billboardBottom: 'rgba(26,101,39,0.92)'
                                }
                            });
                        placedFerns += 1;
                        }
                    });
                }

                if (kenneyTreeAssets.length && placedKenneyTrees < kenneyTreeLimit) {
                    [-1, 1].forEach(side => {
                        if (placedKenneyTrees >= kenneyTreeLimit || Math.random() > 0.72 * densityScale) {
                            return;
                        }
                        const asset = kenneyTreeAssets[Math.floor(Math.random() * kenneyTreeAssets.length)];
                        const treeZ = z + (Math.random() - 0.5) * 78;
                        const point = getJunglePoint(treeZ, side, 7 + Math.random() * 34, 4.8);
                        if (getTerrainNormalAt(point.x, point.z, 2.2).y < 0.52) {
                            return;
                        }
                        addBatchedAsset(asset, point, 7.5 + Math.random() * 11, 'trees', {
                            nearDistance: 210,
                            farDistance: 520,
                            billboardEnabled: true
                        });
                        placedKenneyTrees += 1;
                    });
                }

                if (kenneyUnderstoryAssets.length && placedKenneyUnderstory < kenneyUnderstoryLimit) {
                    [-1, 1].forEach(side => {
                        const clumpCount = Math.min(5, Math.max(1, Math.round(1 + Math.random() * 3 * understoryScale)));
                        for (let i = 0; i < clumpCount && placedKenneyUnderstory < kenneyUnderstoryLimit; i++) {
                            const plantZ = z + (Math.random() - 0.5) * 96;
                            const point = getJunglePoint(plantZ, side, 1.8 + Math.random() * 13, 2.2);
                            if (getTerrainNormalAt(point.x, point.z, 1.4).y < 0.48) {
                                continue;
                            }
                            const asset = kenneyUnderstoryAssets[Math.floor(Math.random() * kenneyUnderstoryAssets.length)];
                            addBatchedAsset(asset, point, 0.9 + Math.random() * 2.2, 'junglePlants', {
                                nearDistance: 150,
                                farDistance: 360,
                                billboardEnabled: true,
                                billboardTop: 'rgba(91,169,70,0.94)',
                                billboardBottom: 'rgba(22,96,39,0.92)'
                            });
                            placedKenneyUnderstory += 1;
                        }
                    });
                }

                if (kenneyGroundAssets.length && placedKenneyGround < kenneyGroundLimit) {
                    [-1, 1].forEach(side => {
                        if (placedKenneyGround >= kenneyGroundLimit || Math.random() > 0.42 * Math.max(densityScale, rockScale)) {
                            return;
                        }
                        const groundZ = z + (Math.random() - 0.5) * 120;
                        const point = getJunglePoint(groundZ, side, 3.0 + Math.random() * 18, 2.5);
                        const asset = kenneyGroundAssets[Math.floor(Math.random() * kenneyGroundAssets.length)];
                        const isRockAsset = /rock/i.test(asset.assetName || asset.label || '');
                        addBatchedAsset(asset, point, 0.7 + Math.random() * 2.1, isRockAsset ? 'rockClusters' : 'junglePlants', {
                            nearDistance: 160,
                            farDistance: 420,
                            billboardEnabled: false
                        });
                        placedKenneyGround += 1;
                    });
                }

                if (placedTallTrees >= tallTreeLimit
                    && placedSmallTrees >= smallTreeLimit
                    && placedFerns >= fernLimit
                    && placedKenneyTrees >= kenneyTreeLimit
                    && placedKenneyUnderstory >= kenneyUnderstoryLimit
                    && placedKenneyGround >= kenneyGroundLimit) {
                    break;
                }
            }

            placementsByAsset.forEach(batch => {
                createJungleInstancedAssetBatch(batch.asset, batch.placements, batch.statsKey, batch.options);
            });
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

        function clampJungleXOutsideRoad(x, z, side, minClearance = 2.4) {
            const roadData = getLinearRoadDataAtZ(z);
            const minDistanceFromCenter = halfRoadWidth + shoulderWidth + minClearance;
            if (side < 0) {
                return Math.min(x, roadData.curve - minDistanceFromCenter);
            }
            return Math.max(x, roadData.curve + minDistanceFromCenter);
        }

        function getJunglePoint(z, side, offset, minClearance = 2.4) {
            const roadData = getLinearRoadDataAtZ(z);
            const safeOffset = Math.max(offset, minClearance);
            const x = roadData.curve + side * (halfRoadWidth + shoulderWidth + safeOffset);
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

        function addDistantRainforestWall() {
            const texture = createCanvasTexture(1024, 512, 1, Math.max(8, game.road.segments.length / 60), (context, width, height) => {
                const gradient = context.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, 'rgba(7,31,23,0)');
                gradient.addColorStop(0.18, 'rgba(13,53,32,0.78)');
                gradient.addColorStop(0.58, 'rgba(10,43,27,0.88)');
                gradient.addColorStop(1, 'rgba(8,29,20,0.16)');
                context.fillStyle = gradient;
                context.fillRect(0, 0, width, height);

                for (let i = 0; i < 170; i++) {
                    const x = Math.random() * width;
                    const trunkHeight = height * (0.42 + Math.random() * 0.5);
                    const y = height - trunkHeight + Math.random() * 80;
                    context.globalAlpha = 0.32 + Math.random() * 0.28;
                    context.strokeStyle = Math.random() < 0.5 ? '#1c2116' : '#29351d';
                    context.lineWidth = 1 + Math.random() * 3.4;
                    context.beginPath();
                    context.moveTo(x, height);
                    context.bezierCurveTo(x + (Math.random() - 0.5) * 16, height * 0.72, x + (Math.random() - 0.5) * 18, y, x + (Math.random() - 0.5) * 12, y);
                    context.stroke();
                }

                const leafColors = ['#123d28', '#18552f', '#0c2f21', '#226238', '#2f7241'];
                for (let i = 0; i < 520; i++) {
                    const x = Math.random() * width;
                    const y = height * (0.1 + Math.random() * 0.58);
                    const rx = 11 + Math.random() * 34;
                    const ry = 6 + Math.random() * 20;
                    context.globalAlpha = 0.18 + Math.random() * 0.32;
                    context.fillStyle = leafColors[Math.floor(Math.random() * leafColors.length)];
                    context.beginPath();
                    context.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
                    context.fill();
                }
                context.globalAlpha = 1;
            });

            const material = new THREE.MeshLambertMaterial({
                map: texture,
                color: 0x8fb69b,
                transparent: true,
                opacity: 0.72,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            [-1, 1].forEach(side => {
                const positions = [];
                const uvs = [];
                const indices = [];
                const distance = halfRoadWidth + shoulderWidth + 78;
                const sampleStride = 4;
                let rowIndex = 0;
                for (let i = 0; i < game.road.segments.length; i += sampleStride) {
                    const segment = game.road.segments[i];
                    const x = segment.curve + side * distance;
                    const y = getTerrainHeightAt(x, segment.z);
                    const wallHeight = 17 + Math.max(0, rainforestNoise.noise2D(i * 0.03, side * 12.3)) * 7;
                    positions.push(x, y + 1.2, segment.z, x, y + wallHeight, segment.z);
                    uvs.push(0, rowIndex * 0.08, 1, rowIndex * 0.08);
                    if (rowIndex > 0) {
                        const base = rowIndex * 2;
                        indices.push(base - 2, base - 1, base, base - 1, base + 1, base);
                    }
                    rowIndex++;
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
                const wall = new THREE.Mesh(geometry, material);
                wall.name = `jungle-distant-rainforest-wall-${side}`;
                wall.renderOrder = -2;
                decor.add(wall);
                stageDecorStats.canopy += 1;
            });
        }

        function addSegmentedRainforestBackdrop() {
            const backdropTexture = createCanvasTexture(512, 256, 1, 1, (context, width, height) => {
                context.clearRect(0, 0, width, height);
                const alphaMask = context.createLinearGradient(0, 0, width, 0);
                alphaMask.addColorStop(0, 'rgba(0,0,0,0)');
                alphaMask.addColorStop(0.16, 'rgba(0,0,0,1)');
                alphaMask.addColorStop(0.84, 'rgba(0,0,0,1)');
                alphaMask.addColorStop(1, 'rgba(0,0,0,0)');
                const groundGradient = context.createLinearGradient(0, height * 0.1, 0, height);
                groundGradient.addColorStop(0, 'rgba(12,40,27,0)');
                groundGradient.addColorStop(0.34, 'rgba(17,62,34,0.56)');
                groundGradient.addColorStop(0.72, 'rgba(9,31,22,0.72)');
                groundGradient.addColorStop(1, 'rgba(7,22,16,0)');
                context.fillStyle = groundGradient;
                context.fillRect(0, 0, width, height);

                for (let i = 0; i < 28; i++) {
                    const x = Math.random() * width;
                    const trunkTop = height * (0.22 + Math.random() * 0.34);
                    context.globalAlpha = 0.42 + Math.random() * 0.34;
                    context.strokeStyle = Math.random() < 0.5 ? '#171f14' : '#26351d';
                    context.lineWidth = 1.2 + Math.random() * 3.2;
                    context.beginPath();
                    context.moveTo(x, height);
                    context.bezierCurveTo(x + (Math.random() - 0.5) * 10, height * 0.72, x + (Math.random() - 0.5) * 14, trunkTop, x + (Math.random() - 0.5) * 8, trunkTop);
                    context.stroke();
                }

                const colors = ['#09271b', '#123a25', '#1b5531', '#0f3222', '#28663a'];
                for (let i = 0; i < 130; i++) {
                    context.globalAlpha = 0.2 + Math.random() * 0.36;
                    context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    context.beginPath();
                    context.ellipse(
                        Math.random() * width,
                        height * (0.1 + Math.random() * 0.52),
                        12 + Math.random() * 42,
                        8 + Math.random() * 28,
                        Math.random() * Math.PI,
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                }
                context.globalCompositeOperation = 'destination-in';
                context.fillStyle = alphaMask;
                context.fillRect(0, 0, width, height);
                context.globalCompositeOperation = 'source-over';
                context.globalAlpha = 1;
            });

            const material = new THREE.MeshLambertMaterial({
                color: 0x9bb79d,
                map: backdropTexture,
                transparent: true,
                opacity: 0.42,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const nearPlacements = [];
            const farPlacements = [];

            for (let z = startZ - 36; z > endZ; z -= 58) {
                [-1, 1].forEach(side => {
                    const roadData = getLinearRoadDataAtZ(z);
                    [
                        { distance: halfRoadWidth + 36 + Math.random() * 8, list: nearPlacements, alphaScale: 1 },
                        { distance: halfRoadWidth + 62 + Math.random() * 14, list: farPlacements, alphaScale: 0.8 }
                    ].forEach(layer => {
                        if (Math.random() < 0.24) {
                            return;
                        }
                        const x = roadData.curve + side * layer.distance;
                        const groundY = getTerrainHeightAt(x, z);
                        layer.list.push({
                            x,
                            y: groundY + 6.2 + Math.random() * 2.2,
                            z: z + (Math.random() - 0.5) * 18,
                            rotationY: Math.PI / 2,
                            scaleX: 28 + Math.random() * 18,
                            scaleY: (11 + Math.random() * 7) * layer.alphaScale,
                            scaleZ: 1
                        });
                    });
                });
            }

            addInstanced('jungle-near-backdrop-tree-line', new THREE.PlaneGeometry(1, 1), material, nearPlacements, 'canopy');
            addInstanced('jungle-far-backdrop-tree-line', new THREE.PlaneGeometry(1, 1), material.clone(), farPlacements, 'canopy');
        }

        function addRainforestCanopyClusters() {
            const canopyClusters = [];
            const canopyShadowClusters = [];
            const canopyHighlightClusters = [];

            for (let z = startZ - 8; z > endZ; z -= scaledStep(54, canopyScale)) {
                [-1, 1].forEach(side => {
                    const density = Math.max(1, Math.round((1 + Math.floor(Math.max(0, rainforestNoise.noise2D(z * 0.008, side * 22.1)) * 2)) * canopyScale));
                    for (let i = 0; i < density; i++) {
                        const offset = 5.6 + Math.pow(Math.random(), 0.7) * 38;
                        const clusterZ = z + (Math.random() - 0.5) * 20;
                        const point = getJunglePoint(clusterZ, side, offset, 6.2);
                        const clusterX = clampJungleXOutsideRoad(point.x + (Math.random() - 0.5) * 4.2, clusterZ, side, 6.2);
                        const groundY = getPropGroundY(clusterX, clusterZ, 2);
                        const placement = {
                            x: clusterX,
                            y: groundY + 12.5 + Math.random() * 9.5,
                            z: clusterZ,
                            rotationX: Math.random() * Math.PI,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: Math.random() * Math.PI,
                            scaleX: 3.6 + Math.random() * 4.8,
                            scaleY: 1.15 + Math.random() * 1.8,
                            scaleZ: 3.3 + Math.random() * 4.4
                        };
                        if (Math.random() < 0.48) {
                            canopyShadowClusters.push(placement);
                        } else if (Math.random() < 0.14) {
                            canopyHighlightClusters.push(placement);
                        } else {
                            canopyClusters.push(placement);
                        }
                    }
                });
            }

            addInstanced('jungle-overhead-canopy-clusters', new THREE.DodecahedronGeometry(1, 1), canopyMaterial, canopyClusters, 'canopy');
            addInstanced('jungle-overhead-canopy-shadow-clusters', new THREE.DodecahedronGeometry(1, 1), canopyShadowMaterial, canopyShadowClusters, 'canopy');
            addInstanced('jungle-overhead-canopy-highlight-clusters', new THREE.DodecahedronGeometry(1, 1), canopyHighlightMaterial, canopyHighlightClusters, 'canopy');
        }

        function addRoadsideEmergentTrees() {
            const emergentTrunks = [];
            const emergentCanopy = [];
            const emergentShadowCanopy = [];
            const emergentBranches = [];
            const emergentVines = [];

            for (let z = startZ - 24; z > endZ; z -= scaledStep(74, treeScale)) {
                [-1, 1].forEach(side => {
                    const treeCount = 1 + (Math.random() < 0.34 ? 1 : 0);
                    for (let i = 0; i < treeCount; i++) {
                        const offset = 3.4 + Math.random() * 16;
                        const treeZ = z + (Math.random() - 0.5) * 36;
                        const point = getJunglePoint(treeZ, side, offset, 5.2);
                        const x = point.x;
                        if (getTerrainNormalAt(x, treeZ, 2.8).y < 0.5) {
                            continue;
                        }
                        const y = point.y;
                        const height = 16 + Math.random() * 12;
                        const trunkRadius = 0.32 + Math.random() * 0.3;
                        emergentTrunks.push({
                            x,
                            y: y + height * 0.5,
                            z: treeZ,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: -side * (0.06 + Math.random() * 0.07),
                            scaleX: trunkRadius,
                            scaleY: height,
                            scaleZ: trunkRadius
                        });

                        const crownY = y + height * (0.78 + Math.random() * 0.08);
                        for (let crownIndex = 0; crownIndex < 4; crownIndex++) {
                            const angle = Math.PI * 2 * (crownIndex / 4) + Math.random() * 0.45;
                            const placement = {
                                x: x + Math.cos(angle) * (1.8 + Math.random() * 3.2) - side * (Math.random() * 1.8),
                                y: crownY + (Math.random() - 0.35) * 2.4,
                                z: treeZ + Math.sin(angle) * (1.8 + Math.random() * 3.2),
                                rotationX: Math.random() * Math.PI,
                                rotationY: Math.random() * Math.PI * 2,
                                rotationZ: Math.random() * Math.PI,
                                scaleX: 4.2 + Math.random() * 3.6,
                                scaleY: 1.5 + Math.random() * 1.3,
                                scaleZ: 3.8 + Math.random() * 3.2
                            };
                            (crownIndex === 0 || Math.random() < 0.46 ? emergentShadowCanopy : emergentCanopy).push(placement);
                        }

                        for (let branchIndex = 0; branchIndex < 3; branchIndex++) {
                            const angle = Math.random() * Math.PI * 2;
                            emergentBranches.push({
                                x: x + Math.cos(angle) * 1.8,
                                y: y + height * (0.58 + Math.random() * 0.22),
                                z: treeZ + Math.sin(angle) * 1.8,
                                rotationY: angle,
                                rotationZ: Math.PI / 2 + (Math.random() - 0.5) * 0.36,
                                scaleX: trunkRadius * 0.22,
                                scaleY: 3.2 + Math.random() * 4.4,
                                scaleZ: trunkRadius * 0.22
                            });
                        }

                        for (let vineIndex = 0; vineIndex < 2; vineIndex++) {
                            emergentVines.push({
                                x: x + (Math.random() - 0.5) * 4.4,
                                y: crownY - 2.2,
                                z: treeZ + (Math.random() - 0.5) * 4.4,
                                rotationZ: (Math.random() - 0.5) * 0.12,
                                scaleX: 0.018 + Math.random() * 0.018,
                                scaleY: 4.2 + Math.random() * 5.5,
                                scaleZ: 0.018 + Math.random() * 0.018
                            });
                        }
                    }
                });
            }

            addInstanced('jungle-emergent-trunks', new THREE.CylinderGeometry(1, 1.35, 1, 8), trunkMaterial, emergentTrunks, 'trees');
            addInstanced('jungle-emergent-branches', new THREE.CylinderGeometry(1, 1, 1, 6), trunkDarkMaterial, emergentBranches, 'trees');
            addInstanced('jungle-emergent-canopy', new THREE.DodecahedronGeometry(1, 1), canopyMaterial, emergentCanopy, 'trees');
            addInstanced('jungle-emergent-shadow-canopy', new THREE.DodecahedronGeometry(1, 1), canopyShadowMaterial, emergentShadowCanopy, 'trees');
            addInstanced('jungle-emergent-vines', new THREE.CylinderGeometry(1, 1, 1, 5), vineMaterial, emergentVines, 'junglePlants');
        }

        function collectDenseForest() {
            const trunks = [];
            const darkTrunks = [];
            const branches = [];
            const buttressRoots = [];
            const canopyBlobs = [];
            const canopyShadowBlobs = [];
            const canopyHighlightBlobs = [];
            const highLeaves = [];
            const highDarkLeaves = [];
            const broadleafCards = [];
            const ferns = [];
            const vines = [];

            for (let z = startZ; z > endZ; z -= scaledStep(38, densityScale)) {
                [-1, 1].forEach(side => {
                    const inOpeningCorridor = z > startZ - 1220;
                    const localDensity = (0.72 + Math.max(0, rainforestNoise.noise2D(z * 0.006, side * 4.1)) * 0.34) * densityScale;
                    const treeCount = (inOpeningCorridor ? 2 : 3) + (Math.random() < localDensity ? 1 : 0);
                    for (let i = 0; i < treeCount; i++) {
                        const offset = (inOpeningCorridor ? 6.6 : 12) + Math.pow(Math.random(), 0.78) * (inOpeningCorridor ? 74 : 110);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 18, side, offset);
                        if (getTerrainNormalAt(point.x, point.z, 2.6).y < 0.62) {
                            continue;
                        }

                        const height = 13.5 + Math.random() * 12.5;
                        const trunkRadius = 0.22 + Math.random() * 0.32;
                        const trunk = {
                            x: point.x,
                            y: point.y + height * 0.5,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: (Math.random() - 0.5) * 0.08 + side * 0.015,
                            scaleX: trunkRadius,
                            scaleY: height,
                            scaleZ: trunkRadius
                        };
                        (Math.random() < 0.34 ? darkTrunks : trunks).push(trunk);

                        const branchCount = 2 + Math.floor(Math.random() * 3);
                        for (let branchIndex = 0; branchIndex < branchCount; branchIndex++) {
                            const angle = Math.random() * Math.PI * 2;
                            const branchLength = 1.8 + Math.random() * 4.4;
                            branches.push({
                                x: point.x + Math.cos(angle) * branchLength * 0.42,
                                y: point.y + height * (0.54 + Math.random() * 0.27),
                                z: point.z + Math.sin(angle) * branchLength * 0.42,
                                rotationY: angle,
                                rotationZ: Math.PI / 2 + (Math.random() - 0.5) * 0.38,
                                scaleX: trunkRadius * (0.22 + Math.random() * 0.18),
                                scaleY: branchLength,
                                scaleZ: trunkRadius * (0.22 + Math.random() * 0.18)
                            });
                        }

                        const rootCount = 2 + Math.floor(Math.random() * 3);
                        for (let rootIndex = 0; rootIndex < rootCount; rootIndex++) {
                            const angle = Math.random() * Math.PI * 2;
                            buttressRoots.push({
                                x: point.x + Math.cos(angle) * trunkRadius * 1.4,
                                y: point.y + 0.12,
                                z: point.z + Math.sin(angle) * trunkRadius * 1.4,
                                rotationY: angle,
                                rotationZ: (Math.random() - 0.5) * 0.08,
                                scaleX: trunkRadius * (0.85 + Math.random() * 0.7),
                                scaleY: 0.16 + Math.random() * 0.1,
                                scaleZ: 1.4 + Math.random() * 1.9
                            });
                        }

                        const canopyY = point.y + height * (0.76 + Math.random() * 0.13);
                        const canopyCount = 4 + Math.floor(Math.random() * 4);
                        for (let canopyIndex = 0; canopyIndex < canopyCount; canopyIndex++) {
                            const angle = (canopyIndex / canopyCount) * Math.PI * 2 + Math.random() * 0.5;
                            const radius = 0.9 + Math.random() * 3.8;
                            const blob = {
                                x: point.x + Math.cos(angle) * radius,
                                y: canopyY + (Math.random() - 0.45) * 2.0,
                                z: point.z + Math.sin(angle) * radius,
                                rotationX: Math.random() * Math.PI,
                                rotationY: Math.random() * Math.PI * 2,
                                rotationZ: Math.random() * Math.PI,
                                scaleX: 3.1 + Math.random() * 3.5,
                                scaleY: 1.2 + Math.random() * 1.55,
                                scaleZ: 2.9 + Math.random() * 3.2
                            };
                            if (canopyIndex === 0 || Math.random() < 0.42) {
                                canopyShadowBlobs.push({
                                    ...blob,
                                    y: blob.y - 0.52,
                                    scaleX: blob.scaleX * 1.05,
                                    scaleY: blob.scaleY * 0.88,
                                    scaleZ: blob.scaleZ * 1.05
                                });
                            } else if (Math.random() < 0.22) {
                                canopyHighlightBlobs.push(blob);
                            } else {
                                canopyBlobs.push(blob);
                            }
                        }

                        const vineCount = Math.random() < 0.72 ? 1 + Math.floor(Math.random() * 3) : 0;
                        for (let vineIndex = 0; vineIndex < vineCount; vineIndex++) {
                            const angle = Math.random() * Math.PI * 2;
                            const vineLength = 2.6 + Math.random() * 6.4;
                            vines.push({
                                x: point.x + Math.cos(angle) * (0.35 + Math.random() * 1.8),
                                y: point.y + height * 0.55,
                                z: point.z + Math.sin(angle) * (0.35 + Math.random() * 1.8),
                                rotationZ: (Math.random() - 0.5) * 0.12,
                                scaleX: 0.018 + Math.random() * 0.026,
                                scaleY: vineLength,
                                scaleZ: 0.018 + Math.random() * 0.026
                            });
                        }

                        const highLeafCount = 1 + Math.floor(Math.random() * 3);
                        for (let leafIndex = 0; leafIndex < highLeafCount; leafIndex++) {
                            const angle = (leafIndex / highLeafCount) * Math.PI * 2 + Math.random() * 0.24;
                            const leafLength = 4.2 + Math.random() * 4.8;
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

                    const broadleafCount = Math.max(1, Math.round((inOpeningCorridor ? 6 : 4) * understoryScale));
                    for (let i = 0; i < broadleafCount; i++) {
                        const offset = 2.2 + Math.random() * 18;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 28, side, offset);
                        const height = 1.35 + Math.random() * 2.2;
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

                    for (let i = 0; i < Math.max(1, Math.round(6 * understoryScale)); i++) {
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

            addInstanced('jungle-instanced-trunks', new THREE.CylinderGeometry(1, 1.28, 1, 8), trunkMaterial, trunks, 'trees');
            addInstanced('jungle-instanced-shadow-trunks', new THREE.CylinderGeometry(1, 1.22, 1, 7), trunkDarkMaterial, darkTrunks, 'trees');
            addInstanced('jungle-upper-branches', new THREE.CylinderGeometry(1, 1, 1, 6), trunkDarkMaterial, branches, 'trees');
            addInstanced('jungle-buttress-roots', new THREE.BoxGeometry(1, 1, 1), rootMaterial, buttressRoots, 'trees');
            addInstanced('jungle-canopy-volume', new THREE.DodecahedronGeometry(1, 1), canopyMaterial, canopyBlobs, 'trees');
            addInstanced('jungle-canopy-shadow-volume', new THREE.DodecahedronGeometry(1, 1), canopyShadowMaterial, canopyShadowBlobs, 'trees');
            addInstanced('jungle-canopy-highlight-volume', new THREE.DodecahedronGeometry(1, 1), canopyHighlightMaterial, canopyHighlightBlobs, 'trees');
            addInstanced('jungle-hanging-vines', new THREE.CylinderGeometry(1, 1, 1, 5), vineMaterial, vines, 'junglePlants');
            addInstanced('jungle-high-broadleaf-crowns', createLeafBladeGeometry(0.9, 1.0), tropicalLeafMaterial, highLeaves, 'trees');
            addInstanced('jungle-high-dark-broadleaf-crowns', createLeafBladeGeometry(0.82, 1.0), tropicalLeafDarkMaterial, highDarkLeaves, 'trees');
            addInstanced('jungle-broadleaf-cards', createLeafBladeGeometry(1, 1), leafCardMaterial, broadleafCards, 'junglePlants');
            addInstanced('jungle-fern-cards', createLeafBladeGeometry(0.72, 1), fernMaterial, ferns, 'junglePlants');
        }

        function addRoadsideTropicalWall() {
            const trunks = [];
            const shadowTrunks = [];
            const understoryBlobs = [];
            const understoryDarkBlobs = [];
            const crownLeaves = [];
            const darkLeaves = [];
            const floorLeaves = [];
            const roadsideVines = [];

            for (let z = startZ - 16; z > endZ; z -= scaledStep(54, densityScale)) {
                [-1, 1].forEach(side => {
                    const inOpeningCorridor = z > startZ - 1050;
                    const groveCount = Math.max(1, Math.round((inOpeningCorridor
                        ? 3
                        : 2 + (Math.random() < 0.45 ? 1 : 0)) * treeScale));
                    for (let i = 0; i < groveCount; i++) {
                        const offset = (inOpeningCorridor ? 2.8 : 3.6) + Math.random() * (inOpeningCorridor ? 15 : 28);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 34, side, offset, 4.2);
                        if (getTerrainNormalAt(point.x, point.z, 2.4).y < 0.5) {
                            continue;
                        }

                        const height = 7.8 + Math.random() * 8.8;
                        const trunkRadius = 0.16 + Math.random() * 0.24;
                        const trunk = {
                            x: point.x,
                            y: point.y + height * 0.5,
                            z: point.z,
                            rotationY: Math.random() * Math.PI * 2,
                            rotationZ: side * (0.05 + Math.random() * 0.08),
                            scaleX: trunkRadius,
                            scaleY: height,
                            scaleZ: trunkRadius
                        };
                        (Math.random() < 0.28 ? shadowTrunks : trunks).push(trunk);

                        const blobCount = 3 + Math.floor(Math.random() * 3);
                        for (let blobIndex = 0; blobIndex < blobCount; blobIndex++) {
                            const angle = (blobIndex / blobCount) * Math.PI * 2 + Math.random() * 0.34;
                            const blob = {
                                x: point.x + Math.cos(angle) * (0.5 + Math.random() * 1.2),
                                y: point.y + height * (0.66 + Math.random() * 0.23),
                                z: point.z + Math.sin(angle) * (0.5 + Math.random() * 1.2),
                                rotationX: Math.random() * Math.PI,
                                rotationY: Math.random() * Math.PI * 2,
                                rotationZ: Math.random() * Math.PI,
                                scaleX: 1.8 + Math.random() * 2.6,
                                scaleY: 0.95 + Math.random() * 1.4,
                                scaleZ: 1.7 + Math.random() * 2.5
                            };
                            (Math.random() < 0.38 ? understoryDarkBlobs : understoryBlobs).push(blob);
                        }

                        if (Math.random() < 0.58 * vineScale) {
                            const vineLength = 1.8 + Math.random() * 3.4;
                            roadsideVines.push({
                                x: point.x + (Math.random() - 0.5) * 1.6,
                                y: point.y + height * 0.55,
                                z: point.z + (Math.random() - 0.5) * 1.6,
                                rotationZ: (Math.random() - 0.5) * 0.18,
                                scaleX: 0.018 + Math.random() * 0.02,
                                scaleY: vineLength,
                                scaleZ: 0.018 + Math.random() * 0.02
                            });
                        }

                        const leafCount = 3 + Math.floor(Math.random() * 3);
                        for (let leafIndex = 0; leafIndex < leafCount; leafIndex++) {
                            const angle = (leafIndex / leafCount) * Math.PI * 2 + Math.random() * 0.22;
                            const leafLength = 2.0 + Math.random() * 2.8;
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

                    const undergrowthCount = Math.max(1, Math.round((inOpeningCorridor ? 10 : 7) * understoryScale));
                    for (let i = 0; i < undergrowthCount; i++) {
                        const offset = 1.8 + Math.random() * (inOpeningCorridor ? 9 : 13);
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 40, side, offset, 2.2);
                        const leafLength = 1.2 + Math.random() * 2.4;
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
            addInstanced('jungle-roadside-shadow-trunks', new THREE.CylinderGeometry(1, 0.78, 1, 7), trunkDarkMaterial, shadowTrunks, 'trees');
            addInstanced('jungle-roadside-understory-volume', new THREE.DodecahedronGeometry(1, 1), canopyMaterial, understoryBlobs, 'junglePlants');
            addInstanced('jungle-roadside-understory-shadow-volume', new THREE.DodecahedronGeometry(1, 1), canopyShadowMaterial, understoryDarkBlobs, 'junglePlants');
            addInstanced('jungle-roadside-vines', new THREE.CylinderGeometry(1, 1, 1, 5), vineMaterial, roadsideVines, 'junglePlants');
            addInstanced('jungle-roadside-banana-leaves', createLeafBladeGeometry(0.9, 1.0), tropicalLeafMaterial, crownLeaves, 'junglePlants');
            addInstanced('jungle-roadside-dark-leaves', createLeafBladeGeometry(0.82, 1.0), tropicalLeafDarkMaterial, darkLeaves, 'junglePlants');
            addInstanced('jungle-roadside-floor-leaves', createLeafBladeGeometry(0.62, 1.0), fernMaterial, floorLeaves, 'junglePlants');
        }

        function placeOpeningProceduralGrove() {
            const openingEnd = Math.max(endZ, startZ - 1280);
            for (let z = startZ - 36; z > openingEnd; z -= 92) {
                [-1, 1].forEach(side => {
                    const palmsThisStep = Math.random() < 0.58 ? 1 : 0;
                    for (let i = 0; i < palmsThisStep; i++) {
                        const offset = 6 + Math.random() * 26;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 26, side, offset, 4.2);
                        const tree = createRainforestPalm(0.96 + Math.random() * 0.34);
                        if (!tree || getTerrainNormalAt(point.x, point.z, 2.4).y < 0.5) {
                            continue;
                        }
                        tree.name = 'jungle-opening-procedural-palm';
                        tree.position.set(point.x, point.y, point.z);
                        tree.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, tree, 'trees');
                        stageDecorStats.palms += 1;
                    }
                });
            }
        }

        function createRainforestPalm(scale = 1) {
            const palm = new THREE.Group();
            palm.name = 'jungle-rainforest-palm';
            const trunkHeight = (10.5 + Math.random() * 6.8) * scale;
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
            for (let z = startZ - 35; z > endZ; z -= scaledStep(112, treeScale)) {
                [-1, 1].forEach(side => {
                    const count = Math.max(1, Math.round((1 + (Math.random() < 0.38 ? 1 : 0)) * treeScale));
                    for (let i = 0; i < count; i++) {
                        const offset = 3.6 + Math.random() * 18;
                        const point = getJunglePoint(z + (Math.random() - 0.5) * 38, side, offset, 4.2);
                        if (getTerrainNormalAt(point.x, point.z, 2.2).y < 0.58) {
                            continue;
                        }
                        const tree = createRainforestPalm(0.92 + Math.random() * 0.56);
                        tree.position.set(point.x, point.y, point.z);
                        tree.rotation.y = Math.random() * Math.PI * 2;
                        tree.name = 'jungle-rainforest-palm';
                        addDecorGroup(decor, tree, 'trees');
                        stageDecorStats.palms += 1;
                    }
                });
            }
        }

        function addCanopyTunnels() {
            const drippingLeafMaterial = new THREE.MeshPhongMaterial({ color: 0x1f6938, map: leafTexture, bumpMap: leafTexture, bumpScale: 0.025, shininess: 8, side: THREE.DoubleSide });
            const branchMaterial = new THREE.MeshPhongMaterial({ color: 0x3a291a, map: barkTexture, normalMap: barkNormalTexture, shininess: 3 });
            for (let z = startZ - 90; z > endZ; z -= scaledStep(260, Math.max(0.35, canopyScale))) {
                const roadData = getLinearRoadDataAtZ(z);
                const roadPose = getRoadDataAtZ(z, game);
                const arch = new THREE.Group();
                arch.name = 'rainforest-canopy-tunnel';
                [-1, 1].forEach(side => {
                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.58, 14.6, 8), trunkMaterial);
                    trunk.position.set(side * (halfRoadWidth + 4.8), 7.15, 0);
                    trunk.rotation.z = -side * (0.22 + Math.random() * 0.1);
                    arch.add(trunk);

                    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, game.road.width * 0.78, 7), branchMaterial);
                    branch.position.set(side * (halfRoadWidth * 0.28), 11.2 + Math.random() * 1.1, (Math.random() - 0.5) * 2.6);
                    branch.rotation.z = Math.PI / 2 + side * (0.18 + Math.random() * 0.12);
                    branch.rotation.y = (Math.random() - 0.5) * 0.32;
                    arch.add(branch);
                });
                for (let i = 0; i < 12; i++) {
                    const canopy = new THREE.Mesh(
                        new THREE.DodecahedronGeometry(1, 1),
                        i % 3 === 0 ? canopyShadowMaterial : i % 5 === 0 ? canopyHighlightMaterial : canopyMaterial
                    );
                    canopy.position.set((Math.random() - 0.5) * (game.road.width + 16), 10.2 + Math.random() * 4.4, (Math.random() - 0.5) * 10);
                    canopy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI);
                    canopy.scale.set(2.2 + Math.random() * 3.8, 0.95 + Math.random() * 1.7, 2.0 + Math.random() * 3.2);
                    arch.add(canopy);
                }
                for (let i = 0; i < 8; i++) {
                    const vineLength = 3.2 + Math.random() * 6.2;
                    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, vineLength, 5), vineMaterial);
                    const side = Math.random() < 0.5 ? -1 : 1;
                    vine.position.set(side * (halfRoadWidth + 1.7 + Math.random() * 3.8), 9.4 + Math.random() * 2.6, (Math.random() - 0.5) * 8);
                    vine.rotation.z = (Math.random() - 0.5) * 0.14;
                    arch.add(vine);
                }
                for (let i = 0; i < 4; i++) {
                    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.0 + Math.random() * 1.4, 3.2 + Math.random() * 2.2), drippingLeafMaterial);
                    const side = Math.random() < 0.5 ? -1 : 1;
                    leaf.position.set(side * (halfRoadWidth + 1.4 + Math.random() * 3.4), 8.7 + Math.random() * 2.0, (Math.random() - 0.5) * 8);
                    leaf.rotation.set(Math.PI / 2 + 0.35 + Math.random() * 0.45, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
                    arch.add(leaf);
                }
                arch.position.set(roadData.curve, roadData.y, z);
                arch.rotation.y = -roadPose.curvatureAngle;
                addDecorGroup(decor, arch, 'canopy');
            }
        }

        function addAssetsHtmlJungleTrailChunks() {
            const complexity = THREE.MathUtils.clamp(generation.complexity, 0.1, 1);
            const width = Math.max(2, generation.trailWidth || game.road.width);
            const curveAmount = THREE.MathUtils.clamp(generation.trailCurve ?? 0.45, 0, 1.5);
            const bankHeight = THREE.MathUtils.clamp(generation.bankHeight ?? 2.5, 0, 8);
            const density = THREE.MathUtils.clamp(generation.density ?? 1, 0, 1.25);
            const canopyCover = THREE.MathUtils.clamp(generation.canopyCover ?? 0.95, 0, 1);
            const requestedTrees = Math.max(0, generation.treeCount ?? 24);
            const treeMultiplier = Math.max(0, generation.treeMultiplier ?? 1);
            const branchMultiplier = THREE.MathUtils.clamp(generation.branchMultiplier ?? 1, 0, 12);
            const understoryHeight = Math.max(0, generation.understoryHeight ?? 6.5);
            const understoryMultiplier = Math.max(0, generation.understoryMultiplier ?? 1);
            const requestedRocks = Math.max(0, generation.rockCount ?? 24);
            const roadsideRockDensity = THREE.MathUtils.clamp(generation.roadsideRockDensity ?? 1.8, 0, 4);
            const requestedVines = Math.max(0, generation.vines ?? 12);
            const chunkLength = 90;
            const chunkStep = 90;
            const rand = (min, max) => min + Math.random() * (max - min);
            const lerp = (a, b, t) => a + (b - a) * t;
            const pick = items => items[Math.floor(Math.random() * items.length)];
            const clamp01 = value => Math.max(0, Math.min(1, value));
            const localDetail = (min, max) => Math.max(min, Math.round(min + (max - min) * complexity));
            const bankWidth = Math.max(5, width * 1.4);
            const roadEdgeOffset = width * 0.5;
            const sideOffset = (min, max) => width * rand(min, max);

            const mossMat = new THREE.MeshLambertMaterial({ color: 0x2d5a25, side: THREE.DoubleSide });
            const trunkMat = new THREE.MeshLambertMaterial({ color: 0x70401c });
            const barkDarkMat = new THREE.MeshLambertMaterial({ color: 0x3d1d0c });
            const vineMat = new THREE.MeshLambertMaterial({ color: 0x2f2418 });
            const rockMat = new THREE.MeshLambertMaterial({ color: 0x625b3d, flatShading: true });
            const mossRockMat = new THREE.MeshLambertMaterial({ color: 0x465635, flatShading: true });
            const leafMats = [
                new THREE.MeshLambertMaterial({ color: 0x173f1f, side: THREE.DoubleSide, flatShading: true }),
                new THREE.MeshLambertMaterial({ color: 0x235f28, side: THREE.DoubleSide, flatShading: true }),
                new THREE.MeshLambertMaterial({ color: 0x4a9f3f, side: THREE.DoubleSide, flatShading: true }),
                new THREE.MeshLambertMaterial({ color: 0x9ad86a, side: THREE.DoubleSide, flatShading: true })
            ];
            const makeTaperedTube = (points, radiusStart, radiusEnd, tubularSegments, radialSegments, material, wobble = 0) => {
                const curve = new THREE.CatmullRomCurve3(points);
                const segs = Math.max(3, tubularSegments);
                const radial = Math.max(3, radialSegments);
                const frames = curve.computeFrenetFrames(segs, false);
                const positions = [];
                const indices = [];

                for (let i = 0; i <= segs; i++) {
                    const t = i / segs;
                    const point = curve.getPoint(t);
                    const radius = lerp(radiusStart, radiusEnd, Math.pow(t, 0.85));
                    for (let j = 0; j < radial; j++) {
                        const a = (j / radial) * Math.PI * 2;
                        const ridge = 1 + wobble * (Math.sin(a * 3 + i * 0.7) * 0.45 + Math.sin(a * 7 + i * 0.31) * 0.22);
                        const normalOffset = frames.normals[i].clone().multiplyScalar(Math.cos(a) * radius * ridge);
                        const binormalOffset = frames.binormals[i].clone().multiplyScalar(Math.sin(a) * radius * ridge);
                        const p = point.clone().add(normalOffset).add(binormalOffset);
                        positions.push(p.x, p.y, p.z);
                    }
                }

                for (let i = 0; i < segs; i++) {
                    for (let j = 0; j < radial; j++) {
                        const a = i * radial + j;
                        const b = i * radial + ((j + 1) % radial);
                        const c = (i + 1) * radial + j;
                        const d = (i + 1) * radial + ((j + 1) % radial);
                        indices.push(a, c, b, b, c, d);
                    }
                }

                const startCenter = positions.length / 3;
                const p0 = curve.getPoint(0);
                positions.push(p0.x, p0.y, p0.z);
                const endCenter = positions.length / 3;
                const p1 = curve.getPoint(1);
                positions.push(p1.x, p1.y, p1.z);
                const lastRing = segs * radial;
                for (let j = 0; j < radial; j++) {
                    indices.push(startCenter, (j + 1) % radial, j);
                    indices.push(endCenter, lastRing + j, lastRing + ((j + 1) % radial));
                }

                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geo.setIndex(indices);
                geo.computeVertexNormals();
                const mesh = new THREE.Mesh(geo, material);
                mesh.castShadow = true;
                return mesh;
            };

            const makeLeafGeometry = (lengthValue, widthValue, archValue) => {
                const positions = [];
                const indices = [];
                const segs = localDetail(3, 7);
                for (let i = 0; i <= segs; i++) {
                    const t = i / segs;
                    const halfWidth = widthValue * Math.sin(t * Math.PI) * (0.75 + 0.25 * Math.sin(t * Math.PI * 3));
                    const y = lengthValue * t;
                    const z = Math.sin(t * Math.PI) * archValue + Math.pow(t, 1.6) * archValue * 0.3;
                    positions.push(-halfWidth, y, z, halfWidth, y, z);
                }
                for (let i = 0; i < segs; i++) {
                    const a = i * 2;
                    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geo.setIndex(indices);
                geo.computeVertexNormals();
                return geo;
            };

            function addChunkToScene(group, centerZ, stats) {
                group.name = 'assets-html-jungle-trail-chunk';
                group.userData.sceneryCull = {
                    z: centerZ,
                    radius: chunkLength * 1.08
                };
                group.traverse(child => {
                    if (child.isMesh) {
                        child.frustumCulled = !child.isInstancedMesh;
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }
                });
                decor.add(group);
                game.sceneryCullObjects = game.sceneryCullObjects || [];
                game.sceneryCullObjects.push(group);
                stageDecorStats.trees += stats.trees;
                stageDecorStats.junglePlants += stats.junglePlants;
                stageDecorStats.rockClusters += stats.rockClusters;
                stageDecorStats.totalInstancedProps += stats.trees + stats.junglePlants + stats.rockClusters;
                return { group, stats, centerZ };
            }

            function createChunk(chunkStartZ, chunkEndZ) {
                const group = new THREE.Group();
                const stats = { trees: 0, junglePlants: 0, rockClusters: 0 };
                const length = Math.abs(chunkStartZ - chunkEndZ);
                const centerZ = (chunkStartZ + chunkEndZ) * 0.5;
                const chunkScale = length / 180;
                const mergeBuckets = new Map();
                const canopyPlacementsByMaterial = leafMats.map(() => []);
                const leafPlacementsByMaterial = leafMats.map(() => []);
                const rockPlacements = [];
                const mossRockPlacements = [];
                const rootPlacements = [];
                const branchPlacements = [];
                const stemPlacements = [];
                const instancedCanopyGeometry = new THREE.DodecahedronGeometry(1, 0);
                const instancedRockGeometry = new THREE.DodecahedronGeometry(1, 0);
                const instancedLeafGeometry = makeLeafGeometry(1, 0.16, 0.12);
                const instancedTaperGeometry = new THREE.CylinderGeometry(0.28, 1, 1, 5, 1);
                const instancedStemGeometry = new THREE.CylinderGeometry(0.42, 1, 1, 4, 1);
                const instanceMatrix = new THREE.Matrix4();
                const instancePosition = new THREE.Vector3();
                const instanceQuaternion = new THREE.Quaternion();
                const instanceEuler = new THREE.Euler();
                const instanceScale = new THREE.Vector3();
                const yAxis = new THREE.Vector3(0, 1, 0);

                const pathCenter = t => {
                    const z = lerp(chunkStartZ, chunkEndZ, t);
                    const roadData = getLinearRoadDataAtZ(z);
                    const pathWiggle = Math.sin(t * Math.PI * 1.15) * curveAmount * width * 0.16
                        + Math.sin(t * Math.PI * 2.7 + 0.8) * curveAmount * width * 0.05;
                    const roadPose = getRoadDataAtZ(z, game);
                    const side = new THREE.Vector3(Math.cos(-roadPose.curvatureAngle), 0, Math.sin(-roadPose.curvatureAngle)).normalize();
                    const y = roadData.y + Math.sin(t * Math.PI * 7) * 0.08 + Math.sin(t * Math.PI * 2 + 0.6) * 0.12;
                    return new THREE.Vector3(roadData.curve, y, z).add(side.multiplyScalar(pathWiggle));
                };

                const pathFrame = t => {
                    const t0 = Math.max(0, t - 0.01);
                    const t1 = Math.min(1, t + 0.01);
                    const center = pathCenter(t);
                    const tangent = pathCenter(t1).sub(pathCenter(t0)).normalize();
                    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
                    return { center, side, tangent };
                };

                const pathWidthAt = t => width * (0.95 + Math.sin(t * Math.PI * 2.2) * 0.08 + Math.sin(t * Math.PI * 9.1) * 0.025);

                const terrainHeightAt = (t, lateral) => {
                    const centerY = pathCenter(t).y + 0.065;
                    const pathWidth = pathWidthAt(t);
                    const absLat = Math.abs(lateral);
                    if (absLat <= pathWidth * 0.6) {
                        const col = lateral / pathWidth;
                        const crown = -0.18 * (1 - Math.min(1, Math.abs(col) * 2.1));
                        return centerY + crown + Math.sin(t * 37 + (col + 0.58) * 5.4) * 0.03;
                    }

                    const d = clamp01((absLat - pathWidth * 0.54) / bankWidth);
                    const sign = lateral < 0 ? -1 : 1;
                    return centerY
                        + bankHeight * Math.pow(d, 0.85) * (0.85 + Math.sin(t * Math.PI * 3 + d * 4) * 0.12)
                        + Math.sin(t * 27 + d * 8.4 + sign) * 0.12;
                };

                const terrainPoint = (t, lateral, lift = 0) => {
                    const { center, side, tangent } = pathFrame(t);
                    const point = center.clone().add(side.clone().multiplyScalar(lateral));
                    point.y = terrainHeightAt(t, lateral) + lift;
                    return { point, center, side, tangent };
                };

                const mergeBufferGeometries = geometries => {
                    const positions = [];
                    const normals = [];
                    const indices = [];
                    let vertexOffset = 0;

                    geometries.forEach(geometry => {
                        const positionAttribute = geometry.getAttribute('position');
                        const normalAttribute = geometry.getAttribute('normal');
                        if (!positionAttribute) {
                            return;
                        }

                        for (let i = 0; i < positionAttribute.count; i++) {
                            positions.push(
                                positionAttribute.getX(i),
                                positionAttribute.getY(i),
                                positionAttribute.getZ(i)
                            );
                            if (normalAttribute) {
                                normals.push(
                                    normalAttribute.getX(i),
                                    normalAttribute.getY(i),
                                    normalAttribute.getZ(i)
                                );
                            }
                        }

                        if (geometry.index) {
                            const index = geometry.index;
                            for (let i = 0; i < index.count; i++) {
                                indices.push(index.getX(i) + vertexOffset);
                            }
                        } else {
                            for (let i = 0; i < positionAttribute.count; i++) {
                                indices.push(vertexOffset + i);
                            }
                        }
                        vertexOffset += positionAttribute.count;
                    });

                    const merged = new THREE.BufferGeometry();
                    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                    if (normals.length === positions.length) {
                        merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                    } else {
                        merged.computeVertexNormals();
                    }
                    merged.setIndex(indices);
                    merged.computeBoundingSphere();
                    return merged;
                };

                const addTracked = (mesh, key) => {
                    if (mesh?.isMesh && !mesh.isInstancedMesh && mesh.geometry && mesh.material) {
                        const bucketKey = `${key || 'junglePlants'}-${mesh.material.uuid}`;
                        if (!mergeBuckets.has(bucketKey)) {
                            mergeBuckets.set(bucketKey, {
                                name: `jungle-merged-${key || 'props'}-${mergeBuckets.size}`,
                                material: mesh.material,
                                geometries: [],
                                statsKey: key
                            });
                        }
                        mergeBuckets.get(bucketKey).geometries.push(mesh.geometry);
                        if (key) {
                            stats[key] += 1;
                        }
                        return mesh;
                    }

                    group.add(mesh);
                    if (key) {
                        stats[key] += 1;
                    }
                    return mesh;
                };

                const addInstancedBatch = (name, geometry, material, placements, statsKey) => {
                    if (!placements.length) {
                        return null;
                    }

                    const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
                    mesh.name = name;
                    mesh.castShadow = false;
                    mesh.receiveShadow = false;
                    mesh.frustumCulled = false;
                    placements.forEach((placement, index) => {
                        instancePosition.set(placement.x, placement.y, placement.z);
                        if (placement.quaternion) {
                            instanceQuaternion.copy(placement.quaternion);
                        } else {
                            instanceEuler.set(placement.rotationX || 0, placement.rotationY || 0, placement.rotationZ || 0);
                            instanceQuaternion.setFromEuler(instanceEuler);
                        }
                        instanceScale.set(placement.scaleX || 1, placement.scaleY || 1, placement.scaleZ || 1);
                        instanceMatrix.compose(instancePosition, instanceQuaternion, instanceScale);
                        mesh.setMatrixAt(index, instanceMatrix);
                    });
                    mesh.instanceMatrix.needsUpdate = true;
                    group.add(mesh);
                    if (statsKey) {
                        stats[statsKey] += placements.length;
                    }
                    return mesh;
                };

                const addTaperedSegmentInstance = (placements, start, end, radius, radiusScaleZ = 1) => {
                    const direction = end.clone().sub(start);
                    const segmentLength = direction.length();
                    if (segmentLength < 0.05 || radius <= 0) {
                        return;
                    }
                    const midpoint = start.clone().add(end).multiplyScalar(0.5);
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(yAxis, direction.normalize());
                    placements.push({
                        x: midpoint.x,
                        y: midpoint.y,
                        z: midpoint.z,
                        quaternion,
                        scaleX: radius,
                        scaleY: segmentLength,
                        scaleZ: radius * radiusScaleZ
                    });
                };

                const flushBatches = () => {
                    mergeBuckets.forEach(bucket => {
                        if (!bucket.geometries.length) {
                            return;
                        }
                        const mergedGeometry = mergeBufferGeometries(bucket.geometries);
                        bucket.geometries.forEach(geometry => geometry.dispose());
                        const mesh = new THREE.Mesh(mergedGeometry, bucket.material);
                        mesh.name = bucket.name;
                        mesh.castShadow = false;
                        mesh.receiveShadow = false;
                        group.add(mesh);
                    });

                    canopyPlacementsByMaterial.forEach((placements, index) => {
                        addInstancedBatch(
                            `jungle-instanced-canopy-${index}`,
                            instancedCanopyGeometry.clone(),
                            leafMats[index],
                            placements,
                            'trees'
                        );
                    });
                    leafPlacementsByMaterial.forEach((placements, index) => {
                        addInstancedBatch(
                            `jungle-instanced-leaves-${index}`,
                            instancedLeafGeometry.clone(),
                            leafMats[index],
                            placements,
                            'junglePlants'
                        );
                    });
                    addInstancedBatch('jungle-instanced-roots', instancedTaperGeometry.clone(), barkDarkMat, rootPlacements, 'trees');
                    addInstancedBatch('jungle-instanced-branches', instancedTaperGeometry.clone(), trunkMat, branchPlacements, 'trees');
                    addInstancedBatch('jungle-instanced-stems', instancedStemGeometry.clone(), mossMat, stemPlacements, 'junglePlants');
                    addInstancedBatch('jungle-instanced-rocks', instancedRockGeometry.clone(), rockMat, rockPlacements, 'rockClusters');
                    addInstancedBatch('jungle-instanced-moss-rocks', instancedRockGeometry.clone(), mossRockMat, mossRockPlacements, 'rockClusters');

                    instancedCanopyGeometry.dispose();
                    instancedRockGeometry.dispose();
                    instancedLeafGeometry.dispose();
                    instancedTaperGeometry.dispose();
                    instancedStemGeometry.dispose();
                };

                const addCanopyCluster = (anchor, radius, fullness, ySquash = 0.62) => {
                    const lumps = Math.max(1, Math.round(1 + fullness * localDetail(2, 5)));
                    for (let i = 0; i < lumps; i++) {
                        const materialIndex = Math.floor(Math.random() * leafMats.length);
                        const s = radius * rand(0.45, 1);
                        canopyPlacementsByMaterial[materialIndex].push({
                            x: anchor.x + rand(-radius, radius) * 0.55,
                            y: anchor.y + rand(-radius, radius) * 0.28,
                            z: anchor.z + rand(-radius, radius) * 0.55,
                            rotationX: rand(-0.25, 0.25),
                            rotationY: rand(0, Math.PI),
                            rotationZ: rand(-0.2, 0.2),
                            scaleX: s * rand(1, 1.7),
                            scaleY: s * ySquash * rand(0.65, 1),
                            scaleZ: s * rand(0.9, 1.45)
                        });
                    }
                };

                const addRock = (position, size, mossy = false) => {
                    const placement = {
                        x: position.x,
                        y: position.y,
                        z: position.z,
                        rotationX: rand(0, Math.PI),
                        rotationY: rand(0, Math.PI),
                        rotationZ: rand(0, Math.PI),
                        scaleX: size * rand(0.8, 1.8),
                        scaleY: size * rand(0.35, 0.8),
                        scaleZ: size * rand(0.7, 1.35)
                    };
                    (mossy ? mossRockPlacements : rockPlacements).push(placement);
                };

                const addRoadsideRockCluster = (baseT, sideSign, scale = 1) => {
                    const clusterRocks = Math.max(1, Math.round(rand(1.2, 4.8) * scale));
                    const anchorLateral = roadEdgeOffset + rand(0.85, 5.8);
                    for (let r = 0; r < clusterRocks; r++) {
                        const t = clamp01(baseT + rand(-5.8, 5.8) / Math.max(1, length));
                        const roll = Math.random();
                        const size = roll < 0.12
                            ? rand(1.25, 2.45)
                            : roll < 0.58
                                ? rand(0.45, 1.2)
                                : rand(0.16, 0.46);
                        const lateralDistance = Math.max(
                            Math.max(roadEdgeOffset, pathWidthAt(t) * 0.5) + 0.75 + size * 1.15,
                            anchorLateral + rand(-0.85, 1.75)
                        );
                        const point = terrainPoint(t, sideSign * lateralDistance, rand(0.08, 0.2)).point;
                        addRock(point, size * scale, Math.random() < 0.58);
                    }
                    const fernClumps = Math.max(1, Math.round(rand(1.8, 4.2) * scale * (0.55 + density * 0.45)));
                    for (let f = 0; f < fernClumps; f++) {
                        const t = clamp01(baseT + rand(-6.4, 6.4) / Math.max(1, length));
                        const lateralDistance = Math.max(
                            Math.max(roadEdgeOffset, pathWidthAt(t) * 0.5) + 0.7,
                            anchorLateral + rand(-0.65, 1.55)
                        );
                        addFernCluster(t, sideSign * lateralDistance, sideSign, rand(0.34, 0.72) * scale);
                    }
                };

                const addFernCluster = (baseT, baseLateral, sideSign, scale = 1) => {
                    const fronds = Math.round(localDetail(2, 6) * density * scale);
                    for (let f = 0; f < fronds; f++) {
                        const frondLength = rand(1.2, Math.max(1.6, understoryHeight)) * rand(0.45, 1.05) * scale;
                        const frondWidth = frondLength * rand(0.08, 0.16);
                        const jitterT = clamp01(baseT + rand(-0.35, 0.35) / Math.max(1, length));
                        const jitterLateral = baseLateral + rand(-0.28, 0.28) * scale;
                        const point = terrainPoint(jitterT, jitterLateral, 0.035).point;
                        const materialIndex = Math.floor(Math.random() * leafMats.length);
                        leafPlacementsByMaterial[materialIndex].push({
                            x: point.x,
                            y: point.y,
                            z: point.z,
                            rotationX: rand(0.25, 0.95),
                            rotationY: (sideSign < 0 ? Math.PI * 0.5 : -Math.PI * 0.5) + rand(-1.35, 1.35),
                            rotationZ: rand(-0.75, 0.75),
                            scaleX: Math.max(0.35, frondWidth / 0.16),
                            scaleY: frondLength,
                            scaleZ: Math.max(0.5, frondLength * rand(0.45, 1.05))
                        });
                    }
                };

                const treeCount = Math.round(requestedTrees * 0.85 * treeMultiplier * density * (0.45 + complexity * 0.55) * chunkScale);
                for (let i = 0; i < treeCount; i++) {
                    const sideSign = i % 2 === 0 ? -1 : 1;
                    const t = (i + rand(0.15, 0.85)) / Math.max(1, treeCount);
                    const { side, tangent } = pathFrame(t);
                    const offset = sideOffset(0.95, 3.75);
                    const baseLateral = sideSign * offset;
                    const base = terrainPoint(t, baseLateral, 0.05).point;
                    const height = rand(10, 24) * (0.8 + canopyCover * 0.35);
                    const lean = side.clone().multiplyScalar(-sideSign * rand(1.2, 4.8)).add(tangent.clone().multiplyScalar(rand(-3.2, 3.2)));
                    const trunkPts = [
                        base,
                        base.clone().add(new THREE.Vector3(lean.x * 0.32, height * 0.42, lean.z * 0.32)),
                        base.clone().add(new THREE.Vector3(lean.x * 0.72, height * 0.78, lean.z * 0.72)),
                        base.clone().add(new THREE.Vector3(lean.x, height, lean.z))
                    ];
                    const trunkRadius = rand(0.22, 0.72);
                    const trunkCurve = new THREE.CatmullRomCurve3(trunkPts);
                    addTracked(makeTaperedTube(trunkPts, trunkRadius, trunkRadius * rand(0.42, 0.64), localDetail(7, 24), localDetail(5, 9), trunkMat, 0.1), 'trees');

                    const buttressRoots = localDetail(2, 4);
                    for (let r = 0; r < buttressRoots; r++) {
                        const angle = (r / buttressRoots) * Math.PI * 2 + rand(-0.35, 0.35);
                        const rootDir = side.clone().multiplyScalar(sideSign * Math.cos(angle)).add(tangent.clone().multiplyScalar(Math.sin(angle))).normalize();
                        const rootLen = rand(1.4, 3.8);
                        const rootEndT = clamp01(t + rootDir.dot(tangent) * rootLen / Math.max(1, length));
                        const rootEndLateral = baseLateral + rootDir.dot(side) * rootLen;
                        const rootEnd = terrainPoint(rootEndT, rootEndLateral, rand(0.02, 0.12)).point;
                        const rootMid = base.clone().lerp(rootEnd, 0.55);
                        rootMid.y += rand(0.15, 0.45);
                        addTaperedSegmentInstance(
                            rootPlacements,
                            base.clone().add(new THREE.Vector3(0, 0.16, 0)),
                            rootMid,
                            trunkRadius * rand(0.16, 0.28),
                            rand(0.8, 1.15)
                        );
                        addTaperedSegmentInstance(
                            rootPlacements,
                            rootMid,
                            rootEnd,
                            trunkRadius * rand(0.06, 0.14),
                            rand(0.75, 1.1)
                        );
                    }

                    const branchCount = Math.max(0, Math.round(localDetail(1, 4) * branchMultiplier));
                    const branchEnds = [];
                    for (let b = 0; b < branchCount; b++) {
                        const at = rand(0.45, 0.92);
                        const origin = trunkCurve.getPoint(at);
                        const branchDir = side.clone().multiplyScalar(-sideSign * rand(0.3, 1.4)).add(tangent.clone().multiplyScalar(rand(-1.2, 1.2))).normalize();
                        const branchEnd = origin.clone()
                            .add(branchDir.multiplyScalar(rand(2.4, 6.2)))
                            .add(new THREE.Vector3(0, rand(0.8, 3.2), 0));
                        const branchMid = origin.clone().lerp(branchEnd, 0.5).add(new THREE.Vector3(rand(-0.4, 0.4), rand(0.25, 1), rand(-0.4, 0.4)));
                        addTaperedSegmentInstance(branchPlacements, origin, branchMid, trunkRadius * rand(0.12, 0.22), rand(0.85, 1.15));
                        addTaperedSegmentInstance(branchPlacements, branchMid, branchEnd, trunkRadius * rand(0.045, 0.095), rand(0.75, 1.05));
                        branchEnds.push(branchEnd);
                    }

                    if (Math.random() < canopyCover) {
                        addCanopyCluster(trunkPts[trunkPts.length - 1].clone().add(new THREE.Vector3(0, rand(1, 2.6), 0)), rand(2.2, 4.6), 0.75, rand(0.48, 0.72));
                        branchEnds.forEach(end => {
                            if (Math.random() < 0.62) addCanopyCluster(end, rand(1.5, 3.2), 0.45, rand(0.45, 0.72));
                        });
                    }

                    if (complexity > 0.48 && Math.random() < 0.45) {
                        const vinePts = [];
                        const phase = rand(0, Math.PI * 2);
                        for (let p = 0; p <= 8; p++) {
                            const tt = p / 8;
                            const trunkPoint = trunkCurve.getPoint(tt);
                            const wrapSide = side.clone().multiplyScalar(Math.sin(tt * Math.PI * 5 + phase) * trunkRadius * 0.55);
                            vinePts.push(trunkPoint.clone().add(wrapSide));
                        }
                        addTracked(makeTaperedTube(vinePts, 0.035, 0.018, localDetail(8, 22), 3, vineMat, 0.04), 'junglePlants');
                    }
                }

                const frameTreeCount = Math.round((complexity > 0.6 ? 3 : 2) * treeMultiplier * chunkScale);
                for (let i = 0; i < frameTreeCount; i++) {
                    const sideSign = i % 2 === 0 ? -1 : 1;
                    const t = rand(0.18, 0.92);
                    const { center, side, tangent } = pathFrame(t);
                    const baseLateral = sideSign * sideOffset(1.7, 4.65);
                    const base = terrainPoint(t, baseLateral, 0.05).point;
                    const top = center.clone()
                        .add(side.clone().multiplyScalar(-sideSign * width * rand(0.28, 0.75)))
                        .add(tangent.clone().multiplyScalar(rand(-16, 16)))
                        .add(new THREE.Vector3(rand(-0.8, 0.8), rand(17, 28), rand(-0.8, 0.8)));
                    const mid = base.clone().lerp(top, 0.48).add(new THREE.Vector3(rand(-0.7, 0.7), rand(2.5, 5.5), rand(-0.7, 0.7)));
                    const radius = rand(0.65, 1.15);
                    addTracked(makeTaperedTube([base, mid, top], radius, radius * rand(0.34, 0.48), localDetail(10, 28), localDetail(6, 10), trunkMat, 0.13), 'trees');
                    const frameBranchCount = Math.max(0, Math.round(localDetail(1, 3) * branchMultiplier));
                    for (let b = 0; b < frameBranchCount; b++) {
                        const origin = base.clone().lerp(top, rand(0.55, 0.92));
                        const branchDir = side.clone().multiplyScalar(-sideSign * rand(0.2, 1)).add(tangent.clone().multiplyScalar(rand(-0.6, 1.3))).normalize();
                        const branchEnd = origin.clone().add(branchDir.multiplyScalar(rand(3.5, 8))).add(new THREE.Vector3(0, rand(0.8, 3.4), 0));
                        const branchMid = origin.clone().lerp(branchEnd, 0.5).add(new THREE.Vector3(0, rand(0.35, 1.2), 0));
                        addTaperedSegmentInstance(branchPlacements, origin, branchMid, radius * rand(0.09, 0.18), rand(0.82, 1.12));
                        addTaperedSegmentInstance(branchPlacements, branchMid, branchEnd, radius * rand(0.035, 0.08), rand(0.74, 1.05));
                        if (Math.random() < canopyCover) addCanopyCluster(branchEnd, rand(2, 4.2), 0.65, rand(0.42, 0.65));
                    }
                    addCanopyCluster(top.clone().add(new THREE.Vector3(0, rand(1.2, 3), 0)), rand(3.2, 6.4), 0.9, rand(0.42, 0.68));
                }

                const roadsideRockClusters = Math.round(roadsideRockDensity * density * localDetail(9, 26) * chunkScale);
                for (let i = 0; i < roadsideRockClusters; i++) {
                    const sideSign = i % 2 === 0 ? -1 : 1;
                    const t = (i + rand(0.05, 0.95)) / Math.max(1, roadsideRockClusters);
                    addRoadsideRockCluster(t, sideSign, rand(0.72, 1.35));
                }

                const understoryCount = Math.round(density * understoryMultiplier * localDetail(14, 62) * Math.max(0.3, understoryHeight / 6) * chunkScale);
                for (let i = 0; i < understoryCount; i++) {
                    const sideSign = Math.random() < 0.5 ? -1 : 1;
                    const t = Math.random();
                    const baseLateral = sideSign * sideOffset(0.75, 3.35);
                    const base = terrainPoint(t, baseLateral, 0.03).point;
                    if (Math.random() < 0.72) {
                        addFernCluster(t, baseLateral, sideSign, rand(0.55, 1.25));
                    } else {
                        const h = Math.max(0.6, understoryHeight * rand(0.35, 1.1));
                        const stemTop = base.clone().add(new THREE.Vector3(rand(-0.25, 0.25), h, rand(-0.25, 0.25)));
                        addTaperedSegmentInstance(stemPlacements, base, stemTop, 0.035, rand(0.8, 1.15));
                        for (let l = 0; l < localDetail(1, 4); l++) {
                            const leafLength = rand(0.8, 1.9);
                            const leafWidth = rand(0.12, 0.32);
                            const materialIndex = Math.floor(Math.random() * leafMats.length);
                            leafPlacementsByMaterial[materialIndex].push({
                                x: stemTop.x,
                                y: stemTop.y,
                                z: stemTop.z,
                                rotationX: rand(0.25, 0.95),
                                rotationY: rand(0, Math.PI * 2),
                                rotationZ: rand(-0.8, 0.8),
                                scaleX: Math.max(0.55, leafWidth / 0.16),
                                scaleY: leafLength,
                                scaleZ: Math.max(0.5, leafLength * rand(0.45, 0.95))
                            });
                        }
                    }
                }

                const rockCount = Math.round(requestedRocks * 0.85 * (0.45 + complexity * 0.55) * chunkScale);
                for (let i = 0; i < rockCount; i++) {
                    const sideSign = Math.random() < 0.5 ? -1 : 1;
                    const pos = terrainPoint(Math.random(), sideSign * sideOffset(0.85, 2.55), rand(0.08, 0.18)).point;
                    addRock(pos, rand(0.35, 1.45), Math.random() < 0.45);
                }

                const canopyMasses = Math.round(canopyCover * density * localDetail(8, 26) * chunkScale);
                for (let i = 0; i < canopyMasses; i++) {
                    const sideSign = Math.random() < 0.5 ? -1 : 1;
                    const anchor = terrainPoint(Math.random(), sideSign * sideOffset(1.05, 5.1), rand(9, 24)).point;
                    addCanopyCluster(anchor, rand(2.2, 6.6), rand(0.35, 0.95), rand(0.35, 0.65));
                }

                const lianaCount = Math.round(requestedVines * 0.75 * density * (0.55 + complexity * 0.75) * chunkScale);
                for (let i = 0; i < lianaCount; i++) {
                    const t = rand(0.03, 0.97);
                    const { side, tangent } = pathFrame(t);
                    const sideSign = Math.random() < 0.5 ? -1 : 1;
                    const anchorOffset = sideOffset(0.95, 3.45);
                    const floorOffset = anchorOffset * rand(0.45, 0.95);
                    const anchor = terrainPoint(t, sideSign * anchorOffset, rand(9, 23)).point;
                    const floorT = clamp01(t + rand(-1.6, 2.2) / Math.max(1, length));
                    const floor = terrainPoint(floorT, sideSign * floorOffset, rand(0.08, 0.18)).point;
                    const drop = Math.max(3, anchor.y - floor.y);
                    const midHigh = anchor.clone().lerp(floor, 0.35)
                        .add(side.clone().multiplyScalar(sideSign * rand(-0.28, 0.32)))
                        .add(tangent.clone().multiplyScalar(rand(-0.75, 0.75)))
                        .add(new THREE.Vector3(0, -drop * 0.04, 0));
                    const midLow = anchor.clone().lerp(floor, 0.72)
                        .add(side.clone().multiplyScalar(sideSign * rand(-0.35, 0.35)))
                        .add(tangent.clone().multiplyScalar(rand(-0.55, 0.55)));
                    addTracked(makeTaperedTube([anchor, midHigh, midLow, floor], rand(0.038, 0.07), rand(0.012, 0.024), localDetail(9, 30), 4, vineMat, 0.055), 'junglePlants');
                }

                flushBatches();
                return addChunkToScene(group, centerZ, stats);
            }

            const chunks = new Map();
            const maxChunkIndex = Math.max(0, Math.ceil((startZ - endZ) / chunkStep));

            function disposeChunk(index) {
                const entry = chunks.get(index);
                if (!entry) {
                    return;
                }
                decor.remove(entry.group);
                if (Array.isArray(game.sceneryCullObjects)) {
                    game.sceneryCullObjects = game.sceneryCullObjects.filter(object => object !== entry.group);
                }
                entry.group.traverse(child => {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                });
                stageDecorStats.trees = Math.max(0, stageDecorStats.trees - entry.stats.trees);
                stageDecorStats.junglePlants = Math.max(0, stageDecorStats.junglePlants - entry.stats.junglePlants);
                stageDecorStats.rockClusters = Math.max(0, stageDecorStats.rockClusters - entry.stats.rockClusters);
                stageDecorStats.totalInstancedProps = Math.max(
                    0,
                    stageDecorStats.totalInstancedProps - entry.stats.trees - entry.stats.junglePlants - entry.stats.rockClusters
                );
                chunks.delete(index);
            }

            function ensureChunk(index) {
                if (index < 0 || index > maxChunkIndex || chunks.has(index)) {
                    return;
                }
                const chunkStartZ = startZ - index * chunkStep;
                if (chunkStartZ <= endZ) {
                    return;
                }
                const entry = createChunk(chunkStartZ, Math.max(endZ, chunkStartZ - chunkLength));
                chunks.set(index, entry);
            }

            function ensureChunksAround(carZ) {
                const lookAhead = Number.isFinite(game.sceneryCullWindow?.ahead) ? game.sceneryCullWindow.ahead : 760;
                const firstIndex = Math.max(0, Math.floor((startZ - (carZ + 140)) / chunkStep));
                const lastIndex = Math.min(maxChunkIndex, Math.ceil((startZ - (carZ - lookAhead)) / chunkStep));
                for (let index = firstIndex; index <= lastIndex; index++) {
                    ensureChunk(index);
                }
                [...chunks.keys()].forEach(index => {
                    if (index < firstIndex - 1 || index > lastIndex + 2) {
                        disposeChunk(index);
                    }
                });
            }

            ensureChunksAround(game.car?.position?.z ?? game.startLine);
            game.stageEffects = game.stageEffects || [];
            game.stageEffects.push({
                type: 'assetsHtmlJungleTrailChunks',
                update(deltaSeconds, activeGame) {
                    ensureChunksAround(activeGame?.car?.position?.z ?? game.startLine);
                }
            });
        }

        addAssetsHtmlJungleTrailChunks();
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
            color: 0xf1efe2,
            specular: 0x3a342b,
            shininess: 12
        });
        const terracottaCapMaterial = new THREE.MeshPhongMaterial({
            color: 0xb44f2f,
            map: roofTexture,
            bumpMap: roofTexture,
            bumpScale: 0.06,
            specular: 0x3a1f16,
            shininess: 10
        });
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x5f3d28, shininess: 5 });
        const cypressMaterial = new THREE.MeshLambertMaterial({ color: 0x123f2d });
        const pineMaterial = new THREE.MeshLambertMaterial({ color: 0x2c5d36 });
        const bushMaterials = [
            new THREE.MeshLambertMaterial({ color: 0x536d35 }),
            new THREE.MeshLambertMaterial({ color: 0x6f7e42 }),
            new THREE.MeshLambertMaterial({ color: 0x315d32 })
        ];
        const flowerMaterials = [
            new THREE.MeshLambertMaterial({ color: 0xa95f74 }),
            new THREE.MeshLambertMaterial({ color: 0xa34a36 }),
            new THREE.MeshLambertMaterial({ color: 0xc5ac50 }),
            new THREE.MeshLambertMaterial({ color: 0xd8d2b8 })
        ];
        const sailMaterial = new THREE.MeshBasicMaterial({ color: 0xfff4d8, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const boatHullMaterial = new THREE.MeshPhongMaterial({ color: 0xf2efe5, shininess: 28 });
        const startZ = game.startLine + 180;
        const endZ = game.finishLine + 170;
        const sampleStride = 3;
        const railSegmentLength = 30;

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
            mesh.frustumCulled = false;
            placements.forEach((placement, index) => {
                const rotation = new THREE.Euler(placement.rotation?.x || 0, placement.rotation?.y || 0, placement.rotation?.z || 0);
                const quaternion = placement.quaternion || new THREE.Quaternion().setFromEuler(rotation);
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

        function getAlignedRoadPlacement(z, side, offsetFromRoadEdge, heightOffset, length = railSegmentLength) {
            const front = getRoadsidePose(z - length * 0.5, side, offsetFromRoadEdge);
            const rear = getRoadsidePose(z + length * 0.5, side, offsetFromRoadEdge);
            const start = new THREE.Vector3(rear.x, rear.roadY + heightOffset, rear.z);
            const end = new THREE.Vector3(front.x, front.roadY + heightOffset, front.z);
            const forward = end.clone().sub(start).normalize();
            const right = localUp.clone().cross(forward).normalize();
            const up = forward.clone().cross(right).normalize();
            const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
            return {
                position: start.clone().add(end).multiplyScalar(0.5),
                quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix)
            };
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
                const innerDistance = profile.shoreDistance + coastalBiome.shoreWidth * 1.52 + lakeNoise.noise2D(segment.z * 0.025, 8.9) * 0.32;
                const outerDistance = terrainWidth + shoulderWidth + coastalBiome.horizonWaterExtension
                    + lakeNoise.noise2D(segment.z * 0.0028, 30.1) * 55;
                rows.push({
                    points: weights.map((weight, columnIndex) => {
                        const t = weight * weight * (3 - 2 * weight);
                        const distance = THREE.MathUtils.lerp(innerDistance, outerDistance, t);
                        const waterlineDrift = lakeNoise.noise2D(segment.z * 0.016, columnIndex * 7.3) * 4.5 * weight;
                        return {
                            x: roadSideX(roadData, -1, distance),
                            y: profile.seaLevel - 0.12,
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
                const farShoreDistance = profile.shoreDistance + coastalBiome.shoreWidth * 1.62;
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
                        { x: roadSideX(roadData, -1, ledgeDistance - 0.8), y: profile.seaLevel + 0.34, z: segment.z },
                        { x: roadSideX(roadData, -1, toeDistance), y: profile.seaLevel + 0.2, z: segment.z },
                        { x: roadSideX(roadData, -1, farShoreDistance), y: profile.seaLevel + 0.14, z: segment.z }
                    ]
                });
            }

            buildRibbonMesh(cliffRows, 4, retainingStoneMaterial, 'coastal-rocky-cliff', null, 0.035);
            buildRibbonMesh(shoreRows, 3, stoneMaterial, 'coastal-limestone-shore', null, 0.04);
        }

        function addRoadsideWalls() {
            const seaWallLength = 16;
            const seaWallStep = seaWallLength * 2;
            const seaWallPlacements = [];
            const seaCapPlacements = [];
            const mountainWallPlacements = [];
            const mountainCapPlacements = [];

            for (let z = startZ - 8; z > endZ; z -= seaWallStep) {
                [-1, 1].forEach(side => {
                    const wallPlacement = getAlignedRoadPlacement(z, side, coastalBiome.wallDistance, 0.34, seaWallLength);
                    const capPlacement = getAlignedRoadPlacement(z, side, coastalBiome.wallDistance, 0.78, seaWallLength);
                    if (side < 0) {
                        seaWallPlacements.push(wallPlacement);
                        seaCapPlacements.push(capPlacement);
                    } else {
                        mountainWallPlacements.push(wallPlacement);
                        mountainCapPlacements.push(capPlacement);
                    }
                });
            }

            addInstanced(
                'coastal-sea-white-brick-guardwalls',
                new THREE.BoxGeometry(0.58, 0.68, seaWallLength + 0.35),
                limestoneBarrierMaterial,
                seaWallPlacements
            );
            addInstanced(
                'coastal-sea-red-brick-caps',
                new THREE.BoxGeometry(0.72, 0.18, seaWallLength + 0.45),
                terracottaCapMaterial,
                seaCapPlacements
            );
            addInstanced(
                'coastal-mountain-white-brick-guardwalls',
                new THREE.BoxGeometry(0.58, 0.68, seaWallLength + 0.35),
                limestoneBarrierMaterial,
                mountainWallPlacements
            );
            addInstanced(
                'coastal-mountain-red-brick-caps',
                new THREE.BoxGeometry(0.72, 0.18, seaWallLength + 0.45),
                terracottaCapMaterial,
                mountainCapPlacements
            );
            stageDecorStats.seaWalls += seaWallPlacements.length;
            stageDecorStats.guardrails += seaCapPlacements.length + mountainWallPlacements.length + mountainCapPlacements.length;
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

        function createFlowerBush(scale = 1, flowerMaterial = null) {
            const bush = new THREE.Group();
            bush.name = 'coastal-low-aromatic-shrub';
            for (let i = 0; i < 6; i++) {
                const foliage = new THREE.Mesh(new THREE.SphereGeometry((0.58 + Math.random() * 0.28) * scale, 8, 5), bushMaterials[i % bushMaterials.length]);
                foliage.scale.set(1.35 + Math.random() * 0.55, 0.16 + Math.random() * 0.08, 0.78 + Math.random() * 0.34);
                foliage.position.set((Math.random() - 0.5) * 1.55 * scale, 0.13 * scale, (Math.random() - 0.5) * 1.08 * scale);
                foliage.rotation.y = Math.random() * Math.PI;
                bush.add(foliage);
            }
            const patchMaterial = flowerMaterial || flowerMaterials[Math.floor(Math.random() * flowerMaterials.length)];
            const flowerCount = 6 + Math.floor(Math.random() * 8);
            for (let i = 0; i < flowerCount; i++) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry((0.045 + Math.random() * 0.025) * scale, 5, 3), patchMaterial);
                flower.position.set((Math.random() - 0.5) * 1.65 * scale, 0.28 * scale + Math.random() * 0.08 * scale, (Math.random() - 0.5) * 1.12 * scale);
                bush.add(flower);
            }
            return bush;
        }

        function placeVegetation() {
            for (let z = startZ - 25; z > endZ; z -= 68) {
                const roadData = getLinearRoadDataAtZ(z);
                const isCluster = Math.random() < 0.72;
                const clusterCount = isCluster ? 2 + Math.floor(Math.random() * 3) : 1;
                for (let i = 0; i < clusterCount; i++) {
                    const offset = 10 + Math.random() * 74;
                    const treeZ = z + (Math.random() - 0.5) * 34;
                    const treeRoadData = getLinearRoadDataAtZ(treeZ);
                    const x = roadSideX(treeRoadData, 1, offset);
                    const normal = getTerrainNormalAt(x, treeZ, 2.4);
                    if (normal.y < 0.68) {
                        continue;
                    }

                    const scale = 0.72 + Math.random() * 0.72;
                    const tree = Math.random() < 0.16 ? createCypressTree(scale) : createStonePine(scale);
                    tree.position.set(x, getTerrainHeightAt(x, treeZ) - 0.08 * scale, treeZ);
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    addDecorGroup(decor, tree, 'trees');
                }
            }

            for (let z = startZ - 10; z > endZ; z -= 38) {
                [1, -1].forEach(side => {
                    if (side < 0 && Math.random() < 0.72) {
                        return;
                    }
                    const roadData = getLinearRoadDataAtZ(z);
                    const bushCount = side > 0
                        ? 1 + (Math.random() < 0.58 ? 1 : 0)
                        : 1;
                    const materialIndex = Math.abs(Math.floor(z / 76) + (side > 0 ? 0 : 2)) % flowerMaterials.length;
                    const patchMaterial = flowerMaterials[materialIndex];
                    for (let i = 0; i < bushCount; i++) {
                        const bushZ = z + (Math.random() - 0.5) * 22;
                        const bushRoadData = getLinearRoadDataAtZ(bushZ);
                        const offset = side > 0
                            ? (i === 0 ? 3.1 + Math.random() * 4.8 : 7.5 + Math.random() * 34)
                            : 3.4 + Math.random() * 7.4;
                        const x = roadSideX(bushRoadData, side, offset);
                        if (side < 0) {
                            const profile = getCoastalShoreProfile(-1, bushZ, bushRoadData);
                            if (offset > profile.shoreDistance - 1.6) {
                                return;
                            }
                        }
                        const normal = getTerrainNormalAt(x, bushZ, 1.8);
                        if (normal.y < 0.46) {
                            return;
                        }
                        const bush = createFlowerBush(0.76 + Math.random() * 0.46, patchMaterial);
                        bush.position.set(x, getTerrainHeightAt(x, bushZ) + 0.035, bushZ);
                        bush.quaternion.setFromUnitVectors(localUp, normal);
                        bush.rotateY(Math.random() * Math.PI * 2);
                        addDecorGroup(decor, bush, 'coastalDetails');
                    }
                });
            }
        }

        function addBoats() {
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
        placeVegetation();
        addBoats();
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
        const cactusMaterial = new THREE.MeshPhongMaterial({ color: 0x2b6b3f, shininess: 5 });
        const cactusDarkMaterial = new THREE.MeshPhongMaterial({ color: 0x1f5132, shininess: 4 });
        const yuccaMaterial = new THREE.MeshPhongMaterial({ color: 0x6d8a50, shininess: 6 });
        const shrubMaterial = new THREE.MeshPhongMaterial({ color: 0x7b6b3e, shininess: 3 });
        const dryGrassMaterial = new THREE.MeshPhongMaterial({ color: 0xc49a54, shininess: 2 });
        const rockMaterial = new THREE.MeshPhongMaterial({ color: 0xa8643d, shininess: 4, flatShading: true });
        const rockLightMaterial = new THREE.MeshPhongMaterial({ color: 0xd28c58, shininess: 5, flatShading: true });
        const mesaShadowMaterial = new THREE.MeshPhongMaterial({ color: 0x935538, shininess: 3, flatShading: true });
        const mesaCapMaterial = new THREE.MeshPhongMaterial({ color: 0xc47b4c, shininess: 4, flatShading: true });
        const washMaterial = new THREE.MeshBasicMaterial({ color: 0x6a3f2b, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
        const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xf2d06a, shininess: 12 });
        const signPostMaterial = new THREE.MeshPhongMaterial({ color: 0x5a3a28, shininess: 6 });
        const signFaceMaterial = new THREE.MeshPhongMaterial({ color: 0xd9a14e, shininess: 12 });
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const markerGeometry = new THREE.BoxGeometry(0.3, 1.55, 0.2);
        const shrubGeometry = new THREE.DodecahedronGeometry(1, 0);
        const startZ = game.startLine - 70;
        const endZ = game.finishLine + 100;

        function groundObject(object, x, z, footprint = 0, lift = 0) {
            object.position.set(x, getPropHighGroundY(x, z, footprint) + lift, z);
            return object;
        }

        function createDesertShrub(scale = 1) {
            const shrub = new THREE.Group();
            const clumps = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < clumps; i++) {
                const clump = new THREE.Mesh(shrubGeometry, i % 2 === 0 ? shrubMaterial : dryGrassMaterial);
                clump.scale.set(
                    (0.65 + Math.random() * 0.55) * scale,
                    (0.22 + Math.random() * 0.28) * scale,
                    (0.55 + Math.random() * 0.5) * scale
                );
                clump.position.set((Math.random() - 0.5) * scale * 1.6, clump.scale.y * 0.45, (Math.random() - 0.5) * scale * 1.4);
                shrub.add(clump);
            }
            return shrub;
        }

        function createYucca(scale = 1) {
            const yucca = new THREE.Group();
            const leaves = 9 + Math.floor(Math.random() * 5);
            for (let i = 0; i < leaves; i++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08 * scale, 1.4 * scale, 5), yuccaMaterial);
                const angle = (i / leaves) * Math.PI * 2;
                leaf.position.set(Math.cos(angle) * 0.32 * scale, 0.42 * scale, Math.sin(angle) * 0.32 * scale);
                leaf.rotation.z = Math.PI / 2.4;
                leaf.rotation.y = -angle;
                yucca.add(leaf);
            }
            const heart = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 * scale, 0), cactusDarkMaterial);
            heart.position.y = 0.28 * scale;
            yucca.add(heart);
            return yucca;
        }

        function createBarrelCactus(scale = 1) {
            const barrel = new THREE.Mesh(new THREE.SphereGeometry(0.58 * scale, 10, 8), cactusDarkMaterial);
            barrel.scale.y = 1.18;
            barrel.position.y = 0.55 * scale;
            return barrel;
        }

        function createOcotillo(scale = 1) {
            const plant = new THREE.Group();
            const branchMaterial = cactusDarkMaterial;
            const branchCount = 5 + Math.floor(Math.random() * 4);
            for (let i = 0; i < branchCount; i++) {
                const height = (2.2 + Math.random() * 2.2) * scale;
                const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.055 * scale, height, 5), branchMaterial);
                const angle = (i / branchCount) * Math.PI * 2 + Math.random() * 0.25;
                branch.position.set(Math.cos(angle) * 0.18 * scale, height * 0.5, Math.sin(angle) * 0.18 * scale);
                branch.rotation.z = Math.cos(angle) * (0.18 + Math.random() * 0.18);
                branch.rotation.x = Math.sin(angle) * (0.18 + Math.random() * 0.18);
                plant.add(branch);
                if (Math.random() < 0.55) {
                    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 6, 4), markerMaterial);
                    flower.position.set(Math.cos(angle) * 0.36 * scale, height * 0.95, Math.sin(angle) * 0.36 * scale);
                    plant.add(flower);
                }
            }
            return plant;
        }

        function createMesaLayerGeometry(width, depth, height, lowerScale, upperScale) {
            const segments = 11;
            const positions = [];
            const indices = [];
            const bottomRing = [];
            const topRing = [];
            const bottomCenter = segments * 2;
            const topCenter = bottomCenter + 1;
            const skewX = (Math.random() - 0.5) * width * 0.08;
            const skewZ = (Math.random() - 0.5) * depth * 0.08;

            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const lowerNoise = 0.82 + Math.random() * 0.34;
                const upperNoise = 0.78 + Math.random() * 0.32;
                const lowerX = Math.cos(angle) * width * 0.5 * lowerScale * lowerNoise;
                const lowerZ = Math.sin(angle) * depth * 0.5 * lowerScale * lowerNoise;
                const upperX = Math.cos(angle) * width * 0.5 * upperScale * upperNoise + skewX;
                const upperZ = Math.sin(angle) * depth * 0.5 * upperScale * upperNoise + skewZ;
                bottomRing.push(i * 2);
                topRing.push(i * 2 + 1);
                positions.push(lowerX, 0, lowerZ, upperX, height, upperZ);
            }

            positions.push(0, 0, 0, skewX, height, skewZ);

            for (let i = 0; i < segments; i++) {
                const next = (i + 1) % segments;
                const b0 = bottomRing[i];
                const t0 = topRing[i];
                const b1 = bottomRing[next];
                const t1 = topRing[next];
                indices.push(b0, b1, t0, t0, b1, t1);
                indices.push(topCenter, t0, t1);
                indices.push(bottomCenter, b1, b0);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
            return geometry;
        }

        function createLayeredMesa(width, depth, height, materialOffset = 0) {
            const mesa = new THREE.Group();
            const layerFractions = [0.38, 0.29, 0.2, 0.13];
            const layers = layerFractions.length;
            const materials = [rockLightMaterial, rockMaterial, mesaShadowMaterial, mesaCapMaterial];
            let y = 0;
            for (let i = 0; i < layers; i++) {
                const layerHeight = height * layerFractions[i];
                const layerWidth = width * (1 - i * 0.1) * (0.94 + Math.random() * 0.12);
                const layerDepth = depth * (1 - i * 0.12) * (0.92 + Math.random() * 0.16);
                const lowerScale = 1 - i * 0.08;
                const upperScale = Math.max(0.52, lowerScale - 0.16 - Math.random() * 0.12);
                const layer = new THREE.Mesh(
                    createMesaLayerGeometry(layerWidth, layerDepth, layerHeight, lowerScale, upperScale),
                    materials[(i + materialOffset) % materials.length]
                );
                layer.position.set((Math.random() - 0.5) * width * 0.035, y, (Math.random() - 0.5) * depth * 0.035);
                layer.rotation.y = (Math.random() - 0.5) * 0.16;
                mesa.add(layer);
                y += layerHeight * 0.78;
            }

            const talusMaterial = Math.random() < 0.5 ? rockLightMaterial : rockMaterial;
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.42 + Math.random() * 0.22;
                const stone = new THREE.Mesh(rockGeometry, i % 3 === 0 ? mesaShadowMaterial : talusMaterial);
                stone.name = 'desert-mesa-talus';
                stone.scale.set(
                    0.75 + Math.random() * 1.8,
                    0.22 + Math.random() * 0.5,
                    0.65 + Math.random() * 1.5
                );
                stone.position.set(Math.cos(angle) * width * radius, stone.scale.y * 0.45, Math.sin(angle) * depth * radius);
                stone.rotation.set((Math.random() - 0.5) * 0.18, Math.random() * Math.PI, (Math.random() - 0.5) * 0.18);
                mesa.add(stone);
            }
            return mesa;
        }

        function createRockArch(scale = 1) {
            const arch = new THREE.Group();
            const columnGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.35 * scale, 7.2 * scale, 7);
            const left = new THREE.Mesh(columnGeometry, rockMaterial);
            const right = new THREE.Mesh(columnGeometry, rockLightMaterial);
            left.position.set(-2.8 * scale, 3.6 * scale, 0);
            right.position.set(2.8 * scale, 3.6 * scale, 0);
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(7.4 * scale, 2.1 * scale, 2.35 * scale), mesaCapMaterial);
            lintel.position.y = 7.45 * scale;
            const cap = new THREE.Mesh(new THREE.BoxGeometry(8.1 * scale, 0.62 * scale, 2.75 * scale), rockLightMaterial);
            cap.position.y = 8.82 * scale;
            arch.add(left, right, lintel, cap);
            return arch;
        }

        function createDryWashRibbon(zCenter, side, offset, length, width) {
            const rows = 18;
            const positions = [];
            const uvs = [];
            const indices = [];
            for (let i = 0; i <= rows; i++) {
                const t = i / rows;
                const z = zCenter + (t - 0.5) * length;
                const roadData = getLinearRoadDataAtZ(z);
                const centerX = roadData.curve + side * (halfRoadWidth + offset + Math.sin(t * Math.PI * 2 + zCenter * 0.01) * 4.5);
                [-0.5, 0.5].forEach((edge, edgeIndex) => {
                    const x = centerX + edge * width;
                    positions.push(x, getTerrainHeightAt(x, z) + 0.08, z);
                    uvs.push(edgeIndex, t);
                });
                if (i < rows) {
                    const index = i * 2;
                    indices.push(index, index + 1, index + 2, index + 1, index + 3, index + 2);
                }
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(indices);
            geometry.translate(0, 0, -zCenter);
            geometry.computeVertexNormals();
            const wash = new THREE.Mesh(geometry, washMaterial);
            wash.name = 'desert-dry-wash';
            wash.position.z = zCenter;
            return wash;
        }

        function createRoadSign(labelTexture = null) {
            const sign = new THREE.Group();
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), signPostMaterial);
            post.position.y = 1.4;
            const face = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.05, 0.08), signFaceMaterial);
            face.position.y = 2.65;
            sign.add(post, face);
            return sign;
        }

        for (let z = startZ - 22; z > endZ; z -= 118) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.54) {
                    const pose = getRoadsidePose(z, side, 16 + Math.random() * 34);
                    const cactus = createCactus(cactusMaterial);
                    const cactusZ = z + (Math.random() - 0.5) * 18;
                    cactus.name = 'desert-cactus';
                    cactus.scale.setScalar(0.82 + Math.random() * 0.5);
                    cactus.position.set(pose.x, getPropGroundY(pose.x, cactusZ, 1.2), cactusZ);
                    cactus.rotation.y = Math.random() * Math.PI;
                    addDecorGroup(decor, cactus, 'cacti');
                }
            });
        }

        for (let z = startZ - 28; z > endZ; z -= 64) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.78) {
                    const clusterZ = z + (Math.random() - 0.5) * 24;
                    const clusterOffset = 10 + Math.random() * 38;
                    const clusterSize = 2 + Math.floor(Math.random() * 5);
                    for (let i = 0; i < clusterSize; i++) {
                        const localZ = clusterZ + (Math.random() - 0.5) * 18;
                        const pose = getRoadsidePose(localZ, side, clusterOffset + Math.random() * 12);
                        const plantRoll = Math.random();
                        const scale = 0.65 + Math.random() * 1.1;
                        let plant;
                        if (plantRoll < 0.38) {
                            plant = createDesertShrub(scale);
                        } else if (plantRoll < 0.62) {
                            plant = createYucca(scale);
                        } else if (plantRoll < 0.82) {
                            plant = createBarrelCactus(scale);
                        } else {
                            plant = createOcotillo(0.75 + Math.random() * 0.8);
                        }
                        plant.name = 'desert-plant-cluster';
                        groundObject(plant, pose.x + side * (Math.random() - 0.5) * 4.4, localZ, 1.1);
                        plant.rotation.y = Math.random() * Math.PI * 2;
                        addDecorGroup(decor, plant, plantRoll < 0.62 ? 'sandDrifts' : 'cacti');
                    }
                }
            });
        }

        for (let z = startZ - 120; z > endZ; z -= 540) {
            [-1, 1].forEach(side => {
                const wash = createDryWashRibbon(z + (Math.random() - 0.5) * 90, side, 28 + Math.random() * 42, 150 + Math.random() * 120, 7 + Math.random() * 8);
                addDecorMesh(decor, wash, 'sandDrifts');
            });
        }

        for (let z = startZ - 180; z > endZ - 280; z -= 430) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.86) {
                    const mesaZ = z + (Math.random() - 0.5) * 100;
                    const pose = getRoadsidePose(mesaZ, side, 118 + Math.random() * 190);
                    const mesa = createLayeredMesa(22 + Math.random() * 32, 13 + Math.random() * 24, 4.8 + Math.random() * 7.2, Math.floor(Math.random() * 4));
                    mesa.name = 'desert-distant-mesa';
                    groundObject(mesa, pose.x, mesaZ, 10);
                    mesa.rotation.y = pose.yaw + (Math.random() - 0.5) * 0.4;
                    addDecorGroup(decor, mesa, 'rockClusters');
                }
            });
        }

        [-1280, -3180, -4960].forEach((landmarkZ, index) => {
            const side = index % 2 === 0 ? 1 : -1;
            const pose = getRoadsidePose(landmarkZ, side, 46 + index * 8);
            const arch = createRockArch(1.1 + index * 0.18);
            arch.name = 'desert-red-rock-arch';
            groundObject(arch, pose.x, landmarkZ, 8);
            arch.rotation.y = pose.yaw + side * (0.3 + index * 0.08);
            addDecorGroup(decor, arch, 'rockClusters');
        });

        for (let z = startZ - 320; z > endZ; z -= 720) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 7 + Math.random() * 4);
            const sign = createRoadSign();
            sign.name = 'desert-weathered-road-sign';
            sign.position.set(pose.x, pose.roadY, z);
            sign.rotation.y = pose.yaw + side * 0.18;
            addDecorGroup(decor, sign, 'hazardMarkers');
        }

        for (let z = startZ - 50; z > endZ; z -= 138) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z, side, 14 + Math.random() * 34);
            const rocksInCluster = 3 + Math.floor(Math.random() * 5);
            let placedRocks = 0;
            for (let i = 0; i < rocksInCluster; i++) {
                const rock = new THREE.Mesh(rockGeometry, i % 2 === 0 ? rockMaterial : rockLightMaterial);
                rock.name = 'desert-red-rock';
                rock.scale.set(1.1 + Math.random() * 3.4, 0.46 + Math.random() * 1.35, 0.9 + Math.random() * 2.8);
                const rockX = pose.x + side * Math.random() * 6;
                const rockZ = z + (Math.random() - 0.5) * 12;
                const terrainNormal = getTerrainNormalAt(rockX, rockZ, 2);
                if (terrainNormal.y < 0.78) {
                    continue;
                }
                const lowGroundY = getPropGroundY(rockX, rockZ, 2.4);
                const highGroundY = getPropHighGroundY(rockX, rockZ, 2.4);
                if (highGroundY - lowGroundY > 1.4) {
                    continue;
                }
                rock.position.set(rockX, highGroundY + rock.scale.y * 0.95, rockZ);
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

        for (let z = startZ - 12; z > endZ; z -= 76) {
            [-1, 1].forEach(side => {
                const pose = getRoadsidePose(z, side, 1.8);
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.name = 'desert-road-marker';
                marker.position.set(pose.x, pose.roadY + 0.78, z);
                marker.rotation.y = pose.yaw;
                addDecorMesh(decor, marker, 'hazardMarkers');
            });
        }
    }

    function addHighlandRoadsideDecor(decor) {
        const fenceMaterial = new THREE.MeshPhongMaterial({ color: 0x5a4a32, shininess: 5 });
        const wireMaterial = new THREE.MeshPhongMaterial({ color: 0x334046, shininess: 12 });
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x4b524b, flatShading: true });
        const darkRockMaterial = new THREE.MeshLambertMaterial({ color: 0x2f372f, flatShading: true });
        const screeMaterial = new THREE.MeshLambertMaterial({ color: 0x5f5c51, flatShading: true });
        const grassMaterial = new THREE.MeshPhongMaterial({ color: 0x6f8f47, shininess: 4, flatShading: true });
        const rushMaterial = new THREE.MeshPhongMaterial({ color: 0x8d8a4a, shininess: 5, flatShading: true });
        const heatherMaterial = new THREE.MeshPhongMaterial({ color: 0x6c465b, shininess: 4, flatShading: true });
        const brackenMaterial = new THREE.MeshPhongMaterial({ color: 0x7a4e32, shininess: 4, flatShading: true });
        const ochreMoorMaterial = new THREE.MeshPhongMaterial({ color: 0x9a7a3c, shininess: 4, flatShading: true });
        const signRedMaterial = new THREE.MeshBasicMaterial({ color: 0x9f1616, side: THREE.DoubleSide });
        const signWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f0e4, side: THREE.DoubleSide });
        const signBlackMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const fenceRailLength = 18;
        const fencePostGeometry = new THREE.BoxGeometry(0.16, 1.25, 0.16);
        const fenceWireGeometry = new THREE.BoxGeometry(0.055, 0.035, fenceRailLength);
        const wallGeometry = new THREE.BoxGeometry(0.56, 0.48, 10);
        const stoneGeometry = new THREE.DodecahedronGeometry(0.52, 0);
        const heatherGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rushBladeGeometry = new THREE.ConeGeometry(0.055, 1, 5);
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, 0.68);
        triangleShape.lineTo(-0.72, -0.56);
        triangleShape.lineTo(0.72, -0.56);
        triangleShape.lineTo(0, 0.68);
        const signTriangleGeometry = new THREE.ShapeGeometry(triangleShape);
        const signPoleGeometry = new THREE.CylinderGeometry(0.045, 0.055, 2.45, 8);
        const signRockGeometry = new THREE.CircleGeometry(0.06, 8);
        const startZ = game.startLine - 70;
        const endZ = game.finishLine + 140;

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

        function placeGroundedObject(object, x, z, footprint = 0.8, lift = 0.03, alignToGround = true) {
            const y = getPropHighGroundY(x, z, footprint) + lift;
            object.position.set(x, y, z);
            if (alignToGround) {
                object.quaternion.setFromUnitVectors(localUp, getTerrainNormalAt(x, z, Math.max(0.8, footprint * 0.4)));
                object.rotateY(Math.random() * Math.PI * 2);
            }
            return object;
        }

        function isStableHighlandGround(x, z, footprint = 2, minNormalY = 0.72, maxRelief = 0.9) {
            const normal = getTerrainNormalAt(x, z, Math.max(1, footprint * 0.45));
            if (normal.y < minNormalY) {
                return false;
            }
            return getPropHighGroundY(x, z, footprint) - getPropGroundY(x, z, footprint) <= maxRelief;
        }

        function createGroundStoneRow(z, side, offsetFromRoadEdge, length = 8.5) {
            const centerPose = getRoadsidePose(z, side, offsetFromRoadEdge);
            const row = new THREE.Group();
            const stoneCount = 7 + Math.floor(Math.random() * 4);
            row.name = 'scotland-highland-ground-stone-row';
            row.position.set(centerPose.x, 0, z);

            for (let i = 0; i < stoneCount; i++) {
                const t = stoneCount === 1 ? 0.5 : i / (stoneCount - 1);
                const stoneZ = z + (t - 0.5) * length + (Math.random() - 0.5) * 0.7;
                const stonePose = getRoadsidePose(stoneZ, side, offsetFromRoadEdge + (Math.random() - 0.5) * 0.45);

                if (!isStableHighlandGround(stonePose.x, stoneZ, 1.35, 0.76, 0.48)) {
                    continue;
                }

                const stone = new THREE.Mesh(stoneGeometry, i % 3 === 0 ? screeMaterial : rockMaterial);
                stone.scale.set(
                    0.34 + Math.random() * 0.28,
                    0.12 + Math.random() * 0.1,
                    0.26 + Math.random() * 0.24
                );
                stone.position.set(
                    stonePose.x - row.position.x,
                    getPropHighGroundY(stonePose.x, stoneZ, 0.8) + stone.scale.y * 0.7,
                    stoneZ - row.position.z
                );
                stone.quaternion.setFromUnitVectors(localUp, getTerrainNormalAt(stonePose.x, stoneZ, 0.85));
                stone.rotateY(Math.random() * Math.PI);
                row.add(stone);
            }

            return row.children.length > 0 ? row : null;
        }

        function createHeatherPatch(scale = 1) {
            const patch = new THREE.Group();
            const clumps = 4 + Math.floor(Math.random() * 4);
            for (let i = 0; i < clumps; i++) {
                const material = i % 3 === 0 ? heatherMaterial : i % 3 === 1 ? brackenMaterial : grassMaterial;
                const clump = new THREE.Mesh(heatherGeometry, material);
                clump.scale.set(
                    (0.7 + Math.random() * 1.4) * scale,
                    (0.12 + Math.random() * 0.16) * scale,
                    (0.55 + Math.random() * 1.1) * scale
                );
                clump.position.set((Math.random() - 0.5) * scale * 3.4, clump.scale.y * 0.55, (Math.random() - 0.5) * scale * 2.8);
                clump.rotation.y = Math.random() * Math.PI;
                patch.add(clump);
            }
            return patch;
        }

        function createRushGrass(scale = 1) {
            const tuft = new THREE.Group();
            const blades = 7 + Math.floor(Math.random() * 8);
            for (let i = 0; i < blades; i++) {
                const blade = new THREE.Mesh(rushBladeGeometry, i % 3 === 0 ? ochreMoorMaterial : rushMaterial);
                const angle = (i / blades) * Math.PI * 2 + Math.random() * 0.2;
                const height = (0.75 + Math.random() * 1.35) * scale;
                blade.scale.set(0.8 + Math.random() * 0.6, height, 0.8 + Math.random() * 0.5);
                blade.position.set(Math.cos(angle) * scale * 0.22, height * 0.46, Math.sin(angle) * scale * 0.22);
                blade.rotation.z = Math.cos(angle) * (0.2 + Math.random() * 0.22);
                blade.rotation.x = Math.sin(angle) * (0.2 + Math.random() * 0.22);
                tuft.add(blade);
            }
            return tuft;
        }

        function createRockCluster(scale = 1) {
            const cluster = new THREE.Group();
            const rocks = 2 + Math.floor(Math.random() * 4);
            for (let i = 0; i < rocks; i++) {
                const rock = new THREE.Mesh(stoneGeometry, i % 3 === 0 ? screeMaterial : i % 2 === 0 ? rockMaterial : darkRockMaterial);
                rock.scale.set(
                    (0.34 + Math.random() * 0.9) * scale,
                    (0.16 + Math.random() * 0.34) * scale,
                    (0.32 + Math.random() * 0.8) * scale
                );
                rock.position.set((Math.random() - 0.5) * scale * 2.6, rock.scale.y * 0.5, (Math.random() - 0.5) * scale * 2.2);
                rock.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.28);
                cluster.add(rock);
            }
            return cluster;
        }

        function createRockfallWarningSign() {
            const sign = new THREE.Group();
            const pole = new THREE.Mesh(signPoleGeometry, wireMaterial);
            pole.position.y = 1.22;
            sign.add(pole);

            const outer = new THREE.Mesh(signTriangleGeometry, signRedMaterial);
            outer.position.y = 2.54;
            outer.scale.setScalar(1.05);
            sign.add(outer);

            const inner = new THREE.Mesh(signTriangleGeometry, signWhiteMaterial);
            inner.position.set(0, 2.54, 0.012);
            inner.scale.setScalar(0.72);
            sign.add(inner);

            [
                { x: -0.18, y: 2.62, s: 0.85 },
                { x: 0.08, y: 2.39, s: 1.05 },
                { x: 0.28, y: 2.13, s: 0.72 }
            ].forEach(dot => {
                const rock = new THREE.Mesh(signRockGeometry, signBlackMaterial);
                rock.position.set(dot.x, dot.y, 0.028);
                rock.scale.setScalar(dot.s);
                sign.add(rock);
            });

            return sign;
        }

        for (let z = startZ; z > endZ; z -= 32) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.72) {
                    [0.64, 0.98].forEach(height => {
                        const wire = new THREE.Mesh(fenceWireGeometry, wireMaterial);
                        wire.name = 'scotland-highland-wire-fence';
                        alignLongRoadsideMesh(wire, z, side, 2.9, fenceRailLength, height);
                        addDecorMesh(decor, wire, 'fenceSegments');
                    });

                    [-0.5, 0.5].forEach(end => {
                        const pose = getGroundedRoadsidePoint(z + end * fenceRailLength, side, 2.9);
                        const post = new THREE.Mesh(fencePostGeometry, fenceMaterial);
                        post.name = 'scotland-highland-fence-post';
                        post.position.set(pose.x, pose.y + 0.62, pose.z);
                        post.rotation.y = pose.yaw;
                        post.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(localUp, getTerrainNormalAt(pose.x, pose.z, 0.8)));
                        addDecorMesh(decor, post, 'fenceSegments');
                    });
                }
            });
        }

        for (let z = startZ - 18; z > endZ; z -= 30) {
            [-1, 1].forEach(side => {
                const clusterCount = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < clusterCount; i++) {
                    const patchZ = z + (Math.random() - 0.5) * 20;
                    const pose = getRoadsidePose(patchZ, side, 9 + Math.random() * 58);
                    if (!isStableHighlandGround(pose.x, patchZ, 2.6, 0.76, 0.65)) {
                        continue;
                    }
                    const patch = createHeatherPatch(0.55 + Math.random() * 1.35);
                    patch.name = 'scotland-highland-heather';
                    placeGroundedObject(patch, pose.x + side * (Math.random() - 0.5) * 4.5, patchZ, 2.4, 0.04);
                    addDecorGroup(decor, patch, 'highlandDetails');
                }
            });
        }

        for (let z = startZ - 35; z > endZ; z -= 52) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.82) {
                    const tuftZ = z + (Math.random() - 0.5) * 24;
                    const pose = getRoadsidePose(tuftZ, side, 13 + Math.random() * 34);
                    if (!isStableHighlandGround(pose.x, tuftZ, 1.8, 0.78, 0.5)) {
                        return;
                    }
                    const tuft = createRushGrass(0.7 + Math.random() * 0.85);
                    tuft.name = 'scotland-highland-rush-grass';
                    placeGroundedObject(tuft, pose.x, tuftZ, 1.2, 0.03);
                    addDecorGroup(decor, tuft, 'highlandDetails');
                }
            });
        }

        for (let z = startZ - 80; z > endZ; z -= 138) {
            [-1, 1].forEach(side => {
                if (Math.random() < 0.58) {
                    const rockZ = z + (Math.random() - 0.5) * 38;
                    const offset = 72 + Math.random() * 154;
                    const pose = getRoadsidePose(rockZ, side, offset);
                    if (!isStableHighlandGround(pose.x, rockZ, 5.2, 0.82, 0.72)) {
                        return;
                    }
                    const cluster = createRockCluster(0.34 + Math.random() * 0.78);
                    cluster.name = 'scotland-highland-scree-rocks';
                    placeGroundedObject(cluster, pose.x, rockZ, 4.8, 0.06);
                    addDecorGroup(decor, cluster, 'rockClusters');
                }
            });
        }

        for (let z = startZ - 180; z > endZ; z -= 620) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const pose = getRoadsidePose(z + (Math.random() - 0.5) * 80, side, 5.2);
            const sign = createRockfallWarningSign();
            sign.name = 'scotland-rockfall-warning-sign';
            sign.position.set(pose.x, getPropGroundY(pose.x, pose.z, 0.5), pose.z);
            sign.rotation.y = pose.yaw + (side > 0 ? -Math.PI / 2 : Math.PI / 2);
            addDecorGroup(decor, sign, 'hazardMarkers');
        }

        for (let z = startZ - 120; z > endZ; z -= 520) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const wallZ = z + (Math.random() - 0.5) * 90;
            const wall = createGroundStoneRow(wallZ, side, 5.8, 8.5);
            if (wall) {
                addDecorGroup(decor, wall, 'stoneWalls');
            }
        }
    }

    function addScotlandRoadsideDecor(decor) {
        if (environment.terrainStyle === 'highland') {
            addHighlandRoadsideDecor(decor);
            return;
        }

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
    if (!environment.disableRain) {
        addGenericRainEffect();
    }

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
    
    function getAtmosphereSettings() {
        const baseFog = new THREE.Color(environment.fogColor || 0x73b6cf);
        const isNight = Boolean(environment.nightRace);
        const isRainy = !environment.disableRain;
        const isFoggy = environment.weatherMode === 'fog';
        const fogColor = baseFog.clone();
        let fogDensity = environment.fogDensity || 0.00115;
        let skyColor = baseFog.clone();
        let skyOverlay = null;
        let fogMode = 'exp2';
        let fogNear = 0;
        let fogFar = 0;

        if (isNight) {
            fogColor.lerp(new THREE.Color(0x071321), 0.7);
            skyColor.copy(fogColor).lerp(new THREE.Color(0x030811), 0.32);
            fogDensity *= 1.55;
            skyOverlay = {
                color: 'rgba(3, 10, 22, 0.66)',
                horizon: 'rgba(62, 95, 122, 0.24)'
            };
        } else {
            skyColor.copy(baseFog);
            if (!isRainy) {
                fogColor.lerp(new THREE.Color(0xbfe5da), 0.18);
                fogDensity *= 0.42;
            }
            skyOverlay = {
                color: isRainy ? 'rgba(255, 250, 230, 0.03)' : 'rgba(255, 255, 238, 0.1)',
                horizon: isRainy ? 'rgba(255, 248, 210, 0.1)' : 'rgba(255, 252, 210, 0.18)'
            };
        }

        if (isRainy) {
            fogColor.lerp(new THREE.Color(isNight ? 0x0d1824 : 0x6f7f82), isNight ? 0.38 : 0.34);
            skyColor.lerp(new THREE.Color(isNight ? 0x08101d : 0x67797d), isNight ? 0.42 : 0.3);
            fogDensity *= isNight ? 1.32 : 1.42;
            skyOverlay = {
                color: isNight ? 'rgba(4, 9, 17, 0.76)' : 'rgba(60, 73, 76, 0.34)',
                horizon: isNight ? 'rgba(44, 72, 91, 0.28)' : 'rgba(132, 146, 142, 0.22)'
            };
        }

        if (isNight && environment.id === 'city') {
            if (Number.isFinite(environment.nightFogDensityMultiplier)) {
                fogDensity *= Math.max(0.1, environment.nightFogDensityMultiplier);
            }
            if (Number.isFinite(environment.nightFogColor)) {
                fogColor.lerp(new THREE.Color(environment.nightFogColor), 0.78);
                skyColor.lerp(new THREE.Color(environment.nightFogColor), 0.42);
            }
            if (environment.nightSkyOverlay) {
                skyOverlay = {
                    color: environment.nightSkyOverlay.color || skyOverlay?.color || 'rgba(3, 10, 22, 0.72)',
                    horizon: environment.nightSkyOverlay.horizon || skyOverlay?.horizon || 'rgba(50, 80, 108, 0.22)'
                };
            }
        }

        if (isFoggy) {
            fogMode = 'linear';
            const fogWeatherColor = baseFog.clone().lerp(new THREE.Color(isNight ? 0x1d252b : 0x7f8f8c), isNight ? 0.46 : 0.38);
            const skyFogColor = baseFog.clone().lerp(new THREE.Color(isNight ? 0x1a242c : 0x81918f), isNight ? 0.58 : 0.44);
            fogColor.copy(fogWeatherColor);
            skyColor.lerp(skyFogColor, isNight ? 0.62 : 0.48);
            fogNear = isNight ? 18 : 24;
            fogFar = isNight ? 190 : 225;
            skyOverlay = {
                color: isNight ? 'rgba(12, 18, 22, 0.52)' : 'rgba(88, 104, 102, 0.16)',
                horizon: isNight ? 'rgba(84, 104, 110, 0.32)' : 'rgba(118, 134, 130, 0.26)'
            };
        }

        return { fogColor, fogDensity, fogMode, fogNear, fogFar, skyColor, skyOverlay };
    }

    function adaptSkyTexture(texture, atmosphere) {
        const canvas = texture?.image;
        const context = canvas?.getContext?.('2d');
        if (!context || !atmosphere?.skyOverlay) {
            return texture;
        }

        context.save();
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = atmosphere.skyOverlay.color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'screen';
        const horizon = context.createLinearGradient(0, canvas.height * 0.36, 0, canvas.height);
        horizon.addColorStop(0, 'rgba(255,255,255,0)');
        horizon.addColorStop(0.7, atmosphere.skyOverlay.horizon);
        horizon.addColorStop(1, atmosphere.skyOverlay.horizon);
        context.fillStyle = horizon;
        context.fillRect(0, canvas.height * 0.36, canvas.width, canvas.height * 0.64);
        context.restore();
        texture.needsUpdate = true;
        return texture;
    }

    const atmosphere = getAtmosphereSettings();
    if (scene.background?.isTexture) {
        scene.background.dispose();
    }
    const stageSkyTexture = environment.id === 'lakes'
        ? createLakeSkyTexture()
        : environment.id === 'coastal'
            ? createCoastalSkyTexture()
            : environment.id === 'jungle'
                ? createJungleSkyTexture(environment)
                : environment.id === 'city'
                    ? createTokyoSkyTexture(environment)
                    : environment.id === 'desert'
                        ? createDesertSkyTexture(environment)
                        : environment.id === 'scotland'
                            ? createHighlandSkyTexture(environment)
                            : null;
    scene.background = stageSkyTexture
        ? adaptSkyTexture(stageSkyTexture, atmosphere)
        : atmosphere.skyColor;
    scene.fog = environment.disableFog
        ? null
        : atmosphere.fogMode === 'linear'
            ? new THREE.Fog(atmosphere.fogColor, atmosphere.fogNear, atmosphere.fogFar)
            : new THREE.FogExp2(atmosphere.fogColor, atmosphere.fogDensity);

    function createBannerTexture(label, options = {}) {
        const highVisibility = Boolean(options.highVisibility);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        const squareSize = 32;

        if (highVisibility) {
            const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#ffd84a');
            gradient.addColorStop(0.5, '#fff2a8');
            gradient.addColorStop(1, '#ffd84a');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#101218';
            context.fillRect(0, 0, canvas.width, 34);
            context.fillRect(0, canvas.height - 34, canvas.width, 34);
        } else {
            context.fillStyle = '#22242b';
            context.fillRect(0, 0, canvas.width, canvas.height);

            const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#15171d');
            gradient.addColorStop(0.5, '#343741');
            gradient.addColorStop(1, '#15171d');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

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

        context.strokeStyle = highVisibility ? '#101218' : '#f4f1df';
        context.lineWidth = highVisibility ? 14 : 10;
        context.strokeRect(96, 36, canvas.width - 192, canvas.height - 72);

        context.fillStyle = highVisibility ? '#101218' : '#f4f1df';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = highVisibility ? '900 132px Arial Black, Impact, sans-serif' : '900 112px Arial, sans-serif';
        context.fillText(label, canvas.width / 2, highVisibility ? 118 : 108);

        context.font = '900 44px Arial, sans-serif';
        context.fillStyle = highVisibility ? '#db1f2e' : '#ffd447';
        context.fillText(highVisibility ? 'TOKYO STAGE' : 'RALLYRUSHII', canvas.width / 2, 190);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
        return texture;
    }

    function createFinishRoadMarkerTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(255,255,255,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const squareSize = 64;
        for (let x = 0; x < canvas.width; x += squareSize) {
            for (let y = 0; y < canvas.height; y += squareSize) {
                context.fillStyle = ((x / squareSize + y / squareSize) % 2 === 0) ? '#f9fbff' : '#101218';
                context.fillRect(x, y, squareSize, squareSize);
            }
        }

        context.fillStyle = 'rgba(255,216,74,0.92)';
        context.fillRect(0, canvas.height * 0.34, canvas.width, canvas.height * 0.32);
        context.strokeStyle = '#101218';
        context.lineWidth = 18;
        context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
        context.fillStyle = '#101218';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '900 142px Arial Black, Impact, sans-serif';
        context.fillText('FINISH', canvas.width * 0.5, canvas.height * 0.5);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
        return texture;
    }

    function createRallyStructure(scene, game, zPosition, isFinishLine) {
        const isCityFinish = isFinishLine && environment.id === 'city';
        const poleHeight = isCityFinish ? 16 : 10;
        const poleWidth = isCityFinish ? 0.8 : 0.5;
        const poleDepth = isCityFinish ? 0.8 : 0.5;
        const bannerWidth = isCityFinish ? game.road.width + 10 : game.road.width;
        const bannerHeight = isCityFinish ? 4.8 : 3;
    
        // Get the road data at the specified zPosition
        const roadData = getRoadDataAtZ(zPosition, game);
        const structureGroup = new THREE.Group();
        structureGroup.name = isFinishLine ? 'finish-rally-structure' : 'start-rally-structure';
        structureGroup.position.set(roadData.curve, roadData.y, zPosition);
        structureGroup.rotation.y = -roadData.curvatureAngle;
    
        // Create poles
        const poleGeometry = new THREE.BoxGeometry(poleWidth, poleHeight, poleDepth);
        const poleMaterial = isCityFinish
            ? new THREE.MeshBasicMaterial({ color: 0xfff0a8 })
            : new THREE.MeshPhongMaterial({ color: 0xffffff });
        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
    
        // Position poles
        leftPole.position.set(-bannerWidth / 2, poleHeight / 2, 0);
        rightPole.position.set(bannerWidth / 2, poleHeight / 2, 0);
    
        const bannerTexture = createBannerTexture(isFinishLine ? 'FINISH' : 'START', { highVisibility: isCityFinish });
    
        // Create banner
        const bannerGeometry = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
        const bannerMaterial = new THREE.MeshBasicMaterial({ map: bannerTexture, side: THREE.DoubleSide });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(0, poleHeight - bannerHeight / 2, 0);
    
        // Ensure the banner is facing the correct direction
        banner.rotation.y = Math.PI; // Rotate the banner to face the player
    
        // Add to scene
        structureGroup.add(leftPole, rightPole, banner);

        if (isCityFinish) {
            const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xffd84a });
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x55e4ff,
                transparent: true,
                opacity: 0.34,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const topFrame = new THREE.Mesh(new THREE.BoxGeometry(bannerWidth + 1.4, 0.36, 0.44), frameMaterial);
            topFrame.position.set(0, poleHeight + 0.18, 0);
            const lowerFrame = new THREE.Mesh(new THREE.BoxGeometry(bannerWidth + 1.4, 0.3, 0.4), frameMaterial);
            lowerFrame.position.set(0, poleHeight - bannerHeight - 0.1, 0);
            const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(bannerWidth + 2.4, bannerHeight + 1.1), glowMaterial);
            glowPanel.position.set(0, poleHeight - bannerHeight / 2, -0.06);
            glowPanel.rotation.y = Math.PI;
            structureGroup.add(topFrame, lowerFrame, glowPanel);
        }
    
        if (isFinishLine) {
            // Add a finish line tape on the ground
            const lineGeometry = new THREE.PlaneGeometry(bannerWidth, isCityFinish ? 7.8 : 0.2);
            const lineMaterial = isCityFinish
                ? new THREE.MeshBasicMaterial({ map: createFinishRoadMarkerTexture(), transparent: true, side: THREE.DoubleSide })
                : new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const finishLine = new THREE.Mesh(lineGeometry, lineMaterial);
            finishLine.rotation.x = -Math.PI / 2;
            finishLine.position.set(0, isCityFinish ? 0.16 : 0.1, isCityFinish ? 0.7 : 0);
            structureGroup.add(finishLine);
        }

        scene.add(structureGroup);
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
