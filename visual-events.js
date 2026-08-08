(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__VisualAIEvents) return;
window.__VisualAIEvents = true;

const state = KESEMPATAN.VisualState;
const core = KESEMPATAN.VisualCore;
const renderer = KESEMPATAN.VisualRenderer;
const showToast = window.Utils?.showToast || function() {};

let visualEngine = null;

function getEngine() {
    if (!visualEngine) {
        const Engine = KESEMPATAN.VisualEngine;
        if (Engine && typeof Engine.create === 'function') {
            visualEngine = Engine.create();
        }
    }
    return visualEngine;
}

function formatDuration(ms) {
    if (!isFinite(ms) || ms < 0) return '...';
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) return minutes + 'm ' + seconds + 'd';
    return seconds + 'd';
}

function handleFiles(files) {
    const validFiles = [];
    for (const file of files) {
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
            validFiles.push(file);
        }
    }
    if (validFiles.length === 0) {
        showToast('Tidak ada gambar valid (max 10MB)', 'error');
        return;
    }
    state.setSelectedFiles(validFiles);
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.innerHTML = validFiles.map(function(f) {
            return '<span style="background: rgba(0,255,163,0.08); padding: 2px 10px; border-radius: 12px; margin: 2px; display: inline-block; font-size: 10px;">' + f.name + '</span>';
        }).join('');
    }
    showToast(validFiles.length + ' gambar siap!', 'success');

    const reader = new FileReader();
    reader.onload = async function(event) {
        const engine = getEngine();
        if (!engine) return;

        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
            const oldAvatar = state.getAvatarInstance();
            if (oldAvatar && typeof oldAvatar.destroy === 'function') {
                oldAvatar.destroy();
            }
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;
                let avgBrightness = 0;
                for (let i = 0; i < data.length; i += 4) {
                    avgBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
                }
                avgBrightness /= (data.length / 4);
                let style = 'modern';
                if (avgBrightness < 50) style = 'vintage';
                else if (avgBrightness < 100) style = 'minimalist';
                else if (avgBrightness > 180) style = 'colorful';
                const features = { style: style, mood: 'enerjik' };
                state.setCurrentFeatures(features);
                const avatar = engine.create3DAvatar(features, 'avatarContainer', {
                    darkMode: state.getDarkMode(),
                    size: 180
                });
                state.setAvatarInstance(avatar);
            };
            img.src = event.target.result;
        }

        const heatmapContainer = document.getElementById('heatmapContainer');
        if (heatmapContainer) {
            engine.createHeatmap(event.target.result, 'heatmapContainer');
        }

        const objectContainer = document.getElementById('objectDetectionContainer');
        if (objectContainer && state.getUseAI()) {
            objectContainer.innerHTML = '<div style="color: #FFD700; font-size: 11px;">Detecting...</div>';
            try {
                const ai = new core.AIInternal();
                const objects = await ai.detectObjects(validFiles[0]);
                objectContainer.innerHTML = '';
                const canvas = document.createElement('canvas');
                canvas.style.width = '100%';
                canvas.style.maxHeight = '180px';
                canvas.style.borderRadius = '8px';
                objectContainer.appendChild(canvas);
                const img2 = new Image();
                img2.onload = function() {
                    canvas.width = img2.width;
                    canvas.height = img2.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                    objects.forEach(function(obj) {
                        const x = (obj.x / 100) * canvas.width;
                        const y = (obj.y / 100) * canvas.height;
                        const w = (obj.width / 100) * canvas.width;
                        const h = (obj.height / 100) * canvas.height;
                        ctx.strokeStyle = '#00FFA3';
                        ctx.lineWidth = 2;
                        ctx.shadowColor = 'rgba(0,255,163,0.5)';
                        ctx.shadowBlur = 10;
                        ctx.strokeRect(x, y, w, h);
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = 'rgba(0,255,163,0.15)';
                        ctx.fillRect(x, y, w, h);
                        ctx.fillStyle = '#00FFA3';
                        ctx.font = '12px Inter, sans-serif';
                        ctx.fillText((obj.label || 'Object') + ' (' + Math.round(obj.confidence || 0) + '%)', x, y - 5);
                    });
                };
                img2.src = event.target.result;
            } catch(e) {
                objectContainer.innerHTML = '<div style="color: rgba(160,179,201,0.3); font-size: 11px;">Detection failed</div>';
            }
        }

        const features = state.getCurrentFeatures();
        if (features && state.getUseAI()) {
            const ai = new core.AIInternal();
            const tags = await ai.generateTags(features);
            const tagContainer = document.getElementById('aiTagsContainer');
            if (tagContainer) {
                tagContainer.innerHTML = tags.map(function(t) {
                    return '<span style="background: rgba(155,89,182,0.15); padding: 2px 10px; border-radius: 12px; font-size: 9px; color: #9B59B6;">' + t + '</span>';
                }).join('');
            }
            const tagCloud = document.getElementById('tagCloudContainer');
            if (tagCloud && tags.length > 0) {
                tagCloud.innerHTML = '';
                const oldTagCloud = state.getTagCloudInstance();
                if (oldTagCloud && typeof oldTagCloud.destroy === 'function') oldTagCloud.destroy();
                const cloud = engine.createTagCloud(tags, 'tagCloudContainer');
                state.setTagCloudInstance(cloud);
            }
        }
    };
    reader.readAsDataURL(validFiles[0]);
}

