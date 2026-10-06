export type InitStep = { phase: "server_waiting" } | { phase: "sqlite_waiting" } | { phase: "done" }

export type ServerReadyData = {
  url: string
  username: string | null
  password: string | null
}

export type LumosWindowsApi = {
  systemInfo(): Promise<{ platform:string; release:string; arch:string; hostname:string; home:string; cpuCount:number; memoryBytes:number; freeMemoryBytes:number; appVersion:string; isWindows:boolean }>
  openPath(path:string): Promise<string>
  openExternal(url:string): Promise<void>
  showItemInFolder(path:string): Promise<void>
  selectFolder(): Promise<string|null>
  selectFile(): Promise<string|null>
  powershell(script:string): Promise<{stdout:string;stderr:string}>
  command(executable:string,args?:string[]): Promise<{stdout:string;stderr:string}>
  pathExists(path:string): Promise<boolean>
}
