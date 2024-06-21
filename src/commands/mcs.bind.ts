import { Context } from "koishi";
import { Config } from '../index';
import Umami from "../umami";

export function bind(ctx: Context, config: Config) {
    ctx.command('mcsBind <server:string> [guildId]', '绑定Minecraft服务器', { authority: 4 })
        
        .action(async ({ session }, server, guildId) => {
            if (config.data_collect) {
                Umami.send({
                  ctx,
                  url: '/mcsBind',
                  urlSearchParams: {
                    args: session.argv.args?.join(', '),
                    ...(session.argv.options || {}),
                  }
                });
              }
            if (!session.guildId) return `请在群内使用此命令`
            if (!guildId) {
                guildId = session.guildId
            }
            const res = await ctx.database.get('mc_server_status', guildId)
            if (res.length) {
                session.send(`群 ${guildId} 已绑定服务器 ${res[0].server_ip}, 回复 okay 以进行替换，或者回复 cancel 取消替换`)
                const response = await session.prompt()
                if (response === 'cancel') {
                    return `已取消替换服务器`
                } else if (response === 'okay') {
                    await ctx.database.remove('mc_server_status', guildId)
                } else {
                    return `无效回复, 已取消操作`
                }
            }
            await ctx.database.create('mc_server_status', {
                id: guildId,
                server_ip: server
            })
            return `已绑定服务器 ${server} 到群 ${guildId}`
        })
}