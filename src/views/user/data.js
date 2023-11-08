

export const columns1 = [
    {
        title: '序号',
        minWidth: 40,
        tooltip: true,
        type: 'index'
    },
    {
        title: '姓名',
        minWidth: 90,
        tooltip: true,
        key: 'username'
    },
    {
        title: '性别',
        minWidth: 70,
        tooltip: true,
        key: 'sexualName'
    },
    {
        title: '警号',
        minWidth: 90,
        tooltip: true,
        key: 'no'
    },
    {
        title: '登录名',
        minWidth: 85,
        tooltip: true,
        key: 'loginName'
    },
    {
        title: '手机',
        minWidth: 100,
        tooltip: true,
        key: 'mobile'
    },
    {
        title: '身份证号',
        minWidth: 100,
        tooltip: true,
        key: 'usernumber'
    },
    {
        title: '所在部门',
        minWidth: 90,
        tooltip: true,
        key: 'officeName',
    },
    {
        title: '操作',
        minWidth: 320,
        slot: '操作'
    }
]
export const columnsRecord = [
    {
        title: '档案编号',
        minWidth: 85,
        tooltip: true,
        key: 'sn'
    },
    {
        title: '档案名称',
        minWidth: 85,
        tooltip: true,
        key: 'name'
    },
    {
        title: '档案类型',
        minWidth: 100,
        tooltip: true,
        key: 'typeName'
    },
    {
        title: '登记人',
        minWidth: 110,
        tooltip: true,
        key: 'user.username',
        render: (h, params) => {
            var text = params.row.user.username
            if (params.row.user.username.length > 6) {
                text = params.row.user.username.substring(0, 6) + '...'
            } else {
                text = params.row.user.username
            }
            return h('div', [
                h('Tooltip', {
                    props: {
                        placement: 'top',
                        transfer: true
                    }
                }, [
                    text,
                    h('div', {
                        slot: 'content',
                        style: {
                            whiteSpace: 'normal'
                        }
                    }, params.row.user.username)
                ])
            ])
        }
    },
    {
        title: '登记人所属部门',
        minWidth: 110,
        tooltip: true,
        key: 'officeName'
    },
    {
        title: '登记时间',
        minWidth: 85,
        tooltip: true,
        key: 'createdTime'
    },
    {
        title: '二维码',
        minWidth: 60,
        slot: '二维码'
    },
    {
        title: '备注',
        minWidth: 85,
        tooltip: true,
        key: 'remark'
    },
    {
        title: '操作',
        minWidth: 180,
        slot: '操作'
    }
]
export const columnsRole = [
    {
        type: 'selection',
        width: 85,
        align: 'center'
    },
    {
        title: '编码',
        minWidth: 85,
        tooltip: true,
        key: 'tips'
    },
    {
        title: '名称',
        minWidth: 85,
        tooltip: true,
        key: 'name'
    }
]
 export const ruleInLineRecord = {
    sn: [
        {required: true, message: '编号不能为空', trigger: 'blur'}
    ],
    name: [
        {required: true, message: '名称不能为空', trigger: 'blur'}
    ],
    type: [
        {required: true, message: '类型不能为空', trigger: 'blur'}
    ]
}

