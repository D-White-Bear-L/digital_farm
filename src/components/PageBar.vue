<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span>共 {{ total }} 条</span>
    </div>
    
    <div class="pagination-controls">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :layout="layout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <div class="page-info">
      <span>{{ pageSize }}条/页</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'PageBar',
  props: {
    // 总条数
    total: {
      type: Number,
      default: 0
    },
    // 当前页码
    page: {
      type: Number,
      default: 1
    },
    // 每页条数
    limit: {
      type: Number,
      default: 10
    },
    // 可选的每页条数
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 布局设置
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  emits: ['update:page', 'update:limit', 'pagination'],
  setup(props, { emit }) {
    // 当前页码
    const currentPage = ref(props.page)
    // 每页条数
    const pageSize = ref(props.limit)
    
    // 监听props变化
    watch(() => props.page, (newVal) => {
      currentPage.value = newVal
    })
    
    watch(() => props.limit, (newVal) => {
      pageSize.value = newVal
    })
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(props.total / pageSize.value)
    })
    
    // 处理每页条数变化
    const handleSizeChange = (val) => {
      pageSize.value = val
      emit('update:limit', val)
      // 切换每页条数时，重置为第一页
      currentPage.value = 1
      emit('update:page', 1)
      emit('pagination', { page: 1, limit: val })
    }
    
    // 处理页码变化
    const handleCurrentChange = (val) => {
      currentPage.value = val
      emit('update:page', val)
      emit('pagination', { page: val, limit: pageSize.value })
    }
    
    return {
      currentPage,
      pageSize,
      totalPages,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-info {
  color: #606266;
  margin-right: 15px;
}

.pagination-controls {
  flex: 1;
  display: flex;
  justify-content: center;
}

.page-info {
  color: #606266;
  margin-left: 15px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
}
</style>