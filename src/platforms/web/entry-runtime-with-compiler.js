/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'   // 运行时的 vue  复用 $mount 方法
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

// cached 方法在 shared/utils  创建了一个缓存版本
const idToTemplate = cached(id => {
  const el = query(id)    // 通过id查询dom元素 如果id为dom  则直接返回dom
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount    // 先缓存 $mount 方法 然后再重新定义 在./runtime/index中有定义  为了在 runtime only 时直接复用
Vue.prototype.$mount = function (     // 传入入口dom 或者id hydrating？？是啥   返回一个组件
  el?: string | Element,    // 挂载元素
  hydrating?: boolean       // 服务的渲染相关参数
): Component {
  el = el && query(el)  // 通过id查询dom元素 如果id为dom  则直接返回dom

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {   // 忽略 body document文档
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options   // 获取options 参数
  // resolve template/el and convert to render function
  // 解析模板/ el并转换为渲染功能
  if (!options.render) {    // render 不存在
    let template = options.template   // 这个就是 <template></template>中的dom
    if (template) {
      if (typeof template === 'string') {   // 模板字符串
        if (template.charAt(0) === '#') {   // template 为id  将id转换成模板  警告
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {   // dom 节点类型
        template = template.innerHTML
      } else {    // 既不是id  也不是dom节点  那是个啥
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {    // 存在 dom
      template = getOuterHTML(el)   // 除了包含innerHTML的全部内容外, 还包含对象标签本身  得到的是模板字符串
    }

    // 将获取到 template 通过 compileToFunctions 编译成 render
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')     // 性能标记 
      }

      // 编译器将模板编译成render函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)    // 执行原来的 mount
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
