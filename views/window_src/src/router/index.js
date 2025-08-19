import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const noauth = true
const notitle = true
const nobackup = true
const tabbar = true

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/bind_phone',
      name: 'bind_phone',
      component: () => import('@/views/BindPhone.vue'),
      meta: {},
    },
    {
      path: '/bind_email',
      name: 'bind_email',
      component: () => import('@/views/BindEmail.vue'),
      meta: {},
    },
    {
      path: '/invite',
      name: 'invite',
      component: () => import('@/views/Invite.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/recharge',
      name: 'recharge',
      component: () => import('@/views/Recharge.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/application',
      name: 'application',
      component: () => import('@/views/Application.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/User.vue'),
      meta: {
        noauth,
        tabbar,
        nobackup,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthLogin.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/registe',
      name: 'registe',
      component: () => import('@/views/AuthRegiste.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/forget_password',
      name: 'forget_password',
      component: () => import('@/views/PasswordForget.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/about_us',
      name: 'about_us',
      component: () => import('@/views/AboutUs.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/question_answer',
      name: 'question_answer',
      component: () => import('@/views/QuestionAnswer.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/third_page',
      name: 'third_page',
      component: () => import('@/views/ThirdPage.vue'),
      meta: {
        noauth,
      },
    },
    {
      path: '/node',
      name: 'node',
      component: () => import('@/views/Node.vue'),
      meta: {},
    },
    {
      path: '/invite_bind',
      name: 'invite_bind',
      component: () => import('@/views/InviteBind.vue'),
      meta: {},
    },
    {
      path: '/invite_history',
      name: 'invite_history',
      component: () => import('@/views/InviteHistory.vue'),
      meta: {},
    },
    {
      path: '/invite_award',
      name: 'invite_award',
      component: () => import('@/views/InviteAward.vue'),
      meta: {},
    },
    {
      path: '/delete_account',
      name: 'delete_account',
      component: () => import('@/views/DeleteAccount.vue'),
      meta: {},
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/Test.vue'),
      meta: {
        noauth,
      },
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (store.state.authorized && ['/login', '/registe', '/forget_password'].includes(to.path)) {
    next('/')
    return
  }
  if (to.meta && to.meta.noauth) {
    next()
    return
  }
  if (!store.state.authorized) {
    next({
      path: '/login',
      query: {
        from: to.path,
      },
    })
    return
  }
  next()
})

router.original_back = router.back
router.back = (param) => {
  if (window?.history?.length > 1) {
    router.original_back(param)
  } else {
    router.push('/')
  }
}

export default router
