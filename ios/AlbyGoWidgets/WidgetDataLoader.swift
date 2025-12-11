import Foundation

/// Loads widget data from App Group UserDefaults.
/// Data is written by the React Native app via react-native-home-widget.
struct WidgetDataLoader {
    /// App Group identifier shared between main app and widget extension
    private static let appGroupId = "group.com.jakubszwedo.albygo"
    
    /// Key used to store the widget snapshot JSON
    private static let snapshotKey = "alby_widget_snapshot"
    
    /// Load the current widget snapshot from shared storage
    static func loadSnapshot() -> WidgetSnapshot {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            print("WidgetDataLoader: Failed to access App Group UserDefaults")
            return .empty
        }
        
        guard let jsonString = userDefaults.string(forKey: snapshotKey) else {
            print("WidgetDataLoader: No snapshot data found")
            return .empty
        }
        
        guard let jsonData = jsonString.data(using: .utf8) else {
            print("WidgetDataLoader: Failed to convert JSON string to data")
            return .empty
        }
        
        do {
            let snapshot = try JSONDecoder().decode(WidgetSnapshot.self, from: jsonData)
            return snapshot
        } catch {
            print("WidgetDataLoader: Failed to decode snapshot: \(error)")
            return .empty
        }
    }
}
