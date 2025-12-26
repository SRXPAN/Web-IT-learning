import { useEffect, useState } from 'react'
import { createTopic, deleteTopic, listRootTopics, updateTopic, Category, Topic } from '@/lib/editorApi'
import { useToast } from '@/components/Toast'

const CATS: Category[] = ['Programming','Mathematics','Databases','Networks']

export default function TopicsTab({ onChanged }:{ onChanged: ()=>void }){
  const [items, setItems] = useState<Topic[]>([])
  const [form, setForm] = useState<Partial<Topic>>({ name:'', slug:'', description:'', category:'Programming' })
  const [editingId, setEditingId] = useState<string|undefined>()
  const { push } = useToast()

  async function load(){
    try { setItems(await listRootTopics()) } catch(e:any){ push({type:'error', msg:e.message}) }
  }
  useEffect(()=>{ load() }, [])

  async function save(){
    if (!form.name || !form.slug) { push({type:'error', msg:'Name and slug are required'}); return }
    try {
      if (editingId) {
        await updateTopic(editingId, form)
        push({ type:'success', msg:'Topic updated' })
      } else {
        await createTopic(form)
        push({ type:'success', msg:'Topic created' })
      }
      setForm({ name:'', slug:'', description:'', category:'Programming' })
      setEditingId(undefined)
      await load(); onChanged()
    } catch (e:any) { push({ type:'error', msg:e.message }) }
  }

  async function remove(id:string){
    if (!confirm('Delete topic?')) return
    try { await deleteTopic(id); push({type:'success', msg:'Deleted'}); await load(); onChanged() }
    catch(e:any){ push({type:'error', msg:e.message}) }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-display font-bold mb-4 gradient-text">Topics</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId?'Edit topic':'Create new topic'}</h3>
          <label className="block text-sm mb-1">Name</label>
          <input value={form.name||''} onChange={e=>setForm(s=>({...s, name:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">Slug</label>
          <input value={form.slug||''} onChange={e=>setForm(s=>({...s, slug:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">Description</label>
          <textarea value={form.description||''} onChange={e=>setForm(s=>({...s, description:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">Category</label>
          <select value={form.category||'Programming'} onChange={e=>setForm(s=>({...s, category:e.target.value as Category}))} className="w-full mb-3">
            {CATS.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-2">
            <button className="btn" onClick={save}>{editingId?'Save':'Create'}</button>
            {editingId && <button className="btn-outline" onClick={()=>{ setEditingId(undefined); setForm({ name:'', slug:'', description:'', category:'Programming' }) }}>Cancel</button>}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Root topics</h3>
          <ul className="space-y-2">
            {items.map(t=>(
              <li key={t.id} className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.slug} • {t.category}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-outline text-xs px-3 py-1" onClick={()=>{ setEditingId(t.id); setForm(t) }}>Edit</button>
                  <button className="btn-outline text-xs px-3 py-1" onClick={()=>remove(t.id)}>Delete</button>
                </div>
              </li>
            ))}
            {!items.length && <li className="text-sm text-gray-500">No topics yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
