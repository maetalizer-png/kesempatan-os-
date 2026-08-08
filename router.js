(function() {
'use strict';

window.KESEMPATAN = window.KESEMPATAN || {};

function getModule(moduleName) {
    return window.KESEMPATAN?.[moduleName] || window[moduleName];
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

    if (pageId === 'dashboard') {
        const dashboard = document.getElementById('dashboardGrid');
        if (dashboard) dashboard.style.display = 'grid';
        return;
    }

    if (pageId === 'interactive') {
        const element = document.getElementById('interactivePage');
        if (element) {
            element.style.display = 'block';
            const interactiveModule = getModule('InteractivePage');
            if (interactiveModule && typeof interactiveModule.render === 'function') interactiveModule.render();
        }
        return;
    }

    if (pageId === 'aiworkers') {
        const element = document.getElementById('aiWorkersPage');
        if (element) {
            element.style.display = 'block';
            if (typeof renderAIWorkersPage === 'function') renderAIWorkersPage();
        }
        return;
    }

    if (pageId === 'aiworkersdata') {
        const element = document.getElementById('aiWorkersDataPage');
        if (element) {
            element.style.display = 'block';
            if (typeof renderAIWorkersDataPage === 'function') renderAIWorkersDataPage();
        }
        return;
    }

    if (pageId === 'customautoagent') {
        const element = document.getElementById('customautoagentPage');
        if (element) {
            element.style.display = 'block';
            const customModule = getModule('CustomAutoAgent');
            if (customModule && typeof customModule.render === 'function') customModule.render();
        }
        return;
    }

    if (pageId === 'rapbattlearena') {
        const element = document.getElementById('rapbattlearenaPage');
        if (element) {
            element.style.display = 'block';
            const rapModule = getModule('RapBattle');
            if (rapModule && typeof rapModule.render === 'function') rapModule.render();
        }
        return;
    }

    if (pageId === 'voicechatsuara') {
        const element = document.getElementById('voicechatsuaraPage');
        if (element) {
            element.style.display = 'block';
            const voiceModule = getModule('VoiceClone');
            if (voiceModule && typeof voiceModule.render === 'function') voiceModule.render();
        }
        return;
    }

    if (pageId === 'livecrypto') {
        const element = document.getElementById('livecryptoPage');
        if (element) {
            element.style.display = 'block';
            const cryptoModule = getModule('LiveCrypto');
            if (cryptoModule && typeof cryptoModule.render === 'function') cryptoModule.render();
        }
        return;
    }

    if (pageId === 'editfoto') {
        const element = document.getElementById('editfotoPage');
        if (element) {
            element.style.display = 'block';
            setTimeout(function() {
                if (typeof window.renderEditFoto === 'function') window.renderEditFoto();
                else if (window.initEditFoto) window.initEditFoto();
            }, 100);
        }
        return;
    }

    if (pageId === 'sharesosmed') {
        const element = document.getElementById('sharesosmedPage');
        if (element) {
            element.style.display = 'block';
            const socialModule = getModule('SuperSocialShare');
            if (socialModule && typeof socialModule.render === 'function') socialModule.render();
        }
        return;
    }

    if (pageId === 'customtheme') {
        const element = document.getElementById('customthemePage');
        if (element) {
            element.style.display = 'block';
            const themeModule = getModule('CustomTheme');
            if (themeModule && typeof themeModule.renderUI === 'function') themeModule.renderUI();
        }
        return;
    }

    if (pageId === 'websocket') {
        const element = document.getElementById('websocketPage');
        if (element) {
            element.style.display = 'block';
            const collabModule = getModule('Collab');
            if (collabModule && typeof collabModule.renderUI === 'function') collabModule.renderUI(element);
        }
        return;
    }

    if (pageId === 'publicapi') {
        const element = document.getElementById('publicapiPage');
        if (element) {
            element.style.display = 'block';
            const apiContainer = document.getElementById('publicApiContainer');
            const apiModule = getModule('PublicAPI');
            if (apiContainer && apiModule && typeof apiModule.renderUI === 'function') apiModule.renderUI(apiContainer);
        }
        return;
    }

    if (pageId === 'podcast') {
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
        return;
    }

    if (pageId === 'news') {
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
        return;
    }

    if (pageId === 'offline') {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            if (typeof renderOfflinePage === 'function') renderOfflinePage();
        }
        return;
    }

    if (pageId === 'parallel') {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            if (typeof renderParallelPage === 'function') renderParallelPage();
        }
        return;
    }

    if (pageId === 'premium' || pageId === 'visualagent') {
        const element = document.getElementById('premiumPage');
        if (element) {
            element.style.display = 'block';
            const visualModule = getModule('VisualisationAI');
            if (visualModule && typeof visualModule.render === 'function') visualModule.render();
        }
        return;
    }

    if (pageId === 'keschat') {
        window.location.href = 'chat-kesempatan.html';
        return;
    }

    if (pageId === 'cache') {
        const cachePage = document.getElementById('cachePage');
        if (cachePage) {
            cachePage.style.display = 'block';
            const cacheModule = getModule('CachePage');
            if (cacheModule && typeof cacheModule.render === 'function') cacheModule.render();
        }
        return;
    }

    if (pageId === 'observation') {
        if (pageContainer) pageContainer.style.display = 'block';
        if (pageInner) pageInner.style.display = 'none';
        if (observationEngine) {
            observationEngine.style.display = 'block';
            const observationModule2 = getModule('ObservationPage');
            if (observationModule2 && typeof observationModule2.render === 'function') observationModule2.render();
            if (observationModule2 && typeof observationModule2.start === 'function') observationModule2.start();
        }
        return;
    }

    if (pageId === 'noise') {
        const noiseElement = document.getElementById('noisePage');
        if (noiseElement) {
            noiseElement.style.display = 'block';
            const noiseModule = getModule('NoisePage');
            if (noiseModule && typeof noiseModule.render === 'function') {
                noiseModule.render();
            } else {
                const script = document.createElement('script');
                script.src = 'noise/noise-filtering.js';
                script.async = false;
                script.onload = function() {
                    const loadedNoiseModule = getModule('NoisePage');
                    if (loadedNoiseModule && typeof loadedNoiseModule.render === 'function') loadedNoiseModule.render();
                };
                document.head.appendChild(script);
            }
        }
        return;
    }

    if (pageContainer) pageContainer.style.display = 'block';
    if (observationEngine) observationEngine.style.display = 'none';
    if (pageInner) {
        pageInner.style.display = 'block';
        pageInner.innerHTML = '';
    }

    if (pageId === 'memory') {
        const memoryModule = getModule('MemoryPage');
        if (memoryModule && typeof memoryModule.render === 'function') {
            memoryModule.render();
        } else if (pageInner) {
            pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ Memory Manager tidak tersedia.</p>';
        }
    } else if (pageId === 'report') {
        const reportModule = getModule('ReportPage');
        if (reportModule && typeof reportModule.render === 'function') {
            reportModule.render();
        } else if (pageInner) {
            pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ Laporan Final tidak tersedia.</p>';
        }
    } else if (pageId === 'telemetry') {
        const telemetryModule = getModule('TelemetryPage');
        if (telemetryModule && typeof telemetryModule.render === 'function') {
            telemetryModule.render();
        } else if (pageInner) {
            pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ Telemetri tidak tersedia.</p>';
        }
    } else if (pageId === 'learning') {
        const learningModule = getModule('LearningPage');
        if (learningModule && typeof learningModule.render === 'function') {
            learningModule.render();
        } else if (pageInner) {
            pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ Auto-Learning tidak tersedia.</p>';
        }
    } else if (pageId === 'settings') {
        const settingsModule = getModule('SettingsPage');
        if (settingsModule && typeof settingsModule.render === 'function') {
            settingsModule.render();
        } else if (pageInner) {
            pageInner.innerHTML = '<p style="color:#ff8888;padding:20px;">❌ Pengaturan tidak tersedia.</p>';
        }
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

window.KESEMPATAN.Router = Object.freeze({ showPage: showPage, getModule: getModule });
window.showPage = showPage;
})();