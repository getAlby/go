import AppIntents
import WidgetKit

// MARK: - Wallet Entity for App Intents

/// Represents a wallet that can be selected in widget configuration
struct WalletEntity: AppEntity {
    let id: String
    let name: String
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Wallet"
    static var defaultQuery = WalletEntityQuery()
    
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

// MARK: - Wallet Entity Query

/// Query to fetch available wallets for the widget configuration
struct WalletEntityQuery: EntityQuery {
    func entities(for identifiers: [WalletEntity.ID]) async throws -> [WalletEntity] {
        let allWallets = WalletDataStore.loadWallets()
        return allWallets.filter { identifiers.contains($0.id) }
    }
    
    func suggestedEntities() async throws -> [WalletEntity] {
        return WalletDataStore.loadWallets()
    }
    
    func defaultResult() async -> WalletEntity? {
        return WalletDataStore.loadWallets().first
    }
}

// MARK: - Balance Widget Configuration Intent

/// Configuration intent for the Balance Widget
struct BalanceWidgetIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Wallet"
    static var description = IntentDescription("Choose which wallet to display")
    
    @Parameter(title: "Wallet")
    var wallet: WalletEntity?
    
    init() {}
    
    init(wallet: WalletEntity?) {
        self.wallet = wallet
    }
}

// MARK: - Last Transaction Widget Configuration Intent

/// Configuration intent for the Last Transaction Widget
struct LastTransactionWidgetIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Wallet"
    static var description = IntentDescription("Choose which wallet to display")
    
    @Parameter(title: "Wallet")
    var wallet: WalletEntity?
    
    init() {}
    
    init(wallet: WalletEntity?) {
        self.wallet = wallet
    }
}

// MARK: - Wallet Data Store

/// Manages wallet data stored in App Group UserDefaults
struct WalletDataStore {
    private static let appGroupId = "group.com.jakubszwedo.albygo"
    private static let walletsKey = "alby_widget_wallets"
    
    /// Load all available wallets from shared storage
    static func loadWallets() -> [WalletEntity] {
        guard let userDefaults = UserDefaults(suiteName: appGroupId),
              let jsonString = userDefaults.string(forKey: walletsKey),
              let jsonData = jsonString.data(using: .utf8) else {
            return [WalletEntity(id: "default", name: "Default Wallet")]
        }
        
        do {
            let walletList = try JSONDecoder().decode([WalletInfo].self, from: jsonData)
            return walletList.map { WalletEntity(id: $0.id, name: $0.name) }
        } catch {
            print("WalletDataStore: Failed to decode wallets: \(error)")
            return [WalletEntity(id: "default", name: "Default Wallet")]
        }
    }
    
    /// Get wallet data for a specific wallet ID
    static func getWalletData(walletId: String?) -> WalletData? {
        guard let userDefaults = UserDefaults(suiteName: appGroupId),
              let jsonString = userDefaults.string(forKey: "alby_widget_wallet_\(walletId ?? "0")"),
              let jsonData = jsonString.data(using: .utf8) else {
            // Fallback to the old single-wallet snapshot for backwards compatibility
            return getDefaultWalletData()
        }
        
        do {
            return try JSONDecoder().decode(WalletData.self, from: jsonData)
        } catch {
            print("WalletDataStore: Failed to decode wallet data: \(error)")
            return getDefaultWalletData()
        }
    }
    
    /// Get default wallet data (backwards compatible with old snapshot)
    private static func getDefaultWalletData() -> WalletData? {
        let snapshot = WidgetDataLoader.loadSnapshot()
        guard snapshot.hasData else { return nil }
        
        return WalletData(
            id: "0",
            name: snapshot.walletName ?? "Wallet",
            balanceSats: snapshot.balanceSats,
            balanceFiat: snapshot.balanceFiat,
            lastTransaction: snapshot.lastTransaction.map { tx in
                WalletData.Transaction(
                    type: tx.type,
                    amountSats: tx.amountSats,
                    amountFiat: tx.amountFiat,
                    description: tx.description,
                    timestamp: tx.timestamp
                )
            }
        )
    }
}

// MARK: - Wallet Info (for wallet list)

struct WalletInfo: Codable {
    let id: String
    let name: String
}

// MARK: - Wallet Data (per-wallet data)

struct WalletData: Codable {
    let id: String
    let name: String
    let balanceSats: Int?
    let balanceFiat: Double?
    let lastTransaction: Transaction?
    
    struct Transaction: Codable {
        let type: String
        let amountSats: Int
        let amountFiat: Double?
        let description: String
        let timestamp: Int
    }
}
