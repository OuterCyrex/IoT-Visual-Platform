# 机房 3D 场景闭环逻辑说明

## 1. 文档目的

本文档用于说明当前机房 3D 场景中的设备链路、数据闭环逻辑、各类设备职责，以及当前代码实现位置，便于项目汇报、需求沟通和后续迭代。

当前场景模板文件：

- [public/scene-templates/server-room-mega.json](D:/frontsProject/ioTVisualSystem/public/scene-templates/server-room-mega.json)

当前后端实时数据生成逻辑：

- [server/routes/platform.ts](D:/frontsProject/ioTVisualSystem/server/routes/platform.ts)

## 2. 场景目标

当前机房场景不是单纯摆放模型，而是希望表达一套完整的数据中心运行逻辑：

1. 机柜承载 IT 业务负载。
2. 业务负载带来电力消耗。
3. 电力消耗沿供电链路逐级传递。
4. 电力消耗同时带来散热压力。
5. 散热压力推动冷通道和空调负载变化。
6. 告警和运行状态最终汇总到运维监控视角。

因此，这个场景的核心不是“模型多”，而是“设备之间存在因果关系”。

## 3. 闭环总览

当前闭环链路如下：

`机柜负载`
-> `A/B 路母线`
-> `动力柜`
-> `UPS`
-> `PDU`
-> `总进线/主变配电`
-> `冷通道温度变化`
-> `精密空调负载变化`
-> `运维值班台汇总`

可以从两个角度理解：

### 3.1 电力链路

`substation-main`
-> `busway-a / busway-b`
-> `power-01 / power-02`
-> `ups-01 / ups-02`
-> `pdu-01 / pdu-02`
-> `rack-*`

### 3.2 制冷链路

`rack-*` 发热
-> `cold-aisle-a / cold-aisle-b` 温度抬升
-> `cooling-01 ~ cooling-04` 负载提升
-> `ops-desk` 汇总 PUE、告警数、总功率

## 4. 各设备职责说明

### 4.1 主变配电单元 `substation-main`

作用：

- 代表机房总进线与总配电入口。
- 用于体现整机房负载总量的上游承载情况。

典型指标：

- `input_kw`：进线功率
- `current_amp`：进线电流
- `status`：运行状态

业务意义：

- 当下游机柜、UPS、空调负载整体升高时，主变配电单元的输入功率也会升高。

### 4.2 A/B 路母线 `busway-a / busway-b`

作用：

- 表达双路供电结构。
- 将多个机柜负载汇总成两条供电主干。

典型指标：

- `load_percent`：母线负载率
- `bus_temp`：母线温度
- `status`：运行状态

业务意义：

- 当某一路机柜负载偏高时，对应母线负载与温升会更明显。

### 4.3 动力柜 `power-01 / power-02`

作用：

- 承接母线下发的电力。
- 体现配电柜的工作负荷情况。

典型指标：

- `load_percent`
- `current_amp`
- `status`

业务意义：

- 用于表达机房配电柜是否存在高负载或接近阈值的情况。

### 4.4 UPS `ups-01 / ups-02`

作用：

- 保障机房关键负载不断电。
- 表达 UPS 的输出负载和电池余量。

典型指标：

- `load_percent`
- `battery_soc`
- `status`

业务意义：

- 当下游负载抬升时，UPS 负载同步上升。
- 如果电池余量偏低，可视为风险抬升。

### 4.5 PDU `pdu-01 / pdu-02`

作用：

- 向列内机柜分发电力。
- 反映列头级配电压力。

典型指标：

- `load_percent`
- `current_amp`
- `status`

业务意义：

- 是“UPS 之后、机柜之前”的最后一层配电观察点。

### 4.6 机柜 `rack-*`

作用：

- 场景中的核心业务承载单元。
- 也是整条链路的主要数据源头。

典型指标：

- `power_kw`
- `intake_temp` / `outlet_temp`
- `status`

业务意义：

- 机柜功率越高，代表 IT 业务负载越高。
- 机柜负载变化会传导到供电链路和散热链路。

### 4.7 冷通道 `cold-aisle-a / cold-aisle-b`

作用：

- 反映冷通道环境状态。
- 体现机柜热负荷对环境的影响。

典型指标：

- `aisle_temp`
- `airflow`
- `status`

业务意义：

- 当某一路机柜负载升高时，冷通道温度也会升高。
- 冷通道是制冷系统是否有效的直接观察面。

### 4.8 精密空调 `cooling-01 ~ cooling-04`

作用：

- 承接制冷需求。
- 负责把热量带走。

典型指标：

- `load_percent`
- `return_temp`
- `status`

业务意义：

- 冷通道越热，空调负载越高。
- 是热管理侧的核心执行设备。

### 4.9 运维值班台 `ops-desk`

作用：

- 汇总机房整体健康状态。
- 作为值班视角的总览节点。

典型指标：

- `pue`
- `active_alarms`
- `status`

业务意义：

