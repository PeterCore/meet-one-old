/*
 * 对Markdown解析组件的封装
 * @Author: JohnTrump
 * @Date: 2018-06-14 19:53:35
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-06-14 19:59:48
 */
import Markdown, { getUniqueID } from 'react-native-markdown-renderer';
import AutoLink from 'react-native-autolink';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

/**
 * Just for test
 */
const copy = `
# h1 Heading 8-)

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Markdown in react-native is so cool!

You can **emphasize** what you want, or just _suggest it_ \n

You can even [**link your website**](https://meet.one)

Spice it up with some GIFs \n

![Some GIF](https://media.giphy.com/media/dkGhBWE3SyzXW/giphy.gif) \n

And even add a cool video \n

[![A cool video from YT](https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg)](http://www.youtube.com/watch?v=dQw4w9WgXcQ)

[![Another one from Vimeo](https://i.vimeocdn.com/video/399486266_640.jpg)](https://vimeo.com/57580368)
`;

const MarkdownView = ({text = copy, openLink = () => {}}) => (
    <Markdown
        rules={{
            link: (node, children, parent, styles) => {
                return (
                    <Text
                        onPress={(e) => {
                            const href = node && node.attributes && node.attributes.href;
                            openLink(href);
                        }}
                        key={getUniqueID()}
                        style={{color: '#34abff'}}>
                        [{children}]
                    </Text>
                )
            }
        }}

        style={{
            heading: {
                paddingTop: 6,
                paddingBottom: 8
            },
            table: {
                borderWidth: 1,
                borderColor: '#000000',
                borderRadius: 3,
                marginVertical: 8
            },
            text: {
                color: '#323232',
                fontSize: 16
            },
            strong: {
                fontWeight: 'bold',
            },
            link: {
                color: '#34abff'
            },
            blockquote: {
                borderLeftColor: '#e0e0e0',
                borderLeftWidth: 5,
                paddingHorizontal: 20,
                paddingVertical: 10,
                marginTop: 10,
                marginBottom: 10,
                backgroundColor: '#f0f0f0'
            }
        }}>
        {text}
    </Markdown>
)

export default MarkdownView;
