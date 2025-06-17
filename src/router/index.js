import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';
import MovieList from '@/views/MovieList.vue';
import MovieDetail from '@/views/MovieDetail.vue';
import CrewMemberDetail from '@/views/CrewMemberDetail.vue';
import UserLogin from '@/views/UserLogin.vue';
import UserRegister from '@/views/UserRegister.vue';
import UserProfile from '@/views/UserProfile.vue';
import MovieRecommendations from '@/views/MovieRecommendations.vue';
import AdminPanel from '@/views/AdminPanel.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MovieList,
  },
  {
    path: '/movies',
    name: 'Movies',
    component: MovieList,
  },
  {
    path: '/movies/:id',
    name: 'MovieDetail',
    component: MovieDetail,
  },
  {
    path: '/crew-member/:id',
    name: 'CrewMemberDetail',
    component: CrewMemberDetail,
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin,
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: UserRegister,
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/recommendations',
    name: 'MovieRecommendations',
    component: MovieRecommendations,
  },
  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useStore();
  const isAuthenticated = !!store.state.token;
  const isAdmin = store.state.user?.roles?.includes('ADMIN') || false;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/');
  }

  next();
});

export default router;