# 当前阶段实现说明

## 文档目的

本文档用于说明截至当前阶段，工业数据可视化平台原型已经实现了哪些功能、后端采用了什么数据模型、权限体系做到什么程度，以及距离题目要求还差哪些核心能力。

## 总体结论

项目当前已经完成了：

- 前端多模块原型界面
- Node 原生 HTTP 后端
- MySQL 实体拆表
- 登录鉴权
- RBAC 角色权限控制
- 项目级权限控制
- 核心业务资源的表级 CRUD

项目当前还未完成：

- 2D 大屏内容模型与画布持久化
- 3D 场景内容模型与资源管理
- 发布版本体系
- 真实外部 MySQL 数据源接入与 SQL 数据集建模
- 前端对权限、登录和项目授权的联调

换句话说，当前阶段已经完成“平台管理底座”和“权限底座”，但还没有完成“2D/3D 组态内容本身”的后端支撑。

## 已实现内容

### 1. 前端原型

前端已经具备完整的信息架构和模块入口：

- 平台概览
- 大屏项目
- 2D 编辑器原型
- 三维场景
- 3D 编辑器原型
- 数据源管理
- 数据集管理
- 用户管理
- 项目管理
- 系统设置

当前前端仍以原型页面和静态交互为主，尚未深度联动后端。

### 2. 后端服务

后端实现方式：

- 基于 Node 原生 `http`
- TypeScript 直接运行
- 支持 `file` / `mysql` 两种存储模式
- 当前主工作模式为 `mysql`

启动方式：

```bash
npm run api
```

MySQL 初始化：

```bash
npm run api:mysql:init
```

### 3. 数据库表

当前已经落地的业务表如下：

1. `roles`
2. `users`
3. `projects`
4. `screen_projects`
5. `scene_projects`
6. `data_sources`
7. `datasets`
8. `project_memberships`

其中：

- `roles`：角色与权限定义
- `users`：账号信息与密码摘要
- `projects`：全局项目
- `screen_projects`：2D 大屏项目元数据
- `scene_projects`：3D 场景项目元数据
- `data_sources`：数据源元数据
- `datasets`：数据集元数据
- `project_memberships`：项目级授权关系

## 当前后端能力矩阵

### 1. 用户与认证

已实现：

- 用户 CRUD
- 密码哈希存储
- 登录接口
- 当前用户接口
- 密码重置接口
- 禁用用户拦截

默认播种账号：

- `admin / Admin@123`
- `li.gong / Screen@123`
- `zhou.xuan / Scene@123`

### 2. RBAC

已实现：

- 角色表
- 角色 CRUD
- 角色权限列表
- 用户角色分配
- 路由级权限拦截

当前权限粒度：

- `screen:read/write`
- `scene:read/write`
- `data-source:read/write`
- `dataset:read/write`
- `user:read/write`
- `project:read/write`
- `system:write`

### 3. 项目级权限

已实现：

- 项目成员关系表 `project_memberships`
- 项目成员访问级别：
  - `viewer`
  - `editor`
  - `owner`
- 项目列表按当前用户可见范围过滤
- 项目修改要求 `editor` 或 `owner`
- 项目删除要求 `owner`
- 项目成员授权管理接口
- 非管理员创建项目时，自动赋予创建者 `owner`

### 4. 核心资源 CRUD

以下资源已经是表级 CRUD，不再依赖整份状态全量重写：

- `users`
- `roles`
- `projects`
- `screenProjects`
- `sceneProjects`
- `dataSources`
- `datasets`
- `project memberships`

### 5. 动作型接口

已实现：

- 数据源连通性测试
- 用户密码重置
- 大屏发布
- 大屏克隆
- 三维场景发布
- 项目发布

说明：

其中部分动作接口仍然有继续工程化的空间，例如发布和克隆的底层数据模型还不够细。

## 当前接口范围

### 认证

- `POST /api/auth/login`
- `GET /api/auth/me`

### 用户

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/:id/reset-password`

### 角色

- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`

### 全局项目

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/publish`

### 项目成员授权

- `GET /api/project-memberships?projectId=...`
- `POST /api/project-memberships`
- `PUT /api/project-memberships/:id`
- `DELETE /api/project-memberships/:id`

### 2D 大屏项目

- `GET /api/screenProjects`
- `POST /api/screenProjects`
- `PUT /api/screenProjects/:id`
- `DELETE /api/screenProjects/:id`
- `POST /api/screenProjects/:id/publish`
- `POST /api/screenProjects/:id/clone`

### 3D 场景项目

- `GET /api/sceneProjects`
- `POST /api/sceneProjects`
- `PUT /api/sceneProjects/:id`
- `DELETE /api/sceneProjects/:id`
- `POST /api/sceneProjects/:id/publish`

### 数据源

- `GET /api/dataSources`
- `POST /api/dataSources`
- `PUT /api/dataSources/:id`
- `DELETE /api/dataSources/:id`
- `POST /api/data-sources/:id/test`

### 数据集

- `GET /api/datasets`
- `POST /api/datasets`
- `PUT /api/datasets/:id`
- `DELETE /api/datasets/:id`

### 系统与调试

- `GET /api/health`
- `GET /api/summary`
- `GET /api/system/storage`
- `POST /api/debug/reset`

## 与题目要求的对齐情况

### 已较好覆盖的部分

1. 用户管理
   - 账号检索、创建、编辑、删除、密码重置已有后端基础

2. 项目管理
   - 全局项目 CRUD 已有
   - 项目级授权已建立

3. 数据管理
   - 数据源 / 数据集管理台账已有

4. 权限管理
   - 登录、RBAC、项目级权限已形成基本闭环

### 仍未完成的关键部分

1. 大屏可视化核心内容模型
   - 未实现画布 JSON、图层树、组件实例、组件属性、数据绑定持久化

2. 三维可视化核心内容模型
   - 未实现场景树、模型资源、节点属性、动画配置、设备点位绑定持久化

3. 发布版本体系
   - 当前只有状态切换，还没有正式的版本表与回滚机制

4. 真实数据源接入
   - 目前管理的是数据源元数据，不是外部业务数据库的完整接入能力

5. 数据集 SQL 建模
   - 目前没有 SQL、字段元数据、预览和刷新机制

6. 前后端联调
   - 当前前端原型尚未系统接入登录态、权限态与真实 API

## 当前还缺哪些基本功能

从“满足题目”出发，后端当前最缺的四类基本功能是：

1. 2D 大屏内容保存模型
2. 3D 场景内容保存模型
3. 数据源真实连接与数据集建模
4. 发布版本与版本回滚

## 建议的下一步开发顺序

### 第一优先级

1. 建立 `screen_versions`、`screen_components` 等 2D 组态内容表
2. 建立 `scene_versions`、`scene_nodes`、`scene_assets` 等 3D 内容表
3. 将 `screen_projects`、`scene_projects` 与 `projects` 建立强关联

### 第二优先级

1. 数据源真实连接测试
2. 数据集 SQL 与字段模型
3. 数据预览接口

### 第三优先级

1. 发布版本机制
2. 操作审计日志
3. DTO 校验与统一错误码
4. 分页、排序、条件过滤下推到 SQL

## 结论

当前项目已经完成了“平台后端底座”的主要部分：

- 认证
- RBAC
- 项目级授权
- 核心资源管理
- MySQL 持久化

但还没有进入题目最核心的“组态内容引擎”阶段。

如果继续开发，最关键的工作不再是继续补管理台 CRUD，而是进入：

- `2D/3D 组态内容模型`
- `真实数据接入`
- `发布版本体系`

这是从“平台管理原型”走向“可视化平台原型”的分水岭。
