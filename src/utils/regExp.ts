export const regExpCssStaticPath = /([a-zA-Z]:\\|..\/|.\/)([^\\:*<>|"?\r\n/]+\/)*[^\\:*<>|"?\r\n/]+\.(png|jpg|jpeg|svg|ttf|otf|woff|woff2|eot)/g
export const regExpJsStaticPath = (filename: string): RegExp => new RegExp(`=[a-z].[a-z]\\+('|")${filename}${'\\1'}`, 'g')
