import { Main } from './main.js';

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
if (createBtn) {
createBtn.onclick = Main.createProject;
}
if (joinBtn) {
joinBtn.onclick = Main.joinProject;
}
if (sendBtn) {
sendBtn.onclick = Main.sendChatMessage;
}
if (window.CollabClient && typeof window.CollabClient.attachEvents === 'function') {
window.CollabClient.attachEvents();
}
}
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

export const Collab = Object.freeze({
renderUI: renderUI
});

KESEMPATAN.Collab = Collab;