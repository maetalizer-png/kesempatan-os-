import { Utils } from '../../../js/core/utils.js';
import { ExportManager } from '../../../js/dashboard/export.js';
import { WorkflowEngine } from '../../../js/workflow/workflow.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const showToastFn = Utils.showToast || null;

function toast(msg, type) {
    if (showToastFn) { showToastFn(msg, type); return; }
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

const SS_CSS = `:root{--ss-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--ss-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--ss-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} #sharePanel{box-sizing:border-box;padding:4px 12px !important;} .ss-wrap{position:relative;margin:0;padding:2px 0 16px;} .ss-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px;} .ss-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);} .ss-sub{font-size:10px;color:#A0B3C9;margin-top:4px;} .ss-btn{position:relative;isolation:isolate;clip-path:var(--ss-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:9px 16px;color:var(--primary,#00FFA3);font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .ss-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip-asym);background:#06100b;z-index:-1;} .ss-btn:active{transform:scale(.97);} .ss-primary{background:linear-gradient(135deg,var(--primary,#00FFA3),#00AA6E);color:#03130b;} .ss-primary::before{display:none;} .ss-danger{background:rgba(255,68,68,.5);color:#FF8080;} .ss-danger::before{background:#160608;} .ss-box{position:relative;isolation:isolate;clip-path:var(--ss-clip);background:rgba(26,255,156,.25);padding:12px 14px;margin-bottom:14px;transition:background .25s ease,filter .3s ease;} .ss-box::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip);background:#05080c;z-index:-1;} .ss-box:hover{background:rgba(26,255,156,.45);} .ss-box-title{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#A0B3C9;margin-bottom:10px;} .ss-cta-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;} .ss-cta-title{font-size:14px;font-weight:800;color:#FFD700;text-shadow:0 0 8px rgba(255,215,0,.3);} .ss-cta-sub{font-size:11px;color:#A0B3C9;margin-top:2px;} .ss-status{font-size:11px;color:var(--primary,#00FFA3);margin-top:8px;min-height:14px;} .ss-progress{height:4px;clip-path:var(--ss-clip-sm);background:rgba(255,255,255,.06);margin-top:6px;} .ss-progress-fill{height:100%;width:0%;background:var(--primary,#00FFA3);transition:width .3s ease;} .ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;} .ss-plat{position:relative;isolation:isolate;clip-path:var(--ss-clip-sm);background:rgba(26,255,156,.25);padding:1px;cursor:pointer;} .ss-plat::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip-sm);background:#07130d;z-index:-1;} .ss-plat-in{display:flex;align-items:center;gap:8px;padding:9px 10px;} .ss-plat input{accent-color:var(--primary,#00FFA3);width:16px;height:16px;margin:0;cursor:pointer;} .ss-plat-name{font-size:11px;color:#E0E6ED;} .ss-flex{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;} .ss-input,.ss-select{flex:1;min-width:150px;background:#05080c;border:0;border-radius:0;clip-path:var(--ss-clip-sm);color:#E0E6ED;padding:9px 12px;font-size:12px;outline:none;margin:0;filter:drop-shadow(0 0 1px rgba(26,255,156,.55)) drop-shadow(0 0 1px rgba(26,255,156,.55));transition:filter .25s ease;} .ss-input:focus,.ss-select:focus{filter:drop-shadow(0 0 2px rgba(0,255,163,.85)) drop-shadow(0 0 2px rgba(0,255,163,.85));} .ss-select{width:100%;margin-bottom:8px;} .ss-preview{margin-top:4px;padding:10px;clip-path:var(--ss-clip-sm);background:rgba(0,0,0,.4);font-size:12px;color:#A0B3C9;min-height:80px;white-space:pre-wrap;filter:drop-shadow(0 0 1px rgba(26,255,156,.4)) drop-shadow(0 0 1px rgba(26,255,156,.4));} .ss-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;} .ss-stat{position:relative;isolation:isolate;clip-path:var(--ss-clip-sm);background:rgba(26,255,156,.25);padding:1px;text-align:center;} .ss-stat::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip-sm);background:#05080c;z-index:-1;} .ss-stat b{display:block;font-size:14px;color:var(--primary,#00FFA3);padding-top:6px;} .ss-stat span{display:block;font-size:9px;color:#7c8a82;padding:2px 4px 7px;} .ss-sched{margin-top:8px;font-size:10px;color:#A0B3C9;} .ss-sched-item{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);} .ss-sched-x{position:relative;isolation:isolate;clip-path:var(--ss-clip-asym);border:0;border-radius:0;background:rgba(255,68,68,.5);color:#FF8080;padding:3px 10px;font-size:10px;cursor:pointer;} .ss-sched-x::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip-asym);background:#160608;z-index:-1;} .ss-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;} .ss-row .ss-btn{flex:1;} .ss-history{margin-top:8px;max-height:200px;overflow-y:auto;} .ss-hist-item{position:relative;isolation:isolate;clip-path:var(--ss-clip-sm);background:rgba(26,255,156,.25);padding:1px;margin-bottom:8px;} .ss-hist-item::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip-sm);background:#05080c;z-index:-1;} .ss-hist-in{padding:8px 10px;font-size:11px;color:#A0B3C9;} .ss-result{position:relative;isolation:isolate;clip-path:var(--ss-clip);background:rgba(26,255,156,.25);padding:12px 14px;margin-bottom:14px;} .ss-result::before{content:'';position:absolute;inset:1px;clip-path:var(--ss-clip);background:#05080c;z-index:-1;} .ss-back{display:block;width:100%;margin-top:14px;} .ss-foot{font-size:9px;color:#444;text-align:center;margin-top:8px;} @media (hover:hover) and (pointer:fine){ .ss-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .ss-plat:hover{background:rgba(26,255,156,.5);} }`;

function injectCSS() {
    if (document.getElementById('socialShareStyle')) return;
    const s = document.createElement('style');
    s.id = 'socialShareStyle';
    s.textContent = SS_CSS;
    document.head.appendChild(s);
}

const PLATFORMS = {
    twitter: { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', enabled: true, maxLength: 280,
        shareUrl: function(text, url) { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url); } },
    tiktok: { id: 'tiktok', name: 'TikTok', color: '#000000', enabled: true, maxLength: 150,
        shareUrl: function(text) { navigator.clipboard.writeText(text); return 'https://www.tiktok.com/'; } },
    instagram: { id: 'instagram', name: 'Instagram', color: '#E4405F', enabled: true, maxLength: 2200,
        shareUrl: function(text) { navigator.clipboard.writeText(text); return 'https://www.instagram.com/'; } },
    facebook: { id: 'facebook', name: 'Facebook', color: '#1877F2', enabled: true, maxLength: 5000,
        shareUrl: function(text, url) { return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text); } },
    linkedin: { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', enabled: true, maxLength: 3000,
        shareUrl: function(text, url) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url); } },
    whatsapp: { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', enabled: true, maxLength: 1000,
        shareUrl: function(text, phone) { return phone ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text) : 'https://wa.me/?text=' + encodeURIComponent(text); } },
    telegram: { id: 'telegram', name: 'Telegram', color: '#0088cc', enabled: true, maxLength: 4000,
        shareUrl: function(text) { return 'https://t.me/share/url?url=&text=' + encodeURIComponent(text); } },
    discord: { id: 'discord', name: 'Discord', color: '#5865F2', enabled: true, maxLength: 2000,
        shareUrl: function(text) { navigator.clipboard.writeText(text); return 'https://discord.com/channels/@me'; } },
    reddit: { id: 'reddit', name: 'Reddit', color: '#FF4500', enabled: true, maxLength: 3000,
        shareUrl: function(text, url) { return 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(text.substring(0, 300)); } }
};

