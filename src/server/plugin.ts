import fs from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from '@nocobase/server';
import { NAMESPACE, RESOURCE_NAME } from './constant';
import { Context, Next } from '@nocobase/actions';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export class PluginFieldHtmlTinymceServer extends Plugin {
  async getTiny() {
    const DIR_TINY = path.join(__dirname, '../client/lib/tinymce-7.9.1');
    const npmTinyUrl = 'https://registry.npmjs.org/tinymce/-/tinymce-7.9.1.tgz';

    try { await fs.stat(DIR_TINY); } catch (error) {
      await execPromise(`wget -qO- ${npmTinyUrl} | tar -xz && mv package ${DIR_TINY}`);
    }
  }

  async createResource() {
    this.app.resourceManager.define({
      name: RESOURCE_NAME,
      actions: {
        /**
         * Checking that the uploading is available
         * Copied from @nocobase/plugin-block-iframe
         */
        check: async (context: Context, next: Next) => {
          const { fileCollectionName = 'attachments' } = context.action.params;
          let storage;

          const fileCollection = this.db.getCollection(fileCollectionName);
          const storageName = fileCollection?.options?.storage;
          if (storageName) {
            storage = await this.db.getRepository('storages').findOne({
              where: {
                name: storageName,
              },
            });
          } else {
            storage = await this.db.getRepository('storages').findOne({
              where: {
                default: true,
              },
            });
          }

          if (!storage) {
            context.throw(
              400,
              context.t('Storage configuration not found. Please configure a storage provider first.', {
                ns: NAMESPACE,
              }),
            );
          }

          const isSupportToUploadFiles =
            storage.type !== 's3-compatible' || (storage.options?.baseUrl && storage.options?.public);

          const storageInfo = {
            id: storage.id,
            title: storage.title,
            name: storage.name,
            type: storage.type,
            rules: storage.rules,
          };

          context.body = {
            isSupportToUploadFiles: !!isSupportToUploadFiles,
            storage: storageInfo,
          };

          await next();
        },
      },
    });

    this.app.acl.allow(RESOURCE_NAME, 'check', 'loggedIn');
  }

  async load() {
    await this.getTiny();
    await this.createResource();
  }
}

export default PluginFieldHtmlTinymceServer;
