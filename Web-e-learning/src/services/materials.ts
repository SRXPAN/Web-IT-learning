import { fetchTopicsTree, type TopicTree } from './topics'

export type { TopicTree }
export const fetchMaterialsTree = () => fetchTopicsTree()
