# webpack-cdn-replace-plugin

webpack插件，用于解决项目文件上传cdn后需要手动替换地址的问题，无任何上传依赖，让用户灵活使用自己想用的cdn上传服务

## 安装

```bash
# npm
npm i webpack-cdn-replace-plugin
# yarn
yarn add webpack-cdn-replace-plugin
# pnpm
pnpm add webpack-cdn-replace-plugin
```

## 用法

在你的`webpack.config.js`文件中：

```javascript
const { UploadPlugin } = require('webpack-cdn-replace-plugin')

module.exports = {
  mode: 'production',
  output: {
    // 这里的publicPath要为空，不然js文件中的cdn地址会出问题
    publicPath: '',
    // ...
  },
  // ...其他webpack配置
  plugins: [
    // ...其他webpack插件
    new UploadPlugin({
      uploadFn: async(path, fileName) => {
        // 此处调用你要用的cdn上传api，将返回的cdn地址返回
        return `http://test.cdn/${fileName}`
      }
    })
  ]
}
```

> 注意事项：**publicPath**一定要为空，不然cdn地址替换后会有问题

## 参数

#### options.uploadFn: `(path: string, fileName: string) => string | Promise<string>`

上传cdn的处理函数

默认值：`(path, fileName) => fileName`

#### options.cache: `boolean`

是否启用缓存

默认值：`true`

#### options.types: `object`

需要上传cdn处理的文件类型

|参数名|类型|必选|说明|
|:---- |:--   |:---|:----- |
|img |string[]| 否 | 需要上传的图片文件类型 |
|font |string[]| 否 | 需要上传的字体文件类型 |
|css |string[]| 否 | 需要替换图片和字体并上传的css文件类型 |
|js |string[]| 否 | 需要替换图片和字体并上传的js文件类型 |
|html |string[]| 否 | 需要替换css和js的html文件类型 |

默认值：
```javascript
{
  img: ['.png', '.jpg', '.jpeg', '.svg'],
  font: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
  css: ['.css'],
  js: ['.js'],
  html: ['.html']
}
```

> 注意事项：**html**文件不会上传，这里是用于替换其他上传文件的地址

## License

MIT

Copyright (c) 2022 zhusiqing
