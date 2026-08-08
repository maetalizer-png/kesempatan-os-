/**
 * KESEMPATAN OS v2.0 - Core Module Exports
 * Platform Multi-Agent AI Berbahasa Indonesia
 */

// Core System
export { default as AppInit } from './core/app-init.js';
export { default as EventBus } from './core/event-bus.js';
export { default as StateManager } from './core/state-manager.js';
export { default as ConfigLoader } from './core/config-loader.js';

// Agent System
export { default as AgentPool } from './agents/agent-pool.js';
export { default as AgentFactory } from './agents/agent-factory.js';
export { default as AgentBase } from './agents/agent-base.js';

// LLM Engine
export { default as LLMEngine } from './llm/llm-engine.js';
export { default as LLMConfig } from './llm/llm-config.js';
export { default as Tokenizer } from './llm/tokenizer.js';
export { default as Embedding } from './llm/embedding.js';

// Workers
export { default as AIWorker } from './workers/ai-worker.js';
export { default as LLMWorker } from './workers/llm-worker.js';
export { default as WorkerPool } from './workers/worker-pool.js';

// UI Components
export { default as UIRenderer } from './ui/ui-renderer.js';
export { default as UIManager } from './ui/ui-manager.js';
export { default as LayoutEngine } from './ui/layout-engine.js';

// Utilities
export { default as Logger } from './utils/logger.js';
export { default as Cache } from './utils/cache.js';
export { default as Storage } from './utils/storage.js';
export { default as Helpers } from './utils/helpers.js';

// API Layer
export { default as APIClient } from './api/api-client.js';
export { default as APIRouter } from './api/api-router.js';

// State Management
export { default as GlobalState } from './state/global-state.js';
export { default as WorkflowState } from './state/workflow-state.js';

// Regional Modules
export * as RegionalASEAN from './modules/regional/asean.js';
export * as RegionalAsian from './modules/regional/asian.js';
export * as RegionalAfrican from './modules/regional/african.js';
export * as RegionalAmerican from './modules/regional/american.js';
export * as RegionalEuropean from './modules/regional/european.js';

// Sectoral Modules
export * as SectorEcommerce from './modules/sectoral/ecommerce.js';
export * as SectorKarir from './modules/sectoral/karir.js';
export * as SectorProperti from './modules/sectoral/properti.js';
export * as SectorOtomotif from './modules/sectoral/otomotif.js';

// Special Modules
export * as SpecialRAP from './modules/special/rap.js';
export * as SpecialCAG from './modules/special/cag.js';
export * as SpecialDebate from './modules/special/debate.js';
export * as SpecialTournament from './modules/special/tournament.js';
export * as SpecialPodcast from './modules/special/podcast.js';
export * as SpecialNoise from './modules/special/noise.js';
export * as SpecialObserv from './modules/special/observ.js';
export * as SpecialVisual from './modules/special/visual.js';
export * as SpecialVoice from './modules/special/voice.js';
export * as SpecialWorkers from './modules/special/workers.js';
export * as SpecialFOR from './modules/special/forum.js';
export * as SpecialCustom from './modules/special/custom.js';
export * as SpecialCAI from './modules/special/cai.js';
export * as SpecialTOR from './modules/special/tor.js';

// Database & Cache
export { default as Database } from './database/indexed-db.js';
export { default as CacheDB } from './cache/cache-db.js';

// Version
export const VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();
