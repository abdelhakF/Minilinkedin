package com.minilinkedin.mini_linkedin.dto;

import java.util.List;
import java.util.Map;

public record DashboardStatsDTO(
    long totalUsers,
    long totalPosts,
    long totalTeachers,
    long pendingTeachers,
    long pendingSignalements,
    long newUsersLast7Days,
    long postsLast7Days,
    Map<String, Long> usersByRole,
    List<DailyCount> usersTimeSeries,
    List<DailyCount> postsTimeSeries
) {
    public record DailyCount(String date, long count) {}
}
