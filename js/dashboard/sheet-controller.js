function openSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('aria-hidden', 'false');
}

function closeSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('aria-hidden', 'true');
}

function closeAllSheets() {
    document.querySelectorAll('.kos-sheet[aria-hidden="false"]').forEach(function(sheet) {
        sheet.setAttribute('aria-hidden', 'true');
    });
}

document.addEventListener('click', function(e) {
    const closer = e.target.closest('[data-sheet-close]');
    if (closer) {
        const sheet = closer.closest('.kos-sheet');
        if (sheet) closeSheet(sheet.id);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAllSheets();
});

export const SheetController = Object.freeze({
    open: openSheet,
    close: closeSheet,
    closeAll: closeAllSheets
});

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.SheetController = SheetController;
