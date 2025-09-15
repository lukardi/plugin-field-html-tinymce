import Application, { Plugin } from '@nocobase/server';
import { NAMESPACE, ResourceName } from '../constant';
import { Context, Next } from '@nocobase/actions';
import Database from '@nocobase/database';

const createResource = (dependencies: {
  app: Application,
  db: Database,
}) => {
  const { app, db } = dependencies;
  app.resourceManager.define({
    name: ResourceName,
    actions: {
      check: async (context: Context, next: Next) => {
        const { fileCollectionName = 'attachments' } = context.action.params;
        let storage;

        const fileCollection = db.getCollection(fileCollectionName);
        const storageName = fileCollection?.options?.storage;
        if (storageName) {
          storage = await db.getRepository('storages').findOne({
            where: {
              name: storageName,
            },
          });
        } else {
          storage = await db.getRepository('storages').findOne({
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

  app.acl.allow(ResourceName, 'check', 'loggedIn');
};

export class PluginFieldHtmlTinymceServer extends Plugin {
  async afterAdd() { }

  async beforeLoad() { }

  async load() {
    createResource(this);
  }

  async install() { }

  async afterEnable() { }

  async afterDisable() { }

  async remove() { }
}

export default PluginFieldHtmlTinymceServer;
