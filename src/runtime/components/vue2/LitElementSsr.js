// <!-- <template>
//   <component :is="litElementTagName" v-html="litSsrHtml" />
// </template>

// <script lang="ts">
// import { renderLitElement } from "../../utils/litRenderer";
// export default {
//   name: "LitElementSsr",
//   data() {
//     const defaultSlot = this.$slots.default?.();
//     const litElementVnode = defaultSlot?.[0];
//     const litElementTagName = litElementVnode?.type;

//     return {
//       litElementVnode,
//       litElementTagName,
//       litSsrHtml: ""
//     };
//   },

//   async serverPrefetch() {
//     this.litSsrHtml = await renderLitElement(this.litElementTagName, this.litElementVnode);
//   }
// };
// </script> -->

export default {
  data() {
    const defaultSlot = this.$slots.default?.();
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.type;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: ""
    };
  },
  render: function (createElement) {
    return createElement(
      "h" + this.level, // tag name
      this.$slots.default // array of children
    );
  },

  async serverPrefetch() {
    const { renderLitElement } = await import("../../utils/litRenderer");
    // const { renderToString } = (await import("vue-server-renderer")).createRenderer();
    this.litSsrHtml = await renderLitElement(this.litElementTagName, this.litElementVnode);
  }
};
