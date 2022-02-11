const Koa = require('koa');
const koa2Req = require('koa2-request');

const app = new Koa();

app.use(async (ctx) => {
  const { request: req, response: res } = ctx;
  // 或者从 CDN 上下载到 server 端
  // const serverPath = await downloadServerBundle('http://cdn.com/bar/umi.server.js');
  const render = require('./dist/umi.server');
  res.set('Content-Type', 'text/html');

  const context = {};
  // 发起 API 请求查询
  const result = await fetch(
    `https://jsonplaceholder.typicode.com/todos/1`,
  ).then((res) => res.json());
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
      todoData: result,
    },

    // manifest，正常情况下不需要
  });

  ctx.body = html;
});

app.listen(7001);
module.exports = app.callback();
