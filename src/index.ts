import { Context, Schema, h } from 'koishi'
import { PingContext } from 'node-minecraft-status'
import motdParser from '@sfirew/minecraft-motd-parser'

import { } from 'koishi-plugin-puppeteer'

export const name = 'mc-server-status'

export interface Config {
  IP: string
  icon: boolean
  motd: boolean
}

export const Config: Schema<Config> = Schema.object({
  IP: Schema.string().required(true).description('默认服务器IP'),
  icon: Schema.boolean().default(true).description('是否显示服务器图标'),
  motd: Schema.boolean().default(true).description('是否显示服务器MOTD')
})

export function apply(ctx: Context, config: Config) {
  let result = null
  let data = null
  const client = new PingContext();
  // register command /mcs then send message
  ctx.command('mcs [server]', { authority: 0 })
    .action(async ({ session }, server) => {
      // if <server> is empty, then use ${config.IP} instead
      if (!server) {
        server = config.IP
      }
      // 使用 Promise 来确保 next 回调函数执行完毕后再访问 data
      await new Promise<void>((resolve, reject) => {
        client.ping(server)
          .subscribe({
            next(response) {
              data = response // 在回调函数中更新 data 变量
              resolve() // 在 next 回调函数中调用 resolve 函数
            },
            error(err) {
              ctx.logger('mc-server-status').error(`出现错误(服务器不在线?): ${err}`)
              return session.text(`出现错误(服务器不在线?), 请检查日志`)
            },
            complete() {
              ctx.logger('mc-server-status').info(`成功查询 ${server} 的信息`)
            }
          })
      })
      result = `<p>${data.host}:${data.port}</p><p>版本: ${data.version.name}</p>`
      if (config.motd) {
        result += `<p>${motdParser.textToHTML(data.description)}</p>`
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
      
      <body class="bg-gray-900 text-white" style="width: 650px">
          <div class="container mx-auto px-4 max-w-650 w-auto">
              <div class="bg-gray-800 rounded-lg shadow-lg p-8">
                  <div class="text-center">
                      ${config.icon ? `<img src="${data.favicon}" alt="icon" class="w-35 h-35 mx-auto" />` : ''}
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
