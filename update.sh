#!/bin/bash
rm -rf node_modules package-lock.json && git pull && npm install && npm run build:full