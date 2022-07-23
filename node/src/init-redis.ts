import Redis from 'ioredis'
import { initScore } from './player-score'

const redis = new Redis()

/**
 * コンテナで `time yarn ts-node --transpile-only src/init-redis.ts` をしてから
 * ホストマシンで redis-cli save する
 * その後 sudo mv /var/lib/redis/dump.rdb /home/isucon/webapp/sql/redis-dump.rdb
 */
// 


async function main() {
  const start = new Date()
  await redis.flushall()
  await initScore(redis)
  const end = new Date()

  console.log(end.getTime() - start.getTime())
}

main()
