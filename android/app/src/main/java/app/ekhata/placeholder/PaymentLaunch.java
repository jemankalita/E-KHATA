package app.ekhata.placeholder;

import android.net.Uri;

final class PaymentLaunch {
    private PaymentLaunch() {}

    static boolean isExternalPaymentUrl(Uri url) {
        if (url == null) {
            return false;
        }
        String scheme = url.getScheme();
        if (scheme == null) {
            return false;
        }
        switch (scheme.toLowerCase()) {
            case "upi":
            case "tez":
            case "gpay":
            case "phonepe":
            case "paytmmp":
            case "bhim":
            case "intent":
                return true;
            default:
                return false;
        }
    }
}
