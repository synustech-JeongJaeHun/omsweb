import { isNotFullEmpty } from './common'

export const passwordCase0 = (value) =>
  /^(?=.*[a-zA-Z]+)(?=.*[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]|.*[0-9]+).{6,15}$/.test(
    value,
  )

export const passwordCase1 = (value) =>
  /^(?=.*[0-9]+)(?=.*[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]|.*[a-zA-Z]+).{6,15}$/.test(
    value,
  )

export const passwordCase2 = (value) =>
  /^(?=.*[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]+)(?=.*[0-9]|.*[a-zA-Z]+).{6,15}$/.test(
    value,
  )

export const isNotEmpty = isNotFullEmpty