function attachEvents() {
    const container = document.getElementById('visualAgentPanel');
    if (!container) return;

    const imageInput = document.getElementById('visualAgentImage');
    const uploadArea = document.getElementById('uploadArea');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    const batchGenerateBtn = document.getElementById('batchGenerateBtn');
    const exportAvatarBtn = document.getElementById('exportAvatarBtn');
    const customizeAvatarBtn = document.getElementById('customizeAvatarBtn');
    const copyAgentBtn = document.getElementById('copyAgentBtn');
    const shareAgentBtn = document.getElementById('shareAgentBtn');
    const editAgentBtn = document.getElementById('editAgentBtn');
    const likeAgentBtn = document.getElementById('likeAgentBtn');
    const dislikeAgentBtn = document.getElementById('dislikeAgentBtn');
    const evolveAgentBtn = document.getElementById('evolveAgentBtn');
    const socialCardBtn = document.getElementById('socialCardBtn');
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    const importHistoryBtn = document.getElementById('importHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const closeHistoryDetail = document.getElementById('closeHistoryDetail');
    const historyDetailModal = document.getElementById('historyDetailModal');
    const aiToggle = document.getElementById('aiToggle');
    const voiceToggle = document.getElementById('voiceToggle');
    const darkToggle = document.getElementById('darkToggle');
    const saveGoogleVisionKeyBtn = document.getElementById('saveGoogleVisionKeyBtn');
    const saveClarifaiKeyBtn = document.getElementById('saveClarifaiKeyBtn');
    const backBtn = document.getElementById('visualAgentBackBtn');

    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(0,255,163,0.3)';
            uploadArea.style.background = 'rgba(0,255,163,0.05)';
        });
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.style.borderColor = 'rgba(0,255,163,0.15)';
            uploadArea.style.background = 'rgba(255,255,255,0.02)';
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(0,255,163,0.15)';
            uploadArea.style.background = 'rgba(255,255,255,0.02)';
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        });
        uploadArea.addEventListener('click', function() {
            if (imageInput) imageInput.click();
        });
    }

    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (imageInput) imageInput.click();
        });
    }
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) handleFiles(e.target.files);
        });
    }

    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', async function() {
            const selectedFiles = state.getSelectedFiles();
            if (selectedFiles.length === 0) {
                showToast('Pilih gambar terlebih dahulu!', 'error');
                return;
            }
            const ai = new core.AIInternal();
            const apiKey = ai.getApiKey();
            if (!apiKey && !ai.isOfflineMode()) {
                showToast('Masukkan API Key atau aktifkan offline mode!', 'error');
                return;
            }
            if (state.isGenerating()) {
                showToast('Sedang generate...', 'warning');
                return;
            }
            state.setIsGenerating(true);
            const file = selectedFiles[0];
            const statusDiv = document.getElementById('visualAgentStatus');
            const realtimePreview = document.getElementById('realtimePreview');
            const previewContent = document.getElementById('previewContent');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressLabel = document.getElementById('progressLabel');
            const progressPercent = document.getElementById('progressPercent');
            if (statusDiv) statusDiv.innerHTML = '<span class="status-text" style="color: #9B59B6;">AI Generating...</span>';
            if (realtimePreview && previewContent) {
                realtimePreview.style.display = 'block';
                previewContent.innerHTML = 'Analyzing image...';
            }
            if (progressContainer) {
                progressContainer.style.display = 'block';
                progressLabel.textContent = 'AI Analyzing...';
                progressPercent.textContent = '25%';
                progressBar.style.width = '25%';
                const engine = getEngine();
                if (engine) {
                    const sphereContainer = document.getElementById('progressSphereContainer');
                    if (sphereContainer) {
                        const oldSphere = state.getProgressSphere();
                        if (oldSphere && typeof oldSphere.destroy === 'function') oldSphere.destroy();
                        const sphere = engine.createProgressSphere('progressSphereContainer');
                        state.setProgressSphere(sphere);
                        if (sphere) sphere.updateProgress(25);
                    }
                }
            }
            try {
                const features = await ai.analyzeImage(file);
                state.setCurrentFeatures(features);
                if (previewContent) previewContent.innerHTML = 'Generating agent...';
                if (progressContainer) {
                    progressLabel.textContent = 'Generating...';
                    progressPercent.textContent = '50%';
                    progressBar.style.width = '50%';
                    const sphere = state.getProgressSphere();
                    if (sphere) sphere.updateProgress(50);
                }
                const tags = await ai.generateTags(features);
                const agent = await ai.generateAgent(features);
                const description = await ai.generateDescription(features);
                if (previewContent) previewContent.innerHTML = 'Done!';
                if (progressContainer) {
                    progressLabel.textContent = 'Selesai!';
                    progressPercent.textContent = '100%';
                    progressBar.style.width = '100%';
                    const sphere = state.getProgressSphere();
                    if (sphere) sphere.updateProgress(100);
                    setTimeout(function() {
                        progressContainer.style.display = 'none';
                        const sphere2 = state.getProgressSphere();
                        if (sphere2 && typeof sphere2.destroy === 'function') sphere2.destroy();
                        state.setProgressSphere(null);
                    }, 1500);
                }
                if (window.CustomAutoAgent && window.CustomAutoAgent.add) {
                    const success = await window.CustomAutoAgent.add(agent.name, agent.role, agent.systemPrompt, 0.7);
                    if (success) {
                        const result = {
                            success: true,
                            id: Date.now(),
                            name: agent.name,
                            role: agent.role,
                            systemPrompt: agent.systemPrompt,
                            analysis: 'Gaya: ' + features.style + ', Suasana: ' + features.mood,
                            description: description,
                            features: features,
                            createdAt: new Date().toISOString(),
                            rating: '',
                            tags: tags
                        };
                        state.setCurrentResult(result);
                        state.addHistory(result);
                        const resultDiv = document.getElementById('visualAgentResult');
                        const contentDiv = document.getElementById('agentResultContent');
                        if (resultDiv && contentDiv) {
                            resultDiv.style.display = 'block';
                            contentDiv.innerHTML =
                                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">' +
                                '<div><strong style="color: #00FFA3;">Nama:</strong> ' + result.name + '</div>' +
                                '<div><strong style="color: #00FFA3;">Role:</strong> ' + result.role + '</div>' +
                                '<div style="grid-column: 1 / -1;"><strong style="color: #00FFA3;">Tags:</strong> ' +
                                (result.tags ? result.tags.map(function(t) {
                                    return '<span style="background: rgba(155,89,182,0.15); padding: 0 6px; border-radius: 8px; font-size: 10px; color: #9B59B6;">' + t + '</span>';
                                }).join(' ') : '-') + '</div>' +
                                '<div style="grid-column: 1 / -1;"><strong style="color: #00FFA3;">Deskripsi:</strong>' +
                                '<div style="font-size: 11px; color: rgba(160,179,201,0.7); margin-top: 4px;">' + result.description + '</div></div>' +
                                '<div style="grid-column: 1 / -1;"><strong style="color: #00FFA3;">System Prompt:</strong>' +
                                '<div style="font-size: 10px; color: rgba(160,179,201,0.6); margin-top: 4px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; max-height: 100px; overflow-y: auto; white-space: pre-wrap;">' + result.systemPrompt + '</div></div>' +
                                '</div>';
                        }
                        const engine = getEngine();
                        if (engine) {
                            const dashboard = document.getElementById('visualDashboardContainer');
                            if (dashboard) engine.createVisualDashboard(result, 'visualDashboardContainer');
                            engine.createParticleEffect(['#00FFA3', '#9B59B6', '#FFD700', '#FF6B6B'], 100);
                        }
                        if (state.getVoice()) {
                            core.speak('Halo! Saya ' + agent.name + ', agen AI baru dari gambar Anda!');
                        }
                        if (engine) {
                            const timelineContainer = document.getElementById('timelineContainer');
                            if (timelineContainer) {
                                engine.createTimeline(state.getHistory(), 'timelineContainer');
                            }
                        }
                        renderer.renderGallery();
                        if (statusDiv) {
                            statusDiv.innerHTML = '<span class="status-text" style="color: #00FFA3;">Agen "' + agent.name + '" berhasil dibuat!</span>';
                        }
                        showToast('Agen "' + agent.name + '" berhasil dibuat!', 'success');
                    }
                }
            } catch (error) {
                if (statusDiv) {
                    statusDiv.innerHTML = '<span class="status-text" style="color: #FF6B6B;">' + error.message + '</span>';
                }
                showToast('Gagal: ' + error.message, 'error');
            }
            state.setIsGenerating(false);
            setTimeout(function() {
                const rt = document.getElementById('realtimePreview');
                if (rt) rt.style.display = 'none';
            }, 3000);
        });
    }

    if (batchGenerateBtn) {
        batchGenerateBtn.addEventListener('click', async function() {
            const selectedFiles = state.getSelectedFiles();
            if (selectedFiles.length === 0) {
                showToast('Pilih gambar terlebih dahulu!', 'error');
                return;
            }
            const ai = new core.AIInternal();
            if (!ai.getApiKey() && !ai.isOfflineMode()) {
                showToast('Masukkan API Key atau aktifkan offline mode!', 'error');
                return;
            }
            if (state.isGenerating()) {
                showToast('Sedang generate...', 'warning');
                return;
            }
            state.setIsGenerating(true);
            const total = selectedFiles.length;
            let successCount = 0;
            const batchStartTime = Date.now();
            const statusDiv = document.getElementById('visualAgentStatus');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressLabel = document.getElementById('progressLabel');
            const progressPercent = document.getElementById('progressPercent');
            if (statusDiv) statusDiv.innerHTML = '<span class="status-text" style="color: #FFD700;">Batch ' + total + ' images...</span>';
            if (progressContainer) {
                progressContainer.style.display = 'block';
                progressLabel.textContent = 'Batch 0/' + total;
                progressPercent.textContent = '0%';
                progressBar.style.width = '0%';
                const engine = getEngine();
                if (engine) {
                    const sphereContainer = document.getElementById('progressSphereContainer');
                    if (sphereContainer) {
                        const oldSphere = state.getProgressSphere();
                        if (oldSphere && typeof oldSphere.destroy === 'function') oldSphere.destroy();
                        const sphere = engine.createProgressSphere('progressSphereContainer');
                        state.setProgressSphere(sphere);
                        if (sphere) sphere.updateProgress(0);
                    }
                }
            }
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                try {
                    const features = await ai.analyzeImage(file);
                    const agent = await ai.generateAgent(features);
                    const tags = await ai.generateTags(features);
                    const description = await ai.generateDescription(features);
                    if (window.CustomAutoAgent && window.CustomAutoAgent.add) {
                        const success = await window.CustomAutoAgent.add(agent.name, agent.role, agent.systemPrompt, 0.7);
                        if (success) {
                            const result = {
                                id: Date.now() + i,
                                name: agent.name,
                                role: agent.role,
                                systemPrompt: agent.systemPrompt,
                                analysis: 'Gaya: ' + features.style + ', Suasana: ' + features.mood,
                                description: description,
                                features: features,
                                createdAt: new Date().toISOString(),
                                rating: '',
                                tags: tags
                            };
                            state.addHistory(result);
                            successCount++;
                        }
                    }
                } catch(e) { console.warn('[VisualAI] Batch item failed:', e.message); }
                const percent = Math.round(((i + 1) / total) * 100);
                if (progressContainer) {
                    const done = i + 1;
                    const elapsed = Date.now() - batchStartTime;
                    const avgPerItem = elapsed / done;
                    const remaining = Math.max(0, total - done);
                    const etaText = remaining > 0 ? ' • sisa ~' + formatDuration(avgPerItem * remaining) : '';
                    progressLabel.textContent = 'Batch ' + done + '/' + total + etaText;
                    progressPercent.textContent = percent + '%';
                    progressBar.style.width = percent + '%';
                    const sphere = state.getProgressSphere();
                    if (sphere) sphere.updateProgress(percent);
                }
            }
            if (progressContainer) {
                progressLabel.textContent = 'Selesai! ' + successCount + '/' + total;
                progressPercent.textContent = '100%';
                progressBar.style.width = '100%';
                const sphere = state.getProgressSphere();
                if (sphere) sphere.updateProgress(100);
                setTimeout(function() {
                    progressContainer.style.display = 'none';
                    const sphere2 = state.getProgressSphere();
                    if (sphere2 && typeof sphere2.destroy === 'function') sphere2.destroy();
                    state.setProgressSphere(null);
                }, 2000);
            }
            if (statusDiv) {
                statusDiv.innerHTML = '<span class="status-text" style="color: #00FFA3;">' + successCount + '/' + total + ' agen berhasil!</span>';
            }
            const engine = getEngine();
            if (engine) {
                engine.createParticleEffect(['#FFD700', '#00FFA3', '#9B59B6'], 150);
                const timelineContainer = document.getElementById('timelineContainer');
                if (timelineContainer) engine.createTimeline(state.getHistory(), 'timelineContainer');
            }
            renderer.renderGallery();
            if (state.getVoice()) core.speak(successCount + ' agen berhasil dibuat!');
            showToast(successCount + ' agen berhasil dibuat!', 'success');
            state.setSelectedFiles([]);
            const fileList = document.getElementById('fileList');
            if (fileList) fileList.innerHTML = '';
            state.setIsGenerating(false);
        });
    }

    if (aiToggle) {
        aiToggle.addEventListener('change', function() {
            const label = document.getElementById('aiToggleLabel');
            if (label) {
                label.textContent = this.checked ? 'AI ON' : 'AI OFF';
                label.style.color = this.checked ? '#9B59B6' : '#666';
            }
            state.setUseAI(this.checked);
        });
    }
    if (voiceToggle) {
        voiceToggle.addEventListener('change', function() {
            const label = document.getElementById('voiceToggleLabel');
            if (label) {
                label.textContent = this.checked ? 'Voice ON' : 'Voice OFF';
                label.style.color = this.checked ? '#00FFA3' : '#666';
            }
            state.setVoice(this.checked);
        });
    }
    if (darkToggle) {
        darkToggle.addEventListener('change', function() {
            const label = document.getElementById('darkToggleLabel');
            if (label) {
                label.textContent = this.checked ? 'Dark' : 'Light';
                label.style.color = this.checked ? '#FFD700' : '#666';
            }
            state.setDarkMode(this.checked);
            document.body.classList.toggle('dark-mode', this.checked);
            document.body.classList.toggle('light-mode', !this.checked);
            const features = state.getCurrentFeatures();
            if (features) {
                const oldAvatar = state.getAvatarInstance();
                if (oldAvatar && typeof oldAvatar.destroy === 'function') oldAvatar.destroy();
                const engine = getEngine();
                if (engine) {
                    const avatar = engine.create3DAvatar(features, 'avatarContainer', {
                        darkMode: this.checked,
                        size: 180
                    });
                    state.setAvatarInstance(avatar);
                }
            }
        });
    }

    document.querySelectorAll('.vision-mode-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            state.setApiMode(this.dataset.mode);
            renderer.render();
        });
    });

    if (saveGoogleVisionKeyBtn) {
        saveGoogleVisionKeyBtn.addEventListener('click', function() {
            const key = document.getElementById('googleVisionKeyInput')?.value;
            if (key) {
                state.setGoogleKey(key);
                showToast('Google Vision Key tersimpan!', 'success');
            }
        });
    }
    if (saveClarifaiKeyBtn) {
        saveClarifaiKeyBtn.addEventListener('click', function() {
            const key = document.getElementById('clarifaiKeyInput')?.value;
            if (key) {
                state.setClarifaiKey(key);
                showToast('Clarifai Key tersimpan!', 'success');
            }
        });
    }

    if (exportAvatarBtn) {
        exportAvatarBtn.addEventListener('click', function() {
            const avatarContainer = document.getElementById('avatarContainer');
            if (avatarContainer) {
                const canvas = avatarContainer.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'avatar_' + Date.now() + '.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast('Avatar exported!', 'success');
                } else {
                    showToast('No avatar', 'warning');
                }
            }
        });
    }

    if (customizeAvatarBtn) {
        customizeAvatarBtn.addEventListener('click', function() {
            const avatar = state.getAvatarInstance();
            if (!avatar) {
                showToast('No avatar', 'warning');
                return;
            }
            const color = prompt('Pilih warna (hex):', '#00FFA3');
            if (color && color.match(/^#[0-9a-fA-F]{6}$/)) {
                const hex = parseInt(color.replace('#', ''), 16);
                if (!isNaN(hex)) {
                    avatar.setColor(hex);
                    showToast('Color changed!', 'success');
                }
            }
        });
    }

    if (copyAgentBtn) {
        copyAgentBtn.addEventListener('click', function() {
            const content = document.getElementById('agentResultContent');
            if (content) {
                navigator.clipboard.writeText(content.textContent).then(function() {
                    showToast('Copied!', 'success');
                });
            }
        });
    }
    if (shareAgentBtn) {
        shareAgentBtn.addEventListener('click', function() {
            const content = document.getElementById('agentResultContent');
            if (content) {
                navigator.clipboard.writeText('Agent:\n\n' + content.textContent).then(function() {
                    showToast('Copied!', 'success');
                });
            }
        });
    }
    if (editAgentBtn) {
        editAgentBtn.addEventListener('click', function() {
            const current = state.getCurrentResult();
            if (!current) return;
            const newName = prompt('Edit nama agen:', current.name);
            if (newName && newName.trim()) {
                current.name = newName.trim();
                const h = state.getHistory().find(function(item) { return item.id === current.id; });
                if (h) {
                    h.name = newName.trim();
                    state.saveHistory();
                    renderer.render();
                    showToast('Updated!', 'success');
                }
            }
        });
    }
    if (likeAgentBtn) {
        likeAgentBtn.addEventListener('click', function() {
            const current = state.getCurrentResult();
            if (current) {
                const h = state.getHistory().find(function(item) { return item.id === current.id; });
                if (h) {
                    h.rating = '';
                    state.saveHistory();
                    showToast('Liked!', 'success');
                    renderer.render();
                }
            }
        });
    }
    if (dislikeAgentBtn) {
        dislikeAgentBtn.addEventListener('click', function() {
            const current = state.getCurrentResult();
            if (current) {
                const h = state.getHistory().find(function(item) { return item.id === current.id; });
                if (h) {
                    h.rating = '';
                    state.saveHistory();
                    showToast('Feedback recorded', 'success');
                    renderer.render();
                }
            }
        });
    }
    if (evolveAgentBtn) {
        evolveAgentBtn.addEventListener('click', async function() {
            const current = state.getCurrentResult();
            if (!current) return;
            const ai = new core.AIInternal();
            if (!ai.getApiKey() && !ai.isOfflineMode()) {
                showToast('Masukkan API Key atau aktifkan offline mode!', 'error');
                return;
            }
            const statusDiv = document.getElementById('visualAgentStatus');
            if (statusDiv) statusDiv.innerHTML = '<span class="status-text" style="color: #9B59B6;">Evolving...</span>';
            const evolution = await ai.getEvolutionSuggestion(current);
            if (evolution) {
                const newName = prompt('Nama baru:', current.name + 'Evo');
                if (newName && newName.trim()) {
                    current.name = newName.trim();
                    current.role = evolution.roleImprovement || current.role;
                    current.systemPrompt = (evolution.promptImprovement ? evolution.promptImprovement + '\n\n' : '') + (current.systemPrompt || '');
                    const h = state.getHistory().find(function(item) { return item.id === current.id; });
                    if (h) {
                        h.name = current.name;
                        h.role = current.role;
                        h.systemPrompt = current.systemPrompt;
                        state.saveHistory();
                        renderer.render();
                        showToast('Evolved!', 'success');
                        if (state.getVoice()) core.speak('Agen berhasil dievolusi!');
                    }
                }
            }
            if (statusDiv) statusDiv.innerHTML = '<span class="status-text" style="color: #00FFA3;">Evolusi selesai!</span>';
        });
    }

    if (socialCardBtn) {
        socialCardBtn.addEventListener('click', function() {
            const containerSocial = document.getElementById('socialCardContainer');
            const current = state.getCurrentResult();
            if (containerSocial && current) {
                containerSocial.style.display = containerSocial.style.display === 'none' ? 'block' : 'none';
                if (containerSocial.style.display === 'block') {
                    const engine = getEngine();
                    if (engine) engine.createSocialShareCard(current, 'socialCardContainer');
                }
            }
        });
    }

    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', function() {
            const data = {
                exportDate: new Date().toISOString(),
                total: state.getHistory().length,
                history: state.getHistory()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'kes_visual_agent_history_' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Exported!', 'success');
        });
    }
    if (importHistoryBtn) {
        importHistoryBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (data.history && Array.isArray(data.history)) {
                                state.setHistory(data.history);
                                renderer.render();
                                showToast(data.history.length + ' history imported!', 'success');
                            } else {
                                showToast('Invalid format', 'error');
                            }
                        } catch (err) {
                            showToast('Import failed: ' + err.message, 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });
    }
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Hapus semua history?')) {
                state.clearHistory();
                renderer.render();
                showToast('Cleared!', 'success');
            }
        });
    }

    if (closeHistoryDetail) {
        closeHistoryDetail.addEventListener('click', function() {
            if (historyDetailModal) historyDetailModal.style.display = 'none';
        });
    }
    if (historyDetailModal) {
        historyDetailModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            if (typeof window.showPage === 'function') window.showPage('dashboard');
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('historyDetailModal');
            if (modal && modal.style.display === 'flex') modal.style.display = 'none';
            return;
        }
        const active = document.activeElement;
        const isTyping = active && (
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable
        );
        if (e.key === 'Enter' && active?.id === 'visualAgentImage') {
            if (aiGenerateBtn) aiGenerateBtn.click();
            return;
        }
        if (isTyping) return;
        if (e.key === 'v' || e.key === 'V') {
            if (voiceToggle) {
                voiceToggle.checked = !voiceToggle.checked;
                voiceToggle.dispatchEvent(new Event('change'));
            }
        }
    });
}

KESEMPATAN.VisualEvents = {
    attach: attachEvents,
    handleFiles: handleFiles
};
})();