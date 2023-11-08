/**
 * 平面数据转tree格式
 * 使用示例 const treeData = getListData(data,{id:'',pid:'',children:''})
 * **/
import {cloneDeep} from 'lodash';

// const cloneDeep


export function getListData (data) {
  const treeData = (data.filter(item => item.root))[0]
  treeData.children = []
  
  data.forEach(item => {
    item.title = item.trackTypeName ?( item.trackTypeName + ':' + item.name ): item.name
    item.expand = true
    if (item.caseNum == 1) {
      treeData.children.push(item)
    }
  })
  return n(data, treeData)
}

function n (data1, treeData) {
  const shuju1 = cloneDeep(data1)
  const treeData1 = cloneDeep(treeData)
  const data2 = shuju1.map(item => {
    item.childs = item.multiChildren
    item.children = []
    return item
  })
  data2.forEach(item => {
    shuju1.forEach(v => {
      if (item.id == v.parentId) {
        item.children.push(v)
      }
    })
  })
  data2.forEach((v) => {
    if (v.parentId == '0') {
      treeData1.children.forEach(item => {
        if (item.label == v.parentTrackType) {
          item.children.push(v)
        }
      })
    }
  })
  // 画图排序
  treeData.children.sort((a, b) => {
    return -(a.zindex - b.zindex)
  })
  
  // // 递归折叠
  const fold = (data) => {
    data.forEach(item => {
      // console.log(item.children)
      if (item.collapseSub != 0) {
        item.children = []
      } else if (item.children) {
        fold(item.children)
      }
    })
  }
  
  fold(treeData1.children)
  // console.log( treeData1)
  return treeData1
}

///**
//  * 平面数据转tree格式
//  * 使用示例 const treeData = getListData(data,{id:'',pid:'',children:''})
//  * **/
// // const cloneDeep
//
// export function getListData (data) {
//   // 剔除 批量任务节点
//   const data1 = data// .filter(item => item.subType != '2')
//   // 创建根节点
//   const treeData = (data1.filter(item => item.root))[0]
//   treeData.children = []
//   //
//   // console.log(1, data1)
//   // console.log(2, treeData)
//   const data2 = data1.map(item => {
//     item.childs = item.multiChildren
//     item.children = []
//     return item
//   })
//
//   data2.forEach(item => {
//     data1.forEach(v => {
//       // console.log(item.id == v.parentId)
//       if (item.id == v.parentId) {
//         item.children.push(v)
//       }
//     })
//   })
//   data2.forEach((v) => {
//     if (v.parentId == '0') {
//       treeData.children.push(v)
//     }
//   })
//   // 画图排序
//   treeData.children.sort((a, b) => {
//     return -(a.zindex - b.zindex)
//   })
//   // data1.forEach(v => {
//   //   v.childs = v.children
//   //   v.children = []
//   //   data.forEach(item => {
//   //     if (v.id == item.parentId) {
//   //       v.children.push(item)
//   //     }
//   //   })
//   // })
//   // data1.forEach((v) => {
//   //   if (v.parentId == '0') {
//   //     treeData.children.push(v)
//   //   }
//   // })
//   // treeData.children.sort((a, b) => {
//   //   return -(a.zindex - b.zindex)
//   // })
//   //
//   // // 递归折叠
//   const fold = (data) => {
//     data.forEach(item => {
//       // console.log(item.children)
//       if (item.collapseSub != 0) {
//         item.children = []
//       } else if (item.children) {
//         fold(item.children)
//       }
//     })
//   }
//
//   fold(treeData.children)
//   return treeData
// }
