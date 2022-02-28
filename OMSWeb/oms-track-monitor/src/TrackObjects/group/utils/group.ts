import { IGroup } from "src/legacies/models/track.model"
import { Color } from "src/types/Color"

function makeGroups(groups: IGroup[]) {
  return groups.map(g => ({
    ...g,
    color: g.color as keyof typeof Color
  }))
}

export { makeGroups }