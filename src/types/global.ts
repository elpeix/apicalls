declare global {
  interface Window {
    electron: any
    api: {
      openDialog: (
        options: Electron.OpenDialogSyncOptions
      ) => Promise<Electron.OpenDialogReturnValue>
      dialog: Electron.Dialog
    }
  }
}
export default global
