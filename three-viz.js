(function() {
'use strict';
if (window.__ThreeVizLoaded) return;
window.__ThreeVizLoaded = true;

const CONFIG_3D = {
    colors: {
        primary: 0x00ffa3,
        primaryGlow: 0x00ffcc,
        secondary: 0x00b87a,
        danger: 0xff4444,
        warning: 0xffaa00,
        success: 0x00ffa3,
        background: 0x03050a
    },
    particleCount: 90,
    sphereRadius: 2.5
};

class KES3DViz {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        const THREE = window.THREE || window.three;
        if (!THREE) {
            this.container.innerHTML = '<div style="color:#666;text-align:center;padding:40px;">3D library not available</div>';
            return;
        }
        this.THREE = THREE;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.metricsData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.isAnimating = true;
        this.animationId = null;
        this.rotationX = 0;
        this.rotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.pulseIntensity = 0;
        this.lastFrameTime = 0;
        this.particleGroup = null;
        this.coreSphere = null;
        this.wireframeSphere = null;
        this.glowPoints = null;
        this.dataPoints = [];
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        const THREE = this.THREE;
        this.container.innerHTML = '';
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG_3D.colors.background);
        const width = this.container.clientWidth || 400;
        const height = this.container.clientHeight || 380;
        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        this.camera.position.set(5, 4, 8);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        this.container.appendChild(this.renderer.domElement);
        this.setupLights();
        this.createCoreSphere();
        this.createOrbitingParticles();
        this.createDataPoints();
        this.createGridFloor();
        window.addEventListener('resize', function() {
            this.handleResize();
        }.bind(this));
    }

    setupLights() {
        const THREE = this.THREE;
        const ambientLight = new THREE.AmbientLight(0x404060);
        this.scene.add(ambientLight);
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.75);
        mainLight.position.set(5, 10, 7);
        this.scene.add(mainLight);
        const rimLight = new THREE.PointLight(0x00ffa3, 0.45);
        rimLight.position.set(-3, 2, -4);
        this.scene.add(rimLight);
    }

    createCoreSphere() {
        const THREE = this.THREE;
        const geometry = new THREE.SphereGeometry(1.2, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG_3D.colors.primary,
            emissive: CONFIG_3D.colors.primary,
            emissiveIntensity: 0.28,
            metalness: 0.65,
            roughness: 0.35,
            transparent: true,
            opacity: 0.88
        });
        this.coreSphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.coreSphere);

        const wireframeGeo = new THREE.SphereGeometry(1.45, 24, 24);
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: CONFIG_3D.colors.primary,
            wireframe: true,
            transparent: true,
            opacity: 0.18
        });
        this.wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
        this.scene.add(this.wireframeSphere);

        const glowGeometry = new THREE.BufferGeometry();
        const glowCount = 250;
        const glowPositions = [];
        for (let i = 0; i < glowCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.35;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            glowPositions.push(x, y, z);
        }
        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
        const glowMaterial = new THREE.PointsMaterial({
            color: CONFIG_3D.colors.primary,
            size: 0.02,
            transparent: true,
            opacity: 0.45
        });
        this.glowPoints = new THREE.Points(glowGeometry, glowMaterial);
        this.scene.add(this.glowPoints);
    }

    createOrbitingParticles() {
        const THREE = this.THREE;
        const particleGroup = new THREE.Group();
        const particleCount = CONFIG_3D.particleCount;
        for (let i = 0; i < particleCount; i++) {
            const size = 0.05 + Math.random() * 0.07;
            const geometry = new THREE.SphereGeometry(size, 6, 6);
            const material = new THREE.MeshStandardMaterial({
                color: CONFIG_3D.colors.primary,
                emissive: CONFIG_3D.colors.primary,
                emissiveIntensity: 0.28,
                metalness: 0.5,
                roughness: 0.45
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.userData = {
                radius: 1.7 + Math.random() * 1.3,
                speed: 0.002 + Math.random() * 0.0025,
                angleX: Math.random() * Math.PI * 2,
                angleY: Math.random() * Math.PI * 2,
                angleZ: Math.random() * Math.PI * 2,
                offsetY: (Math.random() - 0.5) * 1.4
            };
            particle.castShadow = false;
            particle.receiveShadow = false;
            particleGroup.add(particle);
            this.particles.push(particle);
        }
        this.scene.add(particleGroup);
        this.particleGroup = particleGroup;
    }

    createDataPoints() {
        const THREE = this.THREE;
        this.dataPoints = [];
        const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(function(a) {
            return a * Math.PI / 180;
        });
        const labels = ['Demand', 'Competition', 'Monetization', 'Virality',
            'Sustainability', 'Scalability', 'Timing', 'Attention',
            'Execution', 'Long-term'];
        for (let i = 0; i < 10; i++) {
            const angle = angles[i];
            const radius = 2.2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -0.5;
            const height = 0.2;
            const barGeo = new THREE.BoxGeometry(0.22, height, 0.22);
            const barMat = new THREE.MeshStandardMaterial({
                color: CONFIG_3D.colors.primary,
                emissive: CONFIG_3D.colors.primary,
                emissiveIntensity: 0.18,
                metalness: 0.75,
                roughness: 0.35
            });
            const bar = new THREE.Mesh(barGeo, barMat);
            bar.position.set(x, y + height / 2, z);
            bar.userData = { index: i, baseY: y, targetHeight: 0.2, label: labels[i] };
            this.scene.add(bar);

            const tipGeo = new THREE.SphereGeometry(0.055, 5, 5);
            const tipMat = new THREE.MeshStandardMaterial({ color: CONFIG_3D.colors.primary, emissiveIntensity: 0.35 });
            const tip = new THREE.Mesh(tipGeo, tipMat);
            tip.position.set(x, y + height, z);
            this.scene.add(tip);
            this.dataPoints.push({ bar: bar, tip: tip, index: i, targetHeight: 0.2 });
        }
    }

    createGridFloor() {
        const THREE = this.THREE;
        const gridHelper = new THREE.GridHelper(10, 14, CONFIG_3D.colors.primary, 0x336633);
        gridHelper.position.y = -1.2;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.12;
        this.scene.add(gridHelper);

        const ringGeo = new THREE.TorusGeometry(2.75, 0.02, 40, 100);
        const ringMat = new THREE.MeshStandardMaterial({ color: CONFIG_3D.colors.primary, emissiveIntensity: 0.18 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.0;
        this.scene.add(ring);
    }

    updateMetrics(metrics) {
        const values = [
            metrics.demand || 0, metrics.competition || 0, metrics.monetization || 0,
            metrics.virality || 0, metrics.sustainability || 0, metrics.scalability || 0,
            metrics.timing || 0, metrics.attention || 0, metrics.execution || 0, metrics.longterm || 0
        ];
        this.metricsData = values;
        this.dataPoints.forEach(function(point, idx) {
            const val = values[idx] || 0;
            const targetHeight = 0.2 + (val / 100) * 1.5;
            point.targetHeight = targetHeight;
            if (point.bar) {
                point.bar.scale.y = targetHeight / 0.2;
                point.bar.position.y = point.bar.userData.baseY + targetHeight / 2;
                const intensity = 0.18 + (val / 100) * 0.55;
                point.bar.material.emissiveIntensity = intensity;
            }
            if (point.tip) {
                point.tip.position.y = point.bar.userData.baseY + targetHeight;
                const tipColor = val >= 70 ? 0x00ffa3 : (val >= 40 ? 0xffaa00 : 0xff4444);
                point.tip.material.color.setHex(tipColor);
            }
        }.bind(this));

        const avgScore = values.reduce(function(a, b) { return a + b; }, 0) / 10;
        this.pulseIntensity = avgScore / 100;
    }

    updateTelemetry(latency, failures) {
        const latencyIntensity = Math.min(1, latency / 500);
        const color = latency > 200 ? CONFIG_3D.colors.danger :
            (latency > 100 ? CONFIG_3D.colors.warning : CONFIG_3D.colors.primary);
        this.particles.forEach(function(particle) {
            particle.material.color.setHex(color);
            const intensity = 0.28 + (1 - latencyIntensity) * 0.35;
            particle.material.emissiveIntensity = intensity;
        });
        if (failures > 0) {
            this.coreSphere.material.emissiveIntensity = 0.48 + Math.sin(Date.now() * 0.008) * 0.22;
        } else {
            this.coreSphere.material.emissiveIntensity = 0.28 + this.pulseIntensity * 0.38;
        }
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', function(e) {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.container.style.cursor = 'grabbing';
        }.bind(this));

        window.addEventListener('mousemove', function(e) {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            this.targetRotationY += deltaX * 0.005;
            this.targetRotationX += deltaY * 0.005;
            this.targetRotationX = Math.max(-1, Math.min(1, this.targetRotationX));
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }.bind(this));

        window.addEventListener('mouseup', function() {
            this.isDragging = false;
            this.container.style.cursor = 'grab';
        }.bind(this));

        this.container.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }.bind(this));

        window.addEventListener('touchmove', function(e) {
            if (!this.isDragging) return;
            const deltaX = e.touches[0].clientX - this.lastMouseX;
            const deltaY = e.touches[0].clientY - this.lastMouseY;
            this.targetRotationY += deltaX * 0.005;
            this.targetRotationX += deltaY * 0.005;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }.bind(this));

        window.addEventListener('touchend', function() {
            this.isDragging = false;
        }.bind(this));

        this.container.style.cursor = 'grab';
    }

    animate() {
        if (!this.isAnimating || !this.scene) return;
        this.animationId = requestAnimationFrame(function() {
            this.animate();
        }.bind(this));

        const now = Date.now();
        this.lastFrameTime = now;
        this.rotationX += (this.targetRotationX - this.rotationX) * 0.11;
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.11;
        if (!this.isDragging) this.targetRotationY += 0.0013;

        if (this.particleGroup) {
            this.particleGroup.rotation.x = this.rotationX;
            this.particleGroup.rotation.y = this.rotationY;
        }

        this.particles.forEach(function(particle) {
            const data = particle.userData;
            data.angleX += data.speed;
            data.angleY += data.speed * 0.55;
            data.angleZ += data.speed * 0.35;
            const x = Math.cos(data.angleX) * data.radius;
            const z = Math.sin(data.angleZ) * data.radius;
            const y = Math.sin(data.angleY) * 0.9 + data.offsetY;
            particle.position.set(x, y, z);
        });

        const pulse = 0.965 + Math.sin(Date.now() * 0.0025) * 0.035;
        if (this.coreSphere) {
            this.coreSphere.scale.set(pulse, pulse, pulse);
            this.coreSphere.material.emissiveIntensity = 0.28 + this.pulseIntensity * 0.38 + Math.sin(Date.now() * 0.0035) * 0.07;
        }
        if (this.wireframeSphere) {
            this.wireframeSphere.rotation.x += 0.0018;
            this.wireframeSphere.rotation.y += 0.0025;
        }
        if (this.glowPoints) {
            this.glowPoints.rotation.y += 0.0012;
            this.glowPoints.rotation.x += 0.0008;
        }

        const radius = 7.2;
        const camX = Math.sin(this.rotationY) * radius;
        const camZ = Math.cos(this.rotationY) * radius;
        const camY = 2.3 + this.rotationX * 1.3;
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 0, 0);

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) this.renderer.setSize(width, height);
    }

    traverseAndDispose(obj) {
        if (!obj) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(function(m) { m.dispose(); });
            } else {
                obj.material.dispose();
            }
        }
        if (obj.children) {
            while (obj.children.length) {
                this.traverseAndDispose(obj.children[0]);
                obj.remove(obj.children[0]);
            }
        }
    }

    destroy() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.remove();
            }
            this.renderer = null;
        }
        if (this.scene) {
            this.traverseAndDispose(this.scene);
            this.scene = null;
        }
        this.camera = null;
        this.particles = null;
        this.dataPoints = null;
        this.particleGroup = null;
        this.coreSphere = null;
        this.wireframeSphere = null;
        this.glowPoints = null;
        if (this.container) this.container.innerHTML = '';
    }

    setVisible(visible) {
        if (this.container) {
            this.container.style.display = visible ? 'block' : 'none';
            if (visible) this.handleResize();
        }
    }
}

