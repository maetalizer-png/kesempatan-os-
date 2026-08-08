(function() {
'use strict';
if (window.__VisualAIEngine) return;
window.__VisualAIEngine = true;

const state = window.VisualAIState;
const core = window.VisualAICore;
const config = window.VisualAIConfig;

function disposeObject3D(object) {
    if (!object) return;
    object.traverse(function(child) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(function(m) {
                    if (m.map) m.map.dispose();
                    m.dispose();
                });
            } else {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        }
    });
}

function renderThreeUnavailable(container, label, kind) {
    if (!container) return;
    const failed = core.threeLoadFailed && core.threeLoadFailed();
    const message = failed ? 'Modul 3D gagal dimuat — menampilkan versi 2D' : 'Memuat modul 3D...';
    if (kind === 'avatar') {
        container.innerHTML = '<div class="fallback-avatar-2d"></div>' +
            '<div style="font-size:9px;color:#666;text-align:center;margin-top:6px;">' + message + '</div>';
    } else if (kind === 'spinner') {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><div class="fallback-spinner-2d"></div></div>';
    } else if (kind === 'background') {
        container.innerHTML = '<div class="fallback-bg-2d"></div>';
    } else {
        container.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:40px;">' +
            label + '<br><span style="font-size:9px;">(' + message + ')</span></div>';
    }
}

class VisualEngine {
    constructor() {
        this.scenes = {};
        this.renderers = {};
        this.tagCloud = null;
        this.backgroundScene = null;
        this.avatarInstance = null;
        this.darkMode = state.getDarkMode();
    }

