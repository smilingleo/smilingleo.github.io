webpackJsonp([95988397937227],{413:function(n,e){n.exports={pathContext:{posts:[{html:'<p>Markdown是一个很爽的写作格式（或者说语言更合适一点），我们不再需要复杂的富文本编辑器，用纯文本就可以编写出布局漂亮的文章。</p>\n<p>不过Markdown对于技术类文章来说还有一个不足：我们经常需要画一些图来阐述自己的思路，但是Markdown只能引用已经存在的图。</p>\n<p>有没有可能用Plain Text来画图呢？AscII艺术图？太原始了。试试PlantUML吧。</p>\n<h2>PlantUML介绍</h2>\n<p>从某个角度说，<a href="http://plantuml.sourceforge.net">PlantUML</a>简直就是Markdown的绝配，也只需要纯文本就可以实现漂亮的效果，只是这里变成更炫的UML图。</p>\n<p>比如我想画一个类图，Cat和Dog继承Animal，用PlantUML来实现就是：</p>\n<pre><code>@startuml\nAnimal &#x3C;|-- Cat\nAnimal &#x3C;|-- Dog\n@enduml\n</code></pre>\n<p>是不是很简单？来看看效果：</p>\n<!-- language:uml -->\n<pre><code>Animal &#x3C;|-- Cat\nAnimal &#x3C;|-- Dog\n</code></pre>\n<p>怎么样？不错吧，这个图片哪里来的？其实在我发布这篇文章的时候，这个类图还不存在，只有在你访问这篇文章的时候才自动生成的。PlantUML有一个jQuery插件，可以在运行时生成图片。</p>\n<p>PlantUML的jQuery插件用法很简单，你只需要在html中编辑：</p>\n<!-- language:lang-html -->\n<pre><code>&#x3C;img uml="\n  Animal &#x3C;|-- Cat\n  Animal &#x3C;|-- Dog\n">\n</code></pre>\n<p>jQuery插件会自动增强这个img元素，具体实现还挺有意思，这里不细说了。</p>\n<p>可这还不够，怎么在Markdown中写<code>img</code>呢？如果你照抄上面的img代码，pegdown解析器会抛错，\'&#x3C;\'不匹配云云。</p>\n<h2>解决方案</h2>\n<p>基本上这种问题可以从两个方面想办法，一个是服务器端，实现一个markdown parser plugin，来定制一个特殊语法，另一个方向是从浏览器端想办法。</p>\n<p>从上面的介绍中我们知道，已经有jQuery插件了，那从前端做似乎更加容易一些。此外，从<a href="http://www.learn-scala.net/blogs/2013-11-01_14.md">上一篇</a>我们已经知道，在<code>pre code</code>前面加上一个<code>&#x3C;!-- language:lang-scala --></code>来实现语法高亮显示问题。</p>\n<p>PlantUML的内容也可以认为是一种code，很自然地，我们可以用<code>pre code</code>来封装。比如我们可以用：</p>\n<!-- language:lang-html -->\n<pre><code>&#x3C;!-- language:uml -->\n    Animal &#x3C;|-- Cat\n    Animal &#x3C;|-- Dog\n</code></pre>\n<p>这里我们自定义了一种language类型<code>uml</code>，在前端解析的时候，就能知道这个代码块是用来画图的了。</p>\n<p>好，我们来看前端JS代码的实现：</p>\n<!-- language:lang-javascript -->\n<pre><code>function init() {\n  var plantuml = false;\n  var blocks = document.querySelectorAll(\'pre code\');\n  // 遍历所有pre code\n  for (var i = 0; i &#x3C; blocks.length; i += 1) {\n    var code = blocks[i];\n    //code.className += \' prettyprint\';\n    var pre = code.parentNode;\n    var above = pre;\n    do {\n      above = above.previousSibling;\n    } while (above.nodeType == Node.TEXT_NODE)\n    // 检查注释元素据\n    if (above.nodeType == Node.COMMENT_NODE) {\n      var comment = above.data;\n      // 正则表达式，获取语言类型\n      var pattern = /^\\s*language:\\s*([\\w\\-]+)\\s*(\\w+)?\\s*$/i;\n      var match = pattern.exec(comment);\n      if (match != null) {\n        var lang = match[1];\n        // 如果是uml，动态生成一个img元素，并设置uml属性值为pre code的内容。\n        if (lang &#x26;&#x26; lang == "uml") {\n          var container = document.createElement("div");          \n          var img = document.createElement("img");\n          img.setAttribute("uml", code.innerText || code.textContent);\n\n          container.appendChild(img);\n          container.className = "text-center";\n\n          pre.insertAdjacentElement(\'afterEnd\', container);\n          // 将pre code隐藏起来，只显示图片\n          pre.style.display = "none";\n          plantuml = true;\n        }\n      }\n    }\n  }\n  // 调用jQuery插件生成图片。\n  if (plantuml) {\n    plantuml_runonce();\n  }\n}\n</code></pre>\n<p>然后，在html中调用：</p>\n<!-- language:lang-html -->\n<pre><code>&#x3C;script type=\'text/javascript\'>\n  window.onload = init;    \n&#x3C;/script>  \n</code></pre>\n<p>搞定，收工！！写作、布局编排、画图全部纯文本，爽！</p>\n<p>附上一个PlantUML的参考文档，原本上sourceforge网站就可以了，可惜被墙了，点击<a href="http://www.learn-scala.net/assets/ebooks/PlantUML_Language_Reference_Guide.pdf.zip">这里</a>下载吧。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/集成PlantUML和Markdown.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-07T19:16:45.000Z",path:"/2013/markdown-plantuml-integration",title:"边建边学-2：集成PlantUML和Markdown",excerpt:"如何用Markdown+PlantUML结合来写图文并茂的博客。",tags:["markdown","plantuml","blog"]}}],tagName:"plantuml"}}}});
//# sourceMappingURL=path---tags-plantuml-679c988e3debe23c4f2d.js.map