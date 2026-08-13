const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

export const DB_CONFIG = Object.freeze({
    
    
    
    
    
    
    
    name: 'KESEMPATAN_OS_DB',
    
    
    
    
    version: 13,
    capacity: '10GB+',
    cacheTTL: 3600000,
    maxRetries: 5,
    retryDelay: 100,
    bulkSize: 5000,
    
    
    
    
    
    
    
    
    
    
    encryptionKey: 'KESEMPATAN_OS_SECURE_KEY',
    syncInterval: 30000,
    maxOfflineQueue: 50000,
    compressionThreshold: 1024,
    autoBackupInterval: 86400000,
    maxBackups: 30,
    ftsEnabled: true,
    vectorEnabled: true,
    graphEnabled: true,
    geoEnabled: true,
    timeseriesEnabled: true,
    mlEnabled: true,
    p2pEnabled: true,
    biometricEnabled: true,
    quantumResistant: true,
    edgeEnabled: true,
    versioningEnabled: true,
    snapshotEnabled: true,
    multiTenantEnabled: true,
    streamingEnabled: true,
    lazyLoad: true,
    ftsLanguage: 'id',
    keyRotationInterval: 86400000 * 30,
    auditLogEnabled: true,
    pluginSystemEnabled: true,
    liveQueryEnabled: true,
    transactionEnabled: true,
    webWorkerEnabled: true,
    signalingServerUrl: 'wss://signaling.kesempatan.com'
});

KESEMPATAN.KesDatabase.DB_CONFIG = DB_CONFIG;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('DBConfig', 'Loaded');
}