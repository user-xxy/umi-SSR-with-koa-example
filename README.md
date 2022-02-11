# umi ssr（服务端渲染） 集成到 noedejs 案例

以下步骤为详细解释，老手可以直接 clone 项目安装即可。

## 项目快速搭建

1、搭建 umi 脚手架
```bash
$ yarn create @umijs/umi-app

#安装依赖项
$ yarn
```
2、添加服务器（koa 为例，也可以选择 express 或者 egg）
```bash
$ yarn add koa -s
```
3、创建 `server.js`
```javascript
const Koa = require('koa');
const koa2Req = require('koa2-request')

const app = new Koa();

app.use(async (ctx) => {
  const { request: req, response: res } = ctx;
  // 或者从 CDN 上下载到 server 端
  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.set('Content-Type', 'text/html');

  const context = {};
  // 发起 API 请求查询
  const result = await fetch(`https://jsonplaceholder.typicode.com/todos/1`).then(res => res.json());
  const { html, error, rootContainer } = await render({
    // 有需要可带上 query
    path: req.url,
    context,

    // 可自定义 html 模板
    // htmlTemplate: defaultHtml,

    // 启用流式渲染
    // mode: 'stream',

    // html 片段静态标记（适用于静态站点生成）
    // staticMarkup: false,

    // 扩展 getInitialProps 在服务端渲染中的参数
    getInitialPropsCtx: {
      todoData: result
    },

    // manifest，正常情况下不需要
  });

  ctx.body = html
});

app.listen(7001);
module.exports = app.callback();

```
4、修改 `.umirc.ts`
```javascript
import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { component: '@/pages/404', title: '404' },
  ],
  fastRefresh: {},
  ssr: {
    //removeWindowInitialProps: true,
    devServerRender:false,
  },
  publicPath:'http://localhost:8000/'
});

```
5、修改 `src/pages/index.tsx`：
```javascript
import { IGetInitialProps } from 'umi';
import styles from './index.less';

function IndexPage(props: any) {
  const {
    todoData: {
      title = ''
    }
  } = props;
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}

IndexPage.getInitialProps = (async (ctx) => {
  const { isServer, todoData } = ctx;
  if (isServer) {
    return {
      todoData
    }
  }
  return {};
}) as IGetInitialProps;

export default IndexPage;
```

## 开发与调试
1、启动前端项目（新创建一个终端）：
```bash
$ yarn start
```
2、启动服务端（再创建一个终端）：
```bash
$ node server.js
```
3、打开浏览器页面：`http://localhost:7001`，即可看到服务端渲染后的页面了。

## 注意点
1、本案例使用的是通过 koa 请求 api 接口，然后将接口数据注入到 `ctx 参数` 中去，我个人喜欢这种方式，因为通过这种方式在浏览器的 network 中看不到请求信息。你也可以使用 umi 提供的其他方式获取数据；

2、在 `.umirc.ts` 中配置的 ssr 参数中：
```javascript
  ssr: {
    //removeWindowInitialProps: true,
    devServerRender:false,
  },
```
第一个 `removeWindowInitialProps` ，如果你是动态加载数据的（从接口请求数据的），一定不要配置此项，因为他只适合静态站点，否则项目会一直报错。第二个 `devServerRender` ，是为了和 nodejs 框架集成，所以要打开。

## umi ssr 不与其他框架耦合的原因

我理解是 umi 最终生成了一个 `umi.server.js` 文件，你的框架能引入这个文件，然后框架把路径参数传递给他，他就能返回相应的html字符串，然后框架把 body 设置为这个 html 即可。过程就是如此

