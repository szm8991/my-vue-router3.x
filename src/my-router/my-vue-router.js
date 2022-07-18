//1.是vue的插件
//2.实现了两个组件 router-link router-view
let Vue; //保存vue的构造函数
class VueRouter {
  constructor(options) {
    this.$options = options;
    //将current作为响应式的数据，router-view的render函数能够再次执行
    this.current = '/';
    //定义响应式数据——路由响应式
    // Vue.util.defineReactive(this, 'current', window.location.hash.slice(1) || '/');
    this.current = window.location.hash.slice(1) || '/';
    Vue.util.defineReactive(this, 'matched', []);
    //match方法可以递归遍历路由表，获得匹配关系的数字
    this.match();
    //监听hash变化
    window.addEventListener('hashchange', e => {
      // console.log(this.current);
      this.current = window.location.hash.slice(1);
      this.matched = [];
      this.match();
    });
  }
  afterEach() {
    console.log('afterEach');
  }
  match(routes) {
    routes = routes || this.$options.routes;
    for (const route of routes) {
      if (route.path === '/' && this.current === '/') {
        this.matched.push(route);
        return;
      }
      // /about/info
      if (route.path !== '/' && this.current.indexOf(route.path) != -1) {
        // /about
        this.matched.push(route);
        //console.log(route.children);
        if (route.children) {
          this.match(route.children);
        }
        return;
      }
    }
  }
}
VueRouter.install = function(_Vue, options) {
  Vue = _Vue;
  //1.挂载$router属性
  //全局混入，在每个组件创建实例时混入$router
  Vue.mixin({
    beforeCreate() {
      //根实例才有该属性
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
      }
    },
  });
  //2.注册并实现两个组件
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      return h('a', { attrs: { href: `#${this.to}` } }, this.$slots.default);
    },
  });
  Vue.component('router-view', {
    render(h) {
      // console.log(this.$attrs);
      //获取当前路由对应的组件，然后将它render出来
      //标记当前router-view深度
      // debugger;
      this.$vnode.data.routerView = true;
      let depth = 0;
      let parent = this.$parent;
      while (parent) {
        if (parent.$vnode?.data?.routerView) {
          //嵌套的router-view
          depth++;
        }
        parent = parent.$parent;
      }
      let component = null;
      // const route = this.$router.$options.routes.find(route => route.path === this.$router.current);
      console.log(depth, this.$router.matched);
      const route = this.$router.matched[depth];
      if (route) {
        component = route.component;
      }
      return h(component);
    },
  });
};
export default VueRouter;
