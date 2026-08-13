

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;



const RISKY_ACTION_KEYWORDS = [
    'publish', 'delete', 'hapus', 'destructive', 'drop', 'truncate',
    'config', 'konfigurasi', 'external', 'eksternal'
];

function isRiskyAction(actionName) {
    const name = (actionName || '').toLowerCase();
    return RISKY_ACTION_KEYWORDS.some(function(kw) { return name.includes(kw); });
}

function getHITL() {
    return KESEMPATAN.HITL || null;
}





function autoApproveIfEligible(results) {
    const hitl = getHITL();
    if (!hitl || typeof hitl.autoApproveResults !== 'function') return null;
    return hitl.autoApproveResults(results, 'act');
}




function requestManualApproval(results) {
    const hitl = getHITL();
    if (!hitl || typeof hitl.renderPanel !== 'function' || typeof hitl.setConfirmCallback !== 'function') {
        return Promise.resolve(null);
    }
    return new Promise(function(resolve) {
        hitl.setConfirmCallback(function(approved) { resolve(approved); });
        hitl.renderPanel(results);
    });
}

export const ApprovalManager = Object.freeze({
    isRiskyAction: isRiskyAction,
    autoApproveIfEligible: autoApproveIfEligible,
    requestManualApproval: requestManualApproval
});
