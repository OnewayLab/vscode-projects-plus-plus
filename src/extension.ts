// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { ProjectsTreeProvider } from './treeview'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const projectsTreeProvider = new ProjectsTreeProvider()
	vscode.window.registerTreeDataProvider('projects', projectsTreeProvider)
	vscode.commands.registerCommand(
		"projects-plus-plus.setRootPath",
		() => projectsTreeProvider.setRootPath()
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.refreshEntry',
		() => projectsTreeProvider.refresh()
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.openProject',
		(item) => projectsTreeProvider.openProject(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.newFolder',
		(item) => projectsTreeProvider.newFolder(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.delete',
		(item) => projectsTreeProvider.delete(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.markAsProject',
		(item) => projectsTreeProvider.markAsProject(item)
	)
	vscode.commands.registerCommand(
		'projects-plus-plus.markAsFolder',
		(item) => projectsTreeProvider.markAsFolder(item)
	)
}

// This method is called when your extension is deactivated
export function deactivate() { }
