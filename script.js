(function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    if (THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x73b6cf);
    scene.fog = new THREE.FogExp2(0x73b6cf, 0.00115);

    const gameManager = new GameManager(scene, camera, renderer);
    window.rallyRushGame = gameManager;
    window.rallyRushPerf = function () {
        const diagnostics = gameManager.getPerformanceDiagnostics?.() || null;
        if (diagnostics) {
            console.table({
                stage: diagnostics.stage,
                timeOfDay: diagnostics.timeOfDay,
                rainEnabled: diagnostics.rainEnabled,
                activeLights: diagnostics.activeLights,
                sceneChildren: diagnostics.sceneChildren,
                visibleScenery: diagnostics.scenery.visible,
                totalScenery: diagnostics.scenery.total,
                drawCalls: diagnostics.renderer?.calls,
                triangles: diagnostics.renderer?.triangles,
                geometries: diagnostics.renderer?.geometries,
                textures: diagnostics.renderer?.textures,
                jungleAssetBatches: diagnostics.jungleBatches?.length || 0
            });
            console.info('rallyRushPerf details', diagnostics);
        }
        return diagnostics;
    };

    const controls = { left: false, right: false, accelerate: false, brake: false, handbrake: false };

    const mobileControls = document.getElementById('mobileControls');
    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const circuitSelect = document.getElementById('circuitSelect');
    const difficultySelect = document.getElementById('difficultySelect');
    const assistSelect = document.getElementById('assistSelect');
    const timeOfDaySelect = document.getElementById('timeOfDaySelect');
    const weatherSelect = document.getElementById('weatherSelect');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const changeCircuitButton = document.getElementById('changeCircuitButton');
    const carSelect = document.getElementById('carSelect');
    const selectedCarName = document.getElementById('selectedCarName');
    const selectedCarClass = document.getElementById('selectedCarClass');
    const selectedCarStats = document.getElementById('selectedCarStats');
    const timeOfDayStorageKey = 'rallyRushIITimeOfDay';
    const rainStorageKey = 'rallyRushIIRainEnabled';
    const timeOfDayOptions = [
        { id: 'day', label: 'Day' },
        { id: 'night', label: 'Night' }
    ];
    const rainOptions = [
        { id: 'on', label: 'On' },
        { id: 'off', label: 'Off' }
    ];
    const garagePreviewCanvas = document.getElementById('garagePreviewCanvas');
    const garagePreviewStatus = document.getElementById('garagePreviewStatus');
    const loadingStageName = document.getElementById('loadingStageName');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingAssetName = document.getElementById('loadingAssetName');
    const settingsHud = document.getElementById('settingsHud');
    const cameraButton = document.getElementById('cameraButton');
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const musicToggleButton = document.getElementById('musicToggleButton');
    const musicToggleIcon = document.getElementById('musicToggleIcon');
    const musicToggleLabel = document.getElementById('musicToggleLabel');
    const cameraTuner = document.getElementById('cameraTuner');
    const cameraTunerCar = document.getElementById('cameraTunerCar');
    const cameraTunerValues = document.getElementById('cameraTunerValues');
    const raceHud = document.getElementById('ui');
    let isStartingRace = false;
    let startRequestId = 0;
    let garagePreview = null;
    let cameraTunerEnabled = false;
    const groundDebugEnabled = new URLSearchParams(window.location.search).has('groundDebug');
    let debugCameraDrag = null;

    // Mobile button controls setup
    const accelerateButton = document.getElementById('accelerateButton');
    const brakeButton = document.getElementById('brakeButton');
    const jumpButton = document.getElementById('jumpButton');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');

    window.render_game_to_text = function () {
        const isLoading = loadingScreen.style.display !== 'none';
        const mode = isLoading
            ? 'loading'
            : startScreen.style.display !== 'none'
            ? 'start'
            : endScreen.style.display !== 'none'
                ? 'end'
                : gameManager.isPaused
                    ? 'paused'
                    : gameManager.isStartCountdownBlocking?.()
                        ? 'countdown'
                    : 'driving';
        const countdownState = gameManager.getStartCountdownState?.();
        const game = gameManager.game;
        return JSON.stringify({
            mode,
            stage: circuitSelect.value,
            difficulty: gameManager.getDifficultyProfile ? gameManager.getDifficultyProfile(gameManager.getDifficultyLevel()).label : null,
            drivingAssist: gameManager.getDrivingAssistProfile ? gameManager.getDrivingAssistProfile(gameManager.getDrivingAssistLevel()).label : null,
            paused: Boolean(gameManager.isPaused),
            musicEnabled: Boolean(gameManager.musicEnabled),
            settingsOpen: settingsPanel.style.display !== 'none',
            cameraTuner: cameraTunerEnabled && gameManager.getCockpitTunerState ? gameManager.getCockpitTunerState() : null,
            selectedCar: gameManager.getPlayerVehicleOption ? gameManager.getPlayerVehicleOption(gameManager.getPlayerVehicleType()) : null,
            camera: gameManager.getCameraMode ? {
                id: gameManager.getCameraMode().id,
                label: gameManager.getCameraMode().label,
                fov: (gameManager.getActiveCameraMode ? gameManager.getActiveCameraMode() : gameManager.getCameraMode()).fov,
                debugFree: gameManager.getDebugFreeCameraState ? gameManager.getDebugFreeCameraState() : null
            } : null,
            countdown: countdownState,
            car: game ? {
                vehicleType: game.car.vehicleType,
                x: Number(game.car.xOffset.toFixed(2)),
                z: Number(game.car.position.z.toFixed(2)),
                speed: Number(game.car.speed.toFixed(2)),
                maxSpeed: Number(game.car.maxSpeed.toFixed(2)),
                acceleration: Number(game.car.acceleration.toFixed(4)),
                lateralVelocity: Number((game.car.lateralVelocity || 0).toFixed(4)),
                steering: Number(game.car.steeringAngle.toFixed(3)),
                handbrake: Boolean(gameManager.controls.handbrake),
                drift: Number((game.car.driftAmount || 0).toFixed(3)),
                handbrakeIntensity: Number((game.car.handbrakeIntensity || 0).toFixed(3)),
                turnEntryDrift: Number((game.car.turnEntryDrift || 0).toFixed(3)),
                airborne: Boolean(game.car.airborne),
                jumpOffset: Number((game.car.jumpOffset || 0).toFixed(3)),
                jumpVelocity: Number((game.car.jumpVelocity || 0).toFixed(3)),
                landingTraction: Number(((game.car.landingTractionTimer || 0) / Math.max(1, game.car.landingTractionDuration || 1)).toFixed(3)),
                landingDrift: Number((game.car.landingDriftAmount || 0).toFixed(3)),
                lastLandingSpeedLoss: Number((game.car.lastLandingSpeedLoss || 0).toFixed(3)),
                tireEffects: gameManager.collisionEffects.length,
                roadYaw: Number((gameManager.getVehicleRoadFrame(game.car.position.z, -1).yaw).toFixed(3)),
                driveYaw: Number((game.car.driveYaw || 0).toFixed(3)),
                visualYaw: Number((game.car.visualYaw || 0).toFixed(3))
            } : null,
            road: game ? {
                width: game.road.width,
                playerLimit: Number(gameManager.getPlayerRoadLimit().toFixed(2)),
                segments: game.road.segments.length
            } : null,
            raceSettings: game ? game.settings : null,
            traffic: game ? {
                count: gameManager.trafficCars.length,
                targetCount: gameManager.getTrafficTargetCount ? gameManager.getTrafficTargetCount() : gameManager.trafficCars.length,
                speeds: gameManager.trafficCars.slice(0, 6).map(traffic => Number(traffic.speed.toFixed(2)))
            } : null,
            stageDecor: game ? game.stageDecor : null,
            trafficTypes: game ? gameManager.trafficCars.slice(0, 6).map(traffic => traffic.vehicleType) : [],
            trafficPreview: game ? gameManager.trafficCars.slice(0, 6).map(traffic => ({
                type: traffic.vehicleType,
                x: Number(traffic.xOffset.toFixed(2)),
                y: Number(traffic.mesh.position.y.toFixed(2)),
                z: Number(traffic.mesh.position.z.toFixed(2)),
                pitch: Number(traffic.mesh.rotation.x.toFixed(3)),
                groundContact: gameManager.getVehicleRoadContactDiagnostics
                    ? gameManager.getVehicleRoadContactDiagnostics(traffic.mesh)
                    : null
            })) : [],
            groundContact: game && gameManager.getVehicleRoadContactDiagnostics ? {
                player: gameManager.getVehicleRoadContactDiagnostics(gameManager.playerCar)
            } : null,
            collision: gameManager.activeCollision ? {
                type: gameManager.activeCollision.type,
                progress: Number((gameManager.activeCollision.frame / gameManager.activeCollision.duration).toFixed(2)),
                effects: gameManager.collisionEffects.length
            } : null,
            lastCollisionType: gameManager.lastCollisionType,
            loading: isLoading ? {
                percent: loadingPercent.textContent,
                status: loadingStatus.textContent,
                asset: loadingAssetName.textContent
            } : null
        }, null, 2);
    };

    if (groundDebugEnabled) {
        window.setInterval(() => {
            if (!gameManager.game || !gameManager.getVehicleRoadContactDiagnostics) {
                return;
            }

            const state = JSON.parse(window.render_game_to_text());
            console.info('ground-contact', JSON.stringify({
                mode: state.mode,
                speed: state.car?.speed,
                player: state.groundContact?.player,
                traffic: state.trafficPreview?.slice(0, 6).map(traffic => ({
                    type: traffic.type,
                    contact: traffic.groundContact
                }))
            }));
        }, 1000);
    }

    // Hide mobile controls on start and end screens
    function hideMobileControls() {
        mobileControls.style.display = 'none';
    }

    function shouldShowMobileControls() {
        return window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;
    }

    // Show mobile controls during gameplay
    function showMobileControls() {
        const canShow = shouldShowMobileControls()
            && loadingScreen.style.display === 'none'
            && startScreen.style.display === 'none'
            && endScreen.style.display === 'none'
            && !gameManager.isPaused;
        mobileControls.style.display = canShow ? 'block' : 'none';
    }

    function resetControls() {
        controls.left = false;
        controls.right = false;
        controls.accelerate = false;
        controls.brake = false;
        controls.handbrake = false;
        gameManager.setControls(controls);
    }

    function isGameplayActive() {
        return Boolean(gameManager.game)
            && startScreen.style.display === 'none'
            && endScreen.style.display === 'none'
            && loadingScreen.style.display === 'none';
    }

    function canDrive() {
        return isGameplayActive() && !gameManager.isPaused;
    }

    function isDebugFreeCameraActive() {
        return Boolean(groundDebugEnabled && gameManager.isDebugFreeCameraActive?.());
    }

    function isDrivingKey(event) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift'].includes(event.key) || event.code === 'Space';
    }

    function isHandbrakeKey(event) {
        return event.key === 'Shift';
    }

    function createGarageStat(label, value) {
        const stat = document.createElement('div');
        stat.className = 'garageStat';

        const labelNode = document.createElement('span');
        labelNode.textContent = label;
        const track = document.createElement('span');
        track.className = 'garageStatTrack';
        const fill = document.createElement('span');
        fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
        track.appendChild(fill);

        stat.append(labelNode, track);
        return stat;
    }

    function renderModeSelect(container, options, selectedId, onSelect) {
        if (!container || !options) {
            return;
        }

        container.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            const isSelected = option.id === selectedId;
            button.className = `modeOption${isSelected ? ' isSelected' : ''}`;
            button.type = 'button';
            button.setAttribute('role', 'radio');
            button.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            button.dataset.optionId = option.id;
            button.textContent = option.label;
            button.addEventListener('click', () => {
                onSelect(option.id);
                updateRaceSetupUi();
            });
            container.appendChild(button);
        });
    }

    function getTimeOfDayMode() {
        return localStorage.getItem(timeOfDayStorageKey) === 'night' ? 'night' : 'day';
    }

    function setTimeOfDayMode(id) {
        localStorage.setItem(timeOfDayStorageKey, id === 'night' ? 'night' : 'day');
    }

    function getRainMode() {
        return localStorage.getItem(rainStorageKey) === 'off' ? 'off' : 'on';
    }

    function setRainMode(id) {
        localStorage.setItem(rainStorageKey, id === 'off' ? 'off' : 'on');
    }

    function updateRaceSetupUi() {
        if (gameManager.getDifficultyOptions) {
            renderModeSelect(
                difficultySelect,
                gameManager.getDifficultyOptions(),
                gameManager.getDifficultyLevel(),
                id => gameManager.setDifficultyLevel(id)
            );
        }

        if (gameManager.getDrivingAssistOptions) {
            renderModeSelect(
                assistSelect,
                gameManager.getDrivingAssistOptions(),
                gameManager.getDrivingAssistLevel(),
                id => gameManager.setDrivingAssistLevel(id)
            );
        }

        renderModeSelect(
            timeOfDaySelect,
            timeOfDayOptions,
            getTimeOfDayMode(),
            setTimeOfDayMode
        );

        renderModeSelect(
            weatherSelect,
            rainOptions,
            getRainMode(),
            setRainMode
        );
    }

    function disposeObject3d(object) {
        object.userData.disposed = true;
        object.traverse(child => {
            if (child.geometry && !child.userData.keepGeometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    if (!material.userData?.keepTextureMaps) {
                        ['map', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach(key => {
                            material[key]?.dispose?.();
                        });
                    }
                    material.dispose?.();
                });
            }
        });
    }

    function createGaragePreview() {
        if (!garagePreviewCanvas || !window.THREE) {
            return null;
        }

        function setStatus(text) {
            if (garagePreviewStatus) {
                garagePreviewStatus.textContent = text;
            }
        }

        const previewScene = new THREE.Scene();
        const previewCamera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 80);
        let previewRenderer = null;
        try {
            previewRenderer = new THREE.WebGLRenderer({
                canvas: garagePreviewCanvas,
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
            });
        } catch (error) {
            console.warn('Garage preview renderer unavailable; continuing with standard menu selection.', error);
            garagePreviewCanvas.classList.add('isUnavailable');
            setStatus('Showroom standby');
            return {
                setVehicle(type) {
                    const option = gameManager.getPlayerVehicleOption(type);
                    setStatus(option ? `${option.name} selected` : 'Showroom standby');
                },
                resize() {},
                pause() {},
                resume() {},
                dispose() {}
            };
        }
        previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        previewRenderer.setClearColor(0x000000, 0);
        if (THREE.sRGBEncoding) {
            previewRenderer.outputEncoding = THREE.sRGBEncoding;
        }
        if (THREE.ACESFilmicToneMapping) {
            previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            previewRenderer.toneMappingExposure = 0.92;
        }

        const stage = new THREE.Group();
        previewScene.add(stage);

        const turntable = new THREE.Group();
        stage.add(turntable);

        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x111820,
            metalness: 0.35,
            roughness: 0.42,
            transparent: true,
            opacity: 0.92
        });
        const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.95, 0.16, 72), platformMaterial);
        platform.position.y = -0.14;
        platform.receiveShadow = true;
        stage.add(platform);

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x5fe2ff,
            transparent: true,
            opacity: 0.72
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.018, 8, 96), ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.04;
        stage.add(ring);

        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.12
        });
        [-1.2, 0, 1.2].forEach(offset => {
            const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.018, 4.6), gridMaterial);
            line.position.set(offset, -0.03, 0);
            stage.add(line);
        });

        const hemi = new THREE.HemisphereLight(0xddeffd, 0x0f1820, 1.18);
        previewScene.add(hemi);

        const key = new THREE.DirectionalLight(0xfafcff, 1.6);
        key.position.set(-4.5, 5, 5.5);
        previewScene.add(key);

        const rim = new THREE.DirectionalLight(0xa9d6ee, 0.78);
        rim.position.set(4.2, 2.1, -3.6);
        previewScene.add(rim);

        const fill = new THREE.DirectionalLight(0xfff0d9, 0.34);
        fill.position.set(-0.8, 1.6, 4.2);
        previewScene.add(fill);

        previewCamera.position.set(0, 1.8, 6.9);
        previewCamera.lookAt(0, 0.62, 0);

        let selectedType = null;
        let previewCar = null;
        let animationId = null;
        let isPaused = false;

        function resize() {
            const host = garagePreviewCanvas.parentElement;
            const rect = host.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width));
            const height = Math.max(1, Math.floor(rect.height));
            previewRenderer.setSize(width, height, false);
            previewCamera.aspect = width / height;
            previewCamera.updateProjectionMatrix();
        }

        function removePreviewCar() {
            if (!previewCar) {
                return;
            }

            turntable.remove(previewCar);
            disposeObject3d(previewCar);
            previewCar = null;
        }

        function setVehicle(type) {
            const option = gameManager.getPlayerVehicleOption(type);
            if (!option || selectedType === option.type) {
                return;
            }

            selectedType = option.type;
            removePreviewCar();
            setStatus('Loading showroom model');

            previewCar = gameManager.createCar(option.color, option.type, { palette: option.palette });
            const dimensions = gameManager.getVehicleDimensions(option.type);
            const scale = Math.min(0.95, 4.3 / Math.max(dimensions.length, 1));
            previewCar.scale.setScalar(scale);
            previewCar.rotation.y = -Math.PI * 0.68;
            previewCar.position.y = 0;
            turntable.add(previewCar);
            resize();
        }

        function render(time = 0) {
            if (!isPaused) {
                const pulse = (Math.sin(time * 0.002) + 1) * 0.5;
                ringMaterial.opacity = 0.42 + pulse * 0.3;
                turntable.rotation.y = Math.sin(time * 0.0007) * 0.16;

                if (previewCar) {
                    const ready = !previewCar.userData.assetVehicle
                        || previewCar.userData.assetReady
                        || previewCar.userData.assetFallback;
                    setStatus(ready ? 'Vehicle ready' : 'Loading showroom model');
                }

                previewRenderer.render(previewScene, previewCamera);
            }

            animationId = requestAnimationFrame(render);
        }

        resize();
        animationId = requestAnimationFrame(render);

        return {
            setVehicle,
            resize,
            pause() {
                isPaused = true;
            },
            resume() {
                isPaused = false;
                resize();
            },
            dispose() {
                cancelAnimationFrame(animationId);
                removePreviewCar();
                disposeObject3d(stage);
                previewRenderer.dispose();
            }
        };
    }

    function updateGarageUi() {
        if (!carSelect || !gameManager.getPlayerVehicleOption) {
            return;
        }

        const selected = gameManager.getPlayerVehicleOption(gameManager.getPlayerVehicleType());
        selectedCarName.textContent = selected.name;
        selectedCarClass.textContent = selected.className;

        Array.from(carSelect.querySelectorAll('.garageCar')).forEach(button => {
            const isSelected = button.dataset.vehicleType === selected.type;
            button.classList.toggle('isSelected', isSelected);
            button.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        });

        selectedCarStats.innerHTML = '';
        Object.entries(selected.stats).forEach(([key, value]) => {
            selectedCarStats.appendChild(createGarageStat(key, value));
        });
        garagePreview?.setVehicle(selected.type);
    }

    function renderGarageOptions() {
        if (!carSelect || !gameManager.getPlayerVehicleOptions) {
            return;
        }

        carSelect.innerHTML = '';
        gameManager.getPlayerVehicleOptions().forEach(option => {
            const button = document.createElement('button');
            button.className = 'garageCar';
            button.type = 'button';
            button.setAttribute('role', 'radio');
            button.dataset.vehicleType = option.type;
            button.style.setProperty('--car-accent', `#${option.palette.stripe.toString(16).padStart(6, '0')}`);
            button.innerHTML = `
                <span class="garageCarPaint" aria-hidden="true" style="background:#${option.color.toString(16).padStart(6, '0')}"></span>
                <span class="garageCarCopy">
                    <strong>${option.name}</strong>
                    <span>${option.className}</span>
                </span>
                <span class="garageCarMeter" aria-hidden="true"><span style="width:${option.stats.speed}%"></span></span>
            `;
            button.addEventListener('click', () => {
                gameManager.setPlayerVehicleType(option.type);
                updateGarageUi();
            });
            carSelect.appendChild(button);
        });

        updateGarageUi();
    }

    function setSettingsPanelOpen(isOpen) {
        settingsPanel.style.display = isOpen ? 'block' : 'none';
        settingsButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function hideGameplayChrome() {
        settingsHud.style.display = 'none';
        setSettingsPanelOpen(false);
        cameraTunerEnabled = false;
        gameManager.disableDebugFreeCamera?.();
        updateCameraTunerUi();
        hideMobileControls();
    }

    function showGameplayChrome() {
        settingsHud.style.display = 'grid';
        updateSettingsUi();
        updateCameraButtonUi();
        updateCameraTunerUi();
        showMobileControls();
    }

    function updateSettingsUi() {
        musicToggleIcon.textContent = gameManager.musicEnabled ? 'M' : 'X';
        musicToggleLabel.textContent = gameManager.musicEnabled ? 'Music on' : 'Music off';
        musicToggleButton.dataset.active = gameManager.musicEnabled ? 'true' : 'false';
        musicToggleButton.dataset.warning = gameManager.musicEnabled ? 'false' : 'true';
    }

    function updateCameraButtonUi() {
        if (!cameraButton || !gameManager.getCameraMode) {
            return;
        }

        const mode = gameManager.getCameraMode();
        cameraButton.dataset.active = mode.id === 'close' ? 'false' : 'true';
        cameraButton.setAttribute('aria-label', `Camera view: ${mode.label}`);
        cameraButton.setAttribute('title', `Camera view: ${mode.label}`);
    }

    function updateCameraTunerUi() {
        if (!cameraTuner || !cameraTunerValues || !gameManager.getCockpitTunerState) {
            return;
        }

        cameraTuner.style.display = cameraTunerEnabled ? 'block' : 'none';
        if (!cameraTunerEnabled) {
            return;
        }

        const state = gameManager.getCockpitTunerState();
        cameraTunerCar.textContent = state.carName;
        const rows = [
            ['Eye X', state.lateral],
            ['Eye Y', state.height],
            ['Eye Z', state.forward],
            ['Aim X', state.lookLateral],
            ['Aim Y', state.lookHeight],
            ['Aim Z', state.lookAhead],
            ['FOV', state.fov]
        ];
        cameraTunerValues.innerHTML = rows.map(([label, value]) => `
            <div class="cameraTunerValue">
                <span>${label}</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function setCameraTunerEnabled(isEnabled) {
        cameraTunerEnabled = Boolean(isEnabled && isGameplayActive() && gameManager.getCockpitTunerState);
        if (cameraTunerEnabled) {
            resetControls();
            gameManager.setCameraMode('cockpitInterior');
            updateCameraButtonUi();
            renderer.render(scene, camera);
        }
        updateCameraTunerUi();
    }

    function adjustCameraTuner(key, delta) {
        if (!gameManager.adjustCockpitRigValue) {
            return;
        }

        gameManager.adjustCockpitRigValue(key, delta);
        updateCameraTunerUi();
        renderer.render(scene, camera);
    }

    function handleCameraTunerKey(event) {
        if (!cameraTunerEnabled || !isGameplayActive()) {
            return false;
        }

        const multiplier = event.shiftKey ? 5 : 1;
        const positionStep = 0.02 * multiplier;
        const lookStep = 0.02 * multiplier;
        const lookAheadStep = 0.2 * multiplier;
        const fovStep = 1 * multiplier;
        const key = event.key.toLowerCase();

        const actions = {
            a: () => adjustCameraTuner('lateral', -positionStep),
            d: () => adjustCameraTuner('lateral', positionStep),
            w: () => adjustCameraTuner('forward', positionStep),
            s: () => adjustCameraTuner('forward', -positionStep),
            r: () => adjustCameraTuner('height', positionStep),
            f: () => adjustCameraTuner('height', -positionStep),
            j: () => adjustCameraTuner('lookLateral', -lookStep),
            l: () => adjustCameraTuner('lookLateral', lookStep),
            i: () => adjustCameraTuner('lookHeight', lookStep),
            k: () => adjustCameraTuner('lookHeight', -lookStep),
            u: () => adjustCameraTuner('lookAhead', -lookAheadStep),
            o: () => adjustCameraTuner('lookAhead', lookAheadStep),
            '[': () => adjustCameraTuner('fov', -fovStep),
            ']': () => adjustCameraTuner('fov', fovStep),
            '0': () => {
                gameManager.resetCockpitRig?.();
                updateCameraTunerUi();
                renderer.render(scene, camera);
            }
        };

        if (!actions[key]) {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();
        actions[key]();
        return true;
    }

    function cycleCameraMode() {
        if (!isGameplayActive() || !gameManager.cycleCameraMode) {
            return;
        }

        cameraTunerEnabled = false;
        gameManager.cycleCameraMode();
        updateCameraButtonUi();
        updateCameraTunerUi();
        renderer.render(scene, camera);
    }

    function enterGroundDebugCamera() {
        if (!groundDebugEnabled || !isGameplayActive() || !gameManager.enableDebugFreeCamera) {
            return false;
        }

        resetControls();
        cameraTunerEnabled = false;
        gameManager.pauseGame();
        setSettingsPanelOpen(false);
        gameManager.enableDebugFreeCamera();
        updateCameraButtonUi();
        updateCameraTunerUi();
        showMobileControls();
        renderer.render(scene, camera);
        return true;
    }

    function exitGroundDebugCamera({ resume = true } = {}) {
        if (!isDebugFreeCameraActive()) {
            return false;
        }

        gameManager.disableDebugFreeCamera?.();
        debugCameraDrag = null;
        if (resume) {
            gameManager.resumeGame();
        }
        updateCameraButtonUi();
        showMobileControls();
        renderer.render(scene, camera);
        return true;
    }

    function toggleGroundDebugCamera() {
        if (isDebugFreeCameraActive()) {
            return exitGroundDebugCamera({ resume: true });
        }

        return enterGroundDebugCamera();
    }

    function setPaused(isPaused) {
        if (!isGameplayActive()) {
            return;
        }

        resetControls();
        if (isPaused) {
            gameManager.pauseGame();
            setSettingsPanelOpen(true);
        } else {
            gameManager.disableDebugFreeCamera?.();
            gameManager.resumeGame();
            setSettingsPanelOpen(false);
        }
        updateSettingsUi();
        showMobileControls();
    }

    function getSelectedStageName() {
        const selectedOption = circuitSelect.options[circuitSelect.selectedIndex];
        return selectedOption ? selectedOption.textContent : circuitSelect.value;
    }

    function setStartButtonsLoading(isLoading) {
        startButton.disabled = isLoading;
        restartButton.disabled = isLoading;
        startButton.textContent = isLoading ? 'Loading grid' : 'Start race';
        restartButton.textContent = isLoading ? 'Loading grid' : 'Restart';
    }

    function updateLoadingProgress(details = {}) {
        const progress = Math.max(0, Math.min(1, details.progress || 0));
        const percent = Math.round(progress * 100);
        loadingProgressBar.style.width = `${percent}%`;
        loadingPercent.textContent = `${percent}%`;
        loadingStatus.textContent = progress >= 1 ? 'Final systems check' : 'Loading race assets';
        loadingAssetName.textContent = details.assetName || 'Vehicle telemetry sync';
    }

    function showLoadingScreen() {
        loadingStageName.textContent = getSelectedStageName();
        updateLoadingProgress({
            progress: 0,
            assetName: 'Vehicle telemetry sync'
        });
        document.getElementById('ui').style.display = 'none';
        startScreen.style.display = 'none';
        endScreen.style.display = 'none';
        garagePreview?.pause();
        hideMobileControls();
        loadingScreen.style.display = 'grid';
    }

    function hideLoadingScreen() {
        loadingScreen.style.display = 'none';
    }

    function waitForNextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    async function startRaceWithPreload() {
        if (isStartingRace) {
            return;
        }

        const requestId = ++startRequestId;
        isStartingRace = true;
        setStartButtonsLoading(true);
        resetControls();
        showLoadingScreen();

        try {
            await waitForNextFrame();
            await gameManager.preloadRaceAssets(circuitSelect.value, updateLoadingProgress);
            if (requestId !== startRequestId) {
                return;
            }

            updateLoadingProgress({
                progress: 1,
                assetName: 'Grid ready'
            });
            await waitForNextFrame();

            if (requestId !== startRequestId) {
                return;
            }

            hideLoadingScreen();
            gameManager.startGame();
            showGameplayChrome();
        } catch (error) {
            console.warn('Vehicle preload failed; starting with fallback vehicle rendering.', error);
            if (requestId !== startRequestId) {
                return;
            }

            updateLoadingProgress({
                progress: 1,
                assetName: 'Fallback fleet ready'
            });
            await waitForNextFrame();
            hideLoadingScreen();
            gameManager.startGame();
            showGameplayChrome();
        } finally {
            if (requestId === startRequestId) {
                isStartingRace = false;
                setStartButtonsLoading(false);
            }
        }
    }

    function resetRaceSessionForMenu() {
        startRequestId += 1;
        isStartingRace = false;
        setStartButtonsLoading(false);
        cancelAnimationFrame(gameManager.animationId);
        gameManager.animationId = null;
        resetControls();
        gameManager.disableDebugFreeCamera?.();
        gameManager.resumeGame();
        gameManager.clearStartCountdown();
        hideGameplayChrome();
        hideLoadingScreen();
        gameManager.resetCollisionVisuals();
        gameManager.game = null;
        gameManager.playerCar = null;
        gameManager.trafficCars = [];
        raceHud.style.display = 'none';
        endScreen.style.display = 'none';
    }

    function showGarageMenu() {
        resetRaceSessionForMenu();
        startScreen.style.display = 'grid';
        updateRaceSetupUi();
        renderGarageOptions();
        garagePreview?.resume();
        renderer.render(scene, camera);
    }

    function returnToMainMenu() {
        if (startScreen.style.display !== 'none' && loadingScreen.style.display === 'none') {
            return;
        }

        gameManager.stopAllMusic();
        showGarageMenu();
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            returnToMainMenu();
            return;
        }

        if (e.key.toLowerCase() === 't' && isGameplayActive()) {
            e.preventDefault();
            setCameraTunerEnabled(!cameraTunerEnabled);
            return;
        }

        if (handleCameraTunerKey(e)) {
            return;
        }

        if (e.key.toLowerCase() === 'g' && groundDebugEnabled && isGameplayActive()) {
            e.preventDefault();
            toggleGroundDebugCamera();
            return;
        }

        if (e.key.toLowerCase() === 'p' && isGameplayActive()) {
            if (isDebugFreeCameraActive()) {
                e.preventDefault();
                exitGroundDebugCamera({ resume: true });
                return;
            }
            setPaused(!gameManager.isPaused);
            return;
        }

        if (e.key.toLowerCase() === 'v' && isGameplayActive()) {
            e.preventDefault();
            cycleCameraMode();
            return;
        }

        if (gameManager.isPaused && isDrivingKey(e)) {
            e.preventDefault();
            return;
        }

        let controlChanged = false;
        if (e.key === 'ArrowLeft') { controls.left = true; controlChanged = true; }
        if (e.key === 'ArrowRight') { controls.right = true; controlChanged = true; }
        if (e.key === 'ArrowUp') { controls.accelerate = true; controlChanged = true; }
        if (e.key === 'ArrowDown') { controls.brake = true; controlChanged = true; }
        if (isHandbrakeKey(e) && isGameplayActive() && !cameraTunerEnabled) {
            e.preventDefault();
            controls.handbrake = true;
            controlChanged = true;
        }
        if (e.code === 'Space' && isGameplayActive() && !cameraTunerEnabled) {
            e.preventDefault();
            gameManager.queueJump?.();
        }
        if (controlChanged) {
            gameManager.setControls(controls);
        }
        if (e.key === 'Enter') {
            if (startScreen.style.display !== 'none') {
                startRaceWithPreload();
            } else if (endScreen.style.display !== 'none') {
                startRaceWithPreload();
            }
        }
    });

    document.addEventListener('keyup', e => {
        if (gameManager.isPaused && isDrivingKey(e)) {
            e.preventDefault();
            return;
        }

        let controlChanged = false;
        if (e.key === 'ArrowLeft') { controls.left = false; controlChanged = true; }
        if (e.key === 'ArrowRight') { controls.right = false; controlChanged = true; }
        if (e.key === 'ArrowUp') { controls.accelerate = false; controlChanged = true; }
        if (e.key === 'ArrowDown') { controls.brake = false; controlChanged = true; }
        if (isHandbrakeKey(e)) { controls.handbrake = false; controlChanged = true; }
        if (controlChanged) {
            gameManager.setControls(controls);
        }
    });

    renderer.domElement.addEventListener('contextmenu', event => {
        if (isDebugFreeCameraActive()) {
            event.preventDefault();
        }
    });

    renderer.domElement.addEventListener('pointerdown', event => {
        if (!isDebugFreeCameraActive()) {
            return;
        }

        event.preventDefault();
        debugCameraDrag = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            moveTargetY: event.shiftKey || event.button === 1 || event.button === 2
        };
        renderer.domElement.setPointerCapture?.(event.pointerId);
    });

    renderer.domElement.addEventListener('pointermove', event => {
        if (!debugCameraDrag || !isDebugFreeCameraActive() || debugCameraDrag.pointerId !== event.pointerId) {
            return;
        }

        event.preventDefault();
        const dx = event.clientX - debugCameraDrag.x;
        const dy = event.clientY - debugCameraDrag.y;
        debugCameraDrag.x = event.clientX;
        debugCameraDrag.y = event.clientY;
        if (debugCameraDrag.moveTargetY) {
            gameManager.adjustDebugFreeCamera?.({ targetYDelta: -dy * 0.018 });
        } else {
            gameManager.adjustDebugFreeCamera?.({
                yawDelta: -dx * 0.0055,
                pitchDelta: -dy * 0.0055
            });
        }
        renderer.render(scene, camera);
    });

    function endDebugCameraDrag(event) {
        if (!debugCameraDrag || debugCameraDrag.pointerId !== event.pointerId) {
            return;
        }

        renderer.domElement.releasePointerCapture?.(event.pointerId);
        debugCameraDrag = null;
    }

    renderer.domElement.addEventListener('pointerup', endDebugCameraDrag);
    renderer.domElement.addEventListener('pointercancel', endDebugCameraDrag);

    renderer.domElement.addEventListener('wheel', event => {
        if (!isDebugFreeCameraActive()) {
            return;
        }

        event.preventDefault();
        gameManager.adjustDebugFreeCamera?.({ distanceDelta: event.deltaY * 0.012 });
        renderer.render(scene, camera);
    }, { passive: false });

    renderer.domElement.addEventListener('dblclick', event => {
        if (!isDebugFreeCameraActive()) {
            return;
        }

        event.preventDefault();
        gameManager.enableDebugFreeCamera?.();
        renderer.render(scene, camera);
    });

    function preventTouchDefault(event) {
        event.preventDefault();
    }

    mobileControls.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    const touchControlOptions = { passive: false };
    mobileControls.addEventListener('touchmove', preventTouchDefault, touchControlOptions);
    mobileControls.addEventListener('touchcancel', event => {
        preventTouchDefault(event);
        resetControls();
    }, touchControlOptions);

    // Touch controls
    accelerateButton.addEventListener('touchstart', event => {
        preventTouchDefault(event);
        if (!canDrive()) { return; }
        controls.accelerate = true;
        gameManager.setControls(controls);
    }, touchControlOptions);

    brakeButton.addEventListener('touchstart', event => {
        preventTouchDefault(event);
        if (!canDrive()) { return; }
        controls.brake = true;
        gameManager.setControls(controls);
    }, touchControlOptions);

    jumpButton.addEventListener('touchstart', event => {
        preventTouchDefault(event);
        if (!canDrive()) { return; }
        gameManager.queueJump?.();
    }, touchControlOptions);

    leftButton.addEventListener('touchstart', event => {
        preventTouchDefault(event);
        if (!canDrive()) { return; }
        controls.left = true;
        gameManager.setControls(controls);
    }, touchControlOptions);

    rightButton.addEventListener('touchstart', event => {
        preventTouchDefault(event);
        if (!canDrive()) { return; }
        controls.right = true;
        gameManager.setControls(controls);
    }, touchControlOptions);

    accelerateButton.addEventListener('touchend', event => {
        preventTouchDefault(event);
        controls.accelerate = false;
        gameManager.setControls(controls);
    }, touchControlOptions);

    brakeButton.addEventListener('touchend', event => {
        preventTouchDefault(event);
        controls.brake = false;
        gameManager.setControls(controls);
    }, touchControlOptions);

    jumpButton.addEventListener('touchend', event => {
        preventTouchDefault(event);
    }, touchControlOptions);

    leftButton.addEventListener('touchend', event => {
        preventTouchDefault(event);
        controls.left = false;
        gameManager.setControls(controls);
    }, touchControlOptions);

    rightButton.addEventListener('touchend', event => {
        preventTouchDefault(event);
        controls.right = false;
        gameManager.setControls(controls);
    }, touchControlOptions);

    // Handle game start and restart
    startButton.addEventListener('click', startRaceWithPreload);

    restartButton.addEventListener('click', startRaceWithPreload);

    cameraButton.addEventListener('click', event => {
        event.stopPropagation();
        cycleCameraMode();
    });

    changeCircuitButton.addEventListener('click', () => {
        showGarageMenu();
        hideMobileControls();
    });

    settingsButton.addEventListener('click', () => {
        if (!isGameplayActive()) {
            return;
        }

        setPaused(settingsPanel.style.display === 'none' || !gameManager.isPaused);
    });

    closeSettingsButton.addEventListener('click', () => {
        if (!isGameplayActive()) {
            return;
        }

        setPaused(false);
    });

    musicToggleButton.addEventListener('click', () => {
        gameManager.toggleMusic();
        updateSettingsUi();
    });

    document.addEventListener('pointerdown', event => {
        if (!isGameplayActive() || settingsPanel.style.display === 'none') {
            return;
        }

        if (!settingsHud.contains(event.target)) {
            setPaused(false);
        }
    });

    // Ensure mobile controls are hidden initially and on end screen
    hideMobileControls();
    garagePreview = createGaragePreview();
    updateRaceSetupUi();
    renderGarageOptions();

    // Override the end game logic to hide controls
    gameManager.endGame = function (time) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.clearStartCountdown();
        this.updateBestTimes(time);
        this.displayEndScreen(time);
        hideGameplayChrome();
    };

    // Initial setup
    raceHud.style.display = 'none';
    renderer.render(scene, camera);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        garagePreview?.resize();
        if (startScreen.style.display === 'none' && endScreen.style.display === 'none' && loadingScreen.style.display === 'none') {
            showMobileControls();
        }
    });
})();
