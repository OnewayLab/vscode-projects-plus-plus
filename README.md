# Projects++

Projects++ 是一个用于创建和管理项目的 VSCode 拓展。大多数此类拓展仅支持通过手动添加标签的方式对项目进行分类管理，而本拓展可以自动检索并展示指定目录下的所有文件夹，您可以方便地将某个文件夹标记为一个项目根目录，并且将它添加到 VSCode 工作区或从工作区移除。

Projects++ is a VSCode extension to create and manage your projects. Most of the extensions of this kind only support classifying projects by manually adding tags, while this extension can automatically retrieve and display all folders under the specified directory, so you can easily mark a folder as a project root, and add it to the VSCode workspace or remove it from the workspace.

## 安装 Install

您可以从 VSCode 拓展商店中搜索 Projects++ 并点击安装，也可以在本拓展 github 页面的 Release 中获取 vsce 包并使用如下命令安装到您的 VSCode：

You can search for Projects++ in the VSCode extension marketplace and click install, or you can get the vsce package from the Release page of this extension on github and install it to your VSCode with the following command:

```shell
code --install-extension vscode-projects-plus-plus-<version-number>.vsix
```

## 功能 Features

![Demo](assets/demo.gif)

* 自动检索并展示指定目录下的文件夹（Retrieve and display all folders under the specified directory）；
* 将文件夹标记为项目根目录（Mark a folder as a project root）；
* 一键将目录或项目添加到 VSCode 工作区（Add a directory or project to the VSCode workspace with one click）；
* 从 VSCode 工作区移除目录（Remove a folder from the VSCode workspace）；
* 新建和删除文件夹（Create and delete folders）；
* 从模板创建项目（Create projects from a template)。

## 命令 Commands

* `Projects: Set global root path`：设置开始检索项目的根路径并保存为全局设置（Set the root path to retrieve projects from, which will be save as a global setting）；
* `Projects: Set workspace root path`：设置开始检索项目的根路径并保存为工作区设置（Set the root path to retrieve projects from, which will be save as a workspace setting）；
* `Projects: Refresh`：刷新项目视图（Refresh the projects tree view）。

## 设置 Settings

* `projects-plus-plus.rootPath`：开始检索项目的根路径（The root path to retrieve projects）；
* `projects-plus-plus.templateFolders`：包含项目模板的文件夹列表（A list of folders containing project templates）；
* `projects-plus-plus.projects`：项目路径的列表（A list of project paths）。

## 项目模板 Project Templates

本插件集成了来自 GitHub 的几个 star 数较高的项目模板（This extension integrates several project templates from Github with a high star count）：

* `CppMakefile`：C++ 项目模板，使用 Makefile 进行构建（C++ project template using Makefile）；
* `ModernCppStarter`：C++ 项目模板，使用 CMake 进行构建，包含测试套件、GitHub Actions、Clang 和 CMake 代码格式化等（C++ project template using CMake, including test suite, GitHub Actions, Clang and CMake code formatting, etc.）。

关于这些模板的详细信息和使用方式，请见模板中的 `README.md`。

See `README.md` in the template for more information.

您也可以通过设置 `projects-plus-plus.templateFolders` 定义自己的模板搜索路径，如果您有好的项目模板想要集成到本插件，欢迎提交 PR。

You can also define your own template search path through the setting `projects-plus-plus.templateFolders`. If you have a good project template that you want to integrate into this extension, please submit a PR.

## 更新日志 Change Log

见 [CHANGELOG](./CHANGELOG.md)。

See [CHANGELOG](./CHANGELOG.md).
