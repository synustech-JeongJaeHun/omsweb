/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/prefer-default-export */
import v from 'validator'
import {
  passwordCase0,
  passwordCase1,
  passwordCase2,
  isNotEmpty,
} from './validate'

const errorDic = {
  isEmail: '이메일 형식이 아닙니다.',
  password: '영문·숫자·특수문자 조합 6자리 이상 입력하세요.',
  checkEmpty: '값을 입력해 주세요',
}

export const isEmail = (value) => (v.isEmail(value) ? '' : errorDic.isEmail)
export const password = (value) =>
  value &&
  (passwordCase0(value) || passwordCase1(value) || passwordCase2(value))
    ? ''
    : errorDic.password

export const checkEmpty = (value) =>
  isNotEmpty(value) ? '' : errorDic.checkEmpty
