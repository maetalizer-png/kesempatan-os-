(function() {
    'use strict';
    if (window.__CustomThemeLoaded) return;
    window.__CustomThemeLoaded = true;

    const { showToast } = window.Utils || {};

    const CT_CSS = `:root{--ct-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--ct-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--ct-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} #customThemePanel{box-sizing:border-box;padding:4px 12px !important;} .ct-wrap{position:relative;margin:0 0 16px;padding:2px 0 16px;} .ct-wrap::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(224,230,237,0.14);} .ct-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px;} .ct-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary);text-shadow:0 0 10px var(--primary-glow);} .ct-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;} .ct-btn{position:relative;isolation:isolate;clip-path:var(--ct-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:9px 16px;color:var(--primary);font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .ct-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--ct-clip-asym);background:#06100b;z-index:-1;} .ct-btn:active{transform:scale(.97);} .ct-btn.on{background:var(--primary);color:#03130b;} .ct-btn.on::before{background:var(--primary);} .ct-ai{background:rgba(155,89,182,.5);color:#C39BD3;} .ct-ai::before{background:#120a18;} .ct-share{background:rgba(0,255,255,.4);color:#7EE9EC;} .ct-share::before{background:#021616;} .ct-keys{font-size:9px;color:#666;text-align:center;margin:0 0 12px;} .ct-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;margin-bottom:14px;} .ct-stat{position:relative;isolation:isolate;clip-path:var(--ct-clip-sm);background:rgba(26,255,156,.25);padding:1px;text-align:center;} .ct-stat::before{content:'';position:absolute;inset:1px;clip-path:var(--ct-clip-sm);background:#05080c;z-index:-1;} .ct-stat b{display:block;font-size:13px;color:var(--primary);padding-top:6px;} .ct-stat span{display:block;font-size:9px;color:#7c8a82;padding:2px 4px 7px;} .ct-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:14px;} .theme-btn{position:relative;isolation:isolate;clip-path:var(--ct-clip);border:0;border-radius:0;background:rgba(26,255,156,.3);padding:1px;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .theme-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--ct-clip);background:var(--tb-bg,#05080c);z-index:-1;} .theme-btn.active{background:#FFD700;filter:drop-shadow(0 0 10px rgba(255,215,0,.35));} .theme-btn.active::before{background:var(--tb-bg,#05080c);} .tb-in{display:block;padding:12px 8px;text-align:center;} .tb-sw{display:flex;gap:4px;justify-content:center;margin-bottom:6px;} .tb-sw span{display:inline-block;width:16px;height:16px;border-radius:4px;} .tb-name{display:block;font-size:11px;font-weight:700;color:var(--tb-fg,#E0E6ED);} .tb-mood{display:block;font-size:8px;color:rgba(255,255,255,.4);margin-top:2px;} .tb-active{display:block;font-size:8px;color:#FFD700;margin-top:2px;} .ct-box{position:relative;isolation:isolate;clip-path:var(--ct-clip);background:rgba(26,255,156,.3);padding:1px;margin-bottom:14px;} .ct-box::before{content:'';position:absolute;inset:1px;clip-path:var(--ct-clip);background:#05080c;z-index:-1;} .ct-box.dim{background:rgba(26,255,156,.18);} .ct-box-in{padding:12px 14px;} .ct-box-title{font-size:12px;font-weight:800;letter-spacing:.5px;color:#FFD700;margin-bottom:10px;} .ct-flex{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch;} .ct-rim{position:relative;isolation:isolate;clip-path:var(--ct-clip-sm);background:rgba(26,255,156,.3);padding:1px;display:block;transition:background .25s ease,filter .3s ease;} .ct-rim:hover{background:rgba(26,255,156,.55);filter:drop-shadow(0 0 7px rgba(0,255,163,.35));} .ct-rim-in{display:block;clip-path:var(--ct-clip-sm);background:#05080c;} .ct-rim select,.ct-rim input{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:9px 10px;font-size:11px;outline:none;margin:0;} .ct-rim select option{background:#05080c;color:#E0E6ED;} .ct-rim input[type="color"]{height:36px;padding:3px;cursor:pointer;} .ct-rim input[type="color"]::-webkit-color-swatch-wrapper{padding:2px;} .ct-rim input[type="color"]::-webkit-color-swatch{border:none;border-radius:0;} .ct-rim input[type="color"]::-moz-color-swatch{border:none;border-radius:0;} .ct-num-w{flex:0 0 64px;} .ct-lbl{display:block;font-size:9px;color:#A0B3C9;margin-bottom:4px;} .ct-colorgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:10px;} .ct-apply{position:relative;isolation:isolate;clip-path:var(--ct-clip-asym);border:0;border-radius:0;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#03130b;padding:10px 18px;font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;transition:transform .15s ease,filter .25s ease;} .ct-apply:active{transform:scale(.97);} #customPreview{margin-top:10px;padding:8px 10px;clip-path:var(--ct-clip-sm);background:rgba(0,0,0,.4);font-size:11px;text-align:center;display:none;} #themePreview{margin-top:4px;} #themePreview .ct-box-in{font-size:11px;color:#A0B3C9;text-align:center;} .ct-sched-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#A0B3C9;} .ct-sched-x{position:relative;isolation:isolate;clip-path:var(--ct-clip-asym);border:0;border-radius:0;background:rgba(255,68,68,.5);color:#FF8080;padding:3px 10px;font-size:10px;cursor:pointer;} .ct-sched-x::before{content:'';position:absolute;inset:1px;clip-path:var(--ct-clip-asym);background:#160608;z-index:-1;} .ct-back{display:block;width:100%;} @media (hover:hover) and (pointer:fine){ .ct-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .theme-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.3));} .theme-btn.active:hover{filter:drop-shadow(0 0 12px rgba(255,215,0,.45));} .ct-apply:hover{transform:translateY(-2px);filter:drop-shadow(0 0 12px var(--primary-glow));} }`;

    function injectCSS() {
        if (document.getElementById('customThemeStyle')) return;
        const s = document.createElement('style');
        s.id = 'customThemeStyle';
        s.textContent = CT_CSS;
        document.head.appendChild(s);
    }

    function ensureContainer() {
        let container = document.getElementById('customThemePanel');
        if (!container) {
            const page = document.getElementById('customthemePage');
            const target = page || document.body;
            container = document.createElement('div');
            container.id = 'customThemePanel';
            container.style.cssText = 'display:block; padding:0; margin:0;';
            target.appendChild(container);
        }
        return container;
    }

    class CustomTheme {
        constructor() {
            this.themes = {
                default: { name: 'Default', primary: '#00FFA3', secondary: '#00AA6E', bg: '#03050A', fontFamily: 'Inter, sans-serif', borderRadius: '24px', accent: '#00FFA3', gradient: null, mood: 'Professional' },
                neon: { name: 'Neon', primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a', fontFamily: 'Inter, sans-serif', borderRadius: '20px', accent: '#FF00FF', gradient: 'linear-gradient(135deg, #FF00FF, #00FFFF)', mood: 'Energetic' },
                sunset: { name: 'Sunset', primary: '#FF6B35', secondary: '#F7931E', bg: '#1a0a2e', fontFamily: 'Inter, sans-serif', borderRadius: '28px', accent: '#FF6B35', gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)', mood: 'Warm' },
                ocean: { name: 'Ocean', primary: '#00BFFF', secondary: '#1E90FF', bg: '#001a33', fontFamily: 'Inter, sans-serif', borderRadius: '22px', accent: '#00BFFF', gradient: 'linear-gradient(135deg, #00BFFF, #1E90FF)', mood: 'Calm' },
                forest: { name: 'Forest', primary: '#228B22', secondary: '#32CD32', bg: '#0a1a0a', fontFamily: 'Inter, sans-serif', borderRadius: '20px', accent: '#228B22', mood: 'Natural' },
                royal: { name: 'Royal', primary: '#9B59B6', secondary: '#8E44AD', bg: '#1a0a2e', fontFamily: 'Inter, sans-serif', borderRadius: '24px', accent: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)', mood: 'Luxurious' },
                blood: { name: 'Blood', primary: '#E74C3C', secondary: '#C0392B', bg: '#1a0505', fontFamily: 'Inter, sans-serif', borderRadius: '18px', accent: '#E74C3C', mood: 'Intense' },
                galaxy: { name: 'Galaxy', primary: '#7B2FBE', secondary: '#4A148C', bg: '#0a001a', fontFamily: 'Inter, sans-serif', borderRadius: '26px', accent: '#9C27B0', gradient: 'linear-gradient(135deg, #7B2FBE, #4A148C, #1a0a2e)', mood: 'Mystical' },
                aurora: { name: 'Aurora', primary: '#00E676', secondary: '#00BCD4', bg: '#001a1a', fontFamily: 'Inter, sans-serif', borderRadius: '20px', accent: '#00E676', gradient: 'linear-gradient(135deg, #00E676, #00BCD4)', mood: 'Fresh' },
                candy: { name: 'Candy', primary: '#FF4081', secondary: '#FF6F00', bg: '#1a000a', fontFamily: 'Inter, sans-serif', borderRadius: '30px', accent: '#FF4081', gradient: 'linear-gradient(135deg, #FF4081, #FF6F00)', mood: 'Playful' },
                dark: { name: 'Dark', primary: '#FFFFFF', secondary: '#888888', bg: '#000000', fontFamily: 'Inter, sans-serif', borderRadius: '16px', accent: '#FFFFFF', mood: 'Minimalist' },
                light: { name: 'Light', primary: '#1A1A2E', secondary: '#4A4A6E', bg: '#F0F4F8', fontFamily: 'Inter, sans-serif', borderRadius: '20px', accent: '#1A1A2E', mood: 'Clean' }
            };
            this.customTheme = this.loadCustomTheme();
            if (this.customTheme) {
                this.themes.custom = {
                    name: 'Custom',
                    primary: this.customTheme.primary || '#00FFA3',
                    secondary: this.customTheme.secondary || '#00AA6E',
                    bg: this.customTheme.bg || '#03050A',
                    accent: this.customTheme.accent || '#00FFA3',
                    fontFamily: this.customTheme.fontFamily || 'Inter, sans-serif',
                    borderRadius: this.customTheme.borderRadius || '24px',
                    gradient: this.customTheme.gradient || null,
                    mood: 'Custom'
                };
            }
            this.currentTheme = localStorage.getItem('kes_custom_theme') || 'default';
            this.transitionDuration = 300;
            this.isTransitioning = false;
            this.history = [];
            this.autoMode = localStorage.getItem('kes_theme_auto_mode') === 'true';
            this.schedules = this.loadSchedules();
            this.analytics = this.loadAnalytics();
            this.isLivePreview = false;
            this.applyTheme(this.currentTheme, false);
            this.setupKeyboardShortcuts();
            this.setupAutoMode();
            this.setupScheduler();
            this.loadThemeFromURL();
        }

        loadCustomTheme() {
            try {
                const saved = localStorage.getItem('kes_custom_theme_custom');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.primary && data.secondary && data.bg) return data;
                }
            } catch (e) {}
            return null;
        }

        saveCustomTheme(themeData) {
            localStorage.setItem('kes_custom_theme_custom', JSON.stringify(themeData));
            this.customTheme = themeData;
            this.themes.custom = {
                name: 'Custom',
                primary: themeData.primary || '#00FFA3',
                secondary: themeData.secondary || '#00AA6E',
                bg: themeData.bg || '#03050A',
                accent: themeData.accent || themeData.primary || '#00FFA3',
                fontFamily: themeData.fontFamily || 'Inter, sans-serif',
                borderRadius: themeData.borderRadius || '24px',
                gradient: themeData.gradient || null,
                mood: 'Custom'
            };
        }

        loadAnalytics() {
            if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
                window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('theme_analytics', 'kes_theme_analytics');
            }
            try { return JSON.parse(localStorage.getItem('kes_theme_analytics')) || {}; } catch (e) { return {}; }
        }

        saveAnalytics() {
            localStorage.setItem('kes_theme_analytics', JSON.stringify(this.analytics));
            if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
                window.KESEMPATAN.KesDatabase.mirrorSnapshot('theme_analytics', this.analytics);
            }
        }

        trackThemeUsage(themeId) {
            if (!this.analytics[themeId]) {
                this.analytics[themeId] = { count: 0, lastUsed: null, firstUsed: Date.now() };
            }
            this.analytics[themeId].count++;
            this.analytics[themeId].lastUsed = Date.now();
            this.saveAnalytics();
        }

        getMostUsedTheme() {
            let maxCount = 0, mostUsed = 'default';
            for (const id in this.analytics) {
                if (this.analytics[id].count > maxCount) {
                    maxCount = this.analytics[id].count;
                    mostUsed = id;
                }
            }
            return mostUsed;
        }

        getThemeStats() {
            let total = 0;
            const unique = Object.keys(this.analytics).length;
            for (const id in this.analytics) {
                total += this.analytics[id].count;
            }
            return { total: total, unique: unique, mostUsed: this.getMostUsedTheme() };
        }

        loadSchedules() {
            try { return JSON.parse(localStorage.getItem('kes_theme_schedules')) || []; } catch (e) { return []; }
        }

        saveSchedules() {
            localStorage.setItem('kes_theme_schedules', JSON.stringify(this.schedules));
        }

        addSchedule(hour, minute, themeId, days) {
            if (!days) days = [0, 1, 2, 3, 4, 5, 6];
            const schedule = { hour: hour, minute: minute, themeId: themeId, days: days, active: true, id: Date.now() };
            this.schedules.push(schedule);
            this.saveSchedules();
            if (showToast) showToast('Theme scheduled for ' + String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0'), 'success');
            this.renderUI();
            return schedule;
        }

        removeSchedule(id) {
            this.schedules = this.schedules.filter(function(s) { return s.id !== id; });
            this.saveSchedules();
            this.renderUI();
        }

        setupScheduler() {
            const self = this;
            setInterval(function() {
                const now = new Date();
                const day = now.getDay();
                const hour = now.getHours();
                const minute = now.getMinutes();
                for (let i = 0; i < self.schedules.length; i++) {
                    const schedule = self.schedules[i];
                    if (!schedule.active) continue;
                    if (!schedule.days || schedule.days.indexOf(day) === -1) continue;
                    if (schedule.hour === hour && schedule.minute === minute) {
                        self.applyTheme(schedule.themeId);
                        if (showToast) showToast('Auto theme: ' + ((self.themes[schedule.themeId] || {}).name || schedule.themeId), 'info');
                    }
                }
            }, 30000);
        }

        setupAutoMode() {
            const self = this;
            if (this.autoMode) {
                this.detectSystemTheme();
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                    if (self.autoMode) {
                        self.applyTheme(e.matches ? 'dark' : 'light');
                        if (showToast) showToast('Auto theme: ' + (e.matches ? 'Dark' : 'Light'), 'info');
                    }
                });
            }
        }

        detectSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        toggleAutoMode() {
            this.autoMode = !this.autoMode;
            localStorage.setItem('kes_theme_auto_mode', this.autoMode);
            if (this.autoMode) {
                const theme = this.detectSystemTheme();
                this.applyTheme(theme);
                if (showToast) showToast('Auto mode ON (' + theme + ')', 'success');
            } else {
                if (showToast) showToast('Auto mode OFF', 'info');
            }
            this.renderUI();
        }

        loadThemeFromURL() {
            try {
                const params = new URLSearchParams(window.location.search);
                const encoded = params.get('theme');
                if (encoded) {
                    const theme = JSON.parse(atob(encoded));
                    if (theme.primary && theme.secondary && theme.bg) {
                        const id = 'shared_' + Date.now();
                        this.themes[id] = {
                            name: theme.name || 'Shared Theme',
                            primary: theme.primary,
                            secondary: theme.secondary,
                            bg: theme.bg,
                            accent: theme.accent || theme.primary,
                            fontFamily: theme.fontFamily || 'Inter, sans-serif',
                            borderRadius: theme.borderRadius || '24px',
                            gradient: theme.gradient || null,
                            mood: 'Shared'
                        };
                        this.applyTheme(id);
                        if (showToast) showToast('Loaded shared theme: ' + (theme.name || 'Shared'), 'success');
                        history.replaceState({}, document.title, window.location.pathname);
                    }
                }
            } catch (e) {}
        }

        shareTheme(themeId) {
            const theme = this.themes[themeId];
            if (!theme) {
                if (showToast) showToast('Theme not found!', 'error');
                return;
            }
            const shareData = {
                name: theme.name,
                primary: theme.primary,
                secondary: theme.secondary,
                bg: theme.bg,
                accent: theme.accent || theme.primary,
                fontFamily: theme.fontFamily || 'Inter, sans-serif',
                borderRadius: theme.borderRadius || '24px'
            };
            const encoded = btoa(JSON.stringify(shareData));
            const url = window.location.origin + window.location.pathname + '?theme=' + encoded;
            navigator.clipboard.writeText(url).then(function() {
                if (showToast) showToast('Theme link copied! Share with others.', 'success');
            }.bind(this)).catch(function() {
                this.showShareModal(url);
            }.bind(this));
            this.generateQRCode(url);
        }

        showShareModal(url) {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
            modal.innerHTML = '<div style="background:#1a1a2e;border-radius:16px;max-width:500px;width:100%;padding:24px;border:1px solid rgba(0,255,163,0.1);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<h3 style="color:#00FFA3;margin:0;">Share Theme</h3>' +
                '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:none;border:none;color:#888;font-size:24px;cursor:pointer;">×</button>' +
                '</div>' +
                '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;word-break:break-all;font-size:11px;color:#A0B3C9;margin-bottom:12px;">' + url + '</div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button onclick="navigator.clipboard.writeText(\'' + url + '\');window.showToast(\'Copied!\',\'success\');" style="flex:1;padding:8px;background:#00FFA3;border:none;border-radius:8px;color:#03050A;font-weight:bold;cursor:pointer;">Copy Link</button>' +
                '<button onclick="window.open(\'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(url) + '\',\'_blank\')" style="flex:1;padding:8px;background:rgba(0,255,163,0.1);border:1px solid rgba(0,255,163,0.2);border-radius:8px;color:#00FFA3;cursor:pointer;">QR Code</button>' +
                '</div>' +
                '</div>';
            document.body.appendChild(modal);
            modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        }

        generateQRCode(url) {
            window.open('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(url), '_blank');
        }

        generateAITheme(description) {
            const self = this;
            const apiKey = this.getApiKey();
            if (!apiKey) {
                if (showToast) showToast('Masukkan API Key untuk AI Theme!', 'error');
                return null;
            }
            if (!description || description.length < 3) {
                if (showToast) showToast('Deskripsi minimal 3 karakter!', 'error');
                return null;
            }
            if (showToast) showToast('AI sedang menciptakan tema...', 'warning');
            const prompt = 'Buatkan tema warna untuk aplikasi KESEMPATAN OS berdasarkan deskripsi berikut:\n\nDESKRIPSI: "' + description + '"\n\nOutput dalam format JSON:\n{\n  "name": "nama tema (max 20 karakter)",\n  "primary": "warna utama (hex)",\n  "secondary": "warna sekunder (hex)",\n  "bg": "warna background (hex)",\n  "accent": "warna aksen (hex)",\n  "fontFamily": "font yang cocok (salah satu: Inter, Poppins, Roboto, Montserrat, Open Sans)",\n  "borderRadius": "radius dalam px (16, 20, 24, 28, 30)",\n  "mood": "vibe/mood tema ini (max 20 karakter)",\n  "gradient": "gradient CSS (opsional, jika cocok)"\n}\n\nPastikan warna-warna harmonis dan kontrasnya bagus. Output HANYA JSON.';
            return this.callAI(prompt, apiKey).then(function(response) {
                try {
                    const theme = JSON.parse(response);
                    if (!theme.primary || !theme.secondary || !theme.bg) {
                        throw new Error('Format tema tidak valid');
                    }
                    const id = 'ai_' + Date.now();
                    self.themes[id] = {
                        name: theme.name || 'AI Theme',
                        primary: theme.primary,
                        secondary: theme.secondary,
                        bg: theme.bg,
                        accent: theme.accent || theme.primary,
                        fontFamily: theme.fontFamily || 'Inter, sans-serif',
                        borderRadius: theme.borderRadius || '24px',
                        mood: theme.mood || 'AI Generated',
                        gradient: theme.gradient || null,
                        aiGenerated: true,
                        generatedAt: new Date().toISOString()
                    };
                    self.applyTheme(id);
                    if (showToast) showToast('Tema "' + theme.name + '" diciptakan AI!', 'success');
                    self.renderUI();
                    return theme;
                } catch (error) {
                    if (showToast) showToast('AI gagal: ' + error.message, 'error');
                    return null;
                }
            }).catch(function(error) {
                if (showToast) showToast('AI gagal: ' + error.message, 'error');
                return null;
            });
        }

        getApiKey() {
            const input = document.getElementById('apiKeyInput');
            if (input && input.value && input.value.trim().length > 10) return input.value.trim();
            if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) return window.CONFIG.API_KEYS.openrouter;
            return null;
        }

        callAI(prompt, apiKey) {
            return fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'deepseek/deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 500, temperature: 0.7 })
            }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.choices && data.choices[0]) return data.choices[0].message.content;
                throw new Error((data.error && data.error.message) || 'Gagal memanggil AI');
            });
        }

        setupKeyboardShortcuts() {
            const self = this;
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.shiftKey) {
                    switch (e.key) {
                        case 'T': e.preventDefault(); self.randomTheme(); break;
                        case 'R': e.preventDefault(); self.resetTheme(); break;
                        case 'A': e.preventDefault(); self.toggleAutoMode(); break;
                        case 'G': e.preventDefault(); self.openAIGenerator(); break;
                    }
                }
            });
        }

        openAIGenerator() {
            const description = prompt('Deskripsikan tema yang diinginkan:', 'Buat tema yang menggambarkan semangat anak muda, warna-warni tapi elegan');
            if (description) {
                this.generateAITheme(description);
            }
        }

        randomTheme() {
            const themeKeys = Object.keys(this.themes);
            const randomKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
            if (randomKey !== this.currentTheme) {
                this.applyTheme(randomKey);
                if (showToast) showToast('Random: ' + this.themes[randomKey].name, 'success');
            } else {
                const filtered = themeKeys.filter(function(k) { return k !== this.currentTheme; }.bind(this));
                const newKey = filtered[Math.floor(Math.random() * filtered.length)];
                this.applyTheme(newKey);
                if (showToast) showToast('Random: ' + this.themes[newKey].name, 'success');
            }
        }

        applyTheme(themeId, animate) {
            if (animate === undefined) animate = true;
            const theme = this.themes[themeId];
            if (!theme) {
                if (themeId === 'custom' && this.customTheme) {
                    return this.applyCustomTheme(this.customTheme);
                }
                return;
            }
            if (this.isTransitioning) return;
            const prevTheme = this.currentTheme;
            this.currentTheme = themeId;
            if (animate && prevTheme !== themeId) {
                this.isTransitioning = true;
                document.documentElement.style.transition = 'all ' + this.transitionDuration + 'ms ease';
            }
            document.documentElement.style.setProperty('--theme-primary', theme.primary);
            document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
            document.documentElement.style.setProperty('--theme-bg', theme.bg);
            document.documentElement.style.setProperty('--theme-font', theme.fontFamily || 'Inter, sans-serif');
            document.documentElement.style.setProperty('--theme-radius', theme.borderRadius || '24px');
            document.documentElement.style.setProperty('--theme-accent', theme.accent || theme.primary);
            document.documentElement.style.setProperty('--theme-gradient', theme.gradient || 'none');
            document.body.style.fontFamily = theme.fontFamily || 'Inter, sans-serif';
            const self = this;
            document.querySelectorAll('.execute-btn').forEach(function(btn) {
                if (btn.classList.contains('secondary')) {
                    btn.style.borderColor = theme.primary;
                    btn.style.background = 'rgba(' + self.hexToRgb(theme.primary) + ', 0.1)';
                    btn.style.color = theme.primary;
                } else {
                    btn.style.background = theme.gradient || ('linear-gradient(135deg, ' + theme.primary + ', ' + theme.secondary + ')');
                    btn.style.color = self.getContrastColor(theme.primary);
                }
            });
            document.querySelectorAll('.card, .container').forEach(function(card) {
                card.style.borderColor = 'rgba(' + self.hexToRgb(theme.primary) + ', 0.2)';
                card.style.borderRadius = theme.borderRadius || '24px';
                card.style.background = 'rgba(' + self.hexToRgb(theme.bg) + ', 0.55)';
            });
            const logo = document.querySelector('.logo');
            if (logo) {
                logo.style.color = theme.primary;
                logo.style.textShadow = '0 0 20px ' + theme.primary + '33';
            }
            document.querySelectorAll('a, .link, [data-theme-accent]').forEach(function(el) {
                el.style.color = theme.accent || theme.primary;
            });
            const style = document.createElement('style');
            style.id = 'theme-scrollbar-style';
            style.textContent = '::-webkit-scrollbar-thumb{background:' + theme.primary + ' !important;}::-webkit-scrollbar-track{background:' + theme.bg + ' !important;}::selection{background:' + theme.primary + ';color:' + self.getContrastColor(theme.primary) + ';}';
            const oldStyle = document.getElementById('theme-scrollbar-style');
            if (oldStyle) oldStyle.remove();
            document.head.appendChild(style);
            localStorage.setItem('kes_custom_theme', themeId);
            this.trackThemeUsage(themeId);
            this.history.push({ themeId: themeId, timestamp: Date.now() });
            if (this.history.length > 50) this.history.shift();
            if (animate && prevTheme !== themeId) {
                setTimeout(function() {
                    self.isTransitioning = false;
                    document.documentElement.style.transition = '';
                }, this.transitionDuration + 100);
            } else {
                this.isTransitioning = false;
            }
            this.updateUI(themeId);
            if (showToast && prevTheme !== themeId) {
                showToast('Tema ' + theme.name + ' diterapkan!', 'success');
            }
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { themeId: themeId, theme: theme } }));
        }

        applyCustomTheme(themeData) {
            if (!themeData.primary || !themeData.secondary || !themeData.bg) {
                if (showToast) showToast('Custom theme tidak valid!', 'error');
                return;
            }
            this.saveCustomTheme(themeData);
            const theme = {
                name: 'Custom',
                primary: themeData.primary,
                secondary: themeData.secondary,
                bg: themeData.bg,
                accent: themeData.accent || themeData.primary,
                fontFamily: themeData.fontFamily || 'Inter, sans-serif',
                borderRadius: themeData.borderRadius || '24px',
                gradient: themeData.gradient || null,
                mood: 'Custom'
            };
            this.themes.custom = theme;
            this.currentTheme = 'custom';
            this.applyTheme('custom', true);
            if (showToast) showToast('Custom theme diterapkan!', 'success');
        }

        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? (parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16)) : '0,255,163';
        }

        getContrastColor(hex) {
            const parts = this.hexToRgb(hex).split(',').map(Number);
            const luminance = (0.299 * parts[0] + 0.587 * parts[1] + 0.114 * parts[2]) / 255;
            return luminance > 0.5 ? '#03050A' : '#FFFFFF';
        }

        getThemes() {
            return this.themes;
        }

        getCurrentTheme() {
            return this.themes[this.currentTheme] || null;
        }

        resetTheme() {
            this.applyTheme('default');
        }

        exportTheme(themeId) {
            const theme = this.themes[themeId];
            if (!theme) {
                if (showToast) showToast('Tema tidak ditemukan!', 'error');
                return;
            }
            const exportData = {
                name: theme.name,
                colors: { primary: theme.primary, secondary: theme.secondary, bg: theme.bg, accent: theme.accent || theme.primary },
                typography: { fontFamily: theme.fontFamily || 'Inter, sans-serif', borderRadius: theme.borderRadius || '24px' },
                gradient: theme.gradient || null,
                mood: theme.mood || 'Custom',
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'kes_theme_' + themeId + '_' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(url);
            if (showToast) showToast('Tema "' + theme.name + '" diekspor!', 'success');
        }

        importTheme(file) {
            const self = this;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.colors && data.colors.primary) {
                        const themeData = {
                            primary: data.colors.primary,
                            secondary: data.colors.secondary || data.colors.primary,
                            bg: data.colors.bg || '#03050A',
                            accent: data.colors.accent || data.colors.primary,
                            fontFamily: (data.typography && data.typography.fontFamily) || 'Inter, sans-serif',
                            borderRadius: (data.typography && data.typography.borderRadius) || '24px',
                            gradient: data.gradient || null,
                            mood: data.mood || 'Imported'
                        };
                        const name = data.name || 'Imported';
                        self.themes['imported_' + Date.now()] = {
                            name: name,
                            primary: themeData.primary,
                            secondary: themeData.secondary,
                            bg: themeData.bg,
                            accent: themeData.accent,
                            fontFamily: themeData.fontFamily,
                            borderRadius: themeData.borderRadius,
                            gradient: themeData.gradient,
                            mood: themeData.mood
                        };
                        self.applyCustomTheme(themeData);
                        if (showToast) showToast('Tema "' + name + '" diimpor!', 'success');
                        self.renderUI();
                    } else {
                        throw new Error('Format tidak valid');
                    }
                } catch (err) {
                    if (showToast) showToast('Gagal import tema', 'error');
                }
            };
            reader.readAsText(file);
        }

        updateUI(activeThemeId) {
            const container = document.getElementById('customThemePanel');
            if (!container) return;
            container.querySelectorAll('.theme-btn').forEach(function(btn) {
                btn.classList.toggle('active', btn.getAttribute('data-theme') === activeThemeId);
            });
            const nameEl = container.querySelector('#currentThemeName');
            if (nameEl) {
                nameEl.textContent = (this.themes[activeThemeId] || {}).name || 'Default';
            }
            const preview = document.getElementById('themePreview');
            if (preview) {
                const inner = preview.querySelector('.ct-box-in');
                const theme = this.themes[activeThemeId];
                if (inner && theme) {
                    inner.innerHTML = 'Live Preview — Tema <strong>' + theme.name + '</strong> aktif' + (theme.mood ? ' | Mood: ' + theme.mood : '') + (this.autoMode ? ' | Auto Mode' : '');
                    preview.style.background = theme.bg;
                    inner.style.color = this.getContrastColor(theme.bg);
                }
            }
        }

        livePreview(color, type) {
            if (!type) type = 'primary';
            this.isLivePreview = true;
            document.documentElement.style.setProperty('--theme-' + type, color);
            const preview = document.getElementById('customPreview');
            if (preview) {
                preview.style.display = 'block';
                preview.style.borderColor = color;
                const text = preview.querySelector('#previewText');
                if (text) {
                    text.textContent = 'Live: ' + color;
                    text.style.color = this.getContrastColor(color);
                }
            }
        }

        renderUI() {
            injectCSS();
            const container = ensureContainer();
            const themes = this.getThemes();
            const current = this.currentTheme;
            const custom = this.customTheme;
            const stats = this.getThemeStats();
            const schedules = this.schedules;
            let html = '<div class="ct-wrap">';
            html += '<div class="ct-head"><span class="ct-title">Custom Theme</span></div>';
            html += '<div class="ct-row">';
            html += '<button id="autoModeBtn" class="ct-btn' + (this.autoMode ? ' on' : '') + '">' + (this.autoMode ? 'Auto ON' : 'Auto OFF') + '</button>';
            html += '<button id="randomThemeBtn" class="ct-btn">Random</button>';
            html += '<button id="aiThemeBtn" class="ct-btn ct-ai">AI Theme</button>';
            html += '<button id="exportThemeBtn" class="ct-btn">Export</button>';
            html += '<button id="importThemeBtn" class="ct-btn">Import</button>';
            html += '<button id="shareThemeBtn" class="ct-btn ct-share">Share</button>';
            html += '<button id="resetThemeBtn" class="ct-btn">Reset</button>';
            html += '</div>';
            html += '<div class="ct-keys">Ctrl+Shift+T = Random | Ctrl+Shift+R = Reset | Ctrl+Shift+A = Auto Mode | Ctrl+Shift+G = AI Theme</div>';
            html += '<div class="ct-stats">';
            html += '<div class="ct-stat"><b>' + stats.total + '</b><span>Total Uses</span></div>';
            html += '<div class="ct-stat"><b style="color:#FFD700">' + stats.unique + '</b><span>Unique Themes</span></div>';
            html += '<div class="ct-stat"><b style="color:#9B59B6">' + ((this.themes[stats.mostUsed] || {}).name || 'None') + '</b><span>Most Used</span></div>';
            html += '<div class="ct-stat"><b style="color:#00FFFF">' + Object.keys(this.themes).length + '</b><span>Total Themes</span></div>';
            html += '</div>';
            html += '<div class="ct-grid">';
            for (const id in themes) {
                const theme = themes[id];
                const isActive = id === current;
                html += '<button class="theme-btn' + (isActive ? ' active' : '') + '" data-theme="' + id + '" style="--tb-bg:' + theme.bg + ';--tb-fg:' + this.getContrastColor(theme.bg) + ';">';
                html += '<span class="tb-in">';
                html += '<span class="tb-sw"><span style="background:' + theme.primary + '"></span><span style="background:' + theme.secondary + '"></span><span style="background:' + (theme.accent || theme.primary) + '"></span></span>';
                html += '<span class="tb-name">' + (id === 'custom' ? 'Custom' : theme.name) + '</span>';
                if (theme.mood) html += '<span class="tb-mood">' + theme.mood + '</span>';
                if (isActive) html += '<span class="tb-active">✓ ACTIVE</span>';
                html += '</span></button>';
            }
            html += '</div>';
            html += '<div class="ct-box"><div class="ct-box-in">';
            html += '<div class="ct-box-title">Theme Scheduler</div>';
            html += '<div class="ct-flex">';
            html += '<span class="ct-rim" style="flex:1;min-width:100px;"><span class="ct-rim-in"><select id="scheduleThemeSelect">';
            for (const sid in themes) {
                html += '<option value="' + sid + '">' + themes[sid].name + '</option>';
            }
            html += '</select></span></span>';
            html += '<span class="ct-rim ct-num-w"><span class="ct-rim-in"><input type="number" id="scheduleHour" placeholder="Hour" min="0" max="23"></span></span>';
            html += '<span class="ct-rim ct-num-w"><span class="ct-rim-in"><input type="number" id="scheduleMinute" placeholder="Min" min="0" max="59"></span></span>';
            html += '<button id="addScheduleBtn" class="ct-btn">Add</button>';
            html += '</div>';
            html += '<div id="scheduleList" style="margin-top:8px;">';
            if (schedules.length === 0) {
                html += '<div style="color:#666;font-size:10px;">No schedules</div>';
            } else {
                for (let si = 0; si < schedules.length; si++) {
                    const s = schedules[si];
                    html += '<div class="ct-sched-item"><span>' + String(s.hour).padStart(2, '0') + ':' + String(s.minute).padStart(2, '0') + ' → ' + ((this.themes[s.themeId] || {}).name || s.themeId) + '</span><button class="ct-sched-x" data-id="' + s.id + '">×</button></div>';
                }
            }
            html += '</div></div></div>';
            html += '<div class="ct-box dim"><div class="ct-box-in">';
            html += '<div class="ct-box-title">Create Custom Theme</div>';
            html += '<div class="ct-colorgrid">';
            html += '<div><label class="ct-lbl">Primary Color</label><span class="ct-rim"><span class="ct-rim-in"><input type="color" id="customPrimary" value="' + ((custom && custom.primary) || '#00FFA3') + '" class="color-input" data-type="primary"></span></span></div>';
            html += '<div><label class="ct-lbl">Secondary Color</label><span class="ct-rim"><span class="ct-rim-in"><input type="color" id="customSecondary" value="' + ((custom && custom.secondary) || '#00AA6E') + '" class="color-input" data-type="secondary"></span></span></div>';
            html += '<div><label class="ct-lbl">Background Color</label><span class="ct-rim"><span class="ct-rim-in"><input type="color" id="customBg" value="' + ((custom && custom.bg) || '#03050A') + '" class="color-input" data-type="bg"></span></span></div>';
            html += '<div><label class="ct-lbl">Accent Color</label><span class="ct-rim"><span class="ct-rim-in"><input type="color" id="customAccent" value="' + ((custom && custom.accent) || '#00FFA3') + '" class="color-input" data-type="accent"></span></span></div>';
            html += '</div>';
            html += '<div class="ct-row">';
            html += '<button id="applyCustomBtn" class="ct-apply">Apply Custom</button>';
            html += '<button id="previewCustomBtn" class="ct-btn">Preview</button>';
            html += '<button id="saveCustomBtn" class="ct-btn">Save</button>';
            html += '</div>';
            html += '<div id="customPreview"><span id="previewText" style="font-weight:bold;">Warna custom siap diterapkan!</span></div>';
            html += '</div></div>';
            html += '<div class="ct-box" id="themePreview"><div class="ct-box-in">Live Preview — Tema <strong id="currentThemeName">' + ((this.themes[current] || {}).name || 'Default') + '</strong> aktif</div></div>';
            html += '<button onclick="window.showPage(\'dashboard\')" class="ct-btn ct-back">← Kembali ke Dasbor</button>';
            html += '</div>';
            container.innerHTML = html;
            this.attachEvents(container);
            this.updateUI(this.currentTheme);
        }

        attachEvents(container) {
            const self = this;
            container.querySelectorAll('.theme-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    self.applyTheme(btn.getAttribute('data-theme'));
                });
            });
            const wire = function(id, fn) {
                const el = container.querySelector('#' + id);
                if (el) el.addEventListener('click', fn);
            };
            wire('autoModeBtn', function() { self.toggleAutoMode(); });
            wire('randomThemeBtn', function() { self.randomTheme(); });
            wire('aiThemeBtn', function() { self.openAIGenerator(); });
            wire('resetThemeBtn', function() { self.resetTheme(); });
            wire('exportThemeBtn', function() { self.exportTheme(self.currentTheme); });
            wire('importThemeBtn', function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = function(e) {
                    if (e.target.files[0]) self.importTheme(e.target.files[0]);
                };
                input.click();
            });
            wire('shareThemeBtn', function() { self.shareTheme(self.currentTheme); });
            const val = function(id, fb) {
                const el = container.querySelector('#' + id);
                return (el && el.value) || fb;
            };
            wire('applyCustomBtn', function() {
                self.applyCustomTheme({
                    primary: val('customPrimary', '#00FFA3'),
                    secondary: val('customSecondary', '#00AA6E'),
                    bg: val('customBg', '#03050A'),
                    accent: val('customAccent', val('customPrimary', '#00FFA3'))
                });
            });
            container.querySelectorAll('.color-input').forEach(function(input) {
                input.addEventListener('input', function(e) {
                    self.livePreview(e.target.value, e.target.dataset.type);
                });
            });
            wire('previewCustomBtn', function() {
                const primary = val('customPrimary', '#00FFA3');
                const secondary = val('customSecondary', '#00AA6E');
                const bg = val('customBg', '#03050A');
                const accent = val('customAccent', primary);
                const preview = container.querySelector('#customPreview');
                const text = container.querySelector('#previewText');
                if (preview && text) {
                    preview.style.display = 'block';
                    preview.style.background = bg;
                    preview.style.borderColor = primary;
                    text.textContent = primary + ' • ' + secondary + ' • ' + bg;
                    text.style.color = self.getContrastColor(primary);
                }
                document.documentElement.style.setProperty('--theme-primary', primary);
                document.documentElement.style.setProperty('--theme-secondary', secondary);
                document.documentElement.style.setProperty('--theme-bg', bg);
                document.documentElement.style.setProperty('--theme-accent', accent);
                if (showToast) showToast('Preview custom theme (temporary)', 'info');
            });
            wire('saveCustomBtn', function() {
                self.saveCustomTheme({
                    primary: val('customPrimary', '#00FFA3'),
                    secondary: val('customSecondary', '#00AA6E'),
                    bg: val('customBg', '#03050A'),
                    accent: val('customAccent', val('customPrimary', '#00FFA3'))
                });
                if (showToast) showToast('Custom theme saved!', 'success');
                self.renderUI();
            });
            wire('addScheduleBtn', function() {
                const themeId = val('scheduleThemeSelect', null);
                const hour = parseInt(val('scheduleHour', ''), 10);
                const minute = parseInt(val('scheduleMinute', ''), 10);
                if (!themeId || isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                    if (showToast) showToast('Isi semua field dengan benar!', 'error');
                    return;
                }
                self.addSchedule(hour, minute, themeId);
            });
            container.querySelectorAll('.ct-sched-x').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    self.removeSchedule(parseInt(btn.dataset.id, 10));
                });
            });
        }
    }

    const customTheme = new CustomTheme();

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.CustomTheme = customTheme;
    window.CustomTheme = customTheme;

    function initCustomThemeUI() {
        injectCSS();
        window.CustomTheme.renderUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomThemeUI);
    } else {
        setTimeout(initCustomThemeUI, 100);
    }
})();