import 'setimmediate'

if (!Function.prototype.bind) {
  /*eslint-disable no-extend-native*/
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
    }

    const aArgs = Array.prototype.slice.call(arguments, 1)
    const fToBind = this
    const FNOP = function () {}
    const fBound = function () {
      return fToBind.apply(this instanceof FNOP && oThis
             ? this
             : oThis,
             aArgs.concat(Array.prototype.slice.call(arguments)))
    }

    FNOP.prototype = this.prototype
    fBound.prototype = new FNOP()

    return fBound
  }
}

function NP (fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  this._state = null
  this._value = null
  this._progress = null
  this._deferreds = []

  doResolve(fn, resolve.bind(this), reject.bind(this), notify.bind(this))
}

function handle (deferred) {
  const me = this
  if (me._state === null) {
    me._deferreds.push(deferred)
    if (deferred.onProgress) {
      if (me._progress !== null) {
        setImmediate(() => {
          deferred.onProgress(me._progress)
        })
      }
    }
    return
  }
  setImmediate(() => {
    const cb = me._state ? deferred.onFulfilled : deferred.onRejected
    if (cb === null) {
      (me._state ? deferred.resolve : deferred.reject)(me._value)
      return
    }
    let ret
    try {
      ret = cb(me._value)
    } catch (e) {
      deferred.reject(e)
      return
    }
    deferred.resolve(ret)
  })
}

function resolve (newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === this) {
      throw new TypeError('A promise cannot be resolved with itself.')
    }
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      const then = newValue.then
      if (typeof then === 'function') {
        doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this), notify.bind(this))
        return
      }
    }
    this._state = true
    this._value = newValue
    finale.call(this)
  } catch (e) {
    reject.call(this, e)
  }
}

function reject (newValue) {
  this._state = false
  this._value = newValue
  finale.call(this)
}

function notify (progress) {
  this._progress = progress
  finale.call(this, true)
}

function finale (keep) {
  for (let i = 0, len = this._deferreds.length; i < len; i++) {
    handle.call(this, this._deferreds[i])
  }
  if (!keep) {
    this._deferreds = null
  }
}

function Handler (onFulfilled, onRejected, onProgress, resolve, reject, notify) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.onProgress = typeof onProgress === 'function' ? onProgress : null
  this.resolve = resolve
  this.reject = reject
  this.notify = notify
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve (fn, onFulfilled, onRejected, onProgress) {
  let done = false
  try {
    fn(value => {
      if (done) return
      done = true
      onFulfilled(value)
    }, reason => {
      if (done) return
      done = true
      onRejected(reason)
    }, progress => {
      if (done) return
      onProgress(progress)
    })
  } catch (e) {
    if (done) return
    done = true
    onRejected(e)
  }
}

NP.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

NP.prototype['finally'] = function (done) {
  return this.then(value => NP.resolve(done()).then(() => {
    return value
  }), reason => NP.resolve(done()).then(() => {
    throw reason
  }))
}

NP.prototype.progress = function (onProgress) {
  return this.then(null, null, onProgress)
}

NP.prototype.then = function (onFulfilled, onRejected, onProgress) {
  const me = this
  return new NP((resolve, reject, notify) => {
    handle.call(me, new Handler(onFulfilled, onRejected, onProgress, resolve, reject, notify))
  })
}

NP.resolve = value => {
  if (value && typeof value === 'object' && value.constructor === NP) {
    return value
  }

  return new NP(resolve => resolve(value))
}

NP.reject = value => new NP((resolve, reject) => reject(value))

NP.notify = value => new NP((resolve, reject, notify) => notify(value))

NP.all = values => {
  return new NP((resolve, reject, notify) => {
    if (values.length === 0) return resolve([])
    let remaining = values.length

    function res (i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          const then = val.then
          if (typeof then === 'function') {
            then.call(val, val => {
              res(i, val)
            }, reject, notify)
            return
          }
        }
        values[i] = val
        if (--remaining === 0) {
          resolve(values)
        }
      } catch (e) {
        reject(e)
      }
    }
    for (let i = 0; i < values.length; i++) {
      res(i, values[i])
    }
  })
}

NP.race = values => {
  return new NP((resolve, reject, notify) => {
    for (let i = 0, len = values.length; i < len; i++) {
      NP.resolve(values[i]).then(resolve, reject, notify)
    }
  })
}

export default NP
