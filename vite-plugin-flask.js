export default function flaskPlugin() {
    return {
        name: 'vite-plugin-flask',
        transformIndexHtml(html, { bundle }) {
            // 获取生成的文件名
            const jsFile = Object.keys(bundle).find(file => file.endsWith('.js'));
            const cssFile = Object.keys(bundle).find(file => file.endsWith('.css'));

            // 替换 HTML 中的引用
            return html
                .replace(
                    /<script type="module" crossorigin src="\/assets\/.*\.js"><\/script>/,
                    `<script type="module" src="{{ url_for('static', filename='${jsFile}') }}"></script>`
                )
                .replace(
                    /<link rel="stylesheet" crossorigin href="\/assets\/.*\.css">/,
                    `<link rel="stylesheet" href="{{ url_for('static', filename='${cssFile}') }}">`
                );
        }
    };
}