    create3DAvatar(features, containerId, customOptions) {
        customOptions = customOptions || {};
        const threeReady = core.threeReady ? core.threeReady() : false;
        const THREE_OBJ = core.getTHREE ? core.getTHREE() : window.THREE;
        if (!threeReady || !THREE_OBJ) {
            renderThreeUnavailable(document.getElementById(containerId), '3D Avatar', 'avatar');
            return null;
        }
        const container = document.getElementById(containerId);
        if (!container) return null;
        try {
            const scene = new THREE_OBJ.Scene();
            const camera = new THREE_OBJ.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE_OBJ.WebGLRenderer({ antialias: true, alpha: true });
            const size = customOptions.size || 180;
            renderer.setSize(size, size);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            const bgColor = this.darkMode ? 0x03050A : 0xf0f4f8;
            scene.background = new THREE_OBJ.Color(bgColor);
            scene.add(new THREE_OBJ.AmbientLight(0x404060));
            const dirLight = new THREE_OBJ.DirectionalLight(0xffffff, 0.8);
            dirLight.position.set(5, 10, 7);
            scene.add(dirLight);
            const colors = config.AVATAR_COLORS || { modern: 0x00FFA3, vintage: 0xFFD700, minimalist: 0x4ECDC4, colorful: 0x9B59B6 };
            const color = customOptions.color || colors[features.style] || 0x00FFA3;
            const sphere = new THREE_OBJ.Mesh(
                new THREE_OBJ.SphereGeometry(1, 32, 32),
                new THREE_OBJ.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: customOptions.glow || 0.3, metalness: 0.7, roughness: 0.3 })
            );
            scene.add(sphere);
            const wireframe = new THREE_OBJ.Mesh(
                new THREE_OBJ.SphereGeometry(1.2, 24, 24),
                new THREE_OBJ.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.2 })
            );
            scene.add(wireframe);
            const particleCount = customOptions.particles || 50;
            const particleGeo = new THREE_OBJ.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 1.5 + Math.random() * 0.5;
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);
            }
            particleGeo.setAttribute('position', new THREE_OBJ.BufferAttribute(positions, 3));
            const particles = new THREE_OBJ.Points(particleGeo, new THREE_OBJ.PointsMaterial({ color: color, size: 0.05, transparent: true, opacity: 0.6 }));
            scene.add(particles);
            camera.position.z = 3.5;
            camera.lookAt(0, 0, 0);
            let animationId = null;
            let rotationSpeed = customOptions.speed || 0.01;
            function animate() {
                animationId = requestAnimationFrame(animate);
                sphere.rotation.y += rotationSpeed;
                wireframe.rotation.x += rotationSpeed * 0.5;
                wireframe.rotation.y += rotationSpeed;
                particles.rotation.y += rotationSpeed * 0.5;
                renderer.render(scene, camera);
            }
            animate();
            const self = this;
            const instance = {
                destroy: function() {
                    if (animationId) cancelAnimationFrame(animationId);
                    disposeObject3D(scene);
                    renderer.dispose();
                    container.innerHTML = '';
                },
                setColor: function(newColor) {
                    sphere.material.color.setHex(newColor);
                    sphere.material.emissive.setHex(newColor);
                    wireframe.material.color.setHex(newColor);
                    particles.material.color.setHex(newColor);
                },
                setSpeed: function(newSpeed) { rotationSpeed = newSpeed; }
            };
            this.avatarInstance = instance;
            return instance;
        } catch (e) {
            container.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:40px;">3D Avatar<br><span style="font-size:9px;">(Gagal merender)</span></div>';
            return null;
        }
    }

    createHeatmap(imageData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.maxHeight = '180px';
            canvas.style.borderRadius = '12px';
            canvas.style.border = '1px solid rgba(0,255,163,0.1)';
            container.innerHTML = '';
            container.appendChild(canvas);
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataObj.data;
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const heat = brightness / 255;
                    if (heat > 0.7) {
                        data[i] = 255;
                        data[i + 1] = Math.round(255 * (1 - (heat - 0.7) * 3));
                        data[i + 2] = 0;
                    } else if (heat > 0.3) {
                        data[i] = Math.round(255 * (heat - 0.3) * 2);
                        data[i + 1] = 255;
                        data[i + 2] = 0;
                    } else {
                        data[i] = 0;
                        data[i + 1] = Math.round(255 * heat * 2);
                        data[i + 2] = Math.round(255 * heat * 0.5);
                    }
                    data[i + 3] = Math.min(1, heat * 1.5) * 128;
                }
                ctx.putImageData(imageDataObj, 0, 0);
            };
            img.src = imageData;
            return canvas;
        } catch (e) {
            container.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:20px;">Heatmap<br><span style="font-size:9px;">(Error)</span></div>';
            return null;
        }
    }

    createProgressSphere(containerId) {
        const threeReady = core.threeReady ? core.threeReady() : false;
        const THREE_OBJ = core.getTHREE ? core.getTHREE() : window.THREE;
        if (!threeReady || !THREE_OBJ) {
            renderThreeUnavailable(document.getElementById(containerId), '', 'spinner');
            return { updateProgress: function() {}, destroy: function() {} };
        }
        const container = document.getElementById(containerId);
        if (!container) return null;
        try {
            const scene = new THREE_OBJ.Scene();
            const camera = new THREE_OBJ.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE_OBJ.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(60, 60);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            const sphere = new THREE_OBJ.Mesh(
                new THREE_OBJ.SphereGeometry(1, 32, 32),
                new THREE_OBJ.MeshStandardMaterial({ color: 0x9B59B6, wireframe: true, transparent: true, opacity: 0.3 })
            );
            scene.add(sphere);
            const ring = new THREE_OBJ.Mesh(
                new THREE_OBJ.TorusGeometry(1.2, 0.06, 16, 64),
                new THREE_OBJ.MeshStandardMaterial({ color: 0x00FFA3, emissive: 0x00FFA3, emissiveIntensity: 0.3 })
            );
            ring.rotation.x = Math.PI / 2;
            scene.add(ring);
            scene.add(new THREE_OBJ.AmbientLight(0x404060));
            const dirLight = new THREE_OBJ.DirectionalLight(0xffffff, 0.5);
            dirLight.position.set(5, 10, 7);
            scene.add(dirLight);
            camera.position.z = 3.5;
            camera.lookAt(0, 0, 0);
            let animationId = null;
            function animate() {
                animationId = requestAnimationFrame(animate);
                sphere.rotation.y += 0.02;
                ring.rotation.z += 0.01;
                renderer.render(scene, camera);
            }
            animate();
            return {
                updateProgress: function(progress) {
                    const angle = (progress / 100) * Math.PI * 2;
                    ring.geometry.setDrawRange(0, Math.floor((angle / (Math.PI * 2)) * 64));
                },
                destroy: function() {
                    if (animationId) cancelAnimationFrame(animationId);
                    disposeObject3D(scene);
                    renderer.dispose();
                    container.innerHTML = '';
                }
            };
        } catch (e) { return null; }
    }

    createTagCloud(tags, containerId) {
        const threeReady = core.threeReady ? core.threeReady() : false;
        const THREE_OBJ = core.getTHREE ? core.getTHREE() : window.THREE;
        if (!tags || tags.length === 0) return null;
        if (!threeReady || !THREE_OBJ) {
            renderThreeUnavailable(document.getElementById(containerId), 'Tag Cloud', 'text');
            return null;
        }
        const container = document.getElementById(containerId);
        if (!container) return null;
        try {
            const scene = new THREE_OBJ.Scene();
            const camera = new THREE_OBJ.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE_OBJ.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth || 300, 100);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            const colors = ['#00FFA3', '#9B59B6', '#FFD700', '#FF6B6B', '#00BFFF'];
            const tagGroup = new THREE_OBJ.Group();
            tags.forEach(function(tag, i) {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 200, 50);
                ctx.font = 'bold 22px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = colors[i % colors.length];
                ctx.shadowColor = colors[i % colors.length];
                ctx.shadowBlur = 10;
                ctx.fillText(tag, 100, 25);
                const sprite = new THREE_OBJ.Sprite(new THREE_OBJ.SpriteMaterial({ map: new THREE_OBJ.CanvasTexture(canvas), transparent: true, depthTest: false, opacity: 0.9 }));
                const theta = (i / tags.length) * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const radius = 1.5 + Math.random() * 0.5;
                sprite.position.set(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
                sprite.scale.set(1.2, 0.35, 1);
                tagGroup.add(sprite);
            });
            scene.add(tagGroup);
            camera.position.z = 3;
            let animationId = null;
            function animate() {
                animationId = requestAnimationFrame(animate);
                tagGroup.rotation.y += 0.005;
                tagGroup.rotation.x += 0.002;
                renderer.render(scene, camera);
            }
            animate();
            return {
                destroy: function() {
                    if (animationId) cancelAnimationFrame(animationId);
                    disposeObject3D(scene);
                    renderer.dispose();
                    container.innerHTML = '';
                }
            };
        } catch (e) { return null; }
    }

    createVisualDashboard(result, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:10px;background:rgba(0,0,0,0.2);border-radius:10px;">' +
            '<div style="text-align:center;background:rgba(0,255,163,0.05);border-radius:8px;padding:6px;"><div style="font-size:9px;color:rgba(160,179,201,0.5);">Style</div><div style="font-size:14px;font-weight:700;color:#00FFA3;">' + (result.features?.style || 'modern') + '</div></div>' +
            '<div style="text-align:center;background:rgba(155,89,182,0.05);border-radius:8px;padding:6px;"><div style="font-size:9px;color:rgba(160,179,201,0.5);">Mood</div><div style="font-size:14px;font-weight:700;color:#9B59B6;">' + (result.features?.mood || 'enerjik') + '</div></div>' +
            '<div style="text-align:center;background:rgba(255,215,0,0.05);border-radius:8px;padding:6px;"><div style="font-size:9px;color:rgba(160,179,201,0.5);">Complexity</div><div style="font-size:14px;font-weight:700;color:#FFD700;">' + (result.features?.complexity || 'simple') + '</div></div>' +
            '<div style="text-align:center;background:rgba(0,255,163,0.05);border-radius:8px;padding:6px;"><div style="font-size:9px;color:rgba(160,179,201,0.5);">Rating</div><div style="font-size:14px;font-weight:700;color:#00FFA3;">' + (result.rating || '') + '</div></div>' +
            '</div>' +
            '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">' +
            (result.tags ? result.tags.map(function(t) { return '<span style="background:rgba(155,89,182,0.15);padding:2px 10px;border-radius:20px;font-size:9px;color:#9B59B6;">' + t + '</span>'; }).join('') : '') +
            '</div>';
    }

    createSocialShareCard(agent, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const socialColors = config.SOCIAL_COLORS || {};
        const color = socialColors[agent.features?.style] || '#00FFA3';
        container.innerHTML = '<div style="background:linear-gradient(135deg,' + color + '22,#00000044);border-radius:12px;padding:16px;border:1px solid ' + color + '44;text-align:center;">' +
            '<div style="font-size:32px;margin-bottom:4px;"></div>' +
            '<div style="color:#00FFA3;font-weight:700;font-size:16px;">' + agent.name + '</div>' +
            '<div style="color:rgba(160,179,201,0.6);font-size:11px;">' + agent.role + '</div>' +
            '<div style="margin:8px 0;display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">' +
            (agent.tags ? agent.tags.map(function(t) { return '<span style="background:rgba(155,89,182,0.15);padding:2px 10px;border-radius:20px;font-size:9px;color:#9B59B6;">' + t + '</span>'; }).join('') : '') +
            '</div>' +
            '<div style="font-size:10px;color:rgba(160,179,201,0.4);">' + (agent.rating || '') + ' • ' + new Date(agent.createdAt).toLocaleDateString() + '</div>' +
            '<div style="margin-top:8px;display:flex;gap:6px;justify-content:center;">' +
            '<button onclick="navigator.clipboard.writeText(\'' + agent.name + ' - ' + agent.role + '\');if(window.Utils?.showToast)window.Utils.showToast(\'Copied!\',\'success\')" style="padding:2px 12px;background:rgba(0,255,163,0.1);border:1px solid rgba(0,255,163,0.2);border-radius:20px;color:#00FFA3;cursor:pointer;font-size:9px;">Copy</button>' +
            '<button onclick="window.open(\'https://twitter.com/intent/tweet?text=Agent%3A%20' + encodeURIComponent(agent.name) + '%20-%20' + encodeURIComponent(agent.role) + '%20%23KESEMPATANOS\',\'_blank\')" style="padding:2px 12px;background:rgba(29,161,242,0.1);border:1px solid rgba(29,161,242,0.2);border-radius:20px;color:#1DA1F2;cursor:pointer;font-size:9px;">Tweet</button>' +
            '</div></div>';
    }

    createComparison(agent1, agent2, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const rating1 = agent1.rating === '' ? 50 : agent1.rating === '' ? 85 : 30;
        const rating2 = agent2.rating === '' ? 50 : agent2.rating === '' ? 85 : 30;
        container.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px;background:rgba(0,0,0,0.2);border-radius:10px;">' +
            '<div style="background:rgba(0,255,163,0.05);border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(0,255,163,0.15);"><div style="color:#00FFA3;font-weight:700;font-size:13px;">' + agent1.name + '</div><div style="font-size:10px;color:rgba(160,179,201,0.5);">' + agent1.role + '</div><div style="margin-top:6px;height:6px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;"><div style="width:' + rating1 + '%;height:100%;background:linear-gradient(90deg,#9B59B6,#00FFA3);border-radius:4px;"></div></div><div style="font-size:11px;color:#00FFA3;margin-top:4px;">' + rating1 + '%</div></div>' +
            '<div style="background:rgba(155,89,182,0.05);border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(155,89,182,0.15);"><div style="color:#9B59B6;font-weight:700;font-size:13px;">' + agent2.name + '</div><div style="font-size:10px;color:rgba(160,179,201,0.5);">' + agent2.role + '</div><div style="margin-top:6px;height:6px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;"><div style="width:' + rating2 + '%;height:100%;background:linear-gradient(90deg,#00FFA3,#9B59B6);border-radius:4px;"></div></div><div style="font-size:11px;color:#9B59B6;margin-top:4px;">' + rating2 + '%</div></div>' +
            '</div>' +
            '<div style="margin-top:6px;font-size:10px;color:rgba(160,179,201,0.4);text-align:center;">' +
            (rating1 > rating2 ? agent1.name + ' leads!' : rating2 > rating1 ? agent2.name + ' leads!' : 'Tie!') + '</div>';
    }

    createTimeline(history, containerId) {
        const container = document.getElementById(containerId);
        if (!container || history.length === 0) return;
        container.innerHTML = '<div style="padding:8px;background:rgba(0,0,0,0.15);border-radius:10px;max-height:120px;overflow-y:auto;">' +
            history.slice(0, 15).map(function(h, i) {
                return '<div style="display:flex;align-items:center;gap:10px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
                    '<div style="width:4px;height:4px;background:' + (i === 0 ? '#00FFA3' : 'rgba(160,179,201,0.2)') + ';border-radius:50%;"></div>' +
                    '<div style="font-size:9px;color:rgba(160,179,201,0.4);min-width:70px;">' + new Date(h.createdAt).toLocaleDateString() + '</div>' +
                    '<div style="font-size:10px;color:#00FFA3;flex:1;">' + h.name + '</div>' +
                    '<div style="font-size:8px;color:rgba(160,179,201,0.3);">' + (h.rating || '') + '</div></div>';
            }).join('') + '</div>';
    }

    createAnimatedBackground(containerId) {
        const threeReady = core.threeReady ? core.threeReady() : false;
        const THREE_OBJ = core.getTHREE ? core.getTHREE() : window.THREE;
        if (!threeReady || !THREE_OBJ) {
            renderThreeUnavailable(document.getElementById(containerId), '', 'background');
            return { destroy: function() {} };
        }
        const container = document.getElementById(containerId);
        if (!container) return null;
        try {
            const scene = new THREE_OBJ.Scene();
            const camera = new THREE_OBJ.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE_OBJ.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth || 400, 120);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            const count = 80;
            const geo = new THREE_OBJ.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 10;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
                colors[i * 3] = Math.random();
                colors[i * 3 + 1] = Math.random();
                colors[i * 3 + 2] = Math.random();
            }
            geo.setAttribute('position', new THREE_OBJ.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE_OBJ.BufferAttribute(colors, 3));
            const particles = new THREE_OBJ.Points(geo, new THREE_OBJ.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.4 }));
            scene.add(particles);
            camera.position.z = 5;
            let animationId = null;
            function animate() {
                animationId = requestAnimationFrame(animate);
                particles.rotation.x += 0.001;
                particles.rotation.y += 0.002;
                renderer.render(scene, camera);
            }
            animate();
            return {
                destroy: function() {
                    if (animationId) cancelAnimationFrame(animationId);
                    disposeObject3D(scene);
                    renderer.dispose();
                    container.innerHTML = '';
                }
            };
        } catch (e) { return null; }
    }

    createParticleEffect(colors, count) {
        colors = colors || ['#00FFA3', '#9B59B6', '#FFD700', '#FF6B6B'];
        count = count || 100;
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 15 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = Math.random() * 4 + 2;
            const delay = Math.random() * 2;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            particle.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:50%;left:' + startX + '%;top:' + startY + '%;animation:particleFloat' + i + ' ' + duration + 's ease-in-out infinite;animation-delay:' + delay + 's;opacity:' + (Math.random() * 0.6 + 0.2) + ';box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';';
            container.appendChild(particle);
            const style = document.createElement('style');
            style.textContent = '@keyframes particleFloat' + i + '{0%{transform:translate(0,0) scale(1) rotate(0deg);}25%{transform:translate(' + (Math.random() * 200 - 100) + 'px,' + (Math.random() * -200 - 100) + 'px) scale(1.8) rotate(90deg);}50%{transform:translate(' + (Math.random() * 200 - 100) + 'px,' + (Math.random() * 200 + 100) + 'px) scale(0.5) rotate(180deg);}75%{transform:translate(' + (Math.random() * -200 + 100) + 'px,' + (Math.random() * -200 + 100) + 'px) scale(1.4) rotate(270deg);}100%{transform:translate(0,0) scale(1) rotate(360deg);}}';
            document.head.appendChild(style);
        }
        document.body.appendChild(container);
        setTimeout(function() {
            container.remove();
            document.querySelectorAll('style').forEach(function(s) {
                if (s.textContent.includes('particleFloat')) s.remove();
            });
        }, 7000);
    }
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VisualEngine = { create: function() { return new VisualEngine(); } };
window.VisualAIEngine = { create: function() { return new VisualEngine(); } };
})();