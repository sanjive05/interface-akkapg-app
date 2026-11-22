package com.pgmanagement.config;

public final class PgContext {
    private static final ThreadLocal<String> CURRENT = ThreadLocal.withInitial(() -> "AKKA-PG");
    private PgContext() {}
    public static String get() { return CURRENT.get(); }
    public static void set(String code) { CURRENT.set(code); }
    public static void clear() { CURRENT.remove(); }
}
