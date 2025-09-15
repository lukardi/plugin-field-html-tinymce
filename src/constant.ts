//@ts-ignore
import pkg from "../package.json";
import { TFuncKey, TOptions } from 'i18next';

export function tval(text: TFuncKey | TFuncKey[], options?: TOptions) {
  if (options) {
    return `{{t(${JSON.stringify(text)}, ${JSON.stringify(options)})}}`;
  }
  return `{{t(${JSON.stringify(text)})}}`;
}

export const NAMESPACE = pkg.name;
export const NAMESPACE_BLOCK_STORAGE = `${NAMESPACE}-block.html-storage`;
export function generateNTemplate(key: string) {
  return tval(key, { ns: NAMESPACE })
}
export const ResourceName = 'tinymce';
