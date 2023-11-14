import { Context, Schema, h } from 'koishi'
import { } from 'koishi-plugin-puppeteer'

export const name = 'mc-server-status'

export interface Config {
  IP: string
  icon: boolean
  motd: boolean
  authority: number
}

export const Config: Schema<Config> = Schema.object({
  authority: Schema.number().default(0).description('默认指令权限等级'),
  IP: Schema.string().required(true).description('默认服务器IP'),
  icon: Schema.boolean().default(true).description('是否显示服务器图标'),
  motd: Schema.boolean().default(true).description('是否显示服务器MOTD'),
})

export function apply(ctx: Context, config: Config) {
  let result = null
  let data = null
  let port = null
  ctx.command('mcs [server]', { authority: config.authority })
    .action(async ({ session }, server) => {
      if (!server) {
        server = config.IP
      }
      data = await ctx.http.get(`https://sr-api.sfirew.com/server/${server}`)
      port = String(data.port)
      result = `<p>${server}</p><p>版本: ${data.version.raw} - ${data.version.protocol}</p>`
      if (config.motd) {
        result += `<p>${data.motd.html}</p>`
      }
      result += `<p>在线人数: ${data.players.online}/${data.players.max}</p>`
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      
      <body class="bg-slate-900 bg-opacity-80" style="width: 650px">
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
