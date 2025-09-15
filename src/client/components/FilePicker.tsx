import React, { useState, useEffect } from "react";
import { Button, Drawer, Table } from 'antd';
import { useRequest } from "@nocobase/client";

const DrawerCloseAnimationTime = 200;

export type FilePickerProps = {
    active?: boolean,
    fileCollection?: string,
    selectFile?: (url: string) => void,
    onClose?: () => void
};

export const FilePicker = (props: FilePickerProps) => {
    const { fileCollection = 'attachments', selectFile, onClose } = props;
    const [state, setStateRaw] = useState({
        hidden: true,
        open: false,
    });
    const setState = (data) => setStateRaw({ ...setState, ...data });
    const { data: dataSet } = useRequest< { data: { id: number }[] } >({
        resource: fileCollection,
        action: 'list',
        params: {
            pageSize: 20,
        },
    });

    useEffect(() => {
        setState({ hidden: false, open: true });
    }, []);

    return <>
        {state.hidden ? null : <Drawer
            zIndex={2000}
            key={'drawer'}
            size={'large'}
            open={state.open}
            onClose={() => {
                setState({ open: false });
                setTimeout(onClose, DrawerCloseAnimationTime);
            }}
        >
            <div>
                <Table dataSource={(dataSet?.data ? (Array.isArray(dataSet.data) ? dataSet.data : [dataSet.data]) : [])} columns={[
                    {
                        title: 'File',
                        key: 'file',
                        render: (item) => <div key={`file-${item.id}`}>
                            <div>{item.filename}</div>
                            <div>{item.size}</div>
                        </div>,
                    },
                    {
                        title: 'Actions',
                        key: 'select',
                        render: (item) => <Button key={`select-${item.id}`} onClick={() => {
                            selectFile(item.url);
                            setState({ open: false });
                        }}>Select</Button>,
                    },
                ]} />
            </div>
        </Drawer>}
    </>;
};
