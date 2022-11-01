<template>
  <div>
    <my-element>
      <span slot="prepend">
        <my-element @my-event="handleNestedLitElementClick">
          <div slot="prepend">I am a Lit element within another Lit element</div>
        </my-element>
      </span>
    </my-element>
  </div>
</template>

<script lang="ts" setup>
import "../../playground-common/elements/my-element";
function handleNestedLitElementClick() {
  alert("You clicked the nested Lit element!");
}
</script>
