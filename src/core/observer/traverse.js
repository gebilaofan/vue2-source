/* @flow */

import { _Set as Set, isObject } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys

  // 判断val类型 如果满足条件则返回什么都不干
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    // 拿到 val 的 dep.id 用这个 id 来保证不回重复收集依赖
    if (seen.has(depId)) {
      return
    }

    // 添加订阅
    seen.add(depId)
  }

  // 数据为数组  村换数组 讲数组中的每一项递归调用
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    // 对象类型 循环对象中的所有key 并执行一次读取操作  再递归子值  val[keys[i]] 会触发getter
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
