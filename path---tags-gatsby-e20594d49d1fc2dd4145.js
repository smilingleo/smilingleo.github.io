webpackJsonp([0x7ab76f7a7e61],{441:function(n,e){n.exports={pathContext:{posts:[{html:'<p>根据Egghead上的教程，做出的博客站点有个缺陷，那就是没有分页功能，对于勤奋的博主来说，在一个页面上显示所有文章列表有点不完美，这里我们改造一下，加入分页功能。</p>\n<h2>步骤</h2>\n<ol>\n<li>引入<code>gatsby-paginate</code>组件</li>\n</ol>\n<pre><code class="language-bash">yarn add gatsby-paginate\n</code></pre>\n<ol start="2">\n<li>增加一个分页链接组件</li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>import React from \'react\'\nimport Link from \'gatsby-link\'\n\nconst PaginateLink = ({ tag, url, text }) => {\n    if (!tag) {\n        return &#x3C;span>&#x3C;Link to={ url }>{ text }&#x3C;/Link>&#x3C;/span>\n    } else {\n        return &#x3C;span>{ text }&#x3C;/span>\n    }\n}\n\nexport default PaginateLink\n</code></pre>\n<ol start="3">\n<li><code>mv pages/index.js templates/</code> 然后编辑</li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>import React from \'react\'\nimport Link from \'gatsby-link\'\n+import PaginateLink from \'./paginateLink\'\n+\n+const IndexPage = ({ data, pathContext }) => {\n+  // for pagination\n+  const { group, index, first, last } = pathContext;\n+  const prevUrl = index - 1 == 1 ? "" : (index - 1).toString();\n+  const nextUrl = (index + 1).toString();\n+  const total = data.allMarkdownRemark.edges.length;\n\n-const IndexPage = ({ data }) => {\nconst { edges: posts } = data.allMarkdownRemark\nreturn (\n    &#x3C;div>\n-      {posts.map(({ node: post }, pIdx) => {\n+      &#x3C;div className="posts">\n+      {group.map(({ node: post }, pIdx) => {\n        const { frontmatter } = post\n-        \n+\n        return (\n        &#x3C;div key={`post_${pIdx}`}>\n            &#x3C;h2>\n@@ -27,6 +35,18 @@ const IndexPage = ({ data }) => {\n        &#x3C;/div>\n        )\n    })}\n+      &#x3C;/div>\n+      &#x3C;div className="paginatation">\n+        &#x3C;div className="prevLink">\n+            &#x3C;PaginateLink tag={ first } url={ prevUrl } text="Prev Page" />\n+        &#x3C;/div>\n+\n+        &#x3C;p>{index} of { Math.ceil(total/12)}&#x3C;/p>\n+\n+        &#x3C;div className="nextLink">\n+            &#x3C;PaginateLink tag={ last } url={ nextUrl } text="Next Page" />\n+        &#x3C;/div>\n+      &#x3C;/div>      \n    &#x3C;/div>\n)\n}\n</code></pre>\n<ol start="4">\n<li>编辑<code>gatsby-node.js</code></li>\n</ol>\n<!-- language: lang-js -->\n<pre><code>+const pagination = require(\'gatsby-paginate\');\n\nconst createTagPages = (createPage, posts) => {\nconst tagPageTemplate = path.resolve(`src/templates/tags.js`)\n@@ -72,6 +73,15 @@ exports.createPages = ({ boundActionCreators, graphql }) => {\n\n    createTagPages(createPage, posts)\n\n+      // default pagination to 10.\n+      pagination({\n+        edges: posts,\n+        createPage: createPage,\n+        pageTemplate: "src/templates/index.js",\n+        pageLength: 10\n+      });\n+\n+\n    posts.forEach(({node}, index) => {\n        createPage({\n        path: node.frontmatter.path,\n</code></pre>\n<ol start="5">\n<li>编辑样式</li>\n<li>重新发布<code>yarn deploy</code></li>\n</ol>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2018/为Gatsby博客添加分页功能.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2018-03-12T11:31:26.000+08:00",path:"/2018/support-pagination-for-gatsby-blog",title:"为Gatsby博客添加分页功能",excerpt:"根据Egghead上的教程，做出的博客站点有个缺陷，那就是没有分页功能，对于勤奋的博主来说，在一个页面上显示所有文章列表有点不完美，这里我们改造一下，加入分页功能。",tags:["blog","gatsby"]}},{html:'<h2>起因</h2>\n<p>原来的博客站点基于Jekyll搭建，各种问题，感觉很不爽。后来看到Gatsby，基于ReactJS, GraphQL，都是我的最爱，于是果断投诚！</p>\n<h2>遇到的问题</h2>\n<h3>和prettyprint集成的问题</h3>\n<p>原来的prettyprint机制是在页面加载的时候调用<code>init()</code>，检查DOM中的<code>pre.code</code>元素。但是转到React之后，全部是前端Routing，原来写的<code>window.onload = init</code>不工作了。每次都要手动刷新。</p>\n<p>解决办法是在Gatsby Link元素的<code>onClick</code>事件中注册一个timer:</p>\n<!-- language: js -->\n<pre><code>&#x3C;Link to={frontmatter.path} onClick={() => setTimeout(init, 100)}>{frontmatter.title}&#x3C;/Link>\n</code></pre>\n<p>这样，在点击链接打开页面之后，就会调用<code>init</code>了。</p>\n<p><strong>更新：</strong>\n上面的方法更像是一个Hack，因为毕竟Link的目的只是指向一个target，不应该把不属于Link的职责(解析页面DOM并设置pre.code的style)绑定到Link上。</p>\n<p>重新思考了一下之后，重构了<code>templates/blog-post.js</code>，原来的<code>Template</code>是一个ES6箭头函数，因为我们希望的是在页面组件都Mount之后，调用<code>init</code>，所以，我们将其修改为一个扩展<code>React.Component</code>的class.</p>\n<!-- language:lang-js -->\n<pre><code>class Template extends React.Component {\n    constructor(props) {\n        super(props);\n    }\n    \n    /*\n    * Once the blog page is loaded, run init() to prettyprint the code.\n    */\n    componentDidMount() {\n        init();\n    }\n\n    render() {\n        const { markdownRemark: post } = this.props.data\n        const { frontmatter, html } = post\n        const { title, date } = frontmatter\n        const { next, prev } = this.props.pathContext\n    \n        return (\n            ...\n        )  \n    }\n}\n</code></pre>\n<p>这样，就达到目的了。</p>\n<h3>发布方法</h3>\n<p>原来以为是将这些源码直接push到 <code>smilingleo.github.io</code>，后来发现不对。</p>\n<p>需要有两个github repos，一个 <code>my-blog-code</code>, 另外一个 <code>smilingleo.github.io</code>。</p>\n<p>新的博文写完之后，需要<code>yarn deploy</code>，这样会发布到<code>public/</code>，然后将<code>public</code>目录指向<code>smilingleo.github.io</code>这个repo。</p>\n<p>所以，一篇博客需要提交两个git repos。</p>\n<h3>date格式问题</h3>\n<p>原来用Jekyll的时候，date可以是<code>YYYY-MM-dd HH:mm:ss</code>的格式，但是用Gatsby必须是<code>YYYY-MM-dd\'T\'HH:mm:ss</code>。</p>\n<h2>参考资料</h2>\n<ol>\n<li><a href="https://egghead.io/courses/build-a-blog-with-react-and-markdown-using-gatsby">Egghead教程</a></li>\n<li><a href="https://stackoverflow.com/questions/37170809/react-createclass-vs-es6-arrow-function/37170998#37170998">React.createClass vs. ES6 arrow function</a></li>\n</ol>\n<p>In summary:</p>\n<p>The short answer is that you want to use Stateless Functional Components (SFC) as often as you can; the majority of your components should be SFC\'s.</p>\n<p>Use the traditional Component class when:</p>\n<p>You need local state (<code>this.setState</code>)\nYou need a lifecycle hook (<code>componentWillMount</code>, <code>componentDidUpdate</code>, etc)\nYou need to access backing instances via refs (eg. <code>&#x3C;div ref={elem => this.elem = elem}></code>)</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2018/转用Gatsby搭建博客.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2018-03-08T17:01:00.000+08:00",path:"/2018/blog-with-gatsby",title:"转用Gatsby打造基于github的博客站点",excerpt:"如何用Gatsby打造一个博客",tags:["blog","github","gatsby"]}}],tagName:"gatsby"}}}});
//# sourceMappingURL=path---tags-gatsby-e20594d49d1fc2dd4145.js.map