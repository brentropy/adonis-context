# Context Provider for the Adonis Framework

A context provider for [Adonis][0] based on [`async_hooks`][1] used to store
data for a group of related asynchronous function calls such as a request.

## Why Context?

Most applications do just fine without any sort of per-request context. Data
from the request can be explicitly passed through the rest of the application.
There are however some cases that make having a request scoped data store very
appealing.

- **Tying logs to a request** - It is very helpful for debugging a production
  application to include the request ID in each message logged as part of the
  request lifecyle. This is easy for messages logged in middleware, controllers
  and error handlers, but it can be difficult to do in other parts of the
  application without muddying the API. Context makes this trivial.
- **Tracking stats for a request** - it is easy to track stats like total
  request duration with a middleware, but but having a context allows accuratly
  reporting stats such as how many database queries were triggered by the
  reqeuest and what portion of the total request duration was spent waiting on
  database queries or some other external service.
- **Request specific configuration** - Some applications, particularly those
  that support multiple tenants, may want to have configuration like data
  specific to the reqeust. This could include things like database
  connections/schemas or credentials for external services.

## Installation

```
adonis install adonis-context
```

After installing the package, make sure to follow the directions in
[instructions.md](instructions.md) on how to set up the provider.

## Usage

### Request Context

Be default, the provider will ensure that each HTTP request is executed in a
unique context. Getting an instance of `Context` anywhere within the request
lifecyle will return a store specific to that request.

#### Example

```js
class SomeMiddleware {
  static get inject () {
    return ['Context']
  }

  constructor (context) {
    this.context = context
  }

  async handle ({ request }, next) {
    this.context.set('some.key', keyForRequest(request))
    await next()
  }
}

class SomeService {
  static get inject () {
    return ['Context']
  }

  constructor (context) {
    this.key = context.get('some.key', 'default key')
  }
}
```

### Non-request Contexts

The `ContextProvider` allows you to run any arbitrary code inside of a context.
For example, you may want to run each worker job in a seperate context.

```js
const manager = use('Context/Manager')
await manager.run(async () => {
  // this will be run in a context
})
```

### Default Context

A default context exists that will be used whenever `Context` is resolved
outside of a current context. This makes it easy to write code that works with
or without context. By default the store is empty, but it can be initialized
with some data in bootstraping hooks, or a service provider's boot method.

```js
const manager = use('Context/Manager')
manager.default.get('foo', 'somedefaultvalue') // => 'somedefaultvalue'
```

## API

### `Context/Store` (aliased as `Context`)

#### `set(key, value)`

##### Params

- **key**: *(string)* The key to be set. Setting nested values is supported by
  using dots to separate the keys in the sting (ex. `query.count`). When using
  nested keys, it is possible for `set` to throw a `RuntimeException` when
  attempting to set a property of an existing non-object value.
- **value**: *(any)* The value to be set.

##### Example

```js
const context = use('Context')
context.set('service.apiKey', 'userapikey')
```

#### `get(key, fallback)`

##### Params

- **key**: *(string)* The key for the value to be returned from the store. Like
  the `set` method, nested values can be retrieved using dot to seperate the
  keys in the string.
- **fallback**: *(any)* *Optional* The value to return if a value has not been
  set for the key. Defaults to `null`.

##### Example

```js
const context = use('Context')
const config = use('Config')
context.get('service.apiKey', config.get('service.apiKey'))
```

### `Context/Manager`

#### `run(next)`

##### Params

- **next**: *(function -> Promise)* An async function (or any function that
  returns a promise). Everything executed withing this function will be tracked
  as part of a new context.

##### Example

```js
const manager = use('Context/Manager')
await manager.run(async () => {
  // this will be run in a context
})
```

#### `disable()`

Disable `async_hooks` for the context provider. While disabled, context will be
lost for code executing in future runs of the event loop.

##### Example

```js
const manager = use('Context/Manager')
manager.disable()
```

#### `enable()`

Enable `async_hooks` for the context provider after it has been disabled. The
hooks for the provider are enabled by default.

##### Example

```js
const manager = use('Context/Manager')
manager.disable()
manager.enable()
```

## Disclaimers

Using context may not be right for all projects. There are a few things you
should be aware of before using it.

### Pre-release

This package has not been tested extensively yet. Make sure you test thoroughly
before deploying it in a production application. If you try it out, I would
appreciate feedback.

### `async_hooks` API stability

This package is based on the Node.js [`async_hooks`][1] API. It is currently
listed as `Stability: 1 - Experimental`. With that being said, it has been in
the works for a long time. I would be surprised to see a lot of change.

> The async_hooks module provides an API to register callbacks tracking the
> lifetime of asynchronous resources created inside a Node.js application.

### Performance

I have not run any real world benchmarks yet, but it is expected that there will
be some performace cost of tracking context with `async_hooks`. The performance
of `async_hooks` and ways that it can be improved are currently being discussed
(see https://github.com/nodejs/benchmarking/issues/181).

## License

Copyright 2018 Brent Burgoyne

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://adonisjs.com
[1]: https://nodejs.org/dist/latest-v8.x/docs/api/async_hooks.html#async_hooks_async_hooks