- 反映当前机房整体能效与告警压力。
- 适合用于总览展示，不面向单台设备细节。

## 5. 当前闭环如何成立

当前后端实现里，闭环不是每个设备随机出数，而是按因果关系逐步推导：

### 5.1 第一步：先生成机柜负载

机柜先生成这些基础数据：

- `power_kw`
- `intake_temp`
- `outlet_temp`
- `status`

这一步代表 IT 业务真实负载。

### 5.2 第二步：按 A/B 路汇总供电负载

机柜按照供电分组，分别汇总到：

- `busway-a`
- `busway-b`

因此母线负载来自机柜功率汇总，不是独立随机值。

### 5.3 第三步：继续推导配电与 UPS/PDU

基于 A/B 路汇总负载，再向上推导：

- `power-01 / power-02`
- `ups-01 / ups-02`
- `pdu-01 / pdu-02`

因此：

- 机柜吃电越多，UPS 负载越高
- UPS 负载越高，PDU 电流越大
- 动力柜负载也会同步抬升

### 5.4 第四步：推导总进线

将整个机房功率进一步汇总到：

- `substation-main`

因此主变/总进线代表整机房的总电力压力。

### 5.5 第五步：推导制冷压力

机柜负载升高会带来热量积聚，继而影响：

- `cold-aisle-a / cold-aisle-b`

冷通道温度升高之后，再推导：

- `cooling-01 ~ cooling-04`

因此空调负载不是独立变化，而是对热负载的响应。

### 5.6 第六步：汇总为运维视角

最后生成：

- `ops-desk`

用于承载：

- `pue`
- `active_alarms`
- `total_power_kw`

这样前端总览就能体现整个机房当前的综合状态。

## 6. 为什么这叫“闭环”

因为场景中的数据形成了完整的反馈链：

1. 业务增加，机柜功率上升。
2. 机柜功率上升，供电链路负载上升。
3. 供电链路负载上升，总进线压力上升。
4. 机柜功率上升，发热增加。
5. 发热增加，冷通道温度上升。
6. 冷通道温度上升，空调负载上升。
7. 供电或温度异常，会触发告警抬升。
8. 运维台最终汇总这些变化。

所以它不是单点监控，而是：

`IT 负载`
-> `供电`
-> `散热`
-> `告警`
-> `运维总览`

## 7. 当前前端场景绑定关系

当前场景使用 [public/scene-templates/server-room-mega.json](D:/frontsProject/ioTVisualSystem/public/scene-templates/server-room-mega.json) 中的节点绑定：

- `matchValue`：指定绑定哪台设备
- `valueField`：主显示指标
- `secondaryField`：辅助指标
- `statusField`：状态字段

例如：

- 机柜主要显示 `power_kw`
- 冷通道主要显示 `aisle_temp`
- UPS 主要显示 `load_percent`
- 运维台主要显示 `pue`

这意味着前端场景本身定义了“每类设备最重要的监控指标是什么”。

## 8. 当前实现位置

### 8.1 场景模板

- [public/scene-templates/server-room-mega.json](D:/frontsProject/ioTVisualSystem/public/scene-templates/server-room-mega.json)

用途：

- 定义模型节点布局
- 定义设备绑定关系
- 定义每类设备显示哪些字段

### 8.2 后端实时数据

- [server/routes/platform.ts](D:/frontsProject/ioTVisualSystem/server/routes/platform.ts)

关键函数：

- `buildServerRoomClosedLoopRows()`

用途：

- 生成机房实时 mock 数据
- 按闭环逻辑推导各类设备指标

### 8.3 数据集预览接口

接口入口同样位于：

- [server/routes/platform.ts](D:/frontsProject/ioTVisualSystem/server/routes/platform.ts)

对应数据集：

- `set-server-room-live`

## 9. 当前方案的价值

相比单纯“给每个设备随机填个数”，当前方案的价值在于：

1. 场景更像真实机房，而不是装饰模型集合。
2. 数据之间具备因果关系，更适合汇报和演示。
3. 前端看到的告警、温度、负载变化具备可解释性。
4. 后续如果接真实数据源，也能按现有设备链路逐步替换。

## 10. 后续可继续增强的方向

当前闭环已经具备演示价值，但如果要进一步贴近真实机房，可以继续增强：

1. 增加市电/发电机/ATS 切换链路。
2. 增加更多列级机柜与冷热通道分区。
3. 增加告警等级和告警文案细分。
4. 增加更多环境点位，例如湿度、烟感、水浸。
5. 增加空调冗余策略和 UPS 旁路策略。
6. 让运维台支持展示“当前最严重告警”而不仅是计数。

## 11. 总结

当前机房 3D 场景已经具备一套可讲清楚的业务逻辑：

- 机柜是负载源头
- 供电系统是承载链路
- 冷却系统是热量反馈链路
- 运维台是总览汇聚点

因此，这个场景已经不是“几个机柜加几台空调”，而是一套可以对外说明“机房如何运行、如何监控、为何形成闭环”的可视化方案。
