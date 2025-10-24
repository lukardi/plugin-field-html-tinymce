import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  useAPIClient, usePlugin, useVariableOptions
} from '@nocobase/client';
import { Editor as EditorComponent } from '@tinymce/tinymce-react';
import { Editor } from "../../../lib/tinymce_7.9.1/tinymce";
import { defaultFormats, defaultToolbar, RESOURCE_NAME, toolbarList, toolbarMap } from "../constants";
import { FilePicker, FilePickerProps } from './FilePicker';
import { URL_PUBLIC_LIB } from "../constants";

function reactElementTextContent(element: React.ReactElement): string {
    if (React.isValidElement(element)) {
        if (element?.props['children']) {
            if (Array.isArray(element.props['children'])) {
                return element.props['children'].map(reactElementTextContent).join('');
            }
            return reactElementTextContent(element.props['children']);
        }
    }

    return `${element}`;
}

export const EditorTinyMCE = (props: {
    fileCollection?: string,
    inline?: boolean,
    height?: string,
    toolbar: string,
    apiKey?: string,
    value?: string,
    initialValue?: string,
    onChange: (value: string) => void,
    disabled?: boolean,
    readOnly?: boolean,
    ellipsis?: boolean,
    children?: React.JSX.Element,
    init?: { [key: string]: any },
    editorRef?: React.MutableRefObject<Editor>,
    scope?: ReturnType<typeof useVariableOptions>
}) => {
    const { value, onChange, init = {}, initialValue, scope: variableOptions, fileCollection } = props;
    let { disabled, readOnly, inline, ellipsis } = props;
    const toolbar = props.toolbar || defaultToolbar;
    const editorRef = useRef<Editor>(null);
    const apiClient = useAPIClient();
    const [filePickerProps, setFilePickerProps] = useState<FilePickerProps>({ active: false, });
    const fileManagerPlugin: any = usePlugin('@nocobase/plugin-file-manager');

    //#region Handlers

    const handlerFilePicker = useCallback((
        cb: (newUrl: string, meta?: {}) => void,
        currentUrl: string,
        meta: { fieldname: string, fieldtype: string }
    ) => {
        setFilePickerProps({
            active: true,
            fileCollection,
            selectFile: (newUrl: string) => {
                cb(newUrl);
                setFilePickerProps({ active: false });
            },
            onClose: () => {
                setFilePickerProps({ active: false });
            }
        });
    }, []);

    const handlerUpload = useCallback((blobInfo: { blob(): File }, progress) => new Promise((resolve, reject) => {
        apiClient.resource(RESOURCE_NAME).check({
            fileCollectionName: fileCollection,
        }).then(({ data: checkData }) => {
            if (!checkData?.data?.isSupportToUploadFiles) {
                editorRef.current.notificationManager.open({
                    text: 'Upload is not support',
                    type: 'error'
                });
                reject('Upload is not support');
                return;
            }

            const file = blobInfo.blob();

            fileManagerPlugin.uploadFile({
                file,
                fileCollectionName: fileCollection,
                storageId: checkData?.data?.storage?.id,
                storageType: checkData?.data?.storage?.type,
                storageRules: checkData?.data?.storage?.rules,
            }).then(({ data, errorMessage }) => {
                if (errorMessage) {
                    editorRef.current.notificationManager.open({
                        text: errorMessage,
                        type: 'error'
                    });
                    return;
                }

                if (!data) {
                    editorRef.current.notificationManager.open({
                        text: 'Response data is empty',
                        type: 'error'
                    });
                    return;
                }

                resolve(data.url);
            }, (error) => {
                editorRef.current.notificationManager.open({
                    text: error.message,
                    type: 'error'
                });
            });
        }, (error) => {
            editorRef.current.notificationManager.open({
                text: error.message,
                type: 'error'
            });
        });
    }), [apiClient, fileCollection]);

    //#endregion
    //#region Setup

    const initPropPlugins = useMemo(() => {
        const listOfPlugins = toolbar
            .match(/\w+/g)                                                    // split
            .map(item => toolbarMap[item]?.plugin)                            // get plugin name
            .filter(item => item);                                            // rm nullish
        
        listOfPlugins.push('code', 'preview', 'searchreplace', 'visualblocks');

        return listOfPlugins.filter((item, index, array) => array.indexOf(item) === index); // rm duplicates
    }, [toolbar]);

    const editorSetup = useCallback((editor: Editor) => {
        toolbarList.forEach((item) => {
            if (item.setup) item.setup(editor);
        });
    
        if (init.setup) init.setup(editor);
        if (!variableOptions) return;

        class VariableItem {
            // Label, key

            key: string;
            label: any;
            disabled?: boolean;
            _label: string;

            getId() { return `nocoVar[${this.getPathKey()}]`; }
            getKey() { return this.key; }
            getPathKey() {
                return (this._parent ? this._parent.getPathKey() + '.' : '') + this.getKey();
            }
            getLabel() {
                if (!this._label) {
                    if (React.isValidElement<any>(this.label)) {
                        this._label = reactElementTextContent(this.label);
                    } else {
                        this._label = this.label;
                    }
                }

                return this._label;
            }
            isEnabled() { return !this.disabled }


            // Subitems

            isLeaf?: boolean;
            loadChildren?: (item: VariableItem) => void | Promise<void>;
            children?: any[];
            _parent: VariableItem = null;
            _isLoading = false;
    
            hasChildren() {
                if (this.isLeaf) return false;

                if ('children' in this) return true;
                else if ('loadChildren' in this) return true;

                return false;
            }

            isLoading() { return this._isLoading; }
            prepareChildren(parent: VariableItem = null) {
                if (Array.isArray(this.children)) {
                    for (let child of this.children) {
                        Object.setPrototypeOf(child, VariableItem.prototype);
                        child._parent = parent;
                    }
                }
            }
            prepareChildrenCallback(callback?: (item: VariableItem) => void) {
                if (typeof this.loadChildren === 'function' && !this._isLoading) {
                    this._isLoading = true;

                    const result = this.loadChildren(this);

                    if (result && result?.then) {
                        result.then(() => {
                            delete this.loadChildren;
                            this._isLoading = false;
                            this.prepareChildren(this);
                            callback?.(this);
                        });
                    } else {
                        delete this.loadChildren;
                        this._isLoading = false;
                        this.prepareChildren(this);
                        callback?.(this);
                    }
                } else {
                    this.prepareChildren(this);
                    callback?.(this);
                }
            }
        }

        const parseVariableItem = (item: VariableItem) => {
            Object.setPrototypeOf(item, VariableItem.prototype);

            if (item.hasChildren()) {
                item.prepareChildrenCallback((item: VariableItem) => {
                    const submenuItems = [];

                    if (item.children)
                    for (let child of item.children) {
                        const childId = parseVariableItem(child);

                        submenuItems.push(childId);
                    }

                    if (submenuItems.length === 0) {
                        submenuItems.push({
                            type: 'togglemenuitem',
                            text: item.isLoading() ? 'Loading ...' : 'No items',
                            enabled: false,
                            onAction: () => null,
                        });
                    }
        
                    editor.ui.registry.addNestedMenuItem(item.getId(), {
                        type: 'nestedmenuitem',
                        text: item.getLabel(),
                        enabled: item.isEnabled(),
                        getSubmenuItems: () => submenuItems
                    });
                });
            } else {
                editor.ui.registry.addMenuItem(item.getId(), {
                    type: 'menuitem',
                    text: item.getLabel(),
                    enabled: item.isEnabled(),
                    onAction: () => editor.insertContent(`{{${item.getPathKey()}}}`)
                });
            }

            return item.getId();
        };

        const firetLevelMenu =  variableOptions.map((item: any) => parseVariableItem(item));

        // Add variable Btn

        editor.ui.registry.addIcon('nocobaseVariables', `<span style='font-size: 1.6em; font-weight: bold; font-style: italic; font-family: "New York", "Times New Roman", Times, serif;'>x</span>`);
        editor.ui.registry.addMenuButton('nocobaseVariables', {
            icon: 'nocobaseVariables',
            tooltip: 'Nocobase Variables',
            fetch: (callback, context, api) => callback(firetLevelMenu),
        });
    }, []);

    //#endregion

    if (ellipsis || disabled) {
        return <div className="mce-content-body" dangerouslySetInnerHTML={{ __html: value }} />
    }

    const genFormat = (title, t, style) => {
        return { title, items: [
            ...[0, 0.25, 0.5, 1, 1.5, 3].map((e, i) => (
                { title: `${t}-${i}`, selector: '*', styles: { [style]: e+'em' } }
            )),
        ] };
    };

    const initProps = {
        height: props.height || '500px',
        language: 'pl',
        menubar: true,
        plugins: initPropPlugins,
        setup: editorSetup,
        protect: [
            /<!--[\s\S]*?-->/g,
        ],
        toolbar: `${ variableOptions ? 'nocobaseVariables | ' : '' }${toolbar}`.split("\n"),
        style_formats_merge: true,
        style_formats: [
            { title: 'Margin', items: [
                genFormat('All', 'm', 'margin'),
                genFormat('Top', 'mt', 'marginTop'),
                genFormat('Left', 'ml', 'marginLeft'),
                genFormat('Right', 'mr', 'marginRight'),
                genFormat('Bottom', 'mb', 'marginBottom'),
                { title: 'Special', items: [
                    { title: `mx-auto`, selector: '*', styles: { marginLeft: 'auto', marginRight: 'auto' } },
                ] }
            ] },
            { title: 'Padding', items: [
                genFormat('All', 'p', 'padding'),
                genFormat('Top', 'pt', 'paddingTop'),
                genFormat('Left', 'pl', 'paddingLeft'),
                genFormat('Right', 'pr', 'paddingRight'),
                genFormat('Bottom', 'pb', 'paddingBottom'),
            ] },
        ],
        relative_urls: false,
        images_upload_base_path: '/',
        file_picker_types: 'file image media',
        file_picker_callback: handlerFilePicker,
        images_upload_handler: handlerUpload,
        ...init,
    };

    return <>
        <EditorComponent
            key={'editor'}
            tinymceScriptSrc={`${URL_PUBLIC_LIB}tinymce_7.9.1/tinymce.min.js`}
            onInit={(event, editor: Editor) => {
                editorRef.current = editor;
                if (props.editorRef) props.editorRef.current = editor;
            }}
            value={value}
            initialValue={initialValue}
            disabled={disabled}
            readonly={readOnly}
            inline={inline}
            licenseKey={'gpl'}
            init={initProps}
            onEditorChange={(content: string, editor: Editor) => onChange?.(content)}
        />
        {filePickerProps.active ? <FilePicker key={'filepicker'} {...filePickerProps} /> : null}
        {inline ? <style key={'inline-style'}>{`.tox.tox-tinymce-inline { z-index: 100 }`}</style> : null}
    </>
};
