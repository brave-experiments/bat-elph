'use strict'

var expect = require('chai').expect
var assert = require('assert')

var elph = require('../elph')



describe('Powerset tester', function() {
  describe('make a decent powertest example', function() {
    it('powerset deep test', function(){
assert.deepEqual(elph.powersetNNil([2,3,3,5,6]), [ [ 6 ], [ 5 ],  [ 5, 6 ],  [ 3 ],  [ 3, 6 ],  [ 3, 5 ],  [ 3, 5, 6 ],  [ 3 ],  [ 3, 6 ],  [ 3, 5 ],  [ 3, 5, 6 ],  [ 3, 3 ],  [ 3, 3, 6 ],  [ 3, 3, 5 ],  [ 3, 3, 5, 6 ],  [ 2 ],  [ 2, 6 ],  [ 2, 5 ],  [ 2, 5, 6 ],  [ 2, 3 ],  [ 2, 3, 6 ],  [ 2, 3, 5 ],  [ 2, 3, 5, 6 ],  [ 2, 3 ],  [ 2, 3, 6 ],  [ 2, 3, 5 ],  [ 2, 3, 5, 6 ],  [ 2, 3, 3 ],  [ 2, 3, 3, 6 ],  [ 2, 3, 3, 5 ],  [ 2, 3, 3, 5, 6 ] ])
    });
  });
});

describe('Entropy tester', function() {
  describe(' 3 reliable entropy examples', function() {
    it('Entropy test', function(){
      assert.equal(elph.reliableEntropy({'A':6}),0.5916727785823275)
      assert.equal(elph.reliableEntropy({'A':6,'B':10,'C':1}),1.4627552262645034)
      assert.equal(elph.reliableEntropy({'A':6,'B':100,'C':1}),0.4595597801097703)
    });
  });
});

describe('Array intersection tester', function() {
  describe('Why there is no arrayIntersect in js ... it is a mystery', function() {
    it('Array Intersect', function(){
      assert.deepEqual(elph.arrayIntersect([1,2,3],[2,5,6,7]),[2])
      assert.deepEqual(elph.arrayIntersect([1,2,3],[2,5,2,6,7]),[2])
      assert.deepEqual(elph.arrayIntersect([2,5,2,6,7],[1,2,3]),[2])
      assert.deepEqual(elph.arrayIntersect([5,6,7],[1,2,3]),[])
      assert.deepEqual(elph.arrayIntersect([5,6,7,1,2],[1,2,3]),[1,2])
    });
  });
});

describe('Online ELPH object', function() {
  describe('OO ELPH test', function() {
    it('initialize', function(){
      var aobj = elph.initOnlineELPH(5)
      assert.deepEqual({ hspace: {}, stm: [], preds: [], predEnt: [], stmSz: 5, predSz: 1000,  thresh: 1 },aobj)
      aobj = elph
    });
  });
});


describe('Online Observation', function() {
  describe('Observation test', function() {
    it('several obs update checks', function(){
      assert.deepEqual(elph.observed({},['a','b'],'a'), { b: { a: 1 }, a: { a: 1 }, 'a,b': { a: 1 } })
      assert.deepEqual(elph.observed({},['a','b','c'],'a'), { c: { a: 1 },  b: { a: 1 },  'b,c': { a: 1 },  a: { a: 1 },  'a,c': { a: 1 },  'a,b': { a: 1 },  'a,b,c': { a: 1 } })
      var hspc = elph.observed({},['a','b'],'a')
      assert.deepEqual(elph.observed(hspc,['a','b','a'],'a'), { b: { a: 2 },  a: { a: 3 },  'a,b': { a: 2 },  'b,a': { a: 1 },  'a,a': { a: 1 },  'a,b,a': { a: 1 } })
    });
  });
});


describe('Online OO prediction', function() {
  describe('Long update and Prediction test', function() {
    it('several obs pred checks', function(){
      let a = 'AABAABAABAABAABAABAACAACAACAACAACAAC'
      let seq = a.split('')
      var el = elph.initOnlineELPH(3)
      var pred = []
      for(var i in seq) {
        pred[i] = elph.predictOnlineELPH(el)
        el = elph.updateOnlineELPH(seq[i],el)
      }
      assert.deepEqual(el,{ hspace:    { A: { A: 45, B: 12, C: 12 },     'A,A': { B: 6, A: 22, C: 6 },     B: { A: 12, B: 5, C: 1 },     'A,B': { A: 18 },     'A,A,B': { A: 6 },     'B,A': { A: 6, B: 10, C: 2 },     'A,B,A': { A: 6 },     'B,A,A': { B: 5, C: 1 },     C: { A: 10, C: 5 },     'A,C': { A: 15 },     'A,A,C': { A: 5 },     'C,A': { A: 5, C: 10 },     'A,C,A': { A: 5 },     'C,A,A': { C: 5 } },  stm: [ 'A', 'A', 'C' ],  preds: [], predEnt: [], stmSz: 3,  predSz: 1000, thresh: 1 })
//    assert.deepEqual(pred, [ NaN,  NaN,  'A',  'B',  'A',  'A',  'A',  'A',  'B',  'A',  'A',  'B',  'A',  'A',  'B',  'A',  'A',  'B',  'A',  'A',  'B',  'A',  'A',  'A',  'A',  'A',  'C',  'A',  'A',  'C',  'A',  'A',  'C',  'A',  'A',  'C' ] ); // TODO Fix this; also check
    });
  });
});