function ensureContainer() {
    let container = document.getElementById('sharePanel');
    if (!container) {
        const page = document.getElementById('sharesosmedPage');
        const target = page || document.body;
        container = document.createElement('div');
        container.id = 'sharePanel';
        container.style.cssText = 'display:block;padding:0;margin:0;';
        target.appendChild(container);
    }
    return container;
}

class SuperSocialShare {
    constructor() {
        this.platforms = PLATFORMS;
        this.lastResult = null;
        this.isSharing = false;
        this.shareHistory = this.loadHistory();
        this.engagementStats = this.loadStats();
        this.scheduledPosts = this.loadScheduled();
        this.cancelRequested = false;
        this.currentYear = new Date().getFullYear();
        const self = this;
        setInterval(function() { self.checkScheduledPosts(); }, 30000);
        this.restoreState();
    }
    loadHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('kes_super_share_history')) || [];
            if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
                window.KESEMPATAN.KesDatabase.migrateArrayOnce('super_share_history', history);
            }
            return history;
        } catch (e) { return []; }
    }
    saveHistory() {
        localStorage.setItem('kes_super_share_history', JSON.stringify(this.shareHistory));
        
        if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem && this.shareHistory[0]) {
            window.KESEMPATAN.KesDatabase.mirrorHistoryItem('super_share_history', this.shareHistory[0]);
        }
    }
    loadStats() { try { return JSON.parse(localStorage.getItem('kes_super_share_stats')) || {}; } catch (e) { return {}; } }
    saveStats() { localStorage.setItem('kes_super_share_stats', JSON.stringify(this.engagementStats)); }
    loadScheduled() { try { return JSON.parse(localStorage.getItem('kes_super_share_scheduled')) || []; } catch (e) { return []; } }
    saveScheduled() { localStorage.setItem('kes_super_share_scheduled', JSON.stringify(this.scheduledPosts)); }
    saveState() { localStorage.setItem('kes_super_share_state', JSON.stringify({ lastResult: this.lastResult, timestamp: Date.now() })); }
    restoreState() { try { const s = JSON.parse(localStorage.getItem('kes_super_share_state')); if (s && s.lastResult) this.lastResult = s.lastResult; } catch (e) { console.warn('[SocialShare] restoreState failed:', e.message); } }
    setResult(r) { this.lastResult = r; this.saveState(); }
    delay(ms) { return new Promise(function(res) { setTimeout(res, ms); }); }
    getApiKey() {
        const input = document.getElementById('apiKeyInput');
        if (input && input.value && input.value.trim().length > 10) return input.value.trim();
        if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) return window.CONFIG.API_KEYS.openrouter;
        return null;
    }
    async callAI(prompt) {
        const apiKey = this.getApiKey();
        if (!apiKey) return null;
        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'deepseek/deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 800, temperature: 0.7 })
            });
            const data = await res.json();
            if (data.choices && data.choices[0]) return data.choices[0].message.content;
            return null;
        } catch (e) { return null; }
    }
    async generateAIContent(report, platformId) {
        const platform = this.platforms[platformId];
        const prompt = 'Anda adalah AI Content Strategist KESEMPATAN OS. Tahun ' + this.currentYear + '. Laporan: Topik: ' + (report.topic || 'Opportunity') + ' Skor: ' + (report.score || 0) + '/100 Insight: ' + (report.insight || []).slice(0, 3).join('. ') + ' Rekomendasi: ' + (report.recommendation || '') + '. Buatkan konten share untuk ' + platform.name + ': hook kuat, informatif, actionable, maksimal ' + platform.maxLength + ' karakter, bahasa Indonesia. Output HANYA teks.';
        const ai = await this.callAI(prompt);
        if (ai) return ai.substring(0, platform.maxLength);
        return this.generateManualContent(report, platformId);
    }
    generateManualContent(report, platformId) {
        const topic = report.topic || 'Opportunity';
        const score = report.score || 0;
        const insight = (report.insight || []).slice(0, 2).join('\n• ');
        const rec = report.recommendation || '';
        const base = {
            twitter: topic + '\nSkor: ' + score + '/100\n' + ((report.insight && report.insight[0]) || '').substring(0, 80) + '\n\n#KESEMPATANOS #AI #Bisnis ' + this.currentYear,
            tiktok: 'AI bilang peluang ini skor ' + score + '/100!\n' + ((report.insight && report.insight[0]) || '').substring(0, 60) + '\n#AI #Bisnis #FYP #KESEMPATANOS',
            instagram: 'KESEMPATAN OS\n\n' + topic + '\nSkor: ' + score + '/100\n\nInsight:\n• ' + insight + '\n\n' + rec + '\n\n#AI #Bisnis #Peluang #KESEMPATANOS',
            facebook: 'KESEMPATAN OS\n\n' + topic + '\nSkor: ' + score + '/100\n\nInsight:\n• ' + insight + '\n\n' + rec + '\n\n#AI #Bisnis #Peluang #KESEMPATANOS',
            linkedin: 'KESEMPATAN OS - Analisis Peluang ' + this.currentYear + '\n\nTopik: ' + topic + '\nSkor: ' + score + '/100\n\nInsight:\n' + insight + '\n\nRekomendasi: ' + rec + '\n\n#AI #Business #Opportunity',
            whatsapp: 'KESEMPATAN OS\n\n' + topic + '\nSkor: ' + score + '/100\n\nInsight:\n• ' + insight + '\n\n' + rec,
            telegram: 'KESEMPATAN OS\n\n' + topic + '\nSkor: ' + score + '/100\n\nInsight:\n• ' + insight + '\n\n' + rec,
            discord: 'KESEMPATAN OS\n' + topic + '\nSkor: ' + score + '/100\nInsight:\n' + insight,
            reddit: topic + '\nSkor: ' + score + '/100\n\n' + ((report.insight && report.insight[0]) || '') + '\n\n#AI #Business #Opportunity'
        };
        return base[platformId] || base.twitter;
    }
    generateHashtags(report, platformId) {
        const words = (report.topic || 'Opportunity').split(' ').slice(0, 3);
        const tags = words.map(function(w) { return '#' + w.replace(/[^a-zA-Z0-9]/g, ''); }).filter(function(w) { return w.length > 2; });
        const baseTags = ['#KESEMPATANOS', '#AI', '#' + this.currentYear];
        if (platformId === 'tiktok') baseTags.push('#FYP', '#Viral');
        if (platformId === 'instagram') baseTags.push('#Explore', '#Reels');
        if (platformId === 'linkedin') baseTags.push('#Business', '#Strategy');
        return tags.concat(baseTags).slice(0, 10).join(' ');
    }
    async generateImage(report) {
        try {
            const prompt = (report.topic || 'Opportunity') + ', ' + this.currentYear + ', business opportunity analysis, professional, 4k';
            return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=1024&height=768&nologo=true';
        } catch (e) { return null; }
    }
    async shortenUrl(url) {
        try {
            const res = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
            const shortUrl = await res.text();
            if (shortUrl && shortUrl.startsWith('http')) return shortUrl;
            return url;
        } catch (e) { return url; }
    }
    async shareToPlatform(platformId, report) {
        const platform = this.platforms[platformId];
        if (!platform) throw new Error('Platform tidak ditemukan');
        let text = await this.generateAIContent(report, platformId);
        const hashtags = this.generateHashtags(report, platformId);
        if (text.indexOf('#') === -1) text += '\n\n' + hashtags;
        const shortUrl = await this.shortenUrl(window.location.href);
        if (text.indexOf(shortUrl) === -1) text += '\n\n' + shortUrl;
        const imageUrl = await this.generateImage(report);
        if (imageUrl && ['twitter', 'facebook', 'linkedin'].indexOf(platformId) !== -1) text += '\n\n' + imageUrl;
        let shareResult;
        if (platformId === 'whatsapp') {
            const phone = prompt('Masukkan nomor WhatsApp (kosongkan untuk skip):', '');
            const url = platform.shareUrl(text, phone || undefined);
            if (url) window.open(url, '_blank');
            shareResult = { success: true, url: url, text: text };
        } else {
            const url = platform.shareUrl(text, shortUrl);
            if (typeof url === 'string' && url.indexOf('http') === 0) {
                window.open(url, '_blank');
                shareResult = { success: true, url: url, text: text };
            } else {
                navigator.clipboard.writeText(text);
                shareResult = { success: true, copied: true, text: text };
            }
        }
        this.trackEngagement(platformId, 'share', { text: text, url: shortUrl });
        return { success: true, platform: platformId, result: shareResult };
    }
    async shareToAll() {
        if (this.isSharing) { toast('Sedang sharing, tunggu...', 'warn'); return; }
        const report = this.lastResult || window.lastAggregated;
        if (!report) { toast('Jalankan analisis dulu!', 'error'); return; }
        this.isSharing = true;
        this.cancelRequested = false;
        const cancelBtn = document.getElementById('cancelShareBtn');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        toast('Mulai share ke semua platform...', 'info');
        this.updateShareStatus('Memulai...', 0);
        const self = this;
        const enabled = Object.keys(this.platforms).filter(function(id) { return self.platforms[id].enabled; });
        const results = [];
        let completed = 0;
        for (let i = 0; i < enabled.length; i++) {
            if (this.cancelRequested) break;
            const platformId = enabled[i];
            try {
                const r = await this.shareToPlatform(platformId, report);
                results.push({ platform: platformId, success: true, result: r });
                toast(this.platforms[platformId].name + ' berhasil', 'success');
            } catch (e) {
                results.push({ platform: platformId, success: false, error: e.message });
                toast(this.platforms[platformId].name + ' gagal', 'error');
            }
            completed++;
            this.updateShareStatus(completed + '/' + enabled.length + ' selesai', Math.round((completed / enabled.length) * 100));
            await this.delay(800);
        }
        this.shareHistory.unshift({ id: Date.now(), topic: report.topic || 'Opportunity', score: report.score || 0, results: results, timestamp: Date.now() });
        if (this.shareHistory.length > 50) this.shareHistory.pop();
        this.saveHistory();
        this.showShareResult(results);
        this.isSharing = false;
        if (cancelBtn) cancelBtn.style.display = 'none';
        toast('Selesai! ' + results.filter(function(r) { return r.success; }).length + ' platform berhasil', 'success');
        this.updateShareStatus('Selesai!', 100);
        return results;
    }
    cancelShare() { this.cancelRequested = true; toast('Membatalkan share...', 'info'); }
    updateShareStatus(message, progress) {
        const s = document.getElementById('shareStatus');
        const p = document.getElementById('shareProgressBar');
        if (s) s.textContent = message;
        if (p) p.style.width = progress + '%';
    }
    showShareResult(results) {
        const container = document.getElementById('shareResultContainer');
        if (!container) return;
        const ok = results.filter(function(r) { return r.success; }).length;
        const fail = results.length - ok;
        let html = '<div class="ss-result"><div class="ss-cta-head"><div class="ss-cta-title">Hasil Share</div><div style="font-size:11px;color:#A0B3C9;">' + ok + ' berhasil' + (fail > 0 ? ' | ' + fail + ' gagal' : '') + '</div></div><div class="ss-stats" style="margin-top:10px;">';
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const p = this.platforms[r.platform];
            html += '<div class="ss-stat"><b style="color:' + (r.success ? '#00FFA3' : '#FF4444') + '">' + (r.success ? 'OK' : 'X') + '</b><span>' + ((p && p.name) || r.platform) + '</span></div>';
        }
        html += '</div><div class="ss-row" style="margin-top:10px;margin-bottom:0;"><button id="closeShareResultBtn" class="ss-btn">Tutup</button><button id="exportShareReportBtn" class="ss-btn">Export Report</button></div></div>';
        container.innerHTML = html;
        const self = this;
        const closeBtn = document.getElementById('closeShareResultBtn');
        if (closeBtn) closeBtn.addEventListener('click', function() { container.innerHTML = ''; });
        const expBtn = document.getElementById('exportShareReportBtn');
        if (expBtn) expBtn.addEventListener('click', function() { self.exportShareReport(results); });
    }
    exportShareReport(results) {
        const data = { timestamp: new Date().toISOString(), year: this.currentYear, totalPlatforms: results.length, successCount: results.filter(function(r) { return r.success; }).length, results: results };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kes_share_report_' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        toast('Laporan share berhasil diekspor!', 'success');
    }
    trackEngagement(platform, action, data) {
        if (!this.engagementStats[platform]) this.engagementStats[platform] = { totalShares: 0, history: [] };
        this.engagementStats[platform].totalShares++;
        this.engagementStats[platform].history.push({ action: action, data: data, timestamp: Date.now() });
        this.saveStats();
    }
    schedulePost(report, platforms, datetime) {
        if (!report) { toast('Tidak ada laporan!', 'error'); return null; }
        const post = { id: Date.now(), report: report, platforms: platforms, scheduledAt: datetime, status: 'pending', createdAt: new Date().toISOString(), year: this.currentYear };
        this.scheduledPosts.push(post);
        this.saveScheduled();
        toast('Posting dijadwalkan untuk ' + new Date(datetime).toLocaleString(), 'success');
        this.renderScheduledList();
        return post;
    }
    checkScheduledPosts() {
        const now = new Date();
        for (let i = 0; i < this.scheduledPosts.length; i++) {
            const post = this.scheduledPosts[i];
            if (post.status === 'pending' && new Date(post.scheduledAt) <= now) this.executeScheduledPost(post);
        }
    }
    async executeScheduledPost(post) {
        post.status = 'executing';
        this.saveScheduled();
        toast('Menjalankan posting terjadwal: ' + post.report.topic, 'info');
        const results = [];
        for (let i = 0; i < post.platforms.length; i++) {
            try {
                const r = await this.shareToPlatform(post.platforms[i], post.report);
                results.push({ platform: post.platforms[i], success: true, result: r });
            } catch (e) {
                results.push({ platform: post.platforms[i], success: false, error: e.message });
            }
            await this.delay(500);
        }
        post.status = 'completed';
        post.completedAt = new Date().toISOString();
        post.results = results;
        this.saveScheduled();
        this.renderScheduledList();
        toast('Posting terjadwal selesai!', 'success');
    }
    deleteScheduledPost(id) {
        const idx = this.scheduledPosts.findIndex(function(p) { return p.id === id; });
        if (idx !== -1) {
            this.scheduledPosts.splice(idx, 1);
            this.saveScheduled();
            this.renderScheduledList();
            toast('Posting terjadwal dihapus', 'info');
        }
    }
    getStats() {
        const stats = {};
        for (const platform in this.engagementStats) {
            stats[platform] = { name: (this.platforms[platform] && this.platforms[platform].name) || platform, totalShares: this.engagementStats[platform].totalShares || 0 };
        }
        return stats;
    }
    renderScheduledList() {
        const container = document.getElementById('scheduledList');
        if (!container) return;
        const pending = this.scheduledPosts.filter(function(p) { return p.status === 'pending'; });
        if (pending.length === 0) {
            container.innerHTML = '<div style="font-size:10px;color:#666;">Tidak ada posting terjadwal</div>';
            return;
        }
        const self = this;
        let html = '';
        for (let i = 0; i < pending.length; i++) {
            const post = pending[i];
            html += '<div class="ss-sched-item"><span>' + new Date(post.scheduledAt).toLocaleString() + ' — "' + ((post.report.topic || '').substring(0, 30) || 'Untitled') + '"</span><button class="ss-sched-x" data-id="' + post.id + '">×</button></div>';
        }
        container.innerHTML = html;
        container.querySelectorAll('.ss-sched-x').forEach(function(btn) {
            btn.addEventListener('click', function() { self.deleteScheduledPost(parseInt(btn.dataset.id, 10)); });
        });
    }
    renderHistory() {
        const container = document.getElementById('shareHistoryContainer');
        if (!container) return;
        if (this.shareHistory.length === 0) {
            container.innerHTML = '<div style="font-size:10px;color:#666;">Belum ada history share</div>';
            return;
        }
        let html = '';
        for (let i = 0; i < Math.min(20, this.shareHistory.length); i++) {
            const item = this.shareHistory[i];
            html += '<div class="ss-hist-item"><div class="ss-hist-in"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;"><span style="color:#00FFA3;font-weight:bold;">' + ((item.topic || '').substring(0, 40) || 'Untitled') + '</span><span>' + item.score + '/100</span><span>' + new Date(item.timestamp).toLocaleString() + '</span></div><div style="margin-top:4px;">' + item.results.filter(function(r) { return r.success; }).length + ' berhasil dari ' + item.results.length + ' platform</div></div></div>';
        }
        container.innerHTML = html;
    }
    async updatePreview() {
        const sel = document.getElementById('previewPlatform');
        const previewDiv = document.getElementById('contentPreview');
        const report = this.lastResult || window.lastAggregated;
        if (!report || !sel) {
            if (previewDiv) previewDiv.textContent = 'Belum ada laporan untuk preview';
            return;
        }
        const platform = this.platforms[sel.value];
        const text = await this.generateAIContent(report, sel.value);
        if (previewDiv) {
            previewDiv.innerHTML = '<div style="color:' + (platform.color || '#00FFA3') + ';font-weight:bold;margin-bottom:8px;">' + platform.name + ' <span style="font-size:10px;color:#666;">(' + text.length + '/' + platform.maxLength + ' karakter)</span></div><div style="white-space:pre-wrap;color:#E0E6ED;">' + text + '</div>';
        }
    }
    render() {
        injectCSS();
        const container = ensureContainer();
        const stats = this.getStats();
        const report = this.lastResult || window.lastAggregated;
        const self = this;
        let html = '<div class="ss-wrap">';
        html += '<div class="ss-head"><div><div class="ss-title">Kartu Sosial Media</div><div class="ss-sub">Bukan hasil analisis (itu ada di Report Dock) — kartu ringkas siap-bagi ke semua platform, 1 klik • auto-generate • scheduled</div></div><button id="refreshShareBtn" class="ss-btn">Refresh</button></div>';
        html += '<div class="ss-box"><div class="ss-cta-head"><div><div class="ss-cta-title">1 Klik Share</div><div class="ss-cta-sub">' + (report ? (((report.topic || '').substring(0, 40) || 'Laporan siap') + ' | ' + (report.score || 0) + '/100') : 'Jalankan analisis dulu') + '</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;"><button id="shareAllBtn" class="ss-btn ss-primary">Share ke Semua</button><button id="cancelShareBtn" class="ss-btn ss-danger" style="display:none;">Batal</button></div></div><div id="shareStatus" class="ss-status"></div><div class="ss-progress"><div id="shareProgressBar" class="ss-progress-fill"></div></div></div>';
        html += '<div class="ss-box"><div class="ss-box-title">Pilih Platform</div><div class="ss-grid">';
        for (const id in this.platforms) {
            const p = this.platforms[id];
            html += '<label class="ss-plat"><span class="ss-plat-in"><input type="checkbox" class="platform-toggle" data-platform="' + id + '"' + (p.enabled ? ' checked' : '') + '><span class="ss-plat-name">' + p.name + '</span></span></label>';
        }
        html += '</div></div>';
        html += '<div class="ss-box"><div class="ss-box-title">Jadwalkan Posting</div><div class="ss-flex"><input type="datetime-local" id="scheduleDateTime" class="ss-input"><button id="scheduleBtn" class="ss-btn">Jadwalkan</button></div><div id="scheduledList" class="ss-sched"></div></div>';
        html += '<div class="ss-box"><div class="ss-box-title">Preview Konten</div><select id="previewPlatform" class="ss-select">';
        for (const id in this.platforms) { html += '<option value="' + id + '">' + this.platforms[id].name + '</option>'; }
        html += '</select><div id="contentPreview" class="ss-preview">Belum ada laporan untuk preview</div></div>';
        html += '<div class="ss-box"><div class="ss-box-title">Statistik Share</div><div id="statsGrid" class="ss-stats">';
        for (const platform in stats) { html += '<div class="ss-stat"><b>' + stats[platform].totalShares + '</b><span>' + stats[platform].name + '</span></div>'; }
        html += '</div></div>';
        html += '<div id="shareResultContainer"></div>';
        html += '<div class="ss-row"><button id="viewHistoryBtn" class="ss-btn">Lihat History</button><button id="clearHistoryBtn" class="ss-btn ss-danger">Clear</button></div>';
        html += '<div id="shareHistoryContainer" class="ss-history" style="display:none;"></div>';
        html += '<button onclick="window.showPage(\'dashboard\')" class="ss-btn ss-back">← Kembali ke Dasbor</button>';
        html += '<div class="ss-foot">KESEMPATAN OS • 9 Platform • AI Internal</div>';
        html += '</div>';
        container.innerHTML = html;
        this.attachEvents(container);
        setTimeout(function() { self.updatePreview(); }, 200);
        this.renderScheduledList();
    }
    attachEvents(container) {
        const self = this;
        const on = function(id, fn) { const el = container.querySelector('#' + id); if (el) el.addEventListener('click', fn); };
        on('shareAllBtn', function() { self.shareToAll(); });
        on('cancelShareBtn', function() { self.cancelShare(); });
        container.querySelectorAll('.platform-toggle').forEach(function(t) {
            t.addEventListener('change', function(e) {
                const id = e.target.dataset.platform;
                if (self.platforms[id]) {
                    self.platforms[id].enabled = e.target.checked;
                    toast(self.platforms[id].name + (e.target.checked ? ' diaktifkan' : ' dinonaktifkan'), 'info');
                }
            });
        });
        on('scheduleBtn', function() {
            const dt = container.querySelector('#scheduleDateTime');
            const report = self.lastResult || window.lastAggregated;
            if (!report) { toast('Tidak ada laporan!', 'error'); return; }
            if (!dt || !dt.value) { toast('Pilih tanggal & waktu!', 'error'); return; }
            const selected = [];
            container.querySelectorAll('.platform-toggle:checked').forEach(function(t) { selected.push(t.dataset.platform); });
            if (selected.length === 0) { toast('Pilih minimal 1 platform!', 'error'); return; }
            self.schedulePost(report, selected, dt.value);
        });
        const prevSel = container.querySelector('#previewPlatform');
        if (prevSel) prevSel.addEventListener('change', function() { self.updatePreview(); });
        on('viewHistoryBtn', function() {
            const h = container.querySelector('#shareHistoryContainer');
            if (h) {
                if (h.style.display === 'none') { h.style.display = 'block'; self.renderHistory(); }
                else { h.style.display = 'none'; }
            }
        });
        on('clearHistoryBtn', function() {
            if (confirm('Hapus semua history share?')) {
                self.shareHistory = [];
                self.saveHistory();
                self.renderHistory();
                toast('History share dihapus', 'success');
            }
        });
        on('refreshShareBtn', function() {
            self.render();
            toast('Panel direfresh!', 'success');
        });
    }
}

function initSuperSocialShare() {
    
    
    
    
    const original = ExportManager.setData;
    window.ExportManager = Object.assign({}, ExportManager, {
        setData: function(aggregated, note) {
            original(aggregated, note);
            if (window.SuperSocialShare) window.SuperSocialShare.setResult(aggregated);
        }
    });
    KESEMPATAN.ExportManager = window.ExportManager;

    if (!window.SuperSocialShare) window.SuperSocialShare = new SuperSocialShare();
    window.SuperSocialShare.render();
}

const originalStart = WorkflowEngine.start;
WorkflowEngine.start = async function(payload, uploadedContent) {
    const result = await originalStart.call(this, payload, uploadedContent);
    if (window.lastAggregated && window.SuperSocialShare) window.SuperSocialShare.setResult(window.lastAggregated);
    return result;
};

export const SocialShare = Object.freeze({
    init: initSuperSocialShare
});

KESEMPATAN.SocialShare = SocialShare;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuperSocialShare);
} else {
    initSuperSocialShare();
}