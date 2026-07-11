# 工业数据可视化平台原型说明

## 1. 项目概览

这是一个工业数据可视化平台原型，目标不是做单一大屏，而是把“项目管理、2D 大屏编辑、3D 场景编辑、数据源/数据集管理、用户/角色/RBAC、项目级成员权限、登录鉴权、发布/预览/克隆/测试连接”串成一套可运行的平台底座。

从代码看，项目分成两层：

- 前端负责交互、编辑、管理页和路由控制。
- 后端负责账号鉴权、权限拦截、数据存储适配、数据源测试、数据集预览和项目资源 CRUD。

项目当前更接近“平台原型 + 编辑器原型 + 数据底座”，而不是完整生产版。代码里已经能跑通多数管理流，但 2D/3D 编辑器的内容模型和发布体系仍偏原型化。

## 2. 技术栈

### 前端

- `Vue 3`：页面、编辑器、预览页都基于 Vue 单文件组件实现。
- `Vite`：开发服务器和构建工具。
- `TypeScript`：前后端统一类型定义，`src/types` 和 `server/types` 共享类似的数据结构。
- `Vue Router`：负责登录页、总览页、2D/3D 编辑页、预览页等路由切换，并做前端权限守卫。
- `Element Plus`：表格、表单、弹窗、输入框、消息提示、上传等后台管理交互。
- `Tailwind CSS`：主要用于布局、间距、颜色和编辑器页面的视觉组织。
- `Axios`：统一请求封装，自动注入 token，统一错误处理。
- `ECharts`：代码里存在依赖，`screen-widgets` 里有图表组件物料，属于 2D 大屏图表渲染能力的一部分。
- `Three.js`：3D 场景编辑与预览的核心渲染引擎。
- `vue-draggable-resizable`：2D 大屏画布上的元素拖拽和缩放。

### 后端

- `Node.js`：后端运行时。
- `Express`：HTTP 服务框架，`server/index.ts` 用它挂载中间件和路由。
- `mysql2`：MySQL 连接、查询和事务写入。
- `morgan`：请求日志。
- `cors`：跨域支持，允许前端直连 API。

### 其他

- `.env`：运行配置，`server/lib/config.ts` 会主动读取。
- `file` / `mysql` 双存储：同一套业务 API 可以在本地 JSON 文件或 MySQL 模式下运行。

## 3. 总体架构

### 前端整体架构

前端是典型的管理后台结构：

- `src/router/index.ts` 负责路由表和权限守卫。
- `src/layouts/DashboardLayout.vue` 承载后台骨架。
- `src/views/*` 按业务域拆分页面：
  - `views/overview`：项目总览
  - `views/screens`：2D 大屏列表、编辑、预览
  - `views/scenes`：3D 场景列表、编辑、预览
  - `views/data`：数据源、数据集
  - `views/system`：用户、系统设置
- `src/utils/request.ts` 统一处理请求和错误。
- `src/components/screen-widgets/*` 是 2D 大屏物料。

### 后端整体架构

后端是“路由定义 + 统一入口执行”的结构：

- `server/routes/platform.ts` 集中定义所有接口。
- `server/index.ts` 遍历 `routes` 数组并统一挂载到 Express。
- `server/lib/store.ts` 负责数据层抽象。
- `server/lib/auth.ts` 负责密码、token、角色权限判断。
- `server/lib/http.ts` 负责统一响应格式和 `RouteDefinition` 约定。

这个结构的特点是：接口不是分散写在多个 controller 文件里，而是先抽成 `RouteDefinition`，再由 `server/index.ts` 做统一注册、统一鉴权、统一错误处理。

## 4. 前端实现

### 4.1 请求层

`src/utils/request.ts` 创建了一个 Axios 实例，做了两件关键事：

1. 请求前自动从 `localStorage` 读取 `auth_token`，写入 `Authorization: Bearer <token>`。
2. 响应失败时统一弹错误：
   - `401`：清理登录态并跳转 `/login`
   - `403`：提示权限不足
   - 其他错误：优先显示后端返回的 `message`

这意味着前端业务页面不需要每次手写 token 传递逻辑。

### 4.2 路由与守卫

`src/router/index.ts` 做了两层控制：

- 未登录用户访问非登录页会被重定向到 `/login`。
- `meta.permission` 会和 `localStorage.auth_permissions` 比对，不满足就拒绝进入。

它还有一个特殊规则：如果页面需要 `scene:read`，但用户拥有 `scene:write`，也允许访问。

这说明前端权限判断不是单纯“有无 token”，而是做了静态页面级门禁。

### 4.3 页面组织

前端页面不是按组件库拆，而是按业务域拆：

