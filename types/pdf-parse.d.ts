declare module 'pdf-parse' {
  function parse(dataBuffer: Buffer): Promise<{
    text: string;
    numPages: number;
    info: any;
    metadata: any;
    version: string;
  }>;
  
  export default parse;
} 