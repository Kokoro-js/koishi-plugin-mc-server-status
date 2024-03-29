import { Context, Schema, h } from 'koishi'
import { mcs } from './commands/mcs'

export const name = 'mc-server-status'

export const inject = ['puppeteer']

export interface Config {
  IP: string
  icon: boolean
  motd: boolean
  authority: number
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
  bedrockSupport: Schema.boolean()
    .default(true)
    .description('是否启用Minecraft: Bedrock Edition服务器支持')
    .experimental()
})

export const usage = `
<h2>如遇使用问题可以前往QQ群: 957500313 讨论<h2>
<h2>基岩版没有完整的支持，出现错误请关闭该功能或者前往Q群反馈</h2>`

export function apply(ctx: Context, config: Config) {
  mcs(ctx, config)
}
