package com.manuvya.shopfloor.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class IdGeneratorUtil {

    private static final AtomicInteger counter = new AtomicInteger(0);

    public static String generateTicketId() {
        return "TKT-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"))
                + "-" + String.format("%04d", counter.incrementAndGet());
    }

    public static String generateMachineId() {
        return "MCH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"))
                + "-" + String.format("%03d", counter.incrementAndGet());
    }

    public static String generateRequestCode(String prefix) {
        return prefix + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"))
                + "-" + String.format("%04d", counter.incrementAndGet());
    }
}
