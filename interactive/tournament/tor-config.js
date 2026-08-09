/* ============================================================
   interactive/tournament/tor-config.js
   KONFIGURASI TURNAMEN — util agen (roster dinamis dari
   dashboard, nama tampilan, validasi bentuk identifier).
   ============================================================ */
    // FIX: window.Utils punya property "showToast" (bukan "TRN_showToast")
// — destructuring lama SELALU menghasilkan undefined krn nama properti
// tidak cocok (pola sama persis dgn bug yang ditemukan di debate.js),
// jadi semua notifikasi toast di Turnamen (20+ titik panggil di core.js/
// tournament-arena.js) diam-diam tidak pernah muncul. Diperbaiki jadi
// rename saat destructure.
export const { showToast: TRN_showToast } = window.Utils || {};

    // ============================================================
    // RESOLVER DATA AGEN — TIDAK ADA ROSTER/NAMA HARDCODE.
    // Sumber tunggal kebenaran:
    //   1. Elemen .agent-checkbox[data-agent] yang dirender dashboard
    //      dari registry pusat (agents-config.js/world.js) — ini
    //      adalah roster SUNGGUHAN, bisa sampai ~200 agen.
    //   2. window.getAgentConfig() untuk nama tampilan & peran/keahlian
    //      asli tiap agen (dipakai juga untuk memperkaya prompt AI).
    // Kalau dashboard belum sempat render, kita JUJUR melaporkan roster
    // kosong (lihat TRN_runTournamentBracket) alih-alih memakai daftar agen
    // tetap yang dikarang.
    // ============================================================
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
        // Validasi BENTUK identifier (keamanan), bukan whitelist nama
        // tetap — agen apa pun dari roster pusat otomatis diterima.
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