- `ProjectManagementView.vue`：统一项目总览，合并 2D/3D 项目。
- `ScreenProjectsView.vue` / `ScreenEditor.vue` / `ScreenPreview.vue`
- `SceneProjectsView.vue` / `SceneEditor.vue` / `ScenePreview.vue`
- `DataSourcesView.vue`
- `DatasetsView.vue`
- `UserManagementView.vue`
- `SystemSettingsView.vue`
- `Login.vue`

其中 `Login.vue` 登录成功后会把三项信息写入本地：

- `auth_token`
- `auth_user`
- `auth_permissions`

## 5. 后端实现

### 5.1 服务启动

`server/index.ts` 是后端入口。它做了以下事情：

- 创建 Express 实例。
- 开启 `cors`，允许 `Authorization` 头。
- `express.json()` 解析 JSON 请求体。
- 使用 `morgan('dev')` 记录请求。
- 遍历 `routes` 数组，按 `method + pattern` 挂载接口。
- 每个请求统一做：
  - `Authorization` 提取
  - token 校验
  - 用户加载
  - 角色权限判断
  - 业务 handler 执行
  - 异常捕获并返回 `500`
- 最后挂一个 404 fallback。

### 5.2 路由组织

`server/routes/platform.ts` 里把接口分成几类：

- 认证类：`/api/auth/login`、`/api/auth/me`
- 系统类：`/api/health`、`/api/system/storage`、`/api/summary`
- 资源 CRUD：`/api/users`、`/api/roles`、`/api/projects`、`/api/screenProjects`、`/api/sceneProjects`、`/api/dataSources`、`/api/datasets`
- 业务动作接口：`publish`、`clone`、`test`、`reset-password`
- 关联关系接口：`/api/project-memberships`

这里最重要的是 `resourceRouteCollection()`：

- 自动生成 list/detail/create/update/delete
- 自动加权限名
- 自动做关键词过滤
- 自动处理 `screenNodes` 等 JSON 字段的解析和校验

这就是“统一路由注册”的核心实现。

### 5.3 数据存储适配层

`server/lib/store.ts` 是整个后端最关键的抽象层。

它定义了 `StorageAdapter`，然后提供两种实现：

- `fileAdapter`
- `mysqlAdapter`

切换逻辑由 `server/lib/config.ts` 的 `STORAGE_MODE` 控制：

- `file`：读写 `server/data/platform.json`
- `mysql`：读写真实 MySQL 表

`mysqlAdapter` 还有一个回退快照文件 `server/data/mysql-state.json`。如果 MySQL 读失败，会回退读这个文件，避免接口完全挂掉。

### 5.4 认证与授权

`server/lib/auth.ts` 实现了三件事：

- `hashPassword()`：用 `sha256(authSecret + password)` 生成密码摘要。
- `issueToken()`：把 `userId/username/role/exp` 做成签名 token。
- `verifyToken()`：校验签名和过期时间。

权限判断靠 `roleHasPermission(role, permission)`，它只做一件事：看角色权限数组里有没有对应字符串。

### 5.5 错误返回

`server/lib/http.ts` 统一提供：

- `sendJson`
- `sendNoContent`
- `badRequest`
- `unauthorized`
- `forbidden`

所以后端错误返回比较一致，前端可以稳定按 `message` 处理。

## 6. 数据存储与数据模型

### 6.1 核心实体

`server/types/platform.ts` 和 `src/types/platform.ts` 里定义了平台核心数据：

- `ScreenProject`
- `SceneProject`
- `DataSource`
- `Dataset`
- `PlatformUser`
- `ManagedProject`
- `RoleDefinition`
- `ProjectMembership`

### 6.2 MySQL 表结构

`server/data/init.sql` 里建了这些表：

- `roles`
- `users`
- `projects`
- `screen_projects`
- `scene_projects`
- `data_sources`
- `datasets`
- `project_memberships`

其中最关键的存储设计是：

- `screen_projects.screen_nodes` 用 `TEXT` 存 JSON
- `scene_projects.scene_nodes` 用 `TEXT` 存 JSON
- `roles.permissions` 用 `TEXT` 存 JSON

这说明项目没有把 2D/3D 编辑器内容拆成细颗粒表，而是以 JSON 快照为主。

### 6.3 双存储模式

`file` 模式：

- 本地 JSON 文件就是主存储。
- 适合原型开发和无数据库环境。

`mysql` 模式：

- 直接映射到 MySQL 实体表。
- 保存时会全量写回表。
- 读失败会从 `mysql-state.json` 回退。

这是一种“原型兼容生产”的过渡结构，但不是严格意义上的事件溯源或增量持久化。

