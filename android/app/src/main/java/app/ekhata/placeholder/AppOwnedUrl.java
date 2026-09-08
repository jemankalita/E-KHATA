package app.ekhata.placeholder;

import android.net.Uri;

final class AppOwnedUrl {
    private static final String HOSTED_WEB_HOST = "ekhata-gamma.vercel.app";
    private static final String NATIVE_ORIGIN = "https://localhost";

    private AppOwnedUrl() {}

    static String rewriteHostedAppUrl(Uri url) {
        if (url == null) {
            return null;
        }
        String host = url.getHost();
        if (host == null || !HOSTED_WEB_HOST.equalsIgnoreCase(host)) {
            return null;
        }
        String path = url.getPath();
        if (path != null && (path.equals("/api") || path.startsWith("/api/"))) {
            return null;
        }
        Uri.Builder builder = Uri.parse(NATIVE_ORIGIN).buildUpon().encodedPath(path == null ? "/" : path);
        String query = url.getEncodedQuery();
        if (query != null && !query.isEmpty()) {
            builder.encodedQuery(query);
        }
        String fragment = url.getEncodedFragment();
        if (fragment != null && !fragment.isEmpty()) {
            builder.encodedFragment(fragment);
        }
        return builder.build().toString();
    }
}
