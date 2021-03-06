const got = require('got')
const fs = require('fs')
const path = require('path')
const exists = require('path-exists').sync
const packageNames = require('.').map(p => p.name)
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(1, 1000)

function getDownloadCount(pkg, callback) {
  const url = `https://api.npmjs.org/downloads/point/last-month/${pkg}`
  got(url)
    .then(result => { callback(null, JSON.parse(result.body).downloads) })
    .catch(error => { callback(error) })
}

packageNames
  .filter(name => !exists(path.join(__dirname, `./downloads/${name}.json`)))
  .forEach(name => {
    limiter.removeTokens(1, function() {
      getDownloadCount(name, function(err, count) {
        console.log(`${name}: ${count}`)
        fs.writeFileSync(path.join(__dirname, `./downloads/${name}.json`), String(count))
      })
  })
})
