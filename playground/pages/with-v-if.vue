<template>
  <article>
    <my-accordion>
      <my-accordion-item v-if="true" title="I should be shown"> foo </my-accordion-item>
      <my-accordion-item v-else-if="false" title="I should not be shown"> bar </my-accordion-item>
      <my-accordion-item v-else title="I should also not be shown"> baz </my-accordion-item>
    </my-accordion>
  </article>
</template>
