import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Card, Spin, Row, Col } from 'antd';
import {
  useBlockHeight, useDesignable,
  useLocalVariables,
  useVariables,
  useVariableOptions, useCollectionRecord, replaceVariableValue
} from '@nocobase/client';
import { useField, useFieldSchema } from '@formily/react';
import { defaultToolbar } from "../constants";
import { Editor } from "../../../lib/tinymce_7.9.1/tinymce";
import { EditorTinyMCE } from './EditorTinyMCE';
import { URL_PUBLIC_LIB } from "../constants";

export const HtmlBlockTinyMCE = (props) => {
    const { content = '' } = props;
    const { dn, designable } = useDesignable();
    const field = useField();
    const schema = useFieldSchema();
    const record = useCollectionRecord();
    const targetHeight = useBlockHeight() || 'auto';
    const variableOptions = useVariableOptions({
        form: null,
        collectionField: { uiSchema: schema },
        record,
        uiSchema: schema,
        noDisabled: true,
    });
    const variables = useVariables();
    const localVariables = useLocalVariables();
    const refEditor = useRef<Editor>(null);
    const [state, setState] = useState<{ loading: boolean }>({ loading: true });

    //#region View content

    const [valueRaw, setValueRaw] = useState(content);
    const [valuePreview, setValuePreview] = useState('Loading ...');

    useEffect(function parseVariables() {
        (async () => {
            setState({ loading: true });
            try {
                setValuePreview(await replaceVariableValue(valueRaw, variables, localVariables));
            } catch (error) {
                setValuePreview(error.message);
            } finally {
                setState({ loading: false });
            }
        })();
    }, [valueRaw]);

    //#endregion
    //#region Handlers

    const saveContent = useCallback(() => {
        if (!refEditor.current) return;

        const valueRaw = refEditor.current.getContent();

        setValueRaw(valueRaw);
        schema['x-component-props'] ?? (schema['x-component-props'] = {});
        schema['x-component-props']['content'] = valueRaw;
        field.componentProps.content = valueRaw;
        dn.emit('patch', {
            schema: {
                'x-uid': schema['x-uid'],
                'x-component-props': {
                    content: valueRaw,
                },
            },
        });
    }, [state]);

    const handlerSave = useCallback(async () => {
        saveContent();
        field.editable = false;
    }, [state]);

    const handlerCancel = useCallback(async () => {
        field.editable = false;
        setState({ ...state }); // as forceUpdate
    }, [state]);

    //#endregion
    //#region Render

    if (state.loading) {
        return <Card style={{ minHeight: targetHeight || "100%" }}>
            <Spin />
        </Card>;
    }

    return <Card style={{ minHeight: targetHeight || "100%" }}>
        {field?.editable
            ? <>
                <EditorTinyMCE
                    editorRef={refEditor}
                    toolbar={`${defaultToolbar} | code`}
                    initialValue={content}
                    readOnly={!designable}
                    disabled={!designable}
                    init={{
                        save_enablewhendirty: true,
                        save_onsavecallback: handlerSave,
                        content_css: `${URL_PUBLIC_LIB}tinymce-block-edit.css`
                    }}
                    onChange={() => null}
                    scope={variableOptions || []}
                />
                <Row justify="end" style={{ marginTop: '1em' }} gutter={[10, 16]}>
                    <Col>
                        <Button onClick={handlerCancel}>Cancel</Button>
                    </Col>
                    <Col>
                        <Button type={'primary'} onClick={handlerSave}>Save</Button>
                    </Col>
                </Row>
            </>
            : <div className="mce-content-body"
                style={{ ...props.style, height: '100%', overflowY: targetHeight ? 'auto' : 'null' }}
                dangerouslySetInnerHTML={{ __html: valuePreview }}
            />
        }
    </Card>;

    //#endregion
};