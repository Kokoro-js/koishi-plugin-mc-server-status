import { Context } from "koishi";
import { Config } from '../index';

export function bind(ctx: Context, config: Config) {
    ctx.command('mcsBind <server:string> [guildId]', '绑定Minecraft服务器', { authority: 4 })
        .action(async ({ session }, server, guildId) => {
            if (!session.guildId) return `请在群内使用此命令`
            if (!guildId) {
                guildId = session.guildId
            }
            const res = await ctx.database.get('mc_server_status', guildId)
            if (res.length) {
                return `群 ${guildId} 已绑定服务器 ${res[0].server_ip}`
            }
            await ctx.database.create('mc_server_status', {
                id: guildId,
                server_ip: server
            })
            return `已绑定服务器 ${server} 到群 ${guildId}`
        })
}