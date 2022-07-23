#!/bin/sh

# サーバーを立ち上げたら毎回打ってもらうスクリプト by mizdra

set -ex
cd `dirname $0`

# sqlite3 のデータを mysql に移す
webapp/sql/sqlite3-to-sql webapp/tenant_db/1.db > data-from-sqlite3.sql
mysql -uisucon -pisucon -Disuports < data-from-sqlite3.sql
