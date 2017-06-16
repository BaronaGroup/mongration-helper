#!/bin/bash
set -e
npm prune
npm install
git submodule update --init