import React from "react";
import {
  Plugin,
  SchemaSettings, SchemaComponentOptions, SchemaInitializerItem,
  SchemaSettingsBlockHeightItem,
  useSchemaInitializer, useSchemaInitializerItem,
  useDesignable,
} from '@nocobase/client';
import { useTranslation } from 'react-i18next';
import { HtmlTinyMceFieldInterface } from './HtmlTinyMceFieldInterface';
import { PicRightOutlined } from '@ant-design/icons';
import { useField } from '@formily/react';
import { EditorTinyMCE } from './components/EditorTinyMCE';
import { HtmlBlockTinyMCE } from './components/HtmlBlockTinyMCE';

export class PluginFieldHtmlTinymceClient extends Plugin {
  async load() {
    this.loadFieldEditor();
    this.loadDesignBlock();
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
      const blockInitializers = this.app.schemaInitializerManager.get('page:addBlock');
      blockInitializers?.add('otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });
      const formInitializers = this.app.schemaInitializerManager.get('form:configureFields');
      formInitializers?.add('addHtml', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      const createFormBlockInitializers = this.app.schemaInitializerManager.get('popup:addNew:addBlock');
      createFormBlockInitializers?.add('otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      const recordBlockInitializers = this.app.schemaInitializerManager.get('popup:common:addBlock');
      recordBlockInitializers?.add('otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      const recordFormBlockInitializers = this.app.schemaInitializerManager.get('RecordFormBlockInitializers');
      recordFormBlockInitializers?.add('otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      this.app.schemaInitializerManager.addItem('mobilePage:addBlock', 'otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      this.app.schemaInitializerManager.addItem('mobile:addBlock', 'otherBlocks.htmlTinyMCE', {
        title: '{{t("htmlTinyMCE")}}',
        Component: 'HtmlBlockTinyMCEInitializer',
      });

      this.app.schemaInitializerManager
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
            href: '/static/plugins/@lukardi/plugin-field-html-tinymce/lib/tinymce-block.css?rand='+Date.now()
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
