#!/usr/bin/env bash
set -e

cd /home/ubuntu/EDI-Chatbot/frontend

npm run build

sudo rm -rf /var/www/edi-frontend/*
sudo cp -r dist/* /var/www/edi-frontend/

echo "Frontend deployed ✅"
