/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ISchema } from '@formily/react';
import { CollectionFieldInterface, interfacesProperties } from '@nocobase/client';
import { defaultToolbar, generateNTemplate as generateTemplate, toolbarList } from './constants';

const { defaultProps, operators } = interfacesProperties;

export class HtmlTinyMceFieldInterface extends CollectionFieldInterface {
  name = 'tinymce';
  type = 'object';
  group = 'media';
  order = 1;
  title = generateTemplate('TinyMCE');
  sortable = true;
  default = {
    type: 'text',
    length: 'long',
    uiSchema: {
      type: 'string',
      'x-component': 'EditorTinyMCE',
    },
  };
  availableTypes = ['text', 'json', 'string'];
  properties = {
    ...defaultProps,
    'uiSchema.x-component-props.fileCollection': {
      type: 'string',
      title: generateTemplate('File collection'),
      'x-component': 'CollectionSelect',
      'x-component-props': { filter: (collection) => collection?.options?.template === 'file' },
      'x-decorator': 'FormItem',
      default: '',
      'x-reactions': {
        fulfill: {
          schema: {
            description: generateTemplate(
              'Used to store files uploaded in the Markdown editor (default: attachments)',
            ),
          },
        },
      },
    },
    'uiSchema.x-component-props.height': {
      type: 'string',
      title: generateTemplate('Height'),
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      default: '500px',
      'x-reactions': {
        fulfill: {
          schema: {
            description: `Example: 100px, 300px, 11em, 20vh`
          },
        },
      },
    },
    'uiSchema.x-component-props.toolbar': {
      type: 'string',
      title: generateTemplate('Toolbar'),
      'x-component': 'Input.TextArea',
      'x-decorator': 'FormItem',
      default: defaultToolbar,
      'x-reactions': {
        fulfill: {
          schema: {
            description: `Use "|" as separator. Avaiable values: ${ toolbarList.map(({ key }) => key).join(', ') }`
          },
        },
      },
    },
  };
  schemaInitialize(schema: ISchema, { block }) {
    if (['Table', 'Kanban'].includes(block)) {
      schema['x-component-props'] = schema['x-component-props'] || {};
      schema['x-component-props']['ellipsis'] = true;
    }
  }
  filterable = {
    operators: operators.bigField,
  };
  titleUsable = true;
}
