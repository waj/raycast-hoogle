import { useFetch } from "@raycast/utils";

export interface Package {
  name?: string;
  url?: string;
}

export interface Module {
  name?: string;
  url?: string;
}

export interface Result {
  item: string;
  docs: string;
  type: string;
  package: Package;
  module: Module;
  url: string;
}

export const useHoogle = (q: string) => {
  return useFetch<Result[]>(`https://hoogle.haskell.org?hoogle=${q}&mode=json`, { execute: q != "" });
};
