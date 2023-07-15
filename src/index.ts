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
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))
  ctx.i18n.define('en-US', require('./locales/en-US'))
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
        result += session.text('online', [server]) + '\n';
        if (config.icon) {
          data.icon = Buffer.from(data.icon.replace(/^data:image\/png;base64,/, ''), 'base64')
          await session.send(h.image(data.icon, 'image/png'));
        }
        if (config.version) {
          result += session.text('version', [data.version.name_clean]) + '\n';
        }
        if (config.motd) {
          result += session.text('motd', [data.motd.clean]) + '\n';
        }
        result += session.text('players', [data.players.online, data.players.max]) + '\n';
      } else {
        result = ''
        result += session.text('offline', [server]) + '\n';
      }
      return session.text(result);
    })
}
