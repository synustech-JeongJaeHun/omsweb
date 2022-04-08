/* eslint-disable no-param-reassign */
// @ts-nocheck
import * as R from 'ramda'
import { isFullEmpty } from './common'

function getChildren(parentId, path, breadcrumb, items, lv, navSetting) {
  const _lv = lv + 1
  return items.reduce((acc, item, i) => {
    const { children } = item
    const _item = R.omit(['children'], item)
    _item.uid = `${parentId === '0' ? '0.0' : parentId + (i + 1)}`
    _item.path = `${path === '/' ? '' : path}/${
      _item.resource_id || _item.resourceId
    }`
    _item.breadcrumb = `${breadcrumb === '/' ? '' : breadcrumb}/${_item.name}`
    _item.parentId = parentId
    _item.lv = _lv
    _item.disabled = !R.includes(_lv, navSetting.enabledLv)

    acc.push(_item)

    if (children) {
      acc.push(
        getChildren(
          _item.uid,
          _item.path,
          _item.breadcrumb,
          children,
          _lv,
          navSetting,
        ),
      )
    }
    return acc
  }, [])
}

const getNestedData = (navSetting) => (data) =>
  getChildren('0', '/', '/', [data], 0, navSetting)

const getUniq = (data) => {
  data = data.reduce((acc, item, i) => {
    const key = item.resource_id || item.resourceId
    if (acc[key] === undefined) {
      acc[key] = item
    }
    return acc
  }, {})

  return R.values(data)
}

const whiteList = (navSetting) => (data) => {
  const ret = R.compose(
    R.filter((item) => R.includes(item.lv, navSetting.showedLv)),
  )(data)

  return ret
}

const blacklist = (data) => {
  const ret = R.compose(
    R.reject(R.propEq('path', '/openstack20200709080543/RegionOne/internal')),
  )(data)

  return ret
}

const listToTree = (list) => {
  const map = {}
  let node
  const roots = []
  let i

  for (i = 0; i < list.length; i += 1) {
    map[list[i].uid] = i
    list[i].children = []
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i]
    if (node.parentId !== '0') {
      list[map[node.parentId]].children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

const log = (name) => (item) => {
  console.log(name, item)
  return item
}

export const uniqTree = (navSetting) => (treeData) =>
  R.ifElse(
    isFullEmpty,
    R.always({}),
    R.compose(
      R.head,
      listToTree,
      blacklist,
      whiteList(navSetting),
      getUniq,
      R.flatten,
      getNestedData(navSetting),
    ),
  )(treeData)