let threeVizInstance = null;

window.init3DViz = function(containerId) {
    if (threeVizInstance) {
        threeVizInstance.destroy();
        threeVizInstance = null;
    }
    threeVizInstance = new KES3DViz(containerId);
    return threeVizInstance;
};

window.update3DVizMetrics = function(metrics) {
    if (threeVizInstance && threeVizInstance.updateMetrics) {
        threeVizInstance.updateMetrics(metrics);
    }
};

window.update3DVizTelemetry = function(latency, failures) {
    if (threeVizInstance && threeVizInstance.updateTelemetry) {
        threeVizInstance.updateTelemetry(latency, failures);
    }
};

window.destroy3DViz = function() {
    if (threeVizInstance) {
        threeVizInstance.destroy();
        threeVizInstance = null;
    }
};

function autoInitThreeJS() {
    function isThreeReady() {
        return typeof window.THREE !== 'undefined' || typeof THREE !== 'undefined';
    }

    function initViz() {
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) {
            setTimeout(initViz, 200);
            return;
        }
        if (typeof window.init3DViz === 'function') {
            try {
                const viz = window.init3DViz('threeCanvas');
                window._3dVizInstance = viz;
                const toggleBtn = document.getElementById('vizToggleBtn');
                const vizContainer = document.getElementById('viz3dContainer');
                if (toggleBtn && vizContainer) {
                    let isExpanded = true;
                    toggleBtn.addEventListener('click', function() {
                        isExpanded = !isExpanded;
                        if (isExpanded) {
                            vizContainer.classList.remove('collapsed');
                            toggleBtn.textContent = '−';
                            setTimeout(function() {
                                if (viz && typeof viz.handleResize === 'function') viz.handleResize();
                            }, 100);
                        } else {
                            vizContainer.classList.add('collapsed');
                            toggleBtn.textContent = '+';
                        }
                    });
                }
            } catch(e) {
                const canvasEl = document.getElementById('threeCanvas');
                if (canvasEl) {
                    canvasEl.innerHTML = '<div style="color:#666;text-align:center;padding:40px;font-size:13px;">3D Sphere<br><span style="font-size:9px;">(WebGL not available)</span></div>';
                }
            }
        } else {
            setTimeout(initViz, 300);
        }
    }

    function waitForThree() {
        if (isThreeReady()) setTimeout(initViz, 300);
        else setTimeout(waitForThree, 200);
    }

    if (document.readyState === 'complete') waitForThree();
    else window.addEventListener('load', waitForThree);
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ThreeViz = Object.freeze({
    init3DViz: window.init3DViz,
    update3DVizMetrics: window.update3DVizMetrics,
    update3DVizTelemetry: window.update3DVizTelemetry,
    destroy3DViz: window.destroy3DViz
});

autoInitThreeJS();
})();