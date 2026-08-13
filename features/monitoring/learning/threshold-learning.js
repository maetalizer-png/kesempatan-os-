import { CONFIG } from './threshold/th-config.js';
import { InternalLogger, NotificationSystem } from './threshold/th-logger.js';
import { DQNEngine, LSTMPredictor, FederatedLearning, SHAPExplainer, MetaLearningEngine, StreamingLearner, MultiModalLearner } from './threshold/th-engines.js';
import { AutoLearningUltimate } from './threshold/th-core.js';
import { installLearningHooks } from './threshold/th-hooks.js';

if (document.readyState === 'complete') installLearningHooks();
else window.addEventListener('load', installLearningHooks);

(async function init() {
    try {
        await AutoLearningUltimate.load();
        setInterval(function() {
            if (AutoLearningUltimate.data.approvalHistory.length > 10) AutoLearningUltimate.optimize();
        }, CONFIG.AUTO_OPTIMIZE_INTERVAL);
        setInterval(function() {
            if (AutoLearningUltimate.data.approvalHistory.length > 10) AutoLearningUltimate.federatedSync();
        }, 1800000);
        setInterval(function() {
            if (DQNEngine._replayMemory.length > CONFIG.DQN_BATCH_SIZE) AutoLearningUltimate.trainDQN();
        }, 300000);
        setInterval(function() {
            const agents = Object.keys(AutoLearningUltimate.data.agentPerformance || {});
            agents.forEach(function(agent) {
                const count = AutoLearningUltimate.data.approvalHistory.filter(function(h) { return h.agent === agent; }).length;
                if (count >= CONFIG.LSTM_WINDOW_SIZE) AutoLearningUltimate.trainLSTM(agent);
            });
        }, 600000);
        InternalLogger.info('AutoLearning', 'Auto learning engine loaded');
        InternalLogger.info('AutoLearning', AutoLearningUltimate.data.approvalHistory.length + ' entries');
        InternalLogger.info('AutoLearning', Object.keys(AutoLearningUltimate.data.agentPerformance || {}).length + ' agents');
        NotificationSystem.success('🧠 Auto Learning', 'Auto learning aktif');
    } catch(e) {
        InternalLogger.error('AutoLearning', 'Init failed: ' + e.message);
    }
})();

export { AutoLearningUltimate as AutoLearning };

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.AutoLearning = AutoLearningUltimate;
window.KESEMPATAN.DQNEngine = DQNEngine;
window.KESEMPATAN.LSTMPredictor = LSTMPredictor;
window.KESEMPATAN.FederatedLearning = FederatedLearning;
window.KESEMPATAN.SHAPExplainer = SHAPExplainer;
window.KESEMPATAN.MetaLearningEngine = MetaLearningEngine;
window.KESEMPATAN.StreamingLearner = StreamingLearner;
window.KESEMPATAN.MultiModalLearner = MultiModalLearner;
window.KESEMPATAN.InternalLogger = InternalLogger;
window.KESEMPATAN.NotificationSystem = NotificationSystem;

window.AutoLearning = AutoLearningUltimate;
window.InternalLogger = InternalLogger;
