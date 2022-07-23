import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import Redis from 'ioredis'
import { Database } from 'sqlite'

const KEY = 'player-score'

function getCompetitionKey(competitionId: string) {
  return `${KEY}-${competitionId}`
}

function getMemberId(playerId: string, competitionId: string) {
  return `${playerId}-${competitionId}`
}

export async function initScore(redis: Redis) {
  console.log(new Date())
  const file = '/home/isucon/webapp/sql/player_score.csv'
  const lines = await readFile(file, 'utf-8')
  console.log(new Date())

  // tenant_id,competition_id,player_id,score
  const records = parse(lines)
  console.log(records[0])
  console.log(records[1])

  console.log(new Date())

  const competitionIds: string[] = []
  const scores: { [competitionId: string]: { score: number; playerId: string }[] } = {}

  for (const record of records) {
    const [_, competitionId, playerId, score] = record
    if (!scores[competitionId]) {
      scores[competitionId] = []
      competitionIds.push(competitionId)
    }
    scores[competitionId].push({
      score: Number.parseInt(score),
      playerId,
    })
  }

  console.log(new Date())
  console.log(competitionIds.length)

  for (const competitionId of competitionIds) {
    const diff = 10000
    for (let i = 0; i < scores[competitionId].length; i += diff) {
      const x = scores[competitionId].slice(i, i + diff)
      console.log(competitionId, scores[competitionId].length, i, x.length)
      await addScore(redis, competitionId, x)
    }
  }
}

// ある大会のすべてのプレイヤーの情報を削除する
export async function resetCompetition(
  redis: Redis,
  tenantDB: Database,
  tenantId: number,
  competitionId: string
): Promise<void> {
  const scoredPlayerIds = await tenantDB.all<{ player_id: string }[]>(
    'SELECT DISTINCT(player_id) FROM player_score WHERE tenant_id = ? AND competition_id = ?',
    tenantId,
    competitionId
  )

  if (scoredPlayerIds.length === 0){
    return;
  }
  
  const members1 = scoredPlayerIds.map((player) => getMemberId(player.player_id, competitionId))
  await redis.zrem(KEY, ...members1)

  const members2 = scoredPlayerIds.map((player) => player.player_id);
  const key = getCompetitionKey(competitionId)
  await redis.zrem(key, ...members2)
}

// ある大会にプレイヤーのスコアを登録する
// competitionId はテナントをまたいで一意なはずなので省略できる
export async function addScore(
  redis: Redis,
  competitionId: string,
  playersScore: { playerId: string; score: number }[]
): Promise<void> {
  const scoreMembers = playersScore.map(({ playerId, score }) => [score, getMemberId(playerId, competitionId)]).flat()
  await redis.zadd(KEY, ...scoreMembers)

  const key = getCompetitionKey(competitionId)
  await redis.zadd(key, ...scoreMembers)
}

// あるプレイヤーのすべての大会のスコア一覧を取得する
export async function getScores(
  redis: Redis,
  tenantDB: Database,
  tenantId: number,
  playerId: string
): Promise<{ score: number; competitionId: string }[]> {
  const competitionIds = (
    await tenantDB.all<{ competition_id: string }[]>(
      'SELECT DISTINCT(competition_id) FROM player_score WHERE tenant_id = ? AND player_id = ?',
      tenantId,
      playerId
    )
  ).map((x) => x.competition_id)

  const scores: { score: number; competitionId: string }[] = []
  for (const competitionId of competitionIds) {
    const memberId = getMemberId(playerId, competitionId)
    const score = await redis.zscore(KEY, memberId)

    scores.push({ score: Number.parseInt(score), competitionId })
  }

  return scores
}

// ある大会でのランキングを返す
export async function getRankingForCompetition(
  redis: Redis,
  competitionId: string,
  rankAfter: number
): Promise<{ playerId: string; score: number }[]> {
  const key = getCompetitionKey(competitionId)

  const playerIds = await redis.zrevrange(key, rankAfter, rankAfter + 100)

  const ranking: { playerId: string; score: number }[] = []

  for (const playerId of playerIds) {
    const scoreStr = await redis.zscore(key, playerId)
    ranking.push({ score: Number.parseInt(scoreStr), playerId })
  }

  return ranking
}
