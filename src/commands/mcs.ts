import { Context } from "koishi";
import { Config } from '../index';
import { } from 'koishi-plugin-puppeteer'
import { skip } from "node:test";

export function generateHtml(result: string, cicon: boolean, server: string): string {
    return `
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
                <div class="text-center">${cicon ? `<img src="https://sr-api.sfirew.com/server/${server}/icon.png" alt="icon" class="w-35 h-35 mx-auto" />` : ''}</div>
                <div class="text-center mt-4"><div class="text-lg font-bold text-white">${result}</div></div>
                </br>
                <div class="text-center mt-4"><div class="text-sm text-gray-400">Powered by koishi-plugin-mc-server-manager v.2.2.3</br>广告位招租 @itzdrli</div></div>
            </div>
        </div>
    </body>
    </html>`
}

export function mcs(ctx: Context, config: Config) {
  let result = ''
  ctx.command('mcs [server]', '查询Minecraft服务器状态', { authority: config.authority })
    .action(async ({ session }, server) => {
      if (!server) {
        server = config.IP
      }

      const data = await ctx.http.get(`https://sr-api.sfirew.com/server/${server}`);

      let result = `<p>${server}</p>`;

      if (!config.bedrockSupport) {
        result += `<p>版本: ${data.version?.raw} - ${data.version?.protocol}</p>`;
        if (config.motd && data.motd) {
            result += `<p>${data.motd.html}</p>`;
        }
        result += `<p>在线人数: ${data.players?.online}/${data.players?.max}</p>`;
      } else {
        if (!data.players?.sample) {
          result = `<p>基岩版</br> ${server}</p>`;
          if (data.version) {
            result += `<p>版本: ${data.version.raw} - ${data.version.protocol}</p>`;
          }
        } else {
          result += `<p>版本: ${data.version?.raw} - ${data.version?.protocol}</p>`;
        }
        if (config.motd && data.motd) {
          result += `<p>${data.motd.html}</p>`;
        }
        if (data.players) {
          result += `<p>在线人数: ${data.players.online}/${data.players.max}</p>`;
        }
      }

    const html = generateHtml(result, config.icon, server);
    const image = await ctx.puppeteer.render(html);
    return image;
    })
}