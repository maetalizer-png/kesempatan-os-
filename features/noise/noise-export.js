import { NoiseUtils } from './noise-utils.js';
import { NoiseState } from './noise-state.js';
import { NoiseCore } from './noise-core.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

    const Utils = NoiseUtils.Utils;
    const _state = NoiseState.state;

    function exportData(format) {
        format = format || 'json';
        const data = Utils.buildExportSnapshot(_state);
        if (format === 'csv') {
            if (!data.signals || data.signals.length === 0) {
                Utils.showToast('Tidak ada data untuk diekspor CSV', 'warning');
                return;
            }
            let csv = 'Timestamp,Sumber,Konten,Status,Confidence,Sentiment,Credibility,Reason\n';
            data.signals.forEach(function(s) {
                const time = new Date(s.timestamp).toISOString();
                const content = (s.content || '').replace(/,/g, ';').replace(/\n/g, ' ');
                csv += time + ',' + (s.source || 'Unknown') + ',' + content + ',' + s.status + ',' + s.confidence + ',' + s.sentiment + ',' + s.credibilityScore + ',' + s.reason + '\n';
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'noise_filter_export_' + Date.now() + '.csv';
            a.click();
            URL.revokeObjectURL(url);
            Utils.showToast('Data CSV diekspor!', 'success');
        } else {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'noise_filter_export_' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(url);
            Utils.showToast('Data JSON diekspor!', 'success');
        }
    }

    function clearHistory() {
        if (_state.history.length === 0) {
            Utils.showToast('Tidak ada riwayat untuk dihapus', 'warning');
            return;
        }
        if (confirm('Hapus semua riwayat scan?')) {
            _state.history = [];
            _state.signals = [];
            _state.stats = { total: 0, blocked: 0, filtered: 0, allowed: 0 };
            _state.scanCount = 0;
            if (NoiseCore.saveState) NoiseCore.saveState();
            if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.renderDashboard) KESEMPATAN.NoiseUI.renderDashboard();
            Utils.showToast('Riwayat dihapus', 'success');
        }
    }

    function printDashboard() {
        window.print();
    }

export const NoiseExport = {
    exportData: exportData,
    clearHistory: clearHistory,
    printDashboard: printDashboard
};
KESEMPATAN.NoiseExport = NoiseExport;