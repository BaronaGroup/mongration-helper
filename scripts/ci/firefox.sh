#!/bin/bash
set -e
cd $(dirname $0)/../..
./scripts/ci/init.sh
npm run selenium-test-firefox