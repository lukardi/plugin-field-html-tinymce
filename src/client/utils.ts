export const wrappedContent = {
    extract(value: string) {
        let content = '';
        let padding: string = null;

        if (typeof value === 'string') {
            const result1 = value.match(/^<section[^>]*>/)

            if (result1) {
                const result2 = result1[0].match(/padding\:\s*(.*);/);

                if (result2[1]) {
                    padding = result2[1];
                }

                content = value.substring(result1[0].length, value.length - '</section>'.length);
            } else {
                content = value;
            }
        }

        return { content, padding };
    },
    create(content: string, padding: string) {
        return padding ? `<section style="padding:${padding};">${content}</section>` : content;
    }
};