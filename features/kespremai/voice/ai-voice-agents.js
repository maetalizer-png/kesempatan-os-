const AGENT_VOICES = {
    'Kesempatan': { pitch: 0.85, rate: 0.9, voiceName: 'male', style: 'wise', greeting: 'Halo Bos, Kesempatan siap membantu!' },
    'SundanyaAsep': { pitch: 1.2, rate: 1.0, voiceName: 'male', style: 'funny', greeting: 'Aduh aduh, aya nu nyarios? Asep siap!' },
    'DevilsAdvocate': { pitch: 0.9, rate: 0.95, voiceName: 'male', style: 'sarcastic', greeting: 'Hmm, menarik. Tapi apakah itu benar?' },
    'Manager': { pitch: 0.9, rate: 0.92, voiceName: 'male', style: 'professional', greeting: 'Manager siap memberikan analisis strategis.' },
    'StartupFounder': { pitch: 1.0, rate: 1.05, voiceName: 'male', style: 'energetic', greeting: 'Gas! Startup Founder siap brainstorming!' },
    'Analyst': { pitch: 0.88, rate: 0.88, voiceName: 'male', style: 'analytical', greeting: 'Data sudah saya olah. Mari kita lihat.' },
    'Strategist': { pitch: 0.87, rate: 0.87, voiceName: 'male', style: 'calm', greeting: 'Pertimbangan matang adalah kunci.' },
    'Hunter': { pitch: 1.05, rate: 1.02, voiceName: 'male', style: 'excited', greeting: 'Ada peluang baru! Hunter siap bergerak!' },
    'DataScientist': { pitch: 0.92, rate: 0.94, voiceName: 'male', style: 'precise', greeting: 'Model sudah saya train. Akurasi tinggi.' },
    'Coding': { pitch: 0.95, rate: 1.0, voiceName: 'male', style: 'technical', greeting: 'Commit dulu, nanti kita lihat.' },
    'AIEthicsOfficer': { pitch: 0.93, rate: 0.91, voiceName: 'male', style: 'serious', greeting: 'Perhatikan etika AI dalam setiap keputusan.' },
    'Cyber': { pitch: 0.9, rate: 0.96, voiceName: 'male', style: 'suspicious', greeting: 'Sistem aman, tapi tetap waspada.' },
    'Hukum': { pitch: 0.86, rate: 0.89, voiceName: 'male', style: 'formal', greeting: 'Berdasarkan peraturan yang berlaku...' },
    'Ekonomi': { pitch: 0.89, rate: 0.93, voiceName: 'male', style: 'wise', greeting: 'Pasar bergerak dinamis, mari kita analisa.' },
    'Psikologi': { pitch: 0.95, rate: 0.92, voiceName: 'female', style: 'gentle', greeting: 'Perilaku konsumen menarik untuk dikaji.' },
    'default': { pitch: 1.0, rate: 0.95, voiceName: 'neutral', style: 'normal', greeting: 'Siap membantu analisis Anda.' }
};

let availableVoices = [];
let voicesLoaded = false;

function loadVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    const load = function() {
        availableVoices = speechSynthesis.getVoices();
        voicesLoaded = true;
    };
    if (speechSynthesis.getVoices().length > 0) load();
    else speechSynthesis.addEventListener('voiceschanged', load);
}
loadVoices();

function getBestVoice(agentVoiceConfig) {
    if (!voicesLoaded || availableVoices.length === 0) return null;
    const targetLang = 'id-ID';
    const targetGender = agentVoiceConfig.voiceName;
    let voice = availableVoices.find(function(v) {
        return v.lang === targetLang &&
            (targetGender === 'female' ? v.name.toLowerCase().includes('female') :
             targetGender === 'male' ? v.name.toLowerCase().includes('male') : true);
    });
    if (!voice) voice = availableVoices.find(function(v) { return v.lang === targetLang; });
    if (!voice) voice = availableVoices[0];
    return voice;
}

