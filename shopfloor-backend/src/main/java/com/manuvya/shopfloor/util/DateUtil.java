package com.manuvya.shopfloor.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private static final DateTimeFormatter DATE_ONLY =
            DateTimeFormatter.ofPattern("dd-MM-yyyy");

    public static String toDisplayString(LocalDateTime dt) {
        return dt != null ? dt.format(DISPLAY_FORMATTER) : "";
    }

    public static String todayDisplay() {
        return LocalDateTime.now().format(DATE_ONLY);
    }
}
