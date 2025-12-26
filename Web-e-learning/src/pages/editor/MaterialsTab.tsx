import { useEffect, useState } from 'react'
import { createMaterial, listMaterials, Material } from '@/lib/editorApi'
import { useToast } from '@/components/Toast'

export default function MaterialsTab({ topicId }:{ topicId?:string }){
  const [items, setItems] = useState<Material[]>([])
  const [form, setForm] = useState<Partial<Material>>({ title:'', type:'link', url:'', content:'', lang:'UA' })
  const { push } = useToast()

  async function load(){
    if (!topicId) { setItems([]); return }
    try { setItems(await listMaterials(topicId)) } catch(e:any){ push({type:'error', msg:e.message}) }
  }
  useEffect(()=>{ load() }, [topicId])

  async function save(){
    if (!topicId) { push({type:'error', msg:'Select a topic first'}); return }
    if (!form.title || !form.type) { push({type:'error', msg:'Title and type are required'}); return }
    try {
      await createMaterial(topicId, form)
      push({ type:'success', msg:'Material created' })
      setForm({ title:'', type:'link', url:'', content:'', lang:'UA' })
      await load()
    } catch(e:any){ push({type:'error', msg:e.message}) }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-display font-bold mb-4 gradient-text">Materials</h2>
      {!topicId ? (
        <p className="text-sm text-gray-500">Select a topic in the left sidebar.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold">Create material</h3>
            <p className="text-xs text-gray-500">Provide title, type, language, then URL or content.</p>
            
            <label className="block text-sm mb-1">Title</label>
            <input value={form.title||''} onChange={e=>setForm(s=>({...s, title:e.target.value}))} className="w-full mb-3"/>

            <label className="block text-sm mb-1">Type</label>
            <select value={form.type||'link'} onChange={e=>setForm(s=>({...s, type: e.target.value as any}))} className="w-full mb-3">
              <option value="pdf">pdf</option>
              <option value="video">video</option>
              <option value="link">link</option>
              <option value="text">text</option>
            </select>

            <label className="block text-sm mb-1">Language</label>
            <select value={form.lang||'UA'} onChange={e=>setForm(s=>({...s, lang: e.target.value as any}))} className="w-full mb-3">
              <option>UA</option><option>PL</option><option>EN</option>
            </select>

            {form.type!=='text' ? (
              <>
                <label className="block text-sm mb-1">URL</label>
                <input value={form.url||''} onChange={e=>setForm(s=>({...s, url:e.target.value}))} className="w-full mb-3"/>
              </>
            ) : (
              <>
                <label className="block text-sm mb-1">Content</label>
                <textarea value={form.content||''} onChange={e=>setForm(s=>({...s, content:e.target.value}))} className="w-full mb-3" rows={5}/>
              </>
            )}

            <button className="btn" onClick={save}>Create</button>
          </div>

          <div className="space-y-3">
            <div className="alert text-sm">
              <div className="font-semibold mb-1">Structure tips</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Use clear titles (topic + format).</li>
                <li>Pick correct type (pdf/video/link/text).</li>
                <li>Set language to match content.</li>
                <li>Use text for quick summaries/notes.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Materials list</h3>
              <ul className="space-y-2">
                {items.map(m=>(
                  <li key={m.id} className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-xs text-gray-500">{m.type} • {m.lang ?? '—'}</div>
                  </li>
                ))}
                {!items.length && <li className="text-sm text-gray-500">No materials yet</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
