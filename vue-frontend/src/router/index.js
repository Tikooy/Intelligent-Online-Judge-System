import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/problems' },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue') },
  { path: '/problems', name: 'ProblemList', component: () => import('../views/ProblemListView.vue') },
  { path: '/problems/:id', name: 'ProblemDetail', component: () => import('../views/ProblemDetailView.vue') },
  {
    path: '/submissions',
    name: 'SubmissionList',
    component: () => import('../views/SubmissionListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/submissions/:id',
    name: 'SubmissionDetail',
    component: () => import('../views/SubmissionDetailView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/ranking', name: 'Ranking', component: () => import('../views/RankingView.vue') },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/problems',
    name: 'AdminProblems',
    component: () => import('../views/AdminProblemView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (auth.isLoggedIn && !auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/')
  }

  next()
})

export default router
