const app = getApp() // 获取全局应用实例

Page({
  // 页面的初始数据，用于存储页面中需要的各种状态
  data: {
    foodTypes: [], // 食物类型列表，每个元素包含id、name和selected属性
    isAllSelected: false, // 是否全选状态，true表示所有类型都被选中
    hasSelected: false, // 是否有选中的类型，用于控制开始按钮的可用状态
    showTypes: false, // 控制类型列表的显示，用于实现入场动画效果
    isRandomizing: false, // 是否正在随机展示中，用于控制动画状态
    questionText: '今天吃什么呢？', // 问题面板显示的文本，会在随机过程中变化
    isShowingResult: false, // 是否正在显示最终结果
    currentImage: '' // 当前显示的食物类型图片URL
  },

  // 页面加载时触发，进行初始化操作
  onLoad() {
    // 初始化食物类型列表
    this.initFoodTypes()
    // 延迟500毫秒显示类型列表，添加入场动画效果
    setTimeout(() => {
      this.setData({ showTypes: true })
    }, 500)
  },

  // 页面显示时触发，比如从其他页面返回时
  onShow() {
    // 重新初始化食物类型列表，确保数据是最新的
    this.initFoodTypes()
  },

  // 初始化食物类型列表的函数
  initFoodTypes() {
    try {
      // 从全局数据中获取食物类型列表，并为每个类型添加selected属性
      const foodTypes = app.globalData.foodTypes.map(item => ({
        ...item, // 保留原有属性
        selected: true // 默认全部选中
      }))
      // 检查数据是否有效
      if (Array.isArray(foodTypes) && foodTypes.length > 0) {
        // 更新页面数据，并在完成后更新选中状态
        this.setData({ foodTypes }, () => {
          this.updateSelectStatus()
        })
      } else {
        // 数据无效时显示提示
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      // 发生错误时输出日志并显示提示
      console.error('初始化食物类型失败：', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  },

  // 切换单个类型的选中状态
  toggleSelect(e) {
    // 从事件中获取被点击的类型ID
    const { id } = e.currentTarget.dataset
    const { foodTypes } = this.data
    // 查找被点击的类型在数组中的位置
    const index = foodTypes.findIndex(item => item.id === id)
    
    if (index > -1) {
      // 创建新的数组，避免直接修改原数组
      const newFoodTypes = [...foodTypes]
      // 切换选中状态
      newFoodTypes[index] = {
        ...newFoodTypes[index],
        selected: !newFoodTypes[index].selected
      }
      // 更新数据并重新计算选中状态
      this.setData({ foodTypes: newFoodTypes }, () => {
        this.updateSelectStatus()
      })
    }
  },

  // 切换全选/全不选状态
  toggleSelectAll() {
    const { foodTypes, isAllSelected } = this.data
    // 将所有类型的选中状态设置为当前全选状态的反值
    const newFoodTypes = foodTypes.map(item => ({
      ...item,
      selected: !isAllSelected
    }))
    
    // 更新数据并重新计算选中状态
    this.setData({
      foodTypes: newFoodTypes,
      isAllSelected: !isAllSelected
    }, () => {
      this.updateSelectStatus()
    })
  },

  // 更新选中状态的辅助函数
  updateSelectStatus() {
    const { foodTypes } = this.data
    if (Array.isArray(foodTypes) && foodTypes.length > 0) {
      // 计算选中的类型数量
      const selectedCount = foodTypes.filter(item => item.selected).length
      // 更新全选状态和是否有选中状态
      this.setData({
        isAllSelected: selectedCount === foodTypes.length, // 选中数量等于总数时为全选
        hasSelected: selectedCount > 0 // 只要有选中就为true
      })
    }
  },

  // 开始随机选择
  startRandom() {
    const { foodTypes } = this.data
    // 获取所有选中的类型
    const selectedTypes = foodTypes.filter(item => item.selected)
    
    // 如果没有选中任何类型，显示提示并返回
    if (selectedTypes.length === 0) {
      wx.showToast({
        title: '请先选择食物类型',
        icon: 'none'
      })
      return
    }

    // 设置正在随机状态
    this.setData({ isRandomizing: true })
    
    let count = 0
    // 计算随机切换次数，根据选中类型数量动态调整，最少10次
    const maxCount = Math.max(10, Math.ceil(selectedTypes.length / 2))
    const interval = 100 // 每次切换间隔100毫秒
    
    // 随机切换函数
    const randomize = () => {
      // 随机选择一个类型
      const randomIndex = Math.floor(Math.random() * selectedTypes.length)
      const randomType = selectedTypes[randomIndex]
      
      // 更新显示的文本和图片
      this.setData({
        questionText: randomType.name,
        currentImage: randomType.imageUrl || '',
        isShowingResult: count === maxCount - 1 // 最后一次切换时显示为结果
      })
      
      count++
      if (count < maxCount) {
        // 如果未达到最大次数，继续随机
        setTimeout(randomize, interval)
      } else {
        // 达到最大次数，结束随机状态
        this.setData({ isRandomizing: false })
      }
    }
    
    // 开始随机
    randomize()
  },

  // 跳转到类型管理页面
  goToTypeManage() {
    wx.navigateTo({
      url: '/pages/typeManage/typeManage'
    })
  }
})