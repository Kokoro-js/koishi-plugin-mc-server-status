import { Context } from "koishi";
import { Config } from '../index';
import mc from "@ahdg/minecraftstatuspinger";
import { autoToHTML as motdParser } from '@sfirew/minecraft-motd-parser'
import { } from 'koishi-plugin-puppeteer'
import { motdJsonType } from "@sfirew/minecraft-motd-parser/types/types";
import { umami } from "../index";
import { } from 'koishi-plugin-umami-statistics-service'
import * as punycode from 'punycode';

interface Status {
  description: motdJsonType;
  players: { max: number; online: number };
  version: { name: string; protocol: number };
  favicon: string;
}

const dark = ["#2e3440", "#cdd6f4", "#434c5e"];

export async function generateHtml(icon: any, text: string, footer) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=auto, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: ${dark[0]};
      color: ${dark[1]};
    }
  </style>
</head>
<body style="width: 750px">
  <div class="container mx-auto pl-20 pr-8 py-4">
    <div class="px-6 flex items-center gap-10">
      ${
        icon
          ? `<div class="flex-shrink-0"><img src=${icon} alt="icon" class="w-auto h-auto rounded-lg" /></div>`
          : ""
      }
      <div class="flex-grow pl-25">
        <div class="text-lg font-bold text-[${dark[1]}]">${text}</div>
      </div>
    </div>
  </div>
  <footer class="bg-[${dark[2]}] text-center py-2">
    <p class="text-sm text-[${dark[1]}]">${footer}</p>
  </footer>
</body>
</html>`;
}

function convertToPunycode(hostname: string): string {
  try {
    // Check if hostname contains non-ASCII characters
    if (!/^[\x00-\x7F]*$/.test(hostname)) {
      return punycode.toASCII(hostname);
    }
    return hostname;
  } catch {
    // If conversion fails, return original hostname
    return hostname;
  }
}

export async function mcs(ctx: Context, config: Config) {
  ctx.command('mcs [server]', '查询 Minecraft 服务器状态', { authority: config.authority })
    .action(async ({ session }, server) => {
      if (config.data_collect) {
        ctx.umamiStatisticsService.send({
          dataHostUrl: umami[1],
          website: umami[0],
          url: '/mcs',
          urlSearchParams: {
            args: session.argv.args?.join(', '),
            ...(session.argv.options || {}),
          },
        })
      }
      const originalServer = server
      server = server || (await ctx.database.get('mc_server_status', session.guildId))[0]?.server_ip || config.IP;
      let mcPort = 25565
      if (server.includes(":")) {
        let [host, port] = server.split(":");
        server = convertToPunycode(host);
        mcPort = parseInt(port)
      } else {
        server = convertToPunycode(server);
      }
      let mcdata: any
      try {
        mc.setDnsServers([config.dnsServer])
        mcdata = await mc.lookup({
          host: server,
          port: mcPort,
          disableSRV: config.skipSRV,
        })
      } catch (e) {
        return `出现错误: ${e.message}`
      }

      const status: Status = mcdata.status as any;
      let result = `<p>${originalServer} - 延迟 ${mcdata.latency}ms</p>`;
      result += `<p>版本: ${status.version.name} - ${status.version.protocol}</p>`;
      if (config.motd) {
        const motd = motdParser(status.description)
        result += `<p>${motd}</p>`;
      }
      result += `<p>在线人数: ${status.players.online}/${status.players.max}</p>`;

      const icon = status.favicon
      const footer = config.footer.replace(/\n/g, '</br>');
      const html = await generateHtml(icon, result, footer);
      const image = await ctx.puppeteer.render(html);
      return image;
    });
}
