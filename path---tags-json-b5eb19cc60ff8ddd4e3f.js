webpackJsonp([0xaf120eaca2da],{402:function(e,n){e.exports={pathContext:{posts:[{html:"<p>在API first的时代，json作为最常用的格式，充斥着程序猿的屏幕各个角落，掌握一门解析、过滤、转换json输出的工具，已经成为程序猿们安身立命的必要技能。\n这里隆重向大家介绍<a href=\"https://stedolan.github.io/jq/\">jq</a>.</p>\n<h2>常用命令</h2>\n<h3>pipe: |</h3>\n<p>和unix管道一样。</p>\n<h3>.[]</h3>\n<p>用来将数组中内容传递给后面命令，而不是把整个数组传过去（脱包）\n还可以用<code>.[n]</code>来获取数组中第n个元素。</p>\n<h3>has(key)</h3>\n<p>检查json对象中是否有key属性。一般结合<code>select()</code>使用。</p>\n<h3>select(boolean_expr)</h3>\n<p>用来过滤输入。比如，只输出具有<code>name</code>项的json对象，可以用：<code>jq 'has(\"name\") as $hasName | select($hasName=true)'</code></p>\n<h2>实战</h2>\n<p>我们将使用<code>docker inspect</code>输出结果作为例子进行解析。</p>\n<h3>列出所有docker images的inspect结果</h3>\n<!-- language:bash -->\n<pre><code>docker inspect $(docker images | tail -n +2 | awk '{print $1\":\"$2}')\n</code></pre>\n<h3>只列出所有volumes不为空的images</h3>\n<!-- language:bash -->\n<pre><code>docker inspect $(docker images | tail -n +2 | awk '{print $1\":\"$2}') | jq '.[] | select(.Config.Volumes!=null)'\n</code></pre>\n<h3>将json转换为csv</h3>\n<!-- language:bash -->\n<pre><code>docker inspect $(docker images | tail -n +2 | awk '{print $1\":\"$2}') | jq '.[] | [(.RepoTags|.[0]), .DockerVersion] | @csv'\n</code></pre>\n<p>上面例子中：</p>\n<ul>\n<li><code>.[]</code>将数组中每个单项传递给后面命令</li>\n<li><code>(.RepoTags|.[0])</code>取出第一个RepoTags的内容也就是image的name:tag</li>\n<li><code>.DockerVersion</code>取出docker版本</li>\n<li><code>将上面两个命令用</code>,`连接，表示将前面的输入同时传递给这两个命令</li>\n<li>用<code>[]</code>将上面两个命令包起来，表示将两个命令的输出结果作为数组中的一个item</li>\n<li><code>@csv</code>将前面的数组输出转换为csv格式。</li>\n</ul>",id:"/Users/lliu/github/smilingleo.github.io/src/pages/2016/JSON解析利器JQ.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2016-03-25T19:16:45.000Z",path:"/2013/jq",title:"JSON解析利器---JQ",excerpt:"在API first的时代，json作为最常用的格式，充斥着程序猿的屏幕各个角落，掌握一门解析、过滤、转换json输出的工具，已经成为程序猿们安身立命的必要技能。 这里隆重向大家介绍[jq](https://stedolan.github.io/jq/).",tags:["bash","jq","json"]}}],tagName:"json"}}}});
//# sourceMappingURL=path---tags-json-b5eb19cc60ff8ddd4e3f.js.map