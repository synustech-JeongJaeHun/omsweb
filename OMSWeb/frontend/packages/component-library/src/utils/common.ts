import * as R from 'ramda'

export const getSortedValues = (sortedOpt, data) => {
  const { header, body: tbody } = data
  const { name, value } = sortedOpt
  const sortingOpt = value === 'asc'
    ? R.ascend<any>(R.prop(name))
    : R.descend<any>(R.prop(name))
  const ret = R.sortWith([sortingOpt], tbody)

  return {
    header,
    body: ret
  }
}
