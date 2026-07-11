import WidgetRect from './WidgetRect.vue'
import WidgetCircle from './WidgetCircle.vue'
import WidgetChart from './WidgetChart.vue'
import WidgetLineChart from './WidgetLineChart.vue'
import WidgetText from './WidgetText.vue'
import WidgetPieChart from './WidgetPieChart.vue'
import WidgetMetricCard from './WidgetMetricCard.vue'
import WidgetProgressBar from './WidgetProgressBar.vue'
import WidgetRankingList from './WidgetRankingList.vue'
import WidgetAlertList from './WidgetAlertList.vue'

export const screenComponentMap = {
  rect: WidgetRect,
  circle: WidgetCircle,
  chart: WidgetChart,
  lineChart: WidgetLineChart,
  text: WidgetText,
  pieChart: WidgetPieChart,
  metricCard: WidgetMetricCard,
  progressBar: WidgetProgressBar,
  rankingList: WidgetRankingList,
  alertList: WidgetAlertList
}
