import { useEffect, useState } from 'react'
import { createMaterial, listMaterials, Material } from '@/lib/editorApi'
import { useToast } from '@/components/Toast'
import { useTranslation } from '@/i18n/useTranslation'

export default function MaterialsTab({ topicId }:{ topicId?:string }){
  const [items, setItems] = useState<Material[]>([])
  const [form, setForm] = useState<Partial<Material>>({ title:'', type:'link', url:'', content:'', lang:'UA' })
  const { push } = useToast()
  const { t } = useTranslation()

  async function load(){
    if (!topicId) { setItems([]); return }
    try { setItems(await listMaterials(topicId)) } catch(e:any){ push({type:'error', msg:e.message}) }
  }
  useEffect(()=>{ load() }, [topicId])

  async function save(){
    if (!topicId) { push({type:'error', msg:t('editor.error.selectTopicFirst')}); return }
    if (!form.title || !form.type) { push({type:'error', msg:t('editor.error.titleTypeRequired')}); return }
    try {
      await createMaterial(topicId, form)
      push({ type:'success', msg:t('editor.success.materialCreated') })
      setForm({ title:'', type:'link', url:'', content:'', lang:'UA' })
      await load()
    } catch(e:any){ push({type:'error', msg:e.message}) }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-display font-bold mb-4 gradient-text">{t('editor.tab.materials')}</h2>
      {!topicId ? (
        <p className="text-sm text-gray-500">{t('editor.hint.selectTopic')}</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold">{t('editor.title.createMaterial')}</h3>
            <p className="text-xs text-gray-500">{t('editor.hint.materialFields')}</p>
            
            <label className="block text-sm mb-1">{t('editor.label.title')}</label>
            <input value={form.title||''} onChange={e=>setForm(s=>({...s, title:e.target.value}))} className="w-full mb-3"/>

            <label className="block text-sm mb-1">{t('editor.label.type')}</label>
            <select value={form.type||'link'} onChange={e=>setForm(s=>({...s, type: e.target.value as any}))} className="w-full mb-3">
              <option value="pdf">{t('materials.type.pdf')}</option>
              <option value="video">{t('materials.type.video')}</option>
              <option value="link">{t('materials.type.link')}</option>
              <option value="text">{t('materials.type.text')}</option>
            </select>

            <label className="block text-sm mb-1">{t('editor.label.language')}</label>
            <select value={form.lang||'UA'} onChange={e=>setForm(s=>({...s, lang: e.target.value as any}))} className="w-full mb-3">
              <option>UA</option><option>PL</option><option>EN</option>
            </select>

            {form.type!=='text' ? (
              <>
                <label className="block text-sm mb-1">{t('editor.label.url')}</label>
                <input value={form.url||''} onChange={e=>setForm(s=>({...s, url:e.target.value}))} className="w-full mb-3"/>
              </>
            ) : (
              <>
                <label className="block text-sm mb-1">{t('editor.label.content')}</label>
                <textarea value={form.content||''} onChange={e=>setForm(s=>({...s, content:e.target.value}))} className="w-full mb-3" rows={5}/>
              </>
            )}

            <button className="btn" onClick={save}>{t('common.create')}</button>
          </div>

          <div className="space-y-3">
            <div className="alert text-sm">
              <div className="font-semibold mb-1">{t('editor.title.structureTips')}</div>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('editor.tip.clearTitles')}</li>
                <li>{t('editor.tip.correctType')}</li>
                <li>{t('editor.tip.matchLanguage')}</li>
                <li>{t('editor.tip.textForNotes')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('editor.title.materialsList')}</h3>
              <ul className="space-y-2">
                {items.map(m=>(
                  <li key={m.id} className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-xs text-gray-500">{m.type} • {m.lang ?? '—'}</div>
                  </li>
                ))}
                {!items.length && <li className="text-sm text-gray-500">{t('editor.empty.noMaterials')}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
