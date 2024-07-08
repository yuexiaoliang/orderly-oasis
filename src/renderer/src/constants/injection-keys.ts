import type { InjectionKey, Ref } from 'vue'

export interface ReqMgmtKey {
  containerRef: Ref<HTMLElement>
}
export const reqMgmtKey = Symbol() as InjectionKey<ReqMgmtKey>
