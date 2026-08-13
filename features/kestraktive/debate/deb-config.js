







export const { showToast: DEB_showToast } = window.Utils || {};

    
    
    
    
    
    
    

export function DEB_getFullAgentPool() {
        let boxes = document.querySelectorAll('.agent-checkbox[data-agent]');
        if (boxes.length === 0 && window.KESEMPATAN?.AgentRenderer?.renderAllAgents) {
            
            
            
            
            window.KESEMPATAN?.AgentRenderer?.renderAllAgents();
            boxes = document.querySelectorAll('.agent-checkbox[data-agent]');
        }
        const seen = {};
        const pool = [];
        boxes.forEach(function(cb) {
            const agent = cb.dataset.agent;
            if (agent && !seen[agent]) {
                seen[agent] = true;
                pool.push(agent);
            }
        });
        return pool;
    }

export function DEB_humanizeAgentName(agent) {
        if (!agent || typeof agent !== 'string') {
            return '';
        }
        return agent
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

export function DEB_getAgentProfile(agent) {
        if (window.getAgentConfig) {
            const cfg = window.getAgentConfig(agent);
            if (cfg) {
                return {
                    name: cfg.name || cfg.displayName || DEB_humanizeAgentName(agent),
                    role: cfg.role || cfg.expertise || cfg.description || '',
                    emoji: cfg.emoji || cfg.icon || '',
                    systemPrompt: cfg.systemPrompt || ''
                };
            }
        }
        return { name: DEB_humanizeAgentName(agent), role: '', emoji: '', systemPrompt: '' };
    }

export function DEB_populateAgentSelect(selectEl, preferredIndex) {
        if (!selectEl) {
            return;
        }
        const pool = DEB_getFullAgentPool();
        if (pool.length === 0) {
            selectEl.innerHTML = '<option value="">(Tidak ada agen terdeteksi dari dashboard)</option>';
            return;
        }
        selectEl.innerHTML = pool.map(function(agent) {
            const profile = DEB_getAgentProfile(agent);
            const label = (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
            return '<option value="' + agent.replace(/"/g, '&quot;') + '">' + label.replace(/</g, '&lt;') + '</option>';
        }).join('');
        if (typeof preferredIndex === 'number' && pool[preferredIndex]) {
            selectEl.value = pool[preferredIndex];
        }
    }

    
    
    

export const DEB_CONFIG = {
        STORAGE_KEY: 'debate_history_v12',
        THEME_KEY: 'debate_theme',
        CACHE_KEY: 'debate_cache_v12',
        MAX_HISTORY: 50,
        MAX_CACHE: 100,
        CACHE_TTL: 300000,
        AUTO_SAVE_INTERVAL: 30000,
        SEARCH_THRESHOLD: 0.1,
        MAX_RESULTS: 7,
        TOP_K_MEMORY: 5,
        DB_LIMIT: 3,
        MAX_TOKENS: 1200,
        TEMPERATURE: 0.7,
        VOICE_RATE: 0.92,
        SUPPORTED_MODELS: {
            'deepseek': 'DeepSeek Chat',
            'gpt-4': 'GPT-4 Turbo',
            'claude': 'Claude 3 Opus',
            'gemini': 'Gemini Pro',
            'llama': 'Llama 3'
        },
        DEFAULT_MODEL: 'deepseek'
    };
