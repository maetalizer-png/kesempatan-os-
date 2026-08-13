











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
