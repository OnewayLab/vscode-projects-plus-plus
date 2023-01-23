/**
 * @fileoverview Project template manager of extension Projects++ for Visual Studio Code.
 * @author huangcb01@foxmail.com (Canbin Huang)
 * @license MIT
 */

import { Uri, workspace } from 'vscode'
import * as path from 'path'

const DEFAULT_PATH = path.join(__dirname, "..", "templates")
const DEFAULT_TEMPLATES = workspace.fs.readDirectory(Uri.file(DEFAULT_PATH))
    .then(entries => entries.map((entry): [string, string] => [entry[0], DEFAULT_PATH]))
var userPaths: string[] | undefined
var userTemplates: Thenable<[string, string][]>

/**
 * Get all templates.
 * @returns A promise of a list of templates, each of which is a pair of template name and folder.
 */
export async function getTemplates(): Promise<[string, string][]> {
    userPaths = workspace.getConfiguration("projects-plus-plus").get<string[]>("templatePaths")
    let userTemplatesPromises = userPaths ?
        userPaths.flatMap(userPath =>
            workspace.fs.readDirectory(Uri.file(userPath))
                .then(entries => entries.map((entry): [string, string] => [entry[0], userPath]))
        ) :
        []
    userTemplates = Promise.all(userTemplatesPromises).then(entries => entries.flat(1))
    const templates = (await Promise.all([DEFAULT_TEMPLATES, userTemplates])).flat(1)
    return templates
}

export function createProject(templatePath: string, projectUri: Uri) {

}

// function copyTemplate(src: string, dest: string) {
//     fs.writeFileSync(dest, fs.readFileSync(src));
// }