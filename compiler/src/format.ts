import {
    Op,
    NumFmt,
    BytecodeFlag,
    BinFmt,
    OP_PROPS,
    ObjectType,
    OP_TYPES,
    NumFmtSpecial,
} from "./bytecode"
import { toHex } from "./jdutil"
import { DebugInfo } from "@devicescript/interop"

export * from "./bytecode"

import type ts from "typescript"
import { ResolvedBuildConfig } from "@devicescript/interop"
import { CompileFlags } from "./compiler"

export interface SMap<T> {
    [k: string]: T
}

export function opTakesNumber(op: Op) {
    return !!(OP_PROPS.charCodeAt(op) & BytecodeFlag.TAKES_NUMBER)
}

export function opNumRealArgs(op: Op) {
    return OP_PROPS.charCodeAt(op) & BytecodeFlag.NUM_ARGS_MASK
}

export function opNumArgs(op: Op) {
    let n = opNumRealArgs(op)
    if (opTakesNumber(op)) n++
    return n
}

export function opType(op: Op): ObjectType {
    return OP_TYPES.charCodeAt(op)
}

export function opIsStmt(op: Op) {
    return !!(OP_PROPS.charCodeAt(op) & BytecodeFlag.IS_STMT)
}

export function exprIsStateful(op: Op) {
    return (
        opIsStmt(op) || !(OP_PROPS.charCodeAt(op) & BytecodeFlag.IS_STATELESS)
    )
}

export function stmtIsFinal(op: Op) {
    return opIsStmt(op) && OP_PROPS.charCodeAt(op) & BytecodeFlag.IS_FINAL_STMT
}

export interface InstrArgResolver {
    describeCell?(fmt: string, idx: number): string
    verboseDisasm?: boolean
}

export function bitSize(fmt: NumFmt) {
    return 8 << (fmt & 0b11)
}

export function numfmtToString(v: number) {
    const fmt = v & 0xf
    const bitsz = bitSize(fmt)
    const letter = ["u", "i", "f", "x"][fmt >> 2]
    if (letter == "x") {
        const idx = (v >> 4) | ((v & 3) << 4)
        return NumFmtSpecial[idx] ?? "Spec." + idx
    }
    const shift = v >> 4
    if (shift) return letter + (bitsz - shift) + "." + shift
    else return letter + bitsz
}

export interface DevsDiagnostic extends ts.Diagnostic {
    filename: string
    line: number
    column: number
    endLine: number
    endColumn: number
    formatted: string
}

export interface Host {
    write(filename: string, contents: Uint8Array | string): void
    read(filename: string): string
    resolvePath(filename: string): string
    relativePath?(filename: string): string
    log(msg: string): void
    error?(err: DevsDiagnostic): void
    getConfig(): ResolvedBuildConfig
    verifyBytecode?(buf: Uint8Array, dbgInfo?: DebugInfo): void
    isBasicOutput?(): boolean
    getFlags?(): CompileFlags
}

export function parseImgVersion(v: number) {
    return {
        major: (v >> 24) & 0xff,
        minor: (v >> 16) & 0xff,
        patch: (v >> 0) & 0xffff,
    }
}

export function runtimeVersion() {
    const v = parseImgVersion(BinFmt.IMG_VERSION)
    return `v${v.major}.${v.minor}.${v.patch}`
}
