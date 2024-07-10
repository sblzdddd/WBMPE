# WBMPE
![Static Badge](https://img.shields.io/badge/5.2.2-21af90?style=flat&logo=vite&logoColor=8976fe&label=Vite&color=8976fe)
![Static Badge](https://img.shields.io/badge/3.4.21-21af90?style=flat&logo=Vue.js&logoColor=42d392&label=Vue&color=42d392)
![Static Badge](https://img.shields.io/badge/20.11.1-21af90?style=flat&logo=Node.js&logoColor=68ca5a&label=Node.js&color=68ca5a)
![Static Badge](https://img.shields.io/badge/10.2.5-21af90?style=flat&logo=npm&logoColor=c90000&label=npm&color=c90000)

[Online Preview](https://wbmpe.sblzd.cn/)

A Simple Music Player Implementation created using Vue 3.

A replication of [AMLL](https://github.com/Steve-xmh/applemusic-like-lyrics).

An Assignment's Submission of G2.ENR.CPU2.

## How to Use
To play musics, You need an url that returns a list of songs with the format as shown below:
```json
{
    "artist": "SONG_ARTIST",
    "cover": "SONG_COVER(Optional)",
    "lrc": "SONG_LYRIC_URL(Optional)",
    "name": "SONG_NAME",
    "pic": "SONG_PICTURE",
    "type": "SONG_TYPE(Optional)",
    "url": "AUDIO_FILE_URL"
}
```
You could use [Meting API](https://github.com/injahow/meting-api) which fully supports this feature while parsing 
playlists from netease music or qq music.

Refer to the [Song data of APlayer](https://aplayer.js.org/#/home?id=options)

## Setup & Dev

here is the Vite official's recommended IDE for setup:

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

- Use [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) for performing the same type checking from the command line, or for generating d.ts files for SFCs.

Steps:
- Install Dependencies:
    ``` bash
    npm i
    ```
- or for Chinese region:
    ```bash
    npm i cnpm -g
    cnpm i
    ```

- run development server:
    ```bash
    npm run dev
    ```

## Build
simply run:

```bash
npm run build
```
