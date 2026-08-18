#!/bin/bash

STREAM_NAME=$1

cp template-stream.ttl $STREAM_NAME-stream.ttl
cp template-by-page.ttl $STREAM_NAME-by-page.ttl
cp template-by-time.ttl $STREAM_NAME-by-time.ttl


perl -i -pe "s|resultaat|$STREAM_NAME|g;" $STREAM_NAME-stream.ttl
perl -i -pe "s|resultaat|$STREAM_NAME|g;" $STREAM_NAME-by-page.ttl
perl -i -pe "s|resultaat|$STREAM_NAME|g;" $STREAM_NAME-by-time.ttl
