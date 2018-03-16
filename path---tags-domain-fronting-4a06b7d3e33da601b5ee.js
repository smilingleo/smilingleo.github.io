webpackJsonp([24602443328524],{410:function(e,o){e.exports={pathContext:{posts:[{html:'<h2>问题描述</h2>\n<p>因为我们的项目中用到了<a href="http://github.com/zalando/skipper">Skipper</a>作为UI层的gateway，在支持一个新上线的UI应用的时候，发现一个奇怪的现象，假定：</p>\n<pre><code>Skipper Domain: https://ui.example.com\nWebapp Internal Domain：https://webapp.internal.example.com\n</code></pre>\n<p>在Skipper收到一个请求 <code>GET https://ui.example.com/webapp</code>的时候，根据Routing规则：</p>\n<pre><code>Path("/webapp") -> "https://webapp.internal.example.com"\n</code></pre>\n<p>请求应该是会被转到这个地址的。测试发现：</p>\n<!-- language: lang-bash -->\n<pre><code># 正常工作，返回200\ncurl -i https://webapp.internal.example.com\n\n# 返回404\ncurl -i https://ui.example.com\n</code></pre>\n<p>神奇的就是后面的测试，返回404，而且来源于一个<code>nginx</code>服务器。</p>\n<h2>调试</h2>\n<p>通过 <code>curl -vv</code> 比较两个请求的差异，发现两个服务器的证书CN不同，一个是 <code>*.example.com</code>，另外一个是 <code>*.internal.example.com</code>，怀疑是不是SNI相关的问题，尝试了一下：</p>\n<pre><code class="language-bash">curl -i -H "Host: webapp.internal.example.com" https://ui.example.com\n</code></pre>\n<p>哈，成功返回200.</p>\n<p>查阅了一下SNI相关资料，发现了疑惑：SNI中hello_name来源于 URL中的domain name，而不是被加密的Header。一个web server如果host多个domains，在request过来的时候，会根据URI中的domain name来查找对应domain的证书，然后用来SSL握手，如果找不到证书，才会返回一个默认的页面，比如404.</p>\n<p>但是根据我们的试验，证书应该是正确的，所以应该不是SNI的问题。</p>\n<h2>真相大白</h2>\n<p>问题是解决了，但是却不知道是什么原因，这让人很不舒服，继续找。无意中发现了这个<a href="https://github.com/golang/go/issues/22704">Issue</a>，其中提到：</p>\n<blockquote>\n<p>This would break usage of net/http for <a href="https://www.bamsoftware.com/papers/fronting/">domain fronting</a>, an anti-censorship technique specifically relying on sending different hosts in SNI and HTTP headers. Such a use of net/http is not rare: censorship-resistant tunneling software such as <a href="https://github.com/getlantern/lantern">Lantern</a> and my own project Geph both use net/http this way.</p>\n</blockquote>\n<p><code>domain fronting</code>？什么鬼，著名的<code>lantern</code>居然在用，查了一下，明白了。原来这个技术就是用来翻墙的，哈。</p>\n<p>具体来说：</p>\n<p><img src="https://www.bamsoftware.com/papers/fronting/fronting.svg" alt="domain fronting"></p>\n<p>比如你想访问被墙的网站<code>forbidden.example</code>,你可以用36计之张冠李戴，谎称我访问的是<code>allowed.example</code>, 然后在request header中指定<code>Host: forbidden.example</code>，用https，这样请求就会被加密，邪恶的探测器们就无法知道你真正的地址，而且这样也符合SNI的握手协议。</p>\n<p>现在很多网站都支持这种技术，比如google:</p>\n<pre><code class="language-bash">curl -vv -H "Host: maps.google.com" https://www.google.com\n</code></pre>\n<p>从URL上看，访问的是<code>www.google.com</code>，但是你看一下返回内容会发现，这个内容却是<code>maps.google.com</code>返回的。</p>\n<p>在我们的例子中，因为skipper中设置了<code>-proxy-preserve-host</code>，这样<code>Host</code> header会被传递给下面的目标app，而这个目标app因为支持domain fronting，尝试着去找那个 <code>ui.example.com</code>对应的证书，当然没有，所以返回<code>404</code>.</p>\n<h2>参考资料</h2>\n<ol>\n<li><a href="https://www.bamsoftware.com/papers/fronting/">Domain Fronting</a></li>\n<li><a href="https://en.wikipedia.org/wiki/Server_Name_Indication">Server Name Indication</a></li>\n</ol>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2018/一则奇怪的Toubleshooting.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2018-03-08T08:30:00.000+08:00",path:"/2018/skipper-sni-domain-fronting",title:"记一次奇怪的troubleshooting",excerpt:"在Skipper转发请求到一个https站点的时候，返回莫名404.",tags:["skipper","SNI","domain fronting"]}}],tagName:"domain fronting"}}}});
//# sourceMappingURL=path---tags-domain-fronting-4a06b7d3e33da601b5ee.js.map