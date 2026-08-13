// Shared prompt loader untuk semua 55 agent config files.
// Sumber sekarang prompts/<agentName>.json (bukan .txt lagi) — schema:
// { agentId, text, sections, opening, headingStyle }. Hanya field `text`
// yang dipakai di sini (itu satu-satunya yang benar-benar menentukan output
// LLM); `sections`/`opening`/`headingStyle` adalah metadata best-effort
// untuk tooling lain, bukan sumber kebenaran runtime.
//
// options.replaceYear: agents-config.js (bisnis agents) mengganti
// placeholder {{TAHUN}} di prompt dan menyisipkan tahun berjalan ke fallback
// message; 4 file agent lain (general/politics/global/science) tidak
// melakukan ini — perilaku masing-masing dipertahankan persis seperti
// sebelum konsolidasi.
export async function loadPrompt(agentName, options) {
    options = options || {};
    const currentYear = new Date().getFullYear();
    try {
        const response = await fetch(`prompts/${agentName}.json`);
        if (response.ok) {
            const json = await response.json();
            const text = typeof json.text === 'string' ? json.text : '';
            return options.replaceYear ? text.replace(/\{\{TAHUN\}\}/g, currentYear) : text;
        }
    } catch (error) {
        console.warn('[PromptLoader] loadPrompt fetch failed:', error.message);
    }
    return options.replaceYear
        ? `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda untuk tahun ${currentYear}. Output dalam format JSON.`
        : `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda. Output dalam format JSON.`;
}
