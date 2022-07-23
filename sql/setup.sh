#!/bin/sh

# サーバーを立ち上げたら一回だけ打ってもらうスクリプト by mizdra

set -ex
cd `dirname $0`

# テーブル作成
mysql -uisucon -pisucon -Disuports < renew-table.sql

for file in `ls ../../initial_data/*.db`; do
	./sqlite3-to-csv $file
done

mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'competition.csv' into table competition fields terminated by ',' OPTIONALLY ENCLOSED BY '\"';";
mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player.csv' into table player fields terminated by ',' OPTIONALLY ENCLOSED BY '\"';";
mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player_score.csv' into table player_score fields terminated by ',' OPTIONALLY ENCLOSED BY '\"';";
