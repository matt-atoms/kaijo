import { getCliClient } from 'sanity/cli'
const c = getCliClient({ apiVersion: '2024-01-01', useCdn: false })
console.log(JSON.stringify(await c.fetch(`*[_type=="page" && uri.current=="/"][0]{_id,"uri":uri.current,showHeader,showFooter}`), null, 2))
