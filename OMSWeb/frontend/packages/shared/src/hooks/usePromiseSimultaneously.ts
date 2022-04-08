// @ts-nocheck
import { useRef, useEffect, useState } from 'react'
import { useImmer } from 'use-immer'

function setTasks(tasks) {
  const temp = new Map()
  tasks.forEach(({ key, value}) => {
    temp.set(key, value)
  })
  return temp
}

const usePromiseSimultaneously = (tasks) => {
  const todo: Map<string, any> = setTasks(tasks)
  const total = tasks.length
  const [complete, addComplete] = useImmer({})
  const [isComplete, setComplete] = useState(false)
  
  useEffect(() => {
    todo.forEach(async (value, key) => {
      const { data } = await value()
      addComplete((draft) => {
        draft[key] = data
        const completeLength = Object.keys(draft).length
        setComplete(total === completeLength)
      })
    })
  }, [])
  

  return [complete, isComplete]

}

export default usePromiseSimultaneously