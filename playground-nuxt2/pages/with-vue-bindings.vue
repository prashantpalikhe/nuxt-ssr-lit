<template>
  <div>
    <button @click="updateValues">Update Lit element from Vue</button>

    <my-element :name="name" @my-event="updateValues">
      <span slot="prepend">
        <SimpleMessage :message="prependText" />
      </span>

      <span slot="append">
        <p>{{ appendText }}</p>
      </span>
    </my-element>
  </div>
</template>
<script>
import "../../playground-common/elements/my-element";
export default {
  data() {
    return {
      name: "foo",
      prependText: "Vue component in prepend slot",
      appendText: "Regular paragraph in append slot"
    };
  },
  methods: {
    updateValues() {
      const now = new Date();
      const time = now.toLocaleTimeString();

      this.name = `foo (Updated: ${time})`;
      this.prependText = `Vue component in prepend slot (Updated: ${time})`;
      this.appendText = `Regular paragraph in append slot (Updated: ${time})`;
    }
  }
};
</script>
