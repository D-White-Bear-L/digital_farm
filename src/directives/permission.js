// import Vue from 'vue'

export default {
  install(app) {
    app.directive('permission', {
      mounted(el, binding) {
        const { value } = binding
        const userRole = localStorage.getItem('userRole')
        
        if (value && !value.includes(userRole)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    })
  }
}