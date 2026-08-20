export const CONFIG = Object.freeze({
    MAX_HISTORY: 2000, DECAY_FACTOR: 0.05, DEFAULT_THRESHOLD: 70,
    MIN_THRESHOLD: 50, MAX_THRESHOLD: 90, COLD_START_MIN_DATA: 3,
    PREDICTION_MIN_DATA: 5, CONFIDENCE_HIGH: 80, CONFIDENCE_LOW: 40,
    ACTIVE_LEARNING_THRESHOLD: 0.6, AUTO_OPTIMIZE_INTERVAL: 3600000,
    DQN_BATCH_SIZE: 32, DQN_GAMMA: 0.95, DQN_EPSILON: 0.1,
    LSTM_WINDOW_SIZE: 10, LSTM_HIDDEN_SIZE: 20, FEDERATED_WEIGHT: 0.1,
    STREAMING_BATCH_SIZE: 10, MULTI_MODAL_LR: 0.02, META_LR: 0.01
});

export const AGENT_CATEGORIES = Object.freeze({
    'Kesempatan': 'business', 'Manager': 'business', 'StartupFounder': 'business',
    'SundanyaAsep': 'creative', 'DevilsAdvocate': 'critical', 'DataScientist': 'tech',
    'AIEthicsOfficer': 'tech', 'BlockchainExpert': 'tech', 'Statistika': 'tech',
    'Analyst': 'tech', 'Strategist': 'business', 'Hunter': 'business',
    'Researcher': 'research', 'Verifier': 'critical', 'Copywriter': 'creative',
    'Script': 'creative', 'Planner': 'business', 'Distributor': 'business',
    'Optimizer': 'tech', 'Memory': 'tech', 'PromptOptimizer': 'tech'
});

export const CATEGORY_DEFAULTS = Object.freeze({
    'business': { threshold: 72, confidence: 70 },
    'tech': { threshold: 68, confidence: 75 },
    'creative': { threshold: 65, confidence: 65 },
    'critical': { threshold: 75, confidence: 80 },
    'research': { threshold: 70, confidence: 72 },
    'general': { threshold: 70, confidence: 70 }
});
