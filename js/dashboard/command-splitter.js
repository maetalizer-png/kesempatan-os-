const DEFAULT_INSTRUCTION = 'analisis peluang dan berikan rekomendasi';

const MARKER_PATTERNS = [
    'dengan fokus', 'fokus ke', 'fokus pada', 'fokus', 'dengan instruksi',
    'prioritas', 'target', 'anggaran', 'modal', 'bandingkan dengan',
    'abaikan', 'untuk kalangan'
];

const MARKER_RE = new RegExp('\\b(' + MARKER_PATTERNS.map(function(m) {
    return m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')\\b', 'i');

function findMarkerSplit(text) {
    const match = MARKER_RE.exec(text);
    if (!match) return null;
    const topic = text.slice(0, match.index).trim().replace(/[,.]$/, '').trim();
    const instruction = text.slice(match.index + match[0].length).trim();
    if (!topic || !instruction) return null;
    return { topic: topic, instruction: instruction, marker: match[1] };
}

function getCorrectionMemory() {
    try {
        const raw = localStorage.getItem('kos_split_fix');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCorrection(originalText, topic, instruction) {
    try {
        const memory = getCorrectionMemory();
        memory.unshift({ text: originalText, topic: topic, instruction: instruction, ts: Date.now() });
        localStorage.setItem('kos_split_fix', JSON.stringify(memory.slice(0, 50)));
    } catch (e) {}
}

function findRememberedSplit(text) {
    const memory = getCorrectionMemory();
    const trimmed = text.trim().toLowerCase();
    const exact = memory.find(function(item) { return item.text.trim().toLowerCase() === trimmed; });
    if (exact) return { topic: exact.topic, instruction: exact.instruction, marker: null, remembered: true };
    return null;
}

function splitCommand(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return { topic: '', instruction: DEFAULT_INSTRUCTION, marker: null, remembered: false };

    const remembered = findRememberedSplit(trimmed);
    if (remembered) return remembered;

    const marked = findMarkerSplit(trimmed);
    if (marked) return { topic: marked.topic, instruction: marked.instruction, marker: marked.marker, remembered: false };

    return { topic: trimmed, instruction: DEFAULT_INSTRUCTION, marker: null, remembered: false };
}

export const CommandSplitter = Object.freeze({
    splitCommand: splitCommand,
    saveCorrection: saveCorrection,
    DEFAULT_INSTRUCTION: DEFAULT_INSTRUCTION
});
