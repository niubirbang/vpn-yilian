import router from "@/router"
import store from "@/store"
import { ElMessageBox } from 'element-plus'
import { Error } from '@/notification'

const push = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    if (binding.value && typeof binding.value != 'string') {
      return
    }
    router.push(binding.value)
  })
}

const replace = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    if (binding.value && typeof binding.value != 'string') {
      return
    }
    router.replace(binding.value)
  })
}

const back = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    router.back()
  })
}

const fiveClick = (el, binding, vnode) => {
  let clickCount = 0
  let lastClickTime = 0
  const handleClick = () => {
    const currentTime = new Date().getTime()
    if (currentTime - lastClickTime < 1000) {
      clickCount += 1
    } else {
      clickCount = 1
    }
    lastClickTime = currentTime

    if (clickCount === 5) {
      binding.value()
      clickCount = 0
    }
  }
  el.__handleClick__ = handleClick
  el.addEventListener('click', handleClick)
}

const confirm = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    Confirm(binding.value)
  })
}

const showService = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    ShowService()
  })
}

const showQuestionAnswer = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    ShowQuestionAnswer()
  })
}

const showServicePolicy = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    ShowServicePolicy()
  })
}

const showPrivacyPolicy = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    ShowPrivacyPolicy()
  })
}

const showLogoutPolicy = (el, binding, vnode) => {
  el.addEventListener('click', () => {
    ShowLogoutPolicy()
  })
}

export const ShowService = () => {
  store.commit('setServiceShow', true)
}

export const ShowQuestionAnswer = () => {
  router.push('/question_answer')
  // router.push(`/third_page?url=${store.state.third_question_answer}`)

  // window.box_system.openWindow(store.state.third_question_answer, {
  //   width: 1000,
  //   height: 800,
  // }).catch(err => {
  //   Error(err)
  // })
}

export const Confirm = (param = {
  title: null,
  message: null,
  confirmButtonText: null,
  confirmDo: null,
  cancelButtonText: null,
  cancelDo: null,
}) => {
  ElMessageBox.confirm(
    param.message,
    param.title || '确认',
    {
      autofocus: false,
      confirmButtonText: param.confirmButtonText || '确定',
      cancelButtonText: param.cancelButtonText || '取消',
    },
  ).then(() => {
    if (param.confirmDo && typeof param.confirmDo == 'function') {
      param.confirmDo()
    }
  }).catch(() => {
    if (param.cancelDo && typeof param.cancelDo == 'function') {
      param.cancelDo()
    }
  })
}

export const ShowServicePolicy = () => {
  window.box_system.openWindow(store.state.third_service_policy, {
    width: 1000,
    height: 800,
  }).catch(err => {
    Error(err)
  })
}

export const ShowPrivacyPolicy = () => {
  window.box_system.openWindow(store.state.third_privacy_policy, {
    width: 1000,
    height: 800,
  }).catch(err => {
    Error(err)
  })
}

export const ShowLogoutPolicy = () => {
  window.box_system.openWindow(store.state.third_logout_policy, {
    width: 1000,
    height: 800,
  }).catch(err => {
    Error(err)
  })
}

export default {
  push,
  replace,
  back,
  fiveClick,
  confirm,
  showService,
  showQuestionAnswer,
  showServicePolicy,
  showPrivacyPolicy,
  showLogoutPolicy,
}