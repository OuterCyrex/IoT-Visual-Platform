# 新能源汽车 (NEV) 智造超级工厂数智化集成监控大屏——场景构思方案

为了在汇报展示中提供一个具有高说服力、精细且复杂的真实工业大屏，我们以 **“特斯拉级别” GigaFactory 新能源汽车智造与电池 Pack 装配超级工厂** 为背景，设计一套完整的工业级 2D 数据可视化监控场景。

---

## 1. 工业场景背景构想
该超级工厂代表了现代制造业的最高自动化水平（工业 4.0），主要由以下五个核心车间组成：
*   **冲压车间 (Stamping)**：大型伺服压力机进行车身外壳板件冲压，关注冲压压力、模具温度、设备震动。
*   **焊装车间 (Welding)**：数百台工业机械臂协同进行车身点焊及激光焊接，关注焊点质量、电极片磨损、机械臂电机电流。
*   **涂装车间 (Painting)**：全自动喷涂线与高温烘干，关注烘房温度、 Booth 湿度、VOC 挥发性气体排放浓度。
*   **电池 Pack 车间 (Battery Pack)**：电芯电学测试、模组涂胶拼装及 Pack 气密性检测，关注电芯一致性偏差、电池温度、加压测试压力。
*   **总装车间 (Assembly)**：底盘合装、内饰装配与整车下线测试，关注拧紧工位扭矩合格率、合装定位偏差、下线节拍。

大屏将从 **生产综合效能 (OEE)**、**生产进度与计划达成**、**设备亚健康状态与实时告警**、**工厂综合能耗** 四个维度来全面展现工业互联网 of Things (IoT) 的复杂遥测场景。

---

## 2. 大屏布局与组件配置设计
大屏的画布标准分辨率设定为 **1920x1080**。我们合理配置已有的可视化组件（Metric Card, Line Chart, Bar Chart, Pie Chart, Ranking List, Alert List, Progress Bar），并在背景辅以 Rect（区域分割）来达到专业大屏效果：

| 模块区域 | 对应组件类型 | 功能及展示字段 | 绑定的数据集名称 |
| :--- | :--- | :--- | :--- |
| **顶部标题栏** | `text` / `rect` | 超级工厂数智集成看板 (GigaFactory Operational Intelligence Center) | 静态配置 |
| **左上：整车综合生产效率** | `metricCard` | 标题：整厂综合效能<br>指标值：OEE `87.5%`<br>副标题：实时设备可用率 `99.4%` | `set-oee-metrics` (综合指标数据集) |
| **左中：今日计划达成进度** | `progressBar` | 标题：计划达成进度<br>当前值：`85%`<br>副标题：今日下线: 1,280 辆 / 目标: 1,500 辆 | `set-production-progress` (产量进度数据集) |
| **左下：车间效能排行榜** | `rankingList` | 标题：车间 OEE 排行看板<br>展示冲压、焊装、涂装、电池、总装车间的 OEE 数值与对比条 | `set-workshop-oee` (车间效率数据集) |
| **中左：设备实时异常日志** | `alertList` | 标题：设备健康与告警流<br>展示正处于激活状态的实时工业警报（含严重、中等、提示级） | `set-active-alarms` (实时告警数据集) |
| **中右：核心设备物理振动遥测** | `chart` (Bar) | 标题：关键动力设备振动值监控<br>X轴：设备代码 (如冲压主电机、冷却泵)<br>Y轴：振动幅值 (mm/s) | `set-equipment-vibration` (设备遥测数据集) |
| **右上：工厂综合能耗分配** | `pieChart` (Pie) | 标题：各车间电力能耗占比<br>展示五大车间的实时用电负荷与比例，暴露耗电瓶颈 | `set-energy-distribution` (能耗分配数据集) |
| **右下：24小时产量波动趋势** | `lineChart` (Line) | 标题：逐时整车下线趋势图<br>X轴：时间点 (08:00 - 19:00)<br>Y轴：单小时出车量 (辆/小时)，反映产线节拍 | `set-hourly-throughput` (每小时产量数据集) |

---

## 3. Mock REST API 接口设计 (数据维度)
为支撑上述大屏所需的精细数据，我们将设计 **6 个高频更新的动态 API**。为保证系统一键运行且不增加额外的进程依赖，我们将直接把这些接口挂载在主 API 服务 `server/routes/platform.ts` 下的无鉴权路由中。

### 接口 1: 整厂综合指标 API
*   **路径**: `/api/telemetry/factory-metrics`
*   **数据结构**:
    ```json
    [
      {
        "oee_percent": 87.5,
        "uptime_percent": 99.4,
        "first_pass_yield": 98.2,
        "active_anomalies": 3,
        "desc": "整厂综合状态指标"
      }
    ]
    ```

### 接口 2: 计划达成进度 API
*   **路径**: `/api/telemetry/production-progress`
*   **数据结构**:
    ```json
    [
      {
        "task_name": "今日总装生产计划",
        "progress_percent": 85.3,
        "actual_output": 1280,
        "target_output": 1500
      }
    ]
    ```

