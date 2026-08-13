

import { RapUILayout } from './rap-ui-layout.js';
import { RapUIStyle } from './rap-ui-style.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#00FFA3; color:#03050A; padding:10px 20px; border-radius:30px; z-index:9999; font-weight:bold; font-size:13px;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2500);
        return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    else if (type === 'warn') toast.style.borderLeftColor = '#FFA500';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}


function ensureContainer() {
    let container = document.getElementById('rapBattlePanel');
    if (!container) {
        const page = document.getElementById('rapbattlearenaPage');
        const target = page || document.body;
        container = document.createElement('div');
        container.id = 'rapBattlePanel';
        container.style.cssText = 'display:block; padding:0; margin:0;';
        target.appendChild(container);
    }
    return container;
}


function render() {
    const container = ensureContainer();
    if (container.dataset.rendered === 'true') return;
    container.dataset.rendered = 'true';

    container.innerHTML = RapUILayout.buildHTML();

    
    
    RapUILayout.renderCypherLounge(container);
    RapUILayout.renderSongSelect(container);

    RapUIStyle.inject();
}





export const RapUIRenderer = {
    render: render,
    ensureContainer: ensureContainer,
    showToast: showToast,
    renderCypherLounge: RapUILayout.renderCypherLounge,
    renderSongSelect: RapUILayout.renderSongSelect,
    markRole: RapUILayout.markRole,
    clearRole: RapUILayout.clearRole,
    syncHiddenSelects: RapUILayout.syncHiddenSelects
};

KESEMPATAN.RapUIRenderer = RapUIRenderer;
