package com.watanabe.karaokeserver.data.karaoke;

public enum MessageType {
    QUEUE_REFRESH,
    STATUS,
    PING,
    PONG,
    QUEUE_DELETED,
    TRACK_ADDED,
    TRACK_REMOVED,
    TRACK_PLAYED,
    PLAY_TRACK;
}
