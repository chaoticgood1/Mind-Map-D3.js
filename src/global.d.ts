// Declare svelteHTML global for Svelte template type checking
declare const svelteHTML: {
  [key: string]: any;
};

declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}