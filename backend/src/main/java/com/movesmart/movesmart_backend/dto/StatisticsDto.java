package com.movesmart.movesmart_backend.dto;

public class StatisticsDto {
    private long total;
    private long reported;
    private long inProgress;
    private long resolved;
    private long criticalOrHighOpen;
    private int resolutionRate;

    public StatisticsDto() {}

    public StatisticsDto(long total, long reported, long inProgress, long resolved, long criticalOrHighOpen, int resolutionRate) {
        this.total = total;
        this.reported = reported;
        this.inProgress = inProgress;
        this.resolved = resolved;
        this.criticalOrHighOpen = criticalOrHighOpen;
        this.resolutionRate = resolutionRate;
    }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public long getReported() { return reported; }
    public void setReported(long reported) { this.reported = reported; }

    public long getInProgress() { return inProgress; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }

    public long getResolved() { return resolved; }
    public void setResolved(long resolved) { this.resolved = resolved; }

    public long getCriticalOrHighOpen() { return criticalOrHighOpen; }
    public void setCriticalOrHighOpen(long criticalOrHighOpen) { this.criticalOrHighOpen = criticalOrHighOpen; }

    public int getResolutionRate() { return resolutionRate; }
    public void setResolutionRate(int resolutionRate) { this.resolutionRate = resolutionRate; }
}
