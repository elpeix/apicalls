import log from 'electron-log'
import { is } from '@electron-toolkit/utils'

log.initialize()

log.transports.file.level = 'info'
log.transports.console.level = is.dev ? 'debug' : false
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

export default log
