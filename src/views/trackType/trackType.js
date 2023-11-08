export const columns1 = [
    {
        title: '序号',
        type: 'index',
        tooltip: true,
        width: 80
    },
    {
        title: '方案名称',
        key: 'name',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '机构',
        key: 'channelName',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '方案编码',
        key: 'solutionCode',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '方案类型',
        key: 'typeLabel',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '优先级',
        key: 'level',
        tooltip: true,
        minWidth: 30
    },
    {
        title: '状态',
        key: 'statusLabel',
        tooltip: true,
        minWidth: 50
    },
    {
        title: '方案说明',
        key: 'description',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '侦查类型',
        key: 'detectTypeLabel',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '操作',
        minWidth: 300,
        slot: '操作',
        align:'center'
    }
]
export const columnsInField = [
    {
        title: '源字段编码',
        key: 'sourceCode',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '目标字段编码',
        key: 'targetCode',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '涉及字段名称',
        key: 'fieldName',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '操作',
        minWidth: 100,
        slot: '操作'
    }
]
export const columnsOutField = [
    {
        title: '是否可查询',
        tooltip: true,
        minWidth: 80,
        render: (h, params) => {
            if (params.row.queryAble === 1) {
                return h('div', '是')
            } else if (params.row.queryAble === 0) {
                return h('div', '否')
            }
        }
    },
    {
        title: '目标字段编码',
        key: 'targetCode',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '涉及字段名称',
        key: 'fieldName',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '操作',
        minWidth: 100,
        slot: '操作'
    }
]
export const columnsDataType = [
    {
        title: '方案返回对象类型',
        key: 'returnType',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '表格sheet名称',
        key: 'sheetName',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '数据存储目标库',
        key: 'targetTable',
        tooltip: true,
        minWidth: 80
    },
    {
        title: '操作',
        minWidth: 100,
        slot: '操作'
    }
]
export const ruleInline = {
    name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '方案类别不能为空' }],
    detectType: [{ required: true, message: '侦查类别不能为空' }],
    channelCode: [{ required: true, message: '渠道不能为空' }],
    method: [{ required: true, message: '请求方式不能为空' }],
    url: [{ required: true, message: 'URL不能为空', trigger: 'blur' }],
    description: [{ required: true, message: '方案说明不能为空', trigger: 'blur' }],
    solutionCode: [{ required: true, message: '方案编码不能为空', trigger: 'blur' }],
    returnType: [{ required: true, message: '方案返回对象类型不能为空', trigger: 'blur' }],
    transferCode: [{ required: true, message: '数据转换方案编码不能为空', trigger: 'blur' }],
    level: [{ required: true, message: '优先级不能为空' }],
    status: [{ required: true, message: '状态不能为空' }],
    realtime: [{ required: true, message: '是否实时更新不能为空' }],
    isCommon: [{ required: true, message: '是否通用不能为空' }],
    beforeFilter: [{ required: true, message: '前置拦截器不能为空', trigger: 'blur' }],
    isMultipart: [{ required: true, message: '是否多数据返回不能为空', trigger: 'blur' }]
}
export const ruleInlineField = {
    sourceCode: [{ required: true, message: '源字段编码不能为空', trigger: 'blur' }],
        queryAble: [{ required: true, message: '是否可查询不能为空' }],
        targetCode: [{ required: true, message: '目标字段编码不能为空', trigger: 'blur' }],
        fieldName: [{ required: true, message: '涉及字段名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空' }],
        // filter: [
        //   { required: true, message: '字段拦截不能为空', trigger: 'blur' }
        // ],
        fromMain: [{ required: true, message: '是否主表字段不能为空', trigger: 'blur' }],
        show: [{ required: true, message: '是否显示不能为空', trigger: 'blur' }]
}
export const ruleInlineDataType = {
    returnType: [{ required: true, message: '方案返回对象类型不能为空', trigger: 'blur' }],
        sheetName: [{ required: true, message: '表格sheet名称不能为空' }],
        targetTable: [{ required: true, message: '数据存储目标库不能为空', trigger: 'blur' }],
        columnMap: [{ required: true, message: '字段映射json不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空' }],
        // filter: [
        //   { required: true, message: '字段拦截不能为空', trigger: 'blur' }
        // ],
        fromMain: [{ required: true, message: '是否主表字段不能为空', trigger: 'blur' }],
        show: [{ required: true, message: '是否显示不能为空', trigger: 'blur' }],
        info: [{ required: true, message: '数据信息说明不能为空' }]
}
