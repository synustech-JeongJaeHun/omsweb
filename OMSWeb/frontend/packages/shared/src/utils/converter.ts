/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
// @ts-nocheck
import * as R from 'ramda'
import { color } from '@synusdev/styles'
import { calcColor5, calcColor5Reversed } from './colorVariant'


function getChildren(parent, path, breadcrumb, items, isReversed) {
  const calcColor = isReversed ? calcColor5Reversed: calcColor5
  return items.reduce((acc, item, i) => {
    const { children } = item
    const _item = R.omit(['children', 'uid', 'parentId'], item)
    if (_item.score !== undefined) {
      _item.score = Math.floor(_item.score)
    }
    _item.id = `${parent === '' ? '0.0' : parent + (i + 1)}`
    _item.path = `${path === '/' ? '' : path}/${_item.resource_id || _item.resourceId}`
    _item.breadcrumb = `${breadcrumb === '/' ? '' : breadcrumb}/${_item.name}`
    _item.color = _item.score !== undefined ? calcColor(_item.score) : '#727D9D'
    _item.parent = parent

    if (children === undefined || (children && children.length === 0)) {
      _item.value = 1
    }

    acc.push(_item)

    if (children) {
      acc.push(getChildren(_item.id, _item.path, _item.breadcrumb, children, isReversed))
    }
    return acc
  }, [])
}

export const treeToSun = (data, isReversed = false) => R.flatten(getChildren('', '/', '/', [data], isReversed))

function getExpandedList(items) {
  return items.reduce((acc, item, i) => {
    const { children, resource_id, resourceId } = item
    if (children && children.length > 0) {
      acc.push(resource_id || resourceId)
      acc.push(getExpandedList(children))
    }
    return acc
  }, [])
}

export const expandedList = (data) => R.flatten(getExpandedList([data]))


export function toPackedBubble(data) {
  data = data.map(item => {
    item.value = 1
    return item
  })

  const serverOffList = data.filter(R.propEq('server_on', false))
  const lastList = R.reject(R.propEq('server_on', false), data)

  const dic = {
    a: ['여유', color.healthLv1],
    b: ['충분', color.healthLv2],
    c: ['부족', color.healthLv3],
    d: ['심각', color.healthLv4],
    f: ['위험', color.healthLv5],
  }

  const byScore = R.groupBy(function(list: any) {
    const score = list.score
    return score < 20 ? 'f' :
           score < 40 ? 'd' :
           score < 60 ? 'c' :
           score < 80 ? 'b' : 'a'
  })

  const list = byScore(lastList)

  const mapper = key => ({
    name: dic[key][0],
    color: dic[key][1],
    data: list[key]
  })

  const serverOff = [{
    name: '절전 호스트',
    color: '#7B8D87',
    data: serverOffList
  }]

  return R.compose(R.concat(serverOff), R.map(mapper), R.keys)(list)
}


function addExtraToChildren(path, breadcrumb, items) {
  return items.reduce((acc, item, i) => {
    const { children } = item
    const _item = R.omit(['children'], item)
    _item.path = `${path === '/' ? '' : path}/${_item.resource_id || _item.resourceId}`
    _item.breadcrumb = `${breadcrumb === '/' ? '' : breadcrumb}/${_item.name}`

    acc.push(_item)

    if (children) {
      _item.children = addExtraToChildren(_item.path, _item.breadcrumb, children)
    }
    return acc
  }, [])
}

export const treeToAddExtra = data => {
  const ret = addExtraToChildren('/', '/', [data])
  return R.head(ret)
}
