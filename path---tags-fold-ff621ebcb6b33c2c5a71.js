webpackJsonp([0xdd40b2f30f95],{405:function(e,n){e.exports={pathContext:{posts:[{html:'<p>Eric Meijer说：递归是函数式编程的GOTO，应该尽可能避免。如何避免，OO中我们用while循环，FP中我们用<code>fold</code>。</p>\n<h2>什么是fold</h2>\n<p>fold就是折纸，给你一张纸条，你可以将其分为若干等份（一个集合），然后从左向右一点一点卷折起来，折成一个你想要的形状，当然也可以从右向左，还可以对半折。</p>\n<pre><code>+---+---+---+---+---+---+---+---+---+---+---+---+\n|   |   |   |   |   |   |   |   |   |   |   |   |\n| --->  |   |   |   |   |   |   |   |   |   |   |\n|   |   |   |   |   |   |   |   |   |   |   |   |\n+---+---+---+---+---+---+---+---+---+---+---+---+\n</code></pre>\n<p>这里“你想要的形状”，就是最终<code>fold</code>的输出。</p>\n<p>风向的例子，北风就是从北面吹来的风。同样的，foldRight就是从右向左折叠，操作对象是seed集合，参数是前面集合的最后一个元素。</p>\n<h2>foldRight</h2>\n<!-- language:lang-scala -->\n<pre><code>List(1,2,3).foldRight(seed)(f) = f(1, f(2, f(3, seed)))\n</code></pre>\n<p>记住：等式两边各个因子出现的顺序是相同的，都是1 -> 2 -> 3 -> seed，之所以重要，是因为最后一个<code>f(3, seed)</code>接受的参数是一个tuple: (ele, seed)，而不是(seed, ele)。\n形象化一点，假设<code>f</code>是<code>cons</code>操作，也就是<code>::</code>:</p>\n<pre><code>    ::\n  /   \\\n1       ::\n       /  \\\n      2     ::\n           /  \\\n          3    seed \n</code></pre>\n<p>例子：求整数集合之和。</p>\n<!-- language:lang-scala run -->\n<pre><code>val sum = List(1,2,3).foldRight(0) { (ele, seed) => { println(ele); seed + ele } }\nprintln(sum)\n</code></pre>\n<p>点击<code>run</code>，可以看到，输出的<code>ele</code>顺序是<code>3 -> 2 -> 1</code>.</p>\n<h2>foldLeft</h2>\n<!-- language:lang-scala -->\n<pre><code>List(1,2,3).foldLeft(seed)(g) = g(g(g(seed, 1), 2), 3)\n</code></pre>\n<p>这里，前面List中元素的处理顺序还是从左向右的，只是seed跑到了最前面，所以tuple变成了：(seed, ele)。</p>\n<p>树形结构：</p>\n<pre><code>            g\n          /   \\\n        g      3\n      /   \\\n    g       2\n  /   \\\nseed   1\n</code></pre>\n<p>注意：这里我用的函数换成了<code>g</code>，而不是前面的<code>f</code>，就是想提醒大家，这是两个不同的函数，其参数都是tuple，但是seed的顺序不同。这在编程的时候经常搞混。</p>\n<p>相同的例子：求一个整数集合的和。</p>\n<!-- language:lang-scala run -->\n<pre><code>val sum = List(1,2,3).foldLeft(0) { (seed, ele) => { println(ele); seed + ele } }\nprintln(sum)\n</code></pre>\n<p>点击<code>run</code>，可以看到，输出的<code>ele</code>顺序是<code>1 -> 2 -> 3</code>.</p>\n<h2>助记</h2>\n<p>foldLeft/foldRight中block的参数tuple顺序经常搞混，为了方便记忆，我们可以这么来看，我们用seed做基准：</p>\n<ul>\n<li>foldRight，从右向左，tuple中seed在右<code>(elem, seed)</code></li>\n<li>foldLeft, 从左向右，tuple中seed在左<code>(seed, elem)</code></li>\n</ul>\n<p>有了fold是卷折纸的概念，我们就比较容易理解unfold.</p>\n<h2>unfold</h2>\n<p>与<code>fold</code>对应，<code>unfold</code>就是反过来将一个卷折好的纸分解开，变成若干等份（集合），所以unfold是一个集合的构造过程。</p>\n<h2>例子</h2>\n<p>我们这里举一个实际的例子。</p>\n<!-- language:lang-scala -->\n<pre><code>def retry(n: Int)(block: => Future[T]): Future[T] = {\n  if (n &#x3C;= 0) {\n    Future.failed{ new RuntimeException("failed even if retried") }\n  } else {\n    block fallbackTo {\n      retry(n - 1)(block)\n    }\n  }\n}\n</code></pre>\n<p>这里我们用了递归，但是如Erik Meijer所说，递归是FP的GOTO，不容易理解，容易出错，我们来用fold来替换一下。</p>\n<p>可是一般来说fold都是需要一个集合的，而这里有什么集合？没有条件，创造条件也要上！我们可以将<code>n</code>也就是次数看成是一个集合，因为逻辑上我们要作几次，每次算一个集合元素，那么这不就是一个集合吗？</p>\n<p>这个集合就是：<code>val attempts = (1 to n) map { _ => () => block }</code>，有了操作的集合，我们就可以开始玩折纸游戏了。</p>\n<p>我们最终要“折的形状”是：成功的话返回<code>T</code>，否则返回一个Failure。我们可以将一个缺省的failure作为seed开始。</p>\n<p>而且我们期望的执行顺序是：<code>block1 recoverWith (block2 recoverWith (block3 recoverWith failure))</code>，很明显，这是一个<code>foldRight</code>。</p>\n<!-- language:lang-scala -->\n<pre><code>def retry(n: Int)(block: => Future[T]) = {\n  val ns = (1 to n).iterator\n  // 注意：这里的map不关心ns中的系数，所以用\'_\'，后面需要一个by name参数，所以需要一个() => block，否则将会提前计算，达不到重试效果。\n  val attempts = ns map { _ => () => block }\n  val failure = Future.failed{ new RuntimeException("failed even if retried") }\n  // 这里seed是一个call by name\n  attempts.foldRight(() => failure) { (attempt, seed) =>\n    // seed是call by name，这里也需要是call by name\n    () => attempt() fallbackTo{ seed() }\n  }\n}\n</code></pre>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/fold编程.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-27T19:16:45.000Z",path:"/2013/fold",title:"折纸的艺术：fold编程",excerpt:"Eric Meijer说：递归是函数式编程的GOTO，应该尽可能避免。如何避免，OO中我们用while循环，FP中我们用`fold`。",tags:["scala","functional programming","fold"]}}],tagName:"fold"}}}});
//# sourceMappingURL=path---tags-fold-ff621ebcb6b33c2c5a71.js.map