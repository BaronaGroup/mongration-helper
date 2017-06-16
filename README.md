Jelpp
=======
# Monitoring, health check endpoint, application logs
- Health check endpoint is available at `/api/util/health`.

# Environments
- Local: https://localhost:3800/

# Continuous Integration
- http://r2ci.intra.barona.fi:8080/job/jelpp-chrome/
- http://r2ci.intra.barona.fi:8080/job/jelpp-firefox/
- http://r2ci.intra.barona.fi:8080/job/jelpp-ie/
- http://r2ci.intra.barona.fi:8080/job/jelpp-non-browser/

# ESLint
- npm run eslint

# Testing
- `npm run node-test` to run headless tests in /test/node/