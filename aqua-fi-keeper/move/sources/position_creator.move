module position_creator::cetus_position {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::sui::SUI;
    
    // Structure principale pour la position Cetus
    public struct CetusPosition has key, store {
        id: UID,
        pool_id: address,
        tick_lower: u32,
        tick_upper: u32,
        liquidity_amount_a: u64,
        liquidity_amount_b: u64,
        owner: address,
        created_at: u64,
        is_active: bool,
    }
    
    // Événement émis lors de la création
    public struct PositionCreated has copy, drop {
        position_id: address,
        pool_id: address,
        tick_lower: u32,
        tick_upper: u32,
        amount_a: u64,
        amount_b: u64,
        owner: address,
    }
    
    // Événement émis lors de la fermeture
    public struct PositionClosed has copy, drop {
        position_id: address,
        pool_id: address,
        withdrawn_amount_a: u64,
        withdrawn_amount_b: u64,
        owner: address,
    }
    
    // Fonction principale pour créer une position liée au pool Cetus
    public fun create_position<CoinA, CoinB>(
        pool_id: address,
        tick_lower: u32,
        tick_upper: u32,
        coin_a: Coin<CoinA>,
        coin_b: Coin<CoinB>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let amount_a = coin::value(&coin_a);
        let amount_b = coin::value(&coin_b);
        let timestamp = clock::timestamp_ms(clock);
        
        // Créer la position
        let position = CetusPosition {
            id: object::new(ctx),
            pool_id,
            tick_lower,
            tick_upper,
            liquidity_amount_a: amount_a,
            liquidity_amount_b: amount_b,
            owner: sender,
            created_at: timestamp,
            is_active: true,
        };
        
        let position_id = object::uid_to_address(&position.id);
        
        // Émettre l'événement
        event::emit(PositionCreated {
            position_id,
            pool_id,
            tick_lower,
            tick_upper,
            amount_a,
            amount_b,
            owner: sender,
        });
        
        // Transférer les coins vers le propriétaire (simule le dépôt)
        transfer::public_transfer(coin_a, sender);
        transfer::public_transfer(coin_b, sender);
        
        // Transférer la position NFT
        transfer::transfer(position, sender);
    }
    
    // Fonction pour mettre à jour une position
    public fun update_position(
        position: &mut CetusPosition,
        new_tick_lower: u32,
        new_tick_upper: u32,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(position.owner == sender, 0);
        
        position.tick_lower = new_tick_lower;
        position.tick_upper = new_tick_upper;
    }
    
    // Fonction pour fermer une position et retirer la liquidité
    public fun close_position<CoinA, CoinB>(
        position: CetusPosition,
        mut coin_a_treasury: Coin<CoinA>, // Coin pour simuler le retrait
        mut coin_b_treasury: Coin<CoinB>, // Coin pour simuler le retrait
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let CetusPosition { 
            id, 
            pool_id, 
            tick_lower: _, 
            tick_upper: _, 
            liquidity_amount_a, 
            liquidity_amount_b, 
            owner, 
            created_at: _, 
            is_active: _ 
        } = position;
        
        assert!(owner == sender, 0);
        let position_id = object::uid_to_address(&id);
        
        // Simuler le retrait de liquidité en transférant les coins
        // Dans un vrai protocole, cela interagirait avec le pool Cetus
        let withdrawn_a = coin::split(&mut coin_a_treasury, liquidity_amount_a, ctx);
        let withdrawn_b = coin::split(&mut coin_b_treasury, liquidity_amount_b, ctx);
        
        // Émettre l'événement de fermeture
        event::emit(PositionClosed {
            position_id,
            pool_id,
            withdrawn_amount_a: liquidity_amount_a,
            withdrawn_amount_b: liquidity_amount_b,
            owner: sender,
        });
        
        // Transférer les coins retirés au propriétaire
        transfer::public_transfer(withdrawn_a, sender);
        transfer::public_transfer(withdrawn_b, sender);
        
        // Retourner les coins de trésorerie (reste)
        transfer::public_transfer(coin_a_treasury, sender);
        transfer::public_transfer(coin_b_treasury, sender);
        
        // Supprimer la position
        object::delete(id);
    }
    
    // Version simplifiée pour fermer une position sans retrait de liquidité
    public fun destroy_position(
        position: CetusPosition,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let CetusPosition { 
            id, 
            pool_id, 
            tick_lower: _, 
            tick_upper: _, 
            liquidity_amount_a, 
            liquidity_amount_b, 
            owner, 
            created_at: _, 
            is_active: _ 
        } = position;
        
        assert!(owner == sender, 0);
        let position_id = object::uid_to_address(&id);
        
        // Émettre l'événement de fermeture
        event::emit(PositionClosed {
            position_id,
            pool_id,
            withdrawn_amount_a: liquidity_amount_a,
            withdrawn_amount_b: liquidity_amount_b,
            owner: sender,
        });
        
        // Supprimer la position
        object::delete(id);
    }
    
    // Fonction de lecture pour obtenir les infos de position
    public fun get_position_info(position: &CetusPosition): (address, u32, u32, u64, u64, bool) {
        (
            position.pool_id,
            position.tick_lower,
            position.tick_upper,
            position.liquidity_amount_a,
            position.liquidity_amount_b,
            position.is_active
        )
    }

    // =================================================================
    // AJOUTS POUR LES STRATÉGIES AUTOMATISÉES
    // =================================================================

    use std::option::{Self, Option};

    /// Erreur si un appelant non autorisé tente une action.
    const ENotAuthorized: u64 = 101;

    /// Structure pour définir une nouvelle fourchette de liquidité.
    public struct NewRange has copy, drop, store {
        tick_lower: u32,
        tick_upper: u32
    }

    /// Événement émis lors d'un rééquilibrage
    public struct PositionRebalanced has copy, drop {
        position_id: address,
        old_tick_lower: u32,
        old_tick_upper: u32,
        new_tick_lower: u32,
        new_tick_upper: u32,
        owner: address,
    }

    // --- Fonctions de Stratégie (Logique Pure) ---
    // Ces fonctions sont `public` mais pas `entry`. Le keeper les appellera
    // en simulation (`devInspectTransactionBlock`) pour décider s'il doit agir,
    // sans payer de gaz pour la décision.

    /// Calcule la fourchette de ticks pour une stratégie "Buy The Dip".
    /// La liquidité est placée `dip_percentage` en dessous du prix actuel.
    /// `current_tick_index`: Le tick actuel du pool Cetus.
    /// `dip_percentage`: Le pourcentage de baisse souhaité (ex: 500 pour 5.00%).
    /// `range_width`: La largeur de la fourchette en ticks.
    /// `tick_spacing`: L'espacement des ticks du pool.
    public fun calculate_buy_the_dip_range(
        current_tick_index: u32,
        dip_percentage: u32, // Représenté en points de base * 100, ex: 500 pour 5%
        range_width: u32,
        tick_spacing: u32
    ): NewRange {
        // Calcule le tick central cible, en dessous du prix actuel
        let dip_ticks = ((current_tick_index as u64) * (dip_percentage as u64)) / 10000;
        let target_center_tick = if (current_tick_index > (dip_ticks as u32)) {
            current_tick_index - (dip_ticks as u32)
        } else {
            0 // Protection contre underflow
        };

        // Calcule les bornes de la nouvelle fourchette
        let half_width = range_width / 2;
        let new_tick_lower = if (target_center_tick > half_width) {
            target_center_tick - half_width
        } else {
            0
        };
        let new_tick_upper = target_center_tick + half_width;

        // S'assurer que les ticks sont alignés sur le tick_spacing du pool
        let aligned_tick_lower = (new_tick_lower / tick_spacing) * tick_spacing;
        let aligned_tick_upper = (new_tick_upper / tick_spacing) * tick_spacing;

        NewRange {
            tick_lower: aligned_tick_lower,
            tick_upper: aligned_tick_upper,
        }
    }

    /// Vérifie si un rééquilibrage est nécessaire en comparant la fourchette actuelle avec la cible
    public fun should_rebalance(
        current_tick_lower: u32,
        current_tick_upper: u32,
        target_range: &NewRange
    ): bool {
        current_tick_lower != target_range.tick_lower || 
        current_tick_upper != target_range.tick_upper
    }

    // --- Fonction d'Exécution (Protégée) ---
    // Cette fonction `entry` sera réellement appelée par le keeper pour exécuter le rééquilibrage.

    /// Met à jour la position avec de nouveaux ticks. Seul le propriétaire peut appeler cette fonction.
    /// NOTE DE SÉCURITÉ: Cette fonction est protégée et ne peut être appelée que par le propriétaire.
    /// Dans une VRAIE implémentation, elle interagirait avec le protocole Cetus pour repositionner la liquidité.
    public fun rebalance_position(
        position: &mut CetusPosition,
        new_tick_lower: u32,
        new_tick_upper: u32,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // Seul le propriétaire de la position peut la rééquilibrer.
        assert!(position.owner == sender, ENotAuthorized);

        let position_id = object::uid_to_address(&position.id);
        let old_tick_lower = position.tick_lower;
        let old_tick_upper = position.tick_upper;

        // NOTE: Dans une VRAIE implémentation, c'est ici que vous appelleriez
        // les fonctions du contrat Cetus pour retirer la liquidité et la redéposer
        // avec les nouveaux ticks. Le code ressemblerait conceptuellement à ceci :
        //
        // let (coin_a, coin_b) = cetus::pool::remove_liquidity(...);
        // cetus::pool::add_liquidity(..., new_tick_lower, new_tick_upper, coin_a, coin_b);

        // Pour notre simulation, nous mettons simplement à jour notre struct interne.
        position.tick_lower = new_tick_lower;
        position.tick_upper = new_tick_upper;

        // Émettre un événement de rééquilibrage
        event::emit(PositionRebalanced {
            position_id,
            old_tick_lower,
            old_tick_upper,
            new_tick_lower,
            new_tick_upper,
            owner: sender,
        });
    }

    /// Version entry de la fonction rebalance pour les appels directs
    public entry fun rebalance_position_entry(
        position: &mut CetusPosition,
        new_tick_lower: u32,
        new_tick_upper: u32,
        ctx: &mut TxContext
    ) {
        rebalance_position(position, new_tick_lower, new_tick_upper, ctx);
    }

    // =================================================================
    // GESTION DU GAS POUR LES STRATÉGIES
    // =================================================================

    /// Coffre-fort pour stocker les SUI dédiés au gas des stratégies
    public struct GasVault has key, store {
        id: UID,
        sui_balance: Coin<SUI>,
        owner: address,
        created_at: u64,
        total_deposited: u64,
        total_withdrawn: u64,
    }

    /// Événements pour la gestion du gas
    public struct GasDeposited has copy, drop {
        vault_id: address,
        amount: u64,
        owner: address,
        new_balance: u64,
    }

    public struct GasWithdrawn has copy, drop {
        vault_id: address,
        amount: u64,
        owner: address,
        remaining_balance: u64,
    }

    /// Créer un nouveau coffre-fort pour le gas
    public fun create_gas_vault(
        initial_sui: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let amount = coin::value(&initial_sui);
        let timestamp = clock::timestamp_ms(clock);
        
        let vault = GasVault {
            id: object::new(ctx),
            sui_balance: initial_sui,
            owner: sender,
            created_at: timestamp,
            total_deposited: amount,
            total_withdrawn: 0,
        };

        let vault_id = object::uid_to_address(&vault.id);

        // Émettre l'événement
        event::emit(GasDeposited {
            vault_id,
            amount,
            owner: sender,
            new_balance: amount,
        });

        // Transférer le coffre-fort au propriétaire
        transfer::transfer(vault, sender);
    }

    /// Ajouter du SUI au coffre-fort
    public fun deposit_gas(
        vault: &mut GasVault,
        sui_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(vault.owner == sender, ENotAuthorized);

        let amount = coin::value(&sui_coin);
        let vault_id = object::uid_to_address(&vault.id);

        // Fusionner le nouveau coin avec le solde existant
        coin::join(&mut vault.sui_balance, sui_coin);
        vault.total_deposited = vault.total_deposited + amount;

        let new_balance = coin::value(&vault.sui_balance);

        // Émettre l'événement
        event::emit(GasDeposited {
            vault_id,
            amount,
            owner: sender,
            new_balance,
        });
    }

    /// Retirer du SUI du coffre-fort
    public fun withdraw_gas(
        vault: &mut GasVault,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let sender = tx_context::sender(ctx);
        assert!(vault.owner == sender, ENotAuthorized);

        let vault_id = object::uid_to_address(&vault.id);
        let current_balance = coin::value(&vault.sui_balance);
        
        assert!(current_balance >= amount, 102); // Erreur: solde insuffisant

        // Diviser le coin pour retirer le montant demandé
        let withdrawn_coin = coin::split(&mut vault.sui_balance, amount, ctx);
        vault.total_withdrawn = vault.total_withdrawn + amount;

        let remaining_balance = coin::value(&vault.sui_balance);

        // Émettre l'événement
        event::emit(GasWithdrawn {
            vault_id,
            amount,
            owner: sender,
            remaining_balance,
        });

        withdrawn_coin
    }

    /// Version entry pour retirer et transférer directement
    public entry fun withdraw_gas_entry(
        vault: &mut GasVault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let withdrawn_coin = withdraw_gas(vault, amount, ctx);
        transfer::public_transfer(withdrawn_coin, sender);
    }

    /// Obtenir les informations du coffre-fort
    public fun get_gas_vault_info(vault: &GasVault): (u64, u64, u64, address) {
        (
            coin::value(&vault.sui_balance),  // Solde actuel
            vault.total_deposited,            // Total déposé
            vault.total_withdrawn,            // Total retiré
            vault.owner                       // Propriétaire
        )
    }

    /// Détruire un coffre-fort vide
    public fun destroy_empty_gas_vault(
        vault: GasVault,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let GasVault {
            id,
            sui_balance,
            owner,
            created_at: _,
            total_deposited: _,
            total_withdrawn: _,
        } = vault;

        assert!(owner == sender, ENotAuthorized);
        assert!(coin::value(&sui_balance) == 0, 103); // Erreur: coffre non vide

        // Détruire le coin vide et le coffre-fort
        coin::destroy_zero(sui_balance);
        object::delete(id);
    }

    // =================================================================
    // AJOUTS POUR LA STRATÉGIE TWAP (Time-Weighted Average Price)
    // =================================================================

    /// Erreur si l'ordre TWAP n'est plus actif ou est déjà terminé.
    const EOrderNotActive: u64 = 102;
    /// Erreur si l'intervalle de temps n'est pas encore écoulé.
    const EIntervalNotPassed: u64 = 103;
    /// Erreur si le montant est insuffisant.
    const EInsufficientAmount: u64 = 104;

    /// Représente un ordre TWAP on-chain.
    /// Cet objet est créé par l'utilisateur et géré par le keeper.
    public struct TWAPOrder<phantom CoinIn, phantom CoinOut> has key, store {
        id: UID,
        /// Le propriétaire de l'ordre, qui recevra les fonds échangés.
        owner: address,
        /// L'adresse du keeper autorisé à exécuter les swaps.
        keeper: address,
        /// Le trésor contenant les jetons à vendre.
        coin_in_treasury: Coin<CoinIn>,
        /// Le trésor pour accumuler les jetons achetés.
        coin_out_treasury: Coin<CoinOut>,
        /// Le nombre total de swaps à exécuter.
        total_orders: u64,
        /// Le montant de CoinIn à vendre à chaque intervalle.
        order_amount: u64,
        /// L'intervalle de temps entre chaque swap, en millisecondes.
        interval_ms: u64,
        /// Le timestamp de la dernière exécution.
        last_execution_time_ms: u64,
        /// Le nombre de swaps déjà exécutés.
        orders_executed: u64,
        /// Si l'ordre est actuellement actif.
        is_active: bool,
        /// Timestamp de création
        created_at: u64,
    }

    /// Événement émis lors de la création d'un ordre TWAP.
    public struct TWAPOrderCreated has copy, drop {
        order_id: address,
        owner: address,
        total_amount: u64,
        total_orders: u64,
        interval_ms: u64,
        order_amount: u64,
    }

    /// Événement émis lors de l'exécution d'un swap TWAP.
    public struct TWAPSwapExecuted has copy, drop {
        order_id: address,
        owner: address,
        amount_in: u64,
        amount_out: u64,
        orders_executed: u64,
        orders_remaining: u64,
    }

    /// Événement émis lors de la finalisation d'un ordre TWAP.
    public struct TWAPOrderCompleted has copy, drop {
        order_id: address,
        owner: address,
        total_amount_in: u64,
        total_amount_out: u64,
        orders_executed: u64,
    }

    /// Crée un nouvel ordre TWAP.
    /// L'utilisateur fournit le montant total à vendre, le nombre d'ordres et l'intervalle.
    public fun create_twap_order<CoinIn, CoinOut>(
        total_amount_in: Coin<CoinIn>,
        initial_coin_out: Coin<CoinOut>, // Coin vide pour initialiser le trésor de sortie
        total_orders: u64,
        interval_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let total_amount = coin::value(&total_amount_in);
        let order_amount = total_amount / total_orders;

        assert!(total_amount > 0, EInsufficientAmount);
        assert!(total_orders > 0, EInsufficientAmount);
        assert!(order_amount > 0, EInsufficientAmount);

        let order = TWAPOrder<CoinIn, CoinOut> {
            id: object::new(ctx),
            owner: sender,
            keeper: sender, // Par défaut, le propriétaire est aussi le keeper
            coin_in_treasury: total_amount_in,
            coin_out_treasury: initial_coin_out,
            total_orders,
            order_amount,
            interval_ms,
            last_execution_time_ms: clock::timestamp_ms(clock),
            orders_executed: 0,
            is_active: true,
            created_at: clock::timestamp_ms(clock),
        };

        let order_id = object::uid_to_address(&order.id);

        event::emit(TWAPOrderCreated {
            order_id,
            owner: sender,
            total_amount,
            total_orders,
            interval_ms,
            order_amount,
        });

        // Transfère l'objet de l'ordre à son créateur.
        transfer::transfer(order, sender);
    }

    /// Exécute un seul swap pour un ordre TWAP (version simplifiée pour simulation).
    /// Cette fonction simule un swap en transférant les tokens.
    public fun execute_twap_swap_simulation<CoinIn, CoinOut>(
        order: &mut TWAPOrder<CoinIn, CoinOut>,
        coin_out_for_swap: Coin<CoinOut>, // Coin à ajouter au trésor (simule le résultat du swap)
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(order.keeper == sender, ENotAuthorized);
        assert!(order.is_active && order.orders_executed < order.total_orders, EOrderNotActive);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= order.last_execution_time_ms + order.interval_ms, EIntervalNotPassed);

        let order_id = object::uid_to_address(&order.id);

        // Divise le montant pour ce swap du trésor de l'ordre.
        let coin_to_swap = coin::split(&mut order.coin_in_treasury, order.order_amount, ctx);
        let amount_in = coin::value(&coin_to_swap);
        let amount_out = coin::value(&coin_out_for_swap);

        // Simule le swap en détruisant le coin d'entrée et ajoutant le coin de sortie
        let mut temp_coin = coin_to_swap;
        coin::destroy_zero(coin::split(&mut temp_coin, amount_in, ctx));
        coin::join(&mut order.coin_out_treasury, coin_out_for_swap);

        // Retourner le reste du coin d'entrée au trésor
        coin::join(&mut order.coin_in_treasury, temp_coin);

        // Mise à jour de l'état de l'ordre
        order.orders_executed = order.orders_executed + 1;
        order.last_execution_time_ms = current_time;

        let orders_remaining = order.total_orders - order.orders_executed;

        event::emit(TWAPSwapExecuted {
            order_id,
            owner: order.owner,
            amount_in,
            amount_out,
            orders_executed: order.orders_executed,
            orders_remaining,
        });

        // Si tous les ordres sont exécutés, finalise l'ordre
        if (order.orders_executed == order.total_orders) {
            order.is_active = false;
            
            let total_amount_out = coin::value(&order.coin_out_treasury);
            
            event::emit(TWAPOrderCompleted {
                order_id,
                owner: order.owner,
                total_amount_in: amount_in * order.total_orders,
                total_amount_out,
                orders_executed: order.orders_executed,
            });
        }
    }

    /// Finaliser un ordre TWAP et récupérer les fonds.
    public fun finalize_twap_order<CoinIn, CoinOut>(
        order: TWAPOrder<CoinIn, CoinOut>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let TWAPOrder {
            id,
            owner,
            keeper: _,
            coin_in_treasury,
            coin_out_treasury,
            total_orders: _,
            order_amount: _,
            interval_ms: _,
            last_execution_time_ms: _,
            orders_executed: _,
            is_active: _,
            created_at: _,
        } = order;

        assert!(owner == sender, ENotAuthorized);

        // Transférer tous les fonds restants au propriétaire
        if (coin::value(&coin_in_treasury) > 0) {
            transfer::public_transfer(coin_in_treasury, sender);
        } else {
            coin::destroy_zero(coin_in_treasury);
        };

        if (coin::value(&coin_out_treasury) > 0) {
            transfer::public_transfer(coin_out_treasury, sender);
        } else {
            coin::destroy_zero(coin_out_treasury);
        };

        object::delete(id);
    }

    /// Obtenir les informations d'un ordre TWAP.
    public fun get_twap_order_info<CoinIn, CoinOut>(
        order: &TWAPOrder<CoinIn, CoinOut>
    ): (u64, u64, u64, u64, u64, bool) {
        (
            coin::value(&order.coin_in_treasury),  // Montant restant à vendre
            coin::value(&order.coin_out_treasury), // Montant accumulé
            order.orders_executed,                 // Ordres exécutés
            order.total_orders,                    // Total d'ordres
            order.interval_ms,                     // Intervalle en ms
            order.is_active                        // Statut actif
        )
    }

    /// Annuler un ordre TWAP et récupérer les fonds restants.
    public entry fun cancel_twap_order<CoinIn, CoinOut>(
        order: TWAPOrder<CoinIn, CoinOut>,
        ctx: &mut TxContext
    ) {
        finalize_twap_order(order, ctx);
    }
}
