# Bot Rpc
- Run bot as a rpc server

# Run
```js
// server.js
const rpc = new BotRpc()
rpc.addHandler((data, reply) => {
  try {
    console.info('Received data:', data)
  } catch (err) {
    console.error('Failed with:', err)
    reply(`\nFailed with: ${err}`)
  }
})

// client.js
send({ remote: '<rpc-public-key>', data: { hello: 'world' } })
```
