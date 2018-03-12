webpackJsonp([0xfb9da88190b9],{394:function(n,e){n.exports={data:{markdownRemark:{html:'<p>根据Egghead上的教程，做出的博客站点有个缺陷，那就是没有分页功能，对于勤奋的博主来说，在一个页面上显示所有文章列表有点不完美，这里我们改造一下，加入分页功能。</p>\n<h2>步骤</h2>\n<ol>\n<li>引入<code>gatsby-paginate</code>组件</li>\n</ol>\n<pre><code class="language-bash">yarn add gatsby-paginate\n</code></pre>\n<ol start="2">\n<li>增加一个分页链接组件</li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>import React from \'react\'\nimport Link from \'gatsby-link\'\n\nconst PaginateLink = ({ tag, url, text }) => {\n    if (!tag) {\n        return &#x3C;span>&#x3C;Link to={ url }>{ text }&#x3C;/Link>&#x3C;/span>\n    } else {\n        return &#x3C;span>{ text }&#x3C;/span>\n    }\n}\n\nexport default PaginateLink\n</code></pre>\n<ol start="3">\n<li><code>mv pages/index.js templates/</code> 然后编辑</li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>import React from \'react\'\nimport Link from \'gatsby-link\'\n+import PaginateLink from \'./paginateLink\'\n+\n+const IndexPage = ({ data, pathContext }) => {\n+  // for pagination\n+  const { group, index, first, last } = pathContext;\n+  const prevUrl = index - 1 == 1 ? "" : (index - 1).toString();\n+  const nextUrl = (index + 1).toString();\n+  const total = data.allMarkdownRemark.edges.length;\n\n-const IndexPage = ({ data }) => {\nconst { edges: posts } = data.allMarkdownRemark\nreturn (\n    &#x3C;div>\n-      {posts.map(({ node: post }, pIdx) => {\n+      &#x3C;div className="posts">\n+      {group.map(({ node: post }, pIdx) => {\n        const { frontmatter } = post\n-        \n+\n        return (\n        &#x3C;div key={`post_${pIdx}`}>\n            &#x3C;h2>\n@@ -27,6 +35,18 @@ const IndexPage = ({ data }) => {\n        &#x3C;/div>\n        )\n    })}\n+      &#x3C;/div>\n+      &#x3C;div className="paginatation">\n+        &#x3C;div className="prevLink">\n+            &#x3C;PaginateLink tag={ first } url={ prevUrl } text="Prev Page" />\n+        &#x3C;/div>\n+\n+        &#x3C;p>{index} of { Math.ceil(total/12)}&#x3C;/p>\n+\n+        &#x3C;div className="nextLink">\n+            &#x3C;PaginateLink tag={ last } url={ nextUrl } text="Next Page" />\n+        &#x3C;/div>\n+      &#x3C;/div>      \n    &#x3C;/div>\n)\n}\n</code></pre>\n<ol start="4">\n<li>编辑<code>gatsby-node.js</code></li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>+const pagination = require(\'gatsby-paginate\');\n\nconst createTagPages = (createPage, posts) => {\nconst tagPageTemplate = path.resolve(`src/templates/tags.js`)\n@@ -72,6 +73,15 @@ exports.createPages = ({ boundActionCreators, graphql }) => {\n\n    createTagPages(createPage, posts)\n\n+      // default pagination to 10.\n+      pagination({\n+        edges: posts,\n+        createPage: createPage,\n+        pageTemplate: "src/templates/index.js",\n+        pageLength: 10\n+      });\n+\n+\n    posts.forEach(({node}, index) => {\n        createPage({\n        path: node.frontmatter.path,\n</code></pre>\n<ol start="5">\n<li>编辑样式</li>\n<li>重新发布<code>yarn deploy</code></li>\n</ol>',frontmatter:{title:"为Gatsby博客添加分页功能",date:"March 12, 2018",path:"/2018/support-pagination-for-gatsby-blog",tags:["blog","gatsby"],excerpt:"根据Egghead上的教程，做出的博客站点有个缺陷，那就是没有分页功能，对于勤奋的博主来说，在一个页面上显示所有文章列表有点不完美，这里我们改造一下，加入分页功能。"}}},pathContext:{prev:null,next:{html:"<p>Gatsby打造的博客已经很不错了，但是缺少一个评论功能。</p>\n<p>本文简单介绍如何集成Disqus评论服务到你的博客站点。</p>\n<h2>How To</h2>\n<p>首先，添加<code>react-disqus-thread</code>组件。</p>\n<pre><code>yarn add react-disqus-thread\n</code></pre>\n<p>之后，新建一个<code>Comments</code>的React组件。</p>\n<!-- language: lang-js -->\n<pre><code>const React = require('react');\nconst ReactDisqusThread = require('react-disqus-thread');\n\nclass Comments extends React.Component{\n\n    constructor(props) {\n        super(props);\n    }\n    \n    handleNewComment (comment) {\n        \n    }\n\n    render () {\n        const id = `smilingleo/${window.location.pathname}`;\n        return (\n            &#x3C;ReactDisqusThread\n                shortname=\"smilingleo\"\n                identifier={id}\n                title={this.props.title}\n                onNewComment={this.handleNewComment}/>\n        );\n    }\n};\n\nexport default Comments;\n</code></pre>\n<p>注意:</p>\n<ul>\n<li><code>identifier</code>需要是唯一的，这里我用了<code>smilingleo</code>作为前缀，加上<code>pathname</code>。</li>\n<li><code>onNewComment</code>的响应函数中，可以做一些有意思的东西，比如给你的IM发一条消息，尝试了Slack Webhook，可惜不支持CORS.</li>\n</ul>\n<p>最后，在<code>templates/blog-post.js</code>文件中添加：</p>\n<!-- language: lang-html -->\n<pre><code>&#x3C;hr />\n&#x3C;Comments title={title} />\n</code></pre>\n<p>搞定.</p>\n<h2>References</h2>\n<ol>\n<li><a href=\"https://github.com/mzabriskie/react-disqus-thread\">React Disqus thread component</a></li>\n</ol>",id:"/Users/lliu/github/smilingleo.github.io/src/pages/2018/为你的Gatsby博客添加评论功能.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2018-03-12T10:07:43.000+08:00",path:"/2018/enable-comments-for-gatsby-blog",title:"为你的Gatsby博客添加评论功能",excerpt:"Gatsby打造的博客已经很不错了，但是缺少一个评论功能。本文简单介绍如何集成Disqus评论服务到你的博客站点。",tags:["blog"]}}}}}});
//# sourceMappingURL=path---2018-support-pagination-for-gatsby-blog-d25d26e5fff7cdcbc12e.js.map