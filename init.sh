#!/bin/sh

# サーバーを立ち上げたら一回だけ打ってもらうスクリプト by mizdra

set -ex
cd `dirname $0`

# テーブル作成
mysql -uisucon -pisucon -Disuports < renew-table.sql

for file in `ls ../../initial_data/*.db`; do
	./sqlite3-to-csv $file
	mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'competition.csv' replace into table competition fields terminated by ',';";
	mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player.csv' replace into table player fields terminated by ',';";
	mysql -uisucon -pisucon -Disuports --enable-local-infile -e"load data local infile 'player_score.csv' replace into table player_score fields terminated by ',';";
done
