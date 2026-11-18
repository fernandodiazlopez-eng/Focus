package com.focus.antiscroll;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

final class FocusState {
    private static final long WINDOW = 900_000L;
    private static final long PAUSE = 7_200_000L;

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences("focus_rules", Context.MODE_PRIVATE);
    }

    static void put(JSONObject object, String key, Object value) {
        try {
            object.put(key, value);
        } catch (JSONException error) {
            throw new IllegalArgumentException(key, error);
        }
    }

    private static JSONObject parse(String json) {
        try {
            return new JSONObject(json);
        } catch (JSONException error) {
            return new JSONObject();
        }
    }

    static boolean hasAccessibilityConsent(Context context) {
        return prefs(context).getBoolean("accessibility_consent", false);
    }

    static void acceptAccessibilityDisclosure(Context context) {
        prefs(context).edit().putBoolean("accessibility_consent", true).apply();
    }

    static void saveConfig(Context context, String json) {
        prefs(context).edit().putString("config", parse(json).toString()).apply();
    }

    static JSONObject config(Context context) {
        return parse(prefs(context).getString("config", "{}"));
    }

    static boolean enabled(JSONObject config, long now) {
        String mode = config.optString("mode");
        boolean usesWait = "normal".equals(mode) || "no_scroll_normal".equals(mode);
        return "active".equals(config.optString("status")) &&
            (!usesWait || config.optLong("pendingDeactivateAt", Long.MAX_VALUE) > now);
    }

    private static JSONObject day(Context context, LocalDate date, long now) {
        String dateKey = date.toString();
        JSONObject stored = parse(prefs(context).getString("day", "{}"));
        boolean changed = !dateKey.equals(stored.optString("dateKey"));
        if (changed) {
            stored = new JSONObject();
            put(stored, "dateKey", dateKey);
            put(stored, "windowIndex", 1);
            put(stored, "usedByNetwork", new JSONObject());
        }
        long pause = stored.optLong("pauseEndsAt");
        if (pause > 0 && pause <= now) {
            changed = true;
            put(stored, "windowOpenedAt", pause);
            put(stored, "pauseEndsAt", 0);
            put(stored, "windowIndex", 2);
            put(stored, "windowUsed", 0);
        }
        if (changed) prefs(context).edit().putString("day", stored.toString()).apply();
        return stored;
    }

    static synchronized boolean consume(Context context, String network, long duration, long now) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate date = Instant.ofEpochMilli(now).atZone(zone).toLocalDate();
        JSONObject stored = day(context, date, now);
        long used = stored.optLong("windowUsed");
        if (stored.optLong("pauseEndsAt") > now || used >= WINDOW) return true;
        long availableFrom = Math.max(date.atStartOfDay(zone).toInstant().toEpochMilli(),
            stored.optLong("windowOpenedAt"));
        long charge = Math.min(Math.min(duration, now - availableFrom), WINDOW - used);
        if (charge <= 0) return false;

        put(stored, "windowUsed", used + charge);
        put(stored, "totalUsed", stored.optLong("totalUsed") + charge);
        JSONObject networks = stored.optJSONObject("usedByNetwork");
        put(networks, network, networks.optLong(network) + charge);
        if (used + charge == WINDOW && stored.optInt("windowIndex") == 1) {
            put(stored, "pauseEndsAt", now + PAUSE);
        }

        JSONObject history = parse(prefs(context).getString("history", "{}"));
        JSONObject snapshot = present(stored);
        JSONObject entry = new JSONObject();
        put(entry, "dateKey", snapshot.optString("dateKey"));
        put(entry, "totalScrollSeconds", snapshot.optLong("usedSecondsToday"));
        put(entry, "byNetwork", snapshot.optJSONObject("usedSecondsByNetwork"));
        put(history, entry.optString("dateKey"), entry);
        String cutoff = date.minusDays(29).toString();
        java.util.Iterator<String> dates = history.keys();
        while (dates.hasNext()) if (dates.next().compareTo(cutoff) < 0) dates.remove();
        prefs(context).edit().putString("day", stored.toString()).putString("history", history.toString()).apply();
        return used + charge == WINDOW;
    }

    private static JSONObject present(JSONObject stored) {
        JSONObject result = new JSONObject();
        put(result, "dateKey", stored.optString("dateKey"));
        put(result, "usedSecondsToday", stored.optLong("totalUsed") / 1000);
        put(result, "windowUsedSeconds", stored.optLong("windowUsed") / 1000);
        put(result, "windowIndex", stored.optInt("windowIndex", 1));
        long pause = stored.optLong("pauseEndsAt");
        put(result, "pauseEndsAt", pause > 0 ? pause : JSONObject.NULL);
        JSONObject seconds = new JSONObject();
        JSONObject networks = stored.optJSONObject("usedByNetwork");
        networks.keys().forEachRemaining(network -> put(seconds, network, networks.optLong(network) / 1000));
        put(result, "usedSecondsByNetwork", seconds);
        return result;
    }

    static synchronized JSONObject snapshot(Context context) {
        JSONObject result = new JSONObject();
        long now = System.currentTimeMillis();
        LocalDate date = Instant.ofEpochMilli(now).atZone(ZoneId.systemDefault()).toLocalDate();
        put(result, "daily", present(day(context, date, now)));
        put(result, "history", parse(prefs(context).getString("history", "{}")));
        return result;
    }
}
