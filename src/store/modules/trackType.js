import {defineStore} from "pinia";

export const trackTypeStore = defineStore('trackType',{
    state: () => ({
        targetType:"",
        channelSolution:false,
        channelSolutionType:0,
        row:{},
        fieldType:'',
        showOut:false,
        showIn:false
    }),
    getters:{
    },
    actions:{

    }
})
