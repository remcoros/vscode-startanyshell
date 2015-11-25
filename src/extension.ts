'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem, QuickPickOptions, WorkspaceConfiguration} from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

interface ShellCommand {
    description: string,
    command: string;
}

interface ShellQuickPickItem extends QuickPickItem {
    shell: ShellCommand
}

export function activate(context: ExtensionContext) {
    console.log('StartAnyShell is now active.');

    const startShell = commands.registerCommand("startanyshell.startShell", () => {
        let config = workspace.getConfiguration('startanyshell');
        let editor = window.activeTextEditor;
        let rootPath = workspace.rootPath;
        let alwaysOpenRoot = config.get<boolean>("openworkspaceroot", true);

        if ((!alwaysOpenRoot || !rootPath) && editor && editor.document && editor.document.uri) {
            rootPath = path.dirname(editor.document.uri.fsPath);
        }

        if (!rootPath || rootPath == "") rootPath = ".";

        let options: QuickPickOptions = { matchOnDescription: false, placeHolder: "Launch any shell in: " + rootPath };

        Promise.resolve(window.showQuickPick(getShells(config), options))
            .then((item) => {
                if (!item) return;
                if (!item.shell) return;

                child_process.exec(formatCommand(item.shell, rootPath, context), {
                    cwd: rootPath
                });
            })
            .catch(error => {
                window.showErrorMessage(error.message || error);
            });
    });

    context.subscriptions.push(startShell);
}

function getShells(config: WorkspaceConfiguration): Promise<ShellQuickPickItem[]> {
    return new Promise(resolve=> {
        let shells: ShellCommand[] = config.get<ShellCommand[]>("shells", []);

        resolve(shells.map(shell => {
            return { label: shell.description, description: shell.command, shell: shell };
        }));
    });
}

function formatCommand(command: ShellCommand, rootPath: string, context: ExtensionContext) {
    return command.command
        .replace('%path%', rootPath)
        .replace('%description%', command.description);
    // TODO: add more tokens or eval();
}