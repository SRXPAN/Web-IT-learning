
import { create } from 'zustand'

type State = { theme: 'light' | 'dark' }
type Actions = { toggle:()=>void, set:(t:'light'|'dark')=>void }

const key = 'elearn_theme'

function applyTheme(t:'light'|'dark'){
  const root = document.documentElement
  if(t==='dark') root.classList.add('dark'); else root.classList.remove('dark')
}

export const useTheme = create<State & Actions>((set)=>{
  const stored = (localStorage.getItem(key) as 'light'|'dark'|null) || 'light'
  applyTheme(stored)
  return ({
    theme: stored,
    set: (t)=>{ localStorage.setItem(key,t); applyTheme(t); set({theme:t}) },
    toggle: ()=> set(s=>{ const t = s.theme==='light'?'dark':'light'; localStorage.setItem(key,t); applyTheme(t); return {theme:t} })
  })
})
