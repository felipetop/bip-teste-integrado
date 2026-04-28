#!/bin/sh
# Converte DATABASE_URL (formato postgres://user:pass@host:port/db do Fly/Heroku)
# para os env vars que o Spring entende (SPRING_DATASOURCE_URL etc).

if [ -n "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  proto_removed="${DATABASE_URL#postgres*://}"
  user_pass="${proto_removed%%@*}"
  host_db="${proto_removed#*@}"

  user="${user_pass%%:*}"
  pass="${user_pass#*:}"
  host_port="${host_db%%/*}"
  db_with_query="${host_db#*/}"
  db="${db_with_query%%\?*}"

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${host_port}/${db}"
  export SPRING_DATASOURCE_USERNAME="$user"
  export SPRING_DATASOURCE_PASSWORD="$pass"
fi

exec java -jar /app/app.jar
