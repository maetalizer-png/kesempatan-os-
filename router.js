(function() {
'use strict';
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getModule(moduleName) {
    return KESEMPATAN[moduleName] || window[moduleName];
}

// Pages that render entirely through getModule(X).render(), with the same
// "not available" fallback message — no page-specific logic beyond the
// module name and label, so a small table covers all of them.
const SIMPLE_RENDER_PAGES = {
    memory: ['MemoryPage', 'Memory Manager'],
    report: ['ReportPage', 'Laporan Final'],
    telemetry: ['TelemetryPage', 'Telemetri'],
    learning: ['LearningPage', 'Auto-Learning'],
    settings: ['SettingsPage', 'Pengaturan']
};

// Pages with their own render logic (different element ids, module names,
// render method names, extra args, retry timers, etc). Each handler owns
// showing its own element and return-ing to skip the fallthrough at the
// bottom of showPage().
const PAGE_HANDLERS = {
    dashboard: function() {
        const dashboard = document.getElementById('dashboardGrid');
        if (dashboard) dashboard.style.display = 'grid';
    },
    interactive: function() {
        const element = document.getElementById('interactivePage');
        if (element) {
            element.style.display = 'block';
            const interactiveModule = getModule('InteractivePage');
            if (interactiveModule && typeof interactiveModule.render === 'function') interactiveModule.render();
        }
    },
    aiworkers: function() {
        const element = document.getElementById('aiWorkersPage');
        if (element) {
            element.style.display = 'block';
            if (typeof KESEMPATAN.WorkersRenderer?.renderWorkersPage === 'function') KESEMPATAN.WorkersRenderer.renderWorkersPage();
        }
    },
    aiworkersdata: function() {
        const element = document.getElementById('aiWorkersDataPage');
        if (element) {
            element.style.display = 'block';
            if (typeof KESEMPATAN.WorkersRenderer?.renderLogsPage === 'function') KESEMPATAN.WorkersRenderer.renderLogsPage();
        }
    },
    customautoagent: function() {
        const element = document.getElementById('customautoagentPage');
        if (element) {
            element.style.display = 'block';
            const customModule = getModule('CustomAutoAgent');
            if (customModule && typeof customModule.render === 'function') customModule.render();
        }
    },
    rapbattlearena: function() {
        const element = document.getElementById('rapbattlearenaPage');
        if (element) {
            element.style.display = 'block';
            const rapModule = getModule('RapBattle');
            if (rapModule && typeof rapModule.render === 'function') rapModule.render();
        }
    },
    voicechatsuara: function() {
        const element = document.getElementById('voicechatsuaraPage');
        if (element) {
            element.style.display = 'block';
            const voiceModule = getModule('VoiceClone');
            if (voiceModule && typeof voiceModule.render === 'function') voiceModule.render();
        }
    },
    livecrypto: function() {
        const element = document.getElementById('livecryptoPage');
        if (element) {
            element.style.display = 'block';
            const cryptoModule = getModule('LiveCrypto');
            if (cryptoModule && typeof cryptoModule.render === 'function') cryptoModule.render();
        }
    },
    editfoto: function() {
        const element = document.getElementById('editfotoPage');
        if (element) {
            element.style.display = 'block';
            setTimeout(function() {
                if (typeof window.renderEditFoto === 'function') window.renderEditFoto();
                else if (window.initEditFoto) window.initEditFoto();
            }, 100);
        }
    },
    sharesosmed: function() {
        const element = document.getElementById('sharesosmedPage');
        if (element) {
            element.style.display = 'block';
            const socialModule = getModule('SuperSocialShare');
            if (socialModule && typeof socialModule.render === 'function') socialModule.render();
        }
    },
    customtheme: function() {
        const element = document.getElementById('customthemePage');
        if (element) {
            element.style.display = 'block';
            const themeModule = getModule('CustomTheme');
            if (themeModule && typeof themeModule.renderUI === 'function') themeModule.renderUI();
        }
    },
    websocket: function() {
        const element = document.getElementById('websocketPage');
        if (element) {
            element.style.display = 'block';
            const collabModule = getModule('Collab');
            if (collabModule && typeof collabModule.renderUI === 'function') collabModule.renderUI(element);
        }
    },
    publicapi: function() {
        const element = document.getElementById('publicapiPage');
        if (element) {
            element.style.display = 'block';
            const apiContainer = document.getElementById('publicApiContainer');
            const apiModule = getModule('PublicAPI');
            if (apiContainer && apiModule && typeof apiModule.renderUI === 'function') apiModule.renderUI(apiContainer);
        }
    },
    podcast: function() {
        const element = document.getElementById('podcastPage');
        if (element) {
            element.style.display = 'block';
            const podcastModule = getModule('PodcastGenerator');
            if (podcastModule && podcastModule.render) {
                podcastModule.render();
            } else {
                setTimeout(function() {
                    const panel = document.getElementById('podcastGeneratorPanel');
                    if (panel && podcastModule && podcastModule.render) podcastModule.render();
                }, 100);
            }
        }
    },
    news: function() {
        const element = document.getElementById('newsPage');
        if (element) {
            element.style.display = 'block';
            const newsModule = getModule('NewsAggregator');
            if (newsModule && newsModule.render) {
                newsModule.render();
            } else {
                setTimeout(function() {
                    const panel = document.getElementById('newsAggregatorPanel');
                    if (panel && newsModule && newsModule.render) newsModule.render();
                }, 100);
            }
        }
    },
    offline: function() {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            if (typeof renderOfflinePage === 'function') renderOfflinePage();
        }
    },
    parallel: function() {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            if (KESEMPATAN.WorkflowParallel?.renderParallelPage) KESEMPATAN.WorkflowParallel.renderParallelPage();
        }
    },
    premium: function() { PAGE_HANDLERS.visualagent(); },
    visualagent: function() {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            const visualModule = getModule('VisualisationAI');
            if (visualModule && typeof visualModule.render === 'function') visualModule.render();
        }
    },
    keschat: function() {
        window.location.href = 'chat-kesempatan.html';
    },
    cache: function() {
        const cachePage = document.getElementById('cachePage');
        if (cachePage) {
            cachePage.style.display = 'block';
            const cacheModule = getModule('CachePage');
            if (cacheModule && typeof cacheModule.render === 'function') cacheModule.render();
        }
    },
    observation: function(pageContainer, pageInner, observationEngine) {
        if (pageContainer) pageContainer.style.display = 'block';
        if (pageInner) pageInner.style.display = 'none';
        if (observationEngine) {
            observationEngine.style.display = 'block';
            const observationModule = getModule('ObservationPage');
            if (observationModule && typeof observationModule.render === 'function') observationModule.render();
            if (observationModule && typeof observationModule.start === 'function') observationModule.start();
        }
    },
    noise: function() {
        const noiseElement = document.getElementById('noisePage');
        if (noiseElement) {
            noiseElement.style.display = 'block';
            const noiseModule = getModule('NoisePage');
            if (noiseModule && typeof noiseModule.render === 'function') {
                noiseModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'noise-filtering.js';
                script.async = false;
                script.onload = function() {
                    const loadedNoiseModule = getModule('NoisePage');
                    if (loadedNoiseModule && typeof loadedNoiseModule.render === 'function') loadedNoiseModule.render();
                };
                document.head.appendChild(script);
            }
        }
    }
};

