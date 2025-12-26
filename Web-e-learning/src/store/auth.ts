import { create } from 'zustand'
import { apiPost } from '@/lib/http'

export type User = { id:string; name:string; email:string; xp:number; role?: 'STUDENT'|'ADMIN'|'EDITOR' }
type State = { user: User | null, token: string | null }
type Actions = {
  loginWithPassword:(email:string, password:string)=>Promise<void>
  register:(name:string,email:string,password:string)=>Promise<void>
  logout:()=>void
  addXP:(n:number)=>void
}

const keyUser = 'elearn_user'
const keyTok = 'token'

export const useAuth = create<State & Actions>((set,get)=>({
  user: JSON.parse(localStorage.getItem(keyUser) || 'null'),
  token: localStorage.getItem(keyTok) || null,

  async loginWithPassword(email, password){
    const res = await apiPost<{token:string; user:User}>('/auth/login', { email, password })
    localStorage.setItem(keyTok, res.token || '')
    localStorage.setItem(keyUser, JSON.stringify(res.user))
    set({ user: res.user, token: res.token || null })
  },
  async register(name, email, password){
    const res = await apiPost<{token:string; user:User}>('/auth/register', { name, email, password })
    localStorage.setItem(keyTok, res.token || '')
    localStorage.setItem(keyUser, JSON.stringify(res.user))
    set({ user: res.user, token: res.token || null })
  },
  logout(){
    localStorage.removeItem(keyTok); localStorage.removeItem(keyUser)
    set({ user:null, token:null })
  },
  addXP(n){
    const u = get().user; if(!u) return
    const nu = { ...u, xp: u.xp + n }
    localStorage.setItem(keyUser, JSON.stringify(nu)); set({ user:nu })
  }
}))
