'use strict'

// why on earth isn't this a js primitive for vectors?
// potential optim: sort and https://gist.github.com/matthewkastor/4602551
function arrayIntersect (A, B) {
  let setA = new Set(A)
  let setB = new Set(B)
  var intersection = new Set()
  for (var elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem)
    }
  }
  return [...intersection]
}

// define array functions
function vectorSum (v) {
  return v.reduce((x, y) => x + y)
}

// looking at stuff like this; I should have written this in C++ and node-gyp
// for, like, clarity and brevity
function vectorMaxIdx (v) {
  return v.reduce((im, x, i, arr) => x > arr[im] ? i : im, 0)
}

function vectorMinIdx (v) {
  return v.reduce((im, x, i, arr) => x < arr[im] ? i : im, 0)
}

// returns the max symbol for symbol value objects
function maxCnt (x) {
  let out = Object.keys(x)
  return out[vectorMaxIdx(Object.values(x))]
}

// accumulate counts of keys
function accumHash (x, key) {
  if (typeof (x) === 'undefined') {
    x = {}
  }
  if (x.hasOwnProperty(key)) {
    x[key] = x[key] + 1
  } else {
    x[key] = 1
  }
  return x
}

// doesn't chop; only removes 1 symbol at a time
function pushRing (ring, symb, limit) {
  ring.push(symb)
  let l = ring.length
  if (l > limit) {
    ring.splice(0, 1)
  }
  return ring
}

// this is a terrible hack, but rely on it for keys and sets of keys
function flatPSNNil (stm) {
  let tmp = powersetNNil(stm)
  let out = {}
  for (var i in tmp) {
    out[tmp[i]] = 0
  }
  return Object.keys(out)
}

// Powerset returns substring possibilities; drop the nil set
function powersetNNil (stm) {
  let tmp = powerset(stm)
  return tmp.slice(1, tmp.length) // why doesn't js have cdr?
}

function powerset (xs) {
  return xs.reduceRight((a, x) => a.concat(a.map(y => [x].concat(y))), [
           []
  ])
}

// end utility functions

// reliableEntropy is the Shannon Entropy with the total always being 1 for hot init
function reliableEntropy (pspace) {
  let tfreq = vectorSum(Object.values(pspace)) + 1
  let hrel = -(1 / tfreq) * Math.log2(1 / tfreq)
  for (var freq in pspace) {
    var tmp = pspace[freq] / tfreq
    hrel -= tmp * Math.log2(tmp)
  }
  return hrel
}

/*
// don't really need this here
function shannonEntropy (pspace) {
  let tfreq = vectorSum(Object.values(pspace))
  let hrel = -(1 / tfreq) * Math.log2(1 / tfreq)
  for (var f in pspace) {
    var tmp = pspace[f] / tfreq
    hrel -= tmp * Math.log2(tmp)
  }
  return hrel
}
*/

// observe a character
function observed (hspace, stm, obs) {
  let hspaceKeys = powersetNNil(stm)
  for (var key in hspaceKeys) {
    hspace[hspaceKeys[key]] = accumHash(hspace[hspaceKeys[key]], obs)
  }
  return hspace
}

// predict next character
function predict (hspace, stm) {
  let liveOnes = arrayIntersect(flatPSNNil(stm), Object.keys(hspace))
  var out = {symbol: NaN, ent: Infinity}
  if (liveOnes.length > 0) {
    let h = []
    for (var i in liveOnes) {
      h[i] = reliableEntropy(hspace[liveOnes[i]])
    }
    let idx = vectorMinIdx(h)
    out = {symbol: maxCnt(hspace[liveOnes[idx]]), ent: h[idx]}
  }
  return out
}

// TODO integrate this with observation/update/predict?
function pruneHspaceBulk (hspace, thresh = 1.0) {
  for (var key in hspace) {
    if (reliableEntropy(hspace[key]) > thresh) {
      delete hspace[key]
    }
  }
  return hspace
}

// containerization of base functions
// not so sure on predRing utility, but throwing it in there anyway for now
function initOnlineELPH (stmSz = 7, thresh = 1.0, predRing = 1000) {
  if (stmSz > 20) {
    throw new Error('arbitrary cutoff for hspace explosion')
  } else {
    return {hspace: {},
      stm: [],
      preds: [],
      predEnt: [],
      stmSz: stmSz,
      predSz: predRing,
      thresh: thresh}
  }
}

function updateOnlineELPH (token, elph) {
  elph.hspace = observed(elph.hspace, elph.stm, token)
  elph.stm = pushRing(elph.stm, token, elph.stmSz)
  return elph
}

function predictOnlineELPH (elph) {
  let xx = predict(elph.hspace, elph.stm)
  return xx.symbol
  // TODO pushRing of entropy and  rolling window of predictions
}

function vacuumELPH (elph) {
  elph.hspace = pruneHspaceBulk(elph.hspace, elph.thresh)
  return elph // doesn't need to return; trims the object in place because js scoping is ... I think because it's 'var'
  // TODO pushRing of entropy and  rolling window of predictions
}

// useful for 'fitting'
function setBulkELPH (slist, elph) {
  for (var i in slist) {
    elph = updateOnlineELPH(slist[i], elph)
  }
  return elph
}

module.exports = {
  powersetNNil: powersetNNil,
  initOnlineELPH: initOnlineELPH,
  updateOnlineELPH: updateOnlineELPH,
  predictOnlineELPH: predictOnlineELPH,
  setBulkELPH: setBulkELPH,
  vacuumELPH: vacuumELPH,
  reliableEntropy: reliableEntropy,
  arrayIntersect: arrayIntersect,
  observed: observed

}
