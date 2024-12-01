declare module '@goldskycom/client' {
  export interface Config {
    name: string;
    description?: string;
    version: string;
    chains: {
      name: string;
      chainId: number;
      contracts: {
        name: string;
        address: string;
        startBlock: number;
        abi: string[];
      }[];
    }[];
    entities?: {
      [key: string]: {
        fields: {
          [fieldName: string]: string;
        };
      };
    };
  }
}
