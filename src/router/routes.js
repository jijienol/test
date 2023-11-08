import Layout from "@/views/Layout/index.vue";
import Detect from '@/views/Detect/index.vue'

export default [
    {
        path: '/',
        name: '',
        redirect: '/login',
        meta: {},
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/login',
        name: 'login',
        meta: {
            title: 'Login - 登录',
            hideInMenu: true
        },
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/aj',
        name: 'aj',
        meta: {
            icon: 'ios-flask-outline',
            title: '案件'
        },
        component: Layout,
        redirect: {
            name: "ajList"
        },
        children: [
            {
                path: '/ajList',
                name: 'ajList',
                meta: {
                    title: '案件列表'
                },
                component: () => import('@/views/Ajgl/AjglList/indexNew.vue')
            }
        ]
    },
    {
        path: '/first',
        name: 'first',
        meta: {
            icon: 'ios-flask-outline',
            title: '首页'
        },
        redirect: {name: 'homePage'},
        component: Layout,
        children: [
            {
                path: '/homePage',
                name: 'homePage',
                meta: {
                    icon: '',
                    title: '首页'
                },
                component: () => import('@/views/homePage/indexNew.vue')
            }
        ]
    },
    {
        path: '/message',
        name: 'message',
        meta: {
            icon: 'ios-flask-outline',
            title: '留言板'
        },
        redirect: {name: 'messageBoard'},
        component: Layout,
        children: [
            {
                path: '/messageBoard',
                name: 'messageBoard',
                meta: {
                    icon: '',
                    title: '留言问答'
                },
                component: () => import('@/views/messageBoard/index.vue')
            }
        ]
    },
    {
        path: '/globalSearch',
        name: 'globalSearch',
        meta: {
            title: '全局搜'
        },
        component: Layout,
        redirect: {
            name: "globalSearchList"
        },
        children: [
            {
                path: '/globalSearchList',
                name: 'globalSearchList',
                meta: {
                    icon: '',
                    title: '全局搜'
                },
                component: () => import('@/views/GlobalSearch/index.vue')
            }
        ]
        
    },
    {
        path: '/setting',
        name: 'setting',
        meta: {
            icon: 'md-settings',
            title: '系统管理'
        },
        redirect: {
            name: 'trackType'
        },
        component: Layout,
        children: [
            {
                path: '/trackType',
                name: 'trackType',
                meta: {
                    icon: '',
                    title: '能力管理'
                },
                component: () => import('@/views/trackType/trackType.vue')
            },
            {
                path: '/virtualid',
                name: 'virtualid',
                meta: {
                    icon: '',
                    title: '虚拟身份管理'
                },
                component: () => import('@/views/virtualid/index.vue')
            },
            {
                path: '/intervalTask',
                name: 'intervalTask',
                meta: {
                    icon: '',
                    title: '定时任务管理'
                },
                component: () => import('@/views/intervalTask/index.vue')
            },
            {
                path: '/user',
                name: 'user',
                meta: {
                    icon: '',
                    title: '用户管理'
                },
                component: () => import('@/views/user/index.vue')
            },
            {
                path: '/Role',
                name: 'Role',
                meta: {
                    icon: '',
                    title: '角色管理'
                },
                component: () => import('@/views/Role/index.vue')
            },
            {
                path: '/office',
                name: 'office',
                meta: {
                    icon: '',
                    title: '部门管理'
                },
                component: () => import('@/views/office/index.vue')
            },
            {
                path: '/syslog',
                name: 'syslog',
                meta: {
                    icon: '',
                    title: '日志管理'
                },
                component: () => import('@/views/syslog/index.vue')
            },
            {
                path: '/home',
                name: 'home',
                meta: {
                    icon: '',
                    title: '个人中心'
                },
                component: () => import('@/views/home/index.vue')
            },
            {
                path: '/dict',
                name: 'dict',
                meta: {
                    icon: '',
                    title: '字典信息'
                },
                component: () => import('@/views/dict/index.vue')
            },
            {
                path: '/Menu',
                name: 'Menu',
                meta: {
                    icon: '',
                    title: '菜单管理'
                },
                component: () => import('@/views/Menu/index.vue')
            },
            {
                path: '/Guide',
                name: 'Guide',
                meta: {
                    icon: '',
                    title: '调证指引管理'
                },
                component: () => import('@/views/Guide/index.vue')
            },
            {
                path: '/AbilityGuide',
                name: 'AbilityGuide',
                meta: {
                    icon: '',
                    title: '能力指引管理'
                },
                component: () => import('@/views/AbilityGuide/index.vue')
            },
            {
                path: '/UpdateLog',
                name: 'UpdateLog',
                meta: {
                    icon: '',
                    title: '更新日志管理'
                },
                component: () => import('@/views/UpdateLog/index.vue')
            }, {
                path: '/Area',
                name: 'Area',
                meta: {
                    icon: '',
                    title: '区域管理'
                },
                component: () => import('@/views/Area/index.vue')
            },
        
        ]
    },
    
    {
        path: '/Questionnaire',
        name: 'Questionnaire',
        meta: {
            icon: 'ios-flask-outline',
            title: '首页'
        },
        redirect: {name: 'QuestionnaireList'},
        component: Layout,
        children: [
            {
                path: '/QuestionnaireList',
                name: 'QuestionnaireList',
                meta: {
                    icon: 'ios-flask-outline',
                    title: '回访表列表'
                },
                component: () => import('@/views/QuestionnaireList/index.vue')
            },
        ]
    },
    {
        path: '/detect',
        name: 'detect',
        meta: {
            icon: 'ios-flask-outline',
            title: '案件详情'
        },
        // redirect: {
        //     name: "swdt"
        // },
        component: Detect,
        children: [
            {
                path: '/czcc',
                name: 'czcc',
                meta: {
                    title: '初侦初查'
                },
                component: () => import('@/views/Detect/components/czcc.vue')
            },
            {
                path: '/questionnaire',
                name: 'questionnaire',
                meta: {
                    title: '问卷调查表'
                },
                component: () => import('@/components/questionnaire/index.vue')
            },
            {
                path: '/swdt',
                name: 'swdt',
                meta: {
                    title: '思维导图'
                },
                component: () => import('@/views/Detect/components/swdt.vue')
            }
        ]
    },
    {
        path: '/details',
        name: 'details',
        meta: {
            icon: 'ios-flask-outline',
            title: '详情'
        },
        component: () => import('@/views/details/index.vue')
    },
    {
        path: '/internetDeep',
        name: 'internetDeep',
        meta: {
            icon: 'ios-ionic-outline',
            title: '互联网深入侦查'
        },
        redirect: {name: 'internetDeepList'},
        component: Layout,
        children: [
            {
                path: '/internetDeepList',
                name: 'internetDeepList',
                meta: {
                    title: '互联网深入侦查'
                },
                component: () => import('@/views/internetDeep/index.vue')
            },
        ]
    },
    {
        path: '/ControlBK',
        name: 'ControlBK',
        meta: {
            icon: 'ios-ionic-outline',
            title: '布控管理'
        },
        redirect: {name: 'ControlBKList'},
        component: Layout,
        children: [
            {
                path: '/ControlBKList',
                name: 'ControlBKList',
                meta: {
                    title: '布控列表'
                },
                component: () => import('@/views/ControlBK/index.vue')
            },
        ]
    },
]
