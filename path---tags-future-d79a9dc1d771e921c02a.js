webpackJsonp([41057205246119],{440:function(e,n){e.exports={pathContext:{posts:[{html:'<h2>问题</h2>\n<p>Tokio是一个很强大的crate，实现了各种异步编程模型，是很多框架的实现基础，比如hyper, linkerd2等等。</p>\n<p>在tokio中，一个很核心的概念就是 <code>Future</code>，类似 Javascript中的 <code>Promise</code>，但不同的是：tokio的future是用了<code>poll</code>模型而不是<code>push</code>。</p>\n<pre><code class="language-rust">trait Future {\n    /// The type of the value returned when the future completes.\n    type Item;\n\n    /// The type representing errors that occurred while processing the computation.\n    type Error;\n\n    /// The function that will be repeatedly called to see if the future is\n    /// has completed or not. The `Async` enum can either be `Ready` or\n    /// `NotReady` and indicates whether the future is ready to produce\n    /// a value or not.\n    fn poll(&#x26;mut self) -> Result&#x3C;Async&#x3C;Self::Item>, Self::Error>;\n}\n</code></pre>\n<p>所以，利用future实现异步编程，核心就是要实现自己的future。比如下面这个例子：</p>\n<pre><code class="language-rust">impl Future for HelloWorld {\n    type Item = String;\n    type Error = ();\n\n    fn poll(&#x26;mut self) -> Poll&#x3C;Self::Item, Self::Error> {\n        return Ok(Async::Ready("hello world".to_string()));\n    }\n}\n\n// A tuple struct, instead of a field struct.\nstruct Display&#x3C;T>(T);\nimpl&#x3C;T> Future for Display&#x3C;T> \nwhere\n    T: Future,\n    T::Item: fmt::Display,\n{\n    type Item = ();\n    type Error = T::Error;\n\n    fn poll(&#x26;mut self) -> Poll&#x3C;(), T::Error> {\n        let value = match self.0.poll() {\n            Ok(Async::Ready(value)) => value,\n            Ok(Async::NotReady) => return Ok(Async::NotReady),\n            Err(error) => return Err(error),\n        };\n        println!("{}", value);\n        Ok(Async::Ready(()))\n    }\n}\n\nfn main() {\n    let future = Display(HelloWorld);\n    tokio::run(future);\n}\n</code></pre>\n<p>好像挺简单。但是仔细想一下，如果这个HelloWorld里需要做一些耗时的操作，需要根据进度返回NotReady或者Ready，也就是，让tokio runtime engine在poll HelloWorld future的时候，如果发现返回NotReady，那就重试。看着Display的poll方法，你可以会很简单<del>很傻很天真</del>地这么来实现：</p>\n<pre><code class="language-rust">impl Future for HelloWorld {\n    type Item = String;\n    type Error = ();\n\n    fn poll(&#x26;mut self) -> Poll&#x3C;Self::Item, Self::Error> {\n        println!("polling in hello world future");\n        let rand = random_integer::random_u16(100u16, 1000u16);\n        if rand > 800u16 {\n            return Ok(Async::Ready("hello world".to_string()));\n        } else {\n            return Ok(Async::NotReady);\n        }\n    }\n}\n</code></pre>\n<p>写完之后<code>cargo run</code>，嗯？怎么卡住了？说好的 <code>repeatedly call poll method</code>呢？ 怎么就调用了一遍？</p>\n<p>找了半天文档，发现在<a href="https://tokio.rs/docs/futures/basic/">tokio官方文档</a>中，苦口婆心地强调：</p>\n<blockquote>\n<p>poll implementations must never return NotReady unless they received NotReady by calling an inner future. </p>\n</blockquote>\n<blockquote>\n<p> The key take away here is do not return NotReady unless you got NotReady from an inner future.</p>\n</blockquote>\n<p>可是，<code>inner future</code>是什么鬼？为什么<code>inner future</code>能返回 NotReady，我的Future就不行？</p>\n<p>再仔细看文档，发现：</p>\n<blockquote>\n<p>When a function returns Async::NotReady, it signals that it is currently not in a ready state and is unable to complete the operation. It is critical that the executor is notified when the state transitions to “ready”. Otherwise, the task will hang infinitely, never getting run again.</p>\n</blockquote>\n<blockquote>\n<p>Innermost futures, sometimes called “resources”, are the ones responsible for notifying the executor. This is done by calling notify on the task returned by task::current().</p>\n</blockquote>\n<p>OK, 因为tokio future是poll模型，所以需要有一个<ruby>通知<rt>notify</rt></ruby>机制，告诉runtime engine可以再去poll了。</p>\n<p>根据这个信息，简单修改如下：</p>\n<pre><code class="language-rust">impl Future for HelloWorld {\n    type Item = String;\n    type Error = ();\n\n    fn poll(&#x26;mut self) -> Poll&#x3C;Self::Item, Self::Error> {\n        println!("polling in hello world future");\n        let rand = random_integer::random_u16(100u16, 1000u16);\n        if rand > 800u16 {\n            return Ok(Async::Ready("hello world".to_string()));\n        } else {\n            futures::task::current().notify();\n            return Ok(Async::NotReady);\n        }\n    }\n}\n</code></pre>\n<p>上面修改简单讲就是：</p>\n<ol>\n<li>在发现没有完成任务的时候，返回NotReady</li>\n<li>并通知对当前task感兴趣的task，具体说就是<code>task::current()</code>，在本例中，就是Display。<code>task::current()</code>是通过thread local来实现的。</li>\n</ol>\n<p>再次运行 <code>cargo run</code>：</p>\n<pre><code>tokio-test [master] $ cargo run\n    Finished dev [unoptimized + debuginfo] target(s) in 0.09s\n     Running `target/debug/tokio-test`\npolling in hello world future\npolling in hello world future\npolling in hello world future\npolling in hello world future\nhello world\n</code></pre>\n<p>搞定，收工！</p>',id:"/Users/lliu/github/smilingleo.github.io/src/pages/2019/Tokio Future.poll返回NotReady.md absPath of file >>> MarkdownRemark",frontmatter:{date:"2019-03-01T13:11:29.000+08:00",path:"/2019/rust-tokio-futures-poll-not-ready",title:"自定义Tokio Future.poll返回NotReady",excerpt:"如何在Future.poll中返回Async::NotReady",tags:["rust","tokio","Future","async programming"]}}],tagName:"Future"}}}});
//# sourceMappingURL=path---tags-future-d79a9dc1d771e921c02a.js.map