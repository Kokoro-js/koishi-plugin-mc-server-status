import { Context, Schema } from 'koishi'
import { mcs } from './commands/mcs'
import { bind } from './commands/mcs.bind'

export const name = 'mc-server-status'

export const inject = [
  'puppeteer',
  'database'
]

export interface Config {
  IP: string
  icon: boolean
  motd: boolean
  authority: number
  footer: string
  bedrockSupport: boolean
}

export const Config: Schema<Config> = Schema.object({
  authority: Schema
    .number()
    .default(0)
    .description('默认指令权限等级'),
  IP: Schema.string()
    .required(true)
    .description('默认服务器IP'),
  icon: Schema.boolean()
    .default(true)
    .description('是否显示服务器图标'),
  motd: Schema.boolean()
    .default(true)
    .description('是否显示服务器MOTD'),
  footer: Schema.string()
    .role('textarea', { rows: [2, 4] })
    .default('Generated by koishi-plugin-mc-server-manager v2.3.2')
    .description('最下方显示的文字 (可以多行)'),
  bedrockSupport: Schema.boolean()
    .default(true)
    .description('是否启用Minecraft: Bedrock Edition服务器支持')
    .experimental()
})

export const usage = `
<h2>如遇使用问题可以前往QQ群: 957500313 讨论<h2>
<h2>基岩版没有完整的支持，出现错误请关闭该功能或者前往Q群反馈</h2>
<p>请我喝杯咖啡 👇</br><a href="https://ko-fi.com/itzdrli"><img src="https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" alt="ko-fi"></a></p> <a href="https://afdian.net/a/itzdrli">
  <button>爱发电</button>
</a>
`

declare module 'koishi' {
  interface Tables {
    mc_server_status: McServerStatus
  }
}

export interface McServerStatus {
  id: string
  server_ip: string
}

export function apply(ctx: Context, config: Config) {
  
  const logger = ctx.logger('mc-server-status');
  ctx.model.extend('mc_server_status', {
    id: 'string',
    server_ip: 'string'
  }, {})
  mcs(ctx, config)
  bind(ctx, config)
}
