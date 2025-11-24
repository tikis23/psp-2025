#!/usr/bin/env bash

(cd db && docker compose up -d)

(cd sdp && mvn spring-boot:run &)

(cd sdp-frontend && npm run dev)
