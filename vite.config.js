import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import {transformRequireDynamic} from './plugins/requireTransform.js';
import {fileURLToPath, URL} from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'
import * as oS from 'os'


const addressList = {
  //测试环境
  '39.101.1.212': {
    'VITE_API': 'http://39.101.1.212:6888/api',
    'VITE_FILE': 'http://39.101.1.212:6888/upload',
    'VITE_ZIP': 'http://39.101.1.212:6888/zip',
    'VITE_ZIP_2': 'http://39.101.1.212:6888/undozip',
    'VITE_KKFILE': 'http://39.101.70.40:8012',
  },
  //生产
  '39.101.70.40': {
    'VITE_API': 'http://zz.lingw.com.cn:6888/api',
    'VITE_FILE': 'http://zz.lingw.com.cn:6888/upload',
    'VITE_ZIP': 'http://zz.lingw.com.cn:6888/zip',
    'VITE_ZIP_2': 'http://zz.lingw.com.cn:6888/undozip',
    'VITE_KKFILE': 'http://39.101.70.40:8012',
  },
  //长宁
  '38.96.58.51': {
    'VITE_API': 'http://38.96.58.51:6888/api',
    'VITE_FILE': 'http://38.96.58.51:6888/upload',
    'VITE_ZIP': 'http://38.96.58.51:6888/zip',
    'VITE_ZIP_2': 'http://38.96.58.51:6888/undozip',
    'VITE_KKFILE': 'http://38.96.58.51:8012',
  },
  //安丘
  '56.102.139.8': {
    'VITE_API': 'http://56.102.139.8:6888/api',
    'VITE_FILE': 'http://56.102.139.8:6888/upload',
    'VITE_ZIP': 'http://56.102.139.8:6888/zip',
    'VITE_ZIP_2': 'http://56.102.139.8:6888/undozip',
    'VITE_KKFILE': 'http://56.102.139.8:8012',
  },
  //菏泽
  '56.212.2.2': {
    'VITE_API': 'http://56.212.2.2:6888/api',
    'VITE_FILE': 'http://56.212.2.2:6888/upload',
    'VITE_ZIP': 'http://56.212.2.2:6888/zip',
    'VITE_ZIP_2': 'http://56.212.2.2:6888/undozip',
    'VITE_KKFILE': 'http://56.212.2.2:8012',
  },
  //黄埔
  '38.80.33.81': {
    'VITE_API': 'http://38.80.33.81:6888/api',
    'VITE_FILE': 'http://38.80.33.81:6888/upload',
    'VITE_ZIP': 'http://38.80.33.81:6888/zip',
    'VITE_ZIP_2': 'http://38.80.33.81:6888/undozip',
    'VITE_KKFILE': 'http://38.80.33.81:8012',
  },
  //南通
  '50.88.113.41': {
    'VITE_API': 'http://50.88.113.41:6888/api',
    'VITE_FILE': 'http://50.88.113.41:6888/upload',
    'VITE_ZIP': 'http://50.88.113.41:6888/zip',
    'VITE_ZIP_2': 'http://50.88.113.41:6888/undozip',
    'VITE_KKFILE': 'http://50.88.113.41:8012',
  },
  //南京
  '50.32.58.77': {
    'VITE_API': 'http://50.32.58.77:6888/api',
    'VITE_FILE': 'http://50.32.58.77:6888/upload',
    'VITE_ZIP': 'http://50.32.58.77:6888/zip',
    'VITE_ZIP_2': 'http://50.32.58.77:6888/undozip',
    'VITE_KKFILE': 'http://50.32.58.77:8012',
  }
}

// IP地址
const address = () => {
  let address = ''
  oS.networkInterfaces()['WLAN'].forEach(item => {
    if (item.family == 'IPv4' && addressList[item.address]) {
      address = item.address
    } else if (item.address == '192.168.2.9') {
      //俊哥192.168.2.147
      address = '39.101.70.40'
      // address = '192.168.2.7'
    }else {
      // address = '39.101.70.40'  正式环境，这代码写的是真烂
      address = '39.101.1.212'
  
    }
  })
  return address
  
}
export default ({mode}) => defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 9999,
    proxy: {
      '^/api': {
        target: `http://${[address()]}:8089/jdetect`,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
  
  plugins: [
    vue(),
    vueJsx(),
    transformRequireDynamic(['docxtemplater-image-module-free']),
    transformRequireDynamic(['docx-preview']),
  ],
  optimizeDeps: {
    exclude: ['@antv/x6-vue-shape', '@antv/x6-vue3-shape'],
  },
  // build
  build: {
    target: ['chrome71'],
    sourcemap: true,
    outDir: mode, // 指定输出路径，要和库的包区分开
    assetsDir: 'static/', // 指定生成静态资源的存放路径
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js1/[name]-[hash].js',
        entryFileNames: 'static/js2/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
      },
      brotliSize: false, // 不统计
      target: 'esnext',
      minify: 'esbuild' // 混淆器，terser构建后文件体积更小
    }
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          outputStyle: 'expanded'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'src': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

