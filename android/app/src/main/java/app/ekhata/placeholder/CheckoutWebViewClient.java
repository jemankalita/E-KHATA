package app.ekhata.placeholder;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

public class CheckoutWebViewClient extends BridgeWebViewClient {
    public CheckoutWebViewClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request != null ? request.getUrl() : null;
        if (PaymentLaunch.isExternalPaymentUrl(url)) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, url);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                view.getContext().startActivity(intent);
            } catch (ActivityNotFoundException ignored) {
                // Keep checkout in the WebView when no UPI app is installed.
            }
            return true;
        }
        String inApp = AppOwnedUrl.rewriteHostedAppUrl(url);
        if (inApp != null) {
            view.loadUrl(inApp);
            return true;
        }
        return super.shouldOverrideUrlLoading(view, request);
    }
}
