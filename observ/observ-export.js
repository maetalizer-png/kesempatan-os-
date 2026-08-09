import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;
const state = OBS.getState();

function exportJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        total: state.signals.length,
        signals: state.signals.map(s => ({
            title: s.title,
            desc: s.desc,
            category: s.category,
            source: s.source,
            time: OBS.getTimeAgo(s.timestamp),
            timestamp: s.timestamp
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    OBS.showToast('JSON diekspor!', 'success');
}

function exportCSV() {
    function escapeCsvField(value) {
        return String(value == null ? '' : value).replace(/"/g, '""');
    }
    let csv = 'Title,Category,Source,Time\n';
    state.signals.forEach(s => {
        csv += `"${escapeCsvField(s.title)}","${escapeCsvField(s.category)}","${escapeCsvField(s.source)}","${escapeCsvField(OBS.getTimeAgo(s.timestamp))}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observation_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    OBS.showToast('CSV diekspor!', 'success');
}

OBS.Export = {
    exportJSON,
    exportCSV
};

KESEMPATAN.Observation = OBS;
