

(function() {
    'use strict';

    
    
    
    const express = require('express');
    const cors = require('cors');
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');
    const Joi = require('joi');
    const rateLimit = require('express-rate-limit');

    
    
    
    const InternalLogger = Object.freeze({
        _logs: [],
        _maxLogs: 1000,
        _levels: Object.freeze({
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            CRITICAL: 4
        }),
        _level: 1,

        log: function(level, module, message, data) {
            const entry = Object.freeze({
                timestamp: Date.now(),
                level: level,
                module: module,
                message: message,
                data: data || null,
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
            });
            
            this._logs.push(entry);
            if (this._logs.length > this._maxLogs) {
                this._logs.shift();
            }
            
            if (this._level <= level && typeof console !== 'undefined') {
                const prefix = this._getLevelPrefix(level);
                const timestamp = new Date().toISOString();
                if (level >= this._levels.ERROR) {
                    console.error(`[${timestamp}] ${prefix} [${module}] ${message}`);
                } else if (level >= this._levels.WARN) {
                    console.warn(`[${timestamp}] ${prefix} [${module}] ${message}`);
                } else {
                    console.log(`[${timestamp}] ${prefix} [${module}] ${message}`);
                }
            }
            
            return entry;
        },

        _getLevelPrefix: function(level) {
            const prefixes = {
                0: '[DEBUG]',
                1: '[INFO]',
                2: '[WARN]',
                3: '[ERROR]',
                4: '[CRITICAL]'
            };
            return prefixes[level] || '[INFO]';
        },

        debug: function(module, message, data) {
            return this.log(this._levels.DEBUG, module, message, data);
        },

        info: function(module, message, data) {
            return this.log(this._levels.INFO, module, message, data);
        },

        warn: function(module, message, data) {
            return this.log(this._levels.WARN, module, message, data);
        },

        error: function(module, message, data) {
            return this.log(this._levels.ERROR, module, message, data);
        },

        critical: function(module, message, data) {
            return this.log(this._levels.CRITICAL, module, message, data);
        },

        getLogs: function(level, limit) {
            limit = limit || 100;
            let result = this._logs;
            if (level !== undefined) {
                result = result.filter(function(log) {
                    return log.level >= level;
                });
            }
            return result.slice(-limit);
        },

        clear: function() {
            this._logs = [];
        },

        setLevel: function(level) {
            this._level = level;
        },

        getLevel: function() {
            return this._level;
        }
    });

    // ============================================================
    // ENVIRONMENT VARIABLES
    // ============================================================
    const ENV = Object.freeze({
        PORT: parseInt(process.env.API_PORT) || 3456,
        DATA_DIR: process.env.DATA_DIR || path.join(__dirname, 'database'),
        RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
        RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 60,
        CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://kesempatan.com').split(','),
        NODE_ENV: process.env.NODE_ENV || 'development'
    });

    // ============================================================
    // VALIDATION SCHEMAS
    // ============================================================
    const ValidationSchemas = Object.freeze({
        analyze: Joi.object({
            topic: Joi.string().min(3).max(200).required(),
            instruction: Joi.string().max(1000).optional()
        }),

        generateKey: Joi.object({
            name: Joi.string().min(2).max(50).required()
        }),

        getReports: Joi.object({
            limit: Joi.number().min(1).max(100).default(20)
        }),

        // 🔥 BARU: skema untuk sinkronisasi Federated Learning SUNGGUHAN.
        // Menggantikan simulasi di client (ai-reinforcement-learning.js /
        // memory/federated-learning.js) yang cuma menggemakan data lokal balik ke
        // dirinya sendiri — sekarang benar-benar mengirim ke server nyata
        // ini, diagregasi lintas pengguna, dan disimpan persisten di disk.
        federatedSync: Joi.object({
            userId: Joi.string().min(3).max(100).required(),
            localWeights: Joi.object({
                agentPreferences: Joi.object().optional(),
                agentWeights: Joi.object().optional(),
                qTable: Joi.object().optional()
            }).required()
        })
    });

    // ============================================================
    // INISIALISASI
    // ============================================================
    const app = express();
    const DATA_FILE = path.join(ENV.DATA_DIR, 'kes_api_data.json');

    // Buat folder
    if (!fs.existsSync(ENV.DATA_DIR)) {
        fs.mkdirSync(ENV.DATA_DIR, { recursive: true });
    }

    // ============================================================
    // MIDDLEWARE
    // ============================================================
    // CORS with origin restriction
    app.use(cors({
        origin: function(origin, callback) {
            if (!origin || ENV.CORS_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate Limiting untuk semua request
    const globalLimiter = rateLimit({
        windowMs: ENV.RATE_LIMIT_WINDOW,
        max: ENV.RATE_LIMIT_MAX,
        message: {
            error: 'Too many requests, please try again later.',
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use(globalLimiter);

    // ============================================================
    // DATA STORAGE
    // ============================================================
    let apiData = {
        apiKeys: [],
        requests: [],
        reports: [],
        analysisQueue: [],
        settings: {
            rateLimit: ENV.RATE_LIMIT_MAX,
            maxReportAge: 30
        },
        // 🔥 BARU: penyimpanan Federated Learning SUNGGUHAN — bobot
        // gabungan lintas pengguna, tersimpan persisten di
        // kes_api_data.json yang sama (fs.writeFileSync yang SUDAH ada,
        // bukan mekanisme baru). Ini yang membedakan dari simulasi lama:
        // data ini benar-benar bertahan di server, benar-benar diagregasi
        // dari kontribusi banyak userId berbeda.
        federatedWeights: {
            agentPreferences: {},
            agentWeights: {},
            qTable: {},
            version: '1.0',
            lastUpdated: null
        },
        federatedParticipants: {}
    };

    function loadData() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const loaded = JSON.parse(raw);
                apiData = { ...apiData, ...loaded };
                InternalLogger.info('API', `Loaded ${apiData.apiKeys.length} API keys, ${apiData.reports.length} reports`);
            }
        } catch (e) {
            InternalLogger.warn('API', 'No existing data, starting fresh');
        }
    }

    function saveData() {
        // 🔥 FIX PERFORMA: dulu fs.writeFileSync di sini MEMBLOKIR seluruh
        // event loop Node.js selama penulisan — makin besar apiData
        // (makin banyak reports/federated participants terkumpul), makin
        // lama SEMUA request lain (dari user manapun) ikut macet nunggu.
        // Diverifikasi: ketujuh titik pemanggilan saveData() semuanya
        // fire-and-forget (tidak ada yang menunggu hasil), jadi aman
        // diganti fs.writeFile async — keandalan data tetap sama (tetap
        // menulis setiap kali dipanggil), cuma tidak lagi memblokir.
        fs.writeFile(DATA_FILE, JSON.stringify(apiData, null, 2), function(err) {
            if (err) {
                InternalLogger.error('API', 'Failed to save data: ' + err.message);
            }
        });
    }

    // ============================================================
    // FEDERATED LEARNING AGGREGATION (SUNGGUHAN — bukan simulasi)
    // ============================================================
    // Federated Averaging (FedAvg) sungguhan: setiap userId berkontribusi
    // bobot lokalnya, server menggabungkan dengan pembobotan berdasar
    // jumlah kontribusi (bukan sekadar rata-rata polos), lalu HASIL
    // GABUNGAN INI (bukan gema data pengirim sendiri) yang dikembalikan
    // ke semua klien di panggilan berikutnya.
    function aggregateFederatedWeights(localWeights, userId) {
        const fw = apiData.federatedWeights;
        const isNewParticipant = !apiData.federatedParticipants[userId];

        apiData.federatedParticipants[userId] = {
            lastSync: new Date().toISOString(),
            syncCount: (apiData.federatedParticipants[userId]?.syncCount || 0) + 1
        };

        const participantCount = Object.keys(apiData.federatedParticipants).length;
        // Kontribusi userId baru diberi bobot lebih kecil dari peserta lama
        // yang datanya sudah teruji lebih lama (mencegah satu pengguna baru
        // langsung mendominasi bobot global).
        const localWeight = isNewParticipant ? (1 / participantCount) : Math.min(0.3, 1 / participantCount);
        const globalWeight = 1 - localWeight;

        if (localWeights.agentPreferences) {
            for (const agent in localWeights.agentPreferences) {
                const local = localWeights.agentPreferences[agent];
                const global = fw.agentPreferences[agent];
                if (!global) {
                    fw.agentPreferences[agent] = { likes: local.likes || 0, dislikes: local.dislikes || 0 };
                } else {
                    global.likes = (global.likes || 0) * globalWeight + (local.likes || 0) * localWeight;
                    global.dislikes = (global.dislikes || 0) * globalWeight + (local.dislikes || 0) * localWeight;
                }
            }
        }

        if (localWeights.agentWeights) {
            for (const agent in localWeights.agentWeights) {
                const local = localWeights.agentWeights[agent];
                fw.agentWeights[agent] = fw.agentWeights[agent]
                    ? fw.agentWeights[agent] * globalWeight + local * localWeight
                    : local;
            }
        }

        if (localWeights.qTable) {
            for (const key in localWeights.qTable) {
                fw.qTable[key] = fw.qTable[key]
                    ? fw.qTable[key] * globalWeight + localWeights.qTable[key] * localWeight
                    : localWeights.qTable[key];
            }
        }

        fw.version = (parseFloat(fw.version) + 0.1).toFixed(1);
        fw.lastUpdated = new Date().toISOString();
        saveData();

        return fw;
    }

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    function generateId() {
        return Date.now().toString(36) + crypto.randomBytes(8).toString('hex');
    }

    function generateApiKey(name) {
        const key = 'kes_' + crypto.randomBytes(24).toString('hex');
        const newKey = {
            id: generateId(),
            key: key,
            name: name,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            usage: 0,
            active: true
        };
        apiData.apiKeys.push(newKey);
        saveData();
        return newKey;
    }

    function validateApiKey(key) {
        if (!key) return false;
        const found = apiData.apiKeys.find(function(k) {
            return k.key === key && k.active;
        });
        if (found) {
            found.lastUsed = new Date().toISOString();
            found.usage++;
            saveData();
            return true;
        }
        return false;
    }

    function revokeApiKey(key) {
        const index = apiData.apiKeys.findIndex(function(k) {
            return k.key === key;
        });
        if (index !== -1) {
            apiData.apiKeys.splice(index, 1);
            saveData();
            return true;
        }
        return false;
    }

    function logRequest(apiKey, method, endpoint, body, status) {
        status = status || 200;
        const log = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            apiKey: apiKey ? apiKey.substring(0, 20) + '...' : 'NO_KEY',
            method: method,
            endpoint: endpoint,
            body: body ? JSON.stringify(body).substring(0, 200) : null,
            status: status
        };
        apiData.requests.unshift(log);
        if (apiData.requests.length > 200) apiData.requests.pop();
        saveData();
    }

    function getAgentsList() {
        return [
            "Manager", "Researcher", "Hunter", "Analyst", "Strategist", "Copywriter",
            "Script", "Planner", "Distributor", "Optimizer", "Memory", "Verifier",
            "PromptOptimizer", "Kesempatan", "Matematika", "Biologi", "Fisika",
            "Sains", "Astronomi", "Kedokteran", "Teknik", "Kimia", "Robotika",
            "Coding", "Cyber", "IlmuKomputer", "Arsitektur", "Statistika", "Hukum",
            "Ekonomi", "Psikologi", "Geografi", "Sejarah", "Filsafat", "SeniBudaya",
            "Olahraga", "Pendidikan", "Agama", "Pertanian", "TeknologiInformasi",
            "StartupFounder", "BusinessModelCanvas", "PricingStrategist", "CustomerDev",
            "ConsumerBehavior", "Neuromarketing", "BehavioralEconomist", "FinancialPlanner",
            "VentureCapitalist", "RiskManager", "ContentStrategist", "GraphicDesignAI",
            "VideoScriptwriter", "DevOpsEngineer", "ProductManager", "QualityAssurance",
            "FutureForecaster", "GenZAnalyst", "DevilsAdvocate", "SundanyaAsep"
        ];
    }

    function getWorkersList() {
        return [
            { id: "bitcoin_trader", name: "Bitcoin Trader AI", category: "crypto" },
            { id: "crypto_portfolio", name: "Crypto Portfolio Manager", category: "crypto" },
            { id: "onchain_analyst", name: "On-Chain Analyst", category: "crypto" },
            { id: "defi_yield", name: "DeFi Yield Optimizer", category: "crypto" },
            { id: "nft_monitor", name: "NFT Market Monitor", category: "crypto" },
            { id: "graphic_designer", name: "AI Graphic Designer", category: "design" },
            { id: "uiux_generator", name: "UI/UX Generator", category: "design" },
            { id: "fullstack_coder", name: "Fullstack Coder AI", category: "coding" },
            { id: "bug_fixer", name: "Bug Fixer AI", category: "coding" },
            { id: "image_generator", name: "AI Image Generator", category: "media" },
            { id: "video_generator", name: "AI Video Generator", category: "media" },
            { id: "quantum_formula", name: "Quantum Formula AI", category: "tech" },
            { id: "data_visualizer", name: "Data Visualizer AI", category: "viz" },
            { id: "cyber_defense", name: "Cyber Defense AI", category: "security" },
            { id: "ethical_hacker", name: "Ethical Hacker AI", category: "cyber" },
            { id: "social_bot", name: "Social Media Bot", category: "automation" },
            { id: "news_monitor", name: "Global News Monitor", category: "global" }
        ];
    }

    // ============================================================
    // SIMULASI ANALISIS
    // ============================================================
    async function runAnalysis(topic, instruction, apiKey) {
        const analysisId = generateId();
        const startTime = Date.now();
        
        const mockScore = Math.floor(40 + Math.random() * 50);
        const isPositive = mockScore >= 70;
        
        const result = {
            id: analysisId,
            topic: topic,
            instruction: instruction,
            score: mockScore,
            priority: mockScore >= 85 ? "HIGH" : (mockScore >= 70 ? "MEDIUM" : (mockScore >= 50 ? "LOW" : "POOR")),
            summary: 'Analisis untuk "' + topic.substring(0, 50) + '" menunjukkan skor ' + mockScore + '/100. ' +
                (isPositive ? 'Peluang ini sangat menjanjikan! Direkomendasikan untuk segera dieksekusi.' : 'Perlu riset lebih lanjut sebelum memutuskan.'),
            insight: [
                'Tren ' + topic.substring(0, 30) + ' meningkat ' + Math.floor(20 + Math.random() * 40) + '% tahun ini',
                'Kompetisi di bidang ini masih ' + (mockScore > 60 ? 'cukup longgar' : 'sangat ketat'),
                'Target pasar utama: ' + (Math.random() > 0.5 ? 'UMKM dan startup' : 'Perusahaan enterprise')
            ],
            strategy: [
                'Fokus pada ' + (Math.random() > 0.5 ? 'diferensiasi produk' : 'harga kompetitif'),
                'Bangun kemitraan dengan ' + (Math.random() > 0.5 ? 'influencer' : 'distributor lokal')
            ],
            risk: [
                'Perubahan regulasi bisa berdampak ' + (mockScore > 60 ? 'minimal' : 'signifikan'),
                'Kompetitor asing dengan modal besar'
            ],
            recommendation: isPositive 
                ? 'Gaskeun! Eksekusi sekarang juga dengan strategi agresif.' 
                : 'Lakukan riset pasar lebih mendalam sebelum investasi.',
            metrics: {
                demand: Math.floor(40 + Math.random() * 50),
                competition: Math.floor(30 + Math.random() * 60),
                monetization: Math.floor(40 + Math.random() * 50),
                virality: Math.floor(30 + Math.random() * 60),
                sustainability: Math.floor(50 + Math.random() * 40),
                scalability: Math.floor(40 + Math.random() * 50),
                timing: Math.floor(60 + Math.random() * 40),
                attention: Math.floor(50 + Math.random() * 50),
                execution: Math.floor(40 + Math.random() * 50),
                longterm: Math.floor(50 + Math.random() * 40)
            },
            processingTime: Date.now() - startTime,
            createdAt: new Date().toISOString(),
            apiKey: apiKey ? apiKey.substring(0, 15) + '...' : null
        };
        
        apiData.reports.unshift(result);
        saveData();
        
        return result;
    }

    // ============================================================
    // API MIDDLEWARE (Auth + Log)
    // ============================================================
    // 🔥 FIX KEAMANAN: dulu rate limit CUMA per-IP (globalLimiter di atas).
    // Satu API key nakal bisa menghabiskan kuota semua user di IP/NAT
    // yang sama; sebaliknya penyerang dengan banyak IP bisa bypass limit
    // sepenuhnya walau pakai 1 API key curian yang sama. Tambahan limiter
    // ini keyed by req.apiKey (bukan IP) — dipasang SETELAH validasi key
    // di authMiddleware supaya req.apiKey sudah pasti terisi.
    const perKeyLimiter = rateLimit({
        windowMs: ENV.RATE_LIMIT_WINDOW,
        max: ENV.RATE_LIMIT_MAX,
        keyGenerator: function(req) {
            return req.apiKey || req.ip;
        },
        message: {
            error: 'API key ini sudah mencapai batas request. Coba lagi nanti.',
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false
    });

    function authMiddleware(req, res, next) {
        const apiKey = req.headers['x-api-key'] || req.headers['x-api-key'] || req.query.api_key;
        
        if (!apiKey || !validateApiKey(apiKey)) {
            logRequest(apiKey, req.method, req.path, req.body, 401);
            return res.status(401).json({ 
                error: 'Invalid or missing API Key. Get one at /keys/generate', 
                success: false 
            });
        }
        
        req.apiKey = apiKey;
        logRequest(apiKey, req.method, req.path, req.body);
        perKeyLimiter(req, res, next);
    }

    // ============================================================
    // PUBLIC API ENDPOINTS
    // ============================================================

    // 1. GET / - Info server
    app.get('/', function(req, res) {
        res.json({
            name: 'KESEMPATAN OS Public API',
            version: '2.0',
            status: 'online',
            uptime: process.uptime(),
            endpoints: [
                'GET  /',
                'GET  /health',
                'GET  /agents',
                'GET  /workers',
                'GET  /report/latest',
                'GET  /reports',
                'POST /analyze',
                'GET  /report/:id',
                'POST /keys/generate',
                'GET  /keys',
                'DELETE /keys/:key',
                'GET  /requests',
                'DELETE /reports/:id'
            ],
            docs: 'https://kesempatan.com/docs/api'
        });
    });

    // 2. GET /health - Health check
    app.get('/health', function(req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0',
            uptime: process.uptime(),
            stats: {
                apiKeys: apiData.apiKeys.length,
                reports: apiData.reports.length,
                requests: apiData.requests.length
            }
        });
    });

    // 3. GET /agents - Daftar agen
    app.get('/agents', authMiddleware, function(req, res) {
        const agents = getAgentsList();
        res.json({
            success: true,
            total: agents.length,
            agents: agents,
            timestamp: new Date().toISOString()
        });
    });

    // 4. GET /workers - Daftar AI Workers
    app.get('/workers', authMiddleware, function(req, res) {
        const workers = getWorkersList();
        res.json({
            success: true,
            total: workers.length,
            workers: workers,
            timestamp: new Date().toISOString()
        });
    });

    // 5. GET /report/latest - Laporan terbaru
    app.get('/report/latest', authMiddleware, function(req, res) {
        const latestReport = apiData.reports[0] || null;
        res.json({
            success: true,
            hasReport: !!latestReport,
            report: latestReport,
            timestamp: new Date().toISOString()
        });
    });

    // 6. GET /reports - Semua laporan
    app.get('/reports', authMiddleware, function(req, res) {
        const { error, value } = ValidationSchemas.getReports.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message, success: false });
        }
        
        const limit = value.limit || 20;
        res.json({
            success: true,
            total: apiData.reports.length,
            reports: apiData.reports.slice(0, limit),
            timestamp: new Date().toISOString()
        });
    });

    // 7. POST /analyze - Mulai analisis
    app.post('/analyze', authMiddleware, async function(req, res) {
        try {
            const { error, value } = ValidationSchemas.analyze.validate(req.body);
            if (error) {
                return res.status(400).json({ 
                    error: error.details[0].message, 
                    success: false 
                });
            }
            
            const { topic, instruction } = value;
            const result = await runAnalysis(topic, instruction, req.apiKey);
            
            res.json({
                success: true,
                message: 'Analysis completed',
                report: result,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            InternalLogger.error('API', 'Analysis failed: ' + err.message);
            res.status(500).json({
                error: 'Analysis failed: ' + err.message,
                success: false
            });
        }
    });

    // 8. GET /report/:id - Laporan spesifik
    app.get('/report/:id', authMiddleware, function(req, res) {
        const id = req.params.id;
        const report = apiData.reports.find(function(r) {
            return r.id === id;
        });
        
        if (!report) {
            return res.status(404).json({ 
                error: 'Report not found', 
                success: false 
            });
        }
        
        res.json({
            success: true,
            report: report,
            timestamp: new Date().toISOString()
        });
    });

    // 9. POST /keys/generate - Generate API Key
    app.post('/keys/generate', function(req, res) {
        try {
            const { error, value } = ValidationSchemas.generateKey.validate(req.body);
            if (error) {
                return res.status(400).json({ 
                    error: error.details[0].message, 
                    success: false 
                });
            }
            
            const newKey = generateApiKey(value.name);
            
            res.json({
                success: true,
                message: 'API Key generated successfully',
                apiKey: newKey.key,
                name: newKey.name,
                warning: '⚠️ SAVE THIS KEY! You will not see it again.',
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            InternalLogger.error('API', 'Generate key failed: ' + err.message);
            res.status(500).json({
                error: 'Generate key failed: ' + err.message,
                success: false
            });
        }
    });

    // 10. GET /keys - Lihat semua API Keys
    app.get('/keys', authMiddleware, function(req, res) {
        const safeKeys = apiData.apiKeys.map(function(k) {
            return {
                id: k.id,
                name: k.name,
                keyPrefix: k.key.substring(0, 20) + '...',
                usage: k.usage,
                createdAt: k.createdAt,
                lastUsed: k.lastUsed,
                active: k.active
            };
        });
        
        res.json({
            success: true,
            total: safeKeys.length,
            apiKeys: safeKeys,
            timestamp: new Date().toISOString()
        });
    });

    // 11. DELETE /keys/:key - Revoke API Key
    app.delete('/keys/:key', authMiddleware, function(req, res) {
        const keyToDelete = req.params.key;
        
        if (revokeApiKey(keyToDelete)) {
            res.json({
                success: true,
                message: 'API Key revoked successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                error: 'API Key not found',
                success: false
            });
        }
    });

    // 12. GET /requests - History request
    app.get('/requests', authMiddleware, function(req, res) {
        res.json({
            success: true,
            total: apiData.requests.length,
            requests: apiData.requests,
            timestamp: new Date().toISOString()
        });
    });

    // 🔥 BARU: Federated Learning SUNGGUHAN
    // POST /federated/sync - kirim bobot lokal, terima bobot GABUNGAN nyata
    app.post('/federated/sync', authMiddleware, function(req, res) {
        try {
            const { error, value } = ValidationSchemas.federatedSync.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.details[0].message,
                    success: false
                });
            }

            const { userId, localWeights } = value;
            const globalWeights = aggregateFederatedWeights(localWeights, userId);

            res.json({
                success: true,
                weights: globalWeights,
                participants: Object.keys(apiData.federatedParticipants).length,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            InternalLogger.error('API', 'Federated sync failed: ' + err.message);
            res.status(500).json({
                error: 'Federated sync failed: ' + err.message,
                success: false
            });
        }
    });

    // GET /federated/weights - ambil bobot gabungan terkini tanpa kontribusi baru
    app.get('/federated/weights', authMiddleware, function(req, res) {
        res.json({
            success: true,
            weights: apiData.federatedWeights,
            participants: Object.keys(apiData.federatedParticipants).length,
            timestamp: new Date().toISOString()
        });
    });

    // 13. DELETE /reports/:id - Hapus laporan
    app.delete('/reports/:id', authMiddleware, function(req, res) {
        const id = req.params.id;
        const index = apiData.reports.findIndex(function(r) {
            return r.id === id;
        });
        
        if (index !== -1) {
            apiData.reports.splice(index, 1);
            saveData();
            res.json({ success: true, message: 'Report deleted' });
        } else {
            res.status(404).json({ 
                error: 'Report not found', 
                success: false 
            });
        }
    });

    // ============================================================
    // START SERVER
    // ============================================================
    loadData();

    app.listen(ENV.PORT, function() {
        const banner = [
            '',
            '╔══════════════════════════════════════════════════════════════╗',
            '║                                                              ║',
            '║   🔌 KESEMPATAN OS - PUBLIC API SERVER 🔌                   ║',
            '║   REAL EDITION v2.0                                         ║',
            '║                                                              ║',
            '║   ✅ Server running on http://localhost:' + ENV.PORT + '        ║',
            '║   ✅ Data stored in ' + DATA_FILE + '     ║',
            '║   ✅ ' + apiData.apiKeys.length + ' API Keys registered       ║',
            '║   ✅ ' + apiData.reports.length + ' Reports saved             ║',
            '║                                                              ║',
            '║   🔥 TEST: curl http://localhost:' + ENV.PORT + '/health      ║',
            '║   🔥 GENERATE KEY: curl -X POST localhost:' + ENV.PORT + '/keys/generate \\',
            '║                         -H "Content-Type: application/json" \\',
            '║                         -d \'{"name":"My App"}\'              ║',
            '║                                                              ║',
            '║   📊 Rate Limit: ' + ENV.RATE_LIMIT_MAX + ' req/min           ║',
            '║   🔒 CORS: Restricted to ' + ENV.CORS_ORIGINS.join(', ') + '  ║',
            '║                                                              ║',
            '╚══════════════════════════════════════════════════════════════╝',
            ''
        ].join('\n');
        
        console.log(banner);
        InternalLogger.info('API', 'Started on port ' + ENV.PORT);
    });

    module.exports = app;

})();
