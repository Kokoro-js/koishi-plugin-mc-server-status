import { Context, Schema, h } from 'koishi'

export const name = 'mc-server-status'

export interface Config {
  IP: string
  icon: boolean
  version: boolean
  motd: boolean
}

export const Config: Schema<Config> = Schema.object({
  IP: Schema.string(),
  icon: Schema.boolean().default(true),
  version: Schema.boolean().default(true),
  motd: Schema.boolean().default(true)
}).i18n({
  'zh-CN': { 
    IP: '如果查询时未添加服务器地址, 将使用此地址', 
    icon: '是否显示服务器图标', 
    version: '是否显示服务器版本', 
    motd: '是否显示服务器MOTD' 
  },
  'en-US': { 
    IP: 'If the server address is not filled in, this address will be used', 
    icon: 'Whether to display the server icon', 
    version: 'Whether to display the server version', 
    motd: 'Whether to display the server MOTD' 
  }
})

export function apply(ctx: Context, config: Config) {
  let result = ''
  ctx.i18n.define('zh-CN', { commands: { mcs: { description: '获取 Minecraft 服务器状态' } } })
  ctx.i18n.define('en-US', { commands: { mcs: { description: 'Get Minecraft Server Status' } } })
  // register command /mcs then send message
  ctx.command('mcs [server]', { authority: 0 })
    .action(async ({ session }, server) => {
      // if <server> is empty, then use ${config.IP} instead
      if (!server) {
        server = config.IP
      }
      const data = await (await fetch(`https://api.mcstatus.io/v2/status/java/${server}`)).json()
      if (data.online) {
        result = ''
        ctx.i18n.define('zh-CN', { online: '服务器 {0} 状态: 在线' })
        ctx.i18n.define('en-US', { online: 'Server {0} Status: Online' })
        result += session.text('online', [server]) + '\n';
        if (config.icon) {
          data.icon = Buffer.from(data.icon.replace(/^data:image\/png;base64,/, ''), 'base64')
          await session.send(h.image(data.icon, 'image/png'));
          // result += h.image(data.icon, 'image/png') + '\n';
        }
        if (config.version) {
          ctx.i18n.define('zh-CN', { version: '版本: {0}' })
          ctx.i18n.define('en-US', { version: 'Version: {0}' })
          result += session.text('version', [data.version.name_clean]) + '\n';
        }
        if (config.motd) {
          ctx.i18n.define('zh-CN', { motd: 'MOTD: \n{0}' })
          ctx.i18n.define('en-US', { motd: 'MOTD: \n{0}' })
          result += session.text('motd', [data.motd.clean]) + '\n';
        }
        ctx.i18n.define('zh-CN', { players: '玩家: {0}/{1}' })
        ctx.i18n.define('en-US', { players: 'Players: {0}/{1}' })
        result += session.text('players', [data.players.online, data.players.max]) + '\n';
        return session.text(result);
      } else {
        result = ''
        ctx.i18n.define('zh-CN', { offline: '服务器 {0} 状态: 离线' })
        ctx.i18n.define('en-US', { offline: 'Server {0} Status: Offline' })
        result += session.text('offline', [server]) + '\n';
        return session.text(result);
      }
    })
}
