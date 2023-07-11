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
  ctx.i18n.define('zh-CN', { commands: { mcs: { description: '获取 Minecraft 服务器状态' } } })
  ctx.i18n.define('en-US', { commands: { mcs: { description: 'Get Minecraft Server Status' } } })
  // register command /mcs then send message
  ctx.command('mcs <server>', { authority: 0 })
    .action(async ({ session }, server) => {
      // if <server> is empty, then use ${config.IP} instead
      if (!server) {
        server = config.IP
      }
      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${server}`)
      const data = await res.json()
      if (config.icon) {
        data.icon = Buffer.from(data.icon.replace(/^data:image\/png;base64,/, ''), 'base64')
      }
      ctx.i18n.define('zh-CN', { online: '服务器 {0} 状态: 在线' })
      ctx.i18n.define('en-US', { online: 'Server {0} Status: Online' })
      ctx.i18n.define('zh-CN', { offline: '服务器 {0} 状态: 离线' })
      ctx.i18n.define('en-US', { offline: 'Server {0} Status: Offline' })
      ctx.i18n.define('zh-CN', { version: '版本: {0}' })
      ctx.i18n.define('en-US', { version: 'Version: {0}' })
      ctx.i18n.define('zh-CN', { motd: 'MOTD: \n{0}' })
      ctx.i18n.define('en-US', { motd: 'MOTD: \n{0}' })
      ctx.i18n.define('zh-CN', { players: '玩家: {0}/{1}' })
      ctx.i18n.define('en-US', { players: 'Players: {0}/{1}' })
      if (data.online) {
        await session.send(session.text('online', [server]))
        if (config.icon) {
          await session.send(h.image(data.icon))
        }
        if (config.version) {
          await session.send(session.text('version', [data.version.name_clean]))
        }
        if (config.motd) {
          await session.send(session.text('motd', [data.motd.clean]))
        }
        await session.send(session.text('players', [data.players.online, data.players.max]))
      } else {
        await session.send(session.text('offline', [server]))
      }
    })
}
