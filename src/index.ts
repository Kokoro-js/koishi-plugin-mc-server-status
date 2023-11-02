import { Context, Schema, h } from 'koishi'
import pinger from 'minecraft-pinger'
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
  // register command /mcs then send message
  ctx.command('mcs [server]', { authority: 0 })
    .action(async ({ session }, server) => {
      // if <server> is empty, then use ${config.IP} instead
      if (!server) {
        server = config.IP
      }
      let port = null
      // check if <server> contains port
      if (server.includes(':')) {
        port = server.split(':')[1]
        server = server.split(':')[0]
      } else {
        port = 25565
      }
      await pinger.pingPromise(server, port)
        .then((output) => {
          data = output
        })
        .catch(console.error)
      ctx.logger('mc-server-status').info(data)
      result = `<p>${server}:${port}</p><p>版本: ${data.version.name} - ${data.version.protocol}</p>`
      if (config.motd) {
        let motdr = data.description
        ctx.logger('mc-server-status').info(`MOTDR: ${motdr}`)
        motdr = motdr.replace(/\n/g, '<br>')
        ctx.logger('mc-server-status').info(`MOTDRN: ${motdr}`)
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
