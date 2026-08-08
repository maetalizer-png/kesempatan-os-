(function() {
'use strict';
if (window.__CollabPageLoaded) {
return;
}
window.__CollabPageLoaded = true;
function renderUI(container) {
if (!container) {
return;
}
container.innerHTML =
'<h2>Kolaborasi Tim (WebSocket)</h2>' +
'<div class="collab-section">' +
'<div class="collab-inputs">' +
'<input type="text" id="serverUrlInput" placeholder="ws://localhost:3000" value="ws://localhost:3000">' +
'<input type="text" id="userNameInput" placeholder="Nama Anda">' +
'<div class="collab-buttons">' +
'<button id="createProjectBtn" class="execute-btn secondary">Create</button>' +
'<button id="joinProjectBtn" class="execute-btn secondary">Join</button>' +
'</div>' +
'</div>' +
'<div id="projectIdDisplay" class="cache-stats" style="display:none;"></div>' +
'<div id="collabStatus" class="cache-stats" style="display:none;"></div>' +
'<div id="chatArea" style="display:none; margin-top:10px;">' +
'<div id="chatMessages" class="chat-messages"></div>' +
'<div class="chat-input">' +
'<input type="text" id="chatInput" placeholder="Ketik pesan...">' +
'<button id="sendChatBtn" class="execute-btn secondary">Kirim</button>' +
'</div>' +
'</div>' +
'</div>';
const createBtn = document.getElementById('createProjectBtn');
const joinBtn = document.getElementById('joinProjectBtn');
const sendBtn = document.getElementById('sendChatBtn');
if (createBtn && window.KESEMPATAN?.Main?.createProject) {
createBtn.onclick = window.KESEMPATAN.Main.createProject;
}
if (joinBtn && window.KESEMPATAN?.Main?.joinProject) {
joinBtn.onclick = window.KESEMPATAN.Main.joinProject;
}
if (sendBtn && window.KESEMPATAN?.Main?.sendChatMessage) {
sendBtn.onclick = window.KESEMPATAN.Main.sendChatMessage;
}
if (window.CollabClient && typeof window.CollabClient.attachEvents === 'function') {
window.CollabClient.attachEvents();
}
}
window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.Collab = Object.freeze({
renderUI: renderUI
});
window.Collab = window.KESEMPATAN.Collab;
})();