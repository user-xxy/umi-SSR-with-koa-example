import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  ssr: {
    //removeWindowInitialProps: true,
    devServerRender: false,
  },
  publicPath: 'http://localhost:8000/',
});