## 7. 登录鉴权与权限体系

### 7.1 登录链路

`POST /api/auth/login` 的处理是：

1. 校验 `username/password`。
2. 找用户。
3. 用 `verifyPassword()` 比对密码摘要。
4. 检查 `status === 'active'`。
5. 找用户所属角色。
6. 返回：
   - `token`
   - `user`
   - `permissions`

前端收到后存进 `localStorage`。

### 7.2 请求链路

前端每次请求会自动带上 `Authorization: Bearer <token>`。

后端 `server/index.ts` 统一提取 token，调用 `verifyToken()`，再根据 `userId` 读用户、读角色、做权限判断。

### 7.3 RBAC

RBAC 来自 `roles.permissions`。

播种数据里已经有四类角色：

- `Super Admin`
- `Screen Designer`
- `Scene Editor`
- `Data Operator`

每类角色的权限字符串在 `server/data/seed.ts` 已定义。权限粒度是资源型的，例如：

- `screen:read`
- `screen:write`
- `scene:read`
- `scene:write`
- `data-source:read`
- `data-source:write`
- `dataset:read`
- `dataset:write`
- `user:read`
- `user:write`
- `project:read`
- `project:write`
- `system:write`

### 7.4 项目成员权限

项目权限不是只靠 RBAC，还叠加了 `project_memberships`。

成员级别有：

- `viewer`
- `editor`
- `owner`

代码里对项目做了二次控制：

- 列表时，非超级管理员只能看到自己参与的项目。
- 修改项目要求 `editor` 或 `owner`。
- 删除项目要求 `owner`。
- 成员管理要求项目拥有者或超级管理员。

这就是项目里最有价值的“双层权限控制”：全局 RBAC 决定能不能碰这个资源，项目成员关系决定能不能碰某个具体项目。

## 8. 2D 大屏编辑器

### 8.1 数据模型

2D 大屏项目用 `ScreenProject` 表示，关键字段是：

- `screenNodes: ScreenNode[]`
- `publishedVersion`
- `status`
- `tags`

`ScreenNode` 的结构非常直接：

- `id`
- `x`
- `y`
- `w`
- `h`
- `component`
- `props`

### 8.2 编辑器实现

`src/views/screens/ScreenEditor.vue` 的工作方式是：

- 左侧是物料库，来自 `PaletteList`。
- 中间是画布，使用 `vue-draggable-resizable` 让节点可拖拽、可缩放。
- 右侧是属性面板，编辑当前选中节点。

创建节点时：

- 从物料模板读取 `component/defaultSize/defaultProps`
- 用 `crypto.randomUUID()` 生成节点 id
- 复制默认 props

画布交互包括：

- 拖入组件
- 拖动节点位置
- 缩放节点大小
- 点击选中节点
- 空白处拖动画布平移

### 8.3 数据绑定

编辑器支持绑定数据集：

- `props.datasetId`
- `props.xField`
- `props.yField`
- `props.refreshInterval`

绑定数据集后，编辑器会请求 `GET /api/datasets/:id/preview` 取字段列表，然后让用户选 X 轴、Y 轴或文本列。

这意味着大屏节点不是纯静态图元，而是带数据绑定配置的可视化对象。

### 8.4 保存、预览、发布、克隆

保存：

- `PUT /api/screenProjects/:id`
- 会提交 `screenNodes`
- 同时把状态改成 `editing`

预览：

- 先保存
- 再跳转 `/screens/:id/preview`

发布：

- 先保存当前节点快照
- 再 `POST /api/screenProjects/:id/publish`
- 支持手动输入版本号
- 不输入时后端自动递增 `publishedVersion`

克隆：

- 后端 `POST /api/screenProjects/:id/clone`
- 会复制项目快照
- 新项目名称追加“副本”
- 状态变成 `draft`

### 8.5 预览实现

`src/views/screens/ScreenPreview.vue` 会：

- 按 1920x1080 画布渲染
- 自动缩放适配浏览器窗口
- 根据节点的 `datasetId` 拉取数据集预览
- 把图表型组件的 `rows` 传给物料组件
- 对 `refreshInterval` 启动轮询

所以预览页不是截图，而是基于当前节点快照重新渲染。

## 9. 3D 场景编辑器

### 9.1 数据模型

3D 场景项目用 `SceneProject` 表示，核心字段：

- `sceneNodes`
- `modelCount`
- `engine`
- `status`

`sceneNodes` 里每个节点包含：

- `id`
- `name`
- `type`
- `sourceType`
- `sourceUrl`
- `position`
- `rotation`
- `scale`
- `props`

