import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedisService {
  redis: Redis;
  redlock: Redlock;
  constructor() {
    this.redis = new Redis({
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      db: Number(process.env.REDIS_DB || 0)
    });

    this.redlock = new Redlock([this.redis], {
      driftFactor: 0.01,
      retryCount: 30,
      retryDelay: 300,
      retryJitter: 500,
      automaticExtensionThreshold: 500
    });
  }

  public async hget(hash: string, key: string): Promise<any> {
    return this.redis.hget(hash, key);
  }

  public async hgetall(key: string): Promise<any> {
    return this.redis.hgetall(key);
  }

  public async hlen(key: string): Promise<any> {
    return this.redis.hlen(key);
  }

  public async hset(key: string, value: object): Promise<any> {
    this.redis.hset(key, value);
  }

  public async pipeline(query: any) {
    return await this.redis.pipeline(query).exec();
  }
}
