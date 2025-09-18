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
  ...([`aligncenter`,`alignjustify`,`alignleft`,`alignnone`,`alignright`,`blockquote`,`backcolor`,`blocks`,`bold`,`copy`,`cut`,`fontfamily`,`fontsize`,`fontsizeinput`,`forecolor`,`h1`,`h2`,`h3`,`h4`,`h5`,`h6`,`hr`,`indent`,`italic`,`language`,`lineheight`,`navigateback`,`newdocument`,`outdent`,`paste`,`pastetext`,`print`,`redo`,`remove`,`removeformat`,`selectall`,`strikethrough`,`styles`,`subscript`,`superscript`,`underline`,`undo`,`visualaid`].map((item) => {
    return {key: item, label: item, desc: 'Basic feature', manage: true, plugin: null};
  })),
  // Free simple plugins
  ...(['accordion', 'advlist', 'anchor', 'link', 'emoticons', 'charmap', 'nonbreaking', 'code', 'codesample', 'fullscreen', 'help', 'image', 'insertdatetime', 'media', 'pagebreak', 'preview', 'searchreplace', 'visualblocks', 'visualchars', 'wordcount'].map((item) => {
    return {key: item, label: item, desc: `Free plugin "${item}" feature`, manage: true, plugin: item};
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
        result.push({key: btn, label: btn, desc: `Free plugin "${plugin}" feature`, manage: true, plugin: plugin});
      }));
    });

    return result;
  })()),
];

export const toolbarMap = {};

toolbarList.map(item => {
  toolbarMap[ item.key ] = item;
});

export const defaultToolbar = 
  `undo redo | styles fontsizeinput bold italic forecolor backcolor | link table image media
  alignleft aligncenter alignright alignjustify bullist numlist outdent indent | emoticons charmap nonbreaking | removeformat`
;
