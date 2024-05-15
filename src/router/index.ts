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
import InventoryWriteOffView from '@/views/InventoryWriteOffView.vue'
import ContestPage from '@/views/ContestPage.vue'
import EntityView from '@/views/EntityView.vue'
import OrganizationsListView from '@/views/OrganizationsListView.vue'
import OrganizationApplies from '@/views/OrganizationApplies.vue'
import OrganizationRequests from '@/views/OrganizationRequests.vue'
import OrganizationPage from '@/views/OrganizationPage.vue'
import MDataEditView from '@/views/MDataEditView.vue'
import InventoryDeclineView from '@/views/InventoryDeclineView.vue'
import ApplyView from '@/views/ApplyView.vue'

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
      path: '/m-data/edit/:id',
      name: 'm-data-edit',
      component: MDataEditView,
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
      path: '/apply',
      name: 'applyView',
      component: ApplyView,
      meta: { requiresAuth: false }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryViewVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/write-off',
      name: 'inventoryWriteOff',
      component: InventoryWriteOffView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/decline',
      name: 'inventoryDecline',
      component: InventoryDeclineView,
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
    },
    {
      path: '/contest',
      name: 'contest',
      component: ContestPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/publisher',
      name: 'publisher',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/language',
      name: 'language',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/bookState',
      name: 'bookState',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/bbk',
      name: 'bbk',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/udk',
      name: 'udk',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/author',
      name: 'author',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/bookAdmission',
      name: 'bookAdmission',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/genre',
      name: 'genre',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/ageCharacteristic',
      name: 'ageCharacteristic',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/binding',
      name: 'binding',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/contentType',
      name: 'contentType',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/copyrightSign',
      name: 'copyrightSign',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizations',
      name: 'organizationList',
      component: OrganizationsListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizations/:id',
      name: 'organizationPage',
      component: OrganizationPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizationTypes',
      name: 'organizationTypes',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizationApplies',
      name: 'organizationApplies',
      component: OrganizationApplies,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizationRequests',
      name: 'organizationRequests',
      component: OrganizationRequests,
      meta: { requiresAuth: true }
    },
    {
      path: '/userRoles',
      name: 'userRoles',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/country',
      name: 'country',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/educationLevel',
      name: 'educationLevel',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/bookType',
      name: 'bookType',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/tag',
      name: 'tag',
      component: EntityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/material',
      name: 'material',
      component: EntityView,
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
