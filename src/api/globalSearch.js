import request from "@/libs/request.js";
import qs from "qs";


export const searchAllTaskReturn = params => request.postJson('/IiTaskChannelReturn/search/all/task/return/v2',params)
