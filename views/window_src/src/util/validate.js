import i18n from '@/i18n'

const $t = i18n.global.t

const phoneReg = new RegExp(`^1[1-9]\\d{9}$`)
const phoneCodeReg = new RegExp(`^[A-Za-z0-9]+$`)
const passwordReg = new RegExp(`^[a-zA-Z0-9]{8,18}$`)
const inviteCodeReg = new RegExp(`^[A-Za-z0-9]+$`)

export const PhoneTest = (v, must) => {
  return reg_test('phone', v, 'string', phoneReg, must)
}

export const PhoneCodeTest = (v, must) => {
  return reg_test('phone_code', v, 'string', phoneCodeReg, must)
}

export const PasswordTest = (v, must) => {
  return reg_test('password', v, 'string', passwordReg, must)
}

export const InviteCodeTest = (v, must) => {
  return reg_test('invite_code', v, 'string', inviteCodeReg, must)
}


const reg_test = (t_code, v, v_type, reg, must) => {
  if (typeof v !== v_type) {
    return $t(`input_invalid`)
  }
  if (must) {
    const _must = check_must(t_code, v)
    if (_must) {
      return _must
    }
  } else if (is_zero_value(v)) {
    return null
  }
  if (!reg.test(v)) {
    return `${$t(`input_${t_code}_invalid`)} ${$t(`input_${t_code}_invalid_rule`)}`
  }
  return null
}

const check_must = (t_code, v) => {
  if (v === null || v === undefined || is_zero_value(v)) {
    return $t(`input_${t_code}_must`)
  }
}

function is_zero_value(v) {
  if (v === null || v === undefined) {
    return true
  }
  switch (typeof v) {
    case 'number':
      return v === 0
    case 'string':
      return v === ''
    case 'boolean':
      return v === false
    case 'object':
      if (Array.isArray(v)) {
        return v.length === 0
      }
      return Object.keys(v).length === 0 && v.constructor === Object
    default:
      return false
  }
}
