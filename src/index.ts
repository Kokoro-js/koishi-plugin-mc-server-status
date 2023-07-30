import { Context, Logger, Schema, h } from 'koishi'
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
      const data = await (await fetch(`https://api.mcsrvstat.us/2/${server}`)).json()
      if (!data.online) {
        return session.text('offline', [server])
      }
      result = '<p>' + session.text('online', [server]) + '</p>';
      if (config.version) {
        result += '<p>' + session.text('version', [data.version]) + '</p>';
      }
      if (config.motd) {
        // Use h() to create an HTML node from data.motd.html
        const motdl1 = h('p', data.motd.html[0]);
        const motdl2 = h('p', data.motd.html[1]);
        result += h.unescape(session.text('motd', [motdl1, motdl2]));
      }
      result += '<p>' + session.text('players', [data.players.online, data.players.max]) + '</p>';
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      
      <body class="bg-gray-900 text-white" style="width: 650px">
          <div class="container mx-auto px-4 max-w-650 w-auto">
              <div class="bg-gray-800 rounded-lg shadow-lg p-8">
                  <div class="text-center">
                      ${config.icon ? `<img src="${data.icon}" alt="icon" class="w-35 h-35 mx-auto" />` : ''}
                  </div>
                  <div class="text-center mt-4">
                      <div class="text-lg font-bold text-white">${result}</div>
                  </div>
              </div>
          </div>
      </body>
      </html>`
      const image = await ctx.puppeteer.render(html)
      return image
    })
}
