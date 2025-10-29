export * from '../server/constant';

export const toolbarList: {
  key: string,
  label: string,
  desc: string,
  manager: boolean, // user can add into toolbar in a collection field configuration
  plugin: string | null, // plugin name relation
  setup?: (editor: any) => void
}[] = [
    // Non plugin
    ...([`aligncenter`, `alignjustify`, `alignleft`, `alignnone`, `alignright`, `blockquote`, `backcolor`, `blocks`, `bold`, `copy`, `cut`, `fontfamily`, `fontsize`, `fontsizeinput`, `forecolor`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `hr`, `indent`, `italic`, `language`, `lineheight`, `navigateback`, `newdocument`, `outdent`, `paste`, `pastetext`, `print`, `redo`, `remove`, `removeformat`, `selectall`, `strikethrough`, `styles`, `subscript`, `superscript`, `underline`, `undo`, `visualaid`].map((item) => {
      return { key: item, label: item, desc: 'Basic feature', manage: true, plugin: null };
    })),
    // Free simple plugins
    ...(['accordion', 'advlist', 'anchor', 'link', 'emoticons', 'charmap', 'nonbreaking', 'code', 'codesample', 'fullscreen', 'help', 'image', 'insertdatetime', 'media', 'pagebreak', 'preview', 'searchreplace', 'visualblocks', 'visualchars', 'wordcount'].map((item) => {
      return { key: item, label: item, desc: `Free plugin "${item}" feature`, manage: true, plugin: item };
    })),
    // Free non-simple plugins
    ...((() => {
      const result = [];

      [
        ['save', ['save', 'cancel']],
        ['lists', ['numlist', 'bullist']],
        ['table', ['table', 'tabledelete', 'tableprops', 'tablerowprops', 'tablecellprops', 'tableinsertrowbefore', 'tableinsertrowafter', 'tabledeleterow', 'tableinsertcolbefore', 'tableinsertcolafter', 'tabledeletecol']],
      ].forEach(([plugin, btns]: [string, string[]]) => {
        btns.forEach((btn => {
          result.push({ key: btn, label: btn, desc: `Free plugin "${plugin}" feature`, manage: true, plugin: plugin });
        }));
      });

      return result;
    })()),
  ];

export const toolbarMap = {};

toolbarList.map(item => {
  toolbarMap[item.key] = item;
});

export const defaultToolbar =
  `undo redo | styles fontsizeinput bold italic forecolor backcolor | link table image media
  alignleft aligncenter alignright alignjustify bullist numlist outdent indent | emoticons charmap nonbreaking | removeformat`
  ;

export const defaultFormats = [
  {
    title: 'Headings', items: [
      { title: 'Heading 1', format: 'h1' },
      { title: 'Heading 2', format: 'h2' },
      { title: 'Heading 3', format: 'h3' },
      { title: 'Heading 4', format: 'h4' },
      { title: 'Heading 5', format: 'h5' },
      { title: 'Heading 6', format: 'h6' }
    ]
  },
  {
    title: 'Inline', items: [
      { title: 'Bold', format: 'bold' },
      { title: 'Italic', format: 'italic' },
      { title: 'Underline', format: 'underline' },
      { title: 'Strikethrough', format: 'strikethrough' },
      { title: 'Superscript', format: 'superscript' },
      { title: 'Subscript', format: 'subscript' },
      { title: 'Code', format: 'code' }
    ]
  },
  {
    title: 'Blocks', items: [
      { title: 'Paragraph', format: 'p' },
      { title: 'Blockquote', format: 'blockquote' },
      { title: 'Div', format: 'div' },
      { title: 'Pre', format: 'pre' }
    ]
  },
  {
    title: 'Align', items: [
      { title: 'Left', format: 'alignleft' },
      { title: 'Center', format: 'aligncenter' },
      { title: 'Right', format: 'alignright' },
      { title: 'Justify', format: 'alignjustify' }
    ]
  }
];

export const defaultMenu = {
  file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | print | deleteallconversations' },
  edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
  view: { title: 'View', items: 'code revisionhistory | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
  insert: { title: 'Insert', items: 'image link media addcomment pageembed codesample inserttable | math | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
  format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
  tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
  table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
  help: { title: 'Help', items: 'help' }
};

export const URL_PUBLIC_LIB = global._?.name === 'lodash'
  ? '/static/plugins/@lukardi/plugin-field-html-tinymce/src/client/lib/'
  : '/static/plugins/@lukardi/plugin-field-html-tinymce/dist/client/lib/';
