# 域名桥接器安装指南

## 🚀 快速开始

### 1. 构建扩展

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 或者启动开发模式
npm run dev
```

### 2. 在Chrome中安装

1. 打开Chrome浏览器
2. 在地址栏输入：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录下的 `.output/chrome-mv3` 文件夹

### 3. 验证安装

- 在浏览器右上角应该能看到扩展图标
- 点击图标应该能打开配置界面
- 在任何网页上右键应该能看到域名切换选项（如果已配置）

## 📋 功能配置

### 添加域名映射

1. **点击扩展图标**打开配置界面
2. **输入源域名**：例如 `github.com`
3. **添加目标域名**：例如 `deepwiki.com`、`github.dev`
4. **点击"添加"**保存配置

### 配置示例

```
源域名: github.com
目标域名: 
- deepwiki.com
- github.dev
- github.com
```

## 🎯 使用方法

### 右键菜单切换

1. 在配置的网站上（如 github.com）
2. 右键点击页面或链接
3. 选择"在 [域名] 中打开"
4. 新标签页将打开对应的域名

### 页面提示

- 在配置的网站上，页面右上角会显示域名选择器
- 显示当前可用的域名选项
- 点击按钮可直接切换域名

## 🔧 故障排除

### 常见问题

#### 1. 扩展图标不显示
- 检查 `chrome://extensions/` 中的扩展状态
- 确认扩展已启用
- 尝试重新加载扩展

#### 2. 右键菜单不显示
- 检查域名映射配置是否正确
- 确认当前网站是否在配置列表中
- 检查浏览器控制台是否有错误信息

#### 3. 页面提示不显示
- 确认内容脚本是否正确注入
- 检查域名匹配规则
- 查看控制台日志

#### 4. 配置不保存
- 检查存储权限是否正确授予
- 尝试重新添加配置
- 检查浏览器存储设置

### 调试技巧

1. **查看控制台日志**
   - 在扩展管理页面点击"检查视图"
   - 查看popup的控制台输出

2. **检查后台脚本**
   - 在扩展管理页面点击"service worker"
   - 查看background script的日志

3. **检查内容脚本**
   - 在网页开发者工具中查看控制台
   - 查找来自扩展的日志信息

## 📱 支持的浏览器

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Opera 74+
- ❌ Firefox (需要额外配置)

## 🔒 权限说明

扩展需要以下权限：

- **storage**: 存储域名映射配置
- **contextMenus**: 创建右键菜单
- **tabs**: 在新标签页中打开链接
- **activeTab**: 访问当前活动标签页
- **host_permissions**: 访问所有网站以检测域名

## 🚀 高级功能

### 自定义域名规则

支持以下域名格式：
- 完整域名：`github.com`
- 子域名：`*.github.com`
- 通配符：`github.*`

### 批量导入导出

可以通过浏览器存储API手动导入导出配置：

```javascript
// 导出配置
chrome.storage.local.get('domainMappings', (result) => {
  console.log(JSON.stringify(result.domainMappings, null, 2));
});

// 导入配置
chrome.storage.local.set({
  domainMappings: [
    {
      sourceDomain: 'github.com',
      targetDomains: ['deepwiki.com', 'github.dev']
    }
  ]
});
```

## 📞 技术支持

如果遇到问题：

1. 检查控制台错误信息
2. 查看扩展权限设置
3. 尝试重新安装扩展
4. 提交Issue到项目仓库

## 🔄 更新扩展

1. 重新构建项目：`npm run build`
2. 在 `chrome://extensions/` 中点击"重新加载"
3. 或者删除后重新加载扩展

---

**注意**: 这是一个开发中的扩展，功能可能会持续改进。建议定期检查更新。
