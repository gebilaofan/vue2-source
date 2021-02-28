/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)    // 性能标记
    }

    // a flag to avoid this being observed
    vm._isVue = true    // flag
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation    优化内部组件实例化
      // since dynamic options merging is pretty slow, and none of the  因为动态选项合并非常慢，而且没有
      // internal component options needs special treatment.    内部组件选项需要特殊处理。
      initInternalComponent(vm, options)    // 初始化内部组件
    } else {
      // 合并选项
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),    // 解析构造函数选项
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)   // 初始化代理
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)   // 初始化生命周期 src/core/instance/lifecycle.js
    initEvents(vm)      // 初始化eventBus src/core/instance/events.js
    initRender(vm)      // 初始化render src/core/instance/render.js
    callHook(vm, 'beforeCreate')     // 调用beforeCreate钩子
    initInjections(vm) // resolve injections before data/props    // 初始化inject src/core/instance/inject.js
    initState(vm)       // 初始化props、methods、data、computed与watch等状态数据  src/core/instance/state.js
    initProvide(vm) // resolve provide after data/props   // 初始化Provide after data/props  src/core/instance/inject.js
    callHook(vm, 'created')   // 调用created钩子

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {     // 检测 options 上有没有 el 属性  如果没有  需要进行手动挂载  vm.$mount
      vm.$mount(vm.$options.el)   // 挂载  不同平台的挂在方式不一致  src/platform/web/entry-runtime-with-compiler.js
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
