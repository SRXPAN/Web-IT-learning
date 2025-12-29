import { useEffect, useState } from 'react'
import { createTopic, deleteTopic, listRootTopics, updateTopic, Category, Topic } from '@/lib/editorApi'
import { useToast } from '@/components/Toast'
import { useTranslation } from '@/i18n/useTranslation'

const CATS: Category[] = ['Programming','Mathematics','Databases','Networks']

export default function TopicsTab({ onChanged }:{ onChanged: ()=>void }){
  const [items, setItems] = useState<Topic[]>([])
  const [form, setForm] = useState<Partial<Topic>>({ name:'', slug:'', description:'', category:'Programming' })
  const [editingId, setEditingId] = useState<string|undefined>()
  const { push } = useToast()
  const { t } = useTranslation()

  async function load(){
    try { setItems(await listRootTopics()) } catch(e:any){ push({type:'error', msg:e.message}) }
  }
  useEffect(()=>{ load() }, [])

  async function save(){
    if (!form.name || !form.slug) { push({type:'error', msg:t('editor.error.nameSlugRequired')}); return }
    try {
      if (editingId) {
        await updateTopic(editingId, form)
        push({ type:'success', msg:t('editor.success.topicUpdated') })
      } else {
        await createTopic(form)
        push({ type:'success', msg:t('editor.success.topicCreated') })
      }
      setForm({ name:'', slug:'', description:'', category:'Programming' })
      setEditingId(undefined)
      await load(); onChanged()
    } catch (e:any) { push({ type:'error', msg:e.message }) }
  }

  async function remove(id:string){
    if (!confirm(t('editor.confirm.deleteTopic'))) return
    try { await deleteTopic(id); push({type:'success', msg:t('editor.success.deleted')}); await load(); onChanged() }
    catch(e:any){ push({type:'error', msg:e.message}) }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-display font-bold mb-4 gradient-text">{t('editor.tab.topics')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId?t('editor.title.editTopic'):t('editor.title.createTopic')}</h3>
          <label className="block text-sm mb-1">{t('editor.label.name')}</label>
          <input value={form.name||''} onChange={e=>setForm(s=>({...s, name:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">{t('editor.label.slug')}</label>
          <input value={form.slug||''} onChange={e=>setForm(s=>({...s, slug:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">{t('editor.label.description')}</label>
          <textarea value={form.description||''} onChange={e=>setForm(s=>({...s, description:e.target.value}))} className="w-full mb-3"/>

          <label className="block text-sm mb-1">{t('editor.label.category')}</label>
          <select value={form.category||'Programming'} onChange={e=>setForm(s=>({...s, category:e.target.value as Category}))} className="w-full mb-3">
            {CATS.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-2">
            <button className="btn" onClick={save}>{editingId?t('common.save'):t('common.create')}</button>
            {editingId && <button className="btn-outline" onClick={()=>{ setEditingId(undefined); setForm({ name:'', slug:'', description:'', category:'Programming' }) }}>{t('common.cancel')}</button>}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">{t('editor.title.rootTopics')}</h3>
          <ul className="space-y-2">
            {items.map(item=>(
              <li key={item.id} className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.slug} • {item.category}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-outline text-xs px-3 py-1" onClick={()=>{ setEditingId(item.id); setForm(item) }}>{t('common.edit')}</button>
                  <button className="btn-outline text-xs px-3 py-1" onClick={()=>remove(item.id)}>{t('common.delete')}</button>
                </div>
              </li>
            ))}
            {!items.length && <li className="text-sm text-gray-500">{t('editor.empty.noTopics')}</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
