# Alby Go iOS Home Screen Widgets

This document explains how to set up and build the iOS home screen widgets for Alby Go.

## Overview

Alby Go includes three iOS home screen widgets:

1. **BTC Price Widget** - Displays the current Bitcoin price in the user's selected fiat currency
2. **Balance Widget** - Shows the wallet balance in sats with optional fiat equivalent
3. **Last Transaction Widget** - Displays the most recent transaction with amount and description

All widgets:
- Read cached data from the app (no network requests)
- Respect privacy settings (hide amounts option)
- Deep-link into the app when tapped
- Support `systemSmall` size

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  useBalance  │    │ useFiatRate  │    │useTransactions│   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│         │                   │                    │           │
│         └───────────────────┼────────────────────┘           │
│                             ▼                                │
│                   ┌─────────────────┐                        │
│                   │  useWidgetSync  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                            ▼                                 │
│                   ┌─────────────────┐                        │
│                   │  lib/widgets.ts │                        │
│                   │  (snapshot JSON)│                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │   App Group UserDefaults  │
              │  group.com.getalby.mobile │
              │           .nse            │
              └──────────────┬────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   iOS Widget Extension                       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  PriceWidget   │  │ BalanceWidget  │  │LastTxWidget    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Files

### JavaScript/TypeScript (React Native)

| File | Purpose |
|------|---------|
| `lib/widgets.ts` | Types, snapshot builder, write helpers |
| `hooks/useWidgetSync.ts` | Observes state changes, writes snapshots |
| `pages/settings/Widgets.tsx` | Settings UI for widget toggles |

### Swift (iOS Widget Extension)

| File | Purpose |
|------|---------|
| `ios/AlbyGoWidgets/AlbyGoWidgetBundle.swift` | Widget bundle entry point |
| `ios/AlbyGoWidgets/WidgetSnapshotModels.swift` | Codable structs matching JS types |
| `ios/AlbyGoWidgets/WidgetDataLoader.swift` | Reads JSON from UserDefaults |
| `ios/AlbyGoWidgets/PriceWidget.swift` | BTC price widget |
| `ios/AlbyGoWidgets/BalanceWidget.swift` | Balance widget |
| `ios/AlbyGoWidgets/LastTransactionWidget.swift` | Last transaction widget |

## Xcode Setup

### Prerequisites

- Xcode 15.0 or later
- iOS 17.0 deployment target (for widget previews)
- Valid Apple Developer account with app signing configured

### Step 1: Open Project

```bash
cd ios
open AlbyGo.xcworkspace
```

### Step 2: Create Widget Extension Target

1. In Xcode, go to **File > New > Target**
2. Select **Widget Extension** from the iOS templates
3. Configure:
   - **Product Name:** `AlbyGoWidgets`
   - **Team:** Same as main app
   - **Bundle Identifier:** `com.getalby.mobile.widgets`
   - **Embed in Application:** `AlbyGo`
   - **Include Live Activity:** No (uncheck)
   - **Include Configuration App Intent:** No (uncheck)
