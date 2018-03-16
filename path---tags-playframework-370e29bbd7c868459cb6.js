webpackJsonp([36566847472775],{426:function(e,t){e.exports={pathContext:{posts:[{html:'<h2>Context</h2>\n<p>插曲：前不久微博上看到一技术“牛人”大V评论Java8的一些特性，引入lambada但没有扩展能力，集合的查询都得靠新stream api而不是Enumerator / Iterator云云。一时手欠回复了下“似乎应该是Enumerator / Iteratee“, 结果引来一身骚，被该大V泼口大骂了一个下午，没错就是像网吧里面无聊的小青年一样无营养地谩骂，实在没搞懂到底是为什么，说我说的Iteratee和他说的没”鸡毛“关系，不懂，也不想搞懂了，还是他玩他的Iterator我介绍我的Iteratee吧。</p>\n<p>因为我们的内存、磁盘等资源还是有限的，对于一个大的Stream，Collection，我们在处理的时候不应该将其作为整体进行处理，因为这样会带来潜在的风险，比如：内存溢出，降低系统吞吐量等等。</p>\n<p>正确的方式是将大的不可预见（unpredictable）的stream，Collection进行分解，将其分解为小的，可预见（predictable）的块进行处理。这是流模式的思想，也是Iteratee的设计目标之一。</p>\n<p>Stream对于指令式编程已经比较成熟了，有大量的类库，丰富的API。但是对于强调不可变量，尽可能无副作用的FP来说，要考虑语言适配的问题，而目前，流行的解决方案就是：Enumerator/Iteratee。</p>\n<p>另外，就是需要用统一的API来处理所有类型的Stream，就像指令式编程中的<code>InputStream.read</code>, <code>OutputStream.write</code>，无论什么Stream都需要支持这些基本方法。</p>\n<h2>High Level Concept Model</h2>\n<p>Enumerator / Iteratee说起来很复杂，其实就是一个生产者 / 消费者模型。 Enumerator是生产者，创建诸多个可控的chunk，Iteratee是消费者，消费任意类型的Input Chunk。</p>\n<!-- language:lang-scala -->\n<pre><code>trait Enumerator {\n  def |>>[A](i: Iteratee[E, A]): Future[Iteratee[E, A]] = apply(i)\n}\n</code></pre>\n<p>Enumerator驱动一个Iteratee，Iteratee处理一个Chunk之后，返回下一个状态的Iteratee. 在构造Enumerator的时候不会真正读取数据，只有在真正消费时才产生IO。</p>\n<p>而且多个Enumerator之间可以组合，不同类型的消费者（Iteratee）也可以进行组合、变换，简言之，组合的概念就是将每个Enumerator / Iteratee都看成是一个可组合的积木，每个积木相对独立可复用，写代码就是将这些积木组合达成你想要形状的过程。这个说法很常见，OO里提倡“组合优于继承”也是一样的思想，其中的关键是如何找到最小的可复用的component，然后是通过什么样的方式进行灵活地组合。</p>\n<p>Enumerator / Iteratee / Enumeratee就是一个非常好的例子。</p>\n<h2>消费者 Iteratee</h2>\n<!-- language:lang-scala -->\n<pre><code>class Iteratee &#x3C;&#x3C; (T, #00FF00) >> {\n  Future[B] fold[B](folder: Step[E, A] => Future[B])\n}\nclass ImmediateIteratee &#x3C;&#x3C; (T, #00FF00) >>\nclass Done &#x3C;&#x3C; (O, #FF0000) >>\nclass Cont &#x3C;&#x3C; (O, #FF0000) >>\nclass Error &#x3C;&#x3C; (O, #FF0000) >>\nclass Step &#x3C;&#x3C; (T, #00FF00) >>\nclass Input &#x3C;&#x3C; (T, #00FF00) >>\n\nIteratee &#x3C;|-- ImmediateIteratee\nIteratee &#x3C;|-- FutureIteratee\nIteratee &#x3C;.left.> Step\nStep .left.> Input\n\nImmediateIteratee &#x3C;|-- DoneIteratee\nDoneIteratee .. Done\nImmediateIteratee &#x3C;|-- ContIteratee\nContIteratee .. Cont\nImmediateIteratee &#x3C;|-- ErrorIteratee\nErrorIteratee .. Error\n\nnote "company objects" as oNote\nDone .. oNote\nCont .. oNote\nError .. oNote\n</code></pre>\n<p>Iteratee是一个Input的消费者，注意：这里的Input不是全部输入，而是a chunk of input，这个很重要，没有一个Iteratee来消费所有输入数据，而是每块一个消费者，然后通过函数组合的方式将所有块穿起来。</p>\n<ul>\n<li>\n<p>为什么不是一个完整输入对应一个消费者呢？\n这是指令式编程的思维方式，因为你需要自己考虑实现细节，设计一些游标，每次读取步进的长度，判断游标的位置来判断下一步如何操作。</p>\n</li>\n<li>\n<p>为什么不是所有的输入chunk共享一个消费者呢？\n嗯，这个问题我不是很确定，应该是有一部分上面的原因，另外就是副作用的问题，每个Step自己维护自己的状态，可以比较容易地实现“懒加载”，在最后一步（调用<code>run</code>）的时候才真正发生IO，而之前，可以通过函数组合任意对每一步进行transform等操作。</p>\n</li>\n</ul>\n<p>Iteratee还有一个需要注意的地方，fold函数是一个<code>curried function</code>，有一个implicit的参数ExecutionContext，也就是在哪个线程池中执行，这个现象在Play中很普遍。</p>\n<p>ImmediateIteratee描述了一个已经预先知道其state的Iteratee，而FutureIteratee当然就是未来才能知道其State的Iteratee。[个人感觉这个地方设计有点怪，FutureIteratee似乎应该用Future[Iteratee]更好。] </p>\n<!-- language:uml -->\n<pre><code>class Step &#x3C;&#x3C; (T, #00FF00) >> {\n  Iteratee[E, A] it\n}\nclass Iteratee &#x3C;&#x3C; (T, #00FF00) >>\nclass Input &#x3C;&#x3C; (T, #00FF00) >>\nStep .left.> Input\nStep &#x3C;-right-> Iteratee\nStep &#x3C;|-- Done\nStep &#x3C;|-- Cont\nStep &#x3C;|-- Error\n</code></pre>\n<p>Step描述的是一个Iteratee的状态，其本身包含一个Iteratee不变量<code>it</code>，而Done、Cont、Error也是简单的<code>case class</code>，所以构造也很简单。</p>\n<!-- language:uml -->\n<pre><code>class Input &#x3C;&#x3C; (T, #00FF00) >>\nInput &#x3C;|-- El\nInput &#x3C;|-- Empty\nInput &#x3C;|-- EOF\n</code></pre>\n<p>Input[E]描述的是<code>一块</code>输入(a chunk of input，不是全部输入)，构造其实很简单，就是一个简单的case class，可以按照你熟悉的方式来构造。</p>\n<h2>生产者 Enumerator</h2>\n<p>先来看看Enumerator的定义：</p>\n<!-- language:lang-scala -->\n<pre><code>trait Enumerator[E] {\n\n  /**\n   * Apply this Enumerator to an Iteratee\n   */\n  def apply[A](i: Iteratee[E, A]): Future[Iteratee[E, A]]\n  def |>>[A](i: Iteratee[E, A]): Future[Iteratee[E, A]] = apply(i)\n  ...\n\n}\n</code></pre>\n<p>由上面定义可以看到，一个<code>Enumerator</code>接受一个<code>Iteratee[E, A]</code>，并返回一个<code>Future[Iteratee[E, A]]</code>，翻译一下就是：Enumerator驱动一个消费者，消费数据之后产生一个下个状态的消费者。</p>\n<p>Enumerator提供了大量的工厂方法（在scala中是通过伴生对象来实现），比如，你可以从一个数组创建一个Enumerator:</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateCountries = Enumerator[String] = Enumerator("China", "America", "Japan", "Russia", "England")\n</code></pre>\n<p>可以从一个文件中创建：</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateFile: Enumerator[Array[Byte]] = Enumerator.fromFile(new File("path/to/some/big/file"))\n</code></pre>\n<p>或者从一个Stream中创建：</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateFile: Enumerator[Array[Byte]] = Enumerator.fromStream(new java.io.FileInputStream(new File("path/to/some/big/file")))    \n</code></pre>\n<p>更加通用的方式是从一个<code>e: ()=>Future[Option[E]]</code>函数来创建，因为这个函数声明了：未来可能会产生一个<code>E</code>:</p>\n<!-- language:lang-scala -->\n<pre><code>def generateM[E](e: => Future[Option[E]])(implicit ec: ExecutionContext): Enumerator[E] = {\n    ...\n}\n</code></pre>\n<p>发挥一下你的想象，很多事情都可以看成是Stream，比如时间：</p>\n<!-- language:lang-scala -->\n<pre><code>import play.api.libs.concurrent.Promise\nimport play.api.libs.iteratee._\nimport scala.concurrent.duration._\nimport scala.concurrent.ExecutionContext.Implicits.global\nimport java.util.Date\n\n// 截止时间\nval alertTo = new Date(System.currentTimeMillis + 1000*60)\n\n// 一个时间流，截止到alertTo\nval timeStream = Enumerator.generateM {\n    Promise.timeout(\n      if (new Date before alertTo) Some(new Date) else None, \n      1 seconds)\n}\n\nval printlnSink = Iteratee.foreach[Date](date => println(date))\n// 每隔一秒钟打印一次，直到alertTo\ntimeStream |>> printlnSink\n</code></pre>\n<p>如果你想再play console里面运行上面的代码，可能会失败，说什么:no application started之类的，这时你需要前面加上：</p>\n<!-- language:lang-scala -->\n<pre><code>val app = new play.core.StaticApplication(new java.io.File("."))\n</code></pre>\n<p>创建一个测试用的application，再试一下就OK了。</p>\n<p>除了这个例子，我觉得也可以将数据库中的游标查询用Enumerator来实现。</p>\n<p>在Play框架中，还有一个实际的例子是<code>WebSocket</code>，有机会我们再单独介绍。</p>\n<h2>适配器 Enumeratee</h2>\n<p>对应OO Design Pattern中的Adaptor模式，<code>Enumeratee</code>就是一个Adaptor，将不同规格的组件适配在一起。比如下面这个例子：</p>\n<p>我们有一个String类型的Enumerator, <code>Enumerator("123", "456", "789", "222", "333", "444")</code>，还有一个累加器，<code>Iteratee.fold[Long, Long](0:Long) { (acc, el) => acc + el }</code>，两者的“规格”是不同的，一个是String， 但另外一个是Long，当然我们可以再定义一个新的Iteratee，比如：<code>Iteratee.fold[String, Long](0:Long) { (acc, el) => acc + el.toLong }</code>，但是显然，这里面有重复代码的臭味道。更加合理的方式是做一个适配，用一个适配器来讲两个已经存在的component转接后一起工作。</p>\n<!-- language:lang-scala run -->\n<pre><code>import play.api.libs.iteratee._\nimport scala.concurrent.ExecutionContext.Implicits.global\n\nval strings = Enumerator("123", "456", "789", "222", "333", "444")\nval sum = Iteratee.fold[Long, Long](0:Long) { (acc, el) => acc + el }\nval toLong = Enumeratee.map[String]( x => x.toLong )\n\nstrings |>> toLong &#x26;>> sum flatMap { x => x.run } onSuccess { case s => println(s) }\n// Or, transform the Enumerator first.\nstrings &#x26;> toLong |>> sum flatMap { x => x.run } onSuccess { case s => println(s) }\n</code></pre>\n<p>上面例子可以看到，<code>Enumeratee</code>不但可以适配<code>Iteratee</code>，还可以转换<code>Enumerator</code>。</p>\n<p>留个问题：<code>strings &#x26;> toLong</code>会不会产生memory的问题？ </p>\n<h2>指令式 VS. 函数式</h2>\n<p>这里用一个很无聊的例子：遍历一个大文件来统计文件大小。</p>\n<h3>指令式风格</h3>\n<p>Use Java FileInputStream, more imperative style:</p>\n<!-- language:lang-scala -->\n<pre><code>val fis = new java.io.FileInputStream(new java.io.File("/Users/leo/Movies/big_file.mkv"))\n\n// mutable variables\nvar readLength = 0\nvar fileSize: Long = 0\nvar buf = new Array[Byte](1024 * 8) // chunk size used in Enumerator\nval begin = System.currentTimeMillis\ndo {\n  readLength = fis.read(buf)\n  if (readLength != -1)\n    fileSize = fileSize + readLength\n}while(readLength != -1)\n\nprintln(s"File Size: $fileSize, and it took ${System.currentTimeMillis - begin} ms")\n</code></pre>\n<p>And output like <code>File Size: 4003885806, and it took 54701 ms</code>, the memory usage is about <code>78Mb</code>.</p>\n<h3>函数式风格</h3>\n<p>Use Enumerator / Iteratee to get file size:</p>\n<!-- language:lang-scala -->\n<pre><code>import play.api.libs.iteratee._\n// construct an Enumerator from a file\nval fileEnum = Enumerator.fromFile(new java.io.File("/Users/leo/Movies/big_file.mkv")) \n// create a consumer\nval counter = Iteratee.fold[Array[Byte], Long](0: Long){ (acc, ele) => ele.size + acc }\n\nval begin = System.currentTimeMillis\n// where the IO really happens.\nIteratee.flatten(fileEnum |>> counter).run.onSuccess { case x => println(s"File Size: $x, and it took ${System.currentTimeMillis - begin} ms") }\n</code></pre>\n<p>Here\'s the output: <code>File Size: 4003885806, and it took 57213 ms</code>, and max memory usage is about <code>120Mb</code>. </p>\n<p>Note: If you are running above code with Scala version &#x3C; 2.10.3, you\'ll run into <code>OutOfMemory</code> Error, it\'s so funny right? Enumerator / Iteratee suppose to be designed to solve the OutOfMemory issue, actually, it\'s not Enumerator/Iteratee \'s problem, it\'s a bug of scala, see <a href="https://issues.scala-lang.org/browse/SI-7336">SI-7336</a></p>\n<h3>对比</h3>\n<p>从上面的两种实现来看，从执行时间上，两种方式没有太大差异，但是指令式编程在内存占用方面要优于函数式编程，毕竟var变量可以复用，val变量需要重新生成。但是差别并没有想象中那么大，处理一个4G的文件，差别只是40M左右。但是带来的好处是显而易见的：因为没有mutable变量，没有副作用，并发、代码可读性有提高。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/Enumerator-Iteratee-Enumeratee.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-11T14:16:45.000Z",path:"/2013/enumerator-iteratee-enumeratee",title:"Enumerator / Iteratee / Enumeratee",excerpt:"Stream对于指令式编程已经比较成熟了，有大量的类库，丰富的API。但是对于强调不可变量，尽可能无副作用的FP来说，要考虑语言适配的问题，而目前，流行的解决方案就是：Enumerator/Iteratee。",tags:["scala","playframework","blog"]}},{html:'<h2>Play!框架的核心</h2>\n<p>Play!的内核其实非常简单，简单地说，Play框架所实现的可以用一个函数表达式来描述：</p>\n<p><code>RequestHeader -> Array[Byte] -> Result</code></p>\n<p>具体讲，就是接受一个<code>RequestHeader</code>，然后读入类型为<code>Array[Byte]</code>的Request Body，计算完毕之后返回一个<code>Result</code>。</p>\n<p>注：函数式语言的表达就是高度抽象，但异常简洁。</p>\n<h2>问题及优化</h2>\n<h3>文件上传</h3>\n<p>上面的描述有一个问题：我们假定要把请求内容<em>全部</em>读入内存（或者写入磁盘），对于简单应用不是什么问题，但是对于文件上传等场景，这肯定是有问题的，所以，Play开发者做了优化。</p>\n<p>注：此处可以看出函数式语言的一个优点：仅需要了解你的函数定义，就能分析出潜在的问题。而如果面向对象的方式一般关注在对象之间的通信、方法调用，从方法签名上往往会忽略这些细节。</p>\n<p>优化的思路当然是将请求内容一部分一部分地读入（chunk），所以这个函数就变成了：</p>\n<p><code>RequestHeader -> Iteratee[Array[Byte], Result]</code></p>\n<p><code>Iteratee</code>是个什么东东？简单讲就是一个<code>Monad</code>，什么是Monad？可以类比为OO世界中的设计模式：专门为了解决某类问题的特定方法。Iteratee可以将输入（Input）分步(Step)读入，而且可以进行精细控制遇到EOF、Empty、El(chunk)的时候应该如何处理，是继续（Cont），结束（Done）还是抛错（Error）。这里不做详细介绍。有兴趣的可以参见：<a href="http://apocalisp.wordpress.com/2010/10/17/scalaz-tutorial-enumeration-based-io-with-iteratees/">这篇博客</a></p>\n<p>Iteratee本身也是一个<code>Arrow</code>（简单理解为函数），所以如果我们定义一个新类型：</p>\n<!-- language:lang-scala -->\n<pre><code>type ==>[E, R] = Iteratee[E, R]\n</code></pre>\n<p>上面的函数用scala来写就会变为：</p>\n<!-- language:lang-scala -->\n<pre><code>RequestHeader => Array[Byte] ==> Result\n</code></pre>\n<p>注：<code>==>[E, R]</code>和<code>E ==> R</code>是等价的，是scala的一个语法糖。</p>\n<p>上面的表达式看上去更简洁，更有趣了。</p>\n<h3>文件下载</h3>\n<p>有了<code>Iteratee</code>我们就可以分块处理请求了，但是响应呢？同样地，如果响应中的数据量很大，比如文件下载，从上面的函数定义看，依旧会把文件完全读入到内存中，同样的问题。</p>\n<p>解决的思路也是一样的。我们可以将<code>Result</code>看做下面的数据结构：</p>\n<!-- language:lang-scala -->\n<pre><code>case class Result(header: ResponseHeader, body: Array[Byte])\n</code></pre>\n<p>问题主要在<code>body</code>上，类型是Array[Byte]，需要有一个新的数据类型将起封装，可以分块地处理输出内容，这就是<code>Enumerator</code>，一个用来将响应数据分块(chunk)的东东。</p>\n<p>所以最终Play框架核心可以看做下面的API：</p>\n<!-- language:lang-scala -->\n<pre><code>case class Result[E](headers:ResponseHeaders, body:Enumerator[E])(implicit writeable:Writeable[E])\ntype ==>[E, R] = Iteratee[E, R]\nRequestHeader => Array[Byte] ==> Result\n</code></pre>\n<p>下面我们来看看Request和Result各自的类图，了解一下都有哪些实现。</p>\n<!-- language:uml -->\n<pre><code>title Request Class Hierarchy\nclass RequestHeader &#x3C;&#x3C; (T, #00FF00)>>\nclass Request &#x3C;&#x3C; (T, #00FF00)>>\n\nRequestHeader &#x3C;|-- Request\nRequest &#x3C;|-- WrappedRequest\nRequest &#x3C;|-- FakeRequest\nWrappedRequest &#x3C;|-- AuthenticatedRequest\n\ncenter footer 图一：Request 类图\n</code></pre>\n<p>真简单啊，比OO世界里面的一些MVC框架中的类层次结构少多了。</p>\n<!-- language:uml -->\n<pre><code>title Result Class Hierarchy\nclass WithHeaders &#x3C;&#x3C; (T, #00FF00) >>\nclass Result &#x3C;&#x3C; (T, #00FF00) >>\n\nclass PlainResult &#x3C;&#x3C; (T, #FF0000) deprecated>>\nclass AsyncResult &#x3C;&#x3C; (C, #FF0000) deprecated>>\nclass ChunkedResult &#x3C;&#x3C; (D, #FF0000) deprecated>>\n\nWithHeaders &#x3C;|-- Result\nResult &#x3C;|-- PlainResult\nResult &#x3C;|-- AsyncResult\nPlainResult &#x3C;|-- SimpleResult\nSimpleResult &#x3C;|-- ChunkedResult\nSimpleResult &#x3C;|-- Status\n\ncenter footer 图二：Result 类图\n</code></pre>\n<p>目前Play2.2中Result有两个子类：PlainResult和AsyncResult，但这两个Result已经被标记为deprecated了，从2.3开始，Play将只支持SimpleResult。为什么呢？ 想想其实很简单：单一职责原则。所谓<code>AsyncResult</code>其实本身职责不单一，有异步和Result两个，而直接使用：<code>Future[SimpleResult]</code>则清晰很多。另外ChunkedResult被废弃的原因也一样。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/EssentialAction-in-Playframework.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-05T09:16:45.000Z",path:"/2013/essential-action-in-play",title:"EssentialAction in Playframework",excerpt:"Playframework中EssentialAction理解",tags:["scala","playframework"]}}],tagName:"playframework"}}}});
//# sourceMappingURL=path---tags-playframework-370e29bbd7c868459cb6.js.map