### 9.2 编辑器实现

`src/views/scenes/SceneEditor.vue` 用 `Three.js` 直接构建编辑工作台：

- `Scene`
- `PerspectiveCamera`
- `WebGLRenderer`
- `OrbitControls`
- `GridHelper`
- `AmbientLight`
- `DirectionalLight`
- `PointLight`

左侧面板提供两类能力：

- 从内置模型库添加“程序化模型”
- 导入 `.glb` / `.gltf` 文件

导入模型时：

- 读取文件为 data URL
- 用 `GLTFLoader` 加载
- 记录 `sourceType: 'imported'` 和 `sourceUrl`

模型选中通过：

- `Raycaster`
- 鼠标点击检测
- 命中后把对应根 `Group` 的 `name` 映射回 `selectedId`

属性面板可以编辑：

- 名称
- Position
- Rotation
- Scale
- 绑定数据集
- 报警字段
- 速度字段

### 9.3 保存与预览

保存：

- `PUT /api/sceneProjects/:id`
- 提交 `sceneNodes`
- 同时提交 `modelCount`
- 状态改成 `editing`

预览：

- 跳转 `/scenes/:id/preview`
- 预览页重新创建 Three.js 场景
- 读取保存的节点快照
- 对程序化模型和导入模型分别重建

### 9.4 3D 亮点

这个实现的价值不在于“用了 Three.js”，而在于它已经把 3D 编辑需要的最小闭环跑通了：

- 场景内创建对象
- 场景内选中对象
- 通过属性面板修改对象
- 保存对象快照
- 预览页重新加载对象

这比单纯静态展示要完整得多。

## 10. 数据源与数据集管理

### 10.1 数据源管理

`src/views/data/DataSourcesView.vue` 管理 `DataSource`。

支持：

- 搜索
- 类型筛选
- 状态筛选
- 新增/编辑/删除
- 测试连接

后端测试连接接口是：

- `POST /api/data-sources/:id/test`

对不同类型分别做检查：

- `MySQL`：建立 MySQL 连接并 `ping`
- `REST`：发 HTTP 请求
- `MQTT` / 其他 TCP 类：走 socket 连接测试

### 10.2 数据集管理

`src/views/data/DatasetsView.vue` 管理 `Dataset`。

支持：

- 搜索
- 按刷新策略筛选
- 按数据源筛选
- 新建/编辑/删除
- 预览数据

创建或编辑时：

- 先选择数据源
- 如果是 `MySQL`，前端会调用 `GET /api/dataSources/:id/tables` 拉取表名
- 如果是 `REST`，`tableName` 变成请求路径

后端限制：

- 数据集必须引用存在的数据源
- 目前只允许 `MySQL` 或 `REST` 类型数据源用于数据集

### 10.3 数据预览

`GET /api/datasets/:id/preview` 是数据集管理里最关键的动作接口。

MySQL 分支：

- 校验 `tableName`
- 只允许表名或 `schema.table`
- 使用 `SELECT * ... LIMIT 20`
- 返回 `columns` 和 `rows`

REST 分支：

- 拼接 `source.host + dataset.tableName`
- 真请求失败时会走 mock 逻辑
- 根据路径关键词返回不同模拟数据

这条接口是大屏编辑器和 3D 编辑器的数据字段选择基础。

## 11. 项目管理与成员权限

### 11.1 项目管理

`src/views/overview/ProjectManagementView.vue` 会合并：

- `screenProjects`
- `sceneProjects`

展示成统一项目列表，支持按类型、分组、状态、负责人筛选。

### 11.2 后端项目权限

后端 `projectRoutes` 对项目做了更严格的限制：

- 非超级管理员只能看自己参与的项目
- 创建项目后，如果不是超级管理员，会自动创建一条 `project_memberships`，把当前用户设成 `owner`
- 编辑和删除项目都要先检查成员权限

### 11.3 项目成员管理

`/api/project-memberships` 提供：

- 按项目查询成员
- 添加成员
- 修改成员权限
- 删除成员

但它的前提是：

- 只有项目拥有者或超级管理员能操作

这就是项目成员权限的主链路。

## 12. 接口与业务流程

### 12.1 CRUD 接口

资源 CRUD 都是同一套路由模板生成的：

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

其他资源同理：`roles`、`projects`、`screenProjects`、`sceneProjects`、`dataSources`、`datasets`。

### 12.2 业务动作接口

