// 引入依赖，定义 Vue 构造函数，然后以Vue构造函数为参数，调用了五个方法，最后导出 Vue

//  这里是vue 真正的入口文件  这里创建vue 构造函数  vue也是从这里导出去
// 为啥不用es6 的 class 类实现呢
/*我们往后看这里有很多 xxxMixin 的函数调用，并把 Vue 当参数传入，它们的功能都是给 Vue 的 prototype 上扩展一些方法（这里具体的细节会在之后的文章介绍，这里不展开），
  Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，这种方式是用 Class 难以实现的。 
  不用ES6的Class语法是因为mixin模块划分的方便
 */
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)     // 这里执行的是 initMixin 方法 在Vue.prototype中挂载 _init 方法
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
