// .ink imports are compiled to ink runtime JSON strings by the Vite
// plugin in vite.config.ts.
declare module '*.ink' {
  const compiledJson: string;
  export default compiledJson;
}
