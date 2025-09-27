-- Schema de base de données pour l'indexer SNALMS

-- Table des événements on-chain
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'Deposit', 'Withdraw', 'Rebalance', 'Swap', etc.
    contract_address TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    block_number INTEGER NOT NULL,
    event_data TEXT NOT NULL, -- JSON des données de l'événement
    processed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des snapshots de vault
CREATE TABLE IF NOT EXISTS vault_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vault_id TEXT NOT NULL,
    strategy_type TEXT NOT NULL, -- 'Safe', 'Balanced', 'Aggressive'
    total_value_locked REAL NOT NULL,
    total_shares REAL NOT NULL,
    value_per_share REAL NOT NULL,
    reserve_sui REAL NOT NULL,
    reserve_usdc REAL NOT NULL,
    fees_collected REAL NOT NULL,
    rebalance_count INTEGER DEFAULT 0,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des positions utilisateurs
CREATE TABLE IF NOT EXISTS user_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_address TEXT NOT NULL,
    vault_id TEXT NOT NULL,
    nft_position_id TEXT NOT NULL,
    strategy_type TEXT NOT NULL,
    shares_owned REAL NOT NULL,
    initial_deposit_sui REAL NOT NULL,
    initial_deposit_usdc REAL NOT NULL,
    deposit_timestamp INTEGER NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des métriques calculées
CREATE TABLE IF NOT EXISTS vault_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vault_id TEXT NOT NULL,
    strategy_type TEXT NOT NULL,
    apr_7d REAL,
    apr_30d REAL,
    total_fees_earned REAL NOT NULL DEFAULT 0,
    total_gas_spent REAL NOT NULL DEFAULT 0,
    impermanent_loss REAL,
    sharpe_ratio REAL,
    max_drawdown REAL,
    calculation_timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
CREATE INDEX IF NOT EXISTS idx_vault_snapshots_vault_timestamp ON vault_snapshots(vault_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_positions_address ON user_positions(user_address);
CREATE INDEX IF NOT EXISTS idx_user_positions_vault ON user_positions(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_metrics_vault_timestamp ON vault_metrics(vault_id, calculation_timestamp);
