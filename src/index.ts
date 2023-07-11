import { Context, Schema, h } from 'koishi'

export const name = 'mc-server-status'

export interface Config {
  IP: string
  icon: boolean
  version: boolean
  motd: boolean
}

export const Config: Schema<Config> = Schema.object({
  IP: Schema.string().description('If no IP is specified, this is the default IP will be used.'),
  icon: Schema.boolean().default(true).description('Whether to show the server icon.'),
  version: Schema.boolean().default(true).description('Whether to show the server version.'),
  motd: Schema.boolean().default(true).description('Whether to show the server motd.')
})

export function apply(ctx: Context, config: Config) {
  // register command /mcs then send message
  ctx.command('mcs <server>', 'Get the status of a Minecraft server', { authority: 0 })
    .action(async ({ session }, server) => {
      // if <server> is empty, then use ${config.IP} instead
      if (!server) {
        server = config.IP
      }
      const res = await fetch(`https://api.mcsrvstat.us/2/${server}`)
      const data = await res.json()
      if (config.icon) {
        data.icon = Buffer.from(data.icon.replace(/^data:image\/png;base64,/, ''), 'base64')
      }
      if (data.online) {
        session.send(`Server ${server} Status: Online`)
        if (config.icon) {
          await session.send(h.image(data.icon))
        }
        if (config.version) {
          await session.send(`Version: ${data.version}`)
        }
        if (config.motd) {
          await session.send(`MOTD: \n${data.motd.clean.join('\n')}`)
        }
        await session.send(`Players: ${data.players.online}/${data.players.max}`)
      } else {
        session.send(`Server ${server} Status: Offline`)
      }
    })
}
