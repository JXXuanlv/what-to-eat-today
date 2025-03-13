const app = getApp() // 获取全局应用实例

Page({
  // 页面的初始数据
  data: {
    foodTypes: [], // 存储所有食物类型的数组
    newTypeName: '' // 新增类型时的输入值
  },

  // 页面加载时从本地存储获取食物类型列表
  onLoad() {
    // 尝试从本地存储获取数据，如果没有则使用空数组
    const storedTypes = wx.getStorageSync('foodTypes') || []
    // 将数据同步到全局状态
    app.globalData.foodTypes = storedTypes
    // 更新页面数据
    this.setData({
      foodTypes: storedTypes
    })
  },

  // 监听输入框变化，更新newTypeName
  onInputChange(e) {
    // 获取输入的值并去除首尾空格
    this.setData({
      newTypeName: e.detail.value.trim()
    })
  },

  // 添加新的食物类型
  addType() {
    const { newTypeName, foodTypes } = this.data
    // 如果输入为空，直接返回
    if (!newTypeName) return

    // 创建新的类型对象
    const newType = {
      id: Date.now(), // 使用当前时间戳作为唯一ID
      name: newTypeName // 设置类型名称
    }

    // 将新类型添加到列表中
    const newTypes = [...foodTypes, newType]
    // 更新数据并清空输入框
    this.updateFoodTypes(newTypes)
    this.setData({ newTypeName: '' })
  },

  // 开始编辑某个类型
  startEdit(e) {
    // 获取要编辑的类型ID
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    // 将选中的类型设置为编辑状态
    const newTypes = foodTypes.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          isEditing: true, // 标记为编辑状态
          editName: item.name // 存储当前名称作为编辑初始值
        }
      }
      return item
    })
    this.setData({ foodTypes: newTypes })
  },

  // 监听编辑输入框变化
  onEditInput(e) {
    // 获取正在编辑的类型ID和新的值
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    // 更新编辑中的值
    const newTypes = foodTypes.map(item => {
      if (item.id === id) {
        return { ...item, editName: e.detail.value.trim() }
      }
      return item
    })
    this.setData({ foodTypes: newTypes })
  },

  // 保存编辑的类型名称
  saveEdit(e) {
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    const newTypes = foodTypes.map(item => {
      if (item.id === id) {
        return { 
          id: item.id,
          name: item.editName || item.name, // 使用编辑后的名称，如果为空则保持原名称
          imageUrl: item.imageUrl // 保持原有的图片URL
        }
      }
      return item
    })
    this.updateFoodTypes(newTypes)
  },

  // 取消编辑状态
  cancelEdit(e) {
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    const newTypes = foodTypes.map(item => {
      if (item.id === id) {
        const { isEditing, editName, ...rest } = item
        return rest // 移除编辑相关的临时属性
      }
      return item
    })
    this.setData({ foodTypes: newTypes })
  },

  // 删除食物类型
  deleteType(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个类型吗？',
      success: (res) => {
        if (res.confirm) {
          const newTypes = this.data.foodTypes.filter(item => item.id !== id)
          this.updateFoodTypes(newTypes)
        }
      }
    })
  },

  // 选择图片
  chooseImage(e) {
    const { id } = e.currentTarget.dataset
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 将图片保存到本地
        wx.saveFile({
          tempFilePath,
          success: (saveRes) => {
            const savedFilePath = saveRes.savedFilePath
            const { foodTypes } = this.data
            const newTypes = foodTypes.map(item => {
              if (item.id === id) {
                // 如果之前有图片，先删除旧图片
                if (item.imageUrl) {
                  wx.removeSavedFile({
                    filePath: item.imageUrl,
                    complete: () => {}
                  })
                }
                return { ...item, imageUrl: savedFilePath }
              }
              return item
            })
            this.setData({ foodTypes: newTypes })
          },
          fail: () => {
            wx.showToast({
              title: '保存图片失败',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    const type = foodTypes.find(item => item.id === id)
    
    if (type && type.imageUrl) {
      wx.removeSavedFile({
        filePath: type.imageUrl,
        success: () => {
          const newTypes = foodTypes.map(item => {
            if (item.id === id) {
              const { imageUrl, ...rest } = item
              return rest
            }
            return item
          })
          this.setData({ foodTypes: newTypes })
        },
        fail: () => {
          wx.showToast({
            title: '删除图片失败',
            icon: 'none'
          })
        }
      })
    }
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 更新食物类型列表并同步到本地存储和全局数据
  updateFoodTypes(newTypes) {
    app.globalData.foodTypes = newTypes
    wx.setStorageSync('foodTypes', newTypes)
    this.setData({ foodTypes: newTypes })
  }
})