### 接口 3: 各车间 OEE 效率排行 API
*   **路径**: `/api/telemetry/workshop-oee`
*   **数据结构**:
    ```json
    [
      { "workshop": "冲压车间", "oee": 92.1 },
      { "workshop": "焊装车间", "oee": 89.5 },
      { "workshop": "总装车间", "oee": 88.4 },
      { "workshop": "电池车间", "oee": 87.2 },
      { "workshop": "涂装车间", "oee": 81.3 }
    ]
    ```

### 接口 4: 车间电力消耗占比 API (Pie)
*   **路径**: `/api/telemetry/energy-distribution`
*   **数据结构**:
    ```json
    [
      { "workshop": "涂装喷漆与烘房", "kwh": 15820 },
      { "workshop": "冲压伺服压力机", "kwh": 9940 },
      { "workshop": "焊装多关节机器人", "kwh": 8130 },
      { "workshop": "总装机舱输送线", "kwh": 5870 },
      { "workshop": "电池Pack装配线", "kwh": 5420 }
    ]
    ```

### 接口 5: 逐时整车下线量趋势 API (Line)
*   **路径**: `/api/telemetry/production-trend`
*   **动态特性**: 根据系统当前时间段，动态生成最近 12 小时的每小时出车数，随时间平滑移动，并在合理区间（100 ~ 135 辆）内上下波动。
*   **数据结构**:
    ```json
    [
      { "hour": "08:00", "count": 105 },
      { "hour": "09:00", "count": 122 },
      { "hour": "10:00", "count": 131 },
      { "hour": "11:00", "count": 115 },
      { "hour": "12:00", "count": 85 }, 
      { "hour": "13:00", "count": 120 },
      { "hour": "14:00", "count": 128 },
      { "hour": "15:00", "count": 135 },
      { "hour": "16:00", "count": 121 },
      { "hour": "17:00", "count": 118 },
      { "hour": "18:00", "count": 130 },
      { "hour": "19:00", "count": 126 }
    ]
    ```

### 接口 6: 关键主轴/泵机振动监测 API (Bar)
*   **动态特性**：加入正弦波动与随机扰动，模拟机械运转物理波动的真实性。
*   **数据结构**:
    ```json
    [
      { "device": "冲压A线-主偏心轮M01", "vibration": 2.4 },
      { "device": "焊装拼板-搬运机械臂R02", "vibration": 3.8 },
      { "device": "烘干送风机-循环电机F03", "vibration": 1.2 },
      { "device": "动力站房-循环冷却泵P04", "vibration": 5.7 },
      { "device": "总装合装-定位电缸C05", "vibration": 1.8 }
    ]
    ```

### 接口 7: 设备异常实时告警流 API (Alert)
*   **动态特性**：周期性地轮转或增加随机工业设备告警日志，模拟复杂的故障流。
*   **数据结构**:
    ```json
    [
      { "message": "严重: 动力站房-循环冷却泵P04 振动幅值异常超限 (5.7mm/s)", "level": "Critical" },
      { "message": "警告: 涂装烘房3号温区控制器通信延迟偏高", "level": "Warning" },
      { "message": "警告: 焊装激光焊机保护气残余压力低于阈值", "level": "Warning" },
      { "message": "提示: 智能立体库AGV-08正执行低电量回充程序", "level": "Info" },
      { "message": "提示: 环保总排口非甲烷总烃(NMHC)监测通过", "level": "Info" }
    ]
    ```

---

## 4. 系统落地实现步骤

### 第一步：在 REST 服务中实现并挂载上述 API 路由
我们将在 [server/routes/platform.ts](file:///home/erasernoob/IoT-Visual-Platform/server/routes/platform.ts) 中增加相应的动态接口，利用 Node 的 Math 函数和时间差计算，使其在客户端请求时生成波动、递增的拟真物联网流数据。

### 第二步：数据库/配置文件种子预置
1.  **数据源 (DataSource)**：注册一个名为 `超级工厂 REST 遥测源` 的 REST 数据源，地址为本地服务器 `http://127.0.0.1:4000`。
2.  **数据集 (Dataset)**：新建并绑定上述 7 个数据集，分别对应对应的路径。

### 第三步：大屏画布组件树 (`screenNodes`) 注入
在 `server/data/platform.json` 或 `seed.ts` 中，为 ID 为 `scr-001` (厂区能耗总览) 或新建的 `scr-004` (新能源超级工厂数智化大屏) 注入完整的节点树。我们将精确计算好每个卡片和图表的 `x`、`y`、`w`、`h` 位置，以 **三栏式标准布局** 紧凑填充画布，并全部绑定好数据集配置和字段属性。

---

## 5. 汇报展示效果亮点
1.  **动态呼吸感**：前台设置图表以 5 秒为一个周期自动刷新，前台图表会不断平滑渲染由 API 产出的最新正弦波/随机扰动曲线。
2.  **告警闪烁**：Alert List 中严重的设备告警带有红光闪烁动画，能瞬间引起汇报评委和领导的关注。
3.  **零环境搭建**：双击启动 API 和 Vite 后，直接能在 2D 编辑器中选择该大屏进行一键“预览”，立刻呈现一个满载数据的震撼大屏。
