import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline Entry

struct BalanceWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
    let walletData: WalletData?
    let selectedWalletName: String?
    
    static var placeholder: BalanceWidgetEntry {
        BalanceWidgetEntry(
            date: Date(), 
            snapshot: .placeholder,
            walletData: nil,
            selectedWalletName: nil
        )
    }
}

// MARK: - App Intent Timeline Provider

struct BalanceWidgetProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> BalanceWidgetEntry {
        .placeholder
    }
    
    func snapshot(for configuration: BalanceWidgetIntent, in context: Context) async -> BalanceWidgetEntry {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let walletData = configuration.wallet.map { WalletDataStore.getWalletData(walletId: $0.id) } ?? nil
        return BalanceWidgetEntry(
            date: Date(), 
            snapshot: snapshot,
            walletData: walletData,
            selectedWalletName: configuration.wallet?.name
        )
    }
    
    func timeline(for configuration: BalanceWidgetIntent, in context: Context) async -> Timeline<BalanceWidgetEntry> {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let walletData = configuration.wallet.map { WalletDataStore.getWalletData(walletId: $0.id) } ?? nil
        let entry = BalanceWidgetEntry(
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

// MARK: - Popicons Wallet Horizontal Open Icon
struct WalletHorizontalOpenIcon: View {
    var color: Color = .orange
    var size: CGFloat = 16
    
    var body: some View {
        Canvas { context, canvasSize in
            // Scale factor from 20x20 viewBox to our size
            let scale = size / 20
            
            // Main wallet body path
            let mainPath = Path { path in
                path.move(to: CGPoint(x: 15.325 * scale, y: 2.237 * scale))
                path.addCurve(
                    to: CGPoint(x: 12.915 * scale, y: 2.031 * scale),
                    control1: CGPoint(x: 14.972 * scale, y: 2.078 * scale),
                    control2: CGPoint(x: 14.228 * scale, y: 2.006 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 4.998 * scale, y: 2.827 * scale),
                    control1: CGPoint(x: 10.611 * scale, y: 2.131 * scale),
                    control2: CGPoint(x: 7.527 * scale, y: 2.348 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 0 * scale, y: 5.864 * scale),
                    control1: CGPoint(x: 2.566 * scale, y: 3.379 * scale),
                    control2: CGPoint(x: 0 * scale, y: 4.843 * scale)
                )
                path.addLine(to: CGPoint(x: 0 * scale, y: 11.351 * scale))
                path.addCurve(
                    to: CGPoint(x: 1.127 * scale, y: 16.909 * scale),
                    control1: CGPoint(x: 0 * scale, y: 13.804 * scale),
                    control2: CGPoint(x: 0.244 * scale, y: 15.559 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 6.867 * scale, y: 18 * scale),
                    control1: CGPoint(x: 2.521 * scale, y: 17.764 * scale),
                    control2: CGPoint(x: 4.333 * scale, y: 18 * scale)
                )
                path.addLine(to: CGPoint(x: 13.4 * scale, y: 18 * scale))
                path.addCurve(
                    to: CGPoint(x: 19.056 * scale, y: 16.72 * scale),
                    control1: CGPoint(x: 16.518 * scale, y: 18 * scale),
                    control2: CGPoint(x: 18.813 * scale, y: 17.086 * scale)
                )
                path.addLine(to: CGPoint(x: 19.875 * scale, y: 14.804 * scale))
                path.addLine(to: CGPoint(x: 15.653 * scale, y: 14.804 * scale))
                path.addCurve(
                    to: CGPoint(x: 12.32 * scale, y: 11.576 * scale),
                    control1: CGPoint(x: 13.812 * scale, y: 14.804 * scale),
                    control2: CGPoint(x: 12.32 * scale, y: 13.359 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 15.653 * scale, y: 8.348 * scale),
                    control1: CGPoint(x: 12.32 * scale, y: 9.793 * scale),
                    control2: CGPoint(x: 13.812 * scale, y: 8.348 * scale)
                )
                path.addLine(to: CGPoint(x: 19.97 * scale, y: 8.348 * scale))
                path.addCurve(
                    to: CGPoint(x: 16.633 * scale, y: 3.448 * scale),
                    control1: CGPoint(x: 19.765 * scale, y: 6.773 * scale),
                    control2: CGPoint(x: 18.537 * scale, y: 5.507 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 15.325 * scale, y: 2.237 * scale),
                    control1: CGPoint(x: 16.351 * scale, y: 2.927 * scale),
                    control2: CGPoint(x: 15.875 * scale, y: 2.486 * scale)
                )
                path.closeSubpath()
            }
            
            context.fill(mainPath, with: .color(color))
            
            // Money slot path (the opening on the right)
            let slotPath = Path { path in
                path.move(to: CGPoint(x: 20 * scale, y: 9.838 * scale))
                path.addLine(to: CGPoint(x: 15.653 * scale, y: 9.838 * scale))
                path.addCurve(
                    to: CGPoint(x: 13.858 * scale, y: 11.576 * scale),
                    control1: CGPoint(x: 14.662 * scale, y: 9.838 * scale),
                    control2: CGPoint(x: 13.858 * scale, y: 10.616 * scale)
                )
                path.addCurve(
                    to: CGPoint(x: 15.653 * scale, y: 13.314 * scale),
                    control1: CGPoint(x: 13.858 * scale, y: 12.536 * scale),
                    control2: CGPoint(x: 14.662 * scale, y: 13.314 * scale)
                )
                path.addLine(to: CGPoint(x: 19.987 * scale, y: 13.314 * scale))
                path.addCurve(
                    to: CGPoint(x: 20 * scale, y: 9.838 * scale),
                    control1: CGPoint(x: 20 * scale, y: 12.805 * scale),
                    control2: CGPoint(x: 20 * scale, y: 11.609 * scale)
                )
                path.closeSubpath()
                
                // Inner circle (coin slot)
                let circleCenter = CGPoint(x: 16.154 * scale, y: 11.576 * scale)
                let circleRadius = 1.026 * scale
                path.addEllipse(in: CGRect(
                    x: circleCenter.x - circleRadius,
                    y: circleCenter.y - circleRadius,
                    width: circleRadius * 2,
                    height: circleRadius * 2
                ))
            }
            
            context.fill(slotPath, with: .color(color))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Widget View

struct BalanceWidgetView: View {
    @Environment(\.colorScheme) var colorScheme
    var entry: BalanceWidgetEntry
    
    /// Gold color for dark mode amounts
    private var amountColor: Color {
        colorScheme == .dark ? Color(hex: "FFE480") : Color(hex: "1A1A1A")
    }
    
    private var secondaryTextColor: Color {
        colorScheme == .dark ? Color(hex: "9CA3AF") : Color(hex: "6B7280")
    }
    
    private var backgroundColor: Color {
        colorScheme == .dark ? Color(hex: "1C1C1E") : Color.white
    }
    
    // Get wallet name - prefer selected wallet, fallback to snapshot
    private var walletName: String {
        entry.selectedWalletName ?? entry.walletData?.name ?? entry.snapshot.walletName ?? "Wallet"
    }
    
    // Get balance - prefer wallet-specific data, fallback to snapshot
    private var balanceSats: Int? {
        entry.walletData?.balanceSats ?? entry.snapshot.balanceSats
    }
    
    private var balanceFiat: Double? {
        entry.walletData?.balanceFiat ?? entry.snapshot.balanceFiat
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 5) {
                WalletHorizontalOpenIcon(color: secondaryTextColor, size: 16)
                Text(walletName)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(secondaryTextColor)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Balance
            if entry.snapshot.hasData {
                if entry.snapshot.hideAmounts {
                    Text("••••••")
                        .font(.custom("OpenRunde-Bold", size: 24))
                        .foregroundColor(secondaryTextColor)
                } else if let sats = balanceSats {
                    // Sats amount - use ₿ or sats based on user setting
                    if entry.snapshot.useBitcoinSymbol {
                        Text("₿ \(formatSats(sats))")
                            .font(.custom("OpenRunde-Bold", size: 28))
                            .foregroundColor(amountColor)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                    } else {
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text(formatSats(sats))
                                .font(.custom("OpenRunde-Bold", size: 28))
                                .foregroundColor(amountColor)
                                .minimumScaleFactor(0.6)
                                .lineLimit(1)
                            Text("sats")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(secondaryTextColor)
                        }
                    }
                    
                    // Fiat equivalent on one line
                    if let fiat = balanceFiat {
                        Text("~ \(formatFiat(fiat))")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(secondaryTextColor)
                            .lineLimit(1)
                            .padding(.top, 2)
                    }
                } else {
                    noDataView
                }
            } else {
                noDataView
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .background(backgroundColor)
        .widgetURL(URL(string: "alby://"))
    }
    
    private var noDataView: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("No data")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(secondaryTextColor)
            Text("Open app to sync")
                .font(.system(size: 11))
                .foregroundColor(secondaryTextColor.opacity(0.7))
        }
    }
    
    private func formatSats(_ sats: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return formatter.string(from: NSNumber(value: sats)) ?? "\(sats)"
    }
    
    private func formatFiat(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        formatter.decimalSeparator = ","
        formatter.groupingSeparator = " "
        let formatted = formatter.string(from: NSNumber(value: amount)) ?? String(format: "%.2f", amount)
        return "\(formatted) \(entry.snapshot.fiatCurrency)"
    }
}

// MARK: - Widget Configuration

struct BalanceWidget: Widget {
    let kind: String = "BalanceWidget"
    
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: BalanceWidgetIntent.self, provider: BalanceWidgetProvider()) { entry in
            BalanceWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Wallet Balance")
        .description("Your current wallet balance")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    BalanceWidget()
} timeline: {
    BalanceWidgetEntry.placeholder
}
