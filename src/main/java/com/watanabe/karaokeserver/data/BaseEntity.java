package com.watanabe.karaokeserver.data;

public interface BaseEntity {
    public String get_id();
    public void set_id(String id);
    public int getVersion();
    void setVersion(int version);
}
