package com.focus.antiscroll;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.TextView;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.app.KeyguardManager;
import android.telecom.TelecomManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.time.ZonedDateTime;
import java.time.LocalTime;

public final class FocusService extends AccessibilityService {
    private static final String INSTAGRAM = "com.instagram.android";
    private static final String TIKTOK = "com.zhiliaoapp.musically";
    private static final String TIKTOK_ALT = "com.ss.android.ugc.trill";
    private static final String YOUTUBE = "com.google.android.youtube";
    private static final String[] DAYS = {"L", "M", "X", "J", "V", "S", "D"};
    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastCheck;
    private String lastFeed = "";
    private long lastIntervention;
    private long lastYouTubeRedirect = -3000;
    private long lastHomeScrollCorrection;
    private long followingMenuOpenedAt = -1;
    private long lastInstagramThread = -1;
    private long sharedReelOpenedAt = -1;
    private boolean instagramThreadVisible;
    private long lastInstagramExplore = -1;
    private boolean exploreReelOpen;
    private TextView exploreShield;
    private final Rect exploreShieldBounds = new Rect();
    private boolean sharedReelAdvanced;
    private final Runnable tick = new Runnable() {
        @Override public void run() {
            check();
            handler.postDelayed(this, 500);
        }
    };

    @Override protected void onServiceConnected() {
        handler.removeCallbacks(tick);
        handler.post(tick);
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event) {
        int type = event.getEventType();
        if ((type == AccessibilityEvent.TYPE_VIEW_CLICKED || type == AccessibilityEvent.TYPE_VIEW_LONG_CLICKED) &&
            INSTAGRAM.equals(String.valueOf(event.getPackageName())) && FocusState.hasAccessibilityConsent(this)) {
            AccessibilityNodeInfo source = event.getSource();
            if (isInstagramDirectNode(source) || (instagramThreadVisible && source == null)) {
                lastInstagramThread = SystemClock.elapsedRealtime();
                lastInstagramExplore = -1;
                exploreReelOpen = false;
            } else if (type == AccessibilityEvent.TYPE_VIEW_LONG_CLICKED && isInstagramExploreVideo(source) &&
                FocusState.enabled(FocusState.config(this), System.currentTimeMillis())) {
                lastInstagramExplore = SystemClock.elapsedRealtime();
                performGlobalAction(GLOBAL_ACTION_BACK);
            }
        } else if (type == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            if (INSTAGRAM.contentEquals(String.valueOf(event.getPackageName())) && sharedReelOpenedAt >= 0 &&
                hasAdvancedSharedReel(event)) {
                sharedReelAdvanced = true;
                check();
            } else if (INSTAGRAM.equals(String.valueOf(event.getPackageName()))) {
                undoBlockedInstagramScroll(event);
            }
        } else if (type != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            check();
        }
    }

    @Override public void onInterrupt() {
        lastFeed = "";
    }

    @Override public void onDestroy() {
        handler.removeCallbacks(tick);
        hideExploreShield();
        super.onDestroy();
    }

    private void check() {
        long elapsed = SystemClock.elapsedRealtime();
        long duration = Math.min(750, elapsed - lastCheck);
        lastCheck = elapsed;
        String previousFeed = lastFeed;
        lastFeed = "";

        if (!FocusState.hasAccessibilityConsent(this) ||
            !getSystemService(PowerManager.class).isInteractive() ||
            getSystemService(KeyguardManager.class).isKeyguardLocked()) {
            hideExploreShield();
            return;
        }

        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null) {
            hideExploreShield();
            return;
        }
        String app = root.getPackageName().toString();
        JSONObject config = FocusState.config(this);
        long now = System.currentTimeMillis();
        updateExploreShield(root, app, FocusState.enabled(config, now));

        if (blocksApp(config.optJSONObject("appBlock"), app, now)) {
            intervene(elapsed, true, root, app, false);
            return;
        }