业务动作不是普通 CRUD，而是明确的动作型接口：

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/users/:id/reset-password`
- `POST /api/data-sources/:id/test`
- `GET /api/dataSources/:id/tables`
- `GET /api/datasets/:id/preview`
- `POST /api/screenProjects/:id/publish`
- `POST /api/screenProjects/:id/clone`
- `POST /api/sceneProjects/:id/publish`
- `POST /api/projects/:id/publish`

### 12.3 参数校验与存在性检查

后端已经做了一些关键校验：

- 请求体为空直接 `400`
- 引用的数据源不存在直接 `400`
- 数据源类型不支持直接 `400`
- 删除被引用数据源返回 `409`
- 角色被用户占用时禁止删除
- 数据集预览时对象名不合法直接拒绝

这部分不是完全统一的 DTO 验证，但已经有较明确的业务防线。

## 13. 亮点总结

### 13.1 后端统一路由注册与权限拦截

亮点不只是“写在一个文件里”，而是：

- 路由定义统一抽象成 `RouteDefinition`
- `server/index.ts` 统一执行 token、用户、角色、权限判断
- 每条路由只需要声明 `permission`

这能减少重复鉴权代码，也让权限策略集中可控。

### 13.2 token 鉴权与前端自动携带 Authorization

前端请求层自动注入 token，后端统一验 token。

这条链路完整且清晰：

- 登录拿 token
- 前端存 token
- 请求自动带 token
- 后端统一验证

这是管理后台最基本但必须稳定的链路。

### 13.3 RBAC + 项目成员权限双层控制

这是项目里最重要的权限设计。

- RBAC 决定“你这个角色能不能碰这个资源类型”
- 项目成员权限决定“你能不能碰这个具体项目”

这比单纯角色控制更适合工业项目的多人协作场景。

### 13.4 file / MySQL 双存储模式

这个设计对原型开发很实用：

- 无数据库时可以直接跑
- 联 MySQL 时可切到真实表
- 出现数据库问题时还能回退快照

它降低了原型调试门槛。

### 13.5 2D 大屏编辑闭环

2D 编辑器已经具备真实编辑器的骨架：

- 拖拽
- 缩放
- 属性编辑
- 数据绑定
- 保存
- 预览
- 发布
- 克隆

这说明它不只是“静态展示页”，而是有编辑数据模型的。

### 13.6 3D 场景编辑闭环

3D 编辑器也不是只渲染一个场景，而是：

- 资源库
- 导入模型
- 选中模型
- 属性编辑
- 保存
- 预览

### 13.7 数据源和 dataset 预览

数据源测试 + 数据集表枚举 + 预览接口，已经构成了数据接入的最小可用链条。

这对大屏字段绑定尤其重要。

## 14. 当前完成到什么程度

代码里已经完成的部分：

- 登录鉴权
- JWT-like token 体系
- RBAC
- 项目成员权限
- 用户管理
- 角色管理
- 项目管理
- 数据源管理
- 数据集管理
- 数据源连通性测试
- 数据集预览
- 2D 大屏编辑器原型
- 2D 预览
- 2D 发布/克隆
- 3D 编辑器原型
- 3D 预览
- 3D 发布
- file / MySQL 双存储

代码中未看到或未做完整的部分：

- 2D/3D 内容的细粒度版本管理
- 回滚
- 审计日志
- 分页排序下推到数据库
- 统一 DTO 校验
- 真实消息总线或实时数据订阅
- 真正的项目级资源隔离到编辑器内部
- 完整的用户-角色-项目成员权限后台联动

## 15. 当前局限与演进方向

### 15.1 2D/3D 内容模型还偏快照式

现在主要是把画布/场景节点整体存成 JSON。

问题是：

- 难做局部更新
- 难做版本差异
- 难做协作编辑

### 15.2 发布体系还不完整

现在的“发布”更像状态切换 + 版本字段更新，不是完整发布流水线。

代码中未看到：

- 发布记录表
- 回滚
- 发布审核
- 多环境发布

### 15.3 数据集建模还不够深

当前数据集更多是“数据源 + 对象名 + 预览”。

代码中未看到：

- SQL 编辑器
- 字段映射规则
- 聚合、过滤、关联
- 定时同步任务

### 15.4 前端权限仍偏页面级

前端是按路由 `meta.permission` 做控制的。

代码中未看到：

- 按按钮级别的细粒度权限渲染
- 按项目成员身份实时调整编辑器内控件权限

### 15.5 项目管理台与资源模型还没完全打通

项目表、2D 项目、3D 项目是并行存在的。

代码中未看到：

- 统一项目与编辑资源的强关联约束
- 项目目录树
- 资源归属和共享策略

---

如果只用一句话概括这个项目：它已经把一个工业可视化平台最关键的“登录、权限、资源、编辑、预览、存储”链路搭出来了，但内容引擎和版本体系还处在原型阶段。
