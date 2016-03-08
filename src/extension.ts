'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem, QuickPickOptions, WorkspaceConfiguration} from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

interface IShellCommand {
    description: string;
    command: string;
}

interface IShellQuickPickItem extends QuickPickItem {
    shell: IShellCommand;
}

export function activate(context: ExtensionContext): any {
    console.log('StartAnyShell is now active.');

    context.subscriptions.push(commands.registerCommand('startanyshell.startShell', startAnyShell));
}

export function deactivate(context: ExtensionContext): any {
}

function startAnyShell(): void {
    let config = workspace.getConfiguration('startanyshell');
    let editor = window.activeTextEditor;
    let rootPath = workspace.rootPath;
    let alwaysOpenRoot = config.get<boolean>('openworkspaceroot', true);

    if ((!alwaysOpenRoot || !rootPath) && editor && editor.document && editor.document.uri) {
        rootPath = path.dirname(editor.document.uri.fsPath);
    }

    if (!rootPath || rootPath === '') {
        rootPath = '.';
    }

    let options: QuickPickOptions = { matchOnDescription: false, placeHolder: 'Launch any shell in: ' + rootPath };

    Promise.resolve(window.showQuickPick(getShells(config), options))
        .then((item) => {
            if (!item) { return; }
            if (!item.shell) { return; }

            child_process.exec(formatCommand(item.shell, rootPath), {
                cwd: rootPath
            });
        })
        .catch(error => {
            window.showErrorMessage(error.message || error);
        });
}

function getShells(config: WorkspaceConfiguration): Promise<IShellQuickPickItem[]> {
    return new Promise(resolve => {
        let shells: IShellCommand[] = config.get<IShellCommand[]>('shells', []);

        resolve(shells.map(shell => {
            return { label: shell.description, description: shell.command, shell: shell };
        }));
    });
}

function formatCommand(command: IShellCommand, rootPath: string): string {
    return command.command
        .replace('%path%', rootPath)
        .replace('%description%', command.description);
    // TODO: add more tokens or eval();
}