const MATH_WORD_PATTERNS = [
    [/(\d+(?:[.,]\d+)?)\s*ditambah\s*(\d+(?:[.,]\d+)?)/gi, '$1+$2'],
    [/(\d+(?:[.,]\d+)?)\s*dikurang\s*(\d+(?:[.,]\d+)?)/gi, '$1-$2'],
    [/(\d+(?:[.,]\d+)?)\s*(?:dikali|kali)\s*(\d+(?:[.,]\d+)?)/gi, '$1*$2'],
    [/(\d+(?:[.,]\d+)?)\s*dibagi\s*(\d+(?:[.,]\d+)?)/gi, '$1/$2']
];

function replaceMathWords(text) {
    let out = text;
    MATH_WORD_PATTERNS.forEach(function(pair) {
        out = out.replace(pair[0], pair[1]);
    });
    return out;
}

function extractMathExpr(text) {
    const replaced = replaceMathWords(text);
    const matches = replaced.match(/-?[0-9]+(?:[.,][0-9]+)?(?:\s*[+\-*/]\s*-?[0-9]+(?:[.,][0-9]+)?)+/g);
    if (!matches || !matches.length) return null;
    return matches.sort(function(a, b) { return b.length - a.length; })[0].replace(/\s+/g, '').replace(/,/g, '.');
}

function safeEvalMath(expr) {
    if (!/^-?[0-9+\-*/.() ]+$/.test(expr)) return null;
    try {
        const result = Function('"use strict"; return (' + expr + ')')();
        return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (e) {
        return null;
    }
}

function evaluateMath(text) {
    const expr = extractMathExpr(text);
    if (!expr) return null;
    const result = safeEvalMath(expr);
    if (result === null) return null;
    const rounded = Number.isInteger(result) ? result : Math.round(result * 10000) / 10000;
    return { expr: expr, result: rounded, answer: 'Hasil dari ' + expr + ' adalah ' + rounded + '.' };
}

const DATETIME_RE = /\b(tanggal|jam)\s*berapa\b|\bberapa\s*(tanggal|jam)\b|^(jam|tanggal)\s*berapa\b|\bhari\s*ini\s*tanggal\b/i;
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function currentDateTime() {
    const now = new Date();
    const tanggal = DAY_NAMES[now.getDay()] + ', ' + now.getDate() + ' ' + MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear();
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return { tanggal: tanggal, jam: jam, answer: 'Sekarang ' + tanggal + ', pukul ' + jam + '.' };
}

function tryQuickAnswer(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;
    if (DATETIME_RE.test(trimmed)) {
        return { tool: 'datetime', answer: currentDateTime().answer };
    }
    const math = evaluateMath(trimmed);
    if (math) {
        return { tool: 'math', answer: math.answer, result: math.result };
    }
    return null;
}

export const QuickTools = Object.freeze({
    tryQuickAnswer: tryQuickAnswer,
    evaluateMath: evaluateMath,
    currentDateTime: currentDateTime
});
