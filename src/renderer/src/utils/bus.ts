import mitt from 'mitt'

const emitter = mitt<{
  'on-mgmt-statistic-bar-click': string
  refresh: void
  'toggle-dark': void
}>()

export default emitter
