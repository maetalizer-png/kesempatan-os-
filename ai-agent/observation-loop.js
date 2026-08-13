

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getObservation() {
    return KESEMPATAN.Observation || null;
}


function getSignals() {
    const obs = getObservation();
    if (!obs || typeof obs.getSignals !== 'function') return [];
    return obs.getSignals() || [];
}



async function refreshSignals() {
    const obs = getObservation();
    if (!obs || typeof obs.generateSignals !== 'function') return getSignals();
    try {
        await obs.generateSignals();
    } catch (e) {
        
        
    }
    return getSignals();
}




function getContextForTopic(topic, limit) {
    const signals = getSignals();
    if (!topic) return signals.slice(0, limit || 10);
    const q = topic.toLowerCase();
    return signals
        .filter(function(s) {
            const text = ((s.title || '') + ' ' + (s.desc || '')).toLowerCase();
            return text.includes(q);
        })
        .slice(0, limit || 10);
}

export const ObservationLoop = Object.freeze({
    getSignals: getSignals,
    refreshSignals: refreshSignals,
    getContextForTopic: getContextForTopic
});
