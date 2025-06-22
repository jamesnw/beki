import { createStore } from "solid-js/store"

// Initialize store
const [options, setOptions] = createStore({
  species: true,
  search: '',
  codeType: '4' as '4' | '6',
})

export { options, setOptions }
export type Options = typeof options