import { Context } from "koishi";
import { Config } from '../index';
import { } from 'koishi-plugin-puppeteer'

function generateHtml(result: string, cicon: boolean, server: string, footer: string): string {
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
    ${cicon ? `<div class="text-center"><img src="https://sr-api.sfirew.com/server/${server}/icon.png" alt="icon" class="w-50px h-50px mx-auto" /></div>` : ''}
    <div class="text-center mt-4">
      <div class="text-lg font-bold text-white">${result}</div>
    </div>
  </div>
  <footer class="bg-gray-800 text-center py-2">
    <p class="text-sm text-gray-400">${footer}</p>
  </footer>
</body>
</html>`;
}

export function mcs(ctx: Context, config: Config) {
  ctx.command('mcs [server]', '查询Minecraft服务器状态', { authority: config.authority })
    .action(async ({ session }, server) => {
      server = server || (await ctx.database.get('mc_server_status', session.guildId))[0]?.server_ip || config.IP;

      const data = await ctx.http.get(`https://sr-api.sfirew.com/server/${server}`);

      if (data.icon === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAIKklEQVQYGaXBya+eZRkH4N89PM/7fuOZ+MqpFDFoQxAkDjHEIXHjvDExDtHEf8A/wp1x68aNMdG4VCIOCxM0QaMkGo0giBQK2ND2dDrtOd/0Ds90W1tUjgYWPddFj+N4GMfEOCbGMTGOiXFMjGNSwvEwjklx57a3CGDcuQEBYNy5Hjcp4Y6FRROhuCP1aMzARQCK//ODR/v34q2MZ7htugAU/+Op37pft3ufxVtIeF0FQAlHHD6lYdSefeyLeHOE0HcRNxGg+B9BUHyPs6fxpro9Agi3KY4izhSjvfhy+fijeDOhAlDMMgDFUebmtK4GmdolLp57KTcf+QCAwx/PN3Y+j//o8R/yFRxRf+TyvN/kLsfDZ87O19N04dJvdPe5P9UHZeuR6cbGsCs4Qr5KR60+GK+972WmpPV4Vc/vXlTVpb8+h1jsbHwAMBeN3khxxPI3F7b26ZnQi/euqYrs+8U2vxojA+6lJu7vvZsz3kgJb/TdCuc7ajcp7niitH1D/GHaK4U7ks1PtZd/6J7+EuE2770jUhwx5Aj4EGcsJvCrrVClMplebAek3U73ZBvOfu/rzjncRoDiCLdzpXbd5jBZ1YMF2pRI4maL9tH+a+6xl6hP//jjJwi35JSzMR2R9qcyeGDomCNTSS1txUlPqxFS5J/6y+igOgjN8pYmZBAPCf/1iktLX66VkDNZdlQfrNHU/Xh5atrM83e+DG8f/sJ7Y8Z/0VOAdQG3fXv3hkTNGaTthPMSmmf74zYNF7Xf4n393IlvfLPCTWR4nWZiqgNuuaIpISog09hqsOEicS6U+rESz09W1a/WMuQMEFEmw7/IQ6eAFeiWF/bIiHLSYTEP46wscdJvFA1mLo/bSZw8+0G+CUagW+RDfhLPPf3alXZHsPfKKE2KVGSr2kyhvneBuIrVALzp55zjoP3b+3ET/Zt8vGyU54KF1fW3xV/2kzU5Iu0ssmQuqApCLtYNOyZZCqgZH567P7wB6/z3BIBKpp83d418N4dphJUCSldXsSlsTG23y1zX/Si2/tVfrOh1/3j8R5pqzLOVws3vLud8ISRkWVJSJ31Z6J5gJzcnr876oP1WH1D1E+p+Mp5+Ev9y5vki+o48T5SskmeRNc1TEKEyxbo4brAuNqzhumnGVgrdhfPNOi3PzJfy5EM10eJnbeDVyz0nHSGdK+K4yV02ZBfqSrC/WpHFK/sy8av1IEdc175DiK6sLCvz899apyy7r+zTYFh3drmEg6tNMHTNQBNbR4exBHPZ9cEh+lGo4n6q+hwllvmDfpfC04lITrA770nzZ35P4taEMk6q25vCMdVzLrSd2qlwnDp67bV51BJ7ToXag3z3xjNnipHc5Xy1mJw8vH6+UOjNgg/s+urKgLtxuF4kxKoe7ITi5hdTAnpiTUDKd//pib90xknuZiv58EZ6RZSxPbDepYnfXGyvh51bGAfnCRNbijWuMxZLXZ2NdHhtdj4MovScUfpMueOB61xOkOWMqK8PN1fD3EViCtVmv3CdaejjcrVOcd5nag7Gl4D+HQTZ0DmzoJPB4cgspDBKbqRxt3f19cYmVaqI4zBsLjPGO8OG3zk7cdWfenBrb9FSOIyqnKY1T7Ngv+iy9K30I7aGuwWHtFmpRd+f4IAwm4+7kV7kQ6cuDMDkOA+iQHd8NVpJd0+8unHZL1FzPYhNjQN/RdJgPa6GayUYZQkOC6rq0I5QlqvKz40Lp1oesLLMIdX9tB3yxHupWqMicn56cLIdNdoPm7aba9SV2P5qBNcdUqGDnTTpQjl1ein3lphRMJ+zH65yGWHux9FtctiZLSeeW82lKzS+QVvddr4nzjC7f7I7n4XsZ3JSuhOaFBVFchilmLLMvTLrYkNFzHIO7FbmkMi7fjVKpaQq902xrq0yezloTunHRKKW8p4zwT38rD3yfHXXxdNn8HA6e1/1ouPuob8nefj55B58od49d8+eeyLXN778o92329u5RE2aeTcFFCAmF1qznMDFiaErYbqze3JneNcueMr5sMDqxbzVkUwuyPAELQ8PGgdVveqiPHj1hg46f+6hF6/NbmzYc4/8+aX7dy5NHy+nTzX7Zfb3d63cHm2fv/f7NsjDq6f/wFvDg3Oh7nyRoFaqaFJyoegsCJegpZw5eM9HMWTYYDB199lMOVEo59TMgP3R+uLhvHDN2WRAn46jEEedTdZl2NlohUFvvr83LXiJYQM1K0R1KJ6vkMSqFzPNjExkyGKkWSUrYMkMVoopZ0fuEsUBkYGigIBCloiYlZmcGpIUwKICTrdRtql3GT5F1/Zk1yhUGWxL14dggLEGQYH5kF2xvq4qooxsZH0Vol6mnD2XXiSSb3tnZHkNq3pvrMElA6AZbEgkFjP6xkgtQSTntUJdSoKCKkGDOStCGi0zT9dRykhiEnAxLlaIjeuUTUsuxZVc4AhBySlAnFlRSTIoZZUsxrWR5hhiJCKu2APZiMYtyMgikRAFc6rXibV0LjI77YpoNsmJhDgWifAUBEBeGgdyg7XRYChN68yGLtmAhJXAVY9eQFmqDhksmZDJPPWwXj2XbATvU+6NlON1ipS5rIWJhVo5CbAkM+FCYF9QxFVMRClJrdGKsldFDICrBm0GgdWSgbjiHE2rtrTqq2TQQsmkWnXFTIQZKUJZhvMCZmJViq0jcmWdrDJjpd7MNGrOkbgQG2kXC4GYU0qAkYdfYslkIpRbgqj4akk1JbVCw5UVG2nJxiIVL5KRQRgFZoWI/GDdoWNjhkNBgolnLAxaMkhMrnAxN/8nJXb6SrKivnAAAAAASUVORK5CYII=") {
        return `无法查询服务器 ${server}`;
      }

      let result = `<p>${server}</p>`;
      if (!config.bedrockSupport) {
        result += `<p>版本: ${data.version?.raw} - ${data.version?.protocol}</p>`;
        if (config.motd && data.motd) {
          result += `<p>${data.motd.html}</p>`;
        }
        result += `<p>在线人数: ${data.players?.online}/${data.players?.max}</p>`;
      } else {
        if (data.version.name === data.version.raw) {
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

      const footer = config.footer.replace(/\n/g, '<br>');
      const html = generateHtml(result, config.icon, server, footer);
      const image = await ctx.puppeteer.render(html);
      return image;
    });
}
