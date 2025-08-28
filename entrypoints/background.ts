import { defineBackground } from 'wxt/utils/define-background';
import { browser } from 'wxt/browser';
import { createI18n } from '@wxt-dev/i18n';

const { t } = createI18n(); // 国际化

// 域名映射接口
interface DomainMapping {
  sourceDomain: string;
  targetDomains: string[];
}

// 默认域名映射
const defaultMappings: DomainMapping[] = [
  { sourceDomain: 'github.com', targetDomains: ['deepwiki.com', 'github.dev'] }
];

export default defineBackground(() => {
  console.log(t('background.extensionStarted'), { id: browser.runtime.id });

  // 初始化存储
  initializeStorage();

  // 创建右键菜单
  createContextMenus();

  // 监听右键菜单点击
  browser.contextMenus.onClicked.addListener(handleContextMenuClick);

  // 监听存储变化
  browser.storage.onChanged.addListener(handleStorageChange);
});

// 初始化存储
async function initializeStorage() {
  try {
    const result = await browser.storage.local.get('domainMappings');
    if (!result.domainMappings) {
      await browser.storage.local.set({ domainMappings: defaultMappings });
      console.log(t('background.defaultMappingsInitialized'));
    }
  } catch (error) {
    console.error(t('background.failedToInitialize'), error);
  }
}

// 创建右键菜单
async function createContextMenus() {
  try {
    // 清除现有菜单
    await browser.contextMenus.removeAll();

    // 获取当前域名映射
    const result = await browser.storage.local.get('domainMappings');
    const mappings: DomainMapping[] = result.domainMappings || defaultMappings;

    // 为每个源域名创建菜单项
    mappings.forEach((mapping) => {
      mapping.targetDomains.forEach((targetDomain) => {
        const menuId = `${mapping.sourceDomain}_${targetDomain}`;
        browser.contextMenus.create({
          id: menuId,
          title: t('mapping.openIn', [targetDomain.replace(/^www\./, '')]),
          contexts: ['page', 'link'],
          documentUrlPatterns: [`*://*.${mapping.sourceDomain}/*`]
        });
      });
    });
  } catch (error) {
    console.error(t('background.failedToCreateMenus'), error);
  }
}

// 处理右键菜单点击
async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  if (!tab?.url) return;

  try {
    const menuId = info.menuItemId as string;
    const [sourceDomain, targetDomain] = menuId.split('_');

    if (sourceDomain && targetDomain) {
      // 使用更简单的域名替换方法
      const url = new URL(tab.url);
      if (url.hostname === sourceDomain) {
        url.hostname = targetDomain;
        const newUrl = url.toString();

        // 在新标签页中打开
        await browser.tabs.create({ url: newUrl });
      }
    }
  } catch (error) {
    console.error(t('background.failedToHandleClick'), error);
  }
}

// 处理存储变化
function handleStorageChange(changes: {
  [key: string]: chrome.storage.StorageChange;
}) {
  if (changes.domainMappings) {
    console.log(t('background.contextMenusRecreated'));
    createContextMenus();
  }
}

// 导出函数供其他脚本使用
export async function getDomainMappings(): Promise<DomainMapping[]> {
  const result = await browser.storage.local.get('domainMappings');
  return result.domainMappings || defaultMappings;
}

export async function saveDomainMappings(
  mappings: DomainMapping[]
): Promise<void> {
  await browser.storage.local.set({ domainMappings: mappings });
}

export async function addDomainMapping(mapping: DomainMapping): Promise<void> {
  const mappings = await getDomainMappings();
  const existingIndex = mappings.findIndex(
    (m) => m.sourceDomain === mapping.sourceDomain
  );

  if (existingIndex >= 0) {
    mappings[existingIndex] = mapping;
  } else {
    mappings.push(mapping);
  }

  await saveDomainMappings(mappings);
}

export async function removeDomainMapping(sourceDomain: string): Promise<void> {
  const mappings = await getDomainMappings();
  const filteredMappings = mappings.filter(
    (m) => m.sourceDomain !== sourceDomain
  );
  await saveDomainMappings(filteredMappings);
}
