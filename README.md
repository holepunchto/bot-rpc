# Bot Rpc
- Run bot as a rpc server

# Run
```js
const rpc = new BotRpc()
rpc.addHandler((data, reply) => {
  try {
    console.info('Received data:', data)
  } catch (err) {
    console.error('Failed with:', err)
    reply(`\nFailed with: ${err}`)
  }
})
```
