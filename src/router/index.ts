import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SubscriptionView from '@/views/SubscriptionView.vue'
import MDataViewVue from '@/views/MDataView.vue'
import FundViewVue from '@/views/FundView.vue'
import SubmissionViewVue from '@/views/SubmissionView.vue'
import ContractorViewVue from '@/views/ContractorView.vue'
import AppliesViewVue from '@/views/AppliesView.vue'
import UsersView from '@/views/UsersView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuth } from '@/auth'
import InventoryViewVue from '@/views/InventoryView.vue'
import PurchaseViewVue from '@/views/PurchaseView.vue'
import MDataAddViewVue from '@/views/MDataAddView.vue'
import UserPageVue from '@/views/UserPage.vue'
import ContractorAddView from '@/views/ContractorAddView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: SubscriptionView,
      meta: { requiresAuth: true }
    },
    {
      path: '/m-data',
      name: 'm-data',
      component: MDataViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/m-data/add',
      name: 'm-data-add',
      component: MDataAddViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/fund',
      name: 'fund',
      component: FundViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/submission',
      name: 'submission',
      component: SubmissionViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/contractor',
      name: 'contractor',
      component: ContractorViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/applies',
      name: 'applies',
      component: AppliesViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/purchase',
      name: 'purchase',
      component: PurchaseViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'userPage',
      component: UserPageVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/contractor/add',
      name: 'contractorAddPage',
      component: ContractorAddView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const auth = useAuth()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!auth.user.value) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
