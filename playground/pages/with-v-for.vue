<template>
  <article>
    <my-accordion>
      <my-accordion-item v-for="(item, index) in items" :key="item.title" :open="index === 0" :title="item.title">
        {{ item.content }}
      </my-accordion-item>
    </my-accordion>
  </article>
</template>

<script lang="ts" setup>
const items = [
  {
    title: "foo bar",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum nesciunt quas voluptatem quis commodi excepturi, aspernatur quia doloribus suscipit sed illo, omnis quisquam sapiente iusto adipisci amet aperiam necessitatibus deserunt."
  },
  {
    title: "baz qux",
    content:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laudantium a quod facilis. Quam at doloremque, amet ullam earum iusto quia rem nihil impedit itaque labore vel neque repellat, inventore quaerat."
  }
];
</script>
