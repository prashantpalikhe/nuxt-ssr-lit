export default {
  render(ctx) {
    return ctx.$slots.default?.();
  },
  mounted() {
    this.$el?.removeAttribute("defer-hydration");
  }
};
