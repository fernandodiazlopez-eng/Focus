package com.focus.antiscroll;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public final class MainActivity extends Activity {
    private static final String HOST = "focus.android.local";
    private WebView web;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setBackgroundColor(Color.BLACK);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.addJavascriptInterface(new Bridge(), "FocusNativeBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }

            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (!"https".equals(url.getScheme()) || !HOST.equals(url.getHost())) {
                    return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
                }
                String path = url.getPath();
                if (path == null || path.contains("..")) return null;
                String asset = "/".equals(path) ? "index.html" : path.substring(1);
                String mime = android.webkit.MimeTypeMap.getSingleton()
                    .getMimeTypeFromExtension(asset.substring(asset.lastIndexOf('.') + 1));
                if (asset.endsWith(".js")) mime = "text/javascript";
                try {
                    return new WebResourceResponse(mime == null ? "application/octet-stream" : mime,
                        "UTF-8", getAssets().open(asset));
                } catch (IOException error) {
                    return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
                }
            }
        });
        FrameLayout content = new FrameLayout(this);
        content.setBackgroundColor(Color.BLACK);
        content.addView(web, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            content.setOnApplyWindowInsetsListener((view, insets) -> {
                int systemArea = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                android.graphics.Insets safe = insets.getInsets(systemArea);
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return new WindowInsets.Builder(insets)
                    .setDisplayCutout(null)
                    .setInsets(systemArea, android.graphics.Insets.NONE)
                    .build();
            });
        }
        setContentView(content);
        content.requestApplyInsets();
        web.loadUrl("https://" + HOST + "/");
    }

    @Override protected void onDestroy() {
        web.removeJavascriptInterface("FocusNativeBridge");
        web.destroy();
        super.onDestroy();
    }

    private void openAccessibilitySettings() {
        if (FocusState.hasAccessibilityConsent(this)) {
            startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
            return;
        }
        new AlertDialog.Builder(this)
            .setTitle(R.string.accessibility_disclosure_title)
            .setMessage(R.string.accessibility_disclosure_message)
            .setNegativeButton(R.string.accessibility_not_now, null)
            .setPositiveButton(R.string.accessibility_accept, (dialog, button) -> {
                FocusState.acceptAccessibilityDisclosure(this);
                startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
            })
            .show();
    }

    final class Bridge {
        @JavascriptInterface public void syncConfig(String config) {
            FocusState.saveConfig(MainActivity.this, config);
        }

        @JavascriptInterface public String getSnapshot() {
            return FocusState.snapshot(MainActivity.this).toString();
        }

        @JavascriptInterface public String getPermissionsStatus() {
            String enabled = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            String component = new ComponentName(MainActivity.this, FocusService.class).flattenToShortString();
            boolean accessibility = FocusState.hasAccessibilityConsent(MainActivity.this) && enabled != null && java.util.Arrays.stream(enabled.split(":"))
                .map(ComponentName::unflattenFromString)
                .anyMatch(name -> name != null && component.equals(name.flattenToShortString()));
            return "{\"accessibility\":" + accessibility + ",\"usageStats\":false,\"overlay\":false,\"deviceAdmin\":false}";
        }

        @JavascriptInterface public void requestPermission(String permission) {
            if ("accessibility".equals(permission)) {
                runOnUiThread(MainActivity.this::openAccessibilitySettings);
            }
        }

        @JavascriptInterface public String getInstalledApps() {
            JSONArray apps = new JSONArray();
            Set<String> listed = new HashSet<>();
            Intent launcher = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
            for (ResolveInfo entry : getPackageManager().queryIntentActivities(launcher, 0)) {
                ApplicationInfo info = entry.activityInfo.applicationInfo;
                if (!FocusService.isEligible(MainActivity.this, info.packageName) || !listed.add(info.packageName)) continue;
                JSONObject app = new JSONObject();
                FocusState.put(app, "packageName", info.packageName);
                FocusState.put(app, "label", entry.loadLabel(getPackageManager()).toString());
                FocusState.put(app, "category", FocusService.category(info));
                apps.put(app);
            }
            return apps.toString();
        }
    }
}
