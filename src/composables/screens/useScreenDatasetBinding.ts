import { ref } from 'vue'
import { listDatasets, previewDataset } from '../../api/screens'
import type { Dataset } from '../../types/platform'
import type { ScreenNode } from '../../types/screen-node'
import { getNodeDatasetId, resetNodeDatasetBinding } from '../../utils/screen-node'

export function useScreenDatasetBinding() {
  const datasetOptions = ref<Dataset[]>([])
  const datasetColumns = ref<string[]>([])

  async function loadDatasetOptions() {
    const res = await listDatasets()
    datasetOptions.value = res.items || []
  }

  async function loadDatasetColumns(datasetId: string) {
    datasetColumns.value = []
    if (!datasetId) return

    const res = await previewDataset(datasetId)
    datasetColumns.value = res.columns || []
  }

  async function changeNodeDataset(node: ScreenNode | null, datasetId: string) {
    if (node) {
      resetNodeDatasetBinding(node)
    }

    await loadDatasetColumns(datasetId)
  }

  async function syncColumnsForNode(node: ScreenNode | null) {
    await loadDatasetColumns(node ? getNodeDatasetId(node) : '')
  }

  return {
    datasetOptions,
    datasetColumns,
    loadDatasetOptions,
    loadDatasetColumns,
    changeNodeDataset,
    syncColumnsForNode,
  }
}
