// https://github.com/anhthii/lrc-parser/blob/master/index.js
import {AJAX} from "./requests.ts";

export interface LyricData {
    text: string;
    start: number;
    end: number;
    alt: string | undefined;
}

const EOL = '\n'
// function extractInfo(data: string) {
//     const info = data.trim().slice(1, -1) // remove brackets: length: 03:06
//     return info.split(': ')
// }
// convert time string to seconds
// i.g: [01:09.10] -> 69.10
function convertTime(s: string) {
    const str = s.split(':');
    const minutes = parseInt(str[0], 10)
    let seconds = parseFloat(str[1])
    if(s.length > 2) {
        seconds = parseFloat(str[1] + "." + str[2])
    }
    if (minutes > 0) {
        const sc = minutes * 60 + seconds
        return parseFloat(sc.toFixed(2))
    }
    return seconds
}
export function fetchLrc(url: string, callback: (lrc_data:LyricData[]) => void) {
    AJAX('GET', url, function(error, response, url) {
        if (error) {
            console.error(error, response, url);
        } else {
            callback(parseLrc(response.toString()));
        }
    })
}

/* lrc lyric format:
[00:12:08]バッドランドに生まれた (降生于荒芜之地)
[00:14:11]だけでバッドライフがデフォとか (生活就注定糟糕吗)
[00:16:46]くだらないけど、それが理なんだって (虽然无聊，但理应如此)
...
*/
export function parseLrc(data: string):LyricData[] {
    let lines = data.split(EOL)
    // 匹配lrc每一行文件时间码Regex  i.g [00:12.34] or [00:12:34]
    const timeStartExp = /\[(\d*\:\d*[:\.]?\d*)\]/
    // 匹配lrc歌词内容，括号额外匹配
    const scriptTextExp = /([^\(\)]+)(\(.*)?/ // Havana ooh na-na (ayy)
    // 尾部时间匹配（下一行时间是这一行end）
    const timeEndExp = timeStartExp
    // 一行整体匹配
    const allExp = new RegExp(timeStartExp.source + scriptTextExp.source)

    const infos = [], scripts = []
    // 是否为歌词
    for(let i = 0; allExp.test(lines[i]) === false; i++) infos.push(lines[i])

    // const result = infos.reduce((result, info) => {
    //     const [key, value] = extractInfo(info);
    //     (result as any)[key] = value; // Using 'any' here assumes you know the structure
    //     return result;
    // }, {} as Record<string, any>);

    lines.splice(0, infos.length) // remove all info lines
    const qualified = new RegExp(allExp.source + '|' + timeEndExp.source)
    lines = lines.filter(line => qualified.test(line))

    for (let i = 0, l = lines.length; i < l; i++) {
        const matches = allExp.exec(lines[i])
        const timeEndMatches = timeEndExp.exec(lines[i + 1])
        if (matches && timeEndMatches) {
            const [, start, text, alt] = matches
            const [, end] = timeEndMatches
            scripts.push({
                start: convertTime(start),
                text,
                alt,
                end: convertTime(end),
            })
        }
    }
    return scripts
}

export function getCurrentLyric(data:LyricData[], time:number) {
    for(let i=0;i<data.length;i++) {
        const val = data[i];
        if(val.start <= time && time <= val.end) {
            return i;
        }
    }
    if(time <= data[0].start) return 0;
    if(time >= data[data.length-1].end) return data.length-1;
    return -1;
}
