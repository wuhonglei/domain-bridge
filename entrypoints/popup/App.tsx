import { useState, useEffect } from 'react';
import { browser } from 'wxt/browser';
import './App.css';

// 域名映射接口
interface DomainMapping {
  sourceDomain: string;
  targetDomains: string[];
}

function App() {
  const [mappings, setMappings] = useState<DomainMapping[]>([]);
  const [newMapping, setNewMapping] = useState<DomainMapping>({
    sourceDomain: '',
    targetDomains: ['']
  });
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // 加载域名映射
  useEffect(() => {
    loadMappings();
  }, []);

  // 从存储加载映射
  const loadMappings = async () => {
    try {
      const result = await browser.storage.local.get('domainMappings');
      const mappingsData = result.domainMappings || [];

      // 获取当前网页域名并排序映射
      const sortedMappings = await sortMappingsByCurrentDomain(mappingsData);
      setMappings(sortedMappings);
    } catch (error) {
      console.error('Failed to load mappings:', error);
    }
  };

  // 根据当前网页域名对映射进行排序
  const sortMappingsByCurrentDomain = async (mappingsData: DomainMapping[]) => {
    try {
      // 获取当前活动标签页
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      });
      if (!tab.url) return mappingsData;

      // 提取当前网页的域名
      const currentDomain = new URL(tab.url).hostname;

      // 排序：当前网页域名对应的映射放在最前面
      return mappingsData.sort((a, b) => {
        const aIsCurrent = a.sourceDomain === currentDomain;
        const bIsCurrent = b.sourceDomain === currentDomain;

        if (aIsCurrent && !bIsCurrent) return -1; // a 是当前域名，排在前面
        if (!aIsCurrent && bIsCurrent) return 1; // b 是当前域名，排在前面
        return 0; // 都不是当前域名，保持原有顺序
      });
    } catch (error) {
      console.error('Failed to sort mappings by current domain:', error);
      return mappingsData;
    }
  };

  // 保存映射到存储
  const saveMappings = async (newMappings: DomainMapping[]) => {
    try {
      await browser.storage.local.set({ domainMappings: newMappings });
      // 保存后重新排序并更新状态
      const sortedMappings = await sortMappingsByCurrentDomain(newMappings);
      setMappings(sortedMappings);
    } catch (error) {
      console.error('Failed to save mappings:', error);
    }
  };

  // 添加新的目标域名输入框
  const addTargetDomain = () => {
    setNewMapping((prev) => ({
      ...prev,
      targetDomains: [...prev.targetDomains, '']
    }));
  };

  // 移除目标域名输入框
  const removeTargetDomain = (index: number) => {
    setNewMapping((prev) => ({
      ...prev,
      targetDomains: prev.targetDomains.filter((_, i) => i !== index)
    }));
  };

  // 更新目标域名
  const updateTargetDomain = (index: number, value: string) => {
    setNewMapping((prev) => ({
      ...prev,
      targetDomains: prev.targetDomains.map((domain, i) =>
        i === index ? value : domain
      )
    }));
  };

  // 添加或更新映射
  const handleSubmit = () => {
    if (!newMapping.sourceDomain || newMapping.targetDomains.some((d) => !d)) {
      alert('请填写完整的域名信息');
      return;
    }

    const filteredTargetDomains = newMapping.targetDomains.filter((d) =>
      d.trim()
    );
    if (filteredTargetDomains.length === 0) {
      alert('请至少添加一个目标域名');
      return;
    }

    const mappingToSave = {
      sourceDomain: newMapping.sourceDomain.trim(),
      targetDomains: filteredTargetDomains
    };

    let newMappings: DomainMapping[];
    if (editingIndex >= 0) {
      // 编辑现有映射
      newMappings = [...mappings];
      newMappings[editingIndex] = mappingToSave;
      setEditingIndex(-1);
    } else {
      // 检查是否已存在相同的 sourceDomain
      const existingIndex = mappings.findIndex(
        (mapping) => mapping.sourceDomain === mappingToSave.sourceDomain
      );

      if (existingIndex >= 0) {
        // 如果已存在，合并 targetDomains 并去重
        const existingMapping = mappings[existingIndex];
        const mergedTargetDomains = [
          ...new Set([
            ...existingMapping.targetDomains,
            ...mappingToSave.targetDomains
          ])
        ];

        newMappings = [...mappings];
        newMappings[existingIndex] = {
          ...existingMapping,
          targetDomains: mergedTargetDomains
        };
      } else {
        // 如果不存在，添加新映射
        newMappings = [...mappings, mappingToSave];
      }
    }

    saveMappings(newMappings);
    resetForm();
  };

  // 编辑映射
  const handleEdit = (index: number) => {
    const mapping = mappings[index];
    setNewMapping({
      sourceDomain: mapping.sourceDomain,
      targetDomains: [...mapping.targetDomains]
    });
    setEditingIndex(index);
  };

  // 删除映射
  const handleDelete = (index: number) => {
    if (confirm('确定要删除这个域名映射吗？')) {
      const newMappings = mappings.filter((_, i) => i !== index);
      saveMappings(newMappings);
    }
  };

  // 重置表单
  const resetForm = () => {
    setNewMapping({
      sourceDomain: '',
      targetDomains: ['']
    });
    setEditingIndex(-1);
  };

  // 取消编辑
  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 w-96">
      <div className="w-full mx-auto space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            域名桥接器
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            配置网站的域名映射，支持
            <span className="font-semibold text-gray-600">右键菜单</span>
            快速切换
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            {editingIndex >= 0 ? '编辑域名映射' : '添加域名映射'}
          </h2>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              源域名:
            </label>
            <input
              type="text"
              placeholder="例如: github.com"
              value={newMapping.sourceDomain}
              onChange={(e) =>
                setNewMapping((prev) => ({
                  ...prev,
                  sourceDomain: e.target.value
                }))
              }
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              目标域名:
            </label>
            {newMapping.targetDomains.map((domain, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="例如: deepwiki.com"
                  value={domain}
                  onChange={(e) => updateTargetDomain(index, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {newMapping.targetDomains.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTargetDomain(index)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTargetDomain}
              className="w-full px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors border border-blue-200"
            >
              + 添加目标域名
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            >
              {editingIndex >= 0 ? '更新' : '添加'}
            </button>
            {editingIndex >= 0 && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            当前域名映射
          </h2>
          {mappings.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-sm">
              暂无域名映射配置
            </p>
          ) : (
            <div className="space-y-3">
              {mappings.map((mapping, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
                >
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {mapping.sourceDomain}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mapping.targetDomains.map((domain, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
