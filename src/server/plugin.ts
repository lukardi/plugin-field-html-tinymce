import fs from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from '@nocobase/server';
import { NAMESPACE, RESOURCE_NAME } from './constant';
import { Context, Next } from '@nocobase/actions';

export class PluginFieldHtmlTinymceServer extends Plugin {
  /**
  * Fix problem with nginx configuration
  * see: nocobase/packages/core/cli/nocobase.conf.tpl
  *
  * Create access to /static/plugins/@lukardi/plugin-field-html-tinymce/dist/client/lib/*
  */
  async createPublicLocation() {
    const DIR_PLUGIN_ROOT = path.join(__dirname, '../..');
    const DIR_DIST_CLIENT = path.join(DIR_PLUGIN_ROOT, 'dist/client');
    const DIR_LIB = path.join(DIR_PLUGIN_ROOT, 'lib');
    const DIR_LINK = path.join(DIR_DIST_CLIENT, 'lib');

    if (process.env.IS_DEV_CMD) {
      fs.rm(DIR_LINK, { force: true });
    } else {
      // symlink @/dist/client/lib -> @/lib
      try { await fs.symlink(DIR_LIB, DIR_LINK, 'dir'); }
      catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
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
    await this.createPublicLocation();
    await this.createResource();
  }
}

export default PluginFieldHtmlTinymceServer;
