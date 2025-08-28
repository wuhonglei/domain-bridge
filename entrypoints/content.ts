import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Domain Bridge Content Script Loaded');

    // 检测当前域名
    const currentDomain = window.location.hostname;
    console.log('Current domain:', currentDomain);
  }
});
