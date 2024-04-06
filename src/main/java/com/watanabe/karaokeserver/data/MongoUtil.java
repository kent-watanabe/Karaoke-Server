package com.watanabe.karaokeserver.data;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

public class MongoUtil {

    public static MongoClient getMongoClient(String url) {
        return MongoClients.create(url);
    }

}
