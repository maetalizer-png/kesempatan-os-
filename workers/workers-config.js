const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

export const WORKER_CONFIG = Object.freeze({
    selfHealingEnabled: localStorage.getItem('kes_worker_self_healing') !== 'false',
    maxConcurrent: parseInt(localStorage.getItem('kes_worker_max_concurrent')) || 5,
    rateLimitPerMinute: parseInt(localStorage.getItem('kes_worker_rate_limit')) || 100,
    batchSize: parseInt(localStorage.getItem('kes_worker_batch_size')) || 5,
    enableCosmicUI: localStorage.getItem('kes_worker_cosmic_ui') !== 'false',
    enableVoice: localStorage.getItem('kes_worker_voice') !== 'false',
    autoOptimize: localStorage.getItem('kes_worker_auto_optimize') !== 'false',
    enablePrediction: localStorage.getItem('kes_worker_prediction') !== 'false',
    logAutoRefresh: parseInt(localStorage.getItem('kes_worker_log_refresh')) || 5
});

export const AI_WORKERS_LIST = Object.freeze([
    { id: 'bitcoin_trader', name: 'Bitcoin Trader AI', category: 'crypto', enabled: false, schedule: 'hourly', lastRun: null, icon: '₿', priority: 5 },
    { id: 'crypto_portfolio', name: 'Crypto Portfolio', category: 'crypto', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'onchain_analyst', name: 'On-Chain Analyst', category: 'crypto', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 4 },
    { id: 'defi_yield', name: 'DeFi Yield Optimizer', category: 'crypto', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'nft_monitor', name: 'NFT Monitor', category: 'crypto', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 3 },
    { id: 'graphic_designer', name: 'Graphic Designer', category: 'design', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'uiux_generator', name: 'UI/UX Generator', category: 'design', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'brand_creator', name: 'Brand Creator', category: 'design', enabled: false, schedule: 'weekly', lastRun: null, icon: '', priority: 4 },
    { id: 'mockup_generator', name: 'Mockup Generator', category: 'design', enabled: false, schedule: 'daily', lastRun: null, icon: '3D', priority: 3 },
    { id: 'icon_designer', name: 'Icon Designer', category: 'design', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'fullstack_coder', name: 'Fullstack Coder', category: 'coding', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 5 },
    { id: 'bug_fixer', name: 'Bug Fixer', category: 'coding', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 4 },
    { id: 'api_builder', name: 'API Builder', category: 'coding', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'db_designer', name: 'DB Designer', category: 'coding', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'code_optimizer', name: 'Code Optimizer', category: 'coding', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'image_generator', name: 'Image Generator', category: 'media', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'video_generator', name: 'Video Generator', category: 'media', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'animation_creator', name: 'Animation Creator', category: 'media', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'thumbnail_maker', name: 'Thumbnail Maker', category: 'media', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 2 },
    { id: 'meme_generator', name: 'Meme Generator', category: 'media', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 2 },
    { id: 'quantum_formula', name: 'Quantum Formula', category: 'tech', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'ai_algorithm', name: 'AI Algorithm', category: 'tech', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 5 },
    { id: 'blockchain_formula', name: 'Blockchain Formula', category: 'tech', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'cryptomath', name: 'CryptoMath', category: 'tech', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'neural_architect', name: 'Neural Architect', category: 'tech', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 5 },
    { id: 'data_visualizer', name: 'Data Visualizer', category: 'viz', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'model_generator', name: '3D Model Generator', category: 'viz', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'explainer_video', name: 'Explainer Video', category: 'viz', enabled: false, schedule: 'weekly', lastRun: null, icon: '', priority: 4 },
    { id: 'infographic_maker', name: 'Infographic Maker', category: 'viz', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'dashboard_builder', name: 'Dashboard Builder', category: 'viz', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'cyber_defense', name: 'Cyber Defense', category: 'security', enabled: false, schedule: 'realtime', lastRun: null, icon: '', priority: 5 },
    { id: 'threat_intel', name: 'Threat Intel', category: 'security', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 5 },
    { id: 'encryption_gen', name: 'Encryption Gen', category: 'security', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'security_protocol', name: 'Security Protocol', category: 'security', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'vuln_scanner', name: 'Vuln Scanner', category: 'security', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 4 },
    { id: 'ethical_hacker', name: 'Ethical Hacker', category: 'cyber', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 5 },
    { id: 'malware_detector', name: 'Malware Detector', category: 'cyber', enabled: false, schedule: 'realtime', lastRun: null, icon: '', priority: 5 },
    { id: 'firewall_manager', name: 'Firewall Manager', category: 'cyber', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 4 },
    { id: 'data_encryption', name: 'Data Encryption', category: 'cyber', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'cyber_forensic', name: 'Cyber Forensic', category: 'cyber', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'social_bot', name: 'Social Bot', category: 'automation', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 3 },
    { id: 'email_automation', name: 'Email Automation', category: 'automation', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'customer_support', name: 'Customer Support', category: 'automation', enabled: false, schedule: 'realtime', lastRun: null, icon: '', priority: 4 },
    { id: 'lead_generator', name: 'Lead Generator', category: 'automation', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'seo_optimizer', name: 'SEO Optimizer', category: 'automation', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'news_monitor', name: 'News Monitor', category: 'global', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 3 },
    { id: 'trend_predictor', name: 'Trend Predictor', category: 'global', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 5 },
    { id: 'competitor_intel', name: 'Competitor Intel', category: 'global', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'market_research', name: 'Market Research', category: 'global', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 },
    { id: 'strategic_planner', name: 'Strategic Planner', category: 'global', enabled: false, schedule: 'weekly', lastRun: null, icon: '', priority: 5 },
    { id: 'crypto_signal', name: 'Crypto Signal', category: 'bonus', enabled: false, schedule: 'hourly', lastRun: null, icon: '', priority: 3 },
    { id: 'video_editor', name: 'Video Editor', category: 'bonus', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'code_documentation', name: 'Code Doc', category: 'bonus', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'voice_generator', name: 'Voice Generator', category: 'bonus', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 3 },
    { id: 'ai_trainer', name: 'AI Trainer', category: 'bonus', enabled: false, schedule: 'daily', lastRun: null, icon: '', priority: 4 }
]);

export const WorkersConfig = {
    WORKER_CONFIG: WORKER_CONFIG,
    AI_WORKERS_LIST: AI_WORKERS_LIST
};
KESEMPATAN.WorkersConfig = WorkersConfig;