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

    const controls = { left: false, right: false, accelerate: false, brake: false };

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
                : 'driving';
        const game = gameManager.game;
        return JSON.stringify({
            mode,
            stage: circuitSelect.value,
            car: game ? {
                x: Number(game.car.xOffset.toFixed(2)),
                z: Number(game.car.position.z.toFixed(2)),
                speed: Number(game.car.speed.toFixed(2)),
                steering: Number(game.car.steeringAngle.toFixed(3)),
                roadYaw: Number((gameManager.getVehicleRoadFrame(game.car.position.z, -1).yaw).toFixed(3)),
                driveYaw: Number((game.car.driveYaw || 0).toFixed(3)),
                visualYaw: Number((game.car.visualYaw || 0).toFixed(3))
            } : null,
            road: game ? {
                width: game.road.width,
                segments: game.road.segments.length
            } : null,
            trafficTypes: game ? gameManager.trafficCars.slice(0, 6).map(traffic => traffic.vehicleType) : [],
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
        mobileControls.style.display = shouldShowMobileControls() && loadingScreen.style.display === 'none' ? 'block' : 'none';
    }

    function resetControls() {
        controls.left = false;
        controls.right = false;
        controls.accelerate = false;
        controls.brake = false;
        gameManager.setControls(controls);
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
            showMobileControls();
            gameManager.startGame();
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
            showMobileControls();
            gameManager.startGame();
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
        hideMobileControls();
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

        let controlChanged = false;
        if (e.key === 'ArrowLeft') { controls.left = true; controlChanged = true; }
        if (e.key === 'ArrowRight') { controls.right = true; controlChanged = true; }
        if (e.key === 'ArrowUp') { controls.accelerate = true; controlChanged = true; }
        if (e.key === 'ArrowDown') { controls.brake = true; controlChanged = true; }
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
        let controlChanged = false;
        if (e.key === 'ArrowLeft') { controls.left = false; controlChanged = true; }
        if (e.key === 'ArrowRight') { controls.right = false; controlChanged = true; }
        if (e.key === 'ArrowUp') { controls.accelerate = false; controlChanged = true; }
        if (e.key === 'ArrowDown') { controls.brake = false; controlChanged = true; }
        if (controlChanged) {
            gameManager.setControls(controls);
        }
    });

    // Touch controls
    accelerateButton.addEventListener('touchstart', () => {
        controls.accelerate = true;
        gameManager.setControls(controls);
    });

    brakeButton.addEventListener('touchstart', () => {
        controls.brake = true;
        gameManager.setControls(controls);
    });

    leftButton.addEventListener('touchstart', () => {
        controls.left = true;
        gameManager.setControls(controls);
    });

    rightButton.addEventListener('touchstart', () => {
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
        hideLoadingScreen();
        endScreen.style.display = 'none';
        startScreen.style.display = 'grid';
        hideMobileControls();
    });

    // Ensure mobile controls are hidden initially and on end screen
    hideMobileControls();

    // Override the end game logic to hide controls
    gameManager.endGame = function (time) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.updateBestTimes(time);
        this.displayEndScreen(time);
        hideMobileControls(); // Hide mobile controls when the game ends
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
