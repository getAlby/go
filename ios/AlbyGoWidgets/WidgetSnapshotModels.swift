import Foundation

/// Snapshot of widget data from the React Native app.
/// Matches the TypeScript WidgetSnapshot interface in lib/widgets.ts
struct WidgetSnapshot: Codable {
    let widgetsEnabled: Bool
    let hideAmounts: Bool
    let useBitcoinSymbol: Bool // true = ₿, false = sats
    let walletName: String?
    let fiatCurrency: String
    let btcPriceInFiat: Double?
    let balanceSats: Int?
    let balanceFiat: Double?
    let lastTransaction: LastTransaction?
    let updatedAt: Int
    
    struct LastTransaction: Codable {
        let type: String // "incoming" or "outgoing"
        let amountSats: Int
        let amountFiat: Double?
        let description: String
        let timestamp: Int
    }
    
    /// Check if this is a valid snapshot with data
    var hasData: Bool {
        return widgetsEnabled
    }
    
    /// Placeholder snapshot for previews
    static var placeholder: WidgetSnapshot {
        WidgetSnapshot(
            widgetsEnabled: true,
            hideAmounts: false,
            useBitcoinSymbol: true,
            walletName: "My Wallet",
            fiatCurrency: "USD",
            btcPriceInFiat: 104250.00,
            balanceSats: 250000,
            balanceFiat: 260.63,
            lastTransaction: LastTransaction(
                type: "incoming",
                amountSats: 21000,
                amountFiat: 21.89,
                description: "Payment received",
                timestamp: Int(Date().timeIntervalSince1970)
            ),
            updatedAt: Int(Date().timeIntervalSince1970)
        )
    }
    
    /// Empty snapshot when no data available
    static var empty: WidgetSnapshot {
        WidgetSnapshot(
            widgetsEnabled: false,
            hideAmounts: false,
            useBitcoinSymbol: true,
            walletName: nil,
            fiatCurrency: "USD",
            btcPriceInFiat: nil,
            balanceSats: nil,
            balanceFiat: nil,
            lastTransaction: nil,
            updatedAt: Int(Date().timeIntervalSince1970)
        )
    }
}

// MARK: - Formatting Helpers

extension WidgetSnapshot {
    /// Format sats amount with thousand separators
    static func formatSats(_ sats: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: sats)) ?? "\(sats)"
    }
    
    /// Format fiat amount with currency symbol
    func formatFiat(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = fiatCurrency
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: amount)) ?? "\(amount)"
    }
    
    /// Format BTC price
    func formatBtcPrice() -> String {
        guard let price = btcPriceInFiat else { return "--" }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = fiatCurrency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "\(Int(price))"
    }
    
    /// Format timestamp as relative time
    static func formatRelativeTime(_ timestamp: Int) -> String {
        let date = Date(timeIntervalSince1970: TimeInterval(timestamp))
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
