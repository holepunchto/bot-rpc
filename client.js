#!/usr/bin/env node

const goodbye = require('graceful-goodbye')
const HyperDHT = require('hyperdht')
const HypercoreId = require('hypercore-id-encoding')

function send ({ seed, remote, data, logger = console }) {
  const dht = new HyperDHT({ seed: seed && HypercoreId.decode(seed) })
  goodbye(() => dht.destroy())

  const socket = dht.connect(HypercoreId.decode(remote))
  goodbye(() => socket.end())

  socket.setKeepAlive(5000)
  socket.on('error', (err) => logger.error('Connection failed with', err))
  socket.on('end', () => {
    socket.end()
  })
  socket.on('close', () => {
    goodbye.exit()
  })
  socket.on('data', (data) => {
    process.stdout.write(data)
  })

  socket.write(JSON.stringify(data))
}

module.exports = send
