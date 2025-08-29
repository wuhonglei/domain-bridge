export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 自定义规则
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式调整
        'refactor', // 代码重构
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建过程或辅助工具的变动
        'ci', // CI/CD 相关
        'build', // 构建系统或外部依赖的变动
        'revert' // 回滚到上一个版本
      ]
    ],
    'subject-case': [0], // 允许任何大小写
    'subject-empty': [2, 'never'], // 主题不能为空
    'subject-full-stop': [2, 'never', '.'], // 主题不能以句号结尾
    'header-max-length': [2, 'always', 72], // 头部最大长度
    'body-max-line-length': [2, 'always', 100], // 正文每行最大长度
    'footer-max-line-length': [2, 'always', 100] // 脚注每行最大长度
  }
};
