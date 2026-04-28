#!/bin/sh
# Converte DATABASE_URL (formato postgres://user:pass@host:port/db?params do Fly/Heroku)
# para os env vars que o Spring entende (SPRING_DATASOURCE_URL etc), preservando query string.

if [ -n "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  proto_removed="${DATABASE_URL#postgres*://}"
  user_pass="${proto_removed%%@*}"
  host_db="${proto_removed#*@}"

  user="${user_pass%%:*}"
  pass="${user_pass#*:}"
  host_port="${host_db%%/*}"
  db_with_query="${host_db#*/}"

  case "$db_with_query" in
    *\?*)
      db="${db_with_query%%\?*}"
      query="?${db_with_query#*\?}"
      ;;
    *)
      db="$db_with_query"
      query=""
      ;;
  esac

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${host_port}/${db}${query}"
  export SPRING_DATASOURCE_USERNAME="$user"
  export SPRING_DATASOURCE_PASSWORD="$pass"
fi

exec java -jar /app/app.jar
