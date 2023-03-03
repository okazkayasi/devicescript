import * as vscode from "vscode"
import { Utils } from "vscode-uri"

export type TaggedQuickPickItem<T> = vscode.QuickPickItem & { data?: T }

export async function showConfirmBox(title: string): Promise<boolean> {
    const confirm = await vscode.window.showQuickPick(["yes", "no"], {
        title,
    })
    return confirm === "yes"
}
