import { Context, Schema } from 'koishi'

export const name = 'mc-server-status'

export interface Config {
  IP: string
}

export const Config: Schema<Config> = Schema.object({
  IP: Schema.string().description('If no IP is specified, this is the default IP will be used.'),
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
      if (data.online) {
        session.send(`Server ${server} Status: Online\nPlayers: ${data.players.online}/${data.players.max}`)
      } else {
        session.send(`Server ${server} Status: Offline`)
      }
    })
}
