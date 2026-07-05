package com.transportai.backend.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private final Map<String, Deque<Instant>> buckets = new ConcurrentHashMap<>();

    public void check(String key, int maxRequests, Duration window) {
        Instant now = Instant.now();
        Deque<Instant> bucket = buckets.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (bucket) {
            while (!bucket.isEmpty() && bucket.peekFirst().isBefore(now.minus(window))) {
                bucket.removeFirst();
            }
            if (bucket.size() >= maxRequests) {
                throw new RuntimeException("Too many requests. Please try again later.");
            }
            bucket.addLast(now);
        }
    }
}
