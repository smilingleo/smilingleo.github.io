webpackJsonp([99400273606428],{372:function(e,n){e.exports={data:{markdownRemark:{html:'<h2>上下文</h2>\n<p>很多时候为了提高性能，减少IO操作，都会将数据load出来之后缓存在内存中。本站的实现过程中也遇到类似的问题，不希望每次有人访问的时候就读取一次md文件，或者从MongoDB中查一次，而是直接在内存中读取。</p>\n<p>带来因减少IO而提升性能的好处的同时，也出现一个人和“缓存”解决方案都会遇到的问题：数据一致性。</p>\n<p>简单来说，就是你有同样的一份数据，冗余存放在两个地方，如何确保这两个地方的数据是一致的？再具体一点，可能的问题有：</p>\n<ul>\n<li>\n<p>数据更新的原子性</p>\n<p>更新数据的时候，同时将两个地方的数据都同步更新，任何一个地方更新失败，则整体更新失败。</p>\n</li>\n<li>\n<p>缓存线程安全的问题</p>\n<p>如果缓存既可以被读取，又可能被更新，那么就又线程安全问题：多个线程同时操作同一个值的时候怎么协调？</p>\n</li>\n</ul>\n<h2>具体问题</h2>\n<p>开始的时候，我将所有的文章列表放在一个<code>scala.collection.mutable.ListBuffer</code>中：</p>\n<!-- language:lang-scala -->\n<pre><code>object Application extends Controller {\n  lazy val allPosts: ListBuffer[Post] = ...\n\n}\n</code></pre>\n<p>因为新发布博客会增加集合内数据，所以这里用ListBuffer比较自然。当然用<code>var</code> + immutable collection也可以。</p>\n<p>对<code>allPost</code>的操作主要有三个：</p>\n<ol>\n<li>\n<p>在线编写一个博客的时候需要添加到集合中</p>\n</li>\n<li>\n<p>该集合本身是无序的，因为排序的规则可能有多种，展现的时候再排序</p>\n</li>\n<li>\n<p>更新一篇博文的时候同时更新集合中内容。</p>\n</li>\n</ol>\n<p>因为本身Application Object是单例的，多个线程共同运行的场景下就会出现线程安全的问题，类似Servlet中instance级别变量的问题。</p>\n<h2>解决方案</h2>\n<p>直观地想，理想的解决方案就是将所有对<code>allPost</code>的写操作都串行起来，这样即使有多个线程同时操作，也没问题了。但是如何将实现串行呢？</p>\n<p>在指令式编程的世界里，这个问题比较难于解答，一般需要通过加锁来解决。而一般的程序员看到<code>lock</code>, <code>synchronized</code>这些关键字就头疼了，即使经过无数次盲试之后侥幸实现了，也会在产品上线的时候出现这样那样、莫名其妙、让你大呼“这不科学”，“WTF”的惊呼！</p>\n<p>但是在scala中，我们却不用担心，因为我们有<code>Akka Actor</code>。</p>\n<p>Actor是另外一种并行计算方式，不同于线程共享内存的并发模型，Actor是基于消息的，强调不同Actor之间不共享数据。有了Actor，问题就迎刃而解了。</p>\n<p>具体思路是：重建一个单例Actor，由该Actor来维护ListBuffer变量，所有的写操作，全部通过该消息提交任务交给其处理，这样就将并发的多个写请求串行起来了。</p>\n<p>代码片段：</p>\n<!-- language:lang-scala -->\n<pre><code>object PostManager {\n  // 单例manager actor\n  lazy val manager = Akka.system.actorOf(Props[PostManager])\n  case class NewPost(post: Post)\n  \n  def saveOrUpdate(unsavedPost: Post) = {\n    manager ! NewPost(unsavedPost)\n  }\n}\n\nclass PostManager extends Actor {\n  import PostManager._\n  // actor是单例的，所以文章集合也是单例的。\n  // all posts, but not ordered.\n  lazy val allPosts: ListBuffer[Post] = Post.allPosts\n  \n  def receive = {\n    case NewPost(newPost) =>\n      // 先更新数据库，这样如果更新失败，就不会运行之后代码。一定程度上实现原子性。\n      Post.upsert(newPost)\n      \n      val idx = allPosts.indexWhere( _.fileName == newPost.fileName )\n      \n      if (idx == -1){\n        allPosts += newPost\n      } else {\n        allPosts.update(idx, newPost)\n      }\n  }\n}\n</code></pre>\n<p>全站一个文章集合变量感觉有点"玩具"的感觉，不过这个模型其实是可以扩展的，比如将来如果支持多用户、多博客系统，我们可以每个用户创建一个Actor、维护该用户自己的文章列表。这个Actor模型还是可以重用的。</p>',frontmatter:{title:"边建边学-3：Actor协调并发场景下的集合操作",date:"November 17, 2013",path:"/2013/actor-collection-collabration",tags:["scala","functional programming"],excerpt:"很多时候为了提高性能，减少IO操作，都会将数据load出来之后缓存在内存中。本站的实现过程中也遇到类似的问题，不希望每次有人访问的时候就读取一次md文件，或者从MongoDB中查一次，而是直接在内存中读取。"}}},pathContext:{prev:{html:'<p>所谓高阶函数（high order function），其实就是可以接受其他函数作为参数的函数。</p>\n<p>这里其实还有另外一个概念：<em>头等函数</em>（First Class Function），First Class应该是指头等公民的含义。在Java中的一个方法（函数），只能被调用，相比值Value就像个二等公民，不能像值Value一样，既可以在表达式中被引用，又可以作为参数传入其他方法。</p>\n<p>头等函数也就是可以将其作为一个值进行传递的函数。看上去很简单，可带来的变化是巨大的。</p>\n<p>头等函数加上高阶函数，可以极大地简化代码，实现DSL。</p>\n<h2>简化代码</h2>\n<h3>Java中的匿名类</h3>\n<!-- language:lang-java -->\n<pre><code>import java.util.*\n\nTimer timer = new Timer();\nTimerTask helloTimer = new TimerTask(){\n    public void run(){\n        System.out.println("Hello Timer");\n    }\n};\ntimer.schedule(helloTimer, 1);\n\nTimerTask helloWorld = new TimerTask(){\n    public void run(){\n        System.out.println("Hello World");\n    }\n};\ntimer.schedule(helloWorld, 1);\n</code></pre>\n<p>然后每次都需要new一个TimerTask匿名类，用起来真心不方便，尤其是当你有多个匿名类要一起使用的时候，那代码看起来简直就像一坨翔，丑陋无比！本来正常的、相同抽象层次的代码应该具有相同的缩进层次，这样阅读起来很易懂、顺畅。但是因为引入匿名类，就得放在不同的缩进层次中，加上不必要的类签名定义，方法定义等boilerplate code, 阅读起来那叫一个费劲！</p>\n<p>看看scala的方式：</p>\n<h1>Scala</h1>\n<!-- language:lang-scala run -->\n<pre><code>import scala.concurrent._\nimport scala.concurrent.duration._\nimport scala.concurrent.ExecutionContext.Implicits.global\n\nval timer = new java.util.Timer()\ndef timeout[A](a: => A, duration: Duration)(implicit ec: ExecutionContext): Future[A] = {\n    val p = Promise[A]()\n    timer.schedule(new java.util.TimerTask() {\n        def run() = {\n            p.success(a)\n        }\n    }, duration.toMillis)\n    p.future\n}\n\ntimeout(println("Hello World"), 1 millisecond)\ntimeout(println("Hello Timer"), 1 millisecond)\n</code></pre>\n<p>定义一个timeout高阶函数，接受一个<code>=> A</code>函数作为参数，然后就可以方便地重复调用了。\n</p>\n<h2>自定义控制结构+鸭子类型</h2>\n<h3>try with resources</h3>\n<p>在Java中，在处理一些资源相关的数据时，经常需要用一个<code>try .... catch ... finally { res.close(); }</code>的结构，同样地，这种结构使得代码的缩进层次和逻辑抽象层次不同而影响阅读。另外更严重的问题是常常忘记关闭资源。</p>\n<p>Java中的一种解决方案是用<code>template method</code>模式，比如Spring JdbcTemplate，传入一个匿名类，比如：</p>\n<!-- language: lang-java -->\n<pre><code>jdbcTemplate.execute(new StatementCallback(){\n    public Object doInStatement(Statement stmt) throws SQLException, DataAccessException {\n        // your real logic here\n    }\n}\n</code></pre>\n<p>可以看到，真正的逻辑被缩进了两层，有很多boilerplate代码。</p>\n<p>Java 1.7中引入了try with resources的语法，一定程度上解决了这个问题：</p>\n<!-- language: lang-java -->\n<pre><code>try (BufferedReader br = new BufferedReader(new FileReader(path))) {\n    return br.readLine();\n}\n</code></pre>\n<p>但是要求在try里面的资源必须实现<code>AutoCloseable</code>接口。当然了，Java中很多东西都是围绕接口转。接口就意味着规约，要使用try-with-resources语法，就必须符合这个规约。</p>\n<p>再看看Scala中如何实现：</p>\n<!-- language: lang-scala run -->\n<pre><code>def using[T &#x3C;: { def close() }](resource: T)(block: T => Unit) {\n  try {\n    block(resource)\n  }finally {\n    if (resource != null) resource.close()\n  }\n}\ncase class Resource {\n    def close() = println("I\'m closing")\n    def doSomething() = println("boring")\n}\n\nval res = Resource()\n\nusing[Resource](res){ res =>\n    res.doSomething()\n}\n</code></pre>\n<p>和<code>try-with-resources</code>的语法比较像吧，不过不同的是，<code>using</code>不要求传入的resource必须实现某种接口，只需要该类型定义了一个<code>def close(): Unit</code>方法。这就是所谓的鸭子类型，只要你走起来像鸭子，那你就是鸭子，不是一个很好的比喻，不过将就吧。</p>\n<h3>break</h3>\n<p>当你学习scala的时候，你会发现很多java中的关键字在scala中是不支持的，其中一个就是：<code>break</code>。</p>\n<p>在一个循环的时候，当满足某个条件就退出当前循环，是一个很普遍的用法，为什么scala中会不是一个关键字呢？我自己感觉是scala强调FP，而break有很浓的指令式编程的味道。</p>\n<p>那我就是想用break怎么办？不要紧，我们可以自己定义一个自己的break。</p>\n<!-- language: lang-scala run -->\n<pre><code>class Breaks {\n  private class BreakControl extends RuntimeException\n  private val breakException = new BreakControl\n\n  // breakable接受一个() => Unit的函数作为参数，是一个高阶函数。\n  def breakable(op: => Unit) {\n    try {\n      op\n    } catch {\n      case ex: BreakControl =>\n        if (ex ne breakException) throw ex\n    }\n  }\n\n  def break(): Nothing = { throw breakException }\n}\nobject Breaks extends Breaks\n\n\nimport Breaks.{break, breakable}\n// 通过高阶函数来实现break\nbreakable {\n  for (i &#x3C;- (1 to 1000)) {\n    if (i > 10){\n      break\n    } else {\n      println(i)\n    }\n  }\n}\n</code></pre>\n<p>是不是很棒？！scala没有我们可以自己造。这就是高阶函数的用处之一。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/高阶函数.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-21T19:16:45.000Z",path:"/2013/high-order-function",title:"高阶函数",excerpt:"所谓高阶函数（high order function），其实就是可以接受其他函数作为参数的函数。",tags:["scala","functional programming","high order function"]}},next:{html:'<h2>Context</h2>\n<p>插曲：前不久微博上看到一技术“牛人”大V评论Java8的一些特性，引入lambada但没有扩展能力，集合的查询都得靠新stream api而不是Enumerator / Iterator云云。一时手欠回复了下“似乎应该是Enumerator / Iteratee“, 结果引来一身骚，被该大V泼口大骂了一个下午，没错就是像网吧里面无聊的小青年一样无营养地谩骂，实在没搞懂到底是为什么，说我说的Iteratee和他说的没”鸡毛“关系，不懂，也不想搞懂了，还是他玩他的Iterator我介绍我的Iteratee吧。</p>\n<p>因为我们的内存、磁盘等资源还是有限的，对于一个大的Stream，Collection，我们在处理的时候不应该将其作为整体进行处理，因为这样会带来潜在的风险，比如：内存溢出，降低系统吞吐量等等。</p>\n<p>正确的方式是将大的不可预见（unpredictable）的stream，Collection进行分解，将其分解为小的，可预见（predictable）的块进行处理。这是流模式的思想，也是Iteratee的设计目标之一。</p>\n<p>Stream对于指令式编程已经比较成熟了，有大量的类库，丰富的API。但是对于强调不可变量，尽可能无副作用的FP来说，要考虑语言适配的问题，而目前，流行的解决方案就是：Enumerator/Iteratee。</p>\n<p>另外，就是需要用统一的API来处理所有类型的Stream，就像指令式编程中的<code>InputStream.read</code>, <code>OutputStream.write</code>，无论什么Stream都需要支持这些基本方法。</p>\n<h2>High Level Concept Model</h2>\n<p>Enumerator / Iteratee说起来很复杂，其实就是一个生产者 / 消费者模型。 Enumerator是生产者，创建诸多个可控的chunk，Iteratee是消费者，消费任意类型的Input Chunk。</p>\n<!-- language:lang-scala -->\n<pre><code>trait Enumerator {\n  def |>>[A](i: Iteratee[E, A]): Future[Iteratee[E, A]] = apply(i)\n}\n</code></pre>\n<p>Enumerator驱动一个Iteratee，Iteratee处理一个Chunk之后，返回下一个状态的Iteratee. 在构造Enumerator的时候不会真正读取数据，只有在真正消费时才产生IO。</p>\n<p>而且多个Enumerator之间可以组合，不同类型的消费者（Iteratee）也可以进行组合、变换，简言之，组合的概念就是将每个Enumerator / Iteratee都看成是一个可组合的积木，每个积木相对独立可复用，写代码就是将这些积木组合达成你想要形状的过程。这个说法很常见，OO里提倡“组合优于继承”也是一样的思想，其中的关键是如何找到最小的可复用的component，然后是通过什么样的方式进行灵活地组合。</p>\n<p>Enumerator / Iteratee / Enumeratee就是一个非常好的例子。</p>\n<h2>消费者 Iteratee</h2>\n<!-- language:lang-scala -->\n<pre><code>class Iteratee &#x3C;&#x3C; (T, #00FF00) >> {\n  Future[B] fold[B](folder: Step[E, A] => Future[B])\n}\nclass ImmediateIteratee &#x3C;&#x3C; (T, #00FF00) >>\nclass Done &#x3C;&#x3C; (O, #FF0000) >>\nclass Cont &#x3C;&#x3C; (O, #FF0000) >>\nclass Error &#x3C;&#x3C; (O, #FF0000) >>\nclass Step &#x3C;&#x3C; (T, #00FF00) >>\nclass Input &#x3C;&#x3C; (T, #00FF00) >>\n\nIteratee &#x3C;|-- ImmediateIteratee\nIteratee &#x3C;|-- FutureIteratee\nIteratee &#x3C;.left.> Step\nStep .left.> Input\n\nImmediateIteratee &#x3C;|-- DoneIteratee\nDoneIteratee .. Done\nImmediateIteratee &#x3C;|-- ContIteratee\nContIteratee .. Cont\nImmediateIteratee &#x3C;|-- ErrorIteratee\nErrorIteratee .. Error\n\nnote "company objects" as oNote\nDone .. oNote\nCont .. oNote\nError .. oNote\n</code></pre>\n<p>Iteratee是一个Input的消费者，注意：这里的Input不是全部输入，而是a chunk of input，这个很重要，没有一个Iteratee来消费所有输入数据，而是每块一个消费者，然后通过函数组合的方式将所有块穿起来。</p>\n<ul>\n<li>\n<p>为什么不是一个完整输入对应一个消费者呢？\n这是指令式编程的思维方式，因为你需要自己考虑实现细节，设计一些游标，每次读取步进的长度，判断游标的位置来判断下一步如何操作。</p>\n</li>\n<li>\n<p>为什么不是所有的输入chunk共享一个消费者呢？\n嗯，这个问题我不是很确定，应该是有一部分上面的原因，另外就是副作用的问题，每个Step自己维护自己的状态，可以比较容易地实现“懒加载”，在最后一步（调用<code>run</code>）的时候才真正发生IO，而之前，可以通过函数组合任意对每一步进行transform等操作。</p>\n</li>\n</ul>\n<p>Iteratee还有一个需要注意的地方，fold函数是一个<code>curried function</code>，有一个implicit的参数ExecutionContext，也就是在哪个线程池中执行，这个现象在Play中很普遍。</p>\n<p>ImmediateIteratee描述了一个已经预先知道其state的Iteratee，而FutureIteratee当然就是未来才能知道其State的Iteratee。[个人感觉这个地方设计有点怪，FutureIteratee似乎应该用Future[Iteratee]更好。] </p>\n<!-- language:uml -->\n<pre><code>class Step &#x3C;&#x3C; (T, #00FF00) >> {\n  Iteratee[E, A] it\n}\nclass Iteratee &#x3C;&#x3C; (T, #00FF00) >>\nclass Input &#x3C;&#x3C; (T, #00FF00) >>\nStep .left.> Input\nStep &#x3C;-right-> Iteratee\nStep &#x3C;|-- Done\nStep &#x3C;|-- Cont\nStep &#x3C;|-- Error\n</code></pre>\n<p>Step描述的是一个Iteratee的状态，其本身包含一个Iteratee不变量<code>it</code>，而Done、Cont、Error也是简单的<code>case class</code>，所以构造也很简单。</p>\n<!-- language:uml -->\n<pre><code>class Input &#x3C;&#x3C; (T, #00FF00) >>\nInput &#x3C;|-- El\nInput &#x3C;|-- Empty\nInput &#x3C;|-- EOF\n</code></pre>\n<p>Input[E]描述的是<code>一块</code>输入(a chunk of input，不是全部输入)，构造其实很简单，就是一个简单的case class，可以按照你熟悉的方式来构造。</p>\n<h2>生产者 Enumerator</h2>\n<p>先来看看Enumerator的定义：</p>\n<!-- language:lang-scala -->\n<pre><code>trait Enumerator[E] {\n\n  /**\n   * Apply this Enumerator to an Iteratee\n   */\n  def apply[A](i: Iteratee[E, A]): Future[Iteratee[E, A]]\n  def |>>[A](i: Iteratee[E, A]): Future[Iteratee[E, A]] = apply(i)\n  ...\n\n}\n</code></pre>\n<p>由上面定义可以看到，一个<code>Enumerator</code>接受一个<code>Iteratee[E, A]</code>，并返回一个<code>Future[Iteratee[E, A]]</code>，翻译一下就是：Enumerator驱动一个消费者，消费数据之后产生一个下个状态的消费者。</p>\n<p>Enumerator提供了大量的工厂方法（在scala中是通过伴生对象来实现），比如，你可以从一个数组创建一个Enumerator:</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateCountries = Enumerator[String] = Enumerator("China", "America", "Japan", "Russia", "England")\n</code></pre>\n<p>可以从一个文件中创建：</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateFile: Enumerator[Array[Byte]] = Enumerator.fromFile(new File("path/to/some/big/file"))\n</code></pre>\n<p>或者从一个Stream中创建：</p>\n<!-- language:lang-scala -->\n<pre><code>val enumerateFile: Enumerator[Array[Byte]] = Enumerator.fromStream(new java.io.FileInputStream(new File("path/to/some/big/file")))    \n</code></pre>\n<p>更加通用的方式是从一个<code>e: ()=>Future[Option[E]]</code>函数来创建，因为这个函数声明了：未来可能会产生一个<code>E</code>:</p>\n<!-- language:lang-scala -->\n<pre><code>def generateM[E](e: => Future[Option[E]])(implicit ec: ExecutionContext): Enumerator[E] = {\n    ...\n}\n</code></pre>\n<p>发挥一下你的想象，很多事情都可以看成是Stream，比如时间：</p>\n<!-- language:lang-scala -->\n<pre><code>import play.api.libs.concurrent.Promise\nimport play.api.libs.iteratee._\nimport scala.concurrent.duration._\nimport scala.concurrent.ExecutionContext.Implicits.global\nimport java.util.Date\n\n// 截止时间\nval alertTo = new Date(System.currentTimeMillis + 1000*60)\n\n// 一个时间流，截止到alertTo\nval timeStream = Enumerator.generateM {\n    Promise.timeout(\n      if (new Date before alertTo) Some(new Date) else None, \n      1 seconds)\n}\n\nval printlnSink = Iteratee.foreach[Date](date => println(date))\n// 每隔一秒钟打印一次，直到alertTo\ntimeStream |>> printlnSink\n</code></pre>\n<p>如果你想再play console里面运行上面的代码，可能会失败，说什么:no application started之类的，这时你需要前面加上：</p>\n<!-- language:lang-scala -->\n<pre><code>val app = new play.core.StaticApplication(new java.io.File("."))\n</code></pre>\n<p>创建一个测试用的application，再试一下就OK了。</p>\n<p>除了这个例子，我觉得也可以将数据库中的游标查询用Enumerator来实现。</p>\n<p>在Play框架中，还有一个实际的例子是<code>WebSocket</code>，有机会我们再单独介绍。</p>\n<h2>适配器 Enumeratee</h2>\n<p>对应OO Design Pattern中的Adaptor模式，<code>Enumeratee</code>就是一个Adaptor，将不同规格的组件适配在一起。比如下面这个例子：</p>\n<p>我们有一个String类型的Enumerator, <code>Enumerator("123", "456", "789", "222", "333", "444")</code>，还有一个累加器，<code>Iteratee.fold[Long, Long](0:Long) { (acc, el) => acc + el }</code>，两者的“规格”是不同的，一个是String， 但另外一个是Long，当然我们可以再定义一个新的Iteratee，比如：<code>Iteratee.fold[String, Long](0:Long) { (acc, el) => acc + el.toLong }</code>，但是显然，这里面有重复代码的臭味道。更加合理的方式是做一个适配，用一个适配器来讲两个已经存在的component转接后一起工作。</p>\n<!-- language:lang-scala run -->\n<pre><code>import play.api.libs.iteratee._\nimport scala.concurrent.ExecutionContext.Implicits.global\n\nval strings = Enumerator("123", "456", "789", "222", "333", "444")\nval sum = Iteratee.fold[Long, Long](0:Long) { (acc, el) => acc + el }\nval toLong = Enumeratee.map[String]( x => x.toLong )\n\nstrings |>> toLong &#x26;>> sum flatMap { x => x.run } onSuccess { case s => println(s) }\n// Or, transform the Enumerator first.\nstrings &#x26;> toLong |>> sum flatMap { x => x.run } onSuccess { case s => println(s) }\n</code></pre>\n<p>上面例子可以看到，<code>Enumeratee</code>不但可以适配<code>Iteratee</code>，还可以转换<code>Enumerator</code>。</p>\n<p>留个问题：<code>strings &#x26;> toLong</code>会不会产生memory的问题？ </p>\n<h2>指令式 VS. 函数式</h2>\n<p>这里用一个很无聊的例子：遍历一个大文件来统计文件大小。</p>\n<h3>指令式风格</h3>\n<p>Use Java FileInputStream, more imperative style:</p>\n<!-- language:lang-scala -->\n<pre><code>val fis = new java.io.FileInputStream(new java.io.File("/Users/leo/Movies/big_file.mkv"))\n\n// mutable variables\nvar readLength = 0\nvar fileSize: Long = 0\nvar buf = new Array[Byte](1024 * 8) // chunk size used in Enumerator\nval begin = System.currentTimeMillis\ndo {\n  readLength = fis.read(buf)\n  if (readLength != -1)\n    fileSize = fileSize + readLength\n}while(readLength != -1)\n\nprintln(s"File Size: $fileSize, and it took ${System.currentTimeMillis - begin} ms")\n</code></pre>\n<p>And output like <code>File Size: 4003885806, and it took 54701 ms</code>, the memory usage is about <code>78Mb</code>.</p>\n<h3>函数式风格</h3>\n<p>Use Enumerator / Iteratee to get file size:</p>\n<!-- language:lang-scala -->\n<pre><code>import play.api.libs.iteratee._\n// construct an Enumerator from a file\nval fileEnum = Enumerator.fromFile(new java.io.File("/Users/leo/Movies/big_file.mkv")) \n// create a consumer\nval counter = Iteratee.fold[Array[Byte], Long](0: Long){ (acc, ele) => ele.size + acc }\n\nval begin = System.currentTimeMillis\n// where the IO really happens.\nIteratee.flatten(fileEnum |>> counter).run.onSuccess { case x => println(s"File Size: $x, and it took ${System.currentTimeMillis - begin} ms") }\n</code></pre>\n<p>Here\'s the output: <code>File Size: 4003885806, and it took 57213 ms</code>, and max memory usage is about <code>120Mb</code>. </p>\n<p>Note: If you are running above code with Scala version &#x3C; 2.10.3, you\'ll run into <code>OutOfMemory</code> Error, it\'s so funny right? Enumerator / Iteratee suppose to be designed to solve the OutOfMemory issue, actually, it\'s not Enumerator/Iteratee \'s problem, it\'s a bug of scala, see <a href="https://issues.scala-lang.org/browse/SI-7336">SI-7336</a></p>\n<h3>对比</h3>\n<p>从上面的两种实现来看，从执行时间上，两种方式没有太大差异，但是指令式编程在内存占用方面要优于函数式编程，毕竟var变量可以复用，val变量需要重新生成。但是差别并没有想象中那么大，处理一个4G的文件，差别只是40M左右。但是带来的好处是显而易见的：因为没有mutable变量，没有副作用，并发、代码可读性有提高。</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2013/Enumerator-Iteratee-Enumeratee.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2013-11-11T14:16:45.000Z",path:"/2013/enumerator-iteratee-enumeratee",title:"Enumerator / Iteratee / Enumeratee",excerpt:"Stream对于指令式编程已经比较成熟了，有大量的类库，丰富的API。但是对于强调不可变量，尽可能无副作用的FP来说，要考虑语言适配的问题，而目前，流行的解决方案就是：Enumerator/Iteratee。",tags:["scala","playframework","blog"]}}}}}});
//# sourceMappingURL=path---2013-actor-collection-collabration-7bdd0b3555bd9c8418d2.js.map