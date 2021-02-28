/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 将数组原型保存起来
const arrayProto = Array.prototype

// 用于保存重写的方法   Object.create使用者在调用非重写方法时，能够继承使用原生的方法
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 调用原生方法，存储返回值，用于设置重写函数的返回值
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted

    // 获取到插入的值，然后把新添加的值变成一个响应式对象
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }

    // 数据进行观测
    if (inserted) ob.observeArray(inserted)

    // notify change
    // 手动触发视图更新
    ob.dep.notify()
    return result
  })
})
