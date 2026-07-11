import { ref } from 'vue'
import { getScreenProject, publishScreenProject, saveScreenProjectDraft, updateScreenProject } from '../../api/screens'
import type { ScreenProject } from '../../types/platform'
import type { ScreenNode } from '../../types/screen-node'
import { normalizeScreenNodes } from '../../utils/screen-node'

export function useScreenProject(projectId: string) {
  const projectDetail = ref<ScreenProject | null>(null)
  const nodes = ref<ScreenNode[]>([])

  async function loadProject() {
    const res = await getScreenProject(projectId)
    projectDetail.value = res.item
    nodes.value = normalizeScreenNodes(res.item?.screenNodes)
    return res.item
  }

  async function saveProject() {
    if (!projectDetail.value) return null

    const res = await updateScreenProject(projectId, projectDetail.value, nodes.value)
    await loadProject()
    return res.item
  }

  async function saveDraftSnapshot() {
    if (!projectDetail.value) return null

    const res = await saveScreenProjectDraft(projectId, projectDetail.value, nodes.value)
    projectDetail.value = res.item
    nodes.value = normalizeScreenNodes(res.item?.screenNodes)
    return res.item
  }

  async function publishProject(version?: string) {
    await saveDraftSnapshot()
    const res = await publishScreenProject(projectId, {
      version: version ? version.trim() : undefined,
    })
    await loadProject()
    return res.item
  }

  return {
    projectDetail,
    nodes,
    loadProject,
    saveProject,
    saveDraftSnapshot,
    publishProject,
  }
}
