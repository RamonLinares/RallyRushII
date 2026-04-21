(function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

    const controls = { left: false, right: false, accelerate: false, brake: false, handbrake: false };

    const mobileControls = document.getElementById('mobileControls');
    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const circuitSelect = document.getElementById('circuitSelect');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const loadingStageName = document.getElementById('loadingStageName');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingAssetName = document.getElementById('loadingAssetName');
    const settingsHud = document.getElementById('settingsHud');
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const musicToggleButton = document.getElementById('musicToggleButton');
    const musicToggleIcon = document.getElementById('musicToggleIcon');
    const musicToggleLabel = document.getElementById('musicToggleLabel');
    let isStartingRace = false;
    let startRequestId = 0;

    // Mobile button controls setup
    const accelerateButton = document.getElementById('accelerateButton');
    const brakeButton = document.getElementById('brakeButton');
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
            paused: Boolean(gameManager.isPaused),
            musicEnabled: Boolean(gameManager.musicEnabled),
            settingsOpen: settingsPanel.style.display !== 'none',
            countdown: countdownState,
            car: game ? {
                x: Number(game.car.xOffset.toFixed(2)),
                z: Number(game.car.position.z.toFixed(2)),
                speed: Number(game.car.speed.toFixed(2)),
                lateralVelocity: Number((game.car.lateralVelocity || 0).toFixed(4)),
                steering: Number(game.car.steeringAngle.toFixed(3)),
                handbrake: Boolean(gameManager.controls.handbrake),
                drift: Number((game.car.driftAmount || 0).toFixed(3)),
                handbrakeIntensity: Number((game.car.handbrakeIntensity || 0).toFixed(3)),
                turnEntryDrift: Number((game.car.turnEntryDrift || 0).toFixed(3)),
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
            stageDecor: game ? game.stageDecor : null,
            trafficTypes: game ? gameManager.trafficCars.slice(0, 6).map(traffic => traffic.vehicleType) : [],
            trafficPreview: game ? gameManager.trafficCars.slice(0, 6).map(traffic => ({
                type: traffic.vehicleType,
                x: Number(traffic.xOffset.toFixed(2)),
                y: Number(traffic.mesh.position.y.toFixed(2)),
                z: Number(traffic.mesh.position.z.toFixed(2)),
                pitch: Number(traffic.mesh.rotation.x.toFixed(3))
            })) : [],
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

    function isDrivingKey(event) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.code === 'Space';
    }

    function setSettingsPanelOpen(isOpen) {
        settingsPanel.style.display = isOpen ? 'block' : 'none';
        settingsButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function hideGameplayChrome() {
        settingsHud.style.display = 'none';
        setSettingsPanelOpen(false);
        hideMobileControls();
    }

    function showGameplayChrome() {
        settingsHud.style.display = 'grid';
        updateSettingsUi();
        showMobileControls();
    }

    function updateSettingsUi() {
        musicToggleIcon.textContent = gameManager.musicEnabled ? 'M' : 'X';
        musicToggleLabel.textContent = gameManager.musicEnabled ? 'Music on' : 'Music off';
        musicToggleButton.dataset.active = gameManager.musicEnabled ? 'true' : 'false';
        musicToggleButton.dataset.warning = gameManager.musicEnabled ? 'false' : 'true';
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
        loadingStatus.textContent = progress >= 1 ? 'Final systems check' : 'Loading vehicle models';
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
            await gameManager.preloadVehicleModels(updateLoadingProgress);
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

    function returnToMainMenu() {
        if (startScreen.style.display !== 'none' && loadingScreen.style.display === 'none') {
            return;
        }

        startRequestId += 1;
        isStartingRace = false;
        setStartButtonsLoading(false);
        cancelAnimationFrame(gameManager.animationId);
        gameManager.animationId = null;
        resetControls();
        gameManager.resumeGame();
        gameManager.clearStartCountdown();
        hideGameplayChrome();
        hideLoadingScreen();
        gameManager.stopAllMusic();
        gameManager.resetCollisionVisuals();
        gameManager.game = null;
        gameManager.playerCar = null;
        gameManager.trafficCars = [];
        document.getElementById('ui').style.display = 'none';
        endScreen.style.display = 'none';
        startScreen.style.display = 'grid';
        renderer.render(scene, camera);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            returnToMainMenu();
            return;
        }

        if (e.key.toLowerCase() === 'p' && isGameplayActive()) {
            setPaused(!gameManager.isPaused);
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
        if (e.code === 'Space' && isGameplayActive()) {
            e.preventDefault();
            controls.handbrake = true;
            controlChanged = true;
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
        if (e.code === 'Space' && isGameplayActive()) {
            e.preventDefault();
            controls.handbrake = false;
            controlChanged = true;
        }
        if (controlChanged) {
            gameManager.setControls(controls);
        }
    });

    // Touch controls
    accelerateButton.addEventListener('touchstart', () => {
        if (!canDrive()) { return; }
        controls.accelerate = true;
        gameManager.setControls(controls);
    });

    brakeButton.addEventListener('touchstart', () => {
        if (!canDrive()) { return; }
        controls.brake = true;
        gameManager.setControls(controls);
    });

    leftButton.addEventListener('touchstart', () => {
        if (!canDrive()) { return; }
        controls.left = true;
        gameManager.setControls(controls);
    });

    rightButton.addEventListener('touchstart', () => {
        if (!canDrive()) { return; }
        controls.right = true;
        gameManager.setControls(controls);
    });

    accelerateButton.addEventListener('touchend', () => {
        controls.accelerate = false;
        gameManager.setControls(controls);
    });

    brakeButton.addEventListener('touchend', () => {
        controls.brake = false;
        gameManager.setControls(controls);
    });

    leftButton.addEventListener('touchend', () => {
        controls.left = false;
        gameManager.setControls(controls);
    });

    rightButton.addEventListener('touchend', () => {
        controls.right = false;
        gameManager.setControls(controls);
    });

    // Handle game start and restart
    startButton.addEventListener('click', startRaceWithPreload);

    restartButton.addEventListener('click', startRaceWithPreload);

    document.getElementById('changeCircuitButton').addEventListener('click', () => {
        startRequestId += 1;
        isStartingRace = false;
        setStartButtonsLoading(false);
        gameManager.resumeGame();
        hideGameplayChrome();
        hideLoadingScreen();
        endScreen.style.display = 'none';
        startScreen.style.display = 'grid';
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
    document.getElementById('ui').style.display = 'none';
    renderer.render(scene, camera);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (startScreen.style.display === 'none' && endScreen.style.display === 'none' && loadingScreen.style.display === 'none') {
            showMobileControls();
        }
    });
})();
