import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/pod/list'
  },
  {
    path: '/node',
    component: Layout,
    redirect: '/node/list',
    name: 'Node',
    meta: {title: 'Node Management', icon: 'node'},
    children: [
      {
        path: 'list',
        name: 'NodeList',
        component: () => import('@/views/node/index'),
        meta: {title: 'Node Management', icon: 'node'}
      },
      {
        path: 'edit',
        name: 'Node',
        component: () => import('@/views/node/edit'),
        meta: {title: 'Edit Node', icon: 'node', activeMenu: "/node/list"},
        hidden: true
      }
    ]
  },
  {
    path: '/pod',
    component: Layout,
    redirect: '/pod/list',
    name: 'Pod',
    meta: {
      title: 'Pod Management',
      icon: 'pod'
    },
    children: [
      {
        path: 'list',
        name: 'PodList',
        component: () => import('@/views/pod/index'),
        meta: { title: 'Pod List', icon: 'pod' }
      },
      {
        path: 'create',
        name: 'PodCreate',
        component: () => import('@/views/pod/create'),
        meta: { title: 'Create Pod', icon: 'pod', activeMenu: "/pod/list" },
        hidden: true
      },
      {
        path: 'detail',
        name: 'PodDetail',
        component: () => import('@/views/pod/detail'),
        meta: { title: 'Pod Details', icon: 'pod', activeMenu: "/pod/list" },
        hidden: true
      }
    ]
  },
  {
    path: '/network',
    component: Layout,
    redirect: '/network/services',
    name: 'Network',
    meta: {title: 'Service Discovery', icon: 'link'},
    alwaysShow: true, // Always show the root menu
    children: [
      {
        path: 'services',
        name: 'Services',
        component: () => import('@/views/service/index'),
        meta: {title: 'Services', icon: 'service'}
      },
      {
        path: 'service-detail',
        name: 'ServiceDetail',
        component: () => import('@/views/service/detail'),
        meta: {title: 'Service Details', icon: 'service', activeMenu: "/network/services"},
        hidden: true
      },
      {
        path: 'service-edit',
        name: 'ServiceEdit',
        component: () => import('@/views/service/edit'),
        meta: {title: 'Edit Service', icon: 'service', activeMenu: "/network/services"},
        hidden: true
      },
      {
        path: 'service-create',
        name: 'ServiceCreate',
        component: () => import('@/views/service/edit'),
        meta: {title: 'Create Service', icon: 'service', activeMenu: "/network/services"},
        hidden: true
      },
      {
        path: 'ingresses',
        name: 'Ingresses',
        component: () => import('@/views/ingress/index'),
        meta: {title: 'Ingresses', icon: 'ingress'}
      },
      {
        path: 'ingress-edit',
        name: 'IngressEdit',
        component: () => import('@/views/ingress/edit'),
        meta: {title: 'Edit Ingress', icon: 'ingress', activeMenu: "/network/ingresses"},
        hidden: true
      },
      {
        path: 'ingress-create',
        name: 'IngressCreate',
        component: () => import('@/views/ingress/edit'),
        meta: {title: 'Create Ingress', icon: 'ingress', activeMenu: "/network/ingresses"},
        hidden: true
      },
      {
        path: 'ingressroutes',
        name: 'IngressRoutes',
        component: () => import('@/views/ingressroute/index'),
        meta: {title: 'IngressRoutes', icon: 'ingroute'}
      },
      {
        path: 'ingressroute-detail',
        name: 'IngressRouteDetail',
        component: () => import('@/views/ingressroute/detail'),
        meta: {title: 'IngressRoute Details', icon: 'ingroute', activeMenu: "/network/ingressroutes"},
        hidden: true
      },
      {
        path: 'ingressroute-edit',
        name: 'IngressRouteEdit',
        component: () => import('@/views/ingressroute/edit'),
        meta: {title: 'Edit IngressRoute', icon: 'ingroute', activeMenu: "/network/ingressroutes"},
        hidden: true
      },
      {
        path: 'ingressroute-create',
        name: 'IngressRouteCreate',
        component: () => import('@/views/ingressroute/edit'),
        meta: {title: 'Create IngressRoute', icon: 'ingroute', activeMenu: "/network/ingressroutes"},
        hidden: true
      }
    ]
  },
  {
    path: '/volume',
    component: Layout,
    redirect: '/volume/configmaps',
    name: 'Volume',
    meta: {title: 'Volume Management', icon: 'volume'},
    children: [
      {
        path: 'configmaps',
        name: 'ConfigMaps',
        component: () => import('@/views/configmap/index'),
        meta: {title: 'ConfigMap', icon: 'cm'}
      },
      {
        path: 'configmap-edit',
        name: 'ConfigMapEdit',
        component: () => import('@/views/configmap/edit'),
        meta: {title: 'ConfigMap', icon: 'cm', activeMenu: "/volume/configmaps"},
        hidden: true,
      },
      {
        path: 'secrets',
        name: 'Secrets',
        component: () => import('@/views/secret/index'),
        meta: {title: 'Secret', icon: 'secret'}
      },
      {
        path: 'secret-edit',
        name: 'SecretEdit',
        component: () => import('@/views/secret/edit'),
        meta: {title: 'Secret', icon: 'secret', activeMenu: "/volume/secrets"},
        hidden: true,
      },
      {
        path: 'pvs',
        name: 'PVs',
        component: () => import('@/views/pv/index'),
        meta: {title: 'PersistentVolume', icon: 'pv'}
      },
      {
        path: 'pv-create',
        name: 'PVCreate',
        component: () => import('@/views/pv/create'),
        meta: {title: 'Create PersistentVolume', icon: 'pv', activeMenu: "/volume/pvs"},
        hidden: true,
      },
      {
        path: 'pvcs',
        name: 'PVCs',
        component: () => import('@/views/pvc/index'),
        meta: {title: 'PersistentVolumeClaim', icon: 'pvc'}
      },
      {
        path: 'pvc-create',
        name: 'PVCCreate',
        component: () => import('@/views/pvc/create'),
        meta: {title: 'Create PersistentVolumeClaim', icon: 'pvc', activeMenu: "/volume/pvcs"},
        hidden: true,
      },
      {
        path: 'storageclasses',
        name: 'StorageClasses',
        component: () => import('@/views/storageclass/index'),
        meta: {title: 'StorageClass', icon: 'storage'}
      },
      {
        path: 'storageclass-create',
        name: 'StorageClassCreate',
        component: () => import('@/views/storageclass/create'),
        meta: {title: 'Create StorageClass', icon: 'storage', activeMenu: "/volume/storageclasses"},
        hidden: true,
      },
    ]
  },
  // 404 page must be placed at the end !!!
  {path: '*', redirect: '/404', hidden: true}
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
