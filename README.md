# Projects++

Projects++ 是一个用于管理项目的 VSCode 拓展。大多数此类拓展仅支持通过手动添加标签的方式对项目进行分类管理，而本拓展可以自动检索并展示指定目录下的所有文件夹，您可以方便地将某个文件夹标记为一个项目根目录，并且将它添加到 VSCode 工作区或从工作区移除。

Projects++ is a VSCode extension to manage your projects. Most of the extensions of this kind only support classifying projects by manually adding tags, while this extension can automatically retrieve and display all folders under the specified directory, so you can easily mark a folder as a project root, and add it to the VSCode workspace or remove it from the workspace.

## 安装 Install

在完成 [开发计划](#开发计划-development-plan) 前本拓展将不会在 VSCode 拓展市场中发布，如果您想提前体验此拓展，可以在本拓展 github 页面的 Release 中获取 vsce 包并使用如下命令安装到您的 VSCode：

This extension will NOT be published to the VS Code Extension Marketplace until the [Development Plan](#开发计划-development-plan) is completed. If you want to try this extension in advance, you can get the vsce package in the Release of this extension's github page and install it with the following command:

```shell
code --install-extension vscode-projects-plus-plus-0.0.1.vsix
```

## 功能 Features

![1668567265583](assets/1668567265583.gif)

* 自动检索并展示指定目录下的文件夹（Retrieve and display all folders under the specified directory）；
* 将文件夹标记为项目根目录（Mark a folder as a project root）；
* 一键将目录或项目添加到 VSCode 工作区（Add a directory or project to the VSCode workspace with one click）；
* 从 VSCode 工作区移除目录（Remove a folder from the VSCode workspace）；
* 新建和删除文件夹（Create and delete folders）。

## 命令 Commands

* `Projects: Set root path`：设置开始检索项目的根路径（Set the root path to retrieve projects）；
* `Projects: Refresh`：刷新项目视图（Refresh the projects tree view）。

## 设置 Settings

* `projects-plus-plus.rootPath`：开始检索项目的根路径（The root path to retrieve projects）；
* `projects-plus-plus.projects`：项目路径的列表（A list of project paths）。

## 已知问题 Known Issues

* 添加第一个文件夹到工作区时会短暂出现欢迎页（The welcome view appear when add the first folder to the workspace）。
* 刚启动 VSCode 时点击 `X` 无法将文件夹从工作区移除，因为此时插件尚未激活（Can not remove a folder from the workspace when click `X` just after start VSCode, because the extension is not activated at this time）。

## 开发计划 Development Plan

- [ ] 重构代码（Refactor the code）；
- [ ] 增加工作区保存与切换功能；
- [ ] 打开时 `Projects` 视图自动展开到已经在工作区打开的项目或文件夹（Expand the `Projects` tree view to the projects or folders already opened in the workspace when open VSCode）；
- [ ] 使用模板创建项目（Create projects with templates）；
- [ ] 自动识别 vscode 项目、git 项目、cmake 项目等（Automatically recognize vscode projects, git projects, cmake projects, etc.）。

## 版本 Release Notes

### 0.0.1

初始版本，实现了项目检索、添加和删除等基本功能。

Initial version, implemented basic functions such as project retrieval, addition and deletion.
