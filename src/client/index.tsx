import React from "react";
import {
  Plugin,
  SchemaSettings, SchemaComponentOptions, SchemaInitializerItem,
  SchemaSettingsBlockHeightItem,
  useSchemaInitializer, useSchemaInitializerItem,
  useDesignable,
  CompatibleSchemaInitializer,
  SchemaSettingsRenderEngine
} from '@nocobase/client';
import { useTranslation } from 'react-i18next';
import { HtmlTinyMceFieldInterface } from './HtmlTinyMceFieldInterface';
import { PicRightOutlined } from '@ant-design/icons';
import { useField } from '@formily/react';
import { EditorTinyMCE } from './components/EditorTinyMCE';
import { HtmlBlockTinyMCE } from './components/HtmlBlockTinyMCE';
import { URL_PUBLIC_LIB } from "./constants";
//@ts-ignore
import tinyPkg from 'tinymce/package.json';

tinyPkg.version;

export class PluginFieldHtmlTinymceClient extends Plugin {
  async load() {
    this.loadFieldEditor();
    setTimeout(() => {
      this.loadDesignBlock();
    });
  }

  loadFieldEditor() {
    this.app.addComponents({
      EditorTinyMCE: EditorTinyMCE,
      HtmlTinyMCE: EditorTinyMCE, // to remove
    });
    this.app.dataSourceManager.addFieldInterfaces([HtmlTinyMceFieldInterface]);
  }

  loadDesignBlock() {
    const addMenuItemToAddBlockMenus = () => {
      for (let item of [].concat(...Object.values(this.app.schemaInitializerManager['schemaInitializers']).map((CSI) => CSI.options.items.map((item) => {
        if (
          ['otherBlocks', 'others'].includes(item.name)
          && item.type === 'itemGroup'
          && Array.isArray(item.children)
        ) {
            return { CSI, key: `${item.name}.htmlTinyMCE` };
        }

        if (!item.Component) return;

        const name = item.Component.name?.toString() || item.Component.toString();

        try {
          if (
            name.includes('MarkDown')
            || name.includes('Markdown')
            || name.includes('markdown')
            || item.schema?.['x-component']?.includes('Markdown')
          ) {
            return { CSI, key: 'htmlTinyMCE' };
          }
        } catch (error) {}
        return false;
      }).filter(v => v)).filter(v => v.length))) {
        const CSI: CompatibleSchemaInitializer = item.CSI;
        const key: string = item.key;

        CSI.add(key, {
          title: '{{t("htmlTinyMCE")}}',
          Component: 'HtmlBlockTinyMCEInitializer',
        });
      }
    };

    const createBlockInitializer = () => {
      const HtmlBlockTinyMCEProvider = (props: any) => {
        return (
          <SchemaComponentOptions components={{ HtmlBlockTinyMCEInitializer: HtmlBlockTinyMCEInitializer }}>
            {props.children}
          </SchemaComponentOptions>
        );
      };

      const HtmlBlockTinyMCEInitializer = (props) => {
        const { insert } = useSchemaInitializer();
        const itemConfig = useSchemaInitializerItem();
        return <SchemaInitializerItem
          {...itemConfig}
          icon={<PicRightOutlined />}
          onClick={() => {
            insert({
              type: 'void',
              'x-settings': 'blockSettings:htmlTinyMCE',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                name: 'htmlTinyMCE',
              },
              'x-component': 'HtmlBlcokTinyMCE',
              'x-component-props': {},
              'x-editable': false,
            });
          }}
        />
      };

      this.app.addComponents({
        'HtmlBlockTinyMCEInitializer': HtmlBlockTinyMCEInitializer,
        'HtmlBlockTinyMCEProvider': HtmlBlockTinyMCEProvider,
      });
      this.app.use(HtmlBlockTinyMCEProvider);
    };

    const createDesignerMenuForBlock = () => {
      const HtmlBlockTinyMCESchemaSettings = new SchemaSettings({
        name: 'blockSettings:htmlTinyMCE',
        items: [
          {
            name: 'EditHtml',
            type: 'item',
            useComponentProps() {
              const field = useField();
              const { t } = useTranslation();
              const { dn } = useDesignable();
              return {
                title: t('Edit html'),
                onClick: () => {
                  field.editable = true;
                  dn.refresh();
                },
              };
            },
          },
          {
            name: 'setTheBlockHeight',
            Component: SchemaSettingsBlockHeightItem,
          },
          {
            name: 'setBlockTemplate',
            Component: SchemaSettingsRenderEngine,
          },
          {
            name: 'delete',
            type: 'remove',
            useComponentProps() {
              return {
                removeParentsIfNoChildren: true,
                breakRemoveOn: {
                  'x-component': 'Grid',
                },
              };
            },
          },
        ],
      });

      this.app.schemaSettingsManager.add(HtmlBlockTinyMCESchemaSettings);
    };

    const injectStyles = () => {
      if (!document.getElementById('tinymce-block-styles')) {
        document.head.appendChild(Object.assign(
          document.createElement('link'),
          {
            id: 'tinymce-block-styles',
            rel: 'stylesheet',
            href: `${URL_PUBLIC_LIB}tinymce-block.css?rand=${Date.now()}`
          }
        ));
      }
    };

    this.app.addComponents({
      'HtmlBlockTinyMCE': HtmlBlockTinyMCE,
      'HtmlBlcokTinyMCE': HtmlBlockTinyMCE, // to remove
    });

    addMenuItemToAddBlockMenus();
    createBlockInitializer();
    createDesignerMenuForBlock();
    injectStyles();
  }
}

export default PluginFieldHtmlTinymceClient;
