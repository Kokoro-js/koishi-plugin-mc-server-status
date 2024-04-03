import { Context } from "koishi";
import { Config } from '../index';
import { } from 'koishi-plugin-puppeteer'

export function generateHtml(result: string, cicon: boolean, server: string): string {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=auto, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #1a202c;
      color: #fff;
    }
  </style>
</head>

<body style="width: 650px">
  <div class="container mx-auto py-8">
    <div class="text-center">${cicon ? `<img src="https://sr-api.sfirew.com/server/${server}/icon.png" alt="icon"
        class="w-35 h-35 mx-auto" />` : ''}</div>
    <div class="text-center mt-4">
      <div class="text-lg font-bold text-white">${result}</div>
    </div>
  </div>
  <footer class="bg-gray-800 text-center py-2">
    <p class="text-sm text-gray-400">Powered by koishi-plugin-mc-server-manager v.2.2.5</br>广告位招租 @itzdrli</p>
  </footer>
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