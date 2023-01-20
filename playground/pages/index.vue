<template>
  <article>
    <my-element>I am a SSR-ed Lit element</my-element>

    <my-accordion foo="bar">
      <my-accordion-item id="firstAccordionItem" title="foo bar" open>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum nesciunt quas voluptatem quis commodi excepturi,
        aspernatur quia doloribus suscipit sed illo, omnis quisquam sapiente iusto adipisci amet aperiam necessitatibus
        deserunt.
      </my-accordion-item>

      <my-accordion-item id="secondAccordionItem" title="baz qux">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laudantium a quod facilis. Quam at doloremque, amet
        ullam earum iusto quia rem nihil impedit itaque labore vel neque repellat, inventore quaerat.
      </my-accordion-item>
    </my-accordion>
  </article>
</template>
