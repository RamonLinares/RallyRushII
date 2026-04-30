// Define environments at the top of your script
const environments = {
    scotland: {
        id: 'scotland',
        terrainStyle: 'highland',
        roadStyle: 'highland-asphalt',
        shoulderStyle: 'moor-gravel',
        roadWidth: 22.5,
        terrainColor: 0x587a3f,
        terrainTint: 0xffffff,
        treeDensity: 0.018,
        treeColor: 0x2f5a33,
        trunkColor: 0x56442e,
        roadElevationAmplitude: 7.2,
        maxMountainHeight: 84,
        mountainHeightRange: 96,
        mountainHeightPower: 1.14,
        mountainNoiseScale: 0.0058,
        mountainNoiseGain: 0.28,
        mountainRoadsideDelay: 0.1,
        mountainRoadsidePower: 1.08,
        shoulderWidth: 4.2,
        terrainTextureMetersPerTile: 560,
        terrainTextureLateralMetersPerTile: 210,
        roadTextureMetersPerTile: 58,
        fogColor: 0x9fb9c0,
        fogDensity: 0.00105
    },
    desert: {
        id: 'desert',
        terrainStyle: 'sand',
        roadStyle: 'sun-baked-asphalt',
        shoulderStyle: 'sand-gravel',
        roadWidth: 28,
        terrainColor: 0xb87842,
        terrainTint: 0xd49a5b,
        treeDensity: 0,
        roadElevationAmplitude: 4.2,
        maxMountainHeight: 54,
        mountainHeightRange: 48,
        mountainHeightPower: 1.25,
        mountainNoiseScale: 0.0042,
        mountainNoiseGain: 0.34,
        mountainRoadsideDelay: 0.18,
        mountainRoadsidePower: 1.22,
        fogColor: 0xd98c47,
        fogDensity: 0.00128,
        terrainTextureUrl: 'assets/textures/desert_terrain_texture.png',
        terrainTextureMetersPerTile: 420,
        terrainTextureLateralMetersPerTile: 260,
        terrainTextureTint: 0xffffff,
        roadTextureMetersPerTile: 46
    },
    alpine: {
        id: 'alpine',
        terrainStyle: 'snow-rock',
        roadStyle: 'cold-asphalt',
        shoulderStyle: 'snow-gravel',
        roadWidth: 18.5,
        terrainColor: 0x7DFFFF,
        terrainTint: 0xe6f5f6,
        treeDensity: 0.4,
        treeColor: 0x175234,
        trunkColor: 0x4b3524,
        maxMountainHeight: 180,
        mountainHeightRange: 340,
        mountainHeightPower: 1.05,
        mountainNoiseScale: 0.0085,
        mountainNoiseGain: 0.34,
        mountainRoadsideDelay: 0.04,
        mountainRoadsidePower: 0.95,
        fogColor: 0x7fc4d8,
        fogDensity: 0.0012
    },
    city: {
        id: 'city',
        terrainStyle: 'urban',
        roadStyle: 'city-asphalt',
        shoulderStyle: 'concrete',
        roadWidth: 22,
        terrainColor: 0x323c45,
        terrainTint: 0x7d8b96,
        treeDensity: 0.006,
        treeColor: 0x2f5f42,
        trunkColor: 0x5d4330,
        roadElevationAmplitude: 2.4,
        maxMountainHeight: 4,
        mountainHeightRange: 5,
        mountainHeightPower: 1.8,
        mountainNoiseScale: 0.006,
        mountainNoiseGain: 0.2,
        mountainRoadsideDelay: 0.55,
        mountainRoadsidePower: 2.2,
        fogColor: 0x90a4b2,
        fogDensity: 0.00135,
        nightFogDensityMultiplier: 2.35,
        nightFogColor: 0x050911,
        nightSkyOverlay: {
            color: 'rgba(1, 4, 10, 0.84)',
            horizon: 'rgba(38, 68, 92, 0.18)'
        },
        decorativeLightLimit: 4
    },
    lakes: {
        id: 'lakes',
        terrainStyle: 'lake-country',
        roadStyle: 'country-asphalt',
        shoulderStyle: 'grass-gravel',
        roadWidth: 22,
        terrainColor: 0x3f6141,
        terrainTint: 0xb5c6ad,
        treeDensity: 0,
        treeColor: 0x275f3b,
        trunkColor: 0x65432b,
        roadElevationAmplitude: 3.4,
        maxMountainHeight: 14,
        mountainHeightRange: 22,
        mountainHeightPower: 1.55,
        mountainNoiseScale: 0.0052,
        mountainNoiseGain: 0.2,
        mountainRoadsideDelay: 0.48,
        mountainRoadsidePower: 1.85,
        fogColor: 0x9fc6cf,
        fogDensity: 0.00102,
        lakeBiome: {
            waterLevelOffset: 1.08,
            waterDepth: 1.75,
            shoreWidth: 5.8,
            minShoreDistance: 8.5,
            maxShoreDistance: 36,
            guardrailDistance: 23,
            horizonWaterExtension: 150,
            assetTextures: {
                forestGround: 'assets/environment/lakes/forest_ground_04_diff_1k.jpg',
                rockyShore: 'assets/environment/lakes/aerial_rocks_01_diff_1k.jpg'
            },
            causeways: [
                { center: -920, width: 1180 },
                { center: -3120, width: 1320 },
                { center: -5040, width: 1040 }
            ]
        }
    },
    jungle: {
        id: 'jungle',
        terrainStyle: 'rainforest',
        roadStyle: 'mud-road',
        shoulderStyle: 'jungle-mud',
        roadWidth: 14.2,
        shoulderWidth: 0,
        roadTextureMetersPerTile: 14.2,
        roadTextureBrightness: 1.24,
        terrainTextureUrl: 'assets/textures/jungle_road_side_custom.png',
        terrainTextureMetersPerTile: 32,
        terrainTextureLateralMetersPerTile: 32,
        terrainTextureTint: 0xffffff,
        terrainColor: 0x174326,
        terrainTint: 0x4d7c43,
        treeDensity: 0,
        treeColor: 0x155b33,
        trunkColor: 0x4a2f20,
        maxMountainHeight: 74,
        mountainHeightRange: 104,
        mountainHeightPower: 1.08,
        mountainNoiseScale: 0.0085,
        mountainNoiseGain: 0.34,
        mountainRoadsideDelay: 0.05,
        mountainRoadsidePower: 0.95,
        roadElevationAmplitude: 5.2,
        fogColor: 0x5f7770,
        fogDensity: 0.0032,
        nightRace: false,
        jungleGeneration: {
            complexity: 0.75,
            trailLength: 5900,
            trailWidth: 15.5,
            trailCurve: 0.45,
            bankHeight: 2.5,
            density: 1,
            canopyCover: 0.95,
            treeCount: 24,
            treeMultiplier: 3,
            branchMultiplier: 1,
            postFinishVegetation: 720,
            understoryHeight: 6.5,
            understoryMultiplier: 10,
            rockCount: 48,
            roadsideRockDensity: 1.8,
            vines: 12
        }
    },
    coastal: {
        id: 'coastal',
        terrainStyle: 'mediterranean',
        roadStyle: 'coastal-asphalt',
        shoulderStyle: 'limestone-gravel',
        roadWidth: 21.5,
        terrainColor: 0x637f51,
        terrainTint: 0xd3c487,
        treeDensity: 0,
        treeColor: 0x2d7448,
        trunkColor: 0x8c6a3f,
        maxMountainHeight: 58,
        mountainHeightRange: 80,
        mountainHeightPower: 1.18,
        mountainNoiseScale: 0.0062,
        mountainNoiseGain: 0.31,
        mountainRoadsideDelay: 0.16,
        mountainRoadsidePower: 1.18,
        roadElevationAmplitude: 10.5,
        coastalBiome: {
            seaLevelOffset: 12.5,
            shoreWidth: 13.5,
            minShoreDistance: 34,
            maxShoreDistance: 58,
            horizonWaterExtension: 340,
            wallDistance: 1.05,
            hillsideMinDistance: 8.5,
            hillsideHeight: 32
        },
        fogColor: 0x91c3d0,
        fogDensity: 0.00068
    },
    valleverde: {
        id: 'valleverde',
        terrainStyle: 'race-circuit',
        roadStyle: 'circuit-asphalt',
        shoulderStyle: 'circuit-runoff',
        roadWidth: 26,
        shoulderWidth: 5.8,
        drivableWidth: 36,
        terrainColor: 0x5e7d46,
        terrainTint: 0x9fb36f,
        treeDensity: 0,
        maxMountainHeight: 5,
        mountainHeightRange: 5,
        mountainHeightPower: 1.85,
        mountainNoiseScale: 0.004,
        mountainNoiseGain: 0.16,
        mountainRoadsideDelay: 0.68,
        mountainRoadsidePower: 2.4,
        roadElevationAmplitude: 0,
        terrainTextureMetersPerTile: 360,
        terrainTextureLateralMetersPerTile: 180,
        roadTextureMetersPerTile: 54,
        fogColor: 0xb7c7bd,
        fogDensity: 0.00072,
        trackLength: 4677.3,
        storedTrack: {
            id: 'valle-verde-grand-prix-fictional',
            length: 4677.3,
            turns: 14,
            direction: 'clockwise',
            repeat: true,
            elevationChangeMeters: 31.2,
            elevationSource: 'Fictional Mediterranean hillside profile for Valle Verde GP',
            elevationProfile: [
                { s: 0, y: 25.5 },
                { s: 160, y: 31.2 },
                { s: 190, y: 31.2 },
                { s: 320, y: 24.1 },
                { s: 480, y: 17.3 },
                { s: 640, y: 15.3 },
                { s: 800, y: 19.6 },
                { s: 960, y: 20.2 },
                { s: 1120, y: 23.6 },
                { s: 1280, y: 14.9 },
                { s: 1440, y: 4.5 },
                { s: 1600, y: 4.2 },
                { s: 1760, y: 8.6 },
                { s: 1920, y: 15.2 },
                { s: 2080, y: 20.1 },
                { s: 2240, y: 20.8 },
                { s: 2400, y: 19 },
                { s: 2560, y: 24.7 },
                { s: 2720, y: 15.5 },
                { s: 2880, y: 10.4 },
                { s: 3040, y: 8.2 },
                { s: 3200, y: 2 },
                { s: 3440, y: 0 },
                { s: 3520, y: 2.8 },
                { s: 3680, y: 4.7 },
                { s: 3840, y: 7 },
                { s: 4000, y: 7.6 },
                { s: 4160, y: 8.9 },
                { s: 4320, y: 9.7 },
                { s: 4480, y: 15 },
                { s: 4640, y: 21.1 },
                { s: 4677.3, y: 25.5 },
            ],
            controlPoints: [
                { s: 0, x: 476, z: -444.9, y: 0 },
                { s: 2.6, x: 475.9, z: -442.3, y: 0 },
                { s: 11.5, x: 474.3, z: -433.5, y: 0 },
                { s: 21.3, x: 471.9, z: -424, y: 0 },
                { s: 234.3, x: 395.1, z: -224.8, y: 0 },
                { s: 375.5, x: 333.4, z: -93.2, y: 0 },
                { s: 499.1, x: 276.3, z: 24.9, y: 0 },
                { s: 556.1, x: 249, z: 80.5, y: 0 },
                { s: 768.1, x: 155.7, z: 289.9, y: 0 },
                { s: 870.1, x: 114.9, z: 386.3, y: 0 },
                { s: 973.5, x: 77.2, z: 476.8, y: 0 },
                { s: 1000.4, x: 68.3, z: 498.9, y: 0 },
                { s: 1014.4, x: 63.8, z: 510.2, y: 0 },
                { s: 1060.3, x: 48.5, z: 545.5, y: 0 },
                { s: 1071.3, x: 43.7, z: 553.2, y: 0 },
                { s: 1081, x: 37.9, z: 559.1, y: 0 },
                { s: 1090.3, x: 30.9, z: 563.5, y: 0 },
                { s: 1099, x: 22.6, z: 565, y: 0 },
                { s: 1109.1, x: 12.6, z: 565.2, y: 0 },
                { s: 1120.3, x: 1.5, z: 563.6, y: 0 },
                { s: 1131.5, x: -9.2, z: 559, y: 0 },
                { s: 1150.2, x: -26.2, z: 550.1, y: 0 },
                { s: 1160.5, x: -35.7, z: 545.4, y: 0 },
                { s: 1169.3, x: -44.2, z: 542.5, y: 0 },
                { s: 1179.7, x: -54.6, z: 540.7, y: 0 },
                { s: 1190, x: -64.8, z: 540, y: 0 },
                { s: 1201.7, x: -75.9, z: 540.7, y: 0 },
                { s: 1212.4, x: -85.2, z: 543.1, y: 0 },
                { s: 1222.9, x: -92.8, z: 547.1, y: 0 },
                { s: 1289.5, x: -137.1, z: 574.9, y: 0 },
                { s: 1302.2, x: -145.5, z: 579.9, y: 0 },
                { s: 1313.4, x: -153, z: 584.3, y: 0 },
                { s: 1323.8, x: -161.1, z: 587.5, y: 0 },
                { s: 1337, x: -172.4, z: 590.3, y: 0 },
                { s: 1348.5, x: -182.7, z: 592.1, y: 0 },
                { s: 1363.5, x: -197.1, z: 592.7, y: 0 },
                { s: 1386.6, x: -220.5, z: 590, y: 0 },
                { s: 1400.2, x: -234.5, z: 586.8, y: 0 },
                { s: 1412.7, x: -247.3, z: 582.5, y: 0 },
                { s: 1432.5, x: -267.1, z: 573, y: 0 },
                { s: 1449.5, x: -283, z: 562.3, y: 0 },
                { s: 1464.5, x: -295.8, z: 551.4, y: 0 },
                { s: 1477.4, x: -306.2, z: 541.3, y: 0 },
                { s: 1492.6, x: -317.7, z: 528.5, y: 0 },
                { s: 1513.8, x: -330.8, z: 508.9, y: 0 },
                { s: 1535.1, x: -341.1, z: 487.9, y: 0 },
                { s: 1552.2, x: -347.4, z: 470.3, y: 0 },
                { s: 1564.8, x: -350.8, z: 457.3, y: 0 },
                { s: 1585.1, x: -354.9, z: 436.1, y: 0 },
                { s: 1604.6, x: -356.8, z: 415.8, y: 0 },
                { s: 1620.3, x: -357.2, z: 399.7, y: 0 },
                { s: 1636.6, x: -356.6, z: 383.1, y: 0 },
                { s: 1654, x: -355.4, z: 365.7, y: 0 },
                { s: 1672.3, x: -352.9, z: 347.8, y: 0 },
                { s: 1690.7, x: -348.7, z: 330.6, y: 0 },
                { s: 1755, x: -329.9, z: 273.6, y: 0 },
                { s: 1923.8, x: -290.2, z: 137.2, y: 0 },
                { s: 1936.1, x: -287.1, z: 128.2, y: 0 },
                { s: 1946.8, x: -281.9, z: 121.5, y: 0 },
                { s: 1957, x: -275.6, z: 116.5, y: 0 },
                { s: 1969, x: -266.7, z: 112.8, y: 0 },
                { s: 1978.8, x: -258.8, z: 110.9, y: 0 },
                { s: 1989.5, x: -249.6, z: 111.6, y: 0 },
                { s: 2000.4, x: -240.1, z: 113.8, y: 0 },
                { s: 2010, x: -232.5, z: 117.8, y: 0 },
                { s: 2020, x: -224.7, z: 123, y: 0 },
                { s: 2029.8, x: -217.7, z: 129, y: 0 },
                { s: 2042.3, x: -210, z: 138.5, y: 0 },
                { s: 2054.3, x: -203.8, z: 148.7, y: 0 },
                { s: 2066.5, x: -198.8, z: 160.2, y: 0 },
                { s: 2078.9, x: -196.2, z: 173, y: 0 },
                { s: 2093.1, x: -194.4, z: 188.2, y: 0 },
                { s: 2106.5, x: -194.1, z: 202.8, y: 0 },
                { s: 2119.5, x: -195.5, z: 217.3, y: 0 },
                { s: 2135.6, x: -199.2, z: 235.3, y: 0 },
                { s: 2150.4, x: -204.6, z: 251.6, y: 0 },
                { s: 2174.8, x: -216.5, z: 277.8, y: 0 },
                { s: 2214.9, x: -238.8, z: 319.7, y: 0 },
                { s: 2337.4, x: -300.4, z: 445.4, y: 0 },
                { s: 2346.7, x: -304.2, z: 454.8, y: 0 },
                { s: 2355.3, x: -305.8, z: 464, y: 0 },
                { s: 2363.8, x: -305.1, z: 472.9, y: 0 },
                { s: 2373.5, x: -302, z: 482.5, y: 0 },
                { s: 2381.7, x: -297.2, z: 489.3, y: 0 },
                { s: 2389.6, x: -291.6, z: 494.9, y: 0 },
                { s: 2398.9, x: -283.5, z: 499.4, y: 0 },
                { s: 2408.1, x: -274.5, z: 501, y: 0 },
                { s: 2416.6, x: -266.3, z: 501, y: 0 },
                { s: 2426.2, x: -257.5, z: 498.2, y: 0 },
                { s: 2434.6, x: -250.7, z: 494.2, y: 0 },
                { s: 2575.1, x: -133.6, z: 418.9, y: 0 },
                { s: 2594.7, x: -117.9, z: 406.3, y: 0 },
                { s: 2618.5, x: -100.3, z: 389.7, y: 0 },
                { s: 2635.3, x: -88.9, z: 376.9, y: 0 },
                { s: 2652.2, x: -78.2, z: 363.5, y: 0 },
                { s: 2673.3, x: -67, z: 345.5, y: 0 },
                { s: 2696.6, x: -56.2, z: 324.9, y: 0 },
                { s: 2772.4, x: -22.9, z: 258.6, y: 0 },
                { s: 2780.6, x: -19.7, z: 251.5, y: 0 },
                { s: 2785.8, x: -18.3, z: 246.9, y: 0 },
                { s: 2792.3, x: -17.2, z: 240.9, y: 0 },
                { s: 2797.2, x: -17.3, z: 236.5, y: 0 },
                { s: 2802, x: -17.9, z: 232.2, y: 0 },
                { s: 2806.3, x: -19.2, z: 228.5, y: 0 },
                { s: 2811.7, x: -21.2, z: 224.2, y: 0 },
                { s: 2818.7, x: -24.4, z: 218.9, y: 0 },
                { s: 2824.6, x: -28.3, z: 215.2, y: 0 },
                { s: 2830.4, x: -32.7, z: 212.2, y: 0 },
                { s: 2836, x: -37.2, z: 210, y: 0 },
                { s: 2840.7, x: -41.3, z: 208.3, y: 0 },
                { s: 2855.4, x: -54.5, z: 204.6, y: 0 },
                { s: 2869.5, x: -66.8, z: 200.8, y: 0 },
                { s: 2887.1, x: -81.4, z: 194, y: 0 },
                { s: 2899.4, x: -90.4, z: 187.8, y: 0 },
                { s: 2912.7, x: -98.9, z: 180.1, y: 0 },
                { s: 2926.4, x: -106, z: 170.9, y: 0 },
                { s: 3012.2, x: -149.7, z: 114.8, y: 0 },
                { s: 3092.1, x: -192.6, z: 65.8, y: 0 },
                { s: 3104.1, x: -198.8, z: 58.3, y: 0 },
                { s: 3112.9, x: -202.5, z: 52.5, y: 0 },
                { s: 3121.3, x: -205.2, z: 46.5, y: 0 },
                { s: 3129.6, x: -207.1, z: 40.6, y: 0 },
                { s: 3137.8, x: -208.4, z: 34.5, y: 0 },
                { s: 3150.8, x: -208.7, z: 24.9, y: 0 },
                { s: 3165.3, x: -207.2, z: 14, y: 0 },
                { s: 3179.5, x: -203, z: 4, y: 0 },
                { s: 3193, x: -197, z: -4.8, y: 0 },
                { s: 3200.3, x: -193.4, z: -9.3, y: 0 },
                { s: 3207.2, x: -189.5, z: -13.4, y: 0 },
                { s: 3224.4, x: -178, z: -22.1, y: 0 },
                { s: 3245, x: -162.4, z: -31.1, y: 0 },
                { s: 3340.8, x: -89.4, z: -73.5, y: 0 },
                { s: 3421.1, x: -29.8, z: -115, y: 0 },
                { s: 3460.2, x: -1.1, z: -137.4, y: 0 },
                { s: 3513, x: 37.9, z: -170, y: 0 },
                { s: 3571.3, x: 81.3, z: -209.1, y: 0 },
                { s: 3712.6, x: 188.8, z: -316.8, y: 0 },
                { s: 3723.8, x: 197.2, z: -326.4, y: 0 },
                { s: 3731.4, x: 201.6, z: -333.7, y: 0 },
                { s: 3737.3, x: 204.2, z: -340, y: 0 },
                { s: 3739.3, x: 205, z: -342.1, y: 0 },
                { s: 3746.4, x: 205.9, z: -350.3, y: 0 },
                { s: 3755.3, x: 204.5, z: -360.6, y: 0 },
                { s: 3766, x: 199.9, z: -372.2, y: 0 },
                { s: 3774.6, x: 194.1, z: -380.4, y: 0 },
                { s: 3784.9, x: 185.4, z: -388.8, y: 0 },
                { s: 3794.6, x: 176.4, z: -395.5, y: 0 },
                { s: 3803.9, x: 167.3, z: -400.9, y: 0 },
                { s: 3812.2, x: 159, z: -405, y: 0 },
                { s: 3819.2, x: 152.1, z: -408.6, y: 0 },
                { s: 3832.7, x: 138.3, z: -413.2, y: 0 },
                { s: 3846.4, x: 124.4, z: -416.5, y: 0 },
                { s: 3859.2, x: 111.6, z: -418.3, y: 0 },
                { s: 3869, x: 102.1, z: -418.9, y: 0 },
                { s: 3883.1, x: 89, z: -418.3, y: 0 },
                { s: 3896.3, x: 78.2, z: -415.5, y: 0 },
                { s: 3911.5, x: 66.9, z: -411.2, y: 0 },
                { s: 3918.2, x: 62.1, z: -409, y: 0 },
                { s: 3920.1, x: 61, z: -408.2, y: 0 },
                { s: 3952.3, x: 41.9, z: -394.7, y: 0 },
                { s: 3961.8, x: 35.6, z: -390.9, y: 0 },
                { s: 3970.9, x: 29.1, z: -387.8, y: 0 },
                { s: 3982.3, x: 19.5, z: -385.9, y: 0 },
                { s: 3987.4, x: 15.1, z: -385.4, y: 0 },
                { s: 3998.5, x: 4.8, z: -385.4, y: 0 },
                { s: 4006.9, x: -3.1, z: -386.8, y: 0 },
                { s: 4013.2, x: -9, z: -388.6, y: 0 },
                { s: 4021.4, x: -16.5, z: -391.7, y: 0 },
                { s: 4032.1, x: -25.8, z: -397.3, y: 0 },
                { s: 4042.7, x: -34, z: -404.2, y: 0 },
                { s: 4056.7, x: -42.4, z: -415.5, y: 0 },
                { s: 4069.3, x: -47.9, z: -427.2, y: 0 },
                { s: 4082.4, x: -50.7, z: -440.3, y: 0 },
                { s: 4090.9, x: -51.1, z: -449.1, y: 0 },
                { s: 4099.9, x: -49.7, z: -458.5, y: 0 },
                { s: 4109.7, x: -47, z: -468.5, y: 0 },
                { s: 4120.7, x: -41.7, z: -479.2, y: 0 },
                { s: 4132.8, x: -32.8, z: -489.7, y: 0 },
                { s: 4210, x: 33.3, z: -549.3, y: 0 },
                { s: 4280.8, x: 94.7, z: -601.6, y: 0 },
                { s: 4290, x: 104.5, z: -606.5, y: 0 },
                { s: 4296.9, x: 112.8, z: -608.9, y: 0 },
                { s: 4304.1, x: 121.8, z: -609.3, y: 0 },
                { s: 4347.9, x: 172.7, z: -591, y: 0 },
                { s: 4349.9, x: 175.1, z: -590.1, y: 0 },
                { s: 4352.9, x: 178.5, z: -588.7, y: 0 },
                { s: 4371.6, x: 200.1, z: -580, y: 0 },
                { s: 4373.6, x: 202.4, z: -579.1, y: 0 },
                { s: 4414, x: 248.7, z: -559.2, y: 0 },
                { s: 4417.6, x: 252.8, z: -557.4, y: 0 },
                { s: 4421.3, x: 257.1, z: -555.9, y: 0 },
                { s: 4423.9, x: 260.4, z: -555, y: 0 },
                { s: 4426.6, x: 263.8, z: -554.6, y: 0 },
                { s: 4428.6, x: 266.2, z: -554.7, y: 0 },
                { s: 4431, x: 269.2, z: -555.3, y: 0 },
                { s: 4433.1, x: 271.4, z: -556.2, y: 0 },
                { s: 4435.9, x: 274.1, z: -557.9, y: 0 },
                { s: 4438.4, x: 276.3, z: -559.6, y: 0 },
                { s: 4462.5, x: 294.8, z: -577.3, y: 0 },
                { s: 4465.7, x: 297.5, z: -579.5, y: 0 },
                { s: 4469.1, x: 300.8, z: -581.5, y: 0 },
                { s: 4472.4, x: 304.5, z: -582.8, y: 0 },
                { s: 4475.2, x: 308, z: -582.9, y: 0 },
                { s: 4478.4, x: 311.9, z: -581.9, y: 0 },
                { s: 4483.1, x: 317.6, z: -580.2, y: 0 },
                { s: 4488.3, x: 323.7, z: -577.9, y: 0 },
                { s: 4514.7, x: 354.6, z: -566.5, y: 0 },
                { s: 4553.4, x: 399.7, z: -549.7, y: 0 },
                { s: 4568.4, x: 416.7, z: -542.6, y: 0 },
                { s: 4577.9, x: 426.8, z: -536.9, y: 0 },
                { s: 4586.3, x: 434.7, z: -530.9, y: 0 },
                { s: 4594.9, x: 442.6, z: -524.5, y: 0 },
                { s: 4603.8, x: 449.7, z: -517.1, y: 0 },
                { s: 4612.5, x: 455.9, z: -509.4, y: 0 },
                { s: 4622.3, x: 462, z: -500.3, y: 0 },
                { s: 4633.4, x: 467.5, z: -489.4, y: 0 },
                { s: 4642.8, x: 471.1, z: -480, y: 0 },
                { s: 4652.3, x: 474, z: -470.4, y: 0 },
                { s: 4662, x: 475.8, z: -460.4, y: 0 },
                { s: 4671.1, x: 476.3, z: -451.1, y: 0 },
                { s: 4677.3, x: 476, z: -444.9, y: 0 },
            ],
            turnMarkers: [
                { id: 1, s: 1090, direction: 'right', speed: 'slow' },
                { id: 2, s: 1205, direction: 'left', speed: 'slow' },
                { id: 3, s: 1355, direction: 'right', speed: 'long' },
                { id: 4, s: 1990, direction: 'right', speed: 'medium' },
                { id: 5, s: 2385, direction: 'left', speed: 'slow' },
                { id: 6, s: 2575, direction: 'left', speed: 'fast' },
                { id: 7, s: 2805, direction: 'left', speed: 'medium' },
                { id: 8, s: 2905, direction: 'right', speed: 'medium' },
                { id: 9, s: 3170, direction: 'right', speed: 'fast' },
                { id: 10, s: 3750, direction: 'left', speed: 'slow' },
                { id: 11, s: 3840, direction: 'left', speed: 'medium' },
                { id: 12, s: 4115, direction: 'right', speed: 'medium' },
                { id: 13, s: 4430, direction: 'right', speed: 'fast' },
                { id: 14, s: 4585, direction: 'right', speed: 'fast' }
            ]
        }
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
        this.playerVehicleTypes = ['rally', 'apexGt'];
        this.playerVehicleType = this.playerVehicleTypes.includes(localStorage.getItem('selectedPlayerVehicleType'))
            ? localStorage.getItem('selectedPlayerVehicleType')
            : 'rally';
        this.animationId = null;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.pausedDuration = 0;
        this.startCountdown = null;
        this.difficultyStorageKey = 'rallyRushIIDifficultyLevel';
        this.assistStorageKey = 'rallyRushIIDrivingAssistLevel';
        this.raceModeStorageKey = 'rallyRushIIRaceMode';
        this.bestTimesStorageKey = 'rallyRushIIBestTimesByStageDifficulty';
        this.raceModeProfiles = {
            traffic: {
                id: 'traffic',
                label: 'Traffic',
                description: 'Against incoming traffic',
                lengthMultiplier: 1,
                hasIncomingTraffic: true,
                hasRaceCompetitors: false,
                hasSectorTiming: false
            },
            rally: {
                id: 'rally',
                label: 'Rally',
                description: 'Long time trial',
                lengthMultiplier: 3,
                hasIncomingTraffic: false,
                hasRaceCompetitors: false,
                hasSectorTiming: true
            },
            race: {
                id: 'race',
                label: 'Grid',
                description: 'Same-direction race',
                lengthMultiplier: 1,
                hasIncomingTraffic: false,
                hasRaceCompetitors: true,
                hasSectorTiming: false
            }
        };
        this.difficultyProfiles = {
            rookie: {
                id: 'rookie',
                label: 'Rookie',
                trafficCount: 7,
                speedMultiplier: 0.84,
                speedVariance: 0.18
            },
            pro: {
                id: 'pro',
                label: 'Pro',
                trafficCount: 10,
                speedMultiplier: 1,
                speedVariance: 0.28
            },
            expert: {
                id: 'expert',
                label: 'Expert',
                trafficCount: 14,
                speedMultiplier: 1.18,
                speedVariance: 0.36
            }
        };
        this.drivingAssistProfiles = {
            full: {
                id: 'full',
                label: 'Full',
                roadFollow: 1,
                headingRecovery: 1,
                curveSlip: 1,
                steeringResponse: 1
            },
            sport: {
                id: 'sport',
                label: 'Sport',
                roadFollow: 0.56,
                headingRecovery: 0.68,
                curveSlip: 1.24,
                steeringResponse: 1.06
            },
            manual: {
                id: 'manual',
                label: 'Manual',
                roadFollow: 0.06,
                headingRecovery: 0.28,
                curveSlip: 1.48,
                steeringResponse: 1.12
            }
        };
        this.difficultyLevel = this.difficultyProfiles[localStorage.getItem(this.difficultyStorageKey)]
            ? localStorage.getItem(this.difficultyStorageKey)
            : 'pro';
        this.drivingAssistLevel = this.drivingAssistProfiles[localStorage.getItem(this.assistStorageKey)]
            ? localStorage.getItem(this.assistStorageKey)
            : 'full';
        this.raceMode = this.raceModeProfiles[localStorage.getItem(this.raceModeStorageKey)]
            ? localStorage.getItem(this.raceModeStorageKey)
            : 'traffic';
        this.currentStageId = 'scotland';
        this.bestTimes = this.loadBestTimes();
        this.controls = { left: false, right: false, accelerate: false, brake: false, handbrake: false };
        this.cameraModes = [
            {
                id: 'close',
                label: 'Close Chase',
                type: 'chase',
                fov: 78,
                distance: 6.2,
                height: 2.55,
                lookAhead: 9,
                lookHeight: 0.9,
                occlusion: true
            },
            {
                id: 'chase',
                label: 'Chase',
                type: 'chase',
                fov: 75,
                distance: 12,
                height: 4.6,
                lookAhead: 10,
                lookHeight: 0.55,
                occlusion: true
            },
            {
                id: 'cockpit',
                label: 'Cockpit',
                type: 'cockpit',
                fov: 82,
                near: 0.1,
                lateral: -0.38,
                forward: 1.2,
                height: 1.55,
                lookAhead: 26,
                lookHeight: 1.25,
                occlusion: false,
                hideVehicle: true
            },
            {
                id: 'cockpitInterior',
                label: 'Cockpit Interior',
                type: 'cockpit',
                fov: 74,
                near: 0.025,
                lateral: -0.42,
                forward: -0.42,
                height: 1.34,
                lookAhead: 10,
                lookHeight: 0.96,
                occlusion: false,
                hideVehicle: false
            },
            {
                id: 'topDown',
                label: 'Top Down',
                type: 'topDown',
                fov: 50,
                height: 118,
                forwardOffset: 32,
                lookAhead: 0,
                occlusion: false
            },
            {
                id: 'trackOverview',
                label: 'Track Overview',
                type: 'trackOverview',
                fov: 32,
                near: 1,
                far: 12000,
                padding: 1.75,
                occlusion: false
            }
        ];
        this.cameraModeIndex = 0;
        this.cameraMode = this.cameraModes[this.cameraModeIndex];
        this.vehicleCameraModeExclusions = {
            apexGt: ['cockpit', 'cockpitInterior']
        };
        this.debugFreeCamera = {
            active: false,
            targetYOffset: 0.65,
            yaw: 0,
            pitch: 0.22,
            distance: 7.5
        };
        this.cockpitTunerStorageVersion = 2;
        this.cockpitInteriorRigs = {
            rally: {
                fov: 61,
                near: 0.025,
                lateral: 0,
                forward: 0.4,
                height: 1.22,
                lookAhead: 11.6,
                lookHeight: 1.06,
                lookLateral: -0.06,
                hideVehicle: false
            },
            apexGt: {
                fov: 82,
                near: 0.1,
                lateral: -0.38,
                forward: 1.2,
                height: 1.55,
                lookAhead: 26,
                lookHeight: 1.25,
                lookLateral: -0.38,
                hideVehicle: true
            },
        };
        this.defaultCockpitInteriorRigs = JSON.parse(JSON.stringify(this.cockpitInteriorRigs));
        this.loadCockpitTunerOverrides();
        this.carPosition = new THREE.Vector3(0, 0, 0);
        this.minCameraDistance = 5;
        // Add a reference to the directional light
        this.directionalLight = null;
        this.fillLight = null;
        this.rimLight = null;
        this.ambientLight = null;
        this.hemiLight = null;
        this.vehicleEnvironmentMap = null;
        this.lastStageEffectUpdateAt = performance.now();
        // Enable shadow rendering with improved settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.trafficCars = [];
        this.maxTrafficCars = 10; // Maximum number of traffic cars
        this.trafficVehicleTypes = ['muscle', 'suv', 'hatchback', 'pickup', 'supercar'];
        this.gltfLoader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
        this.dracoLoader = null;
        if (this.gltfLoader && THREE.DRACOLoader) {
            this.dracoLoader = new THREE.DRACOLoader();
            this.dracoLoader.setDecoderPath('vendor/draco/');
            this.gltfLoader.setDRACOLoader(this.dracoLoader);
        }
        this.vehicleModelCache = {};
        this.vehicleModelScenes = {};
        this.vehicleModelLoadState = {};
        this.vehicleModelAssets = {
            carConcept: { url: 'assets/models/car_concept.glb' },
            apexConcept: { url: 'assets/models/free_ai_based_conceptcar_050_public_domain_cc0.glb' },
            passengerPack: { url: 'assets/models/generic_passenger_car_pack_low.glb' }
        };
        this.environmentModelCache = {};
        this.environmentModelLoadState = {};
        this.environmentModelScenes = {};
        this.environmentStageAssets = {
            jungle: [],
            coastal: []
        };
        this.environmentModelAssets = {
            jungleTallTreeA: {
                stage: 'jungle',
                key: 'tallTreeA',
                label: 'Rainforest tall tree A',
                url: 'assets/environment/jungle/ownmodels/tree_2026-04-26T08-50-19-040Z.glb'
            },
            jungleTallTreeB: {
                stage: 'jungle',
                key: 'tallTreeB',
                label: 'Rainforest tall tree B',
                url: 'assets/environment/jungle/ownmodels/tree_2026-04-26T09-26-32-604Z.glb'
            },
            jungleTallTreeC: {
                stage: 'jungle',
                key: 'tallTreeC',
                label: 'Rainforest tall tree C',
                url: 'assets/environment/jungle/ownmodels/tree_2026-04-26T09-27-03-552Z.glb'
            },
            jungleSmallTreeA: {
                stage: 'jungle',
                key: 'smallTreeA',
                label: 'Rainforest small tree A',
                url: 'assets/environment/jungle/ownmodels/small_tree_2026-04-26T08-56-14-863Z.glb'
            },
            jungleSmallTreeB: {
                stage: 'jungle',
                key: 'smallTreeB',
                label: 'Rainforest small tree B',
                url: 'assets/environment/jungle/ownmodels/small_tree_2026-04-26T09-28-49-832Z.glb'
            },
            jungleFernA: {
                stage: 'jungle',
                key: 'fernA',
                label: 'Rainforest fern A',
                url: 'assets/environment/jungle/ownmodels/fern_2026-04-26T08-56-40-222Z.glb'
            },
            jungleFernB: {
                stage: 'jungle',
                key: 'fernB',
                label: 'Rainforest fern B',
                url: 'assets/environment/jungle/ownmodels/fern_2026-04-26T09-29-05-425Z.glb'
            },
            junglePalmDetailedTall: {
                stage: 'jungle',
                key: 'palmDetailedTall',
                label: 'Rainforest tall detailed palm',
                url: 'assets/environment/jungle/kenney-nature/tree_palmDetailedTall.glb'
            },
            junglePalmTall: {
                stage: 'jungle',
                key: 'palmTall',
                label: 'Rainforest tall palm',
                url: 'assets/environment/jungle/kenney-nature/tree_palmTall.glb'
            },
            junglePalmBend: {
                stage: 'jungle',
                key: 'palmBend',
                label: 'Rainforest bent palm',
                url: 'assets/environment/jungle/kenney-nature/tree_palmBend.glb'
            },
            junglePalmDetailedShort: {
                stage: 'jungle',
                key: 'palmDetailedShort',
                label: 'Rainforest short detailed palm',
                url: 'assets/environment/jungle/kenney-nature/tree_palmDetailedShort.glb'
            },
            jungleBushLargeTriangle: {
                stage: 'jungle',
                key: 'bushLargeTriangle',
                label: 'Rainforest large bush',
                url: 'assets/environment/jungle/kenney-nature/plant_bushLargeTriangle.glb'
            },
            jungleBushDetailed: {
                stage: 'jungle',
                key: 'bushDetailed',
                label: 'Rainforest detailed bush',
                url: 'assets/environment/jungle/kenney-nature/plant_bushDetailed.glb'
            },
            junglePlantFlatTall: {
                stage: 'jungle',
                key: 'plantFlatTall',
                label: 'Rainforest broadleaf plant',
                url: 'assets/environment/jungle/kenney-nature/plant_flatTall.glb'
            },
            jungleGrassLeafsLarge: {
                stage: 'jungle',
                key: 'grassLeafsLarge',
                label: 'Rainforest large grass',
                url: 'assets/environment/jungle/kenney-nature/grass_leafsLarge.glb'
            },
            jungleGrassLeafs: {
                stage: 'jungle',
                key: 'grassLeafs',
                label: 'Rainforest grass',
                url: 'assets/environment/jungle/kenney-nature/grass_leafs.glb'
            },
            jungleLogLarge: {
                stage: 'jungle',
                key: 'logLarge',
                label: 'Rainforest fallen log',
                url: 'assets/environment/jungle/kenney-nature/log_large.glb'
            },
            jungleStumpOld: {
                stage: 'jungle',
                key: 'stumpOld',
                label: 'Rainforest old stump',
                url: 'assets/environment/jungle/kenney-nature/stump_old.glb'
            },
            jungleRockLarge: {
                stage: 'jungle',
                key: 'rockLarge',
                label: 'Rainforest large rock',
                url: 'assets/environment/jungle/kenney-nature/rock_largeA.glb'
            },
            jungleRockSmall: {
                stage: 'jungle',
                key: 'rockSmall',
                label: 'Rainforest small rock',
                url: 'assets/environment/jungle/kenney-nature/rock_smallI.glb'
            },
            coastalVillaD: {
                stage: 'coastal',
                key: 'villaD',
                label: 'Mediterranean villa D',
                url: 'assets/environment/coastal/kenney-suburban/building-type-d.glb'
            },
            coastalVillaE: {
                stage: 'coastal',
                key: 'villaE',
                label: 'Mediterranean villa E',
                url: 'assets/environment/coastal/kenney-suburban/building-type-e.glb'
            },
            coastalVillaN: {
                stage: 'coastal',
                key: 'villaN',
                label: 'Mediterranean villa N',
                url: 'assets/environment/coastal/kenney-suburban/building-type-n.glb'
            },
            coastalVillaT: {
                stage: 'coastal',
                key: 'villaT',
                label: 'Mediterranean villa T',
                url: 'assets/environment/coastal/kenney-suburban/building-type-t.glb'
            },
            coastalVillaU: {
                stage: 'coastal',
                key: 'villaU',
                label: 'Mediterranean villa U',
                url: 'assets/environment/coastal/kenney-suburban/building-type-u.glb'
            },
            coastalPlanter: {
                stage: 'coastal',
                key: 'planter',
                label: 'Coastal villa planter',
                url: 'assets/environment/coastal/kenney-suburban/planter.glb'
            }
        };
        this.vehicleAssetSpecs = {
            rally: {
                asset: 'carConcept',
                width: 3.05,
                length: 6.02,
                height: 1.66,
                yaw: Math.PI,
                groundOffset: -0.2,
                contactPointYOffset: 0.06
            },
            apexGt: {
                asset: 'apexConcept',
                width: 3.05,
                length: 5.86,
                height: 1.55,
                yaw: Math.PI,
                groundOffset: -0.04,
                omitNames: ['shadow'],
                contactPointYOffset: 0.02
            },
            supercar: {
                asset: 'passengerPack',
                variant: 'sport',
                width: 3.45,
                length: 6.55,
                height: 1.72,
                yaw: Math.PI,
                scaleBasis: 'height',
                groundOffset: -0.08,
                contactPointYOffset: 0.03
            },
            muscle: {
                asset: 'passengerPack',
                variant: 'sedan',
                width: 3.45,
                length: 6.6,
                height: 1.9,
                yaw: 0,
                scaleBasis: 'height',
                groundOffset: -0.08,
                contactPointYOffset: 0.03
            },
            hatchback: {
                asset: 'passengerPack',
                variant: 'hatchback',
                width: 3.2,
                length: 6.15,
                height: 1.85,
                yaw: Math.PI,
                scaleBasis: 'height',
                groundOffset: -0.08,
                contactPointYOffset: 0.03
            },
            suv: {
                asset: 'passengerPack',
                variant: 'suv',
                width: 3.55,
                length: 7.35,
                height: 2.35,
                yaw: 0,
                scaleBasis: 'height',
                groundOffset: -0.08,
                contactPointYOffset: 0.03
            },
            pickup: {
                asset: 'passengerPack',
                variant: 'pickup',
                width: 3.45,
                length: 7.25,
                height: 2.3,
                yaw: Math.PI,
                scaleBasis: 'height',
                groundOffset: -0.08,
                contactPointYOffset: 0.03
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
        this.currentEnvironment = null;
        this.nightRace = false;
        this.timeOfDayMode = 'day';
        // Audio elements
        this.desertMusic = document.getElementById('desertMusic');
        this.alpineMusic = document.getElementById('alpineMusic');
        this.scotlandMusic = document.getElementById('scotlandMusic');
        this.gameMusic = document.getElementById('gameMusic');
        this.currentMusicElement = null;
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.applyMusicPreference();
        this.applyCameraModeSettings();
        // Initialize the game music when the page loads
    }

    getDifficultyOptions() {
        return Object.values(this.difficultyProfiles);
    }

    getDifficultyProfile(id = this.difficultyLevel) {
        return this.difficultyProfiles[id] || this.difficultyProfiles.pro;
    }

    getDifficultyLevel() {
        return this.getDifficultyProfile(this.difficultyLevel).id;
    }

    setDifficultyLevel(id) {
        const profile = this.getDifficultyProfile(id);
        this.difficultyLevel = profile.id;
        localStorage.setItem(this.difficultyStorageKey, profile.id);
        return profile;
    }

    getDrivingAssistOptions() {
        return Object.values(this.drivingAssistProfiles);
    }

    getDrivingAssistProfile(id = this.drivingAssistLevel) {
        return this.drivingAssistProfiles[id] || this.drivingAssistProfiles.full;
    }

    getDrivingAssistLevel() {
        return this.getDrivingAssistProfile(this.drivingAssistLevel).id;
    }

    setDrivingAssistLevel(id) {
        const profile = this.getDrivingAssistProfile(id);
        this.drivingAssistLevel = profile.id;
        localStorage.setItem(this.assistStorageKey, profile.id);
        return profile;
    }

    getRaceModeOptions() {
        return Object.values(this.raceModeProfiles);
    }

    getRaceModeProfile(id = this.raceMode) {
        return this.raceModeProfiles[id] || this.raceModeProfiles.traffic;
    }

    getRaceMode() {
        return this.getRaceModeProfile(this.raceMode).id;
    }

    setRaceMode(id) {
        const profile = this.getRaceModeProfile(id);
        this.raceMode = profile.id;
        localStorage.setItem(this.raceModeStorageKey, profile.id);
        return profile;
    }

    getStageLabel(stageId = this.currentStageId) {
        const labels = {
            scotland: 'Scotland',
            desert: 'Desert',
            alpine: 'Alpine',
            city: 'Tokyo',
            lakes: 'Lakes',
            jungle: 'Rainforest Mud',
            coastal: 'Mediterranean Coast',
            valleverde: 'Valle Verde'
        };

        return labels[stageId] || stageId || 'Stage';
    }

    getBestTimesKey(stageId = this.currentStageId, difficultyId = this.difficultyLevel, assistId = this.drivingAssistLevel, raceModeId = this.raceMode) {
        return `${stageId || 'scotland'}:${this.getDifficultyProfile(difficultyId).id}:${this.getDrivingAssistProfile(assistId).id}:${this.getRaceModeProfile(raceModeId).id}`;
    }

    loadBestTimes() {
        try {
            const stored = JSON.parse(localStorage.getItem(this.bestTimesStorageKey) || '{}');
            if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
                return Object.entries(stored).reduce((bestTimes, [key, times]) => {
                    const keyParts = key.split(':');
                    const normalizedKey = keyParts.length === 2
                        ? `${key}:full:traffic`
                        : keyParts.length === 3
                            ? `${key}:traffic`
                            : key;
                    const normalizedTimes = Array.isArray(times) ? times.filter(Number.isFinite) : [];
                    bestTimes[normalizedKey] = [
                        ...(bestTimes[normalizedKey] || []),
                        ...normalizedTimes
                    ].sort((a, b) => a - b).slice(0, 5);
                    return bestTimes;
                }, {});
            }
        } catch (error) {
            localStorage.removeItem(this.bestTimesStorageKey);
        }

        try {
            const legacyTimes = JSON.parse(localStorage.getItem('bestTimes') || '[]');
            if (Array.isArray(legacyTimes) && legacyTimes.length > 0) {
                return {
                    [this.getBestTimesKey('scotland', 'pro', 'full', 'traffic')]: legacyTimes
                        .filter(Number.isFinite)
                        .sort((a, b) => a - b)
                        .slice(0, 5)
                };
            }
        } catch (error) {
            localStorage.removeItem('bestTimes');
        }

        return {};
    }

    getBestTimesFor(stageId = this.currentStageId, difficultyId = this.difficultyLevel, assistId = this.drivingAssistLevel, raceModeId = this.raceMode) {
        const key = this.getBestTimesKey(stageId, difficultyId, assistId, raceModeId);
        const times = this.bestTimes[key];
        return Array.isArray(times) ? times : [];
    }

    saveBestTimes() {
        localStorage.setItem(this.bestTimesStorageKey, JSON.stringify(this.bestTimes));
    }

    getTrafficTargetCount() {
        const mode = this.game?.settings?.raceModeId || this.raceMode;
        if (!this.getRaceModeProfile(mode).hasIncomingTraffic) {
            return 0;
        }

        const difficulty = this.getDifficultyProfile(this.game?.settings?.difficultyId || this.difficultyLevel);
        const stageId = this.game?.settings?.stageId || this.currentStageId;
        const stageScale = {
            scotland: 1,
            desert: 1.12,
            alpine: 0.86,
            city: 1.18,
            lakes: 0.94,
            jungle: 0.9,
            coastal: 1.02,
            valleverde: 1
        };

        return Math.max(4, Math.round(difficulty.trafficCount * (stageScale[stageId] || 1)));
    }

    getRaceCompetitorCount() {
        const mode = this.game?.settings?.raceModeId || this.raceMode;
        if (!this.getRaceModeProfile(mode).hasRaceCompetitors) {
            return 0;
        }

        const difficulty = this.getDifficultyProfile(this.game?.settings?.difficultyId || this.difficultyLevel);
        return Math.max(5, Math.min(9, Math.round(difficulty.trafficCount * 0.62)));
    }

    getGridRaceTuning(difficultyId = this.game?.settings?.difficultyId || this.difficultyLevel) {
        const tunings = {
            rookie: {
                pace: 0.78,
                speedBiasMin: 0.9,
                speedBiasMax: 1.02,
                typePace: { supercar: 1.02, muscle: 1, hatchback: 0.98, pickup: 0.93, suv: 0.9 },
                launchBoost: 0.012,
                launchFrames: 38,
                accelerationResponse: 0.022,
                decelerationResponse: 0.018,
                catchupMin: -0.05,
                catchupMax: 0.06,
                cornerCarry: 0.06,
                minSpeed: 0.72,
                laneChangeRate: 0.002,
                laneReturn: 0.052,
                defendStrength: 0,
                overtakeStrength: 0.18,
                awarenessDistance: 42
            },
            pro: {
                pace: 0.87,
                speedBiasMin: 0.88,
                speedBiasMax: 1.08,
                typePace: { supercar: 1.05, muscle: 1.02, hatchback: 1, pickup: 0.92, suv: 0.89 },
                launchBoost: 0.02,
                launchFrames: 52,
                accelerationResponse: 0.03,
                decelerationResponse: 0.016,
                catchupMin: -0.035,
                catchupMax: 0.1,
                cornerCarry: 0.09,
                minSpeed: 0.84,
                laneChangeRate: 0.004,
                laneReturn: 0.044,
                defendStrength: 0.34,
                overtakeStrength: 0.42,
                awarenessDistance: 58
            },
            expert: {
                pace: 0.91,
                speedBiasMin: 0.88,
                speedBiasMax: 1.07,
                typePace: { supercar: 1.04, muscle: 1.02, hatchback: 1, pickup: 0.94, suv: 0.91 },
                launchBoost: 0.022,
                launchFrames: 56,
                accelerationResponse: 0.032,
                decelerationResponse: 0.015,
                catchupMin: -0.04,
                catchupMax: 0.09,
                cornerCarry: 0.095,
                minSpeed: 0.88,
                laneChangeRate: 0.006,
                laneReturn: 0.038,
                defendStrength: 0.62,
                overtakeStrength: 0.64,
                awarenessDistance: 76
            }
        };

        const difficulty = this.getDifficultyProfile(difficultyId);
        return tunings[difficulty.id] || tunings.pro;
    }

    getTrafficSpeed(vehicleType) {
        const spec = this.getVehicleSpec(vehicleType);
        const difficulty = this.getDifficultyProfile(this.game?.settings?.difficultyId || this.difficultyLevel);
        return (spec.speedBase + Math.random() * difficulty.speedVariance) * difficulty.speedMultiplier;
    }

    getCockpitTunerStorageKey() {
        return `rallyRushIICockpitInteriorRigs:v${this.cockpitTunerStorageVersion}`;
    }

    getLegacyCockpitTunerStorageKeys() {
        return ['rallyRushIICockpitInteriorRigs'];
    }

    getCockpitRigValues(rig) {
        return {
            fov: rig.fov,
            lateral: rig.lateral,
            forward: rig.forward,
            height: rig.height,
            lookLateral: rig.lookLateral ?? rig.lateral ?? 0,
            lookAhead: rig.lookAhead,
            lookHeight: rig.lookHeight
        };
    }

    loadCockpitTunerOverrides() {
        try {
            this.getLegacyCockpitTunerStorageKeys().forEach(key => {
                localStorage.removeItem(key);
            });
            const stored = JSON.parse(localStorage.getItem(this.getCockpitTunerStorageKey()) || '{}');
            Object.entries(stored).forEach(([vehicleType, values]) => {
                if (!this.cockpitInteriorRigs[vehicleType] || !values || typeof values !== 'object') {
                    return;
                }

                Object.entries(values).forEach(([key, value]) => {
                    if (Number.isFinite(value) && key in this.getCockpitRigValues(this.cockpitInteriorRigs[vehicleType])) {
                        this.cockpitInteriorRigs[vehicleType][key] = value;
                    }
                });
            });
        } catch (error) {
            localStorage.removeItem(this.getCockpitTunerStorageKey());
        }
    }

    saveCockpitTunerOverrides() {
        try {
            const payload = {};
            Object.entries(this.cockpitInteriorRigs).forEach(([vehicleType, rig]) => {
                payload[vehicleType] = this.getCockpitRigValues(rig);
            });
            localStorage.setItem(this.getCockpitTunerStorageKey(), JSON.stringify(payload));
        } catch (error) {
            // Camera tuning is optional; keep driving if localStorage is unavailable.
        }
    }

    getCockpitTunerState(vehicleType = this.getPlayerVehicleType()) {
        const rig = this.cockpitInteriorRigs[vehicleType] || this.cockpitInteriorRigs.rally;
        const option = this.getPlayerVehicleOption(vehicleType);
        const values = this.getCockpitRigValues(rig);
        const roundedValues = Object.fromEntries(Object.entries(values).map(([key, value]) => [
            key,
            Number((value || 0).toFixed(key === 'fov' ? 0 : 2))
        ]));

        return {
            vehicleType,
            carName: option?.name || vehicleType,
            ...roundedValues
        };
    }

    adjustCockpitRigValue(key, delta) {
        const vehicleType = this.getPlayerVehicleType();
        const rig = this.cockpitInteriorRigs[vehicleType] || this.cockpitInteriorRigs.rally;
        const limits = {
            fov: [45, 96],
            lateral: [-1.4, 1.4],
            forward: [-1.6, 1.8],
            height: [0.35, 2.2],
            lookLateral: [-1.8, 1.8],
            lookAhead: [2, 30],
            lookHeight: [0.2, 2.5]
        };

        if (!rig || !limits[key]) {
            return this.getCockpitTunerState(vehicleType);
        }

        const current = Number.isFinite(rig[key]) ? rig[key] : (this.defaultCockpitInteriorRigs[vehicleType]?.[key] || 0);
        rig[key] = THREE.MathUtils.clamp(current + delta, limits[key][0], limits[key][1]);
        this.saveCockpitTunerOverrides();
        this.applyCameraModeSettings();
        if (this.game) {
            this.updateCameraPosition();
        }
        return this.getCockpitTunerState(vehicleType);
    }

    resetCockpitRig(vehicleType = this.getPlayerVehicleType()) {
        if (this.defaultCockpitInteriorRigs[vehicleType] && this.cockpitInteriorRigs[vehicleType]) {
            Object.assign(this.cockpitInteriorRigs[vehicleType], JSON.parse(JSON.stringify(this.defaultCockpitInteriorRigs[vehicleType])));
            this.saveCockpitTunerOverrides();
            this.applyCameraModeSettings();
            if (this.game) {
                this.updateCameraPosition();
            }
        }
        return this.getCockpitTunerState(vehicleType);
    }

    configureSceneEnvironment(environment = {}) {
        const timeOfDay = environment.timeOfDay || (environment.nightRace ? 'night' : 'day');
        if (this.vehicleEnvironmentMapTimeOfDay !== timeOfDay) {
            this.vehicleEnvironmentMap?.dispose?.();
            this.vehicleEnvironmentMap = null;
            this.vehicleEnvironmentMapTimeOfDay = timeOfDay;
        }

        if (!this.vehicleEnvironmentMap) {
            this.vehicleEnvironmentMap = this.createVehicleEnvironmentMap(environment);
        }

        this.scene.environment = this.vehicleEnvironmentMap;
    }

    createVehicleEnvironmentMap(environment = {}) {
        const size = 96;
        const isSunset = environment.timeOfDay === 'sunset';
        const makeFace = (top, middle, bottom) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d');
            const gradient = context.createLinearGradient(0, 0, 0, size);
            gradient.addColorStop(0, top);
            gradient.addColorStop(0.48, middle);
            gradient.addColorStop(1, bottom);
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);

            context.fillStyle = 'rgba(255, 255, 255, 0.18)';
            context.fillRect(0, size * 0.46, size, 2);
            context.fillStyle = 'rgba(95, 226, 255, 0.2)';
            context.fillRect(size * 0.12, size * 0.18, size * 0.76, 3);
            context.fillStyle = 'rgba(255, 212, 71, 0.18)';
            context.fillRect(size * 0.08, size * 0.74, size * 0.84, 4);
            return canvas;
        };

        const faces = isSunset
            ? [
                makeFace('#ffdca4', '#f08a50', '#3b3d53'),
                makeFace('#ffe1b3', '#d87355', '#26354a'),
                makeFace('#fff0cf', '#ffc07c', '#8e5b43'),
                makeFace('#2b3549', '#4d3d3e', '#251c20'),
                makeFace('#ffd6a3', '#e58b5e', '#384359'),
                makeFace('#fff2d2', '#c86d49', '#4a3b2e')
            ]
            : [
                makeFace('#d8f3ff', '#83d3f2', '#3f5361'),
                makeFace('#d8f3ff', '#9fd9eb', '#2f443e'),
                makeFace('#ffffff', '#c8efff', '#89c7dd'),
                makeFace('#49674b', '#59685b', '#283031'),
                makeFace('#e6f7ff', '#8ccfe8', '#36495b'),
                makeFace('#f8fbff', '#a8dded', '#4e5a45')
            ];
        const cubeTexture = new THREE.CubeTexture(faces);
        if (THREE.sRGBEncoding) {
            cubeTexture.encoding = THREE.sRGBEncoding;
        }
        cubeTexture.needsUpdate = true;
        return cubeTexture;
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
        this.configureSceneEnvironment(environment);

        this.currentEnvironment = environment;
        this.nightRace = Boolean(environment.nightRace);
        this.timeOfDayMode = environment.timeOfDay || (this.nightRace ? 'night' : 'day');
        const sunsetRace = this.timeOfDayMode === 'sunset';
        const useVehicleOnlyNightLighting = this.nightRace && environment.id === 'city';

        this.ambientLight = new THREE.AmbientLight(
            this.nightRace ? 0x476c86 : sunsetRace ? 0xffc18a : 0xffffff,
            useVehicleOnlyNightLighting ? 0 : this.nightRace ? 0.085 : sunsetRace ? 0.055 : 0.035
        );
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(
            this.nightRace ? 0x8fb2ff : sunsetRace ? 0xff9b52 : 0xffffff,
            useVehicleOnlyNightLighting ? 0 : this.nightRace ? 0.42 : sunsetRace ? 1.28 : 2.15
        );
        this.directionalLight.position.set(sunsetRace ? -126 : 38, sunsetRace ? 24 : 96, sunsetRace ? 84 : 122);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;
        this.directionalLight.shadow.camera.near = 10;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 150;
        this.directionalLight.shadow.camera.bottom = -100;

        this.scene.add(this.directionalLight);

        this.fillLight = new THREE.DirectionalLight(
            this.nightRace ? 0x2c7f8f : sunsetRace ? 0x6e87bd : 0xddeeff,
            useVehicleOnlyNightLighting ? 0 : this.nightRace ? 0.26 : sunsetRace ? 0.1 : 0.14
        );
        this.fillLight.position.set(-44, 46, 62);
        this.scene.add(this.fillLight);

        this.rimLight = new THREE.DirectionalLight(
            this.nightRace ? 0x66e0ff : sunsetRace ? 0xffd09a : 0xbdeaff,
            useVehicleOnlyNightLighting ? 0 : this.nightRace ? 0.9 : sunsetRace ? 0.42 : 0.58
        );
        this.rimLight.position.set(sunsetRace ? 54 : -24, sunsetRace ? 18 : 28, sunsetRace ? -92 : -42);
        this.scene.add(this.rimLight);

        this.hemiLight = new THREE.HemisphereLight(
            this.nightRace ? 0x18354e : sunsetRace ? 0xffb16b : 0xcde7f2,
            this.nightRace ? 0x061409 : sunsetRace ? 0x3a241b : 0x334029,
            useVehicleOnlyNightLighting ? 0 : this.nightRace ? 0.52 : sunsetRace ? 0.24 : 0.3
        );
        if (sunsetRace) {
            this.hemiLight.color.setHSL(0.08, 0.72, 0.58);
            this.hemiLight.groundColor.setHSL(0.06, 0.44, 0.18);
        } else if (!this.nightRace) {
            this.hemiLight.color.setHSL(0.58, 0.58, 0.62);
            this.hemiLight.groundColor.setHSL(0.12, 0.35, 0.24);
        }
        this.scene.add(this.hemiLight);

        this.currentStageId = environment.id || this.currentStageId || 'scotland';
        if (environment.id === 'jungle') {
            this.applyJungleGenerationOverrides(environment);
        }
        environment.assetCache = this.getStageEnvironmentAssets(this.currentStageId);
        const difficulty = this.getDifficultyProfile(this.difficultyLevel);
        const drivingAssist = this.getDrivingAssistProfile(this.drivingAssistLevel);
        const raceMode = this.getRaceModeProfile(this.raceMode);
        const playerVehicleType = this.playerVehicleType || 'rally';
        const playerSpec = this.getVehicleSpec(playerVehicleType);
        const baseTrackLength = Math.abs(environment.jungleGeneration?.trailLength || environment.trackLength || 5900);
        const trackLength = Math.round(baseTrackLength * (raceMode.lengthMultiplier || 1));
        const roadWidth = environment.roadWidth || 25;
        const shoulderWidth = Number.isFinite(environment.shoulderWidth) ? Math.max(0, environment.shoulderWidth) : 0;
        const closedStoredTrack = Boolean(environment.storedTrack && environment.storedTrack.repeat !== false);
        const startLine = closedStoredTrack ? 0 : -100;
        const drivableWidth = Number.isFinite(environment.drivableWidth)
            ? environment.drivableWidth
            : environment.terrainStyle === 'race-circuit'
                ? roadWidth + shoulderWidth * 1.6
                : roadWidth;

        // Initialize the game object
        this.game = {
            settings: {
                stageId: this.currentStageId,
                stageLabel: this.getStageLabel(this.currentStageId),
                difficultyId: difficulty.id,
                difficultyLabel: difficulty.label,
                assistId: drivingAssist.id,
                assistLabel: drivingAssist.label,
                raceModeId: raceMode.id,
                raceModeLabel: raceMode.label,
                timeOfDay: this.timeOfDayMode,
                rainEnabled: !environment.disableRain
            },
            road: {
                length: trackLength,
                width: roadWidth,
                shoulderWidth,
                drivableWidth,
                segments: []
            },
            car: {
                vehicleType: playerVehicleType,
                position: new THREE.Vector3(0, 0, -10),
                speed: 0,
                acceleration: playerSpec.acceleration,
                deceleration: playerSpec.deceleration,
                brakePower: playerSpec.brakePower,
                handbrakePower: playerSpec.handbrakePower,
                maxSpeed: playerSpec.maxSpeed,
                minSpeed: 0,
                xOffset: 0,
                lateralVelocity: 0,
                angle: 0,
                driftAmount: 0,
                handbrakeIntensity: 0,
                turnEntryDrift: 0,
                driftSmokeCooldown: 0,
                driveYaw: 0,
                visualYaw: 0,
                travelAngle: 0,
                yawVelocity: 0,
                slipAngle: 0,
                rearGrip: 1,
                lastRoadYaw: 0,
                bodyRoll: 0,
                steeringAngle: 0,
                maxSteeringAngle: playerSpec.maxSteeringAngle,
                steeringSpeed: playerSpec.steeringSpeed,
                turnSpeed: playerSpec.turnSpeed,
                curveSlip: playerSpec.curveSlip,
                lateralGrip: playerSpec.lateralGrip,
                driftBoost: playerSpec.driftBoost,
                headingRecovery: playerSpec.headingRecovery,
                jumpQueued: false,
                jumpOffset: 0,
                jumpVelocity: 0,
                jumpCooldown: 0,
                airborne: false,
                landingTractionTimer: 0,
                landingTractionDuration: 0,
                landingTractionSide: 1,
                landingWobblePhase: 0,
                landingDriftAmount: 0,
                lastLandingSpeedLoss: 0,
                borderCollisionCooldown: 0,
                trafficCollisionCooldown: 0
            },
            terrain: { width: 300 },
            traffic: [],
            raceResults: [],
            sectorTimings: [],
            sectors: raceMode.hasSectorTiming ? [
                { id: 1, z: -trackLength / 3 },
                { id: 2, z: -trackLength * 2 / 3 },
                { id: 3, z: -trackLength }
            ] : [],
            nextSectorIndex: 0,
            stageEffects: [],
            sceneryCullObjects: [],
            sceneryCullWindow: {
                ahead: environment.id === 'jungle' ? 1050 : 900,
                behind: environment.id === 'jungle' ? 90 : 220
            },
            startTime: null,
            finishTime: null,
            startLine,
            finishLine: -trackLength
        };
        // Generate the road and terrain based on the environment
        generateRoadAndTerrain(this.scene, this.game, environment);

        const playerOption = this.getPlayerVehicleOption(playerVehicleType);
        this.playerCar = this.createCar(playerOption.color, playerVehicleType, {
            palette: playerOption.palette,
            player: true
        });
        this.scene.add(this.playerCar);
        this.setupStageVehicleLighting(this.playerCar, { player: true });
        this.applyCameraModeSettings();

        this.resetCarPosition();
        this.createInitialTrafficCars();
        this.updateCameraPosition();
    }

    applyJungleGenerationOverrides(environment) {
        const generation = {
            complexity: 0.75,
            trailLength: 5900,
            trailWidth: environment.roadWidth || 15.5,
            trailCurve: 0.45,
            bankHeight: 2.5,
            density: 1,
            canopyCover: 0.95,
            treeCount: 24,
            treeMultiplier: 3,
            branchMultiplier: 1,
            postFinishVegetation: 720,
            understoryHeight: 6.5,
            understoryMultiplier: 10,
            rockCount: 48,
            roadsideRockDensity: 1.8,
            vines: 12,
            ...(environment.jungleGeneration || {})
        };
        const params = new URLSearchParams(window.location.search);
        const overrides = {
            jungleComplexity: ['complexity', 0.1, 1],
            jungleTrailLength: ['trailLength', 1800, 9000],
            jungleTrailWidth: ['trailWidth', 8, 24],
            jungleTrailCurve: ['trailCurve', 0, 1.5],
            jungleBankHeight: ['bankHeight', 0, 8],
            jungleDensity: ['density', 0, 1.25],
            jungleCanopy: ['canopyCover', 0, 1],
            jungleTrees: ['treeCount', 0, 70],
            jungleTreeMultiplier: ['treeMultiplier', 0, 6],
            jungleBranchMultiplier: ['branchMultiplier', 0, 12],
            junglePostFinishVegetation: ['postFinishVegetation', 0, 900],
            jungleUnderstory: ['understoryHeight', 0, 14],
            jungleUnderstoryMultiplier: ['understoryMultiplier', 0, 14],
            jungleRocks: ['rockCount', 0, 120],
            jungleRoadsideRocks: ['roadsideRockDensity', 0, 4],
            jungleVines: ['vines', 0, 40]
        };

        Object.entries(overrides).forEach(([paramName, [settingName, min, max]]) => {
            if (!params.has(paramName)) {
                return;
            }
            const value = Number(params.get(paramName));
            if (Number.isFinite(value)) {
                generation[settingName] = THREE.MathUtils.clamp(value, min, max);
            }
        });

        environment.jungleGeneration = generation;
        environment.roadWidth = generation.trailWidth;
        environment.roadTextureMetersPerTile = generation.trailWidth;
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

    clearStartCountdown() {
        if (this.startCountdown?.group) {
            this.scene.remove(this.startCountdown.group);
            this.disposeObject(this.startCountdown.group);
        }

        this.startCountdown = null;
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
                speedBase: 0.82,
                acceleration: 0.010,
                deceleration: 0.002,
                brakePower: 0.010,
                handbrakePower: 0.030,
                maxSpeed: 2.5,
                maxSteeringAngle: Math.PI / 12,
                steeringSpeed: 0.15,
                turnSpeed: 0.08,
                curveSlip: 1,
                lateralGrip: 1,
                driftBoost: 1,
                headingRecovery: 1
            },
            apexGt: {
                width: 2.2,
                length: 4.55,
                bodyHeight: 0.62,
                cabinWidth: 1.26,
                cabinLength: 1.26,
                cabinHeight: 0.48,
                cabinZ: 0,
                wheelRadius: 0.42,
                wheelWidth: 0.38,
                stance: 1.34,
                spoiler: true,
                splitter: true,
                diffuser: true,
                stripe: 'center',
                speedBase: 0.92,
                acceleration: 0.0112,
                deceleration: 0.0017,
                brakePower: 0.011,
                handbrakePower: 0.026,
                maxSpeed: 2.86,
                maxSteeringAngle: Math.PI / 14,
                steeringSpeed: 0.125,
                turnSpeed: 0.068,
                curveSlip: 0.78,
                lateralGrip: 1.18,
                driftBoost: 0.82,
                headingRecovery: 1.16
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

    getPlayerVehicleOptions() {
        return [
            {
                type: 'rally',
                name: 'Rally R',
                className: 'Balanced Rally',
                color: 0xe30f24,
                palette: { body: 0xe30f24, accent: 0xf7fbff, stripe: 0x5fe2ff },
                stats: { speed: 78, launch: 72, handling: 76, drift: 76, stability: 72 }
            },
            {
                type: 'apexGt',
                name: 'Apex GT',
                className: 'High-Speed GT',
                color: 0xd51f2a,
                palette: { body: 0xd51f2a, accent: 0x111820, stripe: 0xffd447 },
                stats: { speed: 94, launch: 80, handling: 66, drift: 58, stability: 86 }
            }
        ];
    }

    getPlayerVehicleOption(type = this.getPlayerVehicleType()) {
        return this.getPlayerVehicleOptions().find(option => option.type === type) || this.getPlayerVehicleOptions()[0];
    }

    getPlayerVehicleType() {
        return this.game?.car?.vehicleType || this.playerVehicleType || 'rally';
    }

    setPlayerVehicleType(type) {
        const option = this.getPlayerVehicleOption(type);
        this.playerVehicleType = option.type;
        localStorage.setItem('selectedPlayerVehicleType', option.type);
        this.ensureCameraModeForVehicle(option.type);
        return option;
    }

    getPlayerVehiclePalette(type = this.getPlayerVehicleType()) {
        return this.getPlayerVehicleOption(type).palette;
    }

    getVehicleDimensions(type = 'rally') {
        const spec = this.getVehicleSpec(type);
        const assetSpec = this.vehicleAssetSpecs[type];

        return {
            width: assetSpec?.width || spec.width,
            length: assetSpec?.length || spec.length,
            height: assetSpec?.height || spec.bodyHeight + spec.cabinHeight
        };
    }

    getVehicleCollisionBounds(type = 'rally') {
        const dimensions = this.getVehicleDimensions(type);

        return {
            width: dimensions.width * 0.72,
            length: dimensions.length * 0.7
        };
    }

    getVehicleGroundClearance(type = 'rally') {
        const assetSpec = this.vehicleAssetSpecs[type];
        if (assetSpec) {
            return Math.max(0.23, -(assetSpec.groundOffset || 0) + 0.03);
        }

        return 0.22;
    }

    getVehicleGroundY(frame, type = 'rally') {
        return ((frame.frontRoadData.y + frame.rearRoadData.y) * 0.5) + this.getVehicleGroundClearance(type);
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
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
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
        const assetSpec = { ...this.vehicleAssetSpecs[type] };
        const palette = {
            body: color,
            accent: 0xffffff,
            stripe: 0x5fe2ff,
            ...(options.palette || {})
        };
        const car = new THREE.Group();
        car.userData.vehicleType = type;
        car.userData.wheels = [];
        car.userData.steeringWheels = [];
        car.userData.dashboardDisplays = [];
        car.userData.wheelContactPoints = [];
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

        const cachedSource = this.vehicleModelScenes[assetSpec.asset];
        if (cachedSource) {
            this.attachAssetVehicleModel(car, cachedSource, type, palette, assetSpec, spec);
        } else {
            this.loadVehicleModel(assetSpec.asset)
                .then(source => {
                    if (car.userData.disposed) {
                        return;
                    }

                    this.attachAssetVehicleModel(car, source, type, palette, assetSpec, spec);
                })
                .catch(error => {
                    console.warn(`Falling back to procedural ${type} vehicle.`, error);
                    if (car.userData.disposed) {
                        return;
                    }

                    const materials = this.createVehicleMaterials(palette);
                    this.populateProceduralCar(car, spec, materials, type);
                    this.cacheVehicleWheelContactPoints(car);
                    car.userData.assetReady = false;
                    car.userData.assetFallback = true;
                });
        }

        return car;
    }

    attachAssetVehicleModel(car, source, type, palette, assetSpec, spec) {
        const model = source.clone(true);
        model.visible = false;
        this.prepareAssetVehicleModel(model, type, palette, assetSpec);
        model.traverse(child => {
            if (child.userData.assetWheel) {
                car.userData.wheels.push(child);
            }
            if (child.userData.assetSteeringWheel) {
                car.userData.steeringWheels.push(child);
            }
            if (child.userData.assetDashboardDisplay) {
                car.userData.dashboardDisplays.push(child.userData.assetDashboardDisplay);
            }
        });
        car.add(model);
        this.cacheVehicleWheelContactPoints(car);
        this.settleVehicleRoadContact(car, 6);
        model.visible = true;
        car.userData.assetReady = true;
        if (car === this.playerCar) {
            this.applyCameraModeSettings();
            if (this.game?.car) {
                this.animateVehicleSteeringWheel(car, this.game.car.steeringAngle || 0, this.game.car.maxSteeringAngle || spec.maxSteeringAngle);
                this.updateVehicleDashboardDisplays();
            }
        }
    }

    setupStageVehicleLighting(car = this.playerCar, options = {}) {
        if (!car || this.currentEnvironment?.disableVehicleLights) {
            return;
        }

        if (!options.player) {
            return;
        }

        this.setupNightStageVehicleLighting(car, options);
    }

    setupNightStageVehicleLighting(car = this.playerCar, options = {}) {
        if (!this.nightRace || car.userData.stageLightRig) {
            return;
        }

        const isPlayer = Boolean(options.player);
        const type = car.userData.vehicleType || (isPlayer ? this.game?.car?.vehicleType || this.playerVehicleType : 'rally') || 'rally';
        const dimensions = this.getVehicleDimensions(type);
        const frontZ = -dimensions.length * 0.49;
        const rearZ = dimensions.length * 0.49;
        const lightY = Math.max(0.5, dimensions.height * 0.4);
        const anchors = this.getVehicleHeadlightAnchors(car, dimensions);
        const rig = new THREE.Group();
        rig.name = isPlayer ? 'stage-player-light-rig' : 'stage-traffic-light-rig';
        rig.userData.stageVehicleLightRig = true;

        anchors.forEach(anchor => {
            const target = new THREE.Object3D();
            target.name = 'stage-headlight-target';
            target.position.set(
                isPlayer ? anchor.position.x * 1.75 : anchor.position.x * 0.55,
                Math.max(0.12, anchor.position.y - 0.32),
                anchor.position.z - (isPlayer ? 54 : 32)
            );
            rig.add(target);

            const headlight = new THREE.SpotLight(
                0xdff6ff,
                isPlayer ? 7.2 : 0.72,
                isPlayer ? 108 : 46,
                isPlayer ? 0.32 : 0.24,
                isPlayer ? 0.88 : 0.76,
                1.8
            );
            headlight.name = 'stage-headlight-spot';
            headlight.position.copy(anchor.position);
            headlight.target = target;
            headlight.castShadow = false;
            headlight.userData.stageHeadlightSpot = true;
            rig.add(headlight);
        });

        const tailGlow = new THREE.PointLight(0xff1830, isPlayer ? 0.18 : 0.08, isPlayer ? 5.2 : 3.4, 2.2);
        tailGlow.name = 'stage-taillight-glow';
        tailGlow.position.set(0, lightY * 0.82, rearZ + 0.08);
        tailGlow.castShadow = false;
        rig.add(tailGlow);

        if (isPlayer) {
            const roadFill = new THREE.PointLight(0xbdeeff, 0.32, 15, 2.1);
            roadFill.name = 'stage-road-focus-light';
            roadFill.position.set(0, Math.max(0.35, lightY * 0.7), frontZ - 5);
            roadFill.castShadow = false;
            rig.add(roadFill);
        }

        car.add(rig);
        car.userData.stageLightRig = rig;
    }

    getVehicleHeadlightAnchors(car, dimensions) {
        const detected = [];
        car.updateMatrixWorld(true);

        car.traverse(child => {
            if (!child.isMesh || child.name === 'vehicle-collision-proxy' || child.userData.stageHeadlightSpot) {
                return;
            }

            const materialNames = (Array.isArray(child.material) ? child.material : [child.material])
                .map(material => material?.name || '')
                .join(' ');
            const name = `${child.name || ''} ${materialNames}`;
            if (!this.isAssetHeadlightName(name)) {
                return;
            }

            const box = new THREE.Box3().setFromObject(child);
            if (box.isEmpty()) {
                return;
            }

            const localBox = this.getObjectBoxInVehicleSpace(box, car);
            const local = localBox.getCenter(new THREE.Vector3());
            if (local.z > dimensions.length * 0.08) {
                return;
            }

            detected.push({
                position: local,
                side: local.x < 0 ? -1 : 1,
                box: localBox
            });
        });

        const anchors = [-1, 1].map(side => {
            const candidates = detected
                .filter(candidate => candidate.side === side)
                .sort((a, b) => a.position.z - b.position.z);
            return candidates[0] || null;
        });

        if (anchors.every(Boolean)) {
            return anchors;
        }

        const splitCandidate = detected
            .filter(candidate => candidate.box)
            .sort((a, b) => a.position.z - b.position.z)[0];
        if (splitCandidate && (splitCandidate.box.max.x - splitCandidate.box.min.x) > 0.44) {
            const center = splitCandidate.box.getCenter(new THREE.Vector3());
            const inset = Math.min(0.18, Math.max(0.04, (splitCandidate.box.max.x - splitCandidate.box.min.x) * 0.12));
            return [-1, 1].map(side => ({
                side,
                position: new THREE.Vector3(
                    side < 0 ? splitCandidate.box.min.x + inset : splitCandidate.box.max.x - inset,
                    center.y,
                    splitCandidate.box.min.z - 0.02
                )
            }));
        }

        const frontZ = -dimensions.length * 0.48;
        const sideX = Math.min(dimensions.width * 0.25, 0.72);
        const lightY = Math.max(0.58, dimensions.height * 0.42);
        return [-1, 1].map(side => ({
            side,
            position: new THREE.Vector3(sideX * side, lightY, frontZ - 0.1)
        }));
    }

    getObjectBoxInVehicleSpace(worldBox, car) {
        const localBox = new THREE.Box3();
        const min = worldBox.min;
        const max = worldBox.max;
        [
            new THREE.Vector3(min.x, min.y, min.z),
            new THREE.Vector3(min.x, min.y, max.z),
            new THREE.Vector3(min.x, max.y, min.z),
            new THREE.Vector3(min.x, max.y, max.z),
            new THREE.Vector3(max.x, min.y, min.z),
            new THREE.Vector3(max.x, min.y, max.z),
            new THREE.Vector3(max.x, max.y, min.z),
            new THREE.Vector3(max.x, max.y, max.z)
        ].forEach(point => {
            localBox.expandByPoint(car.worldToLocal(point));
        });
        return localBox;
    }

    isAssetHeadlightName(name = '') {
        const normalized = this.normalizeAssetName(name);
        return /head\s*light|headlight|front\s*light|(^|\s)(lights?|optics)(?=\s|$|_|\d)/.test(normalized)
            && !/tail|brake|rear|signal|indicator|interior|red|steering/.test(normalized);
    }

    getRequiredVehicleAssetNames() {
        return [...new Set(Object.values(this.vehicleAssetSpecs)
            .map(spec => spec.asset)
            .filter(Boolean))];
    }

    getVehicleAssetLabel(assetName) {
        const labels = {
            carConcept: 'Sports fleet model',
            apexConcept: 'Apex concept model',
            passengerPack: 'Passenger traffic pack'
        };
        return labels[assetName] || assetName;
    }

    getVehicleModelLoadState(assetName) {
        if (!this.vehicleModelLoadState[assetName]) {
            this.vehicleModelLoadState[assetName] = {
                loaded: 0,
                total: 0,
                started: false,
                ready: false,
                failed: false
            };
        }
        return this.vehicleModelLoadState[assetName];
    }

    getSingleVehicleLoadRatio(assetName) {
        const state = this.getVehicleModelLoadState(assetName);
        if (state.ready || state.failed) {
            return 1;
        }

        if (state.total > 0) {
            return Math.min(0.98, state.loaded / state.total);
        }

        return state.started ? 0.18 : 0;
    }

    getVehicleLoadProgress(assetNames = this.getRequiredVehicleAssetNames()) {
        if (!assetNames.length || !this.gltfLoader) {
            return {
                progress: 1,
                loaded: 0,
                total: 0,
                assetName: 'Grid ready'
            };
        }

        const completed = assetNames.filter(assetName => {
            const state = this.getVehicleModelLoadState(assetName);
            return state.ready || state.failed;
        }).length;
        const combinedProgress = assetNames.reduce((sum, assetName) => {
            return sum + this.getSingleVehicleLoadRatio(assetName);
        }, 0) / assetNames.length;
        const activeAsset = assetNames.find(assetName => {
            const state = this.getVehicleModelLoadState(assetName);
            return state.started && !state.ready && !state.failed;
        }) || assetNames.find(assetName => {
            const state = this.getVehicleModelLoadState(assetName);
            return !state.ready && !state.failed;
        });

        return {
            progress: Math.min(1, combinedProgress),
            loaded: completed,
            total: assetNames.length,
            assetName: activeAsset ? this.getVehicleAssetLabel(activeAsset) : 'Grid ready'
        };
    }

    preloadVehicleModels(onProgress = () => {}) {
        const assetNames = this.getRequiredVehicleAssetNames();
        const emitProgress = assetName => {
            const progress = this.getVehicleLoadProgress(assetNames);
            onProgress({
                ...progress,
                assetName: assetName ? this.getVehicleAssetLabel(assetName) : progress.assetName
            });
        };

        emitProgress(null);

        if (!this.gltfLoader || !assetNames.length) {
            onProgress({
                progress: 1,
                loaded: assetNames.length,
                total: assetNames.length,
                assetName: 'Grid ready'
            });
            return Promise.resolve([]);
        }

        return Promise.allSettled(assetNames.map(assetName => {
            return this.loadVehicleModel(assetName, () => emitProgress(assetName));
        })).then(results => {
            onProgress({
                progress: 1,
                loaded: assetNames.length,
                total: assetNames.length,
                assetName: 'Grid ready'
            });
            return results;
        });
    }

    loadVehicleModel(assetName, onProgress = () => {}) {
        const asset = this.vehicleModelAssets[assetName];
        if (!asset) {
            return Promise.reject(new Error(`Unknown vehicle model: ${assetName}`));
        }

        if (!this.gltfLoader) {
            return Promise.reject(new Error('GLTFLoader is not available.'));
        }

        const state = this.getVehicleModelLoadState(assetName);

        if (this.vehicleModelCache[assetName]) {
            onProgress({
                assetName: this.getVehicleAssetLabel(assetName),
                progress: this.getSingleVehicleLoadRatio(assetName),
                loaded: state.loaded,
                total: state.total
            });
            return this.vehicleModelCache[assetName];
        }

        this.vehicleModelCache[assetName] = new Promise((resolve, reject) => {
            state.started = true;
            state.failed = false;
            onProgress({
                assetName: this.getVehicleAssetLabel(assetName),
                progress: this.getSingleVehicleLoadRatio(assetName),
                loaded: state.loaded,
                total: state.total
            });

            this.gltfLoader.load(
                asset.url,
                gltf => {
                    this.vehicleModelScenes[assetName] = gltf.scene;
                    state.ready = true;
                    state.loaded = state.total || state.loaded || 1;
                    state.total = state.total || state.loaded;
                    onProgress({
                        assetName: this.getVehicleAssetLabel(assetName),
                        progress: 1,
                        loaded: state.loaded,
                        total: state.total
                    });
                    resolve(gltf.scene);
                },
                event => {
                    state.started = true;
                    state.loaded = event.loaded || state.loaded;
                    state.total = event.total || state.total;
                    onProgress({
                        assetName: this.getVehicleAssetLabel(assetName),
                        progress: this.getSingleVehicleLoadRatio(assetName),
                        loaded: state.loaded,
                        total: state.total
                    });
                },
                error => {
                    state.failed = true;
                    onProgress({
                        assetName: this.getVehicleAssetLabel(assetName),
                        progress: 1,
                        loaded: state.loaded,
                        total: state.total
                    });
                    reject(error);
                }
            );
        });

        return this.vehicleModelCache[assetName];
    }

    getRequiredEnvironmentAssetNames(stageId = this.currentStageId) {
        return [...new Set(this.environmentStageAssets[stageId] || [])];
    }

    getEnvironmentAssetLabel(assetName) {
        return this.environmentModelAssets[assetName]?.label || assetName;
    }

    getEnvironmentModelLoadState(assetName) {
        if (!this.environmentModelLoadState[assetName]) {
            this.environmentModelLoadState[assetName] = {
                loaded: 0,
                total: 0,
                started: false,
                ready: false,
                failed: false
            };
        }
        return this.environmentModelLoadState[assetName];
    }

    getSingleEnvironmentLoadRatio(assetName) {
        const state = this.getEnvironmentModelLoadState(assetName);
        if (state.ready || state.failed) {
            return 1;
        }

        if (state.total > 0) {
            return Math.min(0.98, state.loaded / state.total);
        }

        return state.started ? 0.18 : 0;
    }

    getEnvironmentLoadProgress(assetNames = this.getRequiredEnvironmentAssetNames()) {
        if (!assetNames.length || !this.gltfLoader) {
            return {
                progress: 1,
                loaded: 0,
                total: 0,
                assetName: 'Stage scenery ready'
            };
        }

        const completed = assetNames.filter(assetName => {
            const state = this.getEnvironmentModelLoadState(assetName);
            return state.ready || state.failed;
        }).length;
        const combinedProgress = assetNames.reduce((sum, assetName) => {
            return sum + this.getSingleEnvironmentLoadRatio(assetName);
        }, 0) / assetNames.length;
        const activeAsset = assetNames.find(assetName => {
            const state = this.getEnvironmentModelLoadState(assetName);
            return state.started && !state.ready && !state.failed;
        }) || assetNames.find(assetName => {
            const state = this.getEnvironmentModelLoadState(assetName);
            return !state.ready && !state.failed;
        });

        return {
            progress: Math.min(1, combinedProgress),
            loaded: completed,
            total: assetNames.length,
            assetName: activeAsset ? this.getEnvironmentAssetLabel(activeAsset) : 'Stage scenery ready'
        };
    }

    preloadEnvironmentModels(stageId = this.currentStageId, onProgress = () => {}) {
        const assetNames = this.getRequiredEnvironmentAssetNames(stageId);
        const emitProgress = assetName => {
            const progress = this.getEnvironmentLoadProgress(assetNames);
            onProgress({
                ...progress,
                assetName: assetName ? this.getEnvironmentAssetLabel(assetName) : progress.assetName
            });
        };

        emitProgress(null);

        if (!this.gltfLoader || !assetNames.length) {
            onProgress({
                progress: 1,
                loaded: assetNames.length,
                total: assetNames.length,
                assetName: 'Stage scenery ready'
            });
            return Promise.resolve([]);
        }

        return Promise.allSettled(assetNames.map(assetName => {
            return this.loadEnvironmentModel(assetName, () => emitProgress(assetName));
        })).then(results => {
            onProgress({
                progress: 1,
                loaded: assetNames.length,
                total: assetNames.length,
                assetName: 'Stage scenery ready'
            });
            return results;
        });
    }

    preloadRaceAssets(stageId = this.currentStageId, onProgress = () => {}) {
        const hasStageAssets = this.getRequiredEnvironmentAssetNames(stageId).length > 0;
        const vehicleWeight = hasStageAssets ? 0.68 : 1;
        const stageWeight = hasStageAssets ? 0.32 : 0;

        return this.preloadVehicleModels(details => {
            onProgress({
                ...details,
                progress: details.progress * vehicleWeight
            });
        }).then(vehicleResults => {
            if (!hasStageAssets) {
                onProgress({
                    progress: 1,
                    assetName: 'Grid ready'
                });
                return vehicleResults;
            }

            return this.preloadEnvironmentModels(stageId, details => {
                onProgress({
                    ...details,
                    progress: vehicleWeight + details.progress * stageWeight
                });
            }).then(environmentResults => [...vehicleResults, ...environmentResults]);
        }).then(results => {
            onProgress({
                progress: 1,
                assetName: 'Grid ready'
            });
            return results;
        });
    }

    loadEnvironmentModel(assetName, onProgress = () => {}) {
        const asset = this.environmentModelAssets[assetName];
        if (!asset) {
            return Promise.reject(new Error(`Unknown environment model: ${assetName}`));
        }

        if (!this.gltfLoader) {
            return Promise.reject(new Error('GLTFLoader is not available.'));
        }

        const state = this.getEnvironmentModelLoadState(assetName);

        if (this.environmentModelCache[assetName]) {
            onProgress({
                assetName: this.getEnvironmentAssetLabel(assetName),
                progress: this.getSingleEnvironmentLoadRatio(assetName),
                loaded: state.loaded,
                total: state.total
            });
            return this.environmentModelCache[assetName];
        }

        this.environmentModelCache[assetName] = new Promise((resolve, reject) => {
            state.started = true;
            state.failed = false;
            onProgress({
                assetName: this.getEnvironmentAssetLabel(assetName),
                progress: this.getSingleEnvironmentLoadRatio(assetName),
                loaded: state.loaded,
                total: state.total
            });

            this.gltfLoader.load(
                asset.url,
                gltf => {
                    state.ready = true;
                    state.loaded = state.total || state.loaded || 1;
                    state.total = state.total || state.loaded;
                    this.prepareEnvironmentModel(gltf.scene, assetName);
                    this.environmentModelScenes[assetName] = gltf.scene;
                    onProgress({
                        assetName: this.getEnvironmentAssetLabel(assetName),
                        progress: 1,
                        loaded: state.loaded,
                        total: state.total
                    });
                    resolve(gltf.scene);
                },
                event => {
                    state.started = true;
                    state.loaded = event.loaded || state.loaded;
                    state.total = event.total || state.total;
                    onProgress({
                        assetName: this.getEnvironmentAssetLabel(assetName),
                        progress: this.getSingleEnvironmentLoadRatio(assetName),
                        loaded: state.loaded,
                        total: state.total
                    });
                },
                error => {
                    state.failed = true;
                    onProgress({
                        assetName: this.getEnvironmentAssetLabel(assetName),
                        progress: 1,
                        loaded: state.loaded,
                        total: state.total
                    });
                    reject(error);
                }
            );
        });

        return this.environmentModelCache[assetName];
    }

    prepareEnvironmentModel(model, assetName) {
        model.name = `${assetName}-source`;
        model.traverse(child => {
            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.keepGeometry = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(material => {
                if (material) {
                    material.userData.keepTextureMaps = true;
                    if ('roughness' in material) {
                        material.roughness = Math.max(material.roughness || 0.5, 0.72);
                    }
                    if ('metalness' in material) {
                        material.metalness = Math.min(material.metalness || 0, 0.08);
                    }
                }
            });
        });
    }

    getStageEnvironmentAssets(stageId = this.currentStageId) {
        const collection = {};
        this.getRequiredEnvironmentAssetNames(stageId).forEach(assetName => {
            const scene = this.environmentModelScenes[assetName];
            const asset = this.environmentModelAssets[assetName];
            if (scene && asset) {
                collection[asset.key || assetName] = {
                    scene,
                    assetName,
                    label: asset.label
                };
            }
        });
        return collection;
    }

    prepareAssetVehicleModel(model, type, palette, assetSpec) {
        model.name = `${type}-mesh-model`;
        this.removeAssetNodesByName(model, assetSpec.omitNames || []);
        if (assetSpec.asset === 'passengerPack' && assetSpec.variant) {
            this.extractPassengerPackVariant(model, assetSpec.variant);
        }
        model.rotation.y = assetSpec.yaw || 0;

        model.traverse(child => {
            if (assetSpec.asset === 'carConcept' && /^WheelFront[LR]$/i.test(child.name || '')) {
                child.rotation.set(0, 0, 0);
            }

            if (this.isAssetSteeringWheelTarget(child.name || '')) {
                this.prepareAssetSteeringWheelObject(child, type);
            }

            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.keepGeometry = true;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            const clonedMaterials = materials.map(material => this.cloneAssetMaterial(material, palette, type, child.name || ''));
            child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];

            const name = `${child.name || ''} ${child.material.name || ''}`;
            if (this.isAssetWheelName(name)) {
                this.prepareAssetWheelMesh(child, name);
            }
            if (this.isAssetSteeringWheelTarget(name)) {
                this.prepareAssetSteeringWheelObject(child, type);
            }

            const dashboardConfig = this.getAssetDashboardDisplayConfig(
                type,
                child.name || '',
                Array.isArray(child.material)
                    ? child.material.map(material => material?.name || '').join(' ')
                    : child.material?.name || ''
            );
            if (dashboardConfig) {
                this.prepareAssetDashboardDisplayMesh(child, dashboardConfig);
            }
        });

        this.normalizeAssetVehicle(model, assetSpec);
    }

    removeAssetNodesByName(root, names = []) {
        if (!names.length) {
            return;
        }

        const normalizedNames = names.map(name => this.normalizeAssetName(name));
        const removals = [];
        root.traverse(child => {
            if (child === root) {
                return;
            }

            const normalized = this.normalizeAssetName(child.name || '');
            if (normalizedNames.some(name => normalized === name || normalized.startsWith(`${name} `))) {
                removals.push(child);
            }
        });

        removals.forEach(child => {
            if (child.parent) {
                child.parent.remove(child);
            }
        });
    }

    extractPassengerPackVariant(model, variant) {
        const variantConfig = this.getPassengerPackVariantConfig(variant);
        if (!variantConfig) {
            return;
        }

        model.updateMatrixWorld(true);
        const body = this.findAssetObjectByNormalizedName(model, variantConfig.body);
        if (!body || !body.parent) {
            console.warn(`Passenger car pack variant not found: ${variant}`);
            return;
        }

        const packRoot = body.parent;
        const bodyBox = new THREE.Box3().setFromObject(body);
        if (bodyBox.isEmpty()) {
            return;
        }

        const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
        const wheelGroups = [];
        packRoot.children.forEach(child => {
            if (child === body || !this.isPassengerPackWheelGroup(child)) {
                return;
            }

            const box = new THREE.Box3().setFromObject(child);
            if (box.isEmpty()) {
                return;
            }

            const center = box.getCenter(new THREE.Vector3());
            const xzDistance = Math.hypot(center.x - bodyCenter.x, center.z - bodyCenter.z);
            wheelGroups.push({ object: child, xzDistance });
        });

        const selectedWheels = wheelGroups
            .sort((a, b) => a.xzDistance - b.xzDistance)
            .slice(0, 4)
            .map(entry => entry.object);
        const keep = new Set([body, ...selectedWheels]);

        [...packRoot.children].forEach(child => {
            if (!keep.has(child)) {
                packRoot.remove(child);
            }
        });

        this.normalizePassengerPackOrientation(packRoot, selectedWheels, variantConfig);
    }

    getPassengerPackVariantConfig(variant) {
        const variants = {
            compact: { body: 'compact body', frontHint: [0, 1] },
            coupe: { body: 'coupe body', frontHint: [1, 0] },
            hatchback: { body: 'hatchback body', frontHint: [0, 1] },
            minivan: { body: 'minivan body', frontHint: [1, 0] },
            offroad: { body: 'offroad body', frontHint: [1, 0] },
            pickup: { body: 'pickup body', frontHint: [0, 1] },
            sedan: { body: 'sedan body', frontHint: [0, 1] },
            sport: { body: 'sport body', frontHint: [-0.58, 0.82] },
            suv: { body: 'suv body', frontHint: [1, -0.25] },
            wagon: { body: 'wagon body', frontHint: [0.58, 0.82] }
        };
        return variants[variant] || null;
    }

    findAssetObjectByNormalizedName(root, targetName) {
        const normalizedTarget = this.normalizeAssetName(targetName);
        let found = null;
        root.traverse(child => {
            if (!found && this.normalizeAssetName(child.name || '') === normalizedTarget) {
                found = child;
            }
        });
        return found;
    }

    isPassengerPackWheelGroup(object) {
        if (!object || object.isMesh) {
            return false;
        }

        return /^wheel/i.test(object.name || '')
            && object.children?.some(child => this.isAssetWheelName(`${child.name || ''} ${child.material?.name || ''}`));
    }

    normalizePassengerPackOrientation(packRoot, wheelGroups, variantConfig) {
        if (!packRoot || !wheelGroups?.length) {
            return;
        }

        packRoot.updateMatrixWorld(true);
        const wheelCenters = wheelGroups.map(wheel => {
            const box = new THREE.Box3().setFromObject(wheel);
            return box.getCenter(new THREE.Vector3());
        });
        const longAxis = this.getPassengerPackLongAxis(wheelCenters);
        if (!longAxis) {
            return;
        }

        const frontHint = new THREE.Vector2(
            variantConfig.frontHint?.[0] || 0,
            variantConfig.frontHint?.[1] || 0
        );
        if (frontHint.lengthSq() > 0.000001) {
            frontHint.normalize();
            if (longAxis.dot(frontHint) < 0) {
                longAxis.multiplyScalar(-1);
            }
        }

        const sourceFrontAngle = Math.atan2(longAxis.x, longAxis.y);
        packRoot.rotation.y -= sourceFrontAngle;
        packRoot.updateMatrixWorld(true);
    }

    getPassengerPackLongAxis(points) {
        if (!points || points.length < 2) {
            return null;
        }

        const center = points.reduce((sum, point) => {
            sum.x += point.x;
            sum.y += point.z;
            return sum;
        }, new THREE.Vector2()).multiplyScalar(1 / points.length);
        let xx = 0;
        let xz = 0;
        let zz = 0;

        points.forEach(point => {
            const x = point.x - center.x;
            const z = point.z - center.y;
            xx += x * x;
            xz += x * z;
            zz += z * z;
        });

        const angle = 0.5 * Math.atan2(2 * xz, xx - zz);
        const axis = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
        return axis.lengthSq() > 0.000001 ? axis.normalize() : null;
    }

    normalizeAssetName(name = '') {
        return name
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .toLowerCase();
    }

    hasAssetNameToken(name, tokens) {
        const normalized = this.normalizeAssetName(name);
        return tokens.some(token => {
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(^|\\s)${escapedToken}(s)?(?=\\s|$|\\d)`).test(normalized);
        });
    }

    isAssetWheelName(name) {
        const normalized = this.normalizeAssetName(name);
        if (/(^|\s)(body|glass|optics)(?=\s|$|\d)/.test(normalized)
            && !this.hasAssetNameToken(normalized, ['tire', 'tyre', 'rubber', 'rim', 'wheek'])) {
            return false;
        }

        return !/(^|\s)steering(?=\s|$)/.test(normalized)
            && (
                this.hasAssetNameToken(normalized, ['wheel', 'wheek', 'tire', 'tyre', 'rim'])
                || /(^|\s)tire\s*tread(?=\s|$|\d)/.test(normalized)
                || /(^|\s)tiretread(?=\s|$|\d)/.test(normalized)
                || /(^|\s)(front|rear|back)\s*wheels?(?=\s|$|\d)/.test(normalized)
            );
    }

    isAssetSteeringWheelTarget(name) {
        const normalized = this.normalizeAssetName(name);
        return normalized === 'steering wheel'
            || /(^|\s)interior steering cylinder(?=\s|$)/.test(normalized);
    }

    getAssetSteeringWheelConfig(type, name = '') {
        const normalized = this.normalizeAssetName(name);
        const config = {
            axis: 'y',
            direction: /interior steering/i.test(normalized) ? -1 : 1
        };

        if (type === 'rally' && /(^|\s)interior steering cylinder(?=\s|$)/.test(normalized)) {
            config.direction = 1;
            config.baseAxisValue = 0;
        }

        return config;
    }

    prepareAssetSteeringWheelObject(object, type = '') {
        if (object.userData.assetSteeringWheel) {
            return;
        }

        const config = this.getAssetSteeringWheelConfig(type, object.name || '');
        object.userData.assetSteeringWheel = true;
        object.userData.assetSteeringBaseRotation = object.rotation.clone();
        object.userData.assetSteeringAxis = config.axis || 'y';
        if (Number.isFinite(config.baseAxisValue)) {
            object.userData.assetSteeringBaseRotation[object.userData.assetSteeringAxis] = config.baseAxisValue;
        }
        object.rotation[object.userData.assetSteeringAxis] = object.userData.assetSteeringBaseRotation[object.userData.assetSteeringAxis];
        object.userData.assetSteeringDirection = config.direction ?? 1;
        object.userData.assetSteeringVisualAngle = 0;
    }

    getAssetDashboardDisplayConfig(type, meshName = '', materialName = '') {
        const normalizedMesh = this.normalizeAssetName(meshName);
        const normalizedMaterial = this.normalizeAssetName(materialName);

        if (type === 'rally' && (
            normalizedMesh === 'interior steering dash'
            || normalizedMaterial === 'dashboard'
        )) {
            return {
                style: 'rallyTelemetry',
                emissiveIntensity: 1.22
            };
        }

        return null;
    }

    prepareAssetDashboardDisplayMesh(mesh, config) {
        if (mesh.userData.assetDashboardDisplay) {
            return;
        }

        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (!material) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        if ('colorSpace' in texture && THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }

        material.map = null;
        material.emissiveMap = texture;
        material.userData.keepTextureMaps = false;
        if (material.color) {
            material.color.setHex(0x000000);
        }
        if (material.emissive) {
            material.emissive.setHex(0xffffff);
        }
        material.emissiveIntensity = config.emissiveIntensity || 1;
        material.transparent = false;
        material.opacity = 1;
        material.toneMapped = false;
        if ('metalness' in material) {
            material.metalness = 0;
        }
        if ('roughness' in material) {
            material.roughness = 0.28;
        }
        material.needsUpdate = true;

        mesh.userData.assetDashboardDisplay = {
            style: config.style,
            mesh,
            material,
            canvas,
            context,
            texture,
            lastSpeedKmh: null,
            lastStatus: '',
            lastRpmRatio: null
        };

        this.drawAssetDashboardDisplay(mesh.userData.assetDashboardDisplay, {
            speedKmh: 0,
            speedRatio: 0,
            accelerating: false,
            status: 'READY'
        });
    }

    drawAssetDashboardDisplay(display, data) {
        if (!display?.context || !display?.canvas) {
            return;
        }

        const speedKmh = Math.max(0, Math.round(data.speedKmh || 0));
        const status = data.status || 'READY';
        const rpmRatio = THREE.MathUtils.clamp(data.speedRatio || 0, 0, 1);
        if (
            display.lastSpeedKmh === speedKmh
            && display.lastStatus === status
            && display.lastRpmRatio !== null
            && Math.abs(display.lastRpmRatio - rpmRatio) < 0.02
        ) {
            return;
        }

        display.lastSpeedKmh = speedKmh;
        display.lastStatus = status;
        display.lastRpmRatio = rpmRatio;

        if (display.style === 'rallyTelemetry') {
            this.drawRallyDashboardDisplay(display, {
                speedKmh,
                speedRatio: rpmRatio,
                accelerating: Boolean(data.accelerating),
                status
            });
        }

        display.texture.needsUpdate = true;
    }

    drawRallyDashboardDisplay(display, data) {
        const { canvas, context } = display;
        const width = canvas.width;
        const height = canvas.height;
        const accent = '#ff8a1f';
        const accentSoft = '#ffb562';
        const dark = '#050608';
        const glow = '#ff7a00';
        const speedText = String(data.speedKmh).padStart(3, '0');
        const rpmSegments = 11;
        const rpmActive = Math.max(1, Math.round((data.speedRatio * 0.82 + (data.accelerating ? 0.14 : 0.04)) * rpmSegments));

        context.clearRect(0, 0, width, height);
        const background = context.createLinearGradient(0, 0, 0, height);
        background.addColorStop(0, '#090b10');
        background.addColorStop(1, dark);
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = accent;
        context.lineWidth = 8;
        context.beginPath();
        context.moveTo(118, 78);
        context.lineTo(906, 78);
        context.lineTo(968, 152);
        context.lineTo(968, 430);
        context.lineTo(56, 430);
        context.lineTo(56, 152);
        context.closePath();
        context.stroke();

        context.fillStyle = 'rgba(255, 138, 31, 0.08)';
        context.fill();

        context.fillStyle = accent;
        context.shadowColor = glow;
        context.shadowBlur = 18;
        context.font = '700 34px "Arial Narrow", Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText('fuel', 170, 458);
        context.fillText('engine RPM', 360, 458);
        context.fillText('acceleration', 514, 458);
        context.fillText('speed km/h', 653, 458);
        context.fillText('temperature', 880, 458);

        context.font = '900 156px "Arial Narrow", Arial, sans-serif';
        context.fillText(speedText, 650, 248);

        context.font = '800 34px "Arial Narrow", Arial, sans-serif';
        context.fillText(status, 650, 328);

        context.shadowBlur = 12;
        const rpmBarX = 306;
        const rpmBarY = 120;
        const rpmBarHeight = 210;
        const rpmGap = 8;
        const rpmWidth = 28;
        for (let i = 0; i < rpmSegments; i++) {
            const segmentHeight = (rpmBarHeight - rpmGap * (rpmSegments - 1)) / rpmSegments;
            const y = rpmBarY + (rpmSegments - 1 - i) * (segmentHeight + rpmGap);
            const active = i < rpmActive;
            context.fillStyle = active ? accentSoft : 'rgba(255, 138, 31, 0.18)';
            context.fillRect(rpmBarX, y, rpmWidth, segmentHeight);
        }

        context.fillStyle = data.accelerating ? accentSoft : 'rgba(255, 138, 31, 0.22)';
        context.fillRect(458, 128, 34, 194 * (data.accelerating ? 1 : 0.36));

        const tempX = 876;
        context.strokeStyle = accentSoft;
        context.lineWidth = 10;
        context.beginPath();
        context.moveTo(tempX, 118);
        context.lineTo(tempX, 314);
        context.stroke();

        context.fillStyle = accentSoft;
        context.fillRect(136, 292, 52, 28);
        context.fillRect(136, 248, 52, 28);
        context.fillStyle = 'rgba(255, 181, 98, 0.2)';
        context.fillRect(136, 204, 52, 28);
        context.shadowBlur = 0;
    }

    prepareAssetWheelMesh(mesh, name) {
        const normalizedName = this.normalizeAssetName(name);
        mesh.userData.assetWheel = true;
        mesh.userData.isFront = /(^|\s)front(?=\s|$)/.test(normalizedName);
        mesh.userData.assetWheelCanSpin = false;

        if (!mesh.geometry) {
            return;
        }

        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        if (!box) {
            return;
        }

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const dimensions = [
            { axis: 'x', value: size.x },
            { axis: 'y', value: size.y },
            { axis: 'z', value: size.z }
        ].sort((a, b) => b.value - a.value);
        const largest = dimensions[0].value;
        const secondLargest = dimensions[1].value;
        const smallest = dimensions[2];
        const hasSingleWheelShape = secondLargest > 0.001 && largest / secondLargest < 1.48;

        mesh.userData.assetWheelCanSpin = hasSingleWheelShape;
        mesh.userData.assetWheelSpinAxis = smallest.axis;
        mesh.userData.assetWheelSpin = 0;
        mesh.userData.assetWheelBaseRotation = mesh.rotation.clone();

        if (!hasSingleWheelShape || center.lengthSq() < 0.000001) {
            return;
        }

        const offset = center.clone().multiply(mesh.scale).applyQuaternion(mesh.quaternion);
        mesh.geometry = mesh.geometry.clone();
        mesh.geometry.translate(-center.x, -center.y, -center.z);
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
        mesh.position.add(offset);
        mesh.userData.keepGeometry = false;
    }

    cloneAssetMaterial(material, palette, type, meshName = '') {
        const cloned = material.clone();
        const name = `${meshName} ${cloned.name || ''}`;
        const normalizedName = this.normalizeAssetName(name);
        cloned.userData.keepTextureMaps = true;
        cloned.envMapIntensity = Math.max(cloned.envMapIntensity || 0, 0.9);

        const isGlass = /glass|window|windshield/.test(normalizedName);
        const isTire = this.hasAssetNameToken(name, ['tire', 'tyre', 'rubber', 'wheel', 'wheek']);
        const isRim = this.hasAssetNameToken(name, ['rim', 'disc', 'brake']);
        const isLight = /headlight|brakelight|signallight|taillight|optics|lights/.test(normalizedName);
        const isApexGraphitePanel = type === 'apexGt'
            && /plastic smooth/.test(normalizedName);
        const isApexDarkBlocker = type === 'apexGt'
            && /blocker/.test(normalizedName);
        const usesAuthoredPaint = this.vehicleAssetSpecs[type]?.asset === 'passengerPack'
            || type === 'apexGt';
        const isPaint = /paint|body|panel|toycar|truck|sportscar|suv|orange|white|body color/.test(normalizedName)
            && !isGlass
            && !isTire
            && !isLight;

        if (isPaint && cloned.color && !usesAuthoredPaint) {
            cloned.map = null;
            if (cloned.aoMap) {
                cloned.aoMapIntensity = 1.05;
            }
            if (cloned.normalMap && cloned.normalScale) {
                cloned.normalScale.set(1.35, 1.35);
            }
            cloned.color.copy(this.getAssetPaintColor(palette.body, normalizedName, type));
            if ('metalness' in cloned) {
                cloned.metalness = Math.max(cloned.metalness || 0, 0.28);
            }
            if ('roughness' in cloned) {
                cloned.roughness = Math.min(cloned.roughness || 0.36, 0.36);
            }
            if ('clearcoat' in cloned) {
                cloned.clearcoat = Math.max(cloned.clearcoat || 0, 0.5);
                cloned.clearcoatRoughness = Math.min(cloned.clearcoatRoughness || 0.24, 0.24);
            }
            if (cloned.emissive) {
                cloned.emissive.setHex(0x000000);
                cloned.emissiveIntensity = 0;
            }
            cloned.envMapIntensity = 1.15;
        } else if (isApexGraphitePanel && cloned.color) {
            cloned.map = null;
            cloned.color.setHex(0x080d13);
            cloned.transparent = false;
            cloned.opacity = 1;
            cloned.depthWrite = true;
            cloned.envMapIntensity = 0.42;
            if ('roughness' in cloned) {
                cloned.roughness = 0.68;
            }
            if ('metalness' in cloned) {
                cloned.metalness = 0.02;
            }
            if ('clearcoat' in cloned) {
                cloned.clearcoat = Math.max(cloned.clearcoat || 0, 0.12);
                cloned.clearcoatRoughness = Math.min(cloned.clearcoatRoughness || 0.5, 0.5);
            }
        } else if (isApexDarkBlocker && cloned.color) {
            cloned.map = null;
            cloned.color.setHex(0x020407);
            cloned.transparent = false;
            cloned.opacity = 1;
            cloned.depthWrite = true;
            cloned.envMapIntensity = 0;
            if ('roughness' in cloned) {
                cloned.roughness = 0.92;
            }
            if ('metalness' in cloned) {
                cloned.metalness = 0;
            }
        } else if (isGlass && cloned.color) {
            const useApexDarkGlass = type === 'apexGt';
            cloned.color.setHex(useApexDarkGlass ? 0x03080c : 0x172b3d);
            cloned.transparent = true;
            cloned.opacity = useApexDarkGlass ? 0.86 : Math.min(cloned.opacity || 0.8, 0.68);
            cloned.userData.isVehicleGlass = true;
            cloned.userData.cockpitBaseOpacity = cloned.opacity;
            cloned.userData.cockpitBaseTransparent = cloned.transparent;
            cloned.userData.cockpitBaseDepthWrite = cloned.depthWrite;
            cloned.envMapIntensity = useApexDarkGlass ? 1.15 : 1.7;
            if ('roughness' in cloned) {
                cloned.roughness = useApexDarkGlass ? 0.18 : 0.05;
            }
            if ('metalness' in cloned) {
                cloned.metalness = useApexDarkGlass ? 0.02 : Math.max(cloned.metalness || 0, 0.08);
            }
        } else if (isTire && cloned.color) {
            cloned.color.offsetHSL(0, -0.04, -0.05);
            cloned.envMapIntensity = 0.45;
            if (cloned.normalMap && cloned.normalScale) {
                cloned.normalScale.set(1.18, 1.18);
            }
        } else if (isRim && cloned.color) {
            cloned.envMapIntensity = 1.65;
            if ('metalness' in cloned) {
                cloned.metalness = Math.max(cloned.metalness || 0, 0.72);
            }
            if ('roughness' in cloned) {
                cloned.roughness = Math.min(cloned.roughness || 0.24, 0.24);
            }
        } else if (isLight && cloned.emissive) {
            cloned.emissiveIntensity = Math.max(cloned.emissiveIntensity || 0.4, 0.65);
        }

        if (type === 'supercar' && isPaint && cloned.color) {
            cloned.color.offsetHSL(0.02, 0.06, 0.03);
        }

        cloned.needsUpdate = true;
        return cloned;
    }

    getAssetPaintColor(baseHex, materialName, type) {
        const color = new THREE.Color(baseHex);
        let lightnessOffset = -0.15;
        let saturationOffset = -0.02;

        if (/paint 2|panel sides|underside|bodyunderside/.test(materialName)) {
            lightnessOffset = -0.24;
            saturationOffset = -0.05;
        } else if (/pearl/.test(materialName)) {
            lightnessOffset = -0.08;
            saturationOffset = -0.06;
        } else if (/graphite/.test(materialName)) {
            lightnessOffset = -0.28;
            saturationOffset = -0.08;
        }

        if (type === 'hatchback') {
            lightnessOffset -= 0.03;
        } else if (type === 'muscle') {
            saturationOffset += 0.04;
        }

        color.offsetHSL(0, saturationOffset, lightnessOffset);
        return color;
    }

    normalizeAssetVehicle(model, assetSpec) {
        model.updateMatrixWorld(true);
        const sourceBox = new THREE.Box3().setFromObject(model);
        const sourceSize = sourceBox.getSize(new THREE.Vector3());
        const widthScale = assetSpec.width / Math.max(sourceSize.x, 0.001);
        const lengthScale = assetSpec.length / Math.max(sourceSize.z, 0.001);
        const heightScale = (assetSpec.height || sourceSize.y) / Math.max(sourceSize.y, 0.001);
        const scale = assetSpec.scaleBasis === 'height'
            ? heightScale
            : assetSpec.scaleBasis === 'length'
                ? lengthScale
                : Math.min(widthScale, lengthScale, heightScale);

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
        this.cacheVehicleWheelContactPoints(car);

        return car;
    }

    animateVehicleWheels(car, amount, steeringAngle = 0) {
        if (!car || !car.userData.wheels) {
            return;
        }

        car.userData.wheels.forEach(wheel => {
            if (wheel.userData.assetWheel) {
                const baseRotation = wheel.userData.assetWheelBaseRotation || wheel.rotation;
                const spinAxis = wheel.userData.assetWheelSpinAxis || 'x';
                if (wheel.userData.assetWheelCanSpin) {
                    wheel.userData.assetWheelSpin = (wheel.userData.assetWheelSpin || 0) + amount;
                    wheel.rotation[spinAxis] = baseRotation[spinAxis] + wheel.userData.assetWheelSpin;
                }
                if (wheel.userData.isFront && spinAxis !== 'y') {
                    wheel.rotation.y = baseRotation.y + steeringAngle;
                }
            } else if (wheel.userData.tire) {
                wheel.userData.tire.rotation.x += amount;
                if (wheel.userData.isFront) {
                    wheel.rotation.y = steeringAngle;
                }
            } else if (wheel.userData.isFront) {
                wheel.rotation.y = steeringAngle;
            }
        });
    }

    animateVehicleSteeringWheel(car, steeringAngle = 0, maxSteeringAngle = Math.PI / 12) {
        if (!car?.userData?.steeringWheels?.length) {
            return;
        }

        const steeringRatio = maxSteeringAngle > 0.001
            ? THREE.MathUtils.clamp(steeringAngle / maxSteeringAngle, -1, 1)
            : 0;
        const targetAngle = steeringRatio * Math.PI * 0.58;

        car.userData.steeringWheels.forEach(steeringWheel => {
            const axis = steeringWheel.userData.assetSteeringAxis || 'y';
            const baseRotation = steeringWheel.userData.assetSteeringBaseRotation || steeringWheel.rotation;
            const direction = steeringWheel.userData.assetSteeringDirection || 1;
            steeringWheel.userData.assetSteeringVisualAngle += (
                targetAngle * direction - (steeringWheel.userData.assetSteeringVisualAngle || 0)
            ) * 0.34;
            steeringWheel.rotation[axis] = baseRotation[axis] + steeringWheel.userData.assetSteeringVisualAngle;
        });
    }

    isTireContactMesh(mesh) {
        if (!mesh?.isMesh) {
            return false;
        }

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const materialNames = materials.map(material => material?.name || '').join(' ');
        const meshName = this.normalizeAssetName(mesh.name || '');
        const fullName = this.normalizeAssetName(`${mesh.name || ''} ${materialNames}`);
        const hasTread = /(^|\s)tire\s*tread(?=\s|$|\d)/.test(fullName)
            || /(^|\s)tiretread(?=\s|$|\d)/.test(fullName)
            || /(^|\s)tread(?=\s|$|\d)/.test(fullName);
        if (/(^|\s)tire\s*side(?=\s|$|\d)/.test(fullName) && !hasTread) {
            return false;
        }

        return (
            hasTread
            || /(^|\s)(tire|tyre|rubber)(?=\s|$|\d)/.test(fullName)
        )
            && !/(^|\s)(grill|grille|wiper|steering|interior|trim)(?=\s|$|\d)/.test(meshName);
    }

    cacheVehicleWheelContactPoints(vehicle) {
        if (!vehicle) {
            return [];
        }

        vehicle.updateMatrixWorld(true);
        const inverseVehicleMatrix = vehicle.matrixWorld.clone().invert();
        const contactPoints = [];
        vehicle.traverse(child => {
            if (!this.isTireContactMesh(child)) {
                return;
            }

            const box = new THREE.Box3().setFromObject(child);
            if (box.isEmpty()) {
                return;
            }

            const bottomWorld = new THREE.Vector3(
                (box.min.x + box.max.x) * 0.5,
                box.min.y,
                (box.min.z + box.max.z) * 0.5
            );
            const bottomLocal = bottomWorld.applyMatrix4(inverseVehicleMatrix);
            contactPoints.push(bottomLocal);
        });

        if (contactPoints.length === 0 && vehicle.userData.wheels?.length) {
            vehicle.userData.wheels.forEach(wheel => {
                const box = new THREE.Box3().setFromObject(wheel);
                if (box.isEmpty()) {
                    return;
                }

                const bottomWorld = new THREE.Vector3(
                    (box.min.x + box.max.x) * 0.5,
                    box.min.y,
                    (box.min.z + box.max.z) * 0.5
                );
                contactPoints.push(bottomWorld.applyMatrix4(inverseVehicleMatrix));
            });
        }

        vehicle.userData.wheelContactPoints = contactPoints;
        const assetSpec = this.vehicleAssetSpecs[vehicle.userData.vehicleType];
        const contactPointYOffset = assetSpec?.contactPointYOffset || 0;
        if (contactPointYOffset) {
            vehicle.userData.wheelContactPoints.forEach(point => {
                point.y += contactPointYOffset;
            });
        }
        this.cacheVehicleGroundProbePoints(vehicle);
        return contactPoints;
    }

    cacheVehicleGroundProbePoints(vehicle) {
        if (!vehicle) {
            return [];
        }

        vehicle.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(vehicle);
        if (box.isEmpty()) {
            vehicle.userData.groundProbePoints = vehicle.userData.wheelContactPoints || [];
            return vehicle.userData.groundProbePoints;
        }

        const inverseVehicleMatrix = vehicle.matrixWorld.clone().invert();
        const xs = [box.min.x, (box.min.x + box.max.x) * 0.5, box.max.x];
        const ys = [box.min.y, box.max.y];
        const zs = [box.min.z, (box.min.z + box.max.z) * 0.5, box.max.z];
        const probePoints = [];
        xs.forEach(x => {
            ys.forEach(y => {
                zs.forEach(z => {
                    probePoints.push(new THREE.Vector3(x, y, z).applyMatrix4(inverseVehicleMatrix));
                });
            });
        });

        vehicle.userData.groundProbePoints = [
            ...(vehicle.userData.wheelContactPoints || []),
            ...probePoints
        ];
        return vehicle.userData.groundProbePoints;
    }

    keepVehicleAboveRoadSurface(vehicle, padding = 0.028, maxLift = 4) {
        if (!vehicle || !this.game?.road) {
            return 0;
        }

        if (!vehicle.userData.groundProbePoints?.length) {
            this.cacheVehicleWheelContactPoints(vehicle);
        }

        const probePoints = vehicle.userData.groundProbePoints || vehicle.userData.wheelContactPoints || [];
        if (!probePoints.length) {
            return 0;
        }

        vehicle.updateMatrixWorld(true);
        const liftNeeded = probePoints.reduce((highestLift, localPoint) => {
            const worldPoint = vehicle.localToWorld(localPoint.clone());
            const roadProgressZ = Number.isFinite(vehicle.userData?.roadProgressZ) ? vehicle.userData.roadProgressZ : worldPoint.z;
            const roadData = getRoadDataAtZ(roadProgressZ, this.game);
            return Math.max(highestLift, (roadData.y + padding) - worldPoint.y);
        }, 0);
        const lift = THREE.MathUtils.clamp(liftNeeded, 0, maxLift);
        if (lift > 0) {
            vehicle.position.y += lift;
            vehicle.updateMatrixWorld(true);
        }
        vehicle.userData.lastGroundLift = lift;
        return lift;
    }

    settleVehicleRoadContact(vehicle, iterations = 4) {
        if (!vehicle || !this.game?.road) {
            return 0;
        }

        let totalCorrection = 0;
        for (let i = 0; i < iterations; i++) {
            const correction = this.alignVehicleToRoadSurface(vehicle);
            totalCorrection += correction;
            if (Math.abs(correction) < 0.002) {
                break;
            }
        }
        return totalCorrection;
    }

    alignVehicleToRoadSurface(vehicle, contactPadding = -0.018) {
        if (!vehicle || !this.game?.road) {
            return 0;
        }

        if (!vehicle.userData.wheelContactPoints?.length) {
            this.cacheVehicleWheelContactPoints(vehicle);
        }

        const contactPoints = vehicle.userData.wheelContactPoints || [];
        if (contactPoints.length === 0) {
            return 0;
        }

        vehicle.updateMatrixWorld(true);
        const corrections = contactPoints.map(localPoint => {
            const worldPoint = vehicle.localToWorld(localPoint.clone());
            const roadProgressZ = Number.isFinite(vehicle.userData?.roadProgressZ) ? vehicle.userData.roadProgressZ : worldPoint.z;
            const roadData = getRoadDataAtZ(roadProgressZ, this.game);
            return (roadData.y + contactPadding) - worldPoint.y;
        });
        const averageCorrection = corrections.reduce((sum, correction) => sum + correction, 0) / corrections.length;
        const antiFloatCorrection = Math.min(...corrections);
        const correction = Math.min(averageCorrection, antiFloatCorrection);
        const clampedCorrection = THREE.MathUtils.clamp(correction, -0.16, 0.16);
        vehicle.position.y += clampedCorrection;
        vehicle.updateMatrixWorld(true);
        vehicle.userData.lastGroundCorrection = clampedCorrection;
        return clampedCorrection;
    }

    getVehicleRoadContactDiagnostics(vehicle) {
        if (!vehicle || !this.game?.road) {
            return null;
        }

        if (!vehicle.userData.wheelContactPoints?.length) {
            this.cacheVehicleWheelContactPoints(vehicle);
        }

        const contactPoints = vehicle.userData.wheelContactPoints || [];
        if (!contactPoints.length) {
            return {
                count: 0,
                min: null,
                max: null,
                avg: null,
                lastCorrection: Number((vehicle.userData.lastGroundCorrection || 0).toFixed(4))
            };
        }

        vehicle.updateMatrixWorld(true);
        const gaps = contactPoints.map(localPoint => {
            const worldPoint = vehicle.localToWorld(localPoint.clone());
            const roadData = getRoadDataAtZ(worldPoint.z, this.game);
            return worldPoint.y - roadData.y;
        });
        const min = Math.min(...gaps);
        const max = Math.max(...gaps);
        const avg = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
        return {
            count: gaps.length,
            min: Number(min.toFixed(4)),
            max: Number(max.toFixed(4)),
            avg: Number(avg.toFixed(4)),
            lastCorrection: Number((vehicle.userData.lastGroundCorrection || 0).toFixed(4))
        };
    }

    getRandomTrafficType() {
        return this.trafficVehicleTypes[Math.floor(Math.random() * this.trafficVehicleTypes.length)];
    }

    getRandomTrafficPaint() {
        return this.trafficPaints[Math.floor(Math.random() * this.trafficPaints.length)];
    }


    createInitialTrafficCars() {
        if (this.game?.settings?.raceModeId === 'race') {
            this.createRaceGrid();
            return;
        }

        for (let i = 0; i < this.getTrafficTargetCount(); i++) {
            this.createTrafficCar();
        }
    }

    createRaceGrid() {
        const count = this.getRaceCompetitorCount();
        const laneCount = 2;
        const laneSpacing = Math.min(5.2, Math.max(3.6, this.game.road.width * 0.22));
        const rowSpacing = 11.5;
        const startZ = this.game.startLine + 7.5;
        const difficulty = this.getDifficultyProfile(this.game?.settings?.difficultyId || this.difficultyLevel);
        const gridTuning = this.getGridRaceTuning(difficulty.id);
        const playerMaxSpeed = this.game?.car?.maxSpeed || this.getVehicleSpec(this.getPlayerVehicleType()).maxSpeed || 2.5;

        for (let i = 0; i < count; i++) {
            const vehicleType = this.trafficVehicleTypes[i % this.trafficVehicleTypes.length];
            const paint = this.trafficPaints[i % this.trafficPaints.length];
            const raceCar = this.createCar(paint.body, vehicleType, { palette: paint });
            const row = Math.floor(i / laneCount);
            const lane = i % laneCount;
            const side = lane === 0 ? -1 : 1;
            const xOffset = side * laneSpacing * (0.5 + (row % 2) * 0.08);
            const z = startZ + row * rowSpacing + (lane === 0 ? 0 : 3.4);
            const speedBias = THREE.MathUtils.lerp(gridTuning.speedBiasMin, gridTuning.speedBiasMax, i / Math.max(1, count - 1));
            const typePace = gridTuning.typePace[vehicleType] || 1;
            const racePace = playerMaxSpeed * gridTuning.pace * speedBias * typePace;
            const trafficState = {
                mesh: raceCar,
                speed: 0,
                baseSpeed: racePace,
                targetSpeed: racePace,
                launchBoostFrames: gridTuning.launchFrames + Math.round(i * 3),
                gridTuning,
                xOffset,
                targetXOffset: xOffset,
                baseLaneOffset: xOffset,
                lateralVelocity: 0,
                headingOffset: 0,
                yawVelocity: 0,
                contactRecoveryFrames: 0,
                impactHeadingFrames: 0,
                vehicleType,
                raceCompetitor: true,
                raceName: `Rival ${i + 1}`,
                finishedAt: null
            };

            this.placeTrafficCar(trafficState, z, xOffset, -1);
            this.scene.add(raceCar);
            this.setupStageVehicleLighting(raceCar, { player: false });
            this.trafficCars.push(trafficState);
        }
    }

    getTrafficLaneOffset() {
        const laneCenters = [-0.32, -0.12, 0.12, 0.32];
        const laneIndex = Math.floor(Math.random() * laneCenters.length);
        const jitter = (Math.random() - 0.5) * 0.8;
        const borderLimit = this.game.road.width / 2 - 2.2;

        return THREE.MathUtils.clamp(this.game.road.width * laneCenters[laneIndex] + jitter, -borderLimit, borderLimit);
    }

    isTrafficSpawnClear(z, xOffset, vehicleType, ignoredTrafficCar = null) {
        const bounds = this.getVehicleCollisionBounds(vehicleType);

        return this.trafficCars.every(other => {
            if (other === ignoredTrafficCar) {
                return true;
            }

            const otherBounds = this.getVehicleCollisionBounds(other.vehicleType);
            const zGap = Math.abs(z - (other.progressZ ?? other.mesh.position.z));
            const xGap = Math.abs(xOffset - other.xOffset);
            const minLongitudinalGap = Math.max(34, (bounds.length + otherBounds.length) * 3.2);
            const minLateralGap = (bounds.width + otherBounds.width) * 0.62;

            return !(zGap < minLongitudinalGap && xGap < minLateralGap);
        });
    }

    getTrafficSpawnPose(minZ, maxZ, vehicleType, ignoredTrafficCar = null) {
        const lastSegment = this.game.road.segments[this.game.road.segments.length - 1];
        const roadMinZ = lastSegment.z + 80;
        const roadMaxZ = this.game.startLine - 220;
        let lowerZ = Math.max(roadMinZ, Math.min(minZ, maxZ));
        let upperZ = Math.min(roadMaxZ, Math.max(minZ, maxZ));

        if (lowerZ > upperZ) {
            lowerZ = Math.max(roadMinZ, this.game.car.position.z - 1200);
            upperZ = Math.min(roadMaxZ, this.game.car.position.z - 720);
        }

        for (let attempt = 0; attempt < 80; attempt++) {
            const z = THREE.MathUtils.lerp(lowerZ, upperZ, Math.random());
            const xOffset = this.getTrafficLaneOffset();
            if (this.isTrafficSpawnClear(z, xOffset, vehicleType, ignoredTrafficCar)) {
                return { z, xOffset };
            }
        }

        const fallbackIndex = Math.max(0, this.trafficCars.indexOf(ignoredTrafficCar));
        return {
            z: THREE.MathUtils.clamp(upperZ - 48 * (fallbackIndex + 1), roadMinZ, roadMaxZ),
            xOffset: this.getTrafficLaneOffset()
        };
    }

    getRoadWorldPosition(roadData, xOffset = 0, y = roadData?.y || 0) {
        const centerX = Number.isFinite(roadData?.worldX) ? roadData.worldX : roadData?.curve || 0;
        const centerZ = Number.isFinite(roadData?.worldZ) ? roadData.worldZ : roadData?.z || 0;
        const normalX = Number.isFinite(roadData?.normalX) ? roadData.normalX : 1;
        const normalZ = Number.isFinite(roadData?.normalZ) ? roadData.normalZ : 0;
        return new THREE.Vector3(
            centerX + normalX * xOffset,
            y,
            centerZ + normalZ * xOffset
        );
    }

    placeTrafficCar(trafficCar, z, xOffset, travelDirection = 1, yawOffset = 0, roll = 0) {
        const frame = this.getVehicleRoadFrame(z, travelDirection, trafficCar.vehicleType);
        const roadData = frame.roadData;

        trafficCar.progressZ = z;
        trafficCar.xOffset = xOffset;
        trafficCar.mesh.position.copy(this.getRoadWorldPosition(
            roadData,
            xOffset,
            this.getVehicleGroundY(frame, trafficCar.vehicleType)
        ));
        trafficCar.mesh.userData.roadProgressZ = z;
        this.applyVehicleRoadPose(trafficCar.mesh, frame, yawOffset, roll);
        this.alignVehicleToRoadSurface(trafficCar.mesh);
    }

    createTrafficCar() {
        const vehicleType = this.getRandomTrafficType();
        const paint = this.getRandomTrafficPaint();
        const trafficCar = this.createCar(paint.body, vehicleType, { palette: paint });
        const lastSegment = this.game.road.segments[this.game.road.segments.length - 1];
        const spawnPose = this.getTrafficSpawnPose(lastSegment.z + 120, this.game.startLine - 260, vehicleType);
        const trafficState = {
            mesh: trafficCar,
            speed: this.getTrafficSpeed(vehicleType),
            baseSpeed: this.getVehicleSpec(vehicleType).speedBase,
            xOffset: spawnPose.xOffset,
            vehicleType
        };

        this.placeTrafficCar(trafficState, spawnPose.z, spawnPose.xOffset);
        this.scene.add(trafficCar);
        this.setupStageVehicleLighting(trafficCar, { player: false });
        this.trafficCars.push(trafficState);
    }
    resetCarPosition() {
        const playerType = this.getPlayerVehicleType();
        const startZ = this.getPlayerStartZ();
        const roadFrame = this.getVehicleRoadFrame(startZ, -1, playerType);
        const roadData = roadFrame.roadData;
        this.carPosition.copy(this.getRoadWorldPosition(roadData, 0, this.getVehicleGroundY(roadFrame, playerType)));
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, startZ);
        this.game.car.speed = 0;
        this.game.car.xOffset = 0;
        this.game.car.lateralVelocity = 0;
        this.game.car.angle = 0;
        this.game.car.driftAmount = 0;
        this.game.car.handbrakeIntensity = 0;
        this.game.car.turnEntryDrift = 0;
        this.game.car.driftSmokeCooldown = 0;
        this.game.car.angularVelocity = 0;
        this.game.car.driveYaw = roadFrame.yaw;
        this.game.car.visualYaw = roadFrame.yaw;
        this.game.car.travelAngle = 0;
        this.game.car.yawVelocity = 0;
        this.game.car.slipAngle = 0;
        this.game.car.rearGrip = 1;
        this.game.car.lastRoadYaw = roadFrame.yaw;
        this.game.car.bodyRoll = 0;
        this.game.car.steeringAngle = 0;
        this.game.car.jumpQueued = false;
        this.game.car.jumpOffset = 0;
        this.game.car.jumpVelocity = 0;
        this.game.car.jumpCooldown = 0;
        this.game.car.airborne = false;
        this.game.car.landingTractionTimer = 0;
        this.game.car.landingTractionDuration = 0;
        this.game.car.landingTractionSide = 1;
        this.game.car.landingWobblePhase = 0;
        this.game.car.landingDriftAmount = 0;
        this.game.car.lastLandingSpeedLoss = 0;

        this.playerCar.position.copy(this.carPosition);
        this.playerCar.userData.roadProgressZ = startZ;
        this.applyVehicleRoadPose(this.playerCar, roadFrame);
        this.alignVehicleToRoadSurface(this.playerCar);
        this.carPosition.copy(this.playerCar.position);
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, startZ);
        this.animateVehicleSteeringWheel(this.playerCar, 0, this.game.car.maxSteeringAngle);
    }

    getPlayerStartZ() {
        if (this.game?.settings?.raceModeId !== 'race') {
            return this.game.startLine;
        }

        const competitorCount = this.getRaceCompetitorCount();
        const laneCount = 2;
        const rowSpacing = 11.5;
        const playerRow = Math.ceil(competitorCount / laneCount);
        return this.game.startLine + 7.5 + playerRow * rowSpacing + 3.8;
    }

    createCountdownTexture(label) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const isStart = label === 'START!';
        context.fillStyle = 'rgba(42, 59, 63, 0.92)';
        context.fillRect(0, 64, canvas.width, 384);

        const stripeGradient = context.createLinearGradient(0, 0, canvas.width, 0);
        stripeGradient.addColorStop(0, 'rgba(255, 212, 71, 0.42)');
        stripeGradient.addColorStop(0.5, 'rgba(95, 226, 255, 0.3)');
        stripeGradient.addColorStop(1, 'rgba(255, 79, 95, 0.38)');
        context.fillStyle = stripeGradient;
        context.fillRect(0, 64, canvas.width, 384);

        context.save();
        context.translate(140, 0);
        context.transform(1, 0, -0.16, 1, 0, 0);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `italic 900 ${isStart ? 224 : 330}px Impact, Haettenschweiler, "Arial Black", sans-serif`;
        context.lineJoin = 'round';
        context.miterLimit = 2;
        context.lineWidth = isStart ? 38 : 44;
        context.strokeStyle = '#071017';
        context.strokeText(label, 420, 258);
        context.lineWidth = isStart ? 18 : 20;
        context.strokeStyle = '#ff4f5f';
        context.strokeText(label, 420, 258);

        const textGradient = context.createLinearGradient(0, 96, 0, 400);
        textGradient.addColorStop(0, '#ffffff');
        textGradient.addColorStop(0.42, '#ffd447');
        textGradient.addColorStop(1, '#f0544f');
        context.fillStyle = textGradient;
        context.fillText(label, 420, 258);
        context.restore();

        context.fillStyle = '#f8fbff';
        for (let i = 0; i < 8; i++) {
            const x = 54 + i * 38;
            context.fillRect(x, 82, 22, 22);
            context.fillRect(x + 19, 104, 22, 22);
            context.fillRect(canvas.width - x - 42, 386, 22, 22);
            context.fillRect(canvas.width - x - 23, 364, 22, 22);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;
        if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }
        texture.needsUpdate = true;
        return texture;
    }

    createCountdownMaterial(label, opacity = 1) {
        return new THREE.MeshBasicMaterial({
            map: this.createCountdownTexture(label),
            transparent: true,
            opacity,
            depthWrite: false,
            side: THREE.DoubleSide
        });
    }

    createStartCountdownGroup() {
        const group = new THREE.Group();
        group.name = 'start-countdown-sequence';
        const countdownLineOffset = this.currentStageId === 'valleverde' ? 64 : 18;
        const countdownZ = this.game.startLine - countdownLineOffset;
        const signWidth = 16.4;
        const signHeight = 4.8;
        const pylonHeight = 8.8;
        group.userData.countdownLineOffset = countdownLineOffset;
        group.userData.countdownProgressZ = countdownZ;

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x091019,
            metalness: 0.35,
            roughness: 0.28,
            emissive: 0x071017,
            emissiveIntensity: 0.72,
            transparent: false,
            opacity: 1,
            depthWrite: true
        });
        const pylonMaterial = new THREE.MeshStandardMaterial({
            color: 0xf8fbff,
            metalness: 0.48,
            roughness: 0.32,
            emissive: 0x1b2d3d,
            emissiveIntensity: 0.24,
            transparent: false,
            opacity: 1,
            depthWrite: true
        });
        const lightHousingMaterial = new THREE.MeshStandardMaterial({
            color: 0x05080c,
            metalness: 0.46,
            roughness: 0.3,
            emissive: 0x0b1420,
            emissiveIntensity: 0.42,
            transparent: false,
            opacity: 1,
            depthWrite: true
        });

        [-1, 1].forEach(side => {
            const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.52, pylonHeight, 0.52), pylonMaterial.clone());
            pylon.position.set(side * 13.6, -1, -0.04);
            pylon.castShadow = true;
            group.add(pylon);
        });

        const topTruss = new THREE.Mesh(new THREE.BoxGeometry(28.4, 0.36, 0.52), pylonMaterial.clone());
        topTruss.position.set(0, 2.68, -0.08);
        topTruss.castShadow = true;
        group.add(topTruss);

        const bottomTruss = new THREE.Mesh(new THREE.BoxGeometry(28.4, 0.36, 0.52), pylonMaterial.clone());
        bottomTruss.position.set(0, -2.82, -0.08);
        bottomTruss.castShadow = true;
        group.add(bottomTruss);

        const signGroup = new THREE.Group();
        signGroup.name = 'countdown-moving-sign';
        group.add(signGroup);

        const signFace = new THREE.Mesh(
            new THREE.PlaneGeometry(15.2, 5.6),
            this.createCountdownMaterial('3', 1)
        );
        signFace.position.z = 0.34;
        signFace.name = 'countdown-sign-face';
        signGroup.add(signFace);

        const lightHousing = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.98, 0.5), lightHousingMaterial);
        lightHousing.position.set(0, 3.18, 0.2);
        lightHousing.castShadow = true;
        signGroup.add(lightHousing);

        const launchLights = [];
        const launchLightPositions = [-2.4, -0.8, 0.8, 2.4];
        launchLightPositions.forEach((x, index) => {
            const isGreen = index === launchLightPositions.length - 1;
            const activeColor = isGreen ? 0x5df29a : 0xff2438;
            const idleColor = isGreen ? 0x0c2b1a : 0x230407;
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.44, 28, 18),
                new THREE.MeshBasicMaterial({
                    color: index === 0 ? activeColor : idleColor,
                    transparent: true,
                    opacity: index === 0 ? 1 : 0.38,
                    depthWrite: false
                })
            );
            bulb.position.set(x, 3.2, 0.56);
            bulb.userData.launchLightIndex = index;
            bulb.userData.launchLightRole = isGreen ? 'green' : 'red';
            bulb.userData.activeColor = activeColor;
            bulb.userData.idleColor = idleColor;
            signGroup.add(bulb);

            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(0.72, 28, 18),
                new THREE.MeshBasicMaterial({
                    color: activeColor,
                    transparent: true,
                    opacity: index === 0 ? 0.28 : 0.04,
                    depthWrite: false,
                    side: THREE.DoubleSide
                })
            );
            glow.position.copy(bulb.position);
            glow.userData.launchLightIndex = index;
            glow.userData.launchLightRole = isGreen ? 'green' : 'red';
            glow.userData.launchLightGlow = true;
            glow.userData.activeColor = activeColor;
            signGroup.add(glow);
            launchLights.push({ bulb, glow });
        });

        const textGroup = signGroup;
        const textLayers = [signFace];

        const roadFrame = this.getVehicleRoadFrame(countdownZ, -1, 'rally');
        const roadData = roadFrame.roadData;
        group.position.copy(this.getRoadWorldPosition(roadData, 0, roadData.y + 5.4));
        group.rotation.y = roadFrame.yaw;

        return { group, signGroup, textGroup, textLayers, launchLights };
    }

    beginStartCountdown() {
        this.clearStartCountdown();
        const visual = this.createStartCountdownGroup();
        const sequence = ['3', '2', '1', 'START!'];
        this.startCountdown = {
            ...visual,
            sequence,
            active: true,
            blocking: true,
            startedAt: null,
            releaseAt: 4300,
            endAt: 6600,
            stepDuration: 1050,
            lastStep: 0,
            basePosition: visual.group.position.clone(),
            elapsedMs: 0,
            confetti: [],
            lastUpdateAt: null
        };
        this.scene.add(this.startCountdown.group);
        this.setCountdownLabel('3');
        this.spawnCountdownConfetti(28, 0.8);
    }

    getStartCountdownState(now = Date.now()) {
        const countdown = this.startCountdown;
        if (!countdown) {
            return null;
        }

        const elapsed = Math.max(0, countdown.elapsedMs || 0);
        const stepIndex = Math.min(countdown.sequence.length - 1, Math.floor(elapsed / countdown.stepDuration));
        const label = countdown.sequence[stepIndex];
        return {
            elapsed,
            stepIndex,
            label,
            blocking: Boolean(countdown.active && countdown.blocking),
            confetti: countdown.confetti.length,
            launchLights: label === 'START!'
                ? ['green']
                : ['red1', 'red2', 'red3'].slice(0, stepIndex + 1)
        };
    }

    setCountdownLabel(label) {
        if (!this.startCountdown) {
            return;
        }

        this.startCountdown.textLayers.forEach((layer, index) => {
            if (layer.material.map) {
                layer.material.map.dispose();
            }
            layer.material.map = this.createCountdownTexture(label);
            layer.material.opacity = 1;
            layer.material.needsUpdate = true;
        });
    }

    spawnCountdownConfetti(count, force = 1) {
        if (!this.startCountdown) {
            return;
        }

        const colors = [0xffd447, 0xff4f5f, 0x5fe2ff, 0xf8fbff, 0x5df29a];
        for (let i = 0; i < count; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2 + Math.random() * 0.16, 0.06 + Math.random() * 0.1), material);
            mesh.position.set((Math.random() - 0.5) * 9.5, -0.45 + Math.random() * 1.2, 0.65 + Math.random() * 0.7);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.startCountdown.group.add(mesh);
            this.startCountdown.confetti.push({
                mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.12 * force,
                    (0.06 + Math.random() * 0.12) * force,
                    (Math.random() - 0.5) * 0.08 * force
                ),
                spin: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.25,
                    (Math.random() - 0.5) * 0.25,
                    (Math.random() - 0.5) * 0.34
                ),
                age: 0,
                life: 95 + Math.random() * 55
            });
        }
    }

    updateStartCountdown() {
        const countdown = this.startCountdown;
        if (!countdown?.active) {
            return;
        }

        const now = Date.now();
        if (!countdown.startedAt) {
            countdown.startedAt = now;
            countdown.lastUpdateAt = now;
        } else {
            const delta = Math.max(0, now - (countdown.lastUpdateAt || now));
            countdown.elapsedMs = Math.min(countdown.endAt + 1000, countdown.elapsedMs + Math.min(delta, 50));
            countdown.lastUpdateAt = now;
        }

        const state = this.getStartCountdownState(now);
        const { elapsed, stepIndex, label } = state;
        const stepElapsed = elapsed - stepIndex * countdown.stepDuration;
        const stepProgress = THREE.MathUtils.clamp(stepElapsed / countdown.stepDuration, 0, 1);

        if (stepIndex !== countdown.lastStep) {
            countdown.lastStep = stepIndex;
            this.setCountdownLabel(label);
            this.spawnCountdownConfetti(label === 'START!' ? 105 : 36, label === 'START!' ? 1.8 : 1);
        }

        const pop = Math.sin((1 - stepProgress) * Math.PI * 0.5);
        const startScale = label === 'START!' ? 1.05 : 1.0;
        const animatedSign = countdown.signGroup || countdown.textGroup;
        animatedSign.scale.setScalar(startScale + pop * (label === 'START!' ? 0.14 : 0.18));
        countdown.group.position.y = countdown.basePosition.y + Math.sin(elapsed * 0.007) * 0.14;

        countdown.group.traverse(child => {
            if (child.userData.launchLightIndex === undefined || !child.material) {
                return;
            }

            const isGreen = child.userData.launchLightRole === 'green';
            const redTargetIndex = child.userData.launchLightIndex;
            const isActive = label === 'START!' ? isGreen : !isGreen && redTargetIndex <= stepIndex;
            const pulse = 0.5 + Math.sin(elapsed * 0.018) * 0.5;
            const activeOpacity = child.userData.launchLightGlow ? 0.44 + pulse * 0.18 : 1;
            const idleOpacity = child.userData.launchLightGlow ? 0.035 : 0.32;
            const targetOpacity = isActive ? activeOpacity : idleOpacity;

            if (!child.userData.launchLightGlow) {
                child.material.color.setHex(isActive ? child.userData.activeColor : child.userData.idleColor);
            }
            child.material.opacity += (targetOpacity - child.material.opacity) * 0.28;
            if (child.userData.launchLightGlow) {
                const glowScale = isActive ? 1.24 + pulse * 0.12 : 0.9;
                child.scale.setScalar(glowScale);
            }
        });

        if (elapsed >= countdown.releaseAt) {
            countdown.blocking = false;
        }

        const fadeProgress = THREE.MathUtils.clamp((elapsed - countdown.releaseAt) / (countdown.endAt - countdown.releaseAt), 0, 1);
        countdown.textLayers.forEach(layer => {
            layer.material.opacity = 1 - fadeProgress;
        });
        countdown.group.children.forEach(child => {
            if (child.material && child !== countdown.textGroup) {
                child.material.opacity = child.material.transparent ? Math.max(0, child.material.opacity * (1 - fadeProgress * 0.025)) : child.material.opacity;
            }
        });

        countdown.confetti = countdown.confetti.filter(piece => {
            piece.age++;
            piece.velocity.y -= 0.004;
            piece.mesh.position.add(piece.velocity);
            piece.mesh.rotation.x += piece.spin.x;
            piece.mesh.rotation.y += piece.spin.y;
            piece.mesh.rotation.z += piece.spin.z;
            piece.mesh.material.opacity = Math.max(0, 0.95 * (1 - piece.age / piece.life));

            if (piece.age >= piece.life) {
                countdown.group.remove(piece.mesh);
                this.disposeObject(piece.mesh);
                return false;
            }
            return true;
        });

        if (elapsed >= countdown.endAt) {
            this.clearStartCountdown();
        }
    }

    isStartCountdownBlocking() {
        if (this.startCountdown?.active && this.startCountdown.blocking) {
            if ((this.startCountdown.elapsedMs || 0) >= this.startCountdown.releaseAt) {
                this.startCountdown.blocking = false;
            }
        }

        return Boolean(this.startCountdown?.active && this.startCountdown.blocking);
    }

    initGameMusic() {

                // Play game music for the start screen
                this.stopAllMusic();
                this.playMusicElement(this.gameMusic);
    }

    startGame() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        const selectedCircuit = document.getElementById('circuitSelect').value;
        const storedTimeOfDayMode = localStorage.getItem('rallyRushIITimeOfDay');
        const timeOfDayMode = ['day', 'sunset', 'night'].includes(storedTimeOfDayMode) ? storedTimeOfDayMode : 'day';
        const storedWeatherMode = localStorage.getItem('rallyRushIIWeatherMode');
        const weatherMode = ['clear', 'rain', 'fog'].includes(storedWeatherMode)
            ? storedWeatherMode
            : localStorage.getItem('rallyRushIIRainEnabled') === 'off' ? 'clear' : 'rain';
        const rainEnabled = weatherMode === 'rain';
        const environment = {
            ...environments[selectedCircuit],
            weatherMode,
            timeOfDay: timeOfDayMode,
            disableRain: !rainEnabled,
            disableVehicleLights: timeOfDayMode !== 'night',
            nightRace: timeOfDayMode === 'night'
        }; // Use the selected environment
        this.currentStageId = selectedCircuit;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.pausedDuration = 0;
        this.ensureCameraModeForVehicle(this.getPlayerVehicleType());
        // Stop all music
        this.stopAllMusic();

        // Play the corresponding music
        if (selectedCircuit === 'desert') {
            this.playMusicElement(this.desertMusic);
        } else if (selectedCircuit === 'alpine') {
            this.playMusicElement(this.alpineMusic);
        } else if (selectedCircuit === 'scotland') {
            this.playMusicElement(this.scotlandMusic);
        } else {
            this.playMusicElement(this.gameMusic);
        }
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        this.initGame(environment); // Start the game with the selected circuit
        this.resetCarPosition();
        this.game.startTime = null;
        this.game.finishTime = null;
        this.beginStartCountdown();
        this.animate();
    }

    getAudioElements() {
        return [this.desertMusic, this.alpineMusic, this.scotlandMusic, this.gameMusic].filter(Boolean);
    }

    applyMusicPreference() {
        this.getAudioElements().forEach(audio => {
            audio.muted = !this.musicEnabled;
            if (!this.musicEnabled) {
                audio.pause();
            }
        });
    }

    playMusicElement(audio) {
        this.currentMusicElement = audio || null;
        if (!audio) {
            console.warn('Music element not found.');
            return;
        }

        if (!this.musicEnabled) {
            audio.pause();
            return;
        }

        audio.muted = false;
        audio.play().catch(error => {
            console.warn('Music playback was blocked by the browser.', error);
        });
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = Boolean(enabled);
        localStorage.setItem('musicEnabled', this.musicEnabled ? 'true' : 'false');
        this.applyMusicPreference();
        if (this.musicEnabled && this.currentMusicElement) {
            this.playMusicElement(this.currentMusicElement);
        }
    }

    toggleMusic() {
        this.setMusicEnabled(!this.musicEnabled);
        return this.musicEnabled;
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
        this.currentMusicElement = null;
    }

    pauseGame() {
        if (!this.game || this.isPaused) {
            return;
        }

        this.isPaused = true;
        this.pauseStartedAt = Date.now();
        if (this.startCountdown?.active) {
            this.startCountdown.pausedAt = this.pauseStartedAt;
        }
        this.setControls({ left: false, right: false, accelerate: false, brake: false, handbrake: false });
    }

    resumeGame() {
        if (!this.isPaused) {
            return;
        }

        if (this.game && this.game.startTime && this.pauseStartedAt) {
            this.pausedDuration += Date.now() - this.pauseStartedAt;
        }
        if (this.startCountdown?.active && this.startCountdown.pausedAt) {
            if (this.startCountdown.startedAt) {
                this.startCountdown.startedAt += Date.now() - this.startCountdown.pausedAt;
                this.startCountdown.lastUpdateAt = Date.now();
            }
            this.startCountdown.pausedAt = 0;
        }
        this.pauseStartedAt = 0;
        this.isPaused = false;
    }
    

    endGame(time) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.clearStartCountdown();
        if (this.game?.settings?.raceModeId === 'race') {
            this.finalizeRaceResults(time);
        }
        this.updateBestTimes(time);
        this.displayEndScreen(time);
    }

    finalizeRaceResults(playerTime) {
        const results = this.game.raceResults || [];
        const hasPlayer = results.some(result => result.player);
        if (!hasPlayer) {
            results.push({ name: 'You', time: playerTime, player: true });
        }

        const existingNames = new Set(results.map(result => result.name));
        this.trafficCars.forEach(competitor => {
            if (!competitor.raceCompetitor || existingNames.has(competitor.raceName)) {
                return;
            }

            const remaining = Math.max(0, (competitor.progressZ ?? competitor.mesh.position.z) - this.game.finishLine);
            const estimatedTime = playerTime + remaining / Math.max(0.35, competitor.speed || competitor.baseSpeed || 0.6) / 60;
            results.push({
                name: competitor.raceName,
                time: estimatedTime,
                player: false
            });
        });
        this.game.raceResults = results;
    }

    displayEndScreen(time) {
        // Stop circuit music and play game music for the end screen
        this.stopAllMusic();
        this.playMusicElement(this.gameMusic);

        document.getElementById('ui').style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        endScreen.style.display = 'grid';
        document.getElementById('finalTime').textContent = `${time.toFixed(2)} s`;

        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard) { // Check if the scoreboard element exists
            const stageLabel = this.game?.settings?.stageLabel || this.getStageLabel();
            const difficultyLabel = this.game?.settings?.difficultyLabel || this.getDifficultyProfile().label;
            const assistLabel = this.game?.settings?.assistLabel || this.getDrivingAssistProfile().label;
            const raceModeLabel = this.game?.settings?.raceModeLabel || this.getRaceModeProfile().label;
            const times = this.getBestTimesFor(
                this.game?.settings?.stageId,
                this.game?.settings?.difficultyId,
                this.game?.settings?.assistId,
                this.game?.settings?.raceModeId
            );
            const raceResults = this.game?.settings?.raceModeId === 'race'
                ? [...(this.game.raceResults || [])].sort((a, b) => a.time - b.time)
                : null;
            scoreboard.innerHTML = `<h2>${raceResults ? 'Race result' : 'Best times'} - ${stageLabel} - ${raceModeLabel} - ${difficultyLabel} - ${assistLabel}</h2><ol></ol>`;
            const list = scoreboard.querySelector('ol');
            if (raceResults) {
                raceResults.forEach((result, i) => {
                    const item = document.createElement('li');
                    item.innerHTML = `<span>P${i + 1} ${result.player ? 'You' : result.name}</span><strong>${result.time.toFixed(2)} s</strong>`;
                    list.appendChild(item);
                });
            } else {
                times.forEach((t, i) => {
                    const item = document.createElement('li');
                    item.innerHTML = `<span>P${i + 1}</span><strong>${t.toFixed(2)} s</strong>`;
                    list.appendChild(item);
                });
            }
            if (this.game?.sectorTimings?.length) {
                this.game.sectorTimings.forEach(sector => {
                    const item = document.createElement('li');
                    item.innerHTML = `<span>Sector ${sector.id}</span><strong>${sector.split.toFixed(2)} s</strong>`;
                    list.appendChild(item);
                });
            }
            if (!raceResults && times.length === 0) {
                const item = document.createElement('li');
                item.innerHTML = '<span>P1</span><strong>--.-- s</strong>';
                list.appendChild(item);
            }
            if (raceResults && raceResults.length === 0) {
                const item = document.createElement('li');
                item.innerHTML = '<span>P1</span><strong>Pending</strong>';
                list.appendChild(item);
            }
        }

    }


    restartGame() {
        document.getElementById('endScreen').style.display = 'none';
        this.startGame();
    }

    updateBestTimes(time) {
        const key = this.getBestTimesKey(
            this.game?.settings?.stageId,
            this.game?.settings?.difficultyId,
            this.game?.settings?.assistId,
            this.game?.settings?.raceModeId
        );
        const times = Array.isArray(this.bestTimes[key]) ? this.bestTimes[key] : [];
        times.push(time);
        times.sort((a, b) => a - b);
        this.bestTimes[key] = times.slice(0, 5);
        this.saveBestTimes();
    }

    getElapsedRaceTime() {
        if (!this.game?.startTime) {
            return 0;
        }

        const activePauseDuration = this.isPaused && this.pauseStartedAt ? Date.now() - this.pauseStartedAt : 0;
        const endTime = this.game.finishTime || Date.now();
        return Math.max(0, (endTime - this.game.startTime - this.pausedDuration - activePauseDuration) / 1000);
    }

    updateSectorTimings() {
        if (!this.game?.sectors?.length || !this.game.startTime || this.game.finishTime) {
            return;
        }

        while (this.game.nextSectorIndex < this.game.sectors.length) {
            const sector = this.game.sectors[this.game.nextSectorIndex];
            if (this.game.car.position.z > sector.z) {
                break;
            }

            const elapsed = this.getElapsedRaceTime();
            const previous = this.game.sectorTimings[this.game.sectorTimings.length - 1];
            this.game.sectorTimings.push({
                id: sector.id,
                elapsed,
                split: elapsed - (previous?.elapsed || 0)
            });
            this.game.nextSectorIndex++;
        }
    }

    getPlayerRacePosition() {
        if (this.game?.settings?.raceModeId !== 'race') {
            return 1;
        }

        const playerProgress = this.game.startLine - this.game.car.position.z;
        const ahead = this.trafficCars.filter(competitor => {
            if (competitor.finishedAt) {
                return !this.game.finishTime || competitor.finishedAt <= this.getElapsedRaceTime();
            }
            const competitorProgress = this.game.startLine - (competitor.progressZ ?? competitor.mesh.position.z);
            return competitorProgress > playerProgress + 0.5;
        }).length;
        return ahead + 1;
    }

    updateVehicleDashboardDisplays() {
        if (!this.playerCar?.userData?.dashboardDisplays?.length || !this.game?.car) {
            return;
        }

        const speedKmh = Math.max(0, Math.round(this.game.car.speed * 100));
        const speedRatio = THREE.MathUtils.clamp(
            this.game.car.speed / Math.max(this.game.car.maxSpeed || 0.001, 0.001),
            0,
            1
        );
        const countdownState = this.getStartCountdownState?.();
        const status = this.isPaused
            ? 'PAUSE'
            : this.game.finishTime
                ? 'DONE'
                : this.game.startTime
                    ? 'LIVE'
                    : countdownState?.label || 'READY';

        this.playerCar.userData.dashboardDisplays.forEach(display => {
            this.drawAssetDashboardDisplay(display, {
                speedKmh,
                speedRatio,
                accelerating: this.controls.accelerate,
                status
            });
        });
    }


    updateUI() {
        const speedValue = document.getElementById('speedValue');
        const timerValue = document.getElementById('timerValue');
        const raceStatusLabel = document.getElementById('raceStatusLabel');
        const sectorValue = document.getElementById('sectorValue');
        const sectorSplitsValue = document.getElementById('sectorSplitsValue');

        if (speedValue) {
            speedValue.textContent = (this.game.car.speed * 100).toFixed(0);
        }

        if (this.game.startTime && !this.game.finishTime) {
            const elapsedTime = this.getElapsedRaceTime();
            if (timerValue) {
                timerValue.textContent = elapsedTime.toFixed(2);
            }
        }

        if (sectorValue) {
            if (this.game.settings?.raceModeId === 'rally') {
                if (raceStatusLabel) {
                    raceStatusLabel.textContent = 'Sector';
                }
                const nextSector = Math.min((this.game.nextSectorIndex || 0) + 1, 3);
                const lastSplit = this.game.sectorTimings?.[this.game.sectorTimings.length - 1];
                sectorValue.textContent = lastSplit ? `S${lastSplit.id} ${lastSplit.split.toFixed(2)}` : `S${nextSector}`;
                if (sectorSplitsValue) {
                    const splits = (this.game.sectorTimings || [])
                        .map(sector => `S${sector.id} ${sector.split.toFixed(2)}`)
                        .join('  ');
                    sectorSplitsValue.textContent = splits;
                }
            } else if (this.game.settings?.raceModeId === 'race') {
                if (raceStatusLabel) {
                    raceStatusLabel.textContent = 'Position';
                }
                const position = this.getPlayerRacePosition();
                sectorValue.textContent = `P${position}/${this.trafficCars.length + 1}`;
                if (sectorSplitsValue) {
                    sectorSplitsValue.textContent = '';
                }
            } else {
                if (raceStatusLabel) {
                    raceStatusLabel.textContent = 'Mode';
                }
                sectorValue.textContent = 'Traffic';
                if (sectorSplitsValue) {
                    sectorSplitsValue.textContent = '';
                }
            }
        }

        this.updateVehicleDashboardDisplays();
    }

    updateLightPosition() {
        if (this.directionalLight && this.playerCar) {
            const offset = new THREE.Vector3(50, 100, -50);
            this.directionalLight.position.copy(this.playerCar.position).add(offset);
            this.directionalLight.target.position.copy(this.playerCar.position);
            this.directionalLight.target.updateMatrixWorld();
        }

        if (this.fillLight && this.playerCar) {
            const fillOffset = new THREE.Vector3(-35, 55, 75);
            this.fillLight.position.copy(this.playerCar.position).add(fillOffset);
        }

        if (this.rimLight && this.playerCar) {
            const rimOffset = new THREE.Vector3(-24, 34, -46);
            this.rimLight.position.copy(this.playerCar.position).add(rimOffset);
        }
    }

    getVehicleRoadFrame(z, travelDirection = -1, vehicleType = 'rally') {
        const dimensions = this.getVehicleDimensions(vehicleType);
        const sampleDistance = Math.max(7, dimensions.length * 0.78);
        const roadData = getRoadDataAtZ(z, this.game);
        const frontZ = z + travelDirection * sampleDistance * 0.5;
        const rearZ = z - travelDirection * sampleDistance * 0.5;
        const frontRoadData = getRoadDataAtZ(frontZ, this.game);
        const rearRoadData = getRoadDataAtZ(rearZ, this.game);
        const frontWorldX = Number.isFinite(frontRoadData.worldX) ? frontRoadData.worldX : frontRoadData.curve;
        const frontWorldZ = Number.isFinite(frontRoadData.worldZ) ? frontRoadData.worldZ : frontZ;
        const rearWorldX = Number.isFinite(rearRoadData.worldX) ? rearRoadData.worldX : rearRoadData.curve;
        const rearWorldZ = Number.isFinite(rearRoadData.worldZ) ? rearRoadData.worldZ : rearZ;
        const dx = frontWorldX - rearWorldX;
        const dz = frontWorldZ - rearWorldZ;
        const dy = frontRoadData.y - rearRoadData.y;
        const horizontalDistance = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
        const forward = new THREE.Vector3(dx, dy, dz).normalize();

        return {
            roadData,
            frontRoadData,
            rearRoadData,
            forward,
            yaw: Math.atan2(-dx, -dz),
            pitch: Math.atan2(dy, horizontalDistance) * 0.96
        };
    }

    getAngleDelta(current, target) {
        return Math.atan2(Math.sin(target - current), Math.cos(target - current));
    }

    lerpAngle(current, target, amount) {
        return current + this.getAngleDelta(current, target) * amount;
    }

    applyVehicleRoadPose(vehicle, frame, yawOffset = 0, roll = 0, pitchOffset = 0) {
        const forward = frame.forward || new THREE.Vector3(
            -Math.sin(frame.yaw),
            Math.sin(frame.pitch),
            -Math.cos(frame.yaw)
        );
        const target = vehicle.position.clone().sub(forward);

        vehicle.up.set(0, 1, 0);
        vehicle.lookAt(target);
        if (yawOffset) {
            vehicle.rotateY(yawOffset);
        }
        if (roll) {
            vehicle.rotateZ(roll);
        }
        if (pitchOffset) {
            vehicle.rotateX(pitchOffset);
        }
    }

    spawnJumpBurst(position, tint = 0xe7f2ff, upwardVelocity = 0.09, count = 9, size = 0.2) {
        if (!position) {
            return;
        }

        const burstGeometry = new THREE.CircleGeometry(size, 12);
        for (let i = 0; i < count; i++) {
            const puff = new THREE.Mesh(
                burstGeometry.clone(),
                new THREE.MeshBasicMaterial({
                    color: tint,
                    transparent: true,
                    opacity: 0.58
                })
            );
            puff.position.copy(position);
            puff.position.x += (Math.random() - 0.5) * 1.25;
            puff.position.y += 0.08 + Math.random() * 0.16;
            puff.position.z += (Math.random() - 0.5) * 0.9;
            puff.rotation.x = -Math.PI / 2;
            puff.rotation.z = Math.random() * Math.PI;
            this.scene.add(puff);
            this.collisionEffects.push({
                mesh: puff,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.04,
                    upwardVelocity + Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.05
                ),
                spin: new THREE.Vector3(0, 0, (Math.random() - 0.5) * 0.03),
                age: 0,
                life: 18 + Math.floor(Math.random() * 10),
                startOpacity: 0.58,
                grow: 1.45,
                gravity: 0.004,
                drag: 0.965
            });
        }
        burstGeometry.dispose();
    }

    updatePlayerJumpState(speedRatio) {
        const car = this.game?.car;
        if (!car) {
            return { jumpOffset: 0, landed: false, landingImpact: 0 };
        }

        let landed = false;
        let landingImpact = 0;
        if (car.jumpCooldown > 0) {
            car.jumpCooldown--;
        }

        const canJump = !car.airborne && car.jumpCooldown <= 0 && !this.activeCollision;
        if (car.jumpQueued && canJump) {
            car.airborne = true;
            car.jumpVelocity = THREE.MathUtils.lerp(0.36, 0.46, speedRatio);
            car.jumpOffset = Math.max(car.jumpOffset, 0.08);
            car.jumpCooldown = 42;
            this.spawnJumpBurst(this.playerCar?.position?.clone(), 0xd9f4ff, 0.12, 14, 0.24);
        }
        car.jumpQueued = false;

        if (car.airborne || car.jumpOffset > 0 || Math.abs(car.jumpVelocity) > 0.0001) {
            car.jumpOffset = Math.max(0, car.jumpOffset + car.jumpVelocity);
            car.jumpVelocity -= 0.0175;
            if (car.jumpOffset <= 0 && car.jumpVelocity <= 0) {
                car.jumpOffset = 0;
                landingImpact = Math.abs(car.jumpVelocity);
                car.jumpVelocity = 0;
                if (car.airborne) {
                    landed = true;
                }
                car.airborne = false;
            }
        } else {
            car.jumpOffset = 0;
            car.jumpVelocity = 0;
            car.airborne = false;
        }

        return { jumpOffset: car.jumpOffset || 0, landed, landingImpact };
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.updateStageEffects();

        if (this.isPaused) {
            this.updateUI();
            this.renderer.render(this.scene, this.camera);
            return;
        }

        if (this.startCountdown?.active) {
            this.updateStartCountdown();
            if (this.isStartCountdownBlocking()) {
                this.updateCameraPosition();
                this.updateLightPosition();
                if (this.roadUpdater) {
                    this.roadUpdater(this.game.car.position.z);
                }
                this.updateUI();
                this.renderer.render(this.scene, this.camera);
                return;
            }
        }

        if (!this.game.startTime) {
            const gridRaceStarted = this.game.settings?.raceModeId === 'race' && !this.isStartCountdownBlocking();
            if (gridRaceStarted || this.game.car.position.z <= this.game.startLine) {
                this.game.startTime = Date.now();
            }
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
        this.updateSectorTimings();

        // Update the road
        if (this.roadUpdater) {
            this.roadUpdater(this.game.car.position.z);
        }

        if (!this.game.finishTime && this.game.car.position.z <= this.game.finishLine) {
            this.game.finishTime = Date.now();
            const totalTime = this.getElapsedRaceTime();
            if (this.game.settings?.raceModeId === 'race') {
                this.game.raceResults.push({
                    name: 'You',
                    time: totalTime,
                    player: true
                });
            }
            this.endGame(totalTime);
        }

        this.updateUI();
        this.renderer.render(this.scene, this.camera);
    }

    updateStageEffects() {
        const now = performance.now();
        const deltaSeconds = Math.min(0.05, Math.max(0, (now - (this.lastStageEffectUpdateAt || now)) / 1000));
        this.lastStageEffectUpdateAt = now;
        this.updateSceneryCulling();

        if (!this.game?.stageEffects?.length) {
            return;
        }

        const effectContext = {
            playerWorldPosition: this.playerCar?.position || this.carPosition || null,
            playerProgressZ: Number.isFinite(this.game?.car?.position?.z)
                ? this.game.car.position.z
                : this.game?.startLine ?? 0
        };

        this.game.stageEffects.forEach(effect => {
            if (typeof effect.update === 'function') {
                effect.update(deltaSeconds, this.game, this.camera, this.getActiveCameraMode(), effectContext);
            }
        });
    }

    updateSceneryCulling() {
        const cullObjects = this.game?.sceneryCullObjects;
        if (!Array.isArray(cullObjects) || cullObjects.length === 0 || !this.game?.car?.position) {
            return;
        }

        const carZ = this.game.car.position.z;
        const windowSettings = this.game.sceneryCullWindow || {};
        const ahead = Number.isFinite(windowSettings.ahead) ? windowSettings.ahead : 900;
        const behind = Number.isFinite(windowSettings.behind) ? windowSettings.behind : 220;
        let visibleCount = 0;

        cullObjects.forEach(object => {
            if (!object) {
                return;
            }
            const cull = object.userData?.sceneryCull;
            const z = Number.isFinite(cull?.z) ? cull.z : object.position?.z;
            if (!Number.isFinite(z)) {
                return;
            }
            const radius = Number.isFinite(cull?.radius) ? cull.radius : 70;
            const visible = z >= carZ - ahead - radius && z <= carZ + behind + radius;
            object.visible = visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        this.game.visibleSceneryCullObjects = visibleCount;
    }

    getPerformanceDiagnostics() {
        const renderInfo = this.renderer?.info;
        let activeLights = 0;
        if (this.scene) {
            this.scene.traverse(object => {
                if (object.isLight && object.visible) {
                    activeLights += 1;
                }
            });
        }

        return {
            stage: this.currentStageId,
            timeOfDay: this.timeOfDayMode || (this.nightRace ? 'night' : 'day'),
            rainEnabled: !this.currentEnvironment?.disableRain,
            sceneChildren: this.scene?.children?.length || 0,
            activeLights,
            scenery: {
                total: this.game?.sceneryCullObjects?.length || 0,
                visible: this.game?.visibleSceneryCullObjects || 0,
                window: this.game?.sceneryCullWindow || null
            },
            renderer: renderInfo ? {
                calls: renderInfo.render.calls,
                triangles: renderInfo.render.triangles,
                lines: renderInfo.render.lines,
                points: renderInfo.render.points,
                geometries: renderInfo.memory.geometries,
                textures: renderInfo.memory.textures
            } : null,
            jungleAssets: this.game?.jungleAssetDiagnostics || null,
            jungleBatches: this.game?.stageEffects
                ?.filter(effect => effect.type === 'jungleInstancedVegetation')
                .map(effect => ({
                    asset: effect.asset,
                    placements: effect.placements?.length || 0,
                    meshDraws: effect.fullMeshes?.length || 0,
                    visibleFull: effect.visibleFull || 0,
                    visibleBillboards: effect.visibleBillboards || 0,
                    nearDistance: effect.nearDistance,
                    farDistance: effect.farDistance
                })) || null,
            stageDecor: this.game?.stageDecor || null
        };
    }


    updateCarPosition() {
        const steeringInput = (this.controls.right ? -1 : 0) + (this.controls.left ? 1 : 0);

        // Update speed
        if (this.controls.accelerate) {
            this.game.car.speed += this.game.car.acceleration;
        } else if (this.controls.brake) {
            this.game.car.speed -= this.game.car.brakePower;
        } else {
            this.game.car.speed -= this.game.car.deceleration;
        }

        const airborne = Boolean(this.game.car.airborne);
        this.game.car.speed = THREE.MathUtils.clamp(this.game.car.speed, this.game.car.minSpeed, this.game.car.maxSpeed);
        const handbrakeActive = Boolean(this.controls.handbrake && this.game.car.speed > 0.1 && !airborne);
        if (handbrakeActive) {
            const dragRatio = THREE.MathUtils.clamp(this.game.car.speed / this.game.car.maxSpeed, 0, 1);
            this.game.car.speed -= this.game.car.handbrakePower * THREE.MathUtils.lerp(1.15, 2.05, dragRatio);
        }

        this.game.car.speed = THREE.MathUtils.clamp(this.game.car.speed, this.game.car.minSpeed, this.game.car.maxSpeed);
        const speedRatio = THREE.MathUtils.clamp(this.game.car.speed / this.game.car.maxSpeed, 0, 1);
        const steeringStrength = Math.abs(steeringInput);
        const playerType = this.getPlayerVehicleType();
        const currentRoadFrame = this.getVehicleRoadFrame(this.game.car.position.z, -1, playerType);
        const assistProfile = this.getDrivingAssistProfile(this.game.settings?.assistId || this.drivingAssistLevel);
        const curveProbeDistance = THREE.MathUtils.lerp(18, 42, speedRatio);
        const futureRoadFrame = this.getVehicleRoadFrame(this.game.car.position.z - curveProbeDistance, -1, playerType);
        const roadBend = this.getAngleDelta(currentRoadFrame.yaw, futureRoadFrame.yaw);
        const entryNearDistance = THREE.MathUtils.lerp(14, 30, speedRatio);
        const entryProbeDistance = THREE.MathUtils.lerp(78, 132, speedRatio);
        const nearEntryFrame = this.getVehicleRoadFrame(this.game.car.position.z - entryNearDistance, -1, playerType);
        const entryRoadFrame = this.getVehicleRoadFrame(this.game.car.position.z - entryProbeDistance, -1, playerType);
        const nearEntryBend = this.getAngleDelta(currentRoadFrame.yaw, nearEntryFrame.yaw);
        const upcomingEntryBend = this.getAngleDelta(currentRoadFrame.yaw, entryRoadFrame.yaw);
        const entryBendMagnitude = Math.abs(upcomingEntryBend);
        const nearBendMagnitude = Math.abs(nearEntryBend);
        const isTurnEntry = handbrakeActive
            && speedRatio > 0.32
            && entryBendMagnitude > 0.06
            && nearBendMagnitude < entryBendMagnitude * 0.72;
        const turnEntryDrift = isTurnEntry
            ? THREE.MathUtils.clamp((entryBendMagnitude - Math.max(nearBendMagnitude, 0.02)) / 0.14, 0, 0.95)
            : 0;
        this.game.car.turnEntryDrift = turnEntryDrift;
        const curveDriftDemand = handbrakeActive
            ? THREE.MathUtils.clamp((Math.abs(roadBend) - 0.015) / 0.1, 0, 0.9)
            : 0;
        const roadDriftDemand = Math.max(curveDriftDemand, turnEntryDrift);
        const driftDemand = Math.max(steeringStrength, roadDriftDemand);
        const driftDirection = steeringInput
            || (turnEntryDrift > 0 ? Math.sign(upcomingEntryBend) : 0)
            || (curveDriftDemand > 0 ? Math.sign(roadBend) : 0);
        const targetHandbrakeIntensity = handbrakeActive
            ? THREE.MathUtils.clamp((speedRatio - 0.08) / 0.45, 0, 1)
            : 0;
        const handbrakeResponse = targetHandbrakeIntensity > (this.game.car.handbrakeIntensity || 0) ? 0.34 : 0.16;
        this.game.car.handbrakeIntensity += (targetHandbrakeIntensity - (this.game.car.handbrakeIntensity || 0)) * handbrakeResponse;
        const handbrakeIntensity = THREE.MathUtils.clamp(this.game.car.handbrakeIntensity, 0, 1);
        this.game.car.handbrakeIntensity = handbrakeIntensity;

        // Update steering
        const targetSteeringAngle = steeringInput * this.game.car.maxSteeringAngle * assistProfile.steeringResponse;
        this.game.car.steeringAngle += (targetSteeringAngle - this.game.car.steeringAngle) * this.game.car.steeringSpeed;

        const steeringRatio = this.game.car.maxSteeringAngle > 0
            ? THREE.MathUtils.clamp(this.game.car.steeringAngle / this.game.car.maxSteeringAngle, -1, 1)
            : 0;
        const lateralLoad = Math.abs(steeringRatio) * speedRatio;
        const throttleInput = this.controls.accelerate ? 1 : 0;
        const powerOversteer = throttleInput * lateralLoad * THREE.MathUtils.clamp((speedRatio - 0.32) / 0.45, 0, 1);

        const activeDriftDirection = driftDirection || steeringInput || Math.sign(roadBend) || 0;
        const hasDriftInput = activeDriftDirection !== 0 && speedRatio > 0.18 && !airborne;
        const looseRearTarget = hasDriftInput
            ? THREE.MathUtils.clamp(
                handbrakeIntensity * (0.55 + driftDemand * 0.42)
                    + turnEntryDrift * 0.46
                    + powerOversteer * 0.16,
                0,
                1
            )
            : 0;
        const rearGripTarget = THREE.MathUtils.clamp(
            1 - looseRearTarget * 0.72 + (this.game.car.lateralGrip - 1) * 0.16 + (assistProfile.roadFollow || 0) * 0.08,
            0.28,
            1
        );
        const rearGripResponse = rearGripTarget < (this.game.car.rearGrip || 1) ? 0.24 : 0.08;
        this.game.car.rearGrip += (rearGripTarget - (this.game.car.rearGrip || 1)) * rearGripResponse;
        const rearGrip = THREE.MathUtils.clamp(this.game.car.rearGrip, 0.24, 1);
        this.game.car.rearGrip = rearGrip;

        const entryDriftKick = turnEntryDrift * handbrakeIntensity * speedRatio;
        const looseRearRatio = THREE.MathUtils.clamp((1 - rearGrip) / 0.72, 0, 1);
        const driftBoost = this.game.car.driftBoost || 1;
        const targetDrift = THREE.MathUtils.clamp(looseRearRatio * (0.28 + driftDemand * 0.58 + turnEntryDrift * 0.28) * driftBoost, 0, 1);
        const currentDrift = this.game.car.driftAmount || 0;
        const driftResponse = targetDrift > currentDrift ? 0.24 + handbrakeIntensity * 0.18 : 0.12 + rearGrip * 0.04;
        this.game.car.driftAmount += (targetDrift - currentDrift) * driftResponse;
        const driftAmount = THREE.MathUtils.clamp(this.game.car.driftAmount, 0, 1);
        this.game.car.driftAmount = driftAmount;

        const maxPathAngle = THREE.MathUtils.lerp(0.11, 0.34, speedRatio) * assistProfile.steeringResponse;
        const targetTravelAngle = steeringRatio * maxPathAngle * (1 - driftAmount * 0.12);
        const travelResponse = steeringInput !== 0
            ? 0.18 + rearGrip * 0.08
            : 0.14 + rearGrip * 0.12;
        this.game.car.travelAngle += (targetTravelAngle - (this.game.car.travelAngle || 0)) * travelResponse;

        const driftSlipTarget = activeDriftDirection * driftAmount * THREE.MathUtils.lerp(0.16, 0.54, speedRatio);
        const targetBodyAngle = this.game.car.travelAngle + driftSlipTarget;
        const bodyResponse = driftAmount > 0.05 ? 0.18 + handbrakeIntensity * 0.12 : 0.34;
        const previousBodyAngle = this.game.car.angle || 0;
        this.game.car.angle += this.getAngleDelta(this.game.car.angle || 0, targetBodyAngle) * bodyResponse;
        this.game.car.yawVelocity = this.game.car.angle - previousBodyAngle;

        this.game.car.angle += (this.game.car.travelAngle - this.game.car.angle) * (0.035 + rearGrip * 0.04) * assistProfile.headingRecovery * (1 - driftAmount * 0.42);

        const maxBodySlip = THREE.MathUtils.lerp(Math.PI / 5.5, Math.PI / 2.8, driftAmount);
        const maxTravelSlip = THREE.MathUtils.lerp(Math.PI / 7, Math.PI / 3.4, driftAmount);
        this.game.car.angle = THREE.MathUtils.clamp(this.game.car.angle, -maxBodySlip, maxBodySlip);
        this.game.car.travelAngle = THREE.MathUtils.clamp(this.game.car.travelAngle, -maxTravelSlip, maxTravelSlip);
        const updatedSlipAngle = this.getAngleDelta(this.game.car.travelAngle || 0, this.game.car.angle || 0);
        this.game.car.slipAngle = updatedSlipAngle;

        const steeringIntoCurve = steeringInput !== 0 && Math.sign(steeringInput) === Math.sign(roadBend);
        const roadFollowSlipScale = THREE.MathUtils.clamp(1 - (assistProfile.roadFollow || 0), 0, 1);
        const curveSlip = roadBend
            * speedRatio
            * speedRatio
            * (steeringIntoCurve ? 0.052 : 0.14)
            * (this.game.car.curveSlip || 1)
            * assistProfile.curveSlip
            * roadFollowSlipScale;
        this.game.car.lateralVelocity += curveSlip;
        if (driftAmount > 0.08 && looseRearRatio > 0.16 && activeDriftDirection !== 0) {
            this.game.car.lateralVelocity += activeDriftDirection * driftAmount * looseRearRatio * speedRatio * 0.036;
            this.game.car.lateralVelocity += activeDriftDirection * entryDriftKick * 0.028;
        }
        let landingLooseRatio = 0;
        let landingDriftOscillation = 0;
        if ((this.game.car.landingTractionTimer || 0) > 0) {
            landingLooseRatio = THREE.MathUtils.clamp(
                this.game.car.landingTractionTimer / Math.max(1, this.game.car.landingTractionDuration || 1),
                0,
                1
            );
            const driftAmount = this.game.car.landingDriftAmount || 0.65;
            this.game.car.landingWobblePhase += 0.24 + speedRatio * 0.26;
            const slipEnvelope = landingLooseRatio * driftAmount;
            landingDriftOscillation = Math.sin(this.game.car.landingWobblePhase);
            const landingWobble = landingDriftOscillation * slipEnvelope;
            const landingSide = this.game.car.landingTractionSide || 1;
            const recoveryCountersteer = steeringInput && Math.sign(steeringInput) !== Math.sign(landingSide * landingWobble)
                ? 0.78
                : 1;
            this.game.car.lateralVelocity += landingSide * landingWobble * (0.055 + speedRatio * 0.062) * recoveryCountersteer;
            this.game.car.angle += landingSide * landingWobble * (0.018 + speedRatio * 0.014) * recoveryCountersteer;
            this.game.car.travelAngle += landingSide * landingWobble * (0.012 + speedRatio * 0.012) * recoveryCountersteer;
            this.game.car.landingTractionTimer--;
            if (this.game.car.landingTractionTimer <= 0) {
                this.game.car.landingDriftAmount = 0;
            }
        }
        const lateralDamping = THREE.MathUtils.clamp(
            0.9 - speedRatio * 0.08 + driftAmount * 0.1 + (1 - rearGrip) * 0.06 + landingLooseRatio * 0.16 - ((this.game.car.lateralGrip || 1) - 1) * 0.08,
            0.72,
            0.992
        );
        this.game.car.lateralVelocity *= lateralDamping;

        // Calculate movement
        const steeringLateralDelta = -Math.sin(this.game.car.travelAngle) * this.game.car.speed * (0.92 + driftAmount * 0.24);
        const dz = Math.cos(this.game.car.travelAngle) * this.game.car.speed;

        // Update position
        this.game.car.xOffset += steeringLateralDelta + this.game.car.lateralVelocity;
        this.game.car.position.z -= dz;

        // Handle road-edge containment. The limit is based on the actual car width so
        // steep roadside terrain cannot visually swallow half the body.
        const borderThreshold = this.getPlayerRoadLimit();
        const edgeOverflow = Math.abs(this.game.car.xOffset) - borderThreshold;
        if (edgeOverflow > 0) {
            if (this.game.car.borderCollisionCooldown === 0) {
                this.game.car.speed *= 0.8;
                this.game.car.borderCollisionCooldown = 30;
            }
            this.game.car.xOffset = Math.sign(this.game.car.xOffset) * borderThreshold;
            this.game.car.angle *= 0.45;
            this.game.car.lateralVelocity = Math.min(Math.abs(this.game.car.lateralVelocity), 0.02) * -Math.sign(this.game.car.xOffset);
        }

        if (this.game.car.borderCollisionCooldown > 0) {
            this.game.car.borderCollisionCooldown--;
        }

        const updatedRoadFrame = this.getVehicleRoadFrame(this.game.car.position.z, -1, playerType);
        const updatedRoadData = updatedRoadFrame.roadData;
        const roadYawDelta = this.getAngleDelta(currentRoadFrame.yaw, updatedRoadFrame.yaw);
        this.game.car.angle -= roadYawDelta * (1 - assistProfile.roadFollow);
        this.game.car.travelAngle -= roadYawDelta * (1 - assistProfile.roadFollow);
        this.game.car.angle = THREE.MathUtils.clamp(this.game.car.angle, -maxBodySlip, maxBodySlip);
        this.game.car.travelAngle = THREE.MathUtils.clamp(this.game.car.travelAngle, -maxTravelSlip, maxTravelSlip);
        this.game.car.slipAngle = this.getAngleDelta(this.game.car.travelAngle || 0, this.game.car.angle || 0);
        const { jumpOffset, landed, landingImpact } = this.updatePlayerJumpState(speedRatio);

        // Update car's position and rotation
        this.carPosition.copy(this.getRoadWorldPosition(
            updatedRoadData,
            this.game.car.xOffset,
            this.getVehicleGroundY(updatedRoadFrame, playerType) + jumpOffset
        ));
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, this.game.car.position.z);
        this.playerCar.position.copy(this.carPosition);
        this.playerCar.userData.roadProgressZ = this.game.car.position.z;

        const slipSide = Math.sign(this.game.car.slipAngle)
            || driftDirection
            || Math.sign(this.game.car.lateralVelocity)
            || 0;
        const visualSteerYaw = this.game.car.steeringAngle * (0.28 + speedRatio * 0.42) * (0.65 + this.game.car.rearGrip * 0.35);
        const driftVisualYaw = slipSide * driftAmount * (0.05 + speedRatio * 0.1);
        this.game.car.driveYaw = updatedRoadFrame.yaw + this.game.car.angle;
        const targetVisualYaw = this.game.car.driveYaw + visualSteerYaw + driftVisualYaw;
        const roadFollowVisualResponse = (assistProfile.roadFollow || 0)
            * THREE.MathUtils.lerp(0.24, 0.52, speedRatio)
            * (1 - driftAmount * 0.65);
        const visualYawResponse = THREE.MathUtils.clamp(
            0.18 + driftAmount * 0.06 + roadFollowVisualResponse,
            0.18,
            0.76
        );
        this.game.car.visualYaw = this.lerpAngle(this.game.car.visualYaw, targetVisualYaw, visualYawResponse);

        const maxRoll = Math.PI / 44;
        const targetRoll = (-this.game.car.steeringAngle * (maxRoll / this.game.car.maxSteeringAngle) * speedRatio)
            + slipSide * driftAmount * 0.045;
        this.game.car.bodyRoll += (targetRoll - this.game.car.bodyRoll) * 0.16;
        const jumpRoll = this.game.car.airborne ? (-steeringInput * (0.015 + speedRatio * 0.028)) : 0;
        const jumpPitch = this.game.car.airborne
            ? THREE.MathUtils.clamp(this.game.car.jumpVelocity * 0.55, -0.085, 0.12)
            : 0;
        const landingRoll = landingLooseRatio * (this.game.car.landingTractionSide || 1) * landingDriftOscillation * 0.075;
        this.applyVehicleRoadPose(
            this.playerCar,
            updatedRoadFrame,
            this.getAngleDelta(updatedRoadFrame.yaw, this.game.car.visualYaw),
            this.game.car.bodyRoll + jumpRoll + landingRoll,
            jumpPitch
        );
        if (!this.game.car.airborne) {
            this.alignVehicleToRoadSurface(this.playerCar);
        }
        this.game.car.lastRoadYaw = updatedRoadFrame.yaw;
        this.carPosition.copy(this.playerCar.position);
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, this.game.car.position.z);
        const counterSteer = -slipSide * driftAmount * speedRatio * 0.2;
        this.animateVehicleWheels(this.playerCar, this.game.car.speed * 0.72, this.game.car.steeringAngle * 0.85 + counterSteer);
        this.animateVehicleSteeringWheel(this.playerCar, this.game.car.steeringAngle + counterSteer, this.game.car.maxSteeringAngle);
        this.updateDriftEffects(updatedRoadFrame, driftAmount, handbrakeIntensity, slipSide || driftDirection, speedRatio);

        if (landed) {
            const landingSpeedLoss = THREE.MathUtils.clamp(0.18 + landingImpact * 0.34, 0.18, 0.34);
            this.game.car.speed *= (1 - landingSpeedLoss);
            this.game.car.lastLandingSpeedLoss = landingSpeedLoss;
            const landingSide = Math.sign(this.game.car.lateralVelocity)
                || Math.sign(steeringInput)
                || (Math.random() < 0.5 ? -1 : 1);
            const landingDriftAmount = THREE.MathUtils.clamp(0.62 + landingImpact * 2.5 + speedRatio * 0.32, 0.62, 1.18);
            this.game.car.landingTractionDuration = 76;
            this.game.car.landingTractionTimer = 76;
            this.game.car.landingTractionSide = landingSide;
            this.game.car.landingWobblePhase = Math.random() * Math.PI;
            this.game.car.landingDriftAmount = landingDriftAmount;
            this.game.car.lateralVelocity += landingSide * landingDriftAmount * (0.09 + speedRatio * 0.075);
            this.game.car.angle += landingSide * landingDriftAmount * (0.04 + speedRatio * 0.022);
            this.game.car.travelAngle += landingSide * landingDriftAmount * (0.018 + speedRatio * 0.014);
            this.game.car.driftAmount = Math.max(this.game.car.driftAmount || 0, landingDriftAmount * 0.32);
            this.cameraShakeDuration = 16;
            this.cameraShakeFrames = 16;
            this.cameraShakeStrength = 0.26;
            this.spawnJumpBurst(this.playerCar.position.clone(), 0xd6e4ea, 0.052, 18, 0.28);
        }
    }

    getPlayerRoadLimit() {
        const dimensions = this.getVehicleDimensions(this.getPlayerVehicleType());
        const roadData = getRoadDataAtZ(this.game.car.position.z, this.game);
        const roadWidth = this.getRoadDrivableWidth(roadData);
        return Math.max(2, roadWidth / 2 - dimensions.width / 2 - 0.45);
    }

    getRoadDrivableWidth(roadData = null) {
        if (Number.isFinite(this.game?.road?.drivableWidth)) {
            return this.game.road.drivableWidth;
        }

        return roadData?.width || this.game?.road?.width || 25;
    }

    updateDriftEffects(roadFrame, driftAmount, handbrakeIntensity, steeringInput, speedRatio) {
        if (!this.playerCar || !this.game?.car) {
            return;
        }

        if (this.game.car.driftSmokeCooldown > 0) {
            this.game.car.driftSmokeCooldown--;
        }

        const skidIntensity = Math.max(driftAmount, handbrakeIntensity * 0.72);
        if (skidIntensity < 0.12 || speedRatio < 0.12 || this.game.car.driftSmokeCooldown > 0) {
            return;
        }

        this.game.car.driftSmokeCooldown = Math.max(2, Math.round(5 - skidIntensity * 3));
        const forward = (roadFrame.forward || new THREE.Vector3(
            -Math.sin(roadFrame.yaw),
            0,
            -Math.cos(roadFrame.yaw)
        )).clone();
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3(Math.cos(roadFrame.yaw), 0, -Math.sin(roadFrame.yaw)).normalize();
        const rearAxle = this.playerCar.position.clone().sub(forward.clone().multiplyScalar(2.25));
        const slipSide = steeringInput || Math.sign(this.game.car.lateralVelocity) || 1;
        const smokeColor = 0xdfe8eb;
        const intensity = THREE.MathUtils.clamp(skidIntensity * (0.35 + speedRatio * 0.95), 0.16, 1);

        [-1, 1].forEach(side => {
            const puff = new THREE.Mesh(
                new THREE.SphereGeometry(0.38 + intensity * 0.18, 28, 16),
                new THREE.MeshBasicMaterial({
                    color: smokeColor,
                    transparent: true,
                    opacity: 0.26 + intensity * 0.22,
                    depthWrite: false
                })
            );
            puff.position.copy(rearAxle)
                .add(right.clone().multiplyScalar(side * 0.9))
                .sub(forward.clone().multiplyScalar(0.35 + intensity * 0.55));
            puff.position.y += 0.18 + Math.random() * 0.1;
            puff.scale.set(1.05 + intensity * 0.9, 0.36 + intensity * 0.38, 0.7 + intensity * 0.68);
            puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.scene.add(puff);
            this.collisionEffects.push({
                mesh: puff,
                velocity: right.clone()
                    .multiplyScalar(-slipSide * (0.026 + intensity * 0.038))
                    .add(forward.clone().multiplyScalar(0.01 - intensity * 0.045))
                    .add(new THREE.Vector3(0, 0.038 + intensity * 0.032, 0)),
                spin: new THREE.Vector3(Math.random() * 0.04, Math.random() * 0.05, Math.random() * 0.05),
                age: 0,
                life: 32 + Math.floor(intensity * 24),
                startOpacity: 0.26 + intensity * 0.22,
                baseScale: puff.scale.clone(),
                grow: 0.8 + intensity * 0.75,
                gravity: 0.009,
                drag: 0.965
            });

        });
    }

    triggerTrafficCollision(trafficCar, forcedType) {
        const variants = ['spinout', 'lift-roll', 'side-slam'];
        const type = forcedType || variants[Math.floor(Math.random() * variants.length)];
        const side = Math.sign(this.playerCar.position.x - trafficCar.mesh.position.x) || (Math.random() < 0.5 ? -1 : 1);
        const borderThreshold = this.game.road.width / 2 - 2.2;
        const impactPosition = this.playerCar.position.clone().add(trafficCar.mesh.position).multiplyScalar(0.5);
        const playerStart = this.playerCar.position.clone();
        const trafficStart = trafficCar.mesh.position.clone();
        const playerStartProgress = this.game.car.position.z;
        const trafficStartProgress = trafficCar.progressZ ?? trafficCar.mesh.position.z;
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

        const playerPeakZ = playerStartProgress + playerZKick;
        const playerPeakRoad = getRoadDataAtZ(playerPeakZ, this.game);
        const playerType = this.getPlayerVehicleType();
        const playerPeakFrame = this.getVehicleRoadFrame(playerPeakZ, -1, playerType);
        const playerPeakOffset = THREE.MathUtils.clamp(this.game.car.xOffset + side * playerSlide, -borderThreshold, borderThreshold);
        const playerPeak = this.getRoadWorldPosition(
            playerPeakRoad,
            playerPeakOffset,
            this.getVehicleGroundY(playerPeakFrame, playerType)
        );
        const playerEndZ = playerPeakZ + 4;
        const playerEndRoad = getRoadDataAtZ(playerEndZ, this.game);
        const playerEndFrame = this.getVehicleRoadFrame(playerEndZ, -1, playerType);
        const playerEnd = this.getRoadWorldPosition(
            playerEndRoad,
            0,
            this.getVehicleGroundY(playerEndFrame, playerType)
        );
        const playerRotEnd = new THREE.Euler(playerEndFrame.pitch, playerEndFrame.yaw, 0);

        const trafficEndZ = trafficStartProgress + trafficZKick;
        const trafficEndRoad = getRoadDataAtZ(trafficEndZ, this.game);
        const trafficEndFrame = this.getVehicleRoadFrame(trafficEndZ, 1, trafficCar.vehicleType);
        const trafficEndOffset = THREE.MathUtils.clamp(trafficCar.xOffset - side * trafficSlide, -borderThreshold, borderThreshold);
        const trafficEnd = this.getRoadWorldPosition(
            trafficEndRoad,
            trafficEndOffset,
            this.getVehicleGroundY(trafficEndFrame, trafficCar.vehicleType)
        );

        this.activeCollision = {
            type,
            trafficCar,
            frame: 0,
            duration,
            playerStart,
            playerPeak,
            playerEnd,
            playerEndProgress: playerEndZ,
            trafficStart,
            trafficEnd,
            trafficEndProgress: trafficEndZ,
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
        this.keepVehicleAboveRoadSurface(this.playerCar, 0.045, 5.5);

        collision.trafficCar.mesh.position.lerpVectors(collision.trafficStart, collision.trafficEnd, eased);
        collision.trafficCar.mesh.position.y += lift * collision.trafficLift;
        collision.trafficCar.mesh.rotation.set(
            THREE.MathUtils.lerp(collision.trafficRotStart.x, collision.trafficRotEnd.x, eased),
            THREE.MathUtils.lerp(collision.trafficRotStart.y, collision.trafficRotEnd.y, eased),
            THREE.MathUtils.lerp(collision.trafficRotStart.z, collision.trafficRotEnd.z, eased)
        );
        this.keepVehicleAboveRoadSurface(collision.trafficCar.mesh, 0.045, 4.5);
        this.animateVehicleWheels(this.playerCar, 0.18 * (1 - t), 0);
        this.animateVehicleWheels(collision.trafficCar.mesh, 0.2 * (1 - t), 0);

        this.carPosition.copy(this.playerCar.position);

        if (t >= 1) {
            this.game.car.position.z = collision.playerEndProgress ?? collision.playerEnd.z;
            this.game.car.xOffset = 0;
            this.game.car.lateralVelocity = 0;
            this.game.car.angle = 0;
            this.game.car.speed = 0;
            this.game.car.driftAmount = 0;
            this.game.car.handbrakeIntensity = 0;
            this.game.car.turnEntryDrift = 0;
            this.game.car.driftSmokeCooldown = 0;
            this.game.car.steeringAngle = 0;
            this.game.car.driveYaw = collision.playerRotEnd.y;
            this.game.car.visualYaw = collision.playerRotEnd.y;
            this.game.car.travelAngle = 0;
            this.game.car.yawVelocity = 0;
            this.game.car.slipAngle = 0;
            this.game.car.rearGrip = 1;
            this.game.car.bodyRoll = 0;
            this.game.car.jumpQueued = false;
            this.game.car.jumpOffset = 0;
            this.game.car.jumpVelocity = 0;
            this.game.car.jumpCooldown = 0;
            this.game.car.airborne = false;
            this.game.car.landingTractionTimer = 0;
            this.game.car.landingTractionDuration = 0;
            this.game.car.landingTractionSide = 1;
            this.game.car.landingWobblePhase = 0;
            this.game.car.landingDriftAmount = 0;
            this.game.car.lastLandingSpeedLoss = 0;
            this.playerCar.position.copy(collision.playerEnd);
            this.playerCar.userData.roadProgressZ = this.game.car.position.z;
            const recoveryRoadFrame = this.getVehicleRoadFrame(this.game.car.position.z, -1, this.getPlayerVehicleType());
            this.game.car.lastRoadYaw = recoveryRoadFrame.yaw;
            this.applyVehicleRoadPose(this.playerCar, recoveryRoadFrame);
            this.alignVehicleToRoadSurface(this.playerCar);
            this.carPosition.copy(this.playerCar.position);
            this.game.car.position.set(this.carPosition.x, this.carPosition.y, this.game.car.position.z);
            this.animateVehicleSteeringWheel(this.playerCar, 0, this.game.car.maxSteeringAngle);

            const spawnPose = this.getTrafficSpawnPose(
                this.game.car.position.z - 1450,
                this.game.car.position.z - 850,
                collision.trafficCar.vehicleType,
                collision.trafficCar
            );
            collision.trafficCar.speed = this.getTrafficSpeed(collision.trafficCar.vehicleType);
            collision.trafficCar.baseSpeed = this.getVehicleSpec(collision.trafficCar.vehicleType).speedBase;
            this.placeTrafficCar(collision.trafficCar, spawnPose.z, spawnPose.xOffset);
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

    createRubBurst(position) {
        if (!position) {
            return;
        }

        const puffGeometry = new THREE.SphereGeometry(0.16, 12, 8);
        for (let i = 0; i < 8; i++) {
            const puff = new THREE.Mesh(
                puffGeometry.clone(),
                new THREE.MeshBasicMaterial({
                    color: i % 2 ? 0xdfe8eb : 0xffd447,
                    transparent: true,
                    opacity: 0.42,
                    depthWrite: false
                })
            );
            puff.position.copy(position);
            puff.position.y += 0.32;
            this.scene.add(puff);
            this.collisionEffects.push({
                mesh: puff,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.08,
                    0.035 + Math.random() * 0.035,
                    (Math.random() - 0.5) * 0.08
                ),
                spin: new THREE.Vector3(0, 0, 0),
                age: 0,
                life: 16 + Math.floor(Math.random() * 8),
                startOpacity: 0.42,
                grow: 1.3,
                gravity: 0.003,
                drag: 0.96
            });
        }
        puffGeometry.dispose();
    }

    updateCollisionEffects() {
        this.collisionEffects = this.collisionEffects.filter(effect => {
            effect.age++;
            const progress = effect.age / effect.life;
            if (!effect.staticOnGround) {
                effect.mesh.position.add(effect.velocity);
                effect.velocity.y -= effect.gravity ?? 0.018;
                effect.velocity.multiplyScalar(effect.drag ?? 0.985);
                effect.mesh.rotation.x += effect.spin.x;
                effect.mesh.rotation.y += effect.spin.y;
                effect.mesh.rotation.z += effect.spin.z;
            }

            if (effect.grow) {
                const scale = 1 + progress * effect.grow;
                if (effect.baseScale) {
                    effect.mesh.scale.copy(effect.baseScale).multiplyScalar(scale);
                } else {
                    effect.mesh.scale.setScalar(scale);
                }
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
        if (this.game?.settings?.raceModeId === 'race') {
            this.updateRaceCompetitors();
            return;
        }

        if (this.game.car.trafficCollisionCooldown > 0) {
            this.game.car.trafficCollisionCooldown--;
        }

        this.trafficCars.forEach(trafficCar => {
            if (this.activeCollision && this.activeCollision.trafficCar === trafficCar) {
                return;
            }

            const currentProgressZ = trafficCar.progressZ ?? trafficCar.mesh.position.z;
            trafficCar.progressZ = currentProgressZ + trafficCar.speed;

            // If car is behind the player, move it to the back of the visible road
            if (trafficCar.progressZ > this.game.car.position.z + 100) {
                const spawnPose = this.getTrafficSpawnPose(
                    this.game.car.position.z - 1450,
                    this.game.car.position.z - 850,
                    trafficCar.vehicleType,
                    trafficCar
                );
                trafficCar.speed = this.getTrafficSpeed(trafficCar.vehicleType);
                trafficCar.baseSpeed = this.getVehicleSpec(trafficCar.vehicleType).speedBase;
                this.placeTrafficCar(trafficCar, spawnPose.z, spawnPose.xOffset);
            }

            this.placeTrafficCar(trafficCar, trafficCar.progressZ, trafficCar.xOffset);
            this.animateVehicleWheels(trafficCar.mesh, trafficCar.speed * 0.72, 0);
        });

        this.resolveTrafficSpacing();

        this.trafficCars.forEach(trafficCar => {
            if (this.activeCollision && this.activeCollision.trafficCar === trafficCar) {
                return;
            }

            if (!this.activeCollision && this.isPlayerCollidingWithTraffic(trafficCar) && this.game.car.trafficCollisionCooldown === 0) {
                this.triggerTrafficCollision(trafficCar);
            }
        });
    }

    updateRaceCompetitors() {
        if (this.game.car.trafficCollisionCooldown > 0) {
            this.game.car.trafficCollisionCooldown--;
        }

        const raceStarted = Boolean(this.game.startTime);
        const roadLimit = this.game.road.width / 2 - 2.2;
        const playerProgress = this.game.startLine - this.game.car.position.z;
        const totalLength = this.game.startLine - this.game.finishLine;

        this.trafficCars.forEach((competitor, index) => {
            if (!competitor.raceCompetitor || competitor.finishedAt) {
                return;
            }

            const competitorZ = competitor.progressZ ?? competitor.mesh.position.z;
            const competitorProgress = this.game.startLine - competitorZ;
            const currentFrame = this.getVehicleRoadFrame(competitorZ, -1, competitor.vehicleType);
            const lookAheadFrame = this.getVehicleRoadFrame(competitorZ - 95, -1, competitor.vehicleType);
            const cornerDemand = THREE.MathUtils.clamp(Math.abs(this.getAngleDelta(currentFrame.yaw, lookAheadFrame.yaw)) / 0.16, 0, 1);
            const gridTuning = competitor.gridTuning || this.getGridRaceTuning();
            const catchup = THREE.MathUtils.clamp(
                (playerProgress - competitorProgress) / Math.max(260, totalLength * 0.52),
                gridTuning.catchupMin,
                gridTuning.catchupMax
            );
            const launchBoost = raceStarted && (competitor.launchBoostFrames || 0) > 0 ? gridTuning.launchBoost : 0;
            const cornerCarry = raceStarted ? cornerDemand * gridTuning.cornerCarry : 0;
            const targetSpeed = raceStarted ? Math.max(gridTuning.minSpeed, competitor.baseSpeed + catchup + launchBoost + cornerCarry) : 0;
            const response = targetSpeed > competitor.speed ? gridTuning.accelerationResponse : gridTuning.decelerationResponse;
            competitor.speed += (targetSpeed - competitor.speed) * response;
            if (raceStarted && competitor.launchBoostFrames > 0) {
                competitor.launchBoostFrames--;
            }
            this.updateRaceCompetitorRacecraft(competitor, index, gridTuning, roadLimit);
            const inImpactRecovery = competitor.impactHeadingFrames > 0;
            const recoveryGrip = inImpactRecovery ? 0.034 : competitor.contactRecoveryFrames > 0 ? 0.024 : 0.05;
            competitor.headingOffset = this.lerpAngle(competitor.headingOffset || 0, 0, recoveryGrip);
            competitor.yawVelocity = (competitor.yawVelocity || 0) * (inImpactRecovery ? 0.84 : competitor.contactRecoveryFrames > 0 ? 0.88 : 0.82);
            competitor.headingOffset += competitor.yawVelocity;
            competitor.headingOffset = THREE.MathUtils.clamp(competitor.headingOffset || 0, -0.5, 0.5);
            competitor.lateralVelocity = (competitor.lateralVelocity || 0) * (inImpactRecovery ? 0.88 : competitor.contactRecoveryFrames > 0 ? 0.92 : 0.88);
            if (competitor.contactRecoveryFrames > 0) {
                competitor.contactRecoveryFrames--;
            }
            if (competitor.impactHeadingFrames > 0) {
                competitor.impactHeadingFrames--;
                competitor.targetXOffset = competitor.xOffset - Math.sin(competitor.headingOffset || 0) * 5.5;
            }
            const headingLateral = -Math.sin(competitor.headingOffset || 0) * competitor.speed * 0.96;
            competitor.progressZ = competitorZ - Math.cos(competitor.headingOffset || 0) * competitor.speed;
            competitor.targetXOffset += Math.sin((competitor.progressZ * 0.006) + index) * gridTuning.laneChangeRate;
            competitor.targetXOffset = THREE.MathUtils.clamp(competitor.targetXOffset, -roadLimit, roadLimit);
            const laneReturn = inImpactRecovery ? 0.01 : competitor.contactRecoveryFrames > 0 ? 0.026 : gridTuning.laneReturn;
            competitor.xOffset += (competitor.targetXOffset - competitor.xOffset) * laneReturn + headingLateral + (competitor.lateralVelocity || 0);
            competitor.xOffset = THREE.MathUtils.clamp(competitor.xOffset, -roadLimit, roadLimit);
            if (Math.abs(competitor.lateralVelocity || 0) < 0.01 && competitor.contactRecoveryFrames <= 0 && !inImpactRecovery) {
                competitor.headingOffset = this.lerpAngle(competitor.headingOffset || 0, 0, 0.08);
            }

            this.placeTrafficCar(
                competitor,
                competitor.progressZ,
                competitor.xOffset,
                -1,
                competitor.headingOffset || 0,
                THREE.MathUtils.clamp(-(competitor.lateralVelocity || 0) * 0.6, -0.14, 0.14)
            );
            this.animateVehicleWheels(competitor.mesh, competitor.speed * 0.72, 0);

            if (competitor.progressZ <= this.game.finishLine) {
                const elapsed = this.getElapsedRaceTime();
                competitor.finishedAt = elapsed || 0;
                this.game.raceResults.push({
                    name: competitor.raceName,
                    time: competitor.finishedAt,
                    player: false
                });
            }
        });

        this.resolveTrafficSpacing();

        this.trafficCars.forEach(competitor => {
            if (competitor.finishedAt) {
                return;
            }

            if (this.isPlayerCollidingWithTraffic(competitor) && this.game.car.trafficCollisionCooldown === 0) {
                this.resolveRaceContact(competitor);
            }
        });
    }

    updateRaceCompetitorRacecraft(competitor, index, tuning, roadLimit) {
        if (!this.game?.car || !competitor.raceCompetitor || competitor.contactRecoveryFrames > 0) {
            return;
        }

        const competitorZ = competitor.progressZ ?? competitor.mesh.position.z;
        const playerRelativeZ = this.game.car.position.z - competitorZ;
        const playerBehind = playerRelativeZ > 0 && playerRelativeZ < tuning.awarenessDistance;
        const playerBeside = Math.abs(playerRelativeZ) < 28;
        const playerClosing = this.game.car.speed > competitor.speed + 0.08;
        const laneGap = this.game.car.xOffset - competitor.xOffset;

        if (playerBehind && playerClosing && tuning.defendStrength > 0) {
            competitor.targetXOffset += laneGap * tuning.defendStrength * 0.035;
        }

        if (playerBeside && tuning.defendStrength > 0.45) {
            competitor.targetXOffset += Math.sign(laneGap || 1) * tuning.defendStrength * 0.018;
        }

        let nearestAhead = null;
        let nearestAheadDistance = Infinity;
        this.trafficCars.forEach(other => {
            if (other === competitor || other.finishedAt) {
                return;
            }

            const dz = competitorZ - (other.progressZ ?? other.mesh.position.z);
            if (dz > 0 && dz < nearestAheadDistance && dz < tuning.awarenessDistance * 1.25) {
                nearestAhead = other;
                nearestAheadDistance = dz;
            }
        });

        if (nearestAhead && competitor.speed > nearestAhead.speed + 0.05) {
            const passSide = competitor.xOffset <= nearestAhead.xOffset ? -1 : 1;
            competitor.targetXOffset += passSide * tuning.overtakeStrength * 0.09;
        } else if (!playerBehind) {
            competitor.targetXOffset += ((competitor.baseLaneOffset || 0) - competitor.targetXOffset) * 0.012;
        }

        competitor.targetXOffset = THREE.MathUtils.clamp(competitor.targetXOffset, -roadLimit, roadLimit);
    }

    resolveRaceContact(competitor) {
        const playerLimit = this.getPlayerRoadLimit();
        const competitorLimit = this.game.road.width / 2 - 2.2;
        const playerBounds = this.getVehicleCollisionBounds(this.getPlayerVehicleType());
        const competitorBounds = this.getVehicleCollisionBounds(competitor.vehicleType);
        const lateralLimit = (playerBounds.width + competitorBounds.width) * 0.58;
        const longitudinalLimit = (playerBounds.length + competitorBounds.length) * 0.54;
        const competitorZ = competitor.progressZ ?? competitor.mesh.position.z;
        const relativeZ = competitorZ - this.game.car.position.z;
        const relativeX = competitor.xOffset - this.game.car.xOffset;
        const lateralOverlap = Math.max(0, lateralLimit - Math.abs(this.game.car.xOffset - competitor.xOffset));
        const longitudinalOverlap = Math.max(0, longitudinalLimit - Math.abs(relativeZ));
        const normalLength = Math.max(0.001, Math.hypot(relativeX, relativeZ));
        const normalX = relativeX / normalLength;
        const normalZ = relativeZ / normalLength;
        const playerVx = -Math.sin(this.game.car.travelAngle || 0) * this.game.car.speed + (this.game.car.lateralVelocity || 0);
        const playerVz = -Math.cos(this.game.car.travelAngle || 0) * this.game.car.speed;
        const competitorVx = -Math.sin(competitor.headingOffset || 0) * competitor.speed + (competitor.lateralVelocity || 0);
        const competitorVz = -Math.cos(competitor.headingOffset || 0) * competitor.speed;
        const relativeVx = playerVx - competitorVx;
        const relativeVz = playerVz - competitorVz;
        const closingSpeed = Math.max(0.16, relativeVx * normalX + relativeVz * normalZ);
        const overlapImpulse = lateralOverlap * 0.18 + longitudinalOverlap * 0.12;
        const impulse = THREE.MathUtils.clamp(closingSpeed * 0.48 + overlapImpulse, 0.22, 1.18);
        const forwardImpact = THREE.MathUtils.clamp(Math.abs(normalZ), 0, 1);
        const directHit = forwardImpact * THREE.MathUtils.clamp(closingSpeed / Math.max(0.35, this.game.car.speed || 0.35), 0, 1);
        const side = Math.sign(this.game.car.xOffset - competitor.xOffset) || (Math.random() < 0.5 ? -1 : 1);
        const hitSide = Math.sign(this.game.car.xOffset - competitor.xOffset) || side;
        const playerPush = THREE.MathUtils.clamp(lateralOverlap * 0.62 + impulse * 0.72, 0.28, 1.8);
        const competitorPush = THREE.MathUtils.clamp(lateralOverlap * 0.72 + impulse * 0.86, 0.34, 2.05);
        const playerBehind = this.game.car.position.z > competitorZ;
        const zSeparation = longitudinalOverlap > 0 ? longitudinalOverlap + 0.85 : 0;
        const rearQuarterHit = playerBehind ? 1 : -0.72;
        const offCenter = THREE.MathUtils.clamp(Math.abs(relativeX) / Math.max(0.1, lateralLimit), 0.25, 1.15);
        const torque = THREE.MathUtils.clamp(hitSide * rearQuarterHit * (impulse * 0.48 + longitudinalOverlap * 0.035) * offCenter, -0.58, 0.58);

        this.game.car.xOffset = THREE.MathUtils.clamp(this.game.car.xOffset + side * playerPush, -playerLimit, playerLimit);
        this.game.car.position.z += playerBehind ? zSeparation * 0.58 : -zSeparation * 0.42;
        this.game.car.lateralVelocity -= normalX * impulse * 0.62;
        this.game.car.angle -= torque * 1.18;
        this.game.car.travelAngle -= torque * 0.88;
        this.game.car.yawVelocity = (this.game.car.yawVelocity || 0) - torque * 0.34;
        this.game.car.driftAmount = Math.max(this.game.car.driftAmount || 0, THREE.MathUtils.clamp(impulse * 0.95, 0.24, 0.86));
        const playerSpeedLoss = THREE.MathUtils.clamp(impulse * 0.16 + directHit * 0.34, 0.08, 0.58);
        this.game.car.speed *= 1 - playerSpeedLoss;
        competitor.xOffset = THREE.MathUtils.clamp(competitor.xOffset - side * competitorPush, -competitorLimit, competitorLimit);
        competitor.targetXOffset = competitor.xOffset;
        competitor.progressZ = competitorZ + (playerBehind ? -zSeparation * 0.42 : zSeparation * 0.58);
        competitor.lateralVelocity = (competitor.lateralVelocity || 0) + normalX * impulse * 0.72;
        competitor.yawVelocity = (competitor.yawVelocity || 0) + torque * 0.48;
        competitor.headingOffset = THREE.MathUtils.clamp((competitor.headingOffset || 0) + torque * 1.22, -0.68, 0.68);
        competitor.contactRecoveryFrames = 72;
        competitor.impactHeadingFrames = 42;
        competitor.targetXOffset = competitor.xOffset - Math.sin(competitor.headingOffset || 0) * 5.5;
        const competitorSpeedLoss = THREE.MathUtils.clamp(impulse * 0.1 + directHit * 0.18, 0.04, 0.42);
        competitor.speed *= 1 - competitorSpeedLoss;
        const playerFrame = this.getVehicleRoadFrame(this.game.car.position.z, -1, this.getPlayerVehicleType());
        const playerRoadData = playerFrame.roadData;
        this.carPosition.copy(this.getRoadWorldPosition(
            playerRoadData,
            this.game.car.xOffset,
            this.getVehicleGroundY(playerFrame, this.getPlayerVehicleType())
        ));
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, this.game.car.position.z);
        this.playerCar.position.copy(this.carPosition);
        this.playerCar.userData.roadProgressZ = this.game.car.position.z;
        this.applyVehicleRoadPose(this.playerCar, playerFrame, this.getAngleDelta(playerFrame.yaw, this.game.car.visualYaw || playerFrame.yaw));
        this.alignVehicleToRoadSurface(this.playerCar);
        this.carPosition.copy(this.playerCar.position);
        this.game.car.position.set(this.carPosition.x, this.carPosition.y, this.game.car.position.z);
        this.placeTrafficCar(competitor, competitor.progressZ, competitor.xOffset, -1, competitor.headingOffset || 0);
        this.game.car.trafficCollisionCooldown = 8;
        this.cameraShakeDuration = 17;
        this.cameraShakeFrames = 17;
        this.cameraShakeStrength = THREE.MathUtils.clamp(0.1 + impulse * 0.18, 0.14, 0.3);
        this.createRubBurst(this.playerCar.position.clone().add(competitor.mesh.position).multiplyScalar(0.5));
    }

    resolveRaceCompetitorContact(a, b, lateralLimit, longitudinalLimit, xGap, zGap) {
        const relativeX = b.xOffset - a.xOffset;
        const aProgressZ = a.progressZ ?? a.mesh.position.z;
        const bProgressZ = b.progressZ ?? b.mesh.position.z;
        const relativeZ = bProgressZ - aProgressZ;
        const normalLength = Math.max(0.001, Math.hypot(relativeX, relativeZ));
        const normalX = relativeX / normalLength;
        const normalZ = relativeZ / normalLength;
        const lateralOverlap = Math.max(0, lateralLimit - xGap);
        const longitudinalOverlap = Math.max(0, longitudinalLimit - zGap);
        const aVx = -Math.sin(a.headingOffset || 0) * a.speed + (a.lateralVelocity || 0);
        const aVz = -Math.cos(a.headingOffset || 0) * a.speed;
        const bVx = -Math.sin(b.headingOffset || 0) * b.speed + (b.lateralVelocity || 0);
        const bVz = -Math.cos(b.headingOffset || 0) * b.speed;
        const closingSpeed = Math.max(0.08, (aVx - bVx) * normalX + (aVz - bVz) * normalZ);
        const impulse = THREE.MathUtils.clamp(closingSpeed * 0.34 + lateralOverlap * 0.12 + longitudinalOverlap * 0.08, 0.12, 0.68);
        const side = Math.sign(a.xOffset - b.xOffset) || 1;
        const aBehind = aProgressZ > bProgressZ;
        const rearQuarter = aBehind ? 1 : -1;
        const offCenter = THREE.MathUtils.clamp(Math.abs(relativeX) / Math.max(0.1, lateralLimit), 0.2, 1);
        const torque = THREE.MathUtils.clamp(side * rearQuarter * (impulse * 0.34 + longitudinalOverlap * 0.018) * offCenter, -0.34, 0.34);
        const roadLimit = this.game.road.width / 2 - 2.2;
        const lateralCorrection = lateralOverlap * 0.42 + impulse * 0.42;
        const zCorrection = longitudinalOverlap > 0 ? longitudinalOverlap + 0.55 : 0;

        a.xOffset = THREE.MathUtils.clamp(a.xOffset + side * lateralCorrection, -roadLimit, roadLimit);
        b.xOffset = THREE.MathUtils.clamp(b.xOffset - side * lateralCorrection, -roadLimit, roadLimit);
        a.targetXOffset = a.xOffset;
        b.targetXOffset = b.xOffset;
        a.progressZ = aProgressZ + (aBehind ? zCorrection * 0.56 : -zCorrection * 0.44);
        b.progressZ = bProgressZ + (aBehind ? -zCorrection * 0.44 : zCorrection * 0.56);

        a.lateralVelocity = (a.lateralVelocity || 0) - normalX * impulse * 0.46;
        b.lateralVelocity = (b.lateralVelocity || 0) + normalX * impulse * 0.46;
        a.yawVelocity = (a.yawVelocity || 0) - torque * 0.32;
        b.yawVelocity = (b.yawVelocity || 0) + torque * 0.32;
        a.headingOffset = THREE.MathUtils.clamp((a.headingOffset || 0) - torque * 0.86, -0.48, 0.48);
        b.headingOffset = THREE.MathUtils.clamp((b.headingOffset || 0) + torque * 0.86, -0.48, 0.48);
        a.contactRecoveryFrames = Math.max(a.contactRecoveryFrames || 0, 52);
        b.contactRecoveryFrames = Math.max(b.contactRecoveryFrames || 0, 52);
        a.impactHeadingFrames = Math.max(a.impactHeadingFrames || 0, 34);
        b.impactHeadingFrames = Math.max(b.impactHeadingFrames || 0, 34);
        a.targetXOffset = a.xOffset - Math.sin(a.headingOffset || 0) * 5.2;
        b.targetXOffset = b.xOffset - Math.sin(b.headingOffset || 0) * 5.2;
        a.speed *= THREE.MathUtils.clamp(1 - impulse * 0.1, 0.86, 0.96);
        b.speed *= THREE.MathUtils.clamp(1 - impulse * 0.1, 0.86, 0.96);

        this.placeTrafficCar(a, a.progressZ, a.xOffset, -1, a.headingOffset || 0);
        this.placeTrafficCar(b, b.progressZ, b.xOffset, -1, b.headingOffset || 0);
    }

    resolveTrafficSpacing() {
        for (let iteration = 0; iteration < 2; iteration++) {
            for (let i = 0; i < this.trafficCars.length; i++) {
                const a = this.trafficCars[i];
                if (this.activeCollision && this.activeCollision.trafficCar === a) {
                    continue;
                }

                for (let j = i + 1; j < this.trafficCars.length; j++) {
                    const b = this.trafficCars[j];
                    if (this.activeCollision && this.activeCollision.trafficCar === b) {
                        continue;
                    }

                    const aBounds = this.getVehicleCollisionBounds(a.vehicleType);
                    const bBounds = this.getVehicleCollisionBounds(b.vehicleType);
                    const xGap = Math.abs(a.xOffset - b.xOffset);
                    const aProgressZ = a.progressZ ?? a.mesh.position.z;
                    const bProgressZ = b.progressZ ?? b.mesh.position.z;
                    const zGap = Math.abs(aProgressZ - bProgressZ);
                    const sameDirectionRace = this.game?.settings?.raceModeId === 'race';
                    const lateralLimit = (aBounds.width + bBounds.width) * 0.62;
                    const longitudinalLimit = sameDirectionRace
                        ? Math.max(8, (aBounds.length + bBounds.length) * 1.05)
                        : Math.max(30, (aBounds.length + bBounds.length) * 2.9);

                    if (xGap >= lateralLimit || zGap >= longitudinalLimit) {
                        continue;
                    }

                    const rearCar = sameDirectionRace
                        ? (aProgressZ > bProgressZ ? a : b)
                        : (aProgressZ < bProgressZ ? a : b);
                    const correction = (longitudinalLimit - zGap) * 0.62 + 1.2;
                    if (sameDirectionRace) {
                        this.resolveRaceCompetitorContact(a, b, lateralLimit, longitudinalLimit, xGap, zGap);
                    } else {
                        rearCar.progressZ = (rearCar.progressZ ?? rearCar.mesh.position.z) - correction;
                        this.placeTrafficCar(rearCar, rearCar.progressZ, rearCar.xOffset, 1);
                    }
                }
            }
        }
    }

    isPlayerCollidingWithTraffic(trafficCar) {
        const playerBounds = this.getVehicleCollisionBounds(this.getPlayerVehicleType());
        const trafficBounds = this.getVehicleCollisionBounds(trafficCar.vehicleType);
        const xGap = Math.abs(this.game.car.xOffset - trafficCar.xOffset);
        const relativeZ = (trafficCar.progressZ ?? trafficCar.mesh.position.z) - this.game.car.position.z;
        if (this.game?.settings?.raceModeId !== 'race' && relativeZ > 1.5) {
            return false;
        }

        const zGap = Math.abs(relativeZ);
        const lateralLimit = (playerBounds.width + trafficBounds.width) * 0.55;
        const longitudinalLimit = (playerBounds.length + trafficBounds.length) * 0.52;
        const closingAllowance = Math.min(0.55, this.game.car.speed * 0.08 + trafficCar.speed * 0.06);

        const jumpOffset = this.game.car.jumpOffset || 0;
        if (jumpOffset > 1.35) {
            return false;
        }

        return xGap < lateralLimit && zGap < longitudinalLimit + closingAllowance;
    }

    getCameraMode() {
        const mode = this.cameraMode || this.cameraModes[this.cameraModeIndex] || this.cameraModes[0];
        if (this.isCameraModeAvailableForVehicle(mode, this.getPlayerVehicleType())) {
            return mode;
        }

        return this.cameraModes[this.getFallbackCameraModeIndex(this.getPlayerVehicleType())] || this.cameraModes[0];
    }

    isCameraModeAvailableForVehicle(mode, vehicleType = this.getPlayerVehicleType()) {
        const modeId = typeof mode === 'string' ? mode : mode?.id;
        if (!modeId) {
            return false;
        }

        const excluded = this.vehicleCameraModeExclusions?.[vehicleType] || [];
        return !excluded.includes(modeId);
    }

    getFallbackCameraModeIndex(vehicleType = this.getPlayerVehicleType()) {
        const index = this.cameraModes.findIndex(mode => this.isCameraModeAvailableForVehicle(mode, vehicleType));
        return index >= 0 ? index : 0;
    }

    ensureCameraModeForVehicle(vehicleType = this.getPlayerVehicleType()) {
        const current = this.cameraModes[this.cameraModeIndex] || this.cameraMode || this.cameraModes[0];
        if (this.isCameraModeAvailableForVehicle(current, vehicleType)) {
            return current;
        }

        const fallbackIndex = this.getFallbackCameraModeIndex(vehicleType);
        this.cameraModeIndex = fallbackIndex;
        this.cameraMode = this.cameraModes[fallbackIndex];
        if (this.camera) {
            this.applyCameraModeSettings();
            if (this.game) {
                this.updateCameraPosition();
            }
        }
        return this.cameraMode;
    }

    canUseCameraMode(modeId, vehicleType = this.getPlayerVehicleType()) {
        return this.cameraModes.some(mode => mode.id === modeId)
            && this.isCameraModeAvailableForVehicle(modeId, vehicleType);
    }

    getActiveCameraMode() {
        const mode = this.getCameraMode();
        if (mode.id !== 'cockpitInterior') {
            return mode;
        }

        const vehicleType = this.getPlayerVehicleType();
        return {
            ...mode,
            ...(this.cockpitInteriorRigs[vehicleType] || this.cockpitInteriorRigs.rally || {})
        };
    }

    setCameraMode(mode) {
        const nextIndex = typeof mode === 'number'
            ? THREE.MathUtils.euclideanModulo(mode, this.cameraModes.length)
            : this.cameraModes.findIndex(cameraMode => cameraMode.id === mode);
        if (nextIndex < 0) {
            return this.getCameraMode();
        }

        if (!this.isCameraModeAvailableForVehicle(this.cameraModes[nextIndex], this.getPlayerVehicleType())) {
            return this.ensureCameraModeForVehicle(this.getPlayerVehicleType());
        }

        this.cameraModeIndex = nextIndex;
        this.cameraMode = this.cameraModes[nextIndex];
        this.applyCameraModeSettings();
        if (this.game) {
            this.updateCameraPosition();
        }
        return this.cameraMode;
    }

    cycleCameraMode() {
        this.disableDebugFreeCamera();
        const vehicleType = this.getPlayerVehicleType();
        let nextIndex = this.cameraModeIndex;
        for (let i = 0; i < this.cameraModes.length; i++) {
            nextIndex = THREE.MathUtils.euclideanModulo(nextIndex + 1, this.cameraModes.length);
            if (this.isCameraModeAvailableForVehicle(this.cameraModes[nextIndex], vehicleType)) {
                return this.setCameraMode(nextIndex);
            }
        }

        return this.ensureCameraModeForVehicle(vehicleType);
    }

    applyCameraModeSettings() {
        const mode = this.getActiveCameraMode();
        if (this.camera && this.camera.fov !== mode.fov) {
            this.camera.fov = mode.fov;
        }
        if (this.camera && this.camera.near !== (mode.near || 0.1)) {
            this.camera.near = mode.near || 0.1;
        }
        if (this.camera && this.camera.far !== (mode.far || 1000)) {
            this.camera.far = mode.far || 1000;
        }
        if (this.camera) {
            this.camera.updateProjectionMatrix();
        }

        if (this.playerCar) {
            this.playerCar.visible = !mode.hideVehicle;
            this.updatePlayerCockpitGlass(mode);
        }
    }

    updatePlayerCockpitGlass(mode = this.getActiveCameraMode()) {
        if (!this.playerCar) {
            return;
        }

        const hideGlass = mode.id === 'cockpitInterior';
        this.playerCar.traverse(child => {
            if (!child.isMesh || !child.material) {
                return;
            }

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            const hasGlassMaterial = materials.some(material => material?.userData?.isVehicleGlass);
            if (!hasGlassMaterial) {
                return;
            }

            if (child.userData.cockpitBaseVisible === undefined) {
                child.userData.cockpitBaseVisible = child.visible;
            }
            child.visible = hideGlass ? false : child.userData.cockpitBaseVisible;

            materials.forEach(material => {
                if (!material?.userData?.isVehicleGlass) {
                    return;
                }

                if (material.userData.cockpitBaseOpacity === undefined) {
                    material.userData.cockpitBaseOpacity = material.opacity;
                    material.userData.cockpitBaseTransparent = material.transparent;
                    material.userData.cockpitBaseDepthWrite = material.depthWrite;
                    material.userData.cockpitBaseColorWrite = material.colorWrite;
                }

                if (!hideGlass) {
                    material.opacity = material.userData.cockpitBaseOpacity;
                    material.transparent = material.userData.cockpitBaseTransparent;
                    material.depthWrite = material.userData.cockpitBaseDepthWrite;
                    material.colorWrite = material.userData.cockpitBaseColorWrite;
                } else {
                    material.opacity = 0;
                    material.transparent = true;
                    material.depthWrite = false;
                    material.colorWrite = false;
                }
                material.needsUpdate = true;
            });
        });
    }

    resolveCameraOcclusion(cameraPosition, mode) {
        if (!mode.occlusion || !this.game?.cameraOccluders?.length) {
            return cameraPosition;
        }

        const rayStart = this.carPosition.clone().add(new THREE.Vector3(0, mode.height, 0));
        const rayDirection = cameraPosition.clone().sub(rayStart);
        const targetDistance = rayDirection.length();
        if (targetDistance <= 0.001) {
            return cameraPosition;
        }

        rayDirection.normalize();
        const ray = new THREE.Raycaster(rayStart, rayDirection);
        const intersects = ray.intersectObjects(this.game.cameraOccluders, true);

        if (intersects.length > 0 && intersects[0].distance < targetDistance) {
            const adjustedDistance = Math.max(intersects[0].distance, Math.min(this.minCameraDistance, targetDistance));
            return rayStart.add(rayDirection.multiplyScalar(adjustedDistance));
        }

        return cameraPosition;
    }

    getVehicleLocalDirection(localDirection) {
        if (!this.playerCar) {
            return localDirection.clone().normalize();
        }

        this.playerCar.updateMatrixWorld(true);
        const quaternion = this.playerCar.getWorldQuaternion(new THREE.Quaternion());
        return localDirection.clone().applyQuaternion(quaternion).normalize();
    }

    getVehicleLocalPosition(localPosition) {
        if (!this.playerCar) {
            return this.carPosition.clone().add(localPosition);
        }

        this.playerCar.updateMatrixWorld(true);
        return this.playerCar.localToWorld(localPosition.clone());
    }

    getVehicleAnchoredCockpitFrame(mode) {
        const cameraLocal = new THREE.Vector3(
            mode.lateral || 0,
            mode.height || 1,
            -(mode.forward || 0)
        );
        const lookAtLocal = new THREE.Vector3(
            mode.lookLateral ?? mode.lateral ?? 0,
            mode.lookHeight ?? mode.height ?? 1,
            -(mode.lookAhead || 10)
        );
        const cameraPosition = this.getVehicleLocalPosition(cameraLocal);
        const lookAtPosition = this.getVehicleLocalPosition(lookAtLocal);
        const carDirection = this.getVehicleLocalDirection(new THREE.Vector3(0, 0, -1));
        const cameraUp = this.getVehicleLocalDirection(new THREE.Vector3(0, 1, 0));

        return {
            mode,
            carDirection,
            cameraPosition,
            lookAtPosition,
            cameraUp
        };
    }

    getCameraFrame() {
        const mode = this.getActiveCameraMode();
        const cameraYaw = this.game.car.driveYaw ?? this.game.car.visualYaw ?? this.game.car.angle;
        const carDirection = new THREE.Vector3(
            -Math.sin(cameraYaw),
            0,
            -Math.cos(cameraYaw)
        ).normalize();
        const carRight = new THREE.Vector3(
            Math.cos(cameraYaw),
            0,
            -Math.sin(cameraYaw)
        ).normalize();

        if (mode.type === 'cockpit') {
            if (mode.id === 'cockpitInterior' && this.playerCar) {
                return this.getVehicleAnchoredCockpitFrame(mode);
            }

            return {
                mode,
                carDirection,
                cameraPosition: this.carPosition.clone()
                    .add(carRight.clone().multiplyScalar(mode.lateral))
                    .add(carDirection.clone().multiplyScalar(mode.forward))
                    .add(new THREE.Vector3(0, mode.height, 0)),
                lookAtPosition: this.carPosition.clone()
                    .add(carDirection.clone().multiplyScalar(mode.lookAhead))
                    .add(new THREE.Vector3(0, mode.lookHeight, 0))
            };
        }

        if (mode.type === 'trackOverview') {
            const segments = this.game?.road?.segments || [];
            const bounds = segments.reduce((acc, segment) => {
                const halfWidth = (segment.width || this.game.road.width || 24) * 0.5;
                const centerX = Number.isFinite(segment.pathX) ? segment.pathX : segment.curve;
                const centerZ = Number.isFinite(segment.pathZ) ? segment.pathZ : segment.z;
                acc.minX = Math.min(acc.minX, centerX - halfWidth);
                acc.maxX = Math.max(acc.maxX, centerX + halfWidth);
                acc.minZ = Math.min(acc.minZ, centerZ - halfWidth);
                acc.maxZ = Math.max(acc.maxZ, centerZ + halfWidth);
                acc.maxY = Math.max(acc.maxY, segment.y || 0);
                return acc;
            }, {
                minX: Infinity,
                maxX: -Infinity,
                minZ: Infinity,
                maxZ: -Infinity,
                maxY: 0
            });
            const hasBounds = Number.isFinite(bounds.minX)
                && Number.isFinite(bounds.maxX)
                && Number.isFinite(bounds.minZ)
                && Number.isFinite(bounds.maxZ);
            const center = hasBounds
                ? new THREE.Vector3((bounds.minX + bounds.maxX) * 0.5, bounds.maxY, (bounds.minZ + bounds.maxZ) * 0.5)
                : this.carPosition.clone();
            const spanX = hasBounds ? Math.max(1, bounds.maxX - bounds.minX) : 120;
            const spanZ = hasBounds ? Math.max(1, bounds.maxZ - bounds.minZ) : 120;
            const aspect = this.renderer?.domElement?.clientWidth && this.renderer?.domElement?.clientHeight
                ? this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight
                : window.innerWidth / Math.max(1, window.innerHeight);
            const verticalFit = spanZ / (2 * Math.tan(THREE.MathUtils.degToRad(mode.fov) * 0.5));
            const horizontalFit = spanX / (2 * Math.tan(THREE.MathUtils.degToRad(mode.fov) * 0.5) * Math.max(0.1, aspect));
            const height = Math.max(verticalFit, horizontalFit, 240) * (mode.padding || 1.15);

            return {
                mode,
                carDirection: new THREE.Vector3(0, 0, -1),
                cameraPosition: center.clone().add(new THREE.Vector3(0, height, 0)),
                lookAtPosition: center,
                cameraUp: new THREE.Vector3(0, 0, -1)
            };
        }

        if (mode.type === 'topDown') {
            const focusPoint = this.carPosition.clone()
                .add(carDirection.clone().multiplyScalar(mode.forwardOffset || 0));
            return {
                mode,
                carDirection,
                cameraPosition: focusPoint.clone().add(new THREE.Vector3(0, mode.height, 0)),
                lookAtPosition: focusPoint
                    .add(new THREE.Vector3(0, 0.05, 0))
            };
        }

        const cameraDistanceDirection = mode.distanceDirection || -1;
        const cameraPosition = this.carPosition.clone()
            .add(carRight.clone().multiplyScalar(mode.lateral || 0))
            .add(carDirection.clone().multiplyScalar(cameraDistanceDirection * mode.distance))
            .add(new THREE.Vector3(0, mode.height, 0));
        return {
            mode,
            carDirection,
            cameraPosition: this.resolveCameraOcclusion(cameraPosition, mode),
            lookAtPosition: this.carPosition.clone()
                .add(carDirection.clone().multiplyScalar(mode.lookAhead))
                .add(new THREE.Vector3(0, mode.lookHeight, 0))
        };
    }

    enableDebugFreeCamera() {
        if (!this.game || !this.playerCar) {
            return null;
        }

        this.setCameraMode('close');
        const target = this.carPosition.clone().add(new THREE.Vector3(0, this.debugFreeCamera.targetYOffset, 0));
        const offset = this.camera.position.clone().sub(target);
        const distance = THREE.MathUtils.clamp(offset.length() || 7.5, 2.2, 45);
        this.debugFreeCamera = {
            ...this.debugFreeCamera,
            active: true,
            yaw: Math.atan2(offset.x, offset.z),
            pitch: Math.asin(THREE.MathUtils.clamp(offset.y / distance, -0.85, 0.85)),
            distance
        };
        this.updateDebugFreeCameraPosition();
        return this.getDebugFreeCameraState();
    }

    disableDebugFreeCamera() {
        if (!this.debugFreeCamera?.active) {
            return;
        }

        this.debugFreeCamera.active = false;
        if (this.game) {
            this.updateCameraPosition();
        }
    }

    isDebugFreeCameraActive() {
        return Boolean(this.debugFreeCamera?.active);
    }

    adjustDebugFreeCamera({ yawDelta = 0, pitchDelta = 0, distanceDelta = 0, targetYDelta = 0 } = {}) {
        if (!this.debugFreeCamera?.active) {
            return null;
        }

        this.debugFreeCamera.yaw += yawDelta;
        this.debugFreeCamera.pitch = THREE.MathUtils.clamp(
            this.debugFreeCamera.pitch + pitchDelta,
            -0.12,
            1.18
        );
        this.debugFreeCamera.distance = THREE.MathUtils.clamp(
            this.debugFreeCamera.distance + distanceDelta,
            2.2,
            45
        );
        this.debugFreeCamera.targetYOffset = THREE.MathUtils.clamp(
            this.debugFreeCamera.targetYOffset + targetYDelta,
            -1.6,
            8
        );
        this.updateDebugFreeCameraPosition();
        return this.getDebugFreeCameraState();
    }

    updateDebugFreeCameraPosition() {
        if (!this.debugFreeCamera?.active || !this.game) {
            return;
        }

        const { yaw, pitch, distance, targetYOffset } = this.debugFreeCamera;
        const target = this.carPosition.clone().add(new THREE.Vector3(0, targetYOffset, 0));
        const horizontalDistance = Math.cos(pitch) * distance;
        const cameraPosition = target.clone().add(new THREE.Vector3(
            Math.sin(yaw) * horizontalDistance,
            Math.sin(pitch) * distance,
            Math.cos(yaw) * horizontalDistance
        ));
        this.camera.up.set(0, 1, 0);
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(target);
    }

    getDebugFreeCameraState() {
        if (!this.debugFreeCamera) {
            return null;
        }

        return {
            active: Boolean(this.debugFreeCamera.active),
            yaw: Number(this.debugFreeCamera.yaw.toFixed(3)),
            pitch: Number(this.debugFreeCamera.pitch.toFixed(3)),
            distance: Number(this.debugFreeCamera.distance.toFixed(2)),
            targetYOffset: Number(this.debugFreeCamera.targetYOffset.toFixed(2))
        };
    }

    updateCameraPosition() {
        if (this.debugFreeCamera?.active) {
            this.updateDebugFreeCameraPosition();
            return;
        }

        const { mode, carDirection, cameraPosition, lookAtPosition, cameraUp } = this.getCameraFrame();
        if (this.scene) {
            if (mode.type === 'trackOverview') {
                if (this.trackOverviewStoredFog === undefined) {
                    this.trackOverviewStoredFog = this.scene.fog || null;
                }
                this.scene.fog = null;
            } else if (this.trackOverviewStoredFog !== undefined) {
                this.scene.fog = this.trackOverviewStoredFog;
                this.trackOverviewStoredFog = undefined;
            }
        }

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

        if (cameraUp) {
            this.camera.up.copy(cameraUp);
        } else if (mode.type === 'topDown') {
            this.camera.up.copy(carDirection);
        } else {
            this.camera.up.set(0, 1, 0);
        }

        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(lookAtPosition);
    }

    setControls(controls) {
        this.controls = { ...this.controls, ...controls };
    }

    queueJump() {
        if (!this.game?.car || this.isPaused || this.activeCollision || this.game.finishTime) {
            return false;
        }

        this.game.car.jumpQueued = true;
        return true;
    }
}

// This function should be defined in your roadGenerator.js file
// Make sure it's accessible to the GameManager class
function getRoadDataAtZ(z, game) {
    const segmentLength = 10;
    const maxIndex = game.road.segments.length - 1;
    const hasStoredPath = Boolean(game.road.hasStoredPath)
        || game.road.segments.some(roadSegment => Number.isFinite(roadSegment.pathX) && Number.isFinite(roadSegment.pathZ));
    const pathLength = Math.max(1, game.road.length || Math.abs(game.finishLine || 0) || maxIndex * segmentLength);
    const hasPeriodicStoredPath = hasStoredPath && game.road.segments.length > 4;
    const periodicSegmentCount = hasPeriodicStoredPath
        ? Math.max(2, Math.ceil(pathLength / segmentLength))
        : maxIndex + 1;
    const distanceFromStart = Number.isFinite(game.startLine)
        ? game.startLine - z
        : -z;
    const progress = hasPeriodicStoredPath
        ? ((distanceFromStart % pathLength) + pathLength) % pathLength
        : Math.abs(z);
    const rawIndex = hasPeriodicStoredPath
        ? progress / segmentLength
        : Math.max(0, Math.min(maxIndex, progress / segmentLength));
    const baseIndex = Math.floor(rawIndex);
    const index = hasPeriodicStoredPath
        ? THREE.MathUtils.euclideanModulo(baseIndex, periodicSegmentCount)
        : baseIndex;
    const t = rawIndex - baseIndex;
    const getSegment = offset => {
        if (hasPeriodicStoredPath) {
            return game.road.segments[THREE.MathUtils.euclideanModulo(index + offset, periodicSegmentCount)];
        }

        return game.road.segments[Math.max(0, Math.min(maxIndex, index + offset))];
    };
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
    const valueAt = (roadSegment, key, fallback) => Number.isFinite(roadSegment?.[key]) ? roadSegment[key] : fallback;
    const curve = smoothValue(previousSegment.curve, segment.curve, nextSegment.curve, followingSegment.curve);
    const y = smoothValue(previousSegment.y, segment.y, nextSegment.y, followingSegment.y);
    const width = smoothValue(
        previousSegment.width || game.road.width,
        segment.width || game.road.width,
        nextSegment.width || game.road.width,
        followingSegment.width || game.road.width
    );
    const nextCurve = smoothValue(segment.curve, nextSegment.curve, followingSegment.curve, getSegment(3).curve);
    const pathX = smoothValue(
        valueAt(previousSegment, 'pathX', previousSegment.curve),
        valueAt(segment, 'pathX', segment.curve),
        valueAt(nextSegment, 'pathX', nextSegment.curve),
        valueAt(followingSegment, 'pathX', followingSegment.curve)
    );
    const pathZ = smoothValue(
        valueAt(previousSegment, 'pathZ', previousSegment.z),
        valueAt(segment, 'pathZ', segment.z),
        valueAt(nextSegment, 'pathZ', nextSegment.z),
        valueAt(followingSegment, 'pathZ', followingSegment.z)
    );
    const tangentX = smoothValue(
        valueAt(previousSegment, 'tangentX', 0),
        valueAt(segment, 'tangentX', 0),
        valueAt(nextSegment, 'tangentX', 0),
        valueAt(followingSegment, 'tangentX', 0)
    );
    const tangentZ = smoothValue(
        valueAt(previousSegment, 'tangentZ', -1),
        valueAt(segment, 'tangentZ', -1),
        valueAt(nextSegment, 'tangentZ', -1),
        valueAt(followingSegment, 'tangentZ', -1)
    );
    const tangentLength = Math.max(0.0001, Math.hypot(tangentX, tangentZ));
    const normalizedTangentX = tangentX / tangentLength;
    const normalizedTangentZ = tangentZ / tangentLength;

    return {
        y,
        curve,
        z,
        worldX: hasStoredPath ? pathX : curve,
        worldZ: hasStoredPath ? pathZ : z,
        pathX,
        pathZ,
        tangentX: hasStoredPath ? normalizedTangentX : 0,
        tangentZ: hasStoredPath ? normalizedTangentZ : -1,
        normalX: hasStoredPath ? -normalizedTangentZ : 1,
        normalZ: hasStoredPath ? normalizedTangentX : 0,
        storedProgress: hasStoredPath ? progress : null,
        width,
        curvatureAngle: hasStoredPath ? Math.atan2(-normalizedTangentX, -normalizedTangentZ) : Math.atan2(nextCurve - curve, segmentLength)
    };
}
