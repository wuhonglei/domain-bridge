# 自动化发布流程

本项目使用 GitHub Actions 实现自动化构建和发布。当推送新的版本标签时，会自动触发构建流程并发布到 GitHub Releases。

## 工作流程

1. **推送标签**: 当执行 `git push --tags` 推送以 `v` 开头的标签时
2. **自动触发**: GitHub Actions 自动检测标签推送并启动工作流
3. **构建扩展**: 执行 `npm run build` 构建扩展
4. **打包**: 执行 `npm run zip` 创建 Chrome 扩展的 zip 包
5. **创建 Release**: 自动创建 GitHub Release
6. **上传资源**: 将构建好的 zip 包上传到 Release 页面

## 使用方法

### 1. 更新版本号

在 `package.json` 中更新版本号：

```json
{
  "version": "1.0.0"
}
```

### 2. 创建并推送标签

```bash
# 创建标签
git tag v1.0.0

# 推送标签到远程仓库
git push --tags
```

### 3. 查看发布状态

- 在 GitHub 仓库的 "Actions" 标签页查看工作流执行状态
- 在 "Releases" 标签页查看已发布的版本

## 工作流文件

工作流配置文件位于 `.github/workflows/release.yml`，主要功能包括：

- 自动检测版本标签推送
- 使用 Node.js 20 环境
- 缓存 npm 依赖以加速构建
- 自动构建和打包扩展
- 创建 Release 并上传构建产物

## 注意事项

- 标签必须以 `v` 开头（如 `v1.0.0`、`v2.1.3`）
- 确保 `package.json` 中的版本号与标签版本一致
- 工作流会自动使用 `GITHUB_TOKEN` 进行身份验证
- 构建产物会以 `domain-bridge-{version}-chrome.zip` 的格式命名

## 故障排除

如果发布失败，请检查：

1. 标签格式是否正确（必须以 `v` 开头）
2. `package.json` 中的版本号是否有效
3. GitHub Actions 的执行日志中是否有错误信息
4. 仓库权限设置是否正确
