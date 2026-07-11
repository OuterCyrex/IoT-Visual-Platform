import { onUnmounted, ref } from 'vue'
import { previewDataset, type DatasetPreview } from '../../api/screens'
import type { ScreenNode } from '../../types/screen-node'
import { getNodeDatasetId, getNodeRefreshInterval } from '../../utils/screen-node'

export function useScreenPreviewData() {
  const datasetData = ref<Record<string, DatasetPreview>>({})
  const timers: ReturnType<typeof setInterval>[] = []

  async function fetchDatasetData(datasetId: string) {
    const res = await previewDataset(datasetId)
    datasetData.value[datasetId] = {
      columns: res.columns || [],
      rows: res.rows || [],
    }
  }

  async function fetchAllDatasetData(nodes: ScreenNode[]) {
    const datasetIds = [...new Set(nodes.map(getNodeDatasetId).filter(Boolean))]
    await Promise.all(datasetIds.map((datasetId) => fetchDatasetData(datasetId)))
  }

  function clearRefreshTimers() {
    timers.forEach((timer) => clearInterval(timer))
    timers.length = 0
  }

  function setupRefreshTimers(nodes: ScreenNode[]) {
    clearRefreshTimers()

    nodes.forEach((node) => {
      const datasetId = getNodeDatasetId(node)
      const interval = getNodeRefreshInterval(node)
      if (!datasetId || interval <= 0) return

      timers.push(
        setInterval(() => {
          fetchDatasetData(datasetId).catch((err) => {
            console.error(`Failed to fetch dataset ${datasetId}:`, err)
          })
        }, interval)
      )
    })
  }

  onUnmounted(clearRefreshTimers)

  return {
    datasetData,
    fetchDatasetData,
    fetchAllDatasetData,
    setupRefreshTimers,
    clearRefreshTimers,
  }
}
