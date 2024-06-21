import os from "node:os";
import { Context, version } from "koishi";
import packageJson from "../package.json";

const dataHostUrl: string = 'https://data.itzdrli.com';
const website: string = "29272bd1-0f4c-4db8-ad22-bec20ee15810";

interface Payload {
  website: string;
  hostname?: string;
  language?: string;
  referrer?: string;
  screen?: string;
  title?: string;
  url?: string;
  name?: string;
  data?: Record<string, any>;
}

let sending = false;
const sendUmamiList = [];
const Umami = {
  queueRun(fn: Function) {
    sendUmamiList.push(fn);
    if (sending) {
      return;
    }
    sending = true;
    (async () => {
      let run: Function;
      while (run = sendUmamiList.shift()) {
        try {
          await run();
        } catch (e) {
          console.error(e);
        }
      }
      sending = false;
    })()
  },
  send({ctx, url = '/', urlSearchParams, title, eventName, data}: {
    ctx: Context,
    url?: string,
    urlSearchParams?: Record<string, any>
    title?: string,
    eventName?: string
    data?: Record<string, any>,
  }) {
    Umami.queueRun((async () => {
      const searchParams = new URLSearchParams();
      if (searchParams) {
        for (let key in urlSearchParams) {
          searchParams.set(key, urlSearchParams[key]);
        }
      }
      searchParams.set('koishi_version', version);
      searchParams.set('plugin_name', packageJson.name);
      searchParams.set('plugin_version', packageJson.version);
      await ctx.http.post(
        dataHostUrl + '/api/send',
        JSON.stringify({
          type: "event",
          payload: {
            website,
            hostname: os.hostname(),
            screen: "3440x1440",
            language: ctx.root.config.i18n?.locales?.[0],
            url: url.replace(/\?[\s\S]*/, '') + '?' + searchParams.toString(),
            title,
            name: eventName,
            data,
          } as Payload
        }),
        {
          headers: {
            'content-type': 'application/json',
            'User-Agent': `Mozilla/5.0 (${Umami.getUserAgentOs()}) Chrome/11.4.5.14`,
          }
        }
      );
    }));
  },
  userAgentOs: undefined,
  getUserAgentOs() {
    if (!Umami.userAgentOs) {
      Umami.userAgentOs = Umami._getUserAgentOs();
    }
    return Umami.userAgentOs;
  },
  _getUserAgentOs() {
    switch (os.platform()) {
      case "aix": {
        return 'X11; U; AIX 005A471A4C00; en-US; rv:1.0rc2';
      }
      case 'android': {
        return 'Android 13; Mobile; rv:126.0';
      }
      case 'darwin': {
        return 'Macintosh; Intel Mac OS X 13_6_0';
      }
      case 'freebsd': {
        return 'X11; FreeBSD amd64; rv:122.0';
      }
      case 'haiku': {
        return 'X11; Haiku x86_64';
      }
      case 'linux': {
        return 'X11; Linux x86_64';
      }
      case 'openbsd': {
        return 'X11; OpenBSD amd64;';
      }
      case 'sunos': {
        return 'X11; U; SunOS sun4u;';
      }
      case 'cygwin': {
        return 'Win16;';
      }
      case 'netbsd': {
        return 'X11; NetBSD amd64;';
      }
      case 'win32': {
        let version = os.release().replace(/^([^.]+\.[^.]+)[\s\S]*/, '$1');
        switch (os.arch()) {
          case 'x64':
            return 'Windows NT ' + version + '; Win64; x64';
          case 'x86':
            return 'Windows NT ' + version + '; Win32; x86';
          case 'arm':
            return 'Windows NT ' + version + '; ARM';
          default:
            return 'Windows NT ' + version;
        }
      }
      default: {
        return os.platform() + ' ' + os.arch() + ';';
      }
    }
  }
}


export default Umami;