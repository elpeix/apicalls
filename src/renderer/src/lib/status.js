export const getStatusName = (status) => {
  if (status >= 200 && status < 300) {
    return 'ok'
  }
  if (status >= 300 && status < 400) {
    return 'redirect'
  } 
  if (status >= 400 && status < 500) {
    return 'client-error'
  } 
  if (status >= 500 && status < 600) {
    return 'server-error'
  } 
  return 'unknown'
}