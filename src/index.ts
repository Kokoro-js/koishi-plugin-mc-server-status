import { Context, Schema, h } from 'koishi'
import { mcs } from './commands/mcs'

export const name = 'mc-server-status'

export const inject = ['puppeteer']

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

export const usage = ``

export function apply(ctx: Context, config: Config) {
  mcs(ctx, config)
}
