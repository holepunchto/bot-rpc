/**
* @typedef {(data: string, reply: function(string)) => Promise<void>} Handler
*/
const goodbye = require('graceful-goodbye')
const ReadyResource = require('ready-resource')
const HyperDHT = require('hyperdht')
const HypercoreId = require('hypercore-id-encoding')

class BotRpc extends ReadyResource {
  /**
   * @param {{
   *  seed?: string,
   *  firewall?: (remotePublicKey: string, remotePayload: string, clientAddress: string) => boolean,
   *  logger?: {
   *    error: (...args: any[]) => void,
   *    warn: (...args: any[]) => void,
   *    info: (...args: any[]) => void,
   *    debug: (...args: any[]) => void
   *  }
   * }} options
   */
  constructor ({
    seed,
    firewall,
    logger
  }) {
    super()
    this.logger = logger || console
    this.handlers = []

    const dht = new HyperDHT({ seed: seed && HypercoreId.decode(seed) })
    goodbye(() => dht.destroy())

    const server = dht.createServer({ firewall }, (socket) => {
      socket.setKeepAlive(5000)
      socket.on('error', (err) => logger.error('Connection failed with', err))
      socket.once('data', async (buffer) => {
        await Promise.all(this.handlers.map(
          /** @param {Handler} handler */
          (handler) => handler(buffer.toString(), (msg) => socket.write(msg))
            .catch((err) => {
              logger.error('Failed to handle socket data', err)
              socket.write(`\nFailed with: ${err}`)
            })
        ))
        socket.end()
      })
    })
    goodbye(() => server.close())
    this.server = server
  }

  async _open () {
    await this.server.listen()
    this.logger.info('Server running on', this.server.address().publicKey.toString('hex'))
  }

  async _close () {
    this.logger.info('Shutting down...')
    goodbye.exit()
  }

  /** @param {Handler} handler */
  addHandler (handler) {
    this.handlers.push(handler)
  }
}

module.exports = BotRpc
