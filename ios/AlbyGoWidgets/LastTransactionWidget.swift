import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline Entry

struct LastTransactionWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
    let walletData: WalletData?
    let selectedWalletName: String?
    
    static var placeholder: LastTransactionWidgetEntry {
        LastTransactionWidgetEntry(
            date: Date(), 
            snapshot: .placeholder,
            walletData: nil,
            selectedWalletName: nil
        )
    }
}

// MARK: - App Intent Timeline Provider

struct LastTransactionWidgetProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> LastTransactionWidgetEntry {
        .placeholder
    }
    
    func snapshot(for configuration: LastTransactionWidgetIntent, in context: Context) async -> LastTransactionWidgetEntry {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let walletData = configuration.wallet.map { WalletDataStore.getWalletData(walletId: $0.id) } ?? nil
        return LastTransactionWidgetEntry(
            date: Date(), 
            snapshot: snapshot,
            walletData: walletData,
            selectedWalletName: configuration.wallet?.name
        )
    }
    
    func timeline(for configuration: LastTransactionWidgetIntent, in context: Context) async -> Timeline<LastTransactionWidgetEntry> {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let walletData = configuration.wallet.map { WalletDataStore.getWalletData(walletId: $0.id) } ?? nil
        let entry = LastTransactionWidgetEntry(
            date: Date(), 
            snapshot: snapshot,
            walletData: walletData,
            selectedWalletName: configuration.wallet?.name
        )
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
}

// MARK: - Widget View

struct LastTransactionWidgetView: View {
    @Environment(\.colorScheme) var colorScheme
    var entry: LastTransactionWidgetEntry
    
    private var secondaryTextColor: Color {
        colorScheme == .dark ? Color(hex: "9CA3AF") : Color(hex: "6B7280")
    }
    
    private var backgroundColor: Color {
        colorScheme == .dark ? Color(hex: "1C1C1E") : Color.white
    }
    
    // Get last transaction - prefer wallet-specific data, fallback to snapshot
    private var lastTransaction: WidgetSnapshot.LastTransaction? {
        // Convert wallet data transaction to snapshot transaction format if available
        if let walletTx = entry.walletData?.lastTransaction {
            return WidgetSnapshot.LastTransaction(
                type: walletTx.type,
                amountSats: walletTx.amountSats,
                amountFiat: walletTx.amountFiat,
                description: walletTx.description,
                timestamp: walletTx.timestamp
            )
        }
        return entry.snapshot.lastTransaction
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 5) {
                Image(systemName: "arrow.left.arrow.right")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(secondaryTextColor)
                Text("Last Transaction")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(secondaryTextColor)
            }
            
            Spacer()
            
            // Transaction content
            if entry.snapshot.hasData {
                if let tx = lastTransaction {
                    transactionContent(tx)
                } else {
                    // Has data but no transactions yet
                    VStack(alignment: .leading, spacing: 2) {
                        Text("No transactions")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(secondaryTextColor)
                        Text("Make your first payment")
                            .font(.system(size: 11))
                            .foregroundColor(secondaryTextColor.opacity(0.7))
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    Text("No data")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(secondaryTextColor)
                    Text("Open app to sync")
                        .font(.system(size: 11))
                        .foregroundColor(secondaryTextColor.opacity(0.7))
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .background(backgroundColor)
        .widgetURL(URL(string: "alby://transactions"))
    }
    
    @ViewBuilder
    private func transactionContent(_ tx: WidgetSnapshot.LastTransaction) -> some View {
        let txColor = tx.type == "incoming" ? Color(hex: "22C55E") : Color(hex: "F97316")
        
        if entry.snapshot.hideAmounts {
            VStack(alignment: .leading, spacing: 6) {
                transactionIcon(for: tx.type)
                Text("••••••")
                    .font(.custom("OpenRunde-Bold", size: 18))
                    .foregroundColor(secondaryTextColor)
            }
        } else {
            VStack(alignment: .leading, spacing: 4) {
                // Icon
                transactionIcon(for: tx.type)
                
                // Amount - use ₿ or sats based on user setting
                if entry.snapshot.useBitcoinSymbol {
                    Text("\(tx.type == "incoming" ? "+ " : "- ")₿ \(formatSats(tx.amountSats))")
                        .font(.custom("OpenRunde-Bold", size: 22))
                        .foregroundColor(txColor)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                } else {
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(tx.type == "incoming" ? "+" : "-") \(formatSats(tx.amountSats))")
                            .font(.custom("OpenRunde-Bold", size: 22))
                            .foregroundColor(txColor)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                        Text("sats")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(secondaryTextColor)
                    }
                }
                
                // Memo (description) if available
                if !tx.description.isEmpty {
                    Text(tx.description)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(secondaryTextColor)
                        .lineLimit(1)
                }
                
                // Time
                Text(formatRelativeTime(tx.timestamp))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(secondaryTextColor)
            }
        }
    }
    
    /// Transaction type icon with bolder arrow
    @ViewBuilder
    private func transactionIcon(for type: String) -> some View {
        let isIncoming = type == "incoming"
        let color = isIncoming ? Color(hex: "22C55E") : Color(hex: "F97316")
        
        ZStack {
            Circle()
                .fill(color.opacity(colorScheme == .dark ? 0.25 : 0.15))
                .frame(width: 38, height: 38)
            // Use black weight for fatter arrow, with shadow for extra thickness
            Image(systemName: isIncoming ? "arrow.down" : "arrow.up")
                .font(.system(size: 17, weight: .black))
                .foregroundColor(color)
                .shadow(color: color, radius: 0.5, x: 0, y: 0)
        }
    }
    
    private func formatSats(_ sats: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return formatter.string(from: NSNumber(value: sats)) ?? "\(sats)"
    }
    
    private func formatRelativeTime(_ timestamp: Int) -> String {
        let date = Date(timeIntervalSince1970: TimeInterval(timestamp))
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Widget Configuration

struct LastTransactionWidget: Widget {
    let kind: String = "LastTransactionWidget"
    
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: LastTransactionWidgetIntent.self, provider: LastTransactionWidgetProvider()) { entry in
            LastTransactionWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Last Transaction")
        .description("Your most recent transaction")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    LastTransactionWidget()
} timeline: {
    LastTransactionWidgetEntry.placeholder
}
