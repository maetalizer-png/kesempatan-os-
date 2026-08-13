
const container = document.getElementById('interactivePage');
if (container && container.dataset.rendered !== 'true') {
    container.dataset.rendered = 'true';
    container.innerHTML =
        '<h2 style="color:#00FFA3;">Fitur Chat, Forum, Debat, Rap Battle & Turnamen</h2>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">' +
            '<button id="modeChatAiBtn" class="execute-btn secondary" style="flex:1;">CHAT AI</button>' +
            '<button id="modeChatAgentBtn" class="execute-btn secondary" style="flex:1;">CHAT AGEN</button>' +
            '<button id="modeForumBtn" class="execute-btn secondary" style="flex:1;">FORUM 55</button>' +
            '<button id="modeDebateBtn" class="execute-btn secondary" style="flex:1;">DEBAT AGEN</button>' +
            '<button id="modeTournamentBtn" class="execute-btn secondary" style="flex:1;">TURNAMEN</button>' +
        '</div>' +
        '<div id="interactiveChatAiPanel"></div>' +
        '<div id="interactiveChatAgentPanel" style="display:none;"></div>' +
        '<div id="interactiveForumPanel" style="display:none;"></div>' +
        '<div id="interactiveDebatePanel" style="display:none;"></div>' +
        '<div id="interactiveTournamentPanel" style="display:none;"></div>' +
        '<button class="execute-btn secondary" style="margin-top:20px; width:auto;" onclick="window.showPage(\'dashboard\')">Kembali ke Dasbor</button>';
}