4. Click **Finish**
5. If prompted to activate the scheme, click **Cancel** (we'll use the main app scheme)

### Step 3: Remove Template Files

Xcode creates template widget files. Delete them:

1. In the Project Navigator, expand the `AlbyGoWidgets` folder
2. Delete:
   - `AlbyGoWidgets.swift` (or similar template file)
   - `Assets.xcassets` (optional, if created)
3. When prompted, choose **Move to Trash**

### Step 4: Add Widget Source Files

1. Right-click the `AlbyGoWidgets` folder in Project Navigator
2. Choose **Add Files to "AlbyGo"...**
3. Navigate to `ios/AlbyGoWidgets/`
4. Select all `.swift` files:
   - `AlbyGoWidgetBundle.swift`
   - `WidgetSnapshotModels.swift`
   - `WidgetDataLoader.swift`
   - `PriceWidget.swift`
   - `BalanceWidget.swift`
   - `LastTransactionWidget.swift`
5. Ensure **AlbyGoWidgets** target is checked
6. Click **Add**

### Step 5: Configure App Groups

#### Main App Target

1. Select the project in Project Navigator
2. Select the **AlbyGo** target
3. Go to **Signing & Capabilities** tab
4. Verify **App Groups** capability exists
5. Ensure `group.com.getalby.mobile.nse` is enabled

#### Widget Extension Target

1. Select the **AlbyGoWidgets** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **App Groups**
5. Check `group.com.getalby.mobile.nse`

### Step 6: Verify Entitlements

The widget extension needs an entitlements file. Xcode usually creates this automatically.

Check `AlbyGoWidgets/AlbyGoWidgets.entitlements` contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.getalby.mobile.nse</string>
    </array>
</dict>
</plist>
```

### Step 7: Set Deployment Target

1. Select the **AlbyGoWidgets** target
2. Go to **General** tab
3. Set **Minimum Deployments > iOS** to `17.0` (or match the main app)

### Step 8: Build and Run

1. Select the **AlbyGo** scheme (not AlbyGoWidgets)
2. Choose a device or simulator
3. Build and run (⌘R)
4. The widget extension will be built automatically as it's embedded

## Testing Widgets

### On Simulator/Device

1. Long-press on the home screen
2. Tap the **+** button in the top-left corner
3. Search for "Alby Go"
4. Select a widget and tap **Add Widget**

### Widget Preview (Xcode)

Open any widget Swift file and use the `#Preview` macro at the bottom:

```swift
#Preview(as: .systemSmall) {
    PriceWidget()
} timeline: {
    PriceWidgetEntry.placeholder
}
```

## Data Flow

1. **App State Changes**
   - Balance updates from `useBalance` hook
   - Fiat rate updates from `useFiatRate` hook
   - Transaction updates from `useTransactions` hook

2. **Snapshot Building**
   - `useWidgetSync` hook observes these changes
   - Calls `buildWidgetSnapshotFromState()` to create snapshot
   - Respects `isWidgetsEnabled` and `hideWidgetAmounts` settings

3. **Writing to Shared Storage**
   - `writeWidgetSnapshot()` serializes to JSON
   - Writes to App Group UserDefaults via `react-native-home-widget`
   - Calls `reloadTimelines()` to refresh widgets

4. **Widget Reads Data**
   - `WidgetDataLoader.loadSnapshot()` reads from UserDefaults
   - Decodes JSON into Swift structs
   - Widget views display the data

## Privacy Settings

Users can control widgets via **Settings > Widgets**:

- **Enable widgets**: When disabled, widgets show "No data"
- **Hide amounts**: When enabled, balances/amounts show "Hidden"

These settings are respected in `buildWidgetSnapshotFromState()`.

## Deep Links

| Widget | URL | Opens |
|--------|-----|-------|
| Price | `alby://` | Home screen |
| Balance | `alby://` | Home screen |
| Last Transaction | `alby://transactions` | Transaction history |

## Troubleshooting

### Widgets Show "No Data"

1. **Open the app** - Widgets need the app to write data first
2. **Check App Group** - Ensure both targets use `group.com.getalby.mobile.nse`
3. **Check Settings** - Verify widgets are enabled in Settings > Widgets

### Widgets Don't Refresh

- Widgets refresh on a timeline (every 15 minutes by default)
- The app triggers `reloadTimelines()` when data changes
- Force refresh by removing and re-adding the widget

### Build Errors

- Ensure all Swift files are added to the **AlbyGoWidgets** target only
- Check that the widget extension's deployment target matches the main app
- Verify the App Group identifier is exactly `group.com.getalby.mobile.nse`

## Future Android Support

The JavaScript data layer (`lib/widgets.ts`) is designed to support Android widgets:

- Same `WidgetSnapshot` type
- Same `writeWidgetSnapshot()` function (platform-aware)
- Android implementation would read from SharedPreferences

To add Android widgets:
1. Create Android widget XML layouts
2. Create Kotlin/Java widget providers
3. Read from the shared preferences key `alby_widget_snapshot`
4. Parse the same JSON format


