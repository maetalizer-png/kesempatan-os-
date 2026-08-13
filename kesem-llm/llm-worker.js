



















import './llm-worker-shim.js';

import './llm-config.js';
import './llm-tokenizer.js';
import './llm-vocabulary.js';
import './llm-embedding.js';
import './llm-gpu.js';
import './llm-attention.js';
import './llm-transformer.js';
import './llm-encoder.js';
import './llm-decoder.js';
import './llm-inference.js';
import './llm-json-grammar.js';
import './llm-sampler.js';
import './llm-runtime.js';
import './llm-knowledge-graph.js';
import './llm-retriever.js';
import './llm-context-builder.js';
import './llm-reasoning.js';
import './llm-tool-router.js';
import './llm-weights.js';
import './llm-checkpoint.js';
import './llm-quantization.js';
import './llm-optimizer.js';
import './llm-scheduler.js';
import './llm-trainer.js';
import './llm-core.js';
import './llm-api.js';
import { KesempatanLLM } from './llm-index.js';

self.postMessage({ type: 'progress', loaded: 1, total: 1 });









const stopSignals = new Map();

self.onmessage = async function (e) {
    const id = e.data.id;
    const type = e.data.type;
    const payload = e.data.payload || {};

    try {
        let result;
        switch (type) {
            case 'isReady':
                result = self.KesempatanLLM.isReady();
                break;

            case 'initialize': {
                const model = await self.KesempatanLLM.initialize(payload);
                
                
                
                result = { vocabSize: model.vocab.size };
                break;
            }

            case 'generate': {
                const signal = { stopped: false };
                stopSignals.set(id, signal);
                const extraOptions = Object.assign({}, payload.extraOptions || {}, { stopSignal: signal });
                try {
                    result = await self.KesempatanLLM.generate(payload.prompt, payload.agentName, payload.topic, extraOptions);
                } finally {
                    stopSignals.delete(id);
                }
                break;
            }

            case 'stop':
                if (payload.targetId && stopSignals.has(payload.targetId)) {
                    stopSignals.get(payload.targetId).stopped = true;
                } else if (!payload.targetId) {
                    
                    
                    stopSignals.forEach(function (s) { s.stopped = true; });
                }
                result = { stopped: true };
                break;

            case 'train':
                result = await self.KesempatanLLM.core.train(payload.corpus, payload.options);
                break;

            case 'buildCheckpoint':
                
                
                
                result = self.KesempatanLLM.core.buildCheckpointObject(payload.metadata);
                break;

            case 'restoreFromCheckpoint':
                {
                    const model = self.KesempatanLLM.core.restoreFromCheckpointObject(payload.checkpoint);
                    result = { vocabSize: model.vocab.size };
                }
                break;

            case 'getStats':
                result = self.KesempatanLLM.core.getStats();
                break;

            default:
                throw new Error('[llm-worker] Tipe pesan tidak dikenal: ' + type);
        }
        self.postMessage({ id: id, success: true, result: result });
    } catch (err) {
        self.postMessage({ id: id, success: false, error: err && err.message ? err.message : String(err) });
    }
};
