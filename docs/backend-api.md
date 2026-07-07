# 后端原型 API

## 启动

```bash
npm run api
```

默认监听：

- `http://localhost:4000`

可选环境变量见：

- `.env.example`

## 当前实现范围

当前后端为原型服务，基于 Node 原生 `http` 实现，并支持两种存储模式：

- `file`：本地 JSON 文件存储
- `mysql`：真实连接 MySQL，并将业务数据持久化到实体表

已实现：

- 登录鉴权与 Bearer Token
- 基于角色权限的 RBAC 拦截
- 项目级权限控制
- 大屏项目管理 API
- 三维场景管理 API
- 数据源管理 API
- 数据集管理 API
- 用户管理 API
- 全局项目管理 API
- 角色与 RBAC 元数据 API
- 数据源连通性测试 API
- 用户密码重置 API
- 发布 / 克隆 / 状态重置调试接口

## 数据存储

`file` 模式下运行后会在以下位置生成本地状态文件：

- `server/data/platform.json`

`mysql` 模式下仍会生成本地回退快照文件，用于数据库不可用时避免状态完全丢失：

- `server/data/mysql-state.json`

可以通过调试接口重置回种子数据：

```http
POST /api/debug/reset
```

## 接口列表

### 健康检查

- `GET /api/health`
- `GET /api/summary`
- `GET /api/system/storage`

### 认证

- `POST /api/auth/login`
- `GET /api/auth/me`

默认播种账号：

- `admin / Admin@123`
- `li.gong / Screen@123`
- `zhou.xuan / Scene@123`

### 大屏项目

- `GET /api/screenProjects`
- `GET /api/screenProjects/:id`
- `POST /api/screenProjects`
- `PUT /api/screenProjects/:id`
- `DELETE /api/screenProjects/:id`
- `POST /api/screenProjects/:id/publish`
- `POST /api/screenProjects/:id/clone`

### 三维场景

- `GET /api/sceneProjects`
- `GET /api/sceneProjects/:id`
- `POST /api/sceneProjects`
- `PUT /api/sceneProjects/:id`
- `DELETE /api/sceneProjects/:id`
- `POST /api/sceneProjects/:id/publish`

### 数据源

- `GET /api/dataSources`
- `GET /api/dataSources/:id`
- `POST /api/dataSources`
- `PUT /api/dataSources/:id`
- `DELETE /api/dataSources/:id`
- `POST /api/data-sources/:id/test`

### 数据集

- `GET /api/datasets`
- `GET /api/datasets/:id`
- `POST /api/datasets`
- `PUT /api/datasets/:id`
- `DELETE /api/datasets/:id`

## 数据接入约束

当前后端已经将 `dataset` 与 `dataSource` 建立真实关联：

- `dataset.dataSourceId`：关联的数据源主键
- `dataset.sourceName`：冗余展示字段，创建/更新时由后端按数据源名称回填

当前版本只支持基于 `MySQL` 类型数据源创建或更新数据集：

- `POST /api/datasets`
- `PUT /api/datasets/:id`

如果引用的数据源不存在，或数据源类型不是 `MySQL`，接口会返回 `400`。

如果某个数据源已被数据集引用，`DELETE /api/dataSources/:id` 会返回 `409`。

### 用户

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/:id/reset-password`

### 项目管理

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/publish`

### RBAC

- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`

### 项目成员授权

- `GET /api/project-memberships?projectId=...`
- `GET /api/project-memberships/:id`
- `POST /api/project-memberships`
- `PUT /api/project-memberships/:id`
- `DELETE /api/project-memberships/:id`

## 大屏内容模型

`screenProjects` 新增 `screenNodes` 字段，接口层返回结构化数组，数据库层存储为 `screen_projects.screen_nodes` 的 JSON 文本。

```json
{
  "id": "scr-001",
  "name": "厂区能耗总览",
  "group": "能源中心",
  "scene": "园区驾驶舱",
  "owner": "李工",
  "status": "published",
  "publishedVersion": "v1.8.0",
  "tags": ["能耗", "实时监控"],
  "screenNodes": [
    {
      "id": "node-1",
      "x": 120,
      "y": 80,
      "w": 280,
      "h": 160,
      "component": "rect",
      "props": {
        "text": "矩形容器"
      }
    }
  ],
  "updatedAt": "2026-07-05 18:30"
}
```

`screenNodes` 每项结构：

- `id: string`
- `x: number`
- `y: number`
- `w: number`
- `h: number`
- `component: string`
- `props: object`

## 查询约定

列表接口统一支持 `keyword` 模糊搜索，例如：

```http
GET /api/users?keyword=admin
GET /api/screenProjects?keyword=能耗
```

## MySQL 模式

切换为 MySQL 模式：

```bash
STORAGE_MODE=mysql npm run api
```

初始化 SQL：

- `server/data/init.sql`

初始化命令：

```bash
npm run api:mysql:init
```

当前 MySQL 模式说明：

1. 服务会读取 `MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`
2. `npm run api:mysql:init` 会初始化业务实体表和种子数据
3. 当前实体表包括 `roles`、`users`、`projects`、`screen_projects`、`scene_projects`、`data_sources`、`datasets`、`project_memberships`
4. 如果 MySQL 不可用，当前实现会回退到 `server/data/mysql-state.json`，避免接口直接失效
5. 当前下一步重点已经转向 2D/3D 内容模型、真实数据接入和发布版本体系

## 下一步

1. 用 MySQL 替换本地 JSON 存储
2. 为每个实体补 DTO 校验
3. 增加登录、鉴权和 RBAC 校验中间层
4. 增加数据源真实连接测试与 SQL 数据集建模
