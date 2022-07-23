#!/bin/sh

set -ex
cd `dirname $0`

ISUCON_DB_HOST=${ISUCON_DB_HOST:-127.0.0.1}
ISUCON_DB_PORT=${ISUCON_DB_PORT:-3306}
ISUCON_DB_USER=${ISUCON_DB_USER:-isucon}
ISUCON_DB_PASSWORD=${ISUCON_DB_PASSWORD:-isucon}
ISUCON_DB_NAME=${ISUCON_DB_NAME:-isuports}

# MySQLを初期化
mysql -u"$ISUCON_DB_USER" \
		-p"$ISUCON_DB_PASSWORD" \
		--host "$ISUCON_DB_HOST" \
		--port "$ISUCON_DB_PORT" \
		"$ISUCON_DB_NAME" < init.sql

rm competition.csv
rm player.csv
rm player_score.csv

for file in `ls ../../initial_data/*.db`; do
		./sqlite3-to-csv $file
done

mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'competition.csv' into table competition fields terminated by ',';";
mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player.csv' into table player fields terminated by ',';";
mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player_score.csv' into table player_score fields terminated by ',';";

# SQLiteのデータベースを初期化
# rm -f ../tenant_db/*.db
# cp -r ../../initial_data/*.db ../tenant_db/

# マイグレーション
# for file in `ls ../tenant_db/*.db`; do
# 		echo "migration ${file}"
# 		sqlite3 $file < tenant/migration.sql
# done