function speakWithAgentVoice(text, agentName) {
    if (!text || text.length === 0) return;
    if (typeof speechSynthesis === 'undefined') return;
    const speechEnabled = localStorage.getItem('kes_speech_enabled') !== 'false';
    if (!speechEnabled) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();

    const config = AGENT_VOICES[agentName] || AGENT_VOICES['default'];
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    const voice = getBestVoice(config);
    if (voice) utterance.voice = voice;
    if (config.style === 'energetic') utterance.rate = 1.1;
    if (config.style === 'calm') utterance.rate = 0.85;
    if (config.style === 'excited') utterance.rate = 1.15;
    if (config.style === 'sarcastic') utterance.pitch = 0.85;
    speechSynthesis.speak(utterance);
}

if (window.ChatModule && window.ChatModule.speakText) {
    const originalSpeak = window.ChatModule.speakText;
    window.ChatModule.speakText = function(text, sender) {
        let agentKey = null;
        for (const [key, val] of Object.entries(AGENT_VOICES)) {
            if (sender.includes(key) || sender.includes(val.greeting?.substring(0, 10))) {
                agentKey = key;
                break;
            }
        }
        if (!agentKey) {
            const displayMap = {
                'Kesempatan': 'Kesempatan',
                'Manager': 'Manager',
                'Startup Founder': 'StartupFounder',
                'Sundanya Asep': 'SundanyaAsep',
                'Devils Advocate': 'DevilsAdvocate'
            };
            for (const [display, key] of Object.entries(displayMap)) {
                if (sender.includes(display)) {
                    agentKey = key;
                    break;
                }
            }
        }
        if (agentKey) speakWithAgentVoice(text, agentKey);
        else originalSpeak(text, sender);
    };
}

function addVoiceTestUI() {
    const container = document.getElementById('naturalVoicePanel');
    if (!container || document.getElementById('agentVoiceTestBtn')) return;
    const testSection = document.createElement('div');
    testSection.style.marginTop = '16px';
    testSection.style.padding = '12px';
    testSection.style.background = 'rgba(155,89,182,0.1)';
    testSection.style.borderRadius = '16px';
    testSection.innerHTML =
        '<div style="margin-bottom:8px;"><span style="color:#9B59B6;">🎤 Test Suara Unik Agen</span></div>' +
        '<div style="display:flex; flex-wrap:wrap; gap:8px;">' +
            '<button id="testVoiceKesempatan" class="btn" style="background:#00FFA3; color:#03050A;">👨 Kesempatan</button>' +
            '<button id="testVoiceSunda" class="btn" style="background:#FFD700; color:#03050A;">😂 Asep</button>' +
            '<button id="testVoiceDevil" class="btn" style="border-color:#FF4444;">👿 Devil</button>' +
            '<button id="testVoiceManager" class="btn">📋 Manager</button>' +
            '<button id="testVoiceStartup" class="btn">🚀 Founder</button>' +
        '</div>';
    container.appendChild(testSection);

    document.getElementById('testVoiceKesempatan')?.addEventListener('click', function() {
        speakWithAgentVoice('Halo Bos! Ini suara khas Kesempatan. Bijak, santai, tapi tegas.', 'Kesempatan');
    });
    document.getElementById('testVoiceSunda')?.addEventListener('click', function() {
        speakWithAgentVoice('Aduh aduuh, aya nu nelepon? Sundanya Asep siap siap! lucu kan?', 'SundanyaAsep');
    });
    document.getElementById('testVoiceDevil')?.addEventListener('click', function() {
        speakWithAgentVoice('Apakah keputusan ini sudah dipikirkan matang? Saya ragu.', 'DevilsAdvocate');
    });
    document.getElementById('testVoiceManager')?.addEventListener('click', function() {
        speakWithAgentVoice('Analisis strategis saya sampaikan secara profesional.', 'Manager');
    });
    document.getElementById('testVoiceStartup')?.addEventListener('click', function() {
        speakWithAgentVoice('Gaskeun! Startup Founder siap bantu scaling bisnis Anda!', 'StartupFounder');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(addVoiceTestUI, 1000); });
} else {
    setTimeout(addVoiceTestUI, 1000);
}

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

export const AIVoiceAgents = Object.freeze({
    speakWithAgentVoice: speakWithAgentVoice,
    AGENT_VOICES: AGENT_VOICES
});

KESEMPATAN.AIVoiceAgents = AIVoiceAgents;