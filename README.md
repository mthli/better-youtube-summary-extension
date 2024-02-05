# better-youtube-summary-extension

Literally Better YouTube Summary 🎯

[![Better YouTube Summary Extension Showcase](https://res.cloudinary.com/marcomontalbano/image/upload/v1707146334/video_to_markdown/images/youtube--NyhrKImPSDQ-c05b58ac6eb4c4700831b2b3070cd403.jpg)](https://www.youtube.com/watch?v=NyhrKImPSDQ "Better YouTube Summary Extension Showcase")

**This extension is no longer maintained,**

because OpenAI banned my account due to "accessing the API from an [unsupported location](https://platform.openai.com/docs/supported-countries)" 👎

The backend implementation can be found in [mthli/better-youtube-summary-server](https://github.com/mthli/better-youtube-summary-server).

If you want to deploy it yourself, please replace the `bys.mthli.com` with your own domain.

## Build

First install all dependencies:

```bash
# node version is v20.3.0, npm version is 9.6.7
npm i
```

If build for development:

```bash
npm run clean # optional.
npm run watch
```

If build for production:

```bash
npm run clean # optional.
npm run build
npm run build:firefox
```

## License

```
better-youtube-summary-extension - Literally Better YouTube Summary.

Copyright (C) 2023  Matthew Lee
Copyright (C) 2018  Tomofumi Chiba

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
