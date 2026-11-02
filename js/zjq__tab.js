/* =========================================================
   选项卡组件（Tab）—— 原生 JavaScript，可复用
   作者：赵俊清
   命名规范：所有 JS 变量、函数、类名、ID 均以 zjq__ 开头

   用法：
     1) HTML 中给选项卡根容器加 data-zjq__tabs 属性；
        可选 data-zjq__default="0" 指定默认选中项（从 0 开始）。
     2) 页面引入本文件即可自动初始化所有选项卡组；
        也可手动调用 zjq__initTabs(元素) 初始化指定的一组。
   核心逻辑：
     切换时【先清除所有选项卡的选中状态】，再【设置当前元素的选中状态】。
   ========================================================= */

(function (window, document) {
  'use strict';

  /* ---------------- 1. 配置项 ---------------- */
  var zjq__CONFIG = {
    rootSelector: '[data-zjq__tabs]',
    tabSelector: '.zjq__tab',
    panelSelector: '.zjq__panel',
    activeTabClass: 'zjq__tab--active',
    activePanelClass: 'zjq__panel--active',
    selectedAttr: 'aria-selected',
    tabIndexAttr: 'tabindex',
    defaultIndexAttr: 'data-zjq__default',
    readyAttr: 'data-zjq__ready'
  };

  /* 保存所有已初始化的实例，便于外部统一切换 / 销毁 */
  var zjq__instances = [];

  /* ---------------- 2. 工具函数 ---------------- */
  function zjq__toArray(zjq__nodeList) {
    return Array.prototype.slice.call(zjq__nodeList);
  }

  /* 只取属于当前根容器的子项，避免嵌套选项卡互相干扰 */
  function zjq__pickChildren(zjq__root, zjq__selector) {
    return zjq__toArray(zjq__root.querySelectorAll(zjq__selector)).filter(function (zjq__node) {
      return zjq__node.closest(zjq__CONFIG.rootSelector) === zjq__root;
    });
  }

  /* ---------------- 3. 核心：清除 / 设置选中状态 ---------------- */

  /* 第一步：清除所有选项卡的选中状态（类名 + 无障碍属性 + 面板可见性） */
  function zjq__clearActive(zjq__instance) {
    zjq__instance.tabs.forEach(function (zjq__tab) {
      zjq__tab.classList.remove(zjq__CONFIG.activeTabClass);
      zjq__tab.setAttribute(zjq__CONFIG.selectedAttr, 'false');
      zjq__tab.setAttribute(zjq__CONFIG.tabIndexAttr, '-1');
    });

    zjq__instance.panels.forEach(function (zjq__panel) {
      zjq__panel.classList.remove(zjq__CONFIG.activePanelClass);
      zjq__panel.hidden = true;
    });
  }

  /* 第二步：设置当前元素的选中状态 */
  function zjq__applyActive(zjq__instance, zjq__index) {
    var zjq__tab = zjq__instance.tabs[zjq__index];
    var zjq__panel = zjq__instance.panels[zjq__index];

    zjq__tab.classList.add(zjq__CONFIG.activeTabClass);
    zjq__tab.setAttribute(zjq__CONFIG.selectedAttr, 'true');
    zjq__tab.setAttribute(zjq__CONFIG.tabIndexAttr, '0');

    if (zjq__panel) {
      zjq__panel.classList.add(zjq__CONFIG.activePanelClass);
      zjq__panel.hidden = false;
    }
  }

  /* 切换指定序号：先清除全部，再设置当前 */
  function zjq__activate(zjq__instance, zjq__index, zjq__shouldFocus) {
    if (zjq__index < 0 || zjq__index >= zjq__instance.length) {
      return;
    }
    if (zjq__index === zjq__instance.index) {
      return;
    }

    /* ① 清除所有选项卡的选中状态 */
    zjq__clearActive(zjq__instance);

    /* ② 再设置当前元素（被点击的选项卡）的选中状态 */
    zjq__applyActive(zjq__instance, zjq__index);

    zjq__instance.index = zjq__index;

    if (zjq__shouldFocus) {
      zjq__instance.tabs[zjq__index].focus();
    }

    /* 抛出自定义事件，方便外部做联动（如埋点、切换标题） */
    if (typeof window.CustomEvent === 'function') {
      zjq__instance.root.dispatchEvent(new window.CustomEvent('zjq__tabchange', {
        detail: {
          index: zjq__index,
          tab: zjq__instance.tabs[zjq__index],
          panel: zjq__instance.panels[zjq__index]
        }
      }));
    }
  }

  /* ---------------- 4. 事件处理 ---------------- */
  function zjq__handleClick(zjq__instance, zjq__event) {
    var zjq__tab = zjq__event.target.closest(zjq__CONFIG.tabSelector);

    /* 点击的不是本组选项卡则忽略 */
    if (!zjq__tab || zjq__tab.closest(zjq__CONFIG.rootSelector) !== zjq__instance.root) {
      return;
    }

    var zjq__index = zjq__instance.tabs.indexOf(zjq__tab);
    if (zjq__index === -1) {
      return;
    }

    zjq__event.preventDefault();
    zjq__activate(zjq__instance, zjq__index, false);
  }

  /* 键盘操作：左右方向键切换，Home / End 跳到首尾（无障碍增强） */
  function zjq__handleKeydown(zjq__instance, zjq__event) {
    /* 只在选项卡上响应键盘操作 */
    if (zjq__instance.tabs.indexOf(zjq__event.target) === -1) {
      return;
    }

    var zjq__key = zjq__event.key;
    var zjq__total = zjq__instance.length;
    var zjq__next = zjq__instance.index;

    if (zjq__key === 'ArrowRight' || zjq__key === 'ArrowDown') {
      zjq__next = (zjq__instance.index + 1) % zjq__total;
    } else if (zjq__key === 'ArrowLeft' || zjq__key === 'ArrowUp') {
      zjq__next = (zjq__instance.index - 1 + zjq__total) % zjq__total;
    } else if (zjq__key === 'Home') {
      zjq__next = 0;
    } else if (zjq__key === 'End') {
      zjq__next = zjq__total - 1;
    } else {
      return;
    }

    zjq__event.preventDefault();
    zjq__activate(zjq__instance, zjq__next, true);
  }

  /* ---------------- 5. 初始化 ---------------- */
  function zjq__initTabs(zjq__root, zjq__options) {
    if (!zjq__root) {
      return null;
    }

    /* 已经初始化过就跳过，避免重复绑定事件 */
    if (zjq__root.getAttribute(zjq__CONFIG.readyAttr) === 'true') {
      return null;
    }

    var zjq__settings = zjq__options || {};
    var zjq__tabs = zjq__pickChildren(zjq__root, zjq__CONFIG.tabSelector);
    var zjq__panels = zjq__pickChildren(zjq__root, zjq__CONFIG.panelSelector);

    if (zjq__tabs.length === 0 || zjq__panels.length === 0) {
      return null;
    }

    var zjq__defaultIndex = parseInt(zjq__root.getAttribute(zjq__CONFIG.defaultIndexAttr), 10);

    if (isNaN(zjq__defaultIndex)) {
      zjq__defaultIndex = zjq__tabs.findIndex(function (zjq__tab) {
        return zjq__tab.classList.contains(zjq__CONFIG.activeTabClass);
      });
    }
    if (zjq__defaultIndex < 0) {
      zjq__defaultIndex = 0;
    }

    /* 实例对象：保存这一组选项卡的状态与元素引用 */
    var zjq__instance = {
      root: zjq__root,
      tabs: zjq__tabs,
      panels: zjq__panels,
      length: Math.min(zjq__tabs.length, zjq__panels.length),
      index: -1,
      activate: function (zjq__index) {
        zjq__activate(zjq__instance, zjq__index, false);
      },
      getIndex: function () {
        return zjq__instance.index;
      },
      destroy: function () {
        zjq__root.removeAttribute(zjq__CONFIG.readyAttr);
        zjq__instances.splice(zjq__instances.indexOf(zjq__instance), 1);
      }
    };

    if (typeof zjq__settings.onChange === 'function') {
      zjq__root.addEventListener('zjq__tabchange', zjq__settings.onChange);
    }

    /* 绑定事件监听：点击 + 键盘 */
    zjq__root.addEventListener('click', function (zjq__event) {
      zjq__handleClick(zjq__instance, zjq__event);
    });

    zjq__root.addEventListener('keydown', function (zjq__event) {
      zjq__handleKeydown(zjq__instance, zjq__event);
    });

    zjq__root.setAttribute(zjq__CONFIG.readyAttr, 'true');
    zjq__instances.push(zjq__instance);

    /* 应用默认选中项：先清除所有选中状态，再设置默认项 */
    zjq__clearActive(zjq__instance);
    zjq__applyActive(zjq__instance, zjq__defaultIndex);
    zjq__instance.index = zjq__defaultIndex;

    return zjq__instance;
  }

  /* 初始化页面上所有选项卡组（同一份代码驱动多个实例 = 可复用） */
  function zjq__initAll() {
    zjq__toArray(document.querySelectorAll(zjq__CONFIG.rootSelector)).forEach(function (zjq__root) {
      zjq__initTabs(zjq__root);
    });
  }

  /* ---------------- 6. 对外暴露 ---------------- */
  window.zjq__initTabs = zjq__initTabs;
  window.zjq__initAllTabs = zjq__initAll;
  window.zjq__getInstances = function () {
    return zjq__instances.slice();
  };

  /* DOM 解析完成后自动初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', zjq__initAll);
  } else {
    zjq__initAll();
  }
})(window, document);