        if (!FocusState.enabled(config, now)) {
            resetSharedReel();
            return;
        }
        boolean instagramReel = INSTAGRAM.equals(app) && visibleId(root, app,
            "reel_viewer_root", "clips_viewer_view_pager", "clips_viewer_container");
        if (INSTAGRAM.equals(app) && blockInstagramExploreReel(root, instagramReel, elapsed)) return;
        if (allowSharedReel(root, app, instagramReel, elapsed)) return;
        if (instagramReel && sharedReelAdvanced) {
            intervene(elapsed, false, root, app, true);
            return;
        }
        if (INSTAGRAM.equals(app) && !instagramReel && !instagramThreadVisible) {
            if (followingMenuOpenedAt >= 0 && elapsed - followingMenuOpenedAt < 1800 &&
                clickNamedTab(root, "Following", "Siguiendo")) {
                followingMenuOpenedAt = -1;
                return;
            }
            if (isInstagramHome(root)) return;
        }
        String network = detectedFeed(root, app, instagramReel);
        if (network == null) return;
        String mode = config.optString("mode");
        if ("no_scroll".equals(mode) || "no_scroll_normal".equals(mode)) {
            intervene(elapsed, false, root, app, instagramReel);
            return;
        }
        lastFeed = app;
        if (FocusState.consume(this, network, app.equals(previousFeed) ? duration : 0, now)) {
            lastFeed = "";
            intervene(elapsed, false, root, app, instagramReel);
        }
    }

    private void intervene(long elapsed, boolean fullBlock, AccessibilityNodeInfo root, String app, boolean instagramReel) {

        if (elapsed - lastIntervention < 700) return;
        lastIntervention = elapsed;
        if (fullBlock) {
            performGlobalAction(GLOBAL_ACTION_HOME);
        } else if (YOUTUBE.equals(app)) {
            if (!leaveYouTubeFeed(root, elapsed)) return;
        } else if (INSTAGRAM.equals(app) && !instagramReel) {
            return;
        } else if ((TIKTOK.equals(app) || TIKTOK_ALT.equals(app)) &&
            clickNamedTab(root, "Profile", "Perfil", "Inbox", "Bandeja de entrada")) {
            // Stay inside TikTok so the user can switch to search or messages.
        } else if (!performGlobalAction(GLOBAL_ACTION_BACK)) {
            performGlobalAction(GLOBAL_ACTION_HOME);
        }
        Toast.makeText(this, fullBlock ? R.string.app_blocked : R.string.feed_blocked, Toast.LENGTH_SHORT).show();
    }

    private boolean leaveYouTubeFeed(AccessibilityNodeInfo root, long elapsed) {
        if (clickNamedTab(root, "Subscriptions", "Suscripciones")) return true;
        if (elapsed - lastYouTubeRedirect < 3000) return false;

        // Shorts may open without a navigation bar. Target only the installed YouTube
        // app, so Android cannot fall back to a browser or the launcher.
        lastYouTubeRedirect = elapsed;
        Intent subscriptions = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/feed/subscriptions"))
            .setPackage(YOUTUBE)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(subscriptions);
            return true;
        } catch (android.content.ActivityNotFoundException | SecurityException ignored) {
            return false;
        }
    }

    private String detectedFeed(AccessibilityNodeInfo root, String app, boolean instagramReel) {
        switch (app) {
            case INSTAGRAM:
                return instagramReel ? "Instagram" : null;
            case TIKTOK:
            case TIKTOK_ALT:
                return isTikTokFeed(root) ? "TikTok" : null;
            case YOUTUBE:
                boolean shorts = visibleId(root, app, "reel_watch_fragment_root",
                    "reel_watch_player", "reel_recycler", "reel_player_page_container");
                boolean home = visibleId(root, app, "browse_fragment", "browse_results") &&
                    !visibleId(root, app, "search_edit_text", "watch_player", "player_view") &&
                    hasSelectedLabel(root, "Home", "Inicio");
                return shorts || home ? "YouTube" : null;
            default:
                return null;
        }
    }

    private void updateExploreShield(AccessibilityNodeInfo root, String app, boolean enabled) {
        if (!enabled || !INSTAGRAM.equals(app)) {
            hideExploreShield();
            return;
        }
        Rect grid = visibleExploreLandingBounds(root);
        if (grid == null && !instagramSearchIsEditing(root) &&
            !visibleId(root, app, "search_results_list", "search_results_grid", "search_results_container",
                "reel_viewer_root", "clips_viewer_view_pager")) {
            grid = exploreGridBounds(root);
        }
        if (grid == null || grid.isEmpty()) {
            hideExploreShield();
            return;
        }
        if (exploreShield != null && exploreShieldBounds.equals(grid)) return;

        WindowManager windows = getSystemService(WindowManager.class);
        WindowManager.LayoutParams layout = new WindowManager.LayoutParams(grid.width(), grid.height(),
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.OPAQUE);
        layout.gravity = Gravity.TOP | Gravity.LEFT;
        layout.setTitle("Focus Instagram search shield");
        layout.x = grid.left;
        layout.y = grid.top;
        try {
            if (exploreShield == null) {
                TextView shield = new TextView(this);
                shield.setBackgroundColor(Color.rgb(16, 16, 16));
                shield.setTextColor(Color.WHITE);
                shield.setText(R.string.explore_search_only);
                shield.setGravity(Gravity.CENTER);
                shield.setOnTouchListener((view, event) -> true);
                windows.addView(shield, layout);
                exploreShield = shield;
            } else {
                windows.updateViewLayout(exploreShield, layout);
            }
            exploreShieldBounds.set(grid);
        } catch (WindowManager.BadTokenException | IllegalArgumentException ignored) {
            hideExploreShield();
        }
    }

    private boolean instagramSearchIsEditing(AccessibilityNodeInfo root) {
        for (String id : new String[]{"search_edit_text", "action_bar_search_edit_text"}) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByViewId(INSTAGRAM + ":id/" + id)) {
                if (node.isVisibleToUser() && node.isEditable()) return true;
            }
        }
        return false;
    }

    private Rect visibleInstagramBounds(AccessibilityNodeInfo root, String id, boolean selected) {
        for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByViewId(INSTAGRAM + ":id/" + id)) {
            if (!node.isVisibleToUser() || (selected && !node.isSelected())) continue;
            Rect bounds = new Rect();
            node.getBoundsInScreen(bounds);
            if (!bounds.isEmpty()) return bounds;
        }
        return null;
    }

    private Rect visibleExploreLandingBounds(AccessibilityNodeInfo root) {
        Rect searchTab = visibleInstagramBounds(root, "search_tab", true);
        Rect searchBar = visibleInstagramBounds(root, "explore_action_bar", false);
        if (searchTab != null && searchBar != null &&
            visibleId(root, INSTAGRAM, "grid_card_layout_container")) {
            Rect viewport = new Rect();
            root.getBoundsInScreen(viewport);
            return new Rect(viewport.left, searchBar.bottom, viewport.right, searchTab.top);
        }
        return null;
    }

    private Rect exploreGridBounds(AccessibilityNodeInfo root) {
        for (String id : new String[]{"explore_grid", "explore_grid_recycler_view", "explore_recycler_view",
            "explore_grid_view", "explore_recycler", "explore_feed_recycler_view"}) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByViewId(INSTAGRAM + ":id/" + id)) {
                if (!node.isVisibleToUser()) continue;
                Rect bounds = new Rect();
                node.getBoundsInScreen(bounds);
                if (!bounds.isEmpty()) return bounds;
            }
        }
        if (!hasSelectedLabel(root, "Search", "Buscar", "Explore", "Explorar")) return null;
        Rect viewport = new Rect();
        root.getBoundsInScreen(viewport);
        Rect candidate = new Rect();
        findExploreList(root, viewport, candidate, 0, new int[]{0});
        return candidate.isEmpty() ? null : candidate;
    }

    private void findExploreList(AccessibilityNodeInfo node, Rect viewport, Rect candidate,
                                 int depth, int[] visited) {
        if (node == null || depth > 24 || visited[0]++ >= 350 || !node.isVisibleToUser()) return;
        if (node.isScrollable()) {
            Rect item = new Rect();
            node.getBoundsInScreen(item);
            if (item.width() >= viewport.width() * 0.8 && item.height() >= viewport.height() * 0.35 &&
                item.top >= viewport.top && item.bottom < viewport.bottom &&
                item.height() > candidate.height()) candidate.set(item);
        }
        for (int index = 0; index < node.getChildCount() && visited[0] < 350; index++) {
            findExploreList(node.getChild(index), viewport, candidate, depth + 1, visited);
        }
    }

    private void hideExploreShield() {
        if (exploreShield == null) return;
        getSystemService(WindowManager.class).removeViewImmediate(exploreShield);
        exploreShield = null;
        exploreShieldBounds.setEmpty();
    }

    private boolean blockInstagramExploreReel(AccessibilityNodeInfo root, boolean reel, long elapsed) {
        boolean explore = visibleId(root, INSTAGRAM, "explore_grid", "explore_grid_recycler_view",
            "explore_recycler_view", "explore_fragment", "search_results_grid") ||
            hasSelectedLabel(root, "Search", "Buscar", "Explore", "Explorar");
        if (!reel && !explore && (isInstagramHome(root) ||
            hasInstagramDirectScreen(root, 0, new int[]{0}))) {
            lastInstagramExplore = -1;
            exploreReelOpen = false;
            return false;
        }
        if (!reel && explore) {
            lastInstagramExplore = elapsed;
            exploreReelOpen = false;
        }

        boolean preview = visibleId(root, INSTAGRAM, "explore_video_preview", "explore_reel_preview",
            "clips_preview_video", "video_preview_player") ||
            (visibleId(root, INSTAGRAM, "peek_view", "media_preview_container", "explore_media_preview") &&
                visibleId(root, INSTAGRAM, "video_player", "video_view", "clips_video_container"));
        boolean recentExplore = lastInstagramExplore >= 0 && elapsed - lastInstagramExplore <= 6000;
        if (reel && (explore || recentExplore)) exploreReelOpen = true;
        if (!(reel && exploreReelOpen) && !(preview && (explore || recentExplore))) return false;

        if (elapsed - lastIntervention >= 700) {
            lastIntervention = elapsed;
            performGlobalAction(GLOBAL_ACTION_BACK);
        }
        return true;
    }

    private boolean isInstagramExploreVideo(AccessibilityNodeInfo node) {
        boolean exploreTile = false;
        boolean video = false;
        for (int depth = 0; node != null && depth < 8; depth++, node = node.getParent()) {
            String id = String.valueOf(node.getViewIdResourceName()).toLowerCase(java.util.Locale.ROOT);
            String label = String.valueOf(node.getContentDescription()).toLowerCase(java.util.Locale.ROOT);
            exploreTile |= id.contains(":id/explore_") || id.contains(":id/search_results_grid");
            video |= id.contains("video") || id.contains("clips") || id.contains("reel") ||
                label.startsWith("reel") || label.startsWith("video") || label.startsWith("vídeo");
        }
        return exploreTile && video;
    }

    private boolean allowSharedReel(AccessibilityNodeInfo root, String app, boolean reel, long elapsed) {
        if (!INSTAGRAM.equals(app)) {
            resetSharedReel();
            return false;
        }
        if (!reel) {
            sharedReelOpenedAt = -1;
            sharedReelAdvanced = false;
            instagramThreadVisible = hasInstagramDirectScreen(root, 0, new int[]{0});
            if (instagramThreadVisible) {
                lastInstagramThread = elapsed;
            } else if (isInstagramHome(root)) {
                lastInstagramThread = -1;
            }
            return false;
        }
        instagramThreadVisible = false;
        boolean fromMessages = lastInstagramThread >= 0 && elapsed - lastInstagramThread <= 5000;
        boolean dedicatedReelsTab = hasSelectedLabel(root, "Reels", "Carretes");
        if (sharedReelOpenedAt < 0 && (fromMessages || !dedicatedReelsTab)) {
            sharedReelOpenedAt = elapsed;
            lastInstagramThread = -1;
        }
        return sharedReelOpenedAt >= 0 && !sharedReelAdvanced;
    }

    private void resetSharedReel() {
        lastInstagramExplore = -1;
        exploreReelOpen = false;
        instagramThreadVisible = false;
        lastInstagramThread = -1;
        sharedReelOpenedAt = -1;
        sharedReelAdvanced = false;
    }

    private boolean isInstagramHome(AccessibilityNodeInfo root) {
        return visibleId(root, INSTAGRAM, "feed_list", "feed_recycler_view", "home_feed_recycler_view") ||
            hasSelectedLabel(root, "Home", "Inicio");
    }

    private boolean hasInstagramDirectScreen(AccessibilityNodeInfo node, int depth, int[] visited) {
        if (node == null || depth > 32 || visited[0]++ >= 450 || !node.isVisibleToUser()) return false;
        if (isInstagramDirectId(node)) return true;
        for (int index = 0; index < node.getChildCount() && visited[0] < 450; index++) {
            if (hasInstagramDirectScreen(node.getChild(index), depth + 1, visited)) return true;
        }
        return false;
    }

    private boolean isInstagramDirectNode(AccessibilityNodeInfo node) {
        for (int depth = 0; node != null && depth < 12; depth++, node = node.getParent()) {
            if (isInstagramDirectId(node)) return true;
        }
        return false;
    }

    private boolean isInstagramDirectId(AccessibilityNodeInfo node) {
        String id = String.valueOf(node.getViewIdResourceName());
        return id.startsWith(INSTAGRAM + ":id/direct_thread") ||
            id.startsWith(INSTAGRAM + ":id/direct_message") ||
            id.startsWith(INSTAGRAM + ":id/direct_text_message") ||
            id.startsWith(INSTAGRAM + ":id/direct_row");
    }

    private boolean hasAdvancedSharedReel(AccessibilityEvent event) {
        if (SystemClock.elapsedRealtime() - sharedReelOpenedAt < 250) return false;
        AccessibilityNodeInfo source = event.getSource();
        for (int depth = 0; source != null && depth < 10; depth++, source = source.getParent()) {
            if (isReelPager(source)) {
                return (android.os.Build.VERSION.SDK_INT >= 28 && event.getScrollDeltaY() != 0) ||
                    event.getFromIndex() > 0 || event.getToIndex() > 0 ||
                    event.getScrollY() > 0;
            }
        }
        AccessibilityNodeInfo root = getRootInActiveWindow();
        return android.os.Build.VERSION.SDK_INT >= 28 && event.getScrollDeltaY() > 0 && root != null &&
            INSTAGRAM.equals(String.valueOf(root.getPackageName())) &&
            visibleId(root, INSTAGRAM, "clips_viewer_view_pager", "clips_viewer_container", "reel_viewer_root") &&
            hasLabel(root, false, "Send to a friend", "Enviar a un amigo");
    }

    private boolean isReelPager(AccessibilityNodeInfo node) {
        if (node == null) return false;
        String id = String.valueOf(node.getViewIdResourceName());
        String role = String.valueOf(node.getClassName());
        return id.endsWith(":id/clips_viewer_view_pager") || id.endsWith(":id/clips_viewer_container") ||
            role.endsWith("ViewPager") || role.endsWith("ViewPager2");
    }

    private void undoBlockedInstagramScroll(AccessibilityEvent event) {
        if (!FocusState.hasAccessibilityConsent(this) ||
            !getSystemService(PowerManager.class).isInteractive() ||
            getSystemService(KeyguardManager.class).isKeyguardLocked() ||
            !FocusState.enabled(FocusState.config(this), System.currentTimeMillis())) return;

        long elapsed = SystemClock.elapsedRealtime();
        if (elapsed - lastHomeScrollCorrection < 250 ||
            (android.os.Build.VERSION.SDK_INT >= 28 &&
                (event.getScrollDeltaY() < 0 || (event.getScrollDeltaY() == 0 && event.getScrollDeltaX() != 0)))) return;

        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || !INSTAGRAM.equals(String.valueOf(root.getPackageName())) ||
            !isInstagramHome(root) || instagramThreadVisible ||
            visibleId(root, INSTAGRAM, "reel_viewer_root", "clips_viewer_view_pager", "clips_viewer_container",
                "reel_viewer", "story_viewer", "reel_viewer_container", "following_feed_recycler_view",
                "chronological_feed_recycler_view")) return;

        AccessibilityNodeInfo source = event.getSource();
        AccessibilityNodeInfo feed = null;
        for (int depth = 0; source != null && depth < 12; depth++, source = source.getParent()) {
            String id = String.valueOf(source.getViewIdResourceName());
            if (id.equals(INSTAGRAM + ":id/feed_list") || id.equals(INSTAGRAM + ":id/feed_recycler_view") ||
                id.equals(INSTAGRAM + ":id/home_feed_recycler_view")) {
                feed = source;
                break;
            }
        }

        // Some Instagram builds report an internal list ID. Use the event source only
        // when the Home tab is selected and the event belongs to a vertical scroll.
        if (feed == null && hasSelectedLabel(root, "Home", "Inicio") &&
            android.os.Build.VERSION.SDK_INT >= 28 && event.getScrollDeltaY() > 0) {
            source = event.getSource();
            if (source != null && source.isScrollable()) feed = source;
        }
        if (feed == null) return;
        lastHomeScrollCorrection = elapsed;

        if (openInstagramFeedPicker(root)) {
            followingMenuOpenedAt = elapsed;
            handler.postDelayed(this::check, 150);
            return;
        }
        Bundle position = new Bundle();
        position.putInt(AccessibilityNodeInfo.ACTION_ARGUMENT_ROW_INT, 0);
        position.putInt(AccessibilityNodeInfo.ACTION_ARGUMENT_COLUMN_INT, 0);
        if (!feed.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_TO_POSITION.getId(), position)) {
            feed.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
        }
    }

    private boolean openInstagramFeedPicker(AccessibilityNodeInfo root) {
        for (String id : new String[]{"action_bar_instagram_logo", "action_bar_logo",
            "feed_navigation_dropdown", "action_bar_feed_type_selector"}) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByViewId(INSTAGRAM + ":id/" + id)) {
                AccessibilityNodeInfo parent = node.getParent();
                if (node.isVisibleToUser() && ((node.isClickable() && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) ||
                    (parent != null && parent.isClickable() && parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)))) return true;
            }
        }
        return clickNamedTab(root, "Instagram", "Feed options", "Opciones del feed");
    }

    private boolean clickNamedTab(AccessibilityNodeInfo root, String... labels) {
        for (String label : labels) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByText(label)) {
                if (!node.isVisibleToUser() ||
                    (!label.equalsIgnoreCase(String.valueOf(node.getText())) &&
                     !label.equalsIgnoreCase(String.valueOf(node.getContentDescription())))) continue;
                AccessibilityNodeInfo parent = node.getParent();
                if (node.isClickable() && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
                if (parent != null && parent.isClickable() &&
                    parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
            }
        }
        return false;
    }

    private boolean isTikTokFeed(AccessibilityNodeInfo root) {
        TikTokScreen screen = new TikTokScreen();
        screen.inspect(root);
        if (screen.otherTab || screen.editing) return false;

        // Feed headers and action buttons may be exposed as content descriptions,
        // and the selected tab can include additional accessibility text.
        return (screen.feedHeader && (screen.homeSelected || screen.videoAction || screen.verticalPager)) ||
            (screen.homeSelected && screen.verticalPager && screen.videoAction);
    }

    private static final class TikTokScreen {
        private static final int MAX_NODES = 500;
        boolean feedHeader;
        boolean homeSelected;
        boolean otherTab;
        boolean editing;
        boolean videoAction;
        boolean verticalPager;
        int inspected;

        void inspect(AccessibilityNodeInfo node) {
            if (inspected++ >= MAX_NODES || !node.isVisibleToUser()) return;
            CharSequence role = node.getClassName();
            editing |= node.isEditable() || "android.widget.EditText".contentEquals(String.valueOf(role));
            String roleName = String.valueOf(role);
            verticalPager |= roleName.endsWith("ViewPager") || roleName.endsWith("ViewPager2") ||
                node.getActionList().contains(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_DOWN) &&
                node.getActionList().contains(AccessibilityNodeInfo.AccessibilityAction.ACTION_PAGE_DOWN);

            AccessibilityNodeInfo parent = node.getParent();
            boolean selected = node.isSelected() || (parent != null && parent.isSelected());
            inspectLabel(node.getText(), selected);
            inspectLabel(node.getContentDescription(), selected);

            for (int index = 0; index < node.getChildCount() && inspected < MAX_NODES; index++) {
                AccessibilityNodeInfo child = node.getChild(index);
                if (child != null) inspect(child);
            }
        }

        private void inspectLabel(CharSequence text, boolean selected) {
            if (text == null) return;
            String label = text.toString().trim().toLowerCase(java.util.Locale.ROOT);
            int separator = label.indexOf(',');
            if (separator >= 0) label = label.substring(0, separator).trim();
            switch (label) {
                case "para ti": case "for you": case "siguiendo": case "following":
                    feedHeader = true;
                    break;
                case "inicio": case "home":
                    homeSelected |= selected;
                    break;
                case "bandeja de entrada": case "inbox": case "perfil": case "profile":
                case "buscar": case "search": case "tienda": case "shop":
                    otherTab |= selected;
                    break;
                case "compartir": case "share": case "comentarios": case "comments":
                case "me gusta": case "like":
                    videoAction = true;
                    break;
                default:
                    break;
            }
        }
    }

    private boolean visibleId(AccessibilityNodeInfo root, String app, String... ids) {
        for (String id : ids) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByViewId(app + ":id/" + id)) {
                if (node.isVisibleToUser()) return true;
            }
        }
        return false;
    }

    private boolean hasSelectedLabel(AccessibilityNodeInfo root, String... labels) {
        return hasLabel(root, true, labels);
    }

    private boolean hasLabel(AccessibilityNodeInfo root, boolean selected, String... labels) {
        for (String label : labels) {
            for (AccessibilityNodeInfo node : root.findAccessibilityNodeInfosByText(label)) {
                if (!node.isVisibleToUser()) continue;
                String title = String.valueOf(node.getText());
                String description = String.valueOf(node.getContentDescription());
                if (!label.equalsIgnoreCase(title) && !label.equalsIgnoreCase(description)) continue;
                AccessibilityNodeInfo parent = node.getParent();
                if (!selected || node.isSelected() || (parent != null && parent.isSelected())) return true;
            }
        }
        return false;
    }

    private boolean blocksApp(JSONObject block, String app, long now) {
        if (block == null || !block.optBoolean("enabled") || !isEligible(this, app)) return false;
        boolean selected = contains(block.optJSONArray("apps"), app);
        try {
            ApplicationInfo info = getPackageManager().getApplicationInfo(app, 0);
            selected = selected || contains(block.optJSONArray("apps"), info.loadLabel(getPackageManager()).toString())
                || contains(block.optJSONArray("categories"), category(info));
        } catch (android.content.pm.PackageManager.NameNotFoundException ignored) {
            return selected && activeRule(block, now);
        }
        return selected && activeRule(block, now);
    }

    private static boolean activeRule(JSONObject block, long now) {
        switch (block.optString("method")) {
            case "timer": return block.optLong("timerEndsAt") > now;
            case "password": return true;
            case "schedule":
                JSONArray days = block.optJSONArray("scheduleDays");
                ZonedDateTime date = ZonedDateTime.now();
                LocalTime time = date.toLocalTime();
                int weekday = date.getDayOfWeek().getValue() - 1;
                boolean today = contains(days, DAYS[weekday]);
                String from = block.optString("scheduleStart");
                String to = block.optString("scheduleEnd");
                boolean inside;
                try {
                    if (from.isEmpty() || to.isEmpty() || from.equals(to)) {
                        inside = today;
                    } else {
                        LocalTime start = LocalTime.parse(from);
                        LocalTime end = LocalTime.parse(to);
                        inside = end.isAfter(start)
                            ? today && !time.isBefore(start) && time.isBefore(end)
                            : (today && !time.isBefore(start)) ||
                                (contains(days, DAYS[(weekday + 6) % 7]) && time.isBefore(end));
                    }
                } catch (java.time.DateTimeException invalid) {
                    return false;
                }
                return block.optBoolean("scheduleAllowOnly") ? !inside : inside;
            default: return false;
        }
    }

    private static boolean contains(JSONArray items, String wanted) {
        if (items == null || wanted == null) return false;
        for (int index = 0; index < items.length(); index++) {
            if (wanted.equalsIgnoreCase(items.optString(index))) return true;
        }
        return false;
    }

    static String category(ApplicationInfo app) {
        switch (app.packageName) {
            case "com.android.chrome":
            case "org.mozilla.firefox":
            case "com.microsoft.emmx":
            case "com.sec.android.app.sbrowser": return "browsers";
            default:
                switch (app.category) {
                    case ApplicationInfo.CATEGORY_SOCIAL: return "social";
                    case ApplicationInfo.CATEGORY_VIDEO: return "video";
                    case ApplicationInfo.CATEGORY_GAME: return "games";
                    default: return null;
                }
        }
    }

    static boolean isEligible(Context context, String app) {
        if (context.getPackageName().equals(app) || app.equals("android") ||
            app.equals("com.android.settings") || app.equals("com.android.systemui")) return false;
        TelecomManager telecom = context.getSystemService(TelecomManager.class);
        if (telecom != null && (app.equals(telecom.getDefaultDialerPackage()) ||
            app.equals(telecom.getSystemDialerPackage()))) return false;
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
        ResolveInfo launcher = context.getPackageManager().resolveActivity(home, 0);
        return launcher == null || !app.equals(launcher.activityInfo.packageName);
    }
}
