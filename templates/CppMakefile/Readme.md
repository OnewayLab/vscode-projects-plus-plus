# Cpp Project Template with Makefile

## 简介 Introduction

这是一个来自 [Makefile Templates](https://github.com/TheNetAdmin/Makefile-Templates) 的 C++ 项目模板，它具有以下特点：

This is the template for C++ Project from [Makefile Templates](https://github.com/TheNetAdmin/Makefile-Templates), which has the features like:

- 可能会有多层嵌套的源代码文件夹（There are nested src folders）；
- 中间文件应当在其源文件所在目录生成，而不是统一生成到一个目录下（如 `obj`）（The objects should be held by their folder, rather than a common folder like `obj`
- 大多数情况下仅有一个目标需要生成（Only one target to build in most cases）。

## 如何使用 How to

1. 修改 `./Makefile`（Modify `./Makefile`）：
   1. 填补标有 `# FILL: ...` 的空白并删除这些注释（Fill the blanks and remove their comments like `# FILL: ...`）；
   2. 在 `DIRS` 变量中指定所有含有源文件的子文件夹，在 `OBJS` 变量中指定所有当前目录下的中间目标文件（add all the src folders to variable `DIRS`, and all the objects in the current folder to variable `OBJS`）；
2. 修改 `./config/make.global`（Modify `./config/make.global`）：
   1. 指定编译器（Specify the compile tool）；
   2. 在 Linux/Mac 系统下，删除或注释掉 `export MAKE := ...` 行（Under Linux/Mac, delete or comment the line `export MAKE := ...`）；
   3. 在 Windows 系统下，填补 `export MAKE := ...` 行的空白并删除注释（Under Windows, fill the blank of `export MAKE := ...` and remove it's comment）；
3. 在每个子源代码文件夹下创建 `Makefile`，参考 `./src/Makefile`（Create Makefile in each sub src dir, following the template shown in `./src/Makefile`）。

## 工作流程 Work flow

当在根目录执行 `make` 命令时，其首先查看 `TARGET` 指定的文件所依赖的所有文件是否都是最新的，而其依赖的 `ALL_OBJS` 是由规则 `find-all-objs` 来进行查找的。

When executing `make` at the root folder, it will first look into the `TARGET` file, which depend on all the objects `ALL_OBJS` specified by the PHONY target `find-all-objs`.

如果 `TARGET` 任何依赖项不是最新的/还没有生成，则在其源文件所在目录生成对应的中间文件。待所有依赖都更新后，准备进行链接与编译。

If any of the objects are not updated, it will be re-generated at its own folder, and `TARGET` will use it for linking.

在链接时，首先通过 `find-all-objs` 递归查找所有源文件所在目录下的中间文件，并将其统一链接、编译到一个目标文件中。由于在当前环境下每个中间文件都带有路径前缀，所以不同目录下的相同名称的源文件不会产生冲突(例如既存在 *src1/f1.c* 也存在 *src2/f1.c* 是可以的)

When linking, compiler link all the object files under all the src dirs, recursively. Since there are path prefixs, it is ok to have filename conflict in different dir(like having *src1/f1.c* and *src2/f1.c* is ok)

## 问题与讨论 FAQ

1. 为什么每个源文件夹都要有一个 Makefile（Why we need a Makefile in each src dir）

   这样使我们能够在每个源文件所在的目录中维护其自己的中间文件，进一步允许了不同路径下的同名文件的存在。如果将所有中间文件输出到同一个目录下，那么目录1与目录2中的同名文件将生成同名的中间文件到指定目录下，这样会产生覆盖的问题，导致无法正常链接编译，只能额外添加规则或者进行重命名。

   This gives us the chance to maintain the objects under their sources' dirs, which further prevent the filename conflict under different path, since the objects will have a path prefix to eliminate the filename conflict.
2. 为什么要手动指定 `DIRS` 和 `OBJS` 变量，而不是自动查找（Why we should manually specify the `DIRS` and `OBJS`）

   出于这样的考虑: 一些源代码文件并不需要/不应该生成中间文件来参与链接和编译，比如当前目录下模块的单元测试文件 `unit_test.c` ；一些目录并不包含任何源文件，比如只包含文档的目录 *doc* (虽然这些目录也可能包含一些源文件，但其都是说明性代码，并不应该用来参与编译)

   Just in case some source file are not to be compiled(e.g. a test file named `test.c` may not need to be compiled), or some dirs does not contain any source files(e.g. a dir `doc` contains documents), nor in their sub-dirs.

   如果确实需要自动查找，那么可以通过如下方法实现（If you really want to do it automatically, you can do it like this）：

   1. 在文件 `config/submake.global` 中添加对于 `DIRS` 和 `OBJS` 的自动查规则（Add the auto-find rules for `DIRS` and `OBJS` in `config/submake.global`）；
   2. 将所有子文件夹中的 Makefile 中的手动指定的 `DIRS` 和 `OBJS` 变量去除（Remove the manually specified `DIRS` and `OBJS` in all the Makefiles under sub-dirs）。

   为了突出简洁性与通用性，我们这里不提供自动查找功能（其实在多数中型工程中，手动指定更加稳定且不易出错，反而是自动查找会导致一些隐藏的问题难以发现）。

   For simplicity, we do not provide this kind of auto-find which may cause some trouble unintentionally.
3. 为什么重新构建时，即时所有的依赖文件都是最新的，`TARGET` 仍然会重新编译一遍（Why re-link and re-generate the target even if all the objects are updated）

   这个问题一般是由于 `$(TARGET)` 规则依赖了一些 PHONY 规则，这些规则不产生其名称对应的文件，所以有可能被认为总是过时的，需要重新执行并重新编译。目前来讲我们还没有更好的解决方案，只好容忍这一冗余的存在。

   Since the target `$(TARGET)` depend on some PHONY targets, it may be re-generated even all non-PHONY dependencies are updated. But consider about the simplicity of the Makefile, this redundancy is endurable.
