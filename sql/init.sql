DELETE FROM tenant WHERE id > 100;
DELETE FROM visit_history WHERE created_at >= '1654041600';
UPDATE id_generator SET id=2678400000 WHERE stub='a';
ALTER TABLE id_generator AUTO_INCREMENT=2678400000;

DELETE FROM competition WHERE created_at >= '1654041600';
DELETE FROM player WHERE created_at >= '1654041600';
DELETE FROM player_score WHERE created_at >= '1654041600';

-- 時間がかかるので別で実行済み
-- ALTER TABLE visit_history ADD INDEX tenant_competition_player_idx (tenant_id, competition_id, player_id);