function renderSimplePage(pageId, pageInner) {
    const [moduleName, label] = SIMPLE_RENDER_PAGES[pageId];
    const module = getModule(moduleName);
    if (module && typeof module.render === 'function') {
        module.render();
    } else if (pageInner) {
        pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ ' + label + ' tidak tersedia.</p>';
    }
}

function showPage(pageId) {
    const sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) sidebarElement.classList.remove('open');

    const observationModule = getModule('ObservationPage');
    if (observationModule && typeof observationModule.stop === 'function') observationModule.stop();

    const allPageIds = [
        'dashboardGrid', 'pageContent', 'interactivePage', 'aiWorkersPage', 'premiumPage',
        'aiWorkersDataPage', 'customautoagentPage', 'rapbattlearenaPage', 'voicechatsuaraPage',
        'livecryptoPage', 'editfotoPage', 'sharesosmedPage', 'customthemePage', 'websocketPage',
        'publicapiPage', 'podcastPage', 'newsPage', 'cachePage', 'noisePage'
    ];
    for (let i = 0; i < allPageIds.length; i++) {
        const pageElement = document.getElementById(allPageIds[i]);
        if (pageElement) pageElement.style.display = 'none';
    }
    document.querySelectorAll('.dynamic-page').forEach(function(el) { el.style.display = 'none'; });

    const topbar = document.getElementById('mainTopbar');
    if (topbar) topbar.style.display = (pageId === 'dashboard') ? 'block' : 'none';

    document.querySelectorAll('.menu button').forEach(function(btn) { btn.classList.remove('active'); });
    const targetButton = document.querySelector('.menu button[data-page="' + pageId + '"]') || document.getElementById(pageId + 'MenuBtn');
    if (targetButton) targetButton.classList.add('active');

    const pageContainer = document.getElementById('pageContent');
    const pageInner = document.getElementById('pageInner');
    const observationEngine = document.getElementById('obsEngine');

    if (pageId === 'observation') {
        PAGE_HANDLERS.observation(pageContainer, pageInner, observationEngine);
        return;
    }

    if (PAGE_HANDLERS[pageId]) {
        PAGE_HANDLERS[pageId]();
        return;
    }

    if (pageContainer) pageContainer.style.display = 'block';
    if (observationEngine) observationEngine.style.display = 'none';
    if (pageInner) {
        pageInner.style.display = 'block';
        pageInner.innerHTML = '';
    }

    if (SIMPLE_RENDER_PAGES[pageId]) {
        renderSimplePage(pageId, pageInner);
    } else if (pageInner) {
        pageInner.innerHTML = '<p class="text-dim">Halaman sedang dikembangkan</p>';
    }
}

document.querySelectorAll('.menu button[data-page]').forEach(function(btn) {
    if (btn.dataset.navBound) return;
    btn.dataset.navBound = 'true';
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        showPage(page);
    });
});

document.querySelectorAll('#premiumSubmenu button, #marketdataSubmenu button, #kesmediaSubmenu button, #monitoringSubmenu button').forEach(function(btn) {
    if (btn.dataset.navBound) return;
    btn.dataset.navBound = 'true';
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        showPage(page);
    });
});

KESEMPATAN.Router = Object.freeze({ showPage: showPage, getModule: getModule });

// Compat alias: 16+ not-yet-migrated files still call window.showPage directly.
// Remove once they're migrated to window.KESEMPATAN.Router.showPage.
window.showPage = showPage;
})();