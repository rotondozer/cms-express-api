#!/bin/sh

API="http://localhost:4741"
URL_PATH="/posts"

curl "${API}${URL_PATH}/${USER_ID}/my_posts" \
  --include \
  --request GET \
  --header "Authorization: Token token=$TOKEN"

echo
