import { Context, Schema, h } from 'koishi'
import { } from 'koishi-plugin-puppeteer'

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
        result += '<p>' + session.text('online', [server]) + '</p>';
        if (config.icon) {
          // data.icon = Buffer.from(data.icon.replace(/^data:image\/png;base64,/, ''), 'base64')
          // await session.send(h.image(data.icon, 'image/png'));
        }
        if (config.version) {
          result += '<p>' + session.text('version', [data.version.name_clean]) + '</p>';
        }
        if (config.motd) {
          data.motd.clean = data.motd.clean.replace(/\n/g, '&#10;');
          result += '<p>' + session.text('motd', [data.motd.clean]) + '</p>';
        }
        result += '<p>' + session.text('players', [data.players.online, data.players.max]) + '</p>';
      } else {
        result = ''
        result += '<p>' + session.text('offline', [server]) + '</p>';
      }
      // return result
      const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900">
          <div class="w-2xl h-auto mx-auto p-4 bg-gray-800">
            <img src=${data.icon} alt="Icon" class="w-auto h-auto mx-auto mb-4" />
            <div class="text-white text-center">
              <p class="text-1x">${result}</p>
            </div>
          </div>
        </body>
      </html>
      `;
      const image = await ctx.puppeteer.render(html)
      return image
      // return `<html> ${html} </html>`
    })
}
