package com.karaoke.backend.util;

import java.time.LocalTime;

public class TimeUtils {

    /**
     * Checks if two time ranges overlap.
     * Handles cases where the time range spans across midnight (start > end).
     */
    public static boolean isTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        if (start1.isAfter(end1)) {
            return isTimeOverlap(start1, LocalTime.MAX, start2, end2) || 
                   isTimeOverlap(LocalTime.MIN, end1, start2, end2);
        }
        if (start2.isAfter(end2)) {
            return isTimeOverlap(start1, end1, start2, LocalTime.MAX) || 
                   isTimeOverlap(start1, end1, LocalTime.MIN, end2);
        }
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
