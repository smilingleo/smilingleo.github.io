webpackJsonp([0x8b1b763c5f4f],{390:function(e,n){e.exports={data:{markdownRemark:{html:'<p>Scala的学习过程中，经常会碰到一些莫名其妙的现象，很多时候，这些语言层面的“怪象”都与scala编译器或者scala的类型系统有关。</p>\n<p>本文不是对编译器和类型系统的介绍，而是重点介绍遇到这些现象的时候，用什么样的方式，拨开云雾见蓝天，通过这些工具获取一些细节帮你了解编译器和类型系统如何工作。工欲善其事，必先利其器。</p>\n<h2>REPL</h2>\n<p>Read-Evaluate-Print-Loop, 是一个所有学习scala的同学都要掌握的工具，可以帮你快速测试一些代码，了解一些library怎么使用。</p>\n<p>在安装scala之后，命令行下执行<code>scala</code>，就会进入REPL.</p>\n<!-- language: bash -->\n<pre><code>$ scala\nWelcome to Scala version 2.11.1 (Java HotSpot(TM) 64-Bit Server VM, Java 1.6.0_65).\nType in expressions to have them evaluated.\nType :help for more information.\n\nscala>\n</code></pre>\n<p>如果是SBT项目，可以用<code>sbt console</code>进入，之后操作类型，不再重复。</p>\n<h3>模式</h3>\n<p>scala REPL有<a href="http://hongjiang.info/scala-repl-modes/">几种模式</a>，其中比较常用的就是<code>:paste</code>，可以比较方便的输入多行，不过要注意，拷贝粘贴的代码中，不要有Tab，否则会触发auto code completion，出现一堆错误提示。</p>\n<h3>反射</h3>\n<h2>命令行参数</h2>\n<p>通过<code>man scala</code>, <code>man scalac</code>，可以了解scala都有哪些参数可用。注意的是：scala的命令行参数中import了scalac的参数，所以可以在scala命令后面使用任何scalac的参数。其中比较有用的参数有：</p>\n<ul>\n<li><code>-X</code>系列，用于输出高级选项概要。也就是正式支持的选项，向后兼容。</li>\n<li><code>-Y</code>系列。用于输出私有选项信息，可能随版本变化。参见<a href="http://www.scala-lang.org/old/node/9313">[6]</a><a href="http://paulbutcher.com/2010/04/26/scala-compiler-advanced-options/">[7]</a></li>\n</ul>\n<p><code>scala -X</code>，<code>scala -Y</code>可以分别列出当前版本所支持的所有选项。</p>\n<h2>参考</h2>\n<ol>\n<li><a href="http://stackoverflow.com/questions/11055210/whats-the-easiest-way-to-use-reify-get-an-ast-of-an-expression-in-scala">What\'s the easiest way to use reify (get an AST of) an expression in Scala? stackoverflow</a></li>\n<li><a href="http://stackoverflow.com/questions/11392622/how-to-investigate-objects-types-etc-from-scala-repl">How to investigate objects/types/etc. from Scala REPL? stackoverflow</a></li>\n<li><a href="https://www.parleys.com/tutorial/51c38751e4b0d38b54f4625e/chapter0/about">Practical Type Mining in Scala ,  scaladay 2013</a></li>\n<li><a href="http://hongjiang.info/scala-repl-modes/">REPL的几种模式, hongjiang</a></li>\n<li><a href="http://docs.scala-lang.org/overviews/reflection/symbols-trees-types.html">Symbols, Trees, and Types, scalaDoc</a></li>\n<li><a href="http://www.scala-lang.org/old/node/9313">Difference between -Y and -X compiler options, scala user forum</a></li>\n<li><a href="http://paulbutcher.com/2010/04/26/scala-compiler-advanced-options/">Scala Compiler Advanced Options</a></li>\n</ol>',frontmatter:{title:"Scala雾里看花",date:"April 23, 2015",path:"/2015/scala-trouble-shooting",tags:["scala","trouble shooting"],excerpt:"Scala的学习过程中，经常会碰到一些莫名其妙的现象，很多时候，这些语言层面的“怪象”都与scala编译器或者scala的类型系统有关。本文不是对编译器和类型系统的介绍，而是重点介绍遇到这些现象的时候，用什么样的方式，拨开云雾见蓝天，通过这些工具获取一些细节帮你了解编译器和类型系统如何工作。工欲善其事，必先利其器。"}}},pathContext:{prev:{html:'<h2>Java中的AOP</h2>\n<p>在Java世界，AOP（Aspect Oriented Programming， 面向方面编程)是很多框架的基础。这种将关注点按照“方面”来切分的编程模型极大地简化了编程的复杂度，尤其是在多维度因子交织在一起的时候的各种场景。对于代码的可读性、可维护性、可重用性都是极大的帮助。</p>\n<p>不过AOP一个令人诟病的地方是其透明性，也就是说对于开发人员来说，我不知道我的某个方法会不会被某个Aspect切面一刀，有些时候，会造成一些意想不到的后果，比如Spring的transaction管理，如果通过aop的方式来定义，比如：</p>\n<!-- language: xml -->\n<pre><code>&#x3C;tx:advice id="txCommonAdvice" transaction-manager="transactionManager">\n    &#x3C;tx:attributes>\n        &#x3C;tx:method name="save*" propagation="REQUIRED"/>\n        &#x3C;tx:method name="remove*" propagation="REQUIRED"/>\n        &#x3C;tx:method name="update*" propagation="REQUIRED"/>\n        &#x3C;tx:method name="delete*" propagation="REQUIRED"/>\n        &#x3C;tx:method name="*" propagation="REQUIRED" read-only="true"/>\n    &#x3C;/tx:attributes>\n&#x3C;/tx:advice>\n</code></pre>\n<p>那么被这个切面拦截的任何方法都会导致Spring Transaction Manager启动一个事务，甚至是像<code>toString()</code>, <code>equal(other)</code>等这样的方法，而且因为其透明性，开发人员往往意识不到这个问题。</p>\n<h2>Scala中的AOP</h2>\n<p>在Scala的世界里，AOP的思想其实也是适用的，当然，因为Scala就运行在jvm上面，很多code weaver工具也照样是可以用的，比如aspectj, asm等等，个人不是很喜欢这些东西，更喜欢用显式的方式来告诉我的代码读者，我的代码会做哪些事情。No Magic，是我的一个信条。</p>\n<p>Scala的Mixin机制trait，可以很好地实现显式的AOP，举个例子：</p>\n<!-- language: scala run -->\n<pre><code>trait Task { def execute }\ntrait TaskLogging extends Task {\n    abstract override def execute = {\n        println("before execute")\n        super.execute\n        println("after execute")\n    }\n}\nclass MyTask extends Task {\n    override def execute = {\n        println("do something")\n    }\n}\n\nval task = new MyTask\ntask.execute    // 输出 \'do something\'，没什么稀奇的\n\nval task2 = new MyTask with TaskLogging\ntask2.execute   // 点击\'run\'看看会输出什么？\n</code></pre>\n<p>在上面代码中，<code>MyTask</code>和<code>TaskLogging</code>都是只关注于自己的逻辑（Aspect），在运行时，可以构建一个<code>MyTask with TaskLogging</code>的<code>task2</code>instance，就可以将两个方面组合在一起了。当然你还可以增加新的方面，比如：</p>\n<!-- language: scala -->\n<pre><code>trait Transactional extends Task {\n    abstract override def execute = {\n        println("begin transaction")\n        try {\n            super.execute\n            println("commit transaction")\n        } catch {\n            case _: Exception =>\n                println("rollback transaction")\n        }\n    }\n}\n\nval task3 = new MyTask with TaskLogging with Transactional\ntask3.execute\n</code></pre>\n<p>这样，就可以构建一个有事务，有logging的task。</p>\n<p>总结一下，定义一个Aspect的步骤：</p>\n<ol>\n<li>重载trait中的方法</li>\n<li>方法前逻辑，比如logging、begin transaction等等</li>\n<li>调用<code>super</code>对象的方法</li>\n<li>方法后逻辑，比如logging、commit transaction等</li>\n</ol>\n<p>这里，主要的知识点是调用<code>super.execute</code>的执行顺序，在用<code>with Trait</code>定义一个新类型的时候，多个Trait会形成一个Stack，执行的时候会按照出栈顺序执行，比如：</p>\n<!-- language: scala -->\n<pre><code>val task = new MyTask with TaskLogging with Transactional\ntask.execute\n</code></pre>\n<p>TaskLogging先入栈，Transactional后入，那么执行的时候，先执行Transactional，后执行TaskLogging，就会输出：</p>\n<!-- language -->\n<pre><code>begin transaction\nbefore execute\ndo something\nafter execute\ncommit transaction\n</code></pre>\n<p>换一个顺序：</p>\n<!-- language: scala -->\n<pre><code>val task = new MyTask with TaskLogging with Transactional\ntask.execute\n</code></pre>\n<p>那么输出将会是另外一个顺序。    </p>\n<h3>抽象方法中的super call</h3>\n<p>注意一个细节，在<code>TaskLogging.execute</code>中，我们调用了<code>super.execute</code>，仔细想想，感觉很奇怪，几个疑点：</p>\n<ol>\n<li>TaskLogging的super是谁？</li>\n<li>为什么<code>MyTask.execute</code>是最后执行的？</li>\n</ol>\n<p>查询《Programming in Scala》“traits as stackable modifications“章节后，我们可以了解到：</p>\n<ol>\n<li>trait中的super call是动态绑定，是在另外一个trait或者class实现一个具体的方法之后。</li>\n<li>所以trait中的方法必须标注: <code>abstract override</code>，以此来告诉编译器，你是故意这么来用的。</li>\n</ol>\n<p>用scalac编译上述源文件，生成.class文件之后，用<code>jad</code>等工具查看反编译类，会发现其实<code>MyTask with TaskLogging</code>会产生一个匿名类，继承MyTask，实现TaskLogging接口，回头再看TaskLogging中定义的<code>super.execute</code>，就能理解了，原来在调用TaskLogging.execute方法的时候的<code>this</code>，已经是匿名类的实例了，当然其super是合法的。然后其执行顺序也就能理解了。</p>\n<p>但是这里明显有一个矛盾：从代码执行角度看，生成的匿名类是MyTask和TaskLogging的子类，这点可以通过<code>task.isInstanceOf[MyTask] &#x26;&#x26; task.isInstanceOf[TaskLogging]</code>中判断得出，但是从字面上看，在trait TaskLogging中调用<code>super.execute</code>，又给人感觉莫名其妙。可能这也是scala需要在jvm上运行所做的妥协吧。</p>\n<h2>Stackable Actor模式</h2>\n<p>在Akka中，这种Mixin的用法非常的有帮助，比如在对actor进行监控的时候，我们希望能记录每个actor发送消息的路径，每个actor接收消息之后处理所花费的时间、调用次数等等，如果不用这种trait mixin的话，代码将非常凌乱。</p>\n<p>之所以单独将这个模式提出来，其实还因为这个模式中利用了PartialFunction的特性，让代码更加的优雅。看例子：</p>\n<!-- language: scala run -->\n<pre><code>type Receive = PartialFunction[Any, Unit]\n\ntrait Actor {\n    def receive: Receive\n    def unhandled(msg: Any): Unit = println(s"unhandled message: $msg")\n}\n\ntrait StackableActor extends Actor {\n    def wrapped: Receive\n    def receive: Receive = {\n        case x => if (wrapped.isDefinedAt(x)) wrapped(x) else unhandled(x)\n    }\n}\n\n trait LoggingActor extends StackableActor { \n    override def wrapped: Receive = { \n        case x => \n            println(s"start processing message: $x")\n            super.receive(x)\n            println("end of processing message:" + x) \n    }\n}\n\nclass MyActor extends StackableActor with LoggingActor {\n    override def wrapped: Receive = {\n        case "something" =>\n            println("I can only do \'something\'")\n    }\n}\n\nnew MyActor() receive ("something")\nnew MyActor() receive ("else")\n</code></pre>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2015/如何在Scala中实现AOP.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2015-08-13T10:16:45.000Z",path:"/2015/aop-by-mixin-in-scala",title:"用Mixin组合实现Scala中的AOP",excerpt:"在Java世界，AOP（Aspect Oriented Programming， 面向方面编程)是很多框架的基础。这种将关注点按照“方面”来切分的编程模型极大地简化了编程的复杂度，尤其是在多维度因子交织在一起的时候的各种场景。对于代码的可读性、可维护性、可重用性都是极大的帮助。",tags:["scala","functional programming","AOP","mixin"]}},next:{html:'<h2>Pull Mysql Docker Image</h2>\n<!-- language: bash -->\n<pre><code>docker pull mysql:5.6\n</code></pre>\n<h2>Create MySQL Config Files</h2>\n<p>For Master, create a <code>mysql.cnf</code> file and add the following content:</p>\n<!-- language: bash -->\n<pre><code>[mysqld]\n\nserver-id = 1\nlog_bin\nbinlog_format = ROW\nbind-address = 0.0.0.0\n\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES\n</code></pre>\n<p>For Slave, create another <code>mysql.cnf</code> and add the following content:</p>\n<!-- language: bash -->\n<pre><code>[mysqld]\n\nserver-id = 2\nlog_bin\nbinlog_format = ROW\nbind-address = 0.0.0.0\n\nsql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES\n</code></pre>\n<h2>Start Master/Slave MySQL Containers</h2>\n<p>Start Master:</p>\n<!-- language: bash -->\n<pre><code>docker run --name master -v /my/master:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:5.6\n</code></pre>\n<p>Start Slave:</p>\n<!-- language: bash -->\n<pre><code>docker run --name slave -v /my/slave:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD=my-secret-pw --link master:master -d mysql:5.6\n</code></pre>\n<p>The slave node needs to link to master node.</p>\n<h2>Setup Replication</h2>\n<p>Check the master status:</p>\n<!-- language: bash -->\n<pre><code>mysql> show master status \\G\n*************************** 1. row ***************************\n             File: mysql-bin.000003\n         Position: 120\n     Binlog_Do_DB: \n Binlog_Ignore_DB: \nExecuted_Gtid_Set: \n1 row in set (0.00 sec)\n</code></pre>\n<p>the above information is necessary for the slave configuration, especially the <code>File</code> and <code>Position</code>.</p>\n<p>Connect to Slave node, in Mysql Shell:</p>\n<!-- language: bash -->\n<pre><code>mysql> change master to master_host=\'master\',master_user=\'root\',master_password=\'my-secret-pw\',master_log_file=\'mysql-bin.000003\',master_log_pos=120;  \nQuery OK, 0 rows affected (0.00 sec)  \n\nmysql> start slave;\nQuery OK, 0 rows affected (0.01 sec)\n\nmysql> show slave status\\G\n\n// until you see the following two options are \'Yes\'\nSlave_IO_Running: Yes  \nSlave_SQL_Running: Yes  \n</code></pre>\n<p>You need to change the parameters like <code>master_log_file</code> and <code>master_log_pos</code> based on previous <code>show master status</code> output.</p>\n<h2>Test</h2>\n<p>Create some tables and insert some data on master, and check if those data are synced to slave. </p>\n<h2>Change Data Capture (CDC)</h2>\n<p>Here I used an open source library <a href="https://github.com/whitesock/open-replicator">open-replicator</a></p>\n<!-- language: scala -->\n<pre><code>import com.google.code.or._\nimport com.google.code.or.binlog._\nimport com.google.code.or.binlog.impl.event.FormatDescriptionEvent\n\nval or = new OpenReplicator()\nor.setUser("root")\nor.setPassword("my-secret-pw")\nor.setServerId(2);\nor.setHost("slave")\nor.setPort(3306)\nor.setBinlogPosition(120)\nor.setBinlogFileName("mysql-bin.000004")\n\nor.setBinlogEventListener(new BinlogEventListener() {\n  def onEvents(event: BinlogEventV4) = {\n\n  }\n})\n\nor.start()\n</code></pre>\n<p>TBD.\nSee <code>com.linkedin.databus2.producers.ORListener</code></p>\n<h2>References</h2>\n<ol>\n<li><a href="https://registry.hub.docker.com/_/mysql/">Mysql Docker Official Repo</a></li>\n<li><a href="https://github.com/linkedin/databus/wiki/Databus-for-MySQL">Databus for MySQL</a></li>\n</ol>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2015/Docker创建MySQL主从复制以及CDC测试.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2015-04-21T07:16:45.000Z",path:"/2015/mysql-replication-on-docker",title:"MySQL Master/Slave Replication on Docker",excerpt:"How to setup Mysql master/slave replication.",tags:["docker","mysql"]}}}}}});
//# sourceMappingURL=path---2015-scala-trouble-shooting-25206b9ed7366ebd4d40.js.map