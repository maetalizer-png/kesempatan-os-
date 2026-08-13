
    





export const { showToast: TRN_showToast } = window.Utils || {};

    
    
    
    
    
    
    
    
    
    
    
    
export function TRN_getFullAgentPool() {
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

export function TRN_isKnownRosterAgent(agent) {
        
        
        return typeof agent === 'string' && agent.length > 0 && agent.length <= 64 && /^[A-Za-z0-9_\- ]+$/.test(agent);
    }

export function TRN_humanizeAgentName(agent) {
        if (!agent || typeof agent !== 'string') {
            return '';
        }
        return agent
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

export function TRN_getAgentProfile(agent) {
        if (window.getAgentConfig) {
            const cfg = window.getAgentConfig(agent);
            if (cfg) {
                return {
                    name: cfg.name || cfg.displayName || TRN_humanizeAgentName(agent),
                    role: cfg.role || cfg.expertise || cfg.description || '',
                    emoji: cfg.emoji || cfg.icon || ''
                };
            }
        }
        return { name: TRN_humanizeAgentName(agent), role: '', emoji: '' };
    }

export function TRN_getAgentLabel(agent) {
        const profile = TRN_getAgentProfile(agent);
        return (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
    }

