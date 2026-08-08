/* ============================================================
   KESEMPATAN OS - LIVING AI NETWORK BACKGROUND (INSTANCED MESH)
    background.js
    SINGLE FILE — OPTIMIZED FOR ANDROID
    UKURAN PARTIKEL SANGAT KECIL (0.03 - 0.08)
   ============================================================ */

(function() {
    'use strict';

    const CONFIG = {
        starCount: 1200,
        particleCount: 80,
        connectionDistance: 4.5,
        auroraCount: 3,
        maxFps: 30,
        colors: {
            idle: '#00FFA3',
            thinking: '#4FC3F7',
            analysis: '#AB47BC',
            success: '#00E676',
            warning: '#FFB300',
            error: '#FF5252',
            aurora: ['#00FFA3', '#4FC3F7', '#00E676']
        }
    };

    const state = {
        mode: 'idle',
        targetColor: CONFIG.colors.idle,
        currentColor: CONFIG.colors.idle,
        targetSpeed: 1.0,
        currentSpeed: 1.0,
        isPulseActive: false,
        isChaosActive: false,
        connectionOpacity: 0.12,
        particleSize: 1.0
    };

    function loadThreeAndInit() {
        let loaded = false;

        function tryLoad(src, isFallback) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = function() {
                if (!loaded) {
                    loaded = true;
                    defineAllModules();
                }
            };
            script.onerror = function() {
                if (!isFallback) {
                    tryLoad('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', true);
                } else {
                    showFallbackUI();
                }
            };
            document.body.appendChild(script);
        }

        tryLoad('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js', false);

        setTimeout(function() {
            if (typeof THREE === 'undefined' && !loaded) {
                tryLoad('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', true);
            }
        }, 6000);
    }

    function showFallbackUI() {
        const container = document.getElementById('bg-canvas-container');
        if (container) {
            container.style.background = 'linear-gradient(135deg, #03050A, #0a0f1c)';
            container.innerHTML = '';
        }
    }

    function cleanupBackground() {
        try {
            const renderer = window.__bgRenderer?.renderer?.();
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement) renderer.domElement.remove();
            }
            const scene = window.__bgRenderer?.scene?.();
            if (scene) {
                scene.traverse(function(obj) {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(function(m) { m.dispose(); });
                        } else {
                            obj.material.dispose();
                        }
                    }
                });
            }
            const container = document.getElementById('bg-canvas-container');
            if (container) container.remove();
        } catch (_) {}
        window.__bgRenderer = null;
        window.Background = null;
    }

    window.addEventListener('beforeunload', cleanupBackground);

    function defineAllModules() {

        if (!window.__bgRenderer) {
            const rendererState = {
                container: null,
                scene: null,
                camera: null,
                renderer: null
            };

            function initRenderer() {
                const container = document.createElement('div');
                container.id = 'bg-canvas-container';
                container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:0;transition:opacity 0.8s ease;';
                document.body.prepend(container);
                rendererState.container = container;

                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x03050A);
                rendererState.scene = scene;

                const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
                camera.position.set(0, 0, 30);
                camera.lookAt(0, 0, 0);
                rendererState.camera = camera;

                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: false,
                    powerPreference: 'low-power'
                });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                container.appendChild(renderer.domElement);
                rendererState.renderer = renderer;

                // FIX: WebGL context lost — kejadian NORMAL & sering di
                // Android Chrome (device di-background lama, GPU driver
                // reset, memori GPU ditekan OS) yang SEBELUMNYA sama
                // sekali tidak ditangani, bikin canvas jadi hitam PERMANEN
                // setelah beberapa menit karena browser tidak pernah
                // mencoba restore (harus explicit preventDefault()) dan
                // scene lama tidak pernah dibangun ulang.
                renderer.domElement.addEventListener('webglcontextlost', function(event) {
                    event.preventDefault();
                    window.__bgContextLost = true;
                }, false);
                renderer.domElement.addEventListener('webglcontextrestored', function() {
                    window.__bgContextLost = false;
                    // Scene/geometry/material lama sudah tidak valid stlh
                    // context hilang — bangun ulang total dari nol dgn
                    // reset semua singleton modul, bukan cuma renderer-nya.
                    try {
                        const oldContainer = document.getElementById('bg-canvas-container');
                        if (oldContainer) oldContainer.remove();
                    } catch (_) {}
                    window.__bgRenderer = null;
                    window.__bgStars = null;
                    window.__bgParticles = null;
                    window.__bgLines = null;
                    window.__bgAurora = null;
                    window.__bgController = null;
                    window.__bgMain = null;
                    window.Background = null;
                    defineAllModules();
                }, false);

                window.addEventListener('resize', function() {
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h);
                });
            }

            window.__bgRenderer = {
                init: initRenderer,
                scene: function() { return rendererState.scene; },
                camera: function() { return rendererState.camera; },
                renderer: function() { return rendererState.renderer; },
                container: function() { return rendererState.container; }
            };
        }

        if (!window.__bgStars) {
            let starsGroup = null;
            let twinklePhases = [];

            function createStarTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 32, 32);
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                return texture;
            }

            function createStars() {
                const count = CONFIG.starCount;
                const group = new THREE.Group();
                const starTexture = createStarTexture();

                const pos1 = new Float32Array(count * 3);
                for (let i = 0; i < count * 3; i++) pos1[i] = (Math.random() - 0.5) * 400;
                const geo1 = new THREE.BufferGeometry();
                geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
                const mat1 = new THREE.PointsMaterial({
                    size: 0.1,
                    map: starTexture,
                    color: 0x8899cc,
                    transparent: true,
                    opacity: 0.4,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    depthTest: false,
                    sizeAttenuation: true
                });
                group.add(new THREE.Points(geo1, mat1));

                const count2 = Math.floor(count * 0.4);
                const pos2 = new Float32Array(count2 * 3);
                for (let i = 0; i < count2 * 3; i++) pos2[i] = (Math.random() - 0.5) * 200;
                const geo2 = new THREE.BufferGeometry();
                geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
                const mat2 = new THREE.PointsMaterial({
                    size: 0.25,
                    map: starTexture,
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.7,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    depthTest: false,
                    sizeAttenuation: true
                });
                group.add(new THREE.Points(geo2, mat2));

                const total = count + count2;
                twinklePhases = new Float32Array(total);
                for (let i = 0; i < total; i++) {
                    twinklePhases[i] = Math.random() * Math.PI * 2;
                }

                starsGroup = group;
                return group;
            }

            function animateStars(speed, time) {
                if (!starsGroup) return;
                starsGroup.rotation.y += 0.00004 * speed;
                starsGroup.rotation.x += 0.00002 * speed;

                const children = starsGroup.children;
                let idx = 0;
                for (let c = 0; c < children.length; c++) {
                    const points = children[c];
                    const mat = points.material;
                    const count = points.geometry.attributes.position.count;
                    for (let i = 0; i < count; i++) {
                        const phase = twinklePhases[idx + i];
                        const twinkle = 0.6 + 0.4 * Math.sin(time * 0.5 + phase);
                        mat.opacity = mat.opacity * 0.99 + twinkle * 0.01;
                    }
                    idx += count;
                }
            }

            window.__bgStars = {
                create: createStars,
                animate: animateStars,
                get: function() { return starsGroup; }
            };
        }

        if (!window.__bgParticles) {
            let particleMesh = null;
            let particlePositions = null;
            let particleSpeeds = null;
            let particleSizes = null;
            let dummy = null;
            let matrix = null;
            let material = null;

            function createGlowTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(32, 32, 30, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                texture.flipY = false;
                return texture;
            }

            function createParticles() {
                const count = CONFIG.particleCount;
                const texture = createGlowTexture();

                const geometry = new THREE.CircleGeometry(1, 16);

                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    depthTest: false,
                    color: new THREE.Color(CONFIG.colors.idle),
                    side: THREE.DoubleSide
                });

                const mesh = new THREE.InstancedMesh(geometry, material, count);
                mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                mesh.frustumCulled = false;

                particlePositions = new Float32Array(count * 3);
                particleSpeeds = [];
                particleSizes = new Float32Array(count);
                dummy = new THREE.Object3D();
                matrix = new THREE.Matrix4();

                // UKURAN SANGAT KECIL → 0.03 - 0.08
                const sizeRange = [0.03, 0.08];
                for (let i = 0; i < count; i++) {
                    particlePositions[i*3] = (Math.random() - 0.5) * 35;
                    particlePositions[i*3+1] = (Math.random() - 0.5) * 25;
                    particlePositions[i*3+2] = (Math.random() - 0.5) * 15;
                    particleSpeeds.push({
                        x: (Math.random() - 0.5) * 0.012,
                        y: (Math.random() - 0.5) * 0.012,
                        z: (Math.random() - 0.5) * 0.012
                    });
                    particleSizes[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

                    dummy.position.set(
                        particlePositions[i*3],
                        particlePositions[i*3+1],
                        particlePositions[i*3+2]
                    );
                    dummy.scale.set(particleSizes[i], particleSizes[i], 1);
                    dummy.updateMatrix();
                    mesh.setMatrixAt(i, dummy.matrix);
                }
                mesh.instanceMatrix.needsUpdate = true;

                particleMesh = mesh;
                return mesh;
            }

            function animateParticles(speed, time) {
                if (!particleMesh) return;
                const count = CONFIG.particleCount;
                const pos = particlePositions;
                const spd = particleSpeeds;
                const sizes = particleSizes;
                const stateLocal = state;

                for (let i = 0; i < count; i++) {
                    if (stateLocal.isChaosActive) {
                        spd[i].x += (Math.random() - 0.5) * 0.006;
                        spd[i].y += (Math.random() - 0.5) * 0.006;
                        spd[i].z += (Math.random() - 0.5) * 0.006;
                        spd[i].x = Math.min(0.04, Math.max(-0.04, spd[i].x));
                        spd[i].y = Math.min(0.04, Math.max(-0.04, spd[i].y));
                        spd[i].z = Math.min(0.04, Math.max(-0.04, spd[i].z));
                    }
                    pos[i*3] += spd[i].x * stateLocal.currentSpeed;
                    pos[i*3+1] += spd[i].y * stateLocal.currentSpeed;
                    pos[i*3+2] += spd[i].z * stateLocal.currentSpeed;
                    if (Math.abs(pos[i*3]) > 18) spd[i].x *= -1;
                    if (Math.abs(pos[i*3+1]) > 13) spd[i].y *= -1;
                    if (Math.abs(pos[i*3+2]) > 8) spd[i].z *= -1;
                }

                let pulseScale = 1;
                if (stateLocal.isPulseActive) {
                    pulseScale = 1 + 0.2 * Math.sin(time * 1.5);
                }

                for (let i = 0; i < count; i++) {
                    const s = sizes[i] * pulseScale;
                    dummy.position.set(pos[i*3], pos[i*3+1], pos[i*3+2]);
                    dummy.scale.set(s, s, 1);
                    dummy.updateMatrix();
                    particleMesh.setMatrixAt(i, dummy.matrix);
                }
                particleMesh.instanceMatrix.needsUpdate = true;
            }

            function updateParticleColor(color) {
                if (material) {
                    material.color.set(color);
                }
            }

            window.__bgParticles = {
                create: createParticles,
                animate: animateParticles,
                updateColor: updateParticleColor,
                getMesh: function() { return particleMesh; },
                getPositions: function() { return particlePositions; },
                getSizes: function() { return particleSizes; }
            };
        }

        if (!window.__bgLines) {
            let linesMesh = null;
            let lineMaterial = null;
            let linePositions = null;

            function createLines() {
                lineMaterial = new THREE.LineBasicMaterial({
                    color: new THREE.Color(CONFIG.colors.idle),
                    transparent: true,
                    opacity: 0.1,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    depthTest: false
                });
                const geo = new THREE.BufferGeometry();
                const maxLines = CONFIG.particleCount * CONFIG.particleCount * 0.3;
                const maxVerts = maxLines * 2 * 3;
                const posArray = new Float32Array(maxVerts);
                geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
                geo.setDrawRange(0, 0);
                linesMesh = new THREE.LineSegments(geo, lineMaterial);
                linePositions = posArray;
                return linesMesh;
            }

            function updateLines(particlePositions) {
                if (!linesMesh || !particlePositions) return;
                const count = CONFIG.particleCount;
                const distMax = CONFIG.connectionDistance;
                const pos = particlePositions;
                const arr = linePositions;
                let idx = 0;

                for (let a = 0; a < count; a++) {
                    const ax = pos[a*3];
                    const ay = pos[a*3+1];
                    const az = pos[a*3+2];
                    for (let b = a + 1; b < count; b++) {
                        const bx = pos[b*3];
                        const by = pos[b*3+1];
                        const bz = pos[b*3+2];
                        const dx = ax - bx;
                        const dy = ay - by;
                        const dz = az - bz;
                        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                        if (dist < distMax) {
                            arr[idx++] = ax;
                            arr[idx++] = ay;
                            arr[idx++] = az;
                            arr[idx++] = bx;
                            arr[idx++] = by;
                            arr[idx++] = bz;
                        }
                    }
                }

                const geo = linesMesh.geometry;
                geo.setDrawRange(0, idx / 3);
                geo.attributes.position.needsUpdate = true;
                lineMaterial.opacity = state.connectionOpacity || 0.1;
            }

            function updateLineColor(color) {
                if (lineMaterial) {
                    lineMaterial.color.set(color);
                }
            }

            window.__bgLines = {
                create: createLines,
                update: updateLines,
                updateColor: updateLineColor,
                getMesh: function() { return linesMesh; }
            };
        }

        if (!window.__bgAurora) {
            let auroraMeshes = [];

            function createAurora() {
                const count = CONFIG.auroraCount;
                const colors = CONFIG.colors.aurora;
                const meshes = [];

                for (let i = 0; i < count; i++) {
                    const geo = new THREE.PlaneGeometry(35, 5, 32, 12);
                    const mat = new THREE.MeshBasicMaterial({
                        color: colors[i % colors.length],
                        transparent: true,
                        opacity: 0.04 + (i * 0.015),
                        side: THREE.DoubleSide,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                        depthTest: false
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(
                        (Math.random() - 0.5) * 25,
                        (Math.random() - 0.5) * 12,
                        -12 - (i * 2.5)
                    );
                    mesh.rotation.x = (Math.random() - 0.5) * 0.6;
                    mesh.rotation.y = (Math.random() - 0.5) * 0.6;
                    mesh.userData = {
                        speed: 0.0004 + (i * 0.00035),
                        offsetX: Math.random() * 100,
                        offsetY: Math.random() * 100
                    };
                    meshes.push(mesh);
                }
                auroraMeshes = meshes;
                return meshes;
            }

            function animateAurora(speed, time) {
                for (let m = 0; m < auroraMeshes.length; m++) {
                    const mesh = auroraMeshes[m];
                    mesh.rotation.z += mesh.userData.speed * speed * 0.3;
                    const pos = mesh.geometry.attributes.position;
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i);
                        const y = pos.getY(i);
                        const wave1 = Math.sin(x * 0.4 + time * 0.7 + mesh.userData.offsetX) * 0.35;
                        const wave2 = Math.cos(y * 0.5 + time * 0.5 + mesh.userData.offsetY) * 0.25;
                        const mod = state.isChaosActive ? Math.random() * 1.5 : 1;
                        pos.setZ(i, (wave1 + wave2) * mod * 0.5);
                    }
                    pos.needsUpdate = true;
                }
            }

            window.__bgAurora = {
                create: createAurora,
                animate: animateAurora,
                updateColor: function() {}
            };
        }

        if (!window.__bgController) {
            const modeConfig = {
                idle:    { color: CONFIG.colors.idle,    speed: 1.0, opacity: 0.12, pulse: false, chaos: false },
                thinking:{ color: CONFIG.colors.thinking, speed: 1.6, opacity: 0.20, pulse: false, chaos: false },
                analysis:{ color: CONFIG.colors.analysis, speed: 1.4, opacity: 0.25, pulse: false, chaos: false },
                success: { color: CONFIG.colors.success,  speed: 1.1, opacity: 0.15, pulse: true,  chaos: false },
                warning: { color: CONFIG.colors.warning,  speed: 2.2, opacity: 0.15, pulse: false, chaos: false },
                error:   { color: CONFIG.colors.error,    speed: 0.7, opacity: 0.05, pulse: false, chaos: true }
            };

            window.__bgController = {
                setMode: function(mode) {
                    if (!modeConfig[mode]) return;
                    const c = modeConfig[mode];
                    state.mode = mode;
                    state.targetColor = c.color;
                    state.targetSpeed = c.speed;
                    state.connectionOpacity = c.opacity;
                    state.isPulseActive = c.pulse;
                    state.isChaosActive = c.chaos;
                },
                getState: function() {
                    return state;
                }
            };
        }

        if (!window.__bgMain) {
            window.__bgMain = true;
            window.__bgGeneration = (window.__bgGeneration || 0) + 1;
            const myGeneration = window.__bgGeneration;

            let lastFrameTime = 0;
            const frameInterval = 1000 / CONFIG.maxFps;
            const clock = new THREE.Clock();

            function init() {
                window.__bgRenderer.init();
                const scene = window.__bgRenderer.scene();

                const stars = window.__bgStars.create();
                scene.add(stars);
                window.__bgRenderer._stars = stars;

                const pMesh = window.__bgParticles.create();
                scene.add(pMesh);
                window.__bgRenderer._particles = pMesh;

                const lines = window.__bgLines.create();
                scene.add(lines);
                window.__bgRenderer._lines = lines;

                const auroras = window.__bgAurora.create();
                for (let i = 0; i < auroras.length; i++) {
                    scene.add(auroras[i]);
                }
                window.__bgRenderer._auroras = auroras;

                window.__bgController.setMode('idle');

                animate();

                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        var bgContainer = window.__bgRenderer.container();
                        if (bgContainer) {
                            bgContainer.style.opacity = '1';
                        }
                    });
                });

                window.Background = {
                    setMode: function(mode) {
                        window.__bgController.setMode(mode);
                    },
                    getState: function() {
                        return window.__bgController.getState();
                    }
                };
            }

            function animate(timestamp) {
                if (window.__bgGeneration !== myGeneration) {
                    return; // generasi lama, berhenti diam2 (sudah digantikan rebuild baru)
                }
                requestAnimationFrame(animate);

                if (timestamp - lastFrameTime < frameInterval) {
                    return;
                }
                lastFrameTime = timestamp;

                const time = clock.getElapsedTime();

                const cur = new THREE.Color(state.currentColor);
                const tar = new THREE.Color(state.targetColor);
                cur.lerp(tar, 0.06);
                state.currentColor = cur.getHex();

                state.currentSpeed += (state.targetSpeed - state.currentSpeed) * 0.06;

                window.__bgStars.animate(state.currentSpeed, time);
                window.__bgParticles.animate(state.currentSpeed, time);
                window.__bgParticles.updateColor(state.currentColor);

                const positions = window.__bgParticles.getPositions();
                window.__bgLines.update(positions);
                window.__bgLines.updateColor(state.currentColor);

                window.__bgAurora.animate(state.currentSpeed, time);

                const renderer = window.__bgRenderer.renderer();
                const scene = window.__bgRenderer.scene();
                const camera = window.__bgRenderer.camera();
                if (renderer && scene && camera && !window.__bgContextLost) {
                    renderer.render(scene, camera);
                }
            }

            init();
        }
    }

    loadThreeAndInit();

})();
