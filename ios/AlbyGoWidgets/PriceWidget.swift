import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct PriceWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
    
    static var placeholder: PriceWidgetEntry {
        PriceWidgetEntry(date: Date(), snapshot: .placeholder)
    }
}

// MARK: - Timeline Provider

struct PriceWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> PriceWidgetEntry {
        .placeholder
    }
    
    func getSnapshot(in context: Context, completion: @escaping (PriceWidgetEntry) -> Void) {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let entry = PriceWidgetEntry(date: Date(), snapshot: snapshot)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<PriceWidgetEntry>) -> Void) {
        let snapshot = WidgetDataLoader.loadSnapshot()
        let entry = PriceWidgetEntry(date: Date(), snapshot: snapshot)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Widget View

struct PriceWidgetView: View {
    @Environment(\.colorScheme) var colorScheme
    var entry: PriceWidgetEntry
    
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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 5) {
                ZStack {
                    Circle()
                        .fill(secondaryTextColor)
                        .frame(width: 16, height: 16)
                    Text("₿")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(backgroundColor)
                }
                Text("Bitcoin Price")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(secondaryTextColor)
            }
            
            Spacer()
            
            // Price
            if entry.snapshot.hasData, let price = entry.snapshot.btcPriceInFiat {
                Text(formatPrice(price))
                    .font(.custom("OpenRunde-Bold", size: 28))
                    .foregroundColor(amountColor)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                
                Text(entry.snapshot.fiatCurrency)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(secondaryTextColor)
                    .padding(.top, 2)
            } else {
                Text("No data")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(secondaryTextColor)
                Text("Open app to sync")
                    .font(.system(size: 11))
                    .foregroundColor(secondaryTextColor.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(16)
        .background(backgroundColor)
        .widgetURL(URL(string: "alby://"))
    }
    
    private func formatPrice(_ price: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        formatter.maximumFractionDigits = 0
        let formatted = formatter.string(from: NSNumber(value: price)) ?? "\(Int(price))"
        
        // Get currency symbol
        let symbol = getCurrencySymbol(for: entry.snapshot.fiatCurrency)
        return "\(symbol) \(formatted)"
    }
    
    private func getCurrencySymbol(for code: String) -> String {
        switch code {
        case "USD": return "$"
        case "EUR": return "€"
        case "GBP": return "£"
        case "JPY": return "¥"
        case "CHF": return "CHF"
        case "CAD": return "CA$"
        case "AUD": return "A$"
        case "PLN": return "zł"
        default:
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.currencyCode = code
            return formatter.currencySymbol ?? code
        }
    }
}

// MARK: - Widget Configuration

struct PriceWidget: Widget {
    let kind: String = "PriceWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PriceWidgetProvider()) { entry in
            PriceWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Bitcoin Price")
        .description("Current Bitcoin price in your currency")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    PriceWidget()
} timeline: {
    PriceWidgetEntry.placeholder
}
