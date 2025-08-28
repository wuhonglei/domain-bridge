import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('域名桥接器内容脚本已加载');

    // 检测当前域名
    const currentDomain = window.location.hostname;
    console.log('当前域名:', currentDomain);
  }
});
