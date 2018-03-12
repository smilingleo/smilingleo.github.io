webpackJsonp([90415289315478],{385:function(n,l){n.exports={data:{markdownRemark:{html:"<h2>引子</h2>\n<p>从有了博客这个东西开始，就一直开始找各种好用的博客站点，csdn、新浪、搜狐、博客大巴、点点、google site、Github，甚至自己定制内容管理系统（CMS）Liferay，来建立自己的博客站点。免费的、收费的，都尝试了，可总觉得这里或者那里有点不满意。</p>\n<p>所以就有一个小心愿能实现一个自己喜欢的站点。</p>\n<p>这个站点应该可以：</p>\n<ul>\n<li>用比较“极客”的方式来写，符合我们这种工科IT男的作风。</li>\n<li>可以很灵活地定制，想加什么功能就加什么功能。</li>\n<li>最好有个主题，不是一个记流水账的地方。</li>\n</ul>\n<p>近来学习scala这门语言，对于我这个多年在OO世界中打拼的程序员在思维方式上的触动很大，有了找一个地方写一些关于scala学习方面的专题文章。</p>\n<p>两者一结合，就有了这个网站。</p>\n<h2>站点简介</h2>\n<p>这个网站是用下列技术构建的：</p>\n<ul>\n<li>Scala</li>\n<li>Playframework</li>\n<li>Markdown</li>\n<li>Websockets</li>\n<li>Redis</li>\n<li>MongoDB</li>\n<li>Twitter Bootstrap</li>\n</ul>\n<p>运行在Heroku上，除了域名，一切免费。</p>\n<h2>博客内容预告</h2>\n<p>这一系列文章将包括，但不限于：</p>\n<ul>\n<li>\n<p>构建本站技术介绍\n如何一步一步地搭建一个完整的网站。</p>\n</li>\n<li>\n<p>Scala语言特性</p>\n</li>\n<li>\n<p>一些Scala世界的常用工具，比如Akka、Scalaz的介绍等等。</p>\n</li>\n</ul>\n<p>你可以方便地在网站上直接测试一些小的代码，比如：</p>\n<!-- language:lang-scala run -->\n<pre><code>val i = 10\nprintln(i + 2)\nval j = 10\nprintln(j - i)\n</code></pre>\n<p>点击<code>Run</code>你就能看到执行结果。</p>\n<h2>TODO LIST</h2>\n<ul>\n<li>简单的搜索</li>\n<li>分页</li>\n<li>评论功能</li>\n</ul>",frontmatter:{title:"开篇",date:"October 25, 2013",path:"/2013/start",tags:[],excerpt:"网络博客"}}},pathContext:{prev:{html:'<p>本文将是一个系列文章，循序渐进地介绍本站的构建过程，不只是简单的技术介绍，重点是建站过程遇到的问题分析，以及解决的过程，所以起名<strong>“边建边学”</strong>系列。</p>\n<p>希望对学习<code>Scala</code>+<code>Playframework</code>的童鞋有所启发。</p>\n<p>本篇重点介绍如何用markdown来写技术文章，以及如何优化代码片段。</p>\n<h2>需求</h2>\n<ul>\n<li>用markdown来写博客，对不同代码类型能够进行美化</li>\n<li>技术博客一般会在文中包含部分代码片段，在看文章的时候，如果能运行一下这个代码片段，看看执行结果是什么，会对理解技术有所帮助，所以这里需要一个Web REPL (Read Eval Print Loop)</li>\n<li>博文列表中只显示博文头</li>\n</ul>\n<h2>实现</h2>\n<h3>markdown</h3>\n<p>用Markdown写文章的流程是这样的：</p>\n<ol>\n<li>\n<p>在本地创建md文件，用markdown语法写文章</p>\n<p>markdown语法不是本文的介绍重点，需要温习的童鞋请查看<a href="http://zh.wikipedia.org/zh-cn/Markdown">维基百科</a>，编辑工具可以考虑使用：<a href="http://mouapp.com">Mou</a>，或者chrome插件stackedit。</p>\n</li>\n<li>\n<p>将文章发布到网站。</p>\n<p>发布的最终目的是将文章上传到网站，可以是存到数据库中，可以是上传为一个文件，因为文章的特殊性，创作过程需要跟踪记录，而且md文章本身也是一个文件，所以直接将文件上传搞定。</p>\n<p>具体上传途径是通过git。其实从版本管理的角度，md文件和其他源代码文件没有什么不同。</p>\n</li>\n<li>\n<p>mardkown解析成为HTML</p>\n<p>这个解析有两种选择，一个是在服务器端解析，另外一个是在浏览器端通过javascript来解析。个人觉得没有太大不同，这里选择一个github上开源的工具来实现：<a href="https://github.com/sirthias/pegdown">Pegdown</a>。</p>\n<p>具体代码非常简单：</p>\n</li>\n</ol>\n<!-- language:lang-scala -->\n<pre><code>val processor = new PegDownProcessor()\nval markdownContent = "##title2\\n*item1"\nval htmlContent = processor.markdownToHtml(markdownContent)\n</code></pre>\n<ol start="4">\n<li>\n<p>代码美化</p>\n<p>将MD转换为html之后，代码片段只是被转换为：<code>&#x3C;pre>&#x3C;code> .... &#x3C;/code>&#x3C;/pre></code>，但是如何按照相应语言的语法进行高亮显示呢？其实任何Web效果的东西都没有什么神秘的，只是应用CSS而已。</p>\n<p>这里我们选用的是<a href="https://code.google.com/p/google-code-prettify/">prettify.js</a>，当然，还可以选择其他方案，比如<a href="http://highlightjs.org">highlight.js</a>.</p>\n<p>具体方案如下：</p>\n</li>\n</ol>\n<!-- language:lang-javascript -->\n<pre><code>&#x3C;script type=\'text/javascript\'>\n    function init() {\n        var prettify = false;\n        var blocks = document.querySelectorAll(\'pre code\')\n        for (var i = 0; i &#x3C; blocks.length ; i++) {\n            blocks[i].className += \'prettyprint\';\n            prettify = true;\n        }\n        if (prettify) {\n          prettyPrint();\n        }\n    }\n    window.onload = init;\n&#x3C;/script>\n</code></pre>\n<p>简单说，就是在页面（dom）加载完成之后，查找所有的pre+code元素，然后给该元素class添加<code>prettyprint</code>，这样有了预定义的样式表，代码语法高亮特性就实现了。\n<br>\n代码片段执行的部分将有专门的章节介绍，此处略过。\n</p>\n<h3>博文列表只显示文章头</h3>\n<p>在列表页面，将在一个页面列出大量的内容，如果将每篇文章都完整地列出来，那么页面将变得很长，而且也不方便用户查找，而如果能够只显示文章的开头部分，就可以让读者快速地了解文章大致内容，并且快速浏览近期文章，有选择性地查看文章。</p>\n<p>这个说起来其实很简单，展示部分内容逻辑上也很简单，只是简单截取文章开头的前N个字符而已。总体上是这个思路，可实际上会比这个稍微复杂一些。原因在于博文不是简单的plain text，而是HTML代码，如果只简单截取前面N个字符，极有可能会造成HTML片段不完整导致页面错误。</p>\n<p>知道问题所在之后，解决办法其实也就简单了。我们可以简单分析一下markdown转换为html之后的代码结构，比如：</p>\n<!-- language:lang-html -->\n<pre><code>&#x3C;h1>手工打造博客站点-1: 用Markdown写博文&#x3C;/h1>\n&#x3C;p>本文将是一个系列文章，循序渐进地介绍本站的构建过程，不只是简单的技术介绍，重点是建站过程遇到的问题分析，以及解决的过程。&#x3C;/p>\n&#x3C;p>希望对学习&#x3C;code>Scala&#x3C;/code>+&#x3C;code>Playframework&#x3C;/code>的童鞋有所启发。&#x3C;/p>\n&#x3C;p>本篇重点介绍如何用markdown来写技术文章，以及如何优化代码片段。&#x3C;/p>\n&#x3C;h2>需求&#x3C;/h2>\n……\n</code></pre>\n<p>很明显，标题、段落等html元素都是同级的，所以我们只需要一次计算每个html元素所包含内容的长度，当叠加到超过阀值时，将前面元素内容输出就好了。具体的办法是：先将html字符串解析为XML DOM，然后迭代每个一级children节点。</p>\n<!-- language:lang-scala -->\n<pre><code>val content = Source.fromFile(file, "UTF-8", 1024).mkString\nval htmlContent = "&#x3C;article>" + processor.markdownToHtml(content) + "&#x3C;/article>"\n// only show part of the article\nval xml = scala.xml.XML.loadString(htmlContent)\nvar i: Long = 0L\nval elemList = xml.child.takeWhile( el => { i += el.toString().length; i &#x3C; ConfigUtils.BLOG_HEAD_LENGTH } )\nval part = "&#x3C;article>" + elemList.mkString + s"""&#x3C;p>&#x3C;a href="/blogs/${file.getName}">[...]&#x3C;/a>&#x3C;/p>&#x3C;/article>"""\n</code></pre>\n<p>备注：</p>\n<ul>\n<li>在转换为html之后，需要在外面包一个<code>&#x3C;article></code>容器元素。</li>\n<li>从一个Seq容器元素中截取前面部分元素用<code>takeWhile</code>，此处有一个<code>var</code>可变参数的使用，其实也可以不用，只是用在这里容易一些。</li>\n<li>在最后添加一个指向文章全文的链接。</li>\n</ul>\n<h2>预告</h2>\n<p>下篇，将介绍如何将网页中的代码片段提交到服务器端执行并返回执行结果，也就是Web GUI REPL，敬请关注。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/用markdown写博客.markdown absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-01T14:06:45.000Z",path:"/2013/blogging-with-markdown",title:"边建边学-1: 用Markdown写博文",excerpt:"本文将是一个系列文章，循序渐进地介绍本站的构建过程，不只是简单的技术介绍，重点是建站过程遇到的问题分析，以及解决的过程，所以起名**“边建边学”**系列。",tags:["markdown","blog"]}},next:null}}}});
//# sourceMappingURL=path---2013-start-be8c9f33946bba3021dd.js.map