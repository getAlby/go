import WidgetKit
import SwiftUI

@main
struct AlbyGoWidgetBundle: WidgetBundle {
    var body: some Widget {
        PriceWidget()
        BalanceWidget()
        LastTransactionWidget()
    }
}
