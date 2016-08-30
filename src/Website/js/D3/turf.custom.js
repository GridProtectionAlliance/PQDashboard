(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2010, Jason Davies.
 *
 * All rights reserved.  This code is based on Bradley White's Java version,
 * which is in turn based on Nicholas Yue's C++ version, which in turn is based
 * on Paul D. Bourke's original Fortran version.  See below for the respective
 * copyright notices.
 *
 * See http://local.wasp.uwa.edu.au/~pbourke/papers/conrec/ for the original
 * paper by Paul D. Bourke.
 *
 * The vector conversion code is based on http://apptree.net/conrec.htm by
 * Graham Cox.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Copyright (c) 1996-1997 Nicholas Yue
 *
 * This software is copyrighted by Nicholas Yue. This code is based on Paul D.
 * Bourke's CONREC.F routine.
 *
 * The authors hereby grant permission to use, copy, and distribute this
 * software and its documentation for any purpose, provided that existing
 * copyright notices are retained in all copies and that this notice is
 * included verbatim in any distributions. Additionally, the authors grant
 * permission to modify this software and its documentation for any purpose,
 * provided that such modifications are not distributed without the explicit
 * consent of the authors and that existing copyright notices are retained in
 * all copies. Some of the algorithms implemented by this software are
 * patented, observe all applicable patent law.
 *
 * IN NO EVENT SHALL THE AUTHORS OR DISTRIBUTORS BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT
 * OF THE USE OF THIS SOFTWARE, ITS DOCUMENTATION, OR ANY DERIVATIVES THEREOF,
 * EVEN IF THE AUTHORS HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * THE AUTHORS AND DISTRIBUTORS SPECIFICALLY DISCLAIM ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.  THIS SOFTWARE IS
 * PROVIDED ON AN "AS IS" BASIS, AND THE AUTHORS AND DISTRIBUTORS HAVE NO
 * OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
 * MODIFICATIONS.
 */
module.exports = Conrec;

var EPSILON = 1e-10;

function pointsEqual(a, b) {
  var x = a.x - b.x, y = a.y - b.y;
  return x * x + y * y < EPSILON;
}

function reverseList(list) {
  var pp = list.head;

  while (pp) {
    // swap prev/next pointers
    var temp = pp.next;
    pp.next = pp.prev;
    pp.prev = temp;

    // continue through the list
    pp = temp;
  }

  // swap head/tail pointers
  var temp = list.head;
  list.head = list.tail;
  list.tail = temp;
}

function ContourBuilder(level) {
  this.level = level;
  this.s = null;
  this.count = 0;
}
ContourBuilder.prototype.remove_seq = function(list) {
  // if list is the first item, static ptr s is updated
  if (list.prev) {
    list.prev.next = list.next;
  } else {
    this.s = list.next;
  }

  if (list.next) {
    list.next.prev = list.prev;
  }
  --this.count;
}
ContourBuilder.prototype.addSegment = function(a, b) {
  var ss = this.s;
  var ma = null;
  var mb = null;
  var prependA = false;
  var prependB = false;

  while (ss) {
    if (ma == null) {
      // no match for a yet
      if (pointsEqual(a, ss.head.p)) {
        ma = ss;
        prependA = true;
      } else if (pointsEqual(a, ss.tail.p)) {
        ma = ss;
      }
    }
    if (mb == null) {
      // no match for b yet
      if (pointsEqual(b, ss.head.p)) {
        mb = ss;
        prependB = true;
      } else if (pointsEqual(b, ss.tail.p)) {
        mb = ss;
      }
    }
    // if we matched both no need to continue searching
    if (mb != null && ma != null) {
      break;
    } else {
      ss = ss.next;
    }
  }

  // c is the case selector based on which of ma and/or mb are set
  var c = ((ma != null) ? 1 : 0) | ((mb != null) ? 2 : 0);

  switch(c) {
    case 0:   // both unmatched, add as new sequence
      var aa = {p: a, prev: null};
      var bb = {p: b, next: null};
      aa.next = bb;
      bb.prev = aa;

      // create sequence element and push onto head of main list. The order
      // of items in this list is unimportant
      ma = {head: aa, tail: bb, next: this.s, prev: null, closed: false};
      if (this.s) {
        this.s.prev = ma;
      }
      this.s = ma;

      ++this.count;    // not essential - tracks number of unmerged sequences
    break;

    case 1:   // a matched, b did not - thus b extends sequence ma
      var pp = {p: b};

      if (prependA) {
        pp.next = ma.head;
        pp.prev = null;
        ma.head.prev = pp;
        ma.head = pp;
      } else {
        pp.next = null;
        pp.prev = ma.tail;
        ma.tail.next = pp;
        ma.tail = pp;
      }
    break;

    case 2:   // b matched, a did not - thus a extends sequence mb
      var pp = {p: a};

      if (prependB) {
        pp.next = mb.head;
        pp.prev = null;
        mb.head.prev = pp;
        mb.head = pp;
      } else {
        pp.next = null;
        pp.prev = mb.tail;
        mb.tail.next = pp;
        mb.tail = pp;
      }
    break;

    case 3:   // both matched, can merge sequences
      // if the sequences are the same, do nothing, as we are simply closing this path (could set a flag)

      if (ma === mb) {
        var pp = {p: ma.tail.p, next: ma.head, prev: null};
        ma.head.prev = pp;
        ma.head = pp;
        ma.closed = true;
        break;
      }

      // there are 4 ways the sequence pair can be joined. The current setting of prependA and
      // prependB will tell us which type of join is needed. For head/head and tail/tail joins
      // one sequence needs to be reversed
      switch((prependA ? 1 : 0) | (prependB ? 2 : 0)) {
        case 0:   // tail-tail
          // reverse ma and append to mb
          reverseList(ma);
          // fall through to head/tail case
        case 1:   // head-tail
          // ma is appended to mb and ma discarded
          mb.tail.next = ma.head;
          ma.head.prev = mb.tail;
          mb.tail = ma.tail;

          //discard ma sequence record
          this.remove_seq(ma);
        break;

        case 3:   // head-head
          // reverse ma and append mb to it
          reverseList(ma);
          // fall through to tail/head case
        case 2:   // tail-head
          // mb is appended to ma and mb is discarded
          ma.tail.next = mb.head;
          mb.head.prev = ma.tail;
          ma.tail = mb.tail;

          //discard mb sequence record
          this.remove_seq(mb);
      break;
    }
  }
}

/**
 * Implements CONREC.
 *
 * @param {function} drawContour function for drawing contour.  Defaults to a
 *                               custom "contour builder", which populates the
 *                               contours property.
 */
function Conrec(drawContour) {
  if (!drawContour) {
    var c = this;
    c.contours = {};
    /**
     * drawContour - interface for implementing the user supplied method to
     * render the countours.
     *
     * Draws a line between the start and end coordinates.
     *
     * @param startX    - start coordinate for X
     * @param startY    - start coordinate for Y
     * @param endX      - end coordinate for X
     * @param endY      - end coordinate for Y
     * @param contourLevel - Contour level for line.
     */
    this.drawContour = function(startX, startY, endX, endY, contourLevel, k) {
      var cb = c.contours[k];
      if (!cb) {
        cb = c.contours[k] = new ContourBuilder(contourLevel);
      }
      cb.addSegment({x: startX, y: startY}, {x: endX, y: endY});
    }
    this.contourList = function() {
      var l = [];
      var a = c.contours;
      for (var k in a) {
        var s = a[k].s;
        var level = a[k].level;
        while (s) {
          var h = s.head;
          var l2 = [];
          l2.level = level;
          l2.k = k;
          while (h && h.p) {
            l2.push(h.p);
            h = h.next;
          }
          l.push(l2);
          s = s.next;
        }
      }
      l.sort(function(a, b) { return a.k - b.k });
      return l;
    }
  } else {
    this.drawContour = drawContour;
  }
  this.h  = new Array(5);
  this.sh = new Array(5);
  this.xh = new Array(5);
  this.yh = new Array(5);
}

/**
 * contour is a contouring subroutine for rectangularily spaced data
 *
 * It emits calls to a line drawing subroutine supplied by the user which
 * draws a contour map corresponding to real*4data on a randomly spaced
 * rectangular grid. The coordinates emitted are in the same units given in
 * the x() and y() arrays.
 *
 * Any number of contour levels may be specified but they must be in order of
 * increasing value.
 *
 *
 * @param {number[][]} d - matrix of data to contour
 * @param {number} ilb,iub,jlb,jub - index bounds of data matrix
 *
 *             The following two, one dimensional arrays (x and y) contain
 *             the horizontal and vertical coordinates of each sample points.
 * @param {number[]} x  - data matrix column coordinates
 * @param {number[]} y  - data matrix row coordinates
 * @param {number} nc   - number of contour levels
 * @param {number[]} z  - contour levels in increasing order.
 */
Conrec.prototype.contour = function(d, ilb, iub, jlb, jub, x, y, nc, z) {
  var h = this.h, sh = this.sh, xh = this.xh, yh = this.yh;
  var drawContour = this.drawContour;
  this.contours = {};

  /** private */
  var xsect = function(p1, p2){
    return (h[p2]*xh[p1]-h[p1]*xh[p2])/(h[p2]-h[p1]);
  }

  var ysect = function(p1, p2){
    return (h[p2]*yh[p1]-h[p1]*yh[p2])/(h[p2]-h[p1]);
  }
  var m1;
  var m2;
  var m3;
  var case_value;
  var dmin;
  var dmax;
  var x1 = 0.0;
  var x2 = 0.0;
  var y1 = 0.0;
  var y2 = 0.0;

  // The indexing of im and jm should be noted as it has to start from zero
  // unlike the fortran counter part
  var im = [0, 1, 1, 0];
  var jm = [0, 0, 1, 1];

  // Note that castab is arranged differently from the FORTRAN code because
  // Fortran and C/C++ arrays are transposed of each other, in this case
  // it is more tricky as castab is in 3 dimensions
  var castab = [
    [
      [0, 0, 8], [0, 2, 5], [7, 6, 9]
    ],
    [
      [0, 3, 4], [1, 3, 1], [4, 3, 0]
    ],
    [
      [9, 6, 7], [5, 2, 0], [8, 0, 0]
    ]
  ];

  for (var j=(jub-1);j>=jlb;j--) {
    for (var i=ilb;i<=iub-1;i++) {
      var temp1, temp2;
      temp1 = Math.min(d[i][j],d[i][j+1]);
      temp2 = Math.min(d[i+1][j],d[i+1][j+1]);
      dmin  = Math.min(temp1,temp2);
      temp1 = Math.max(d[i][j],d[i][j+1]);
      temp2 = Math.max(d[i+1][j],d[i+1][j+1]);
      dmax  = Math.max(temp1,temp2);

      if (dmax>=z[0]&&dmin<=z[nc-1]) {
        for (var k=0;k<nc;k++) {
          if (z[k]>=dmin&&z[k]<=dmax) {
            for (var m=4;m>=0;m--) {
              if (m>0) {
                // The indexing of im and jm should be noted as it has to
                // start from zero
                h[m] = d[i+im[m-1]][j+jm[m-1]]-z[k];
                xh[m] = x[i+im[m-1]];
                yh[m] = y[j+jm[m-1]];
              } else {
                h[0] = 0.25*(h[1]+h[2]+h[3]+h[4]);
                xh[0]=0.5*(x[i]+x[i+1]);
                yh[0]=0.5*(y[j]+y[j+1]);
              }
              if (h[m]>EPSILON) {
                sh[m] = 1;
              } else if (h[m]<-EPSILON) {
                sh[m] = -1;
              } else
                sh[m] = 0;
            }
            //
            // Note: at this stage the relative heights of the corners and the
            // centre are in the h array, and the corresponding coordinates are
            // in the xh and yh arrays. The centre of the box is indexed by 0
            // and the 4 corners by 1 to 4 as shown below.
            // Each triangle is then indexed by the parameter m, and the 3
            // vertices of each triangle are indexed by parameters m1,m2,and
            // m3.
            // It is assumed that the centre of the box is always vertex 2
            // though this isimportant only when all 3 vertices lie exactly on
            // the same contour level, in which case only the side of the box
            // is drawn.
            //
            //
            //      vertex 4 +-------------------+ vertex 3
            //               | \               / |
            //               |   \    m-3    /   |
            //               |     \       /     |
            //               |       \   /       |
            //               |  m=2    X   m=2   |       the centre is vertex 0
            //               |       /   \       |
            //               |     /       \     |
            //               |   /    m=1    \   |
            //               | /               \ |
            //      vertex 1 +-------------------+ vertex 2
            //
            //
            //
            //               Scan each triangle in the box
            //
            for (m=1;m<=4;m++) {
              m1 = m;
              m2 = 0;
              if (m!=4) {
                  m3 = m+1;
              } else {
                  m3 = 1;
              }
              case_value = castab[sh[m1]+1][sh[m2]+1][sh[m3]+1];
              if (case_value!=0) {
                switch (case_value) {
                  case 1: // Line between vertices 1 and 2
                    x1=xh[m1];
                    y1=yh[m1];
                    x2=xh[m2];
                    y2=yh[m2];
                    break;
                  case 2: // Line between vertices 2 and 3
                    x1=xh[m2];
                    y1=yh[m2];
                    x2=xh[m3];
                    y2=yh[m3];
                    break;
                  case 3: // Line between vertices 3 and 1
                    x1=xh[m3];
                    y1=yh[m3];
                    x2=xh[m1];
                    y2=yh[m1];
                    break;
                  case 4: // Line between vertex 1 and side 2-3
                    x1=xh[m1];
                    y1=yh[m1];
                    x2=xsect(m2,m3);
                    y2=ysect(m2,m3);
                    break;
                  case 5: // Line between vertex 2 and side 3-1
                    x1=xh[m2];
                    y1=yh[m2];
                    x2=xsect(m3,m1);
                    y2=ysect(m3,m1);
                    break;
                  case 6: //  Line between vertex 3 and side 1-2
                    x1=xh[m3];
                    y1=yh[m3];
                    x2=xsect(m1,m2);
                    y2=ysect(m1,m2);
                    break;
                  case 7: // Line between sides 1-2 and 2-3
                    x1=xsect(m1,m2);
                    y1=ysect(m1,m2);
                    x2=xsect(m2,m3);
                    y2=ysect(m2,m3);
                    break;
                  case 8: // Line between sides 2-3 and 3-1
                    x1=xsect(m2,m3);
                    y1=ysect(m2,m3);
                    x2=xsect(m3,m1);
                    y2=ysect(m3,m1);
                    break;
                  case 9: // Line between sides 3-1 and 1-2
                    x1=xsect(m3,m1);
                    y1=ysect(m3,m1);
                    x2=xsect(m1,m2);
                    y2=ysect(m1,m2);
                    break;
                  default:
                    break;
                }
                // Put your processing code here and comment out the printf
                //printf("%f %f %f %f %f\n",x1,y1,x2,y2,z[k]);
                drawContour(x1,y1,x2,y2,z[k],k);
              }
            }
          }
        }
      }
    }
  }
}


},{}],2:[function(require,module,exports){
//https://github.com/jasondavies/conrec.js
//http://stackoverflow.com/questions/263305/drawing-a-topographical-map
var tin = require('turf-tin');
var inside = require('turf-inside');
var grid = require('turf-grid');
var extent = require('turf-extent');
var planepoint = require('turf-planepoint');
var featurecollection = require('turf-featurecollection');
var linestring = require('turf-linestring');
var polygon = require('turf-polygon');
var point = require('turf-point');
var square = require('turf-square');
var size = require('turf-size');
var Conrec = require('./conrec.js');

/**
 * Takes a {@link FeatureCollection} of {@link Point} features with z-values and an array of
 * value breaks and generates filled contour isobands.
 *
 * @module turf/isobands
 * @category interpolation
 * @param {FeatureCollection} points a FeeatureCollection of {@link Point} features
 * @param {string} z the property name in `points` from which z-values will be pulled
 * @param {number} resolution resolution of the underlying grid
 * @param {Array<number>} breaks where to draw contours
 * @returns {FeatureCollection} a FeatureCollection of {@link Polygon} features representing isobands
 * @example
 * // create random points with random
 * // z-values in their properties
 * var points = turf.random('point', 100, {
 *   bbox: [0, 30, 20, 50]
 * });
 * for (var i = 0; i < points.features.length; i++) {
 *   points.features[i].properties.z = Math.random() * 10;
 * }
 * var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * var isolined = turf.isobands(points, 'z', 15, breaks);
 * //=isolined
 */
module.exports = function(points, z, resolution, breaks){
  var addEdgesResult = addEdges(points, z, resolution);

  var tinResult = tin(points, z);
  var extentBBox = extent(points);
  var squareBBox = square(extentBBox);
  var gridResult = grid(squareBBox, resolution);
  var data = [];

  gridResult.features.forEach(function(pt){
    tinResult.features.forEach(function(triangle){
      if (inside(pt, triangle)) {
        pt.properties = {};
        pt.properties[z] = planepoint(pt, triangle);
      }
    });
    if(!pt.properties){
      pt.properties = {};
      pt.properties[z] = -100;
    }
  });

  var depth = Math.sqrt(gridResult.features.length);
  for (var x=0; x<depth; x++){
    var xGroup = gridResult.features.slice(x * depth, (x + 1) * depth);
    var xFlat = [];
    xGroup.forEach(function(verticalPoint){
      if(verticalPoint.properties){
        xFlat.push(verticalPoint.properties[z]);
      } else{
        xFlat.push(0);
      }
    });
    data.push(xFlat);
  }
  var interval = (squareBBox[2] - squareBBox[0]) / depth;
  var xCoordinates = [];
  var yCoordinates = [];
  for (var x=0; x<depth; x++){
    xCoordinates.push(x * interval + squareBBox[0]);
    yCoordinates.push(x * interval + squareBBox[1]);
  }

  //change zero breaks to .01 to deal with bug in conrec algorithm
  breaks = breaks.map(function(num) {
    if(num === 0){
      return 0.01;
    }
    else{
      return num;
    }
  });
  //deduplicate breaks
  breaks = unique(breaks);

  var c = new Conrec();
  c.contour(data, 0, resolution, 0, resolution, xCoordinates, yCoordinates, breaks.length, breaks);
  var contourList = c.contourList();

  var fc = featurecollection([]);
  contourList.forEach(function(c){
    if(c.length > 2){
      var polyCoordinates = [];
      c.forEach(function(coord){
        polyCoordinates.push([coord.x, coord.y]);
      });
      polyCoordinates.push([c[0].x, c[0].y]);
      var poly = polygon([polyCoordinates]);
      poly.properties = {};
      poly.properties[z] = c.level;
      fc.features.push(poly);
    }
  });

  return fc;
};

function addEdges(points, z, resolution){
  var extentBBox = extent(points),
    sizeResult;

  var squareBBox = square(extentBBox);
  var sizeBBox = size(squareBBox, 0.35);

  var edgeDistance = sizeBBox[2] - sizeBBox[0];
  var extendDistance = edgeDistance / resolution;

  var xmin = sizeBBox[0];
  var ymin = sizeBBox[1];
  var xmax = sizeBBox[2];
  var ymax = sizeBBox[3];

  //left
  var left = [[xmin, ymin],[xmin, ymax]];
  for(var i = 0; i<=resolution; i++){
    var pt = point([xmin, ymin + (extendDistance * i)]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  var i, pt;

  //bottom
  var bottom = [[xmin, ymin],[xmax, ymin]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmin + (extendDistance * i), ymin]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  //right
  var right = [[xmax, ymin],[xmax, ymax]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmax, ymin + (extendDistance * i)]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  //top
  var top = [[xmin, ymax],[xmax, ymax]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmin + (extendDistance * i), ymax]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  return points;
}

function unique(a) {
  return a.reduce(function(p, c) {
      if (p.indexOf(c) < 0) p.push(c);
      return p;
  }, []);
}

},{"./conrec.js":1,"turf-extent":3,"turf-featurecollection":5,"turf-grid":6,"turf-inside":7,"turf-linestring":8,"turf-planepoint":9,"turf-point":10,"turf-polygon":11,"turf-size":12,"turf-square":13,"turf-tin":17}],3:[function(require,module,exports){
var each = require('turf-meta').coordEach;

/**
 * Takes any {@link GeoJSON} object, calculates the extent of all input features, and returns a bounding box.
 *
 * @module turf/extent
 * @category measurement
 * @param {GeoJSON} input any valid GeoJSON Object
 * @return {Array<number>} the bounding box of `input` given
 * as an array in WSEN order (west, south, east, north)
 * @example
 * var input = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.175329, 22.2524]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.170007, 22.267969]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.200649, 22.274641]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.186744, 22.265745]
 *       }
 *     }
 *   ]
 * };
 *
 * var bbox = turf.extent(input);
 *
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * var resultFeatures = input.features.concat(bboxPolygon);
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": resultFeatures
 * };
 *
 * //=result
 */
module.exports = function(layer) {
    var extent = [Infinity, Infinity, -Infinity, -Infinity];
    each(layer, function(coord) {
      if (extent[0] > coord[0]) extent[0] = coord[0];
      if (extent[1] > coord[1]) extent[1] = coord[1];
      if (extent[2] < coord[0]) extent[2] = coord[0];
      if (extent[3] < coord[1]) extent[3] = coord[1];
    });
    return extent;
};

},{"turf-meta":4}],4:[function(require,module,exports){
/**
 * Lazily iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var point = { type: 'Point', coordinates: [0, 0] };
 * coordEach(point, function(coords) {
 *   // coords is equal to [0, 0]
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
  var i, j, k, g, geometry, stopG, coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    isGeometryCollection,
    isFeatureCollection = layer.type === 'FeatureCollection',
    isFeature = layer.type === 'Feature',
    stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {

    geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
    isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (g = 0; g < stopG; g++) {

      geometry = isGeometryCollection ?
          geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
      coords = geometry.coordinates;

      wrapShrink = (excludeWrapCoord &&
        (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
        1 : 0;

      if (geometry.type === 'Point') {
        callback(coords);
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        for (j = 0; j < coords.length; j++) callback(coords[j]);
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length - wrapShrink; k++)
            callback(coords[j][k]);
      } else if (geometry.type === 'MultiPolygon') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length; k++)
            for (l = 0; l < coords[j][k].length - wrapShrink; l++)
              callback(coords[j][k][l]);
      } else {
        throw new Error('Unknown Geometry Type');
      }
    }
  }
}
module.exports.coordEach = coordEach;

/**
 * Lazily reduce coordinates in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all coordinates is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, value) and returns
 * a new memo
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @param {*} memo the starting value of memo: can be any type.
 */
function coordReduce(layer, callback, memo, excludeWrapCoord) {
  coordEach(layer, function(coord) {
    memo = callback(memo, coord);
  }, excludeWrapCoord);
  return memo;
}
module.exports.coordReduce = coordReduce;

/**
 * Lazily iterate over property objects in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Feature', geometry: null, properties: { foo: 1 } };
 * propEach(point, function(props) {
 *   // props is equal to { foo: 1}
 * });
 */
function propEach(layer, callback) {
  var i;
  switch (layer.type) {
      case 'FeatureCollection':
        features = layer.features;
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties);
        }
        break;
      case 'Feature':
        callback(layer.properties);
        break;
  }
}
module.exports.propEach = propEach;

/**
 * Lazily reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, coord) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 */
function propReduce(layer, callback, memo) {
  propEach(layer, function(prop) {
    memo = callback(memo, prop);
  });
  return memo;
}
module.exports.propReduce = propReduce;

},{}],5:[function(require,module,exports){
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}
 *
 * @module turf/featurecollection
 * @category helper
 * @param {Feature} features input Features
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var fc = turf.featurecollection(features);
 *
 * //=fc
 */
module.exports = function(features){
  return {
    type: "FeatureCollection",
    features: features
  };
};

},{}],6:[function(require,module,exports){
var point = require('turf-point');

/**
 * Takes a bounding box and a cell depth and returns a {@link FeatureCollection} of {@link Point} features in a grid.
 *
 * @module turf/grid
 * @category interpolation
 * @param {Array<number>} extent extent in [minX, minY, maxX, maxY] order
 * @param {Number} depth how many cells to output
 * @return {FeatureCollection} grid as FeatureCollection with {@link Point} features
 * @example
 * var extent = [-70.823364, -33.553984, -70.473175, -33.302986];
 * var depth = 10;
 *
 * var grid = turf.grid(extent, depth);
 *
 * //=grid
 */
module.exports = function(extents, depth) {
  var xmin = extents[0];
  var ymin = extents[1];
  var xmax = extents[2];
  var ymax = extents[3];
  var interval = (xmax - xmin) / depth;
  var coords = [];
  var fc = {
    type: 'FeatureCollection',
    features: []
  };

  for (var x=0; x<=depth; x++){
    for (var y=0;y<=depth; y++){
      fc.features.push(point([(x * interval) + xmin, (y * interval) + ymin]));
    }
  }
  return fc;
}

},{"turf-point":10}],7:[function(require,module,exports){
// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

/**
 * Takes a {@link Point} feature and a {@link Polygon} feature and determines if the Point resides inside the Polygon. The Polygon can
 * be convex or concave. The function accepts any valid Polygon or {@link MultiPolygon}
 * and accounts for holes.
 *
 * @module turf/inside
 * @category joins
 * @param {Point} point a Point feature
 * @param {Polygon} polygon a Polygon feature
 * @return {Boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt1 = {
 *   "type": "Feature",
 *   "properties": {
 *     "marker-color": "#f00"
 *   },
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-111.467285, 40.75766]
 *   }
 * };
 * var pt2 = {
 *   "type": "Feature",
 *   "properties": {
 *     "marker-color": "#0f0"
 *   },
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-111.873779, 40.647303]
 *   }
 * };
 * var poly = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Polygon",
 *     "coordinates": [[
 *       [-112.074279, 40.52215],
 *       [-112.074279, 40.853293],
 *       [-111.610107, 40.853293],
 *       [-111.610107, 40.52215],
 *       [-112.074279, 40.52215]
 *     ]]
 *   }
 * };
 *
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [pt1, pt2, poly]
 * };
 *
 * //=features
 *
 * var isInside1 = turf.inside(pt1, poly);
 * //=isInside1
 *
 * var isInside2 = turf.inside(pt2, poly);
 * //=isInside2
 */
module.exports = function(point, polygon) {
  var polys = polygon.geometry.coordinates;
  var pt = [point.geometry.coordinates[0], point.geometry.coordinates[1]];
  // normalize to multipolygon
  if(polygon.geometry.type === 'Polygon') polys = [polys];

  var insidePoly = false;
  var i = 0;
  while (i < polys.length && !insidePoly) {
    // check if it is in the outer ring first
    if(inRing(pt, polys[i][0])) {
      var inHole = false;
      var k = 1;
      // check for the point in any of the holes
      while(k < polys[i].length && !inHole) {
        if(inRing(pt, polys[i][k])) {
          inHole = true;
        }
        k++;
      }
      if(!inHole) insidePoly = true;
    }
    i++;
  }
  return insidePoly;
}

// pt is [x,y] and ring is [[x,y], [x,y],..]
function inRing (pt, ring) {
  var isInside = false;
  for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    var xi = ring[i][0], yi = ring[i][1];
    var xj = ring[j][0], yj = ring[j][1];
    
    var intersect = ((yi > pt[1]) != (yj > pt[1]))
        && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}


},{}],8:[function(require,module,exports){
/**
 * Creates a {@link LineString} {@link Feature} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @module turf/linestring
 * @category helper
 * @param {Array<Array<Number>>} coordinates an array of Positions
 * @param {Object} properties an Object of key-value pairs to add as properties
 * @return {LineString} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.linestring([
 *	[-21.964416, 64.148203],
 *	[-21.956176, 64.141316],
 *	[-21.93901, 64.135924],
 *	[-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.linestring([
 *	[-21.929054, 64.127985],
 *	[-21.912918, 64.134726],
 *	[-21.916007, 64.141016],
 * 	[-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
module.exports = function(coordinates, properties){
  if (!coordinates) {
      throw new Error('No coordinates passed');
  }
  return {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": coordinates
    },
    "properties": properties || {}
  };
};

},{}],9:[function(require,module,exports){
/**
 * Takes a triangular plane as a {@link Polygon} feature
 * and a {@link Point} feature within that triangle and returns the z-value
 * at that point. The Polygon needs to have properties `a`, `b`, and `c`
 * that define the values at its three corners.
 *
 * @module turf/planepoint
 * @category interpolation
 * @param {Point} interpolatedPoint the Point for which a z-value will be calculated
 * @param {Polygon} triangle a Polygon feature with three vertices
 * @return {number} the z-value for `interpolatedPoint`
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.3221, 39.529]
 *   }
 * };
 * var point = turf.point([-75.3221, 39.529]);
 * // triangle is a polygon with "a", "b",
 * // and "c" values representing
 * // the values of the coordinates in order.
 * var triangle = {
 *   "type": "Feature",
 *   "properties": {
 *     "a": 11,
 *     "b": 122,
 *     "c": 44
 *   },
 *   "geometry": {
 *     "type": "Polygon",
 *     "coordinates": [[
 *       [-75.1221, 39.57],
 *       [-75.58, 39.18],
 *       [-75.97, 39.86],
 *       [-75.1221, 39.57]
 *     ]]
 *   }
 * };
 *
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [triangle, point]
 * };
 *
 * var zValue = turf.planepoint(point, triangle);
 *
 * //=features
 *
 * //=zValue
 */
module.exports = function(point, triangle){
  var x = point.geometry.coordinates[0],
      y = point.geometry.coordinates[1],
      x1 = triangle.geometry.coordinates[0][0][0],
      y1 = triangle.geometry.coordinates[0][0][1],
      z1 = triangle.properties.a,
      x2 = triangle.geometry.coordinates[0][1][0],
      y2 = triangle.geometry.coordinates[0][1][1],
      z2 = triangle.properties.b,
      x3 = triangle.geometry.coordinates[0][2][0],
      y3 = triangle.geometry.coordinates[0][2][1],
      z3 = triangle.properties.c;

  var z = (z3 * (x-x1) * (y-y2) + z1 * (x-x2) * (y-y3) + z2 * (x-x3) * (y-y1) -
      z2 * (x-x1) * (y-y3) - z3 * (x-x2) * (y-y1) - z1 * (x-x3) * (y-y2)) /
      ((x-x1) * (y-y2) + (x-x2) * (y-y3) +(x-x3) * (y-y1) -
       (x-x1) * (y-y3) - (x-x2) * (y-y1) - (x-x3) * (y-y2));

  return z;
};

},{}],10:[function(require,module,exports){
/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @module turf/point
 * @category helper
 * @param {number} longitude position west to east in decimal degrees
 * @param {number} latitude position south to north in decimal degrees
 * @param {Object} properties an Object that is used as the {@link Feature}'s
 * properties
 * @return {Point} a Point feature
 * @example
 * var pt1 = turf.point([-75.343, 39.984]);
 *
 * //=pt1
 */
var isArray = Array.isArray || function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
module.exports = function(coordinates, properties) {
  if (!isArray(coordinates)) throw new Error('Coordinates must be an array');
  if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: coordinates
    },
    properties: properties || {}
  };
};

},{}],11:[function(require,module,exports){
/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a GeoJSON {@link Polygon} feature.
 *
 * @module turf/polygon
 * @category helper
 * @param {Array<Array<Number>>} rings an array of LinearRings
 * @param {Object} properties an optional properties object
 * @return {Polygon} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the
 * beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *  [-2.275543, 53.464547],
 *  [-2.275543, 53.489271],
 *  [-2.215118, 53.489271],
 *  [-2.215118, 53.464547],
 *  [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
module.exports = function(coordinates, properties){

  if (coordinates === null) throw new Error('No coordinates passed');

  for (var i = 0; i < coordinates.length; i++) {
    var ring = coordinates[i];
    for (var j = 0; j < ring[ring.length - 1].length; j++) {
      if (ring.length < 4) {
        throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
      }
      if (ring[ring.length - 1][j] !== ring[0][j]) {
        throw new Error('First and last Position are not equivalent.');
      }
    }
  }

  var polygon = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": coordinates
    },
    "properties": properties
  };

  if (!polygon.properties) {
    polygon.properties = {};
  }

  return polygon;
};

},{}],12:[function(require,module,exports){
/**
 * Takes a bounding box and returns a new bounding box with a size expanded or contracted
 * by a factor of X.
 *
 * @module turf/size
 * @category measurement
 * @param {Array<number>} bbox a bounding box
 * @param {number} factor the ratio of the new bbox to the input bbox
 * @return {Array<number>} the resized bbox
 * @example
 * var bbox = [0, 0, 10, 10]
 *
 * var resized = turf.size(bbox, 2);
 *
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     turf.bboxPolygon(bbox),
 *     turf.bboxPolygon(resized)
 *   ]
 * };
 *
 * //=features
 */
module.exports = function(bbox, factor){
  var currentXDistance = (bbox[2] - bbox[0]);
  var currentYDistance = (bbox[3] - bbox[1]);
  var newXDistance = currentXDistance * factor;
  var newYDistance = currentYDistance * factor;
  var xChange = newXDistance - currentXDistance;
  var yChange = newYDistance - currentYDistance;

  var lowX = bbox[0] - (xChange / 2);
  var lowY = bbox[1] - (yChange / 2);
  var highX = (xChange / 2) + bbox[2];
  var highY = (yChange / 2) + bbox[3];

  var sized = [lowX, lowY, highX, highY];
  return sized;
}

},{}],13:[function(require,module,exports){
var midpoint = require('turf-midpoint');
var point = require('turf-point');
var distance = require('turf-distance');

/**
 * Takes a bounding box and calculates the minimum square bounding box that would contain the input.
 *
 * @module turf/square
 * @category measurement
 * @param {Array<number>} bbox a bounding box
 * @return {Array<number>} a square surrounding `bbox`
 * @example
 * var bbox = [-20,-20,-15,0];
 *
 * var squared = turf.square(bbox);
 *
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     turf.bboxPolygon(bbox),
 *     turf.bboxPolygon(squared)
 *   ]
 * };
 *
 * //=features
 */
module.exports = function(bbox){
  var squareBbox = [0,0,0,0];
  var lowLeft = point([bbox[0], bbox[1]]);
  var topLeft = point([bbox[0], bbox[3]]);
  var topRight = point([bbox[2], bbox[3]]);
  var lowRight = point([bbox[2], bbox[1]]);

  var horizontalDistance = distance(lowLeft, lowRight, 'miles');
  var verticalDistance = distance(lowLeft, topLeft, 'miles');
  if(horizontalDistance >= verticalDistance){
    squareBbox[0] = bbox[0];
    squareBbox[2] = bbox[2];
    var verticalMidpoint = midpoint(lowLeft, topLeft);
    squareBbox[1] = verticalMidpoint.geometry.coordinates[1] - ((bbox[2] - bbox[0]) / 2);
    squareBbox[3] = verticalMidpoint.geometry.coordinates[1] + ((bbox[2] - bbox[0]) / 2);
    return squareBbox;
  }
  else {
    squareBbox[1] = bbox[1];
    squareBbox[3] = bbox[3];
    var horzontalMidpoint = midpoint(lowLeft, lowRight);
    squareBbox[0] = horzontalMidpoint.geometry.coordinates[0] - ((bbox[3] - bbox[1]) / 2);
    squareBbox[2] = horzontalMidpoint.geometry.coordinates[0] + ((bbox[3] - bbox[1]) / 2);
    return squareBbox;
  }
}


},{"turf-distance":14,"turf-midpoint":16,"turf-point":10}],14:[function(require,module,exports){
var invariant = require('turf-invariant');
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html

/**
 * Takes two {@link Point} features and calculates
 * the distance between them in degress, radians,
 * miles, or kilometers. This uses the
 * [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula)
 * to account for global curvature.
 *
 * @module turf/distance
 * @category measurement
 * @param {Feature} from origin point
 * @param {Feature} to destination point
 * @param {String} [units=kilometers] can be degrees, radians, miles, or kilometers
 * @return {Number} distance between the two points
 * @example
 * var point1 = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.343, 39.984]
 *   }
 * };
 * var point2 = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.534, 39.123]
 *   }
 * };
 * var units = "miles";
 *
 * var points = {
 *   "type": "FeatureCollection",
 *   "features": [point1, point2]
 * };
 *
 * //=points
 *
 * var distance = turf.distance(point1, point2, units);
 *
 * //=distance
 */
module.exports = function(point1, point2, units){
  invariant.featureOf(point1, 'Point', 'distance');
  invariant.featureOf(point2, 'Point', 'distance');
  var coordinates1 = point1.geometry.coordinates;
  var coordinates2 = point2.geometry.coordinates;

  var dLat = toRad(coordinates2[1] - coordinates1[1]);
  var dLon = toRad(coordinates2[0] - coordinates1[0]);
  var lat1 = toRad(coordinates1[1]);
  var lat2 = toRad(coordinates2[1]);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var R;
  switch(units){
    case 'miles':
      R = 3960;
      break;
    case 'kilometers':
      R = 6373;
      break;
    case 'degrees':
      R = 57.2957795;
      break;
    case 'radians':
      R = 1;
      break;
    case undefined:
      R = 6373;
      break;
    default:
      throw new Error('unknown option given to "units"');
  }

  var distance = R * c;
  return distance;
};

function toRad(degree) {
  return degree * Math.PI / 180;
}

},{"turf-invariant":15}],15:[function(require,module,exports){
module.exports.geojsonType = geojsonType;
module.exports.collectionOf = collectionOf;
module.exports.featureOf = featureOf;

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @alias geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {String} name name of calling function
 * @throws Error if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @alias featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {String} name name of calling function
 * @throws Error if value is not the expected type.
 */
function featureOf(value, type, name) {
    if (!name) throw new Error('.featureOf() requires a name');
    if (!value || value.type !== 'Feature' || !value.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!value.geometry || value.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @alias collectionOf
 * @param {FeatureCollection} featurecollection a featurecollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {String} name name of calling function
 * @throws Error if value is not the expected type.
 */
function collectionOf(value, type, name) {
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!value || value.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < value.features.length; i++) {
        var feature = value.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

},{}],16:[function(require,module,exports){
// http://cs.selu.edu/~rbyrd/math/midpoint/
// ((x1+x2)/2), ((y1+y2)/2)
var point = require('turf-point');

/**
 * Takes two {@link Point} features and returns a Point midway between the two.
 *
 * @module turf/midpoint
 * @category measurement
 * @param {Point} pt1 first point
 * @param {Point} pt2 second point
 * @return {Point} a point between the two
 * @example
 * var pt1 = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [144.834823, -37.771257]
 *   }
 * };
 * var pt2 = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [145.14244, -37.830937]
 *   }
 * };
 *
 * var midpointed = turf.midpoint(pt1, pt2);
 * midpointed.properties['marker-color'] = '#f00';
 *
 *
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": [pt1, pt2, midpointed]
 * };
 *
 * //=result
 */
module.exports = function(point1, point2) {
  if (point1 === null || point2 === null){
    throw new Error('Less than two points passed.');
  }

  var x1 = point1.geometry.coordinates[0];
  var x2 = point2.geometry.coordinates[0];
  var y1 = point1.geometry.coordinates[1];
  var y2 = point2.geometry.coordinates[1];

  var x3 = x1 + x2;
  var midX = x3/2;
  var y3 = y1 + y2;
  var midY = y3/2;

  return point([midX, midY]);
};

},{"turf-point":10}],17:[function(require,module,exports){
//http://en.wikipedia.org/wiki/Delaunay_triangulation
//https://github.com/ironwallaby/delaunay
var polygon = require('turf-polygon');
var featurecollection = require('turf-featurecollection');

/**
 * Takes a set of points and the name of a z-value property and
 * creates a [Triangulated Irregular Network](http://en.wikipedia.org/wiki/Triangulated_irregular_network),
 * or a TIN for short, returned as a collection of Polygons. These are often used
 * for developing elevation contour maps or stepped heat visualizations.
 *
 * This triangulates the points, as well as adds properties called `a`, `b`,
 * and `c` representing the value of the given `propertyName` at each of
 * the points that represent the corners of the triangle.
 *
 * @module turf/tin
 * @category interpolation
 * @param {FeatureCollection} points - a GeoJSON FeatureCollection containing
 * Features with {@link Point} geometries
 * @param {string=} propertyName - name of the property from which to pull z values.
 * This is optional: if not given, then there will be no extra data added to the derived triangles.
 * @return {FeatureCollection} TIN output
 * @example
 * // generate some random point data
 * var points = turf.random('points', 30, {
 *   bbox: [50, 30, 70, 50]
 * });
 * //=points
 * // add a random property to each point between 0 and 9
 * for (var i = 0; i < points.features.length; i++) {
 *   points.features[i].properties.z = ~~(Math.random() * 9);
 * }
 * var tin = turf.tin(points, 'z')
 * for (var i = 0; i < tin.features.length; i++) {
 *   var properties  = tin.features[i].properties;
 *   // roughly turn the properties of each
 *   // triangle into a fill color
 *   // so we can visualize the result
 *   properties.fill = '#' + properties.a +
 *     properties.b + properties.c;
 * }
 * //=tin
 */
module.exports = function(points, z) {
  //break down points
  return featurecollection(triangulate(points.features.map(function(p) {
    var point = {
      x: p.geometry.coordinates[0],
      y: p.geometry.coordinates[1]
    };
    if (z) point.z = p.properties[z];
    return point;
  })).map(function(triangle) {
    return polygon([[
        [triangle.a.x, triangle.a.y],
        [triangle.b.x, triangle.b.y],
        [triangle.c.x, triangle.c.y],
        [triangle.a.x, triangle.a.y]
    ]], {
        a: triangle.a.z,
        b: triangle.b.z,
        c: triangle.c.z
      });
  }));
};

function Triangle(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;

  var A = b.x - a.x,
    B = b.y - a.y,
    C = c.x - a.x,
    D = c.y - a.y,
    E = A * (a.x + b.x) + B * (a.y + b.y),
    F = C * (a.x + c.x) + D * (a.y + c.y),
    G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
    minx, miny, dx, dy;

  // If the points of the triangle are collinear, then just find the
  // extremes and use the midpoint as the center of the circumcircle.
  if (Math.abs(G) < 0.000001) {
    minx = Math.min(a.x, b.x, c.x);
    miny = Math.min(a.y, b.y, c.y);
    dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5;
    dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5;

    this.x = minx + dx;
    this.y = miny + dy;
    this.r = dx * dx + dy * dy;
  } else {
    this.x = (D * E - B * F) / G;
    this.y = (A * F - C * E) / G;
    dx = this.x - a.x;
    dy = this.y - a.y;
    this.r = dx * dx + dy * dy;
  }
}

function byX(a, b) {
  return b.x - a.x;
}

function dedup(edges) {
  var j = edges.length,
    a, b, i, m, n;

  outer:
  while (j) {
    b = edges[--j];
    a = edges[--j];
    i = j;
    while (i) {
      n = edges[--i];
      m = edges[--i];
      if ((a === m && b === n) || (a === n && b === m)) {
        edges.splice(j, 2);
        edges.splice(i, 2);
        j -= 2;
        continue outer;
      }
    }
  }
}

function triangulate(vertices) {
  // Bail if there aren't enough vertices to form any triangles.
  if (vertices.length < 3)
    return [];

    // Ensure the vertex array is in order of descending X coordinate
    // (which is needed to ensure a subquadratic runtime), and then find
    // the bounding box around the points. 
  vertices.sort(byX);

  var i = vertices.length - 1,
    xmin = vertices[i].x,
    xmax = vertices[0].x,
    ymin = vertices[i].y,
    ymax = ymin;

  while (i--) {
    if (vertices[i].y < ymin)
      ymin = vertices[i].y;
    if (vertices[i].y > ymax)
      ymax = vertices[i].y;
  }

  //Find a supertriangle, which is a triangle that surrounds all the
  //vertices. This is used like something of a sentinel value to remove
  //cases in the main algorithm, and is removed before we return any
  // results.
 
  // Once found, put it in the "open" list. (The "open" list is for
  // triangles who may still need to be considered; the "closed" list is
  // for triangles which do not.)
  var dx = xmax - xmin,
    dy = ymax - ymin,
    dmax = (dx > dy) ? dx : dy,
    xmid = (xmax + xmin) * 0.5,
    ymid = (ymax + ymin) * 0.5,
    open = [
      new Triangle({
        x: xmid - 20 * dmax,
        y: ymid - dmax,
        __sentinel: true
      },
      {
        x: xmid,
        y: ymid + 20 * dmax,
        __sentinel: true
      },
      {
        x: xmid + 20 * dmax,
        y: ymid - dmax,
        __sentinel: true
      }
    )],
    closed = [],
    edges = [],
    j, a, b;

    // Incrementally add each vertex to the mesh.
  i = vertices.length;
  while (i--) {
    // For each open triangle, check to see if the current point is
    // inside it's circumcircle. If it is, remove the triangle and add
    // it's edges to an edge list.
    edges.length = 0;
    j = open.length;
    while (j--) {
      // If this point is to the right of this triangle's circumcircle,
      // then this triangle should never get checked again. Remove it
      // from the open list, add it to the closed list, and skip.
      dx = vertices[i].x - open[j].x;
      if (dx > 0 && dx * dx > open[j].r) {
        closed.push(open[j]);
        open.splice(j, 1);
        continue;
      }

      // If not, skip this triangle.
      dy = vertices[i].y - open[j].y;
      if (dx * dx + dy * dy > open[j].r)
        continue;

      // Remove the triangle and add it's edges to the edge list.
      edges.push(
        open[j].a, open[j].b,
        open[j].b, open[j].c,
        open[j].c, open[j].a
      );
      open.splice(j, 1);
    }

    // Remove any doubled edges.
    dedup(edges);

    // Add a new triangle for each edge.
    j = edges.length;
    while (j) {
      b = edges[--j];
      a = edges[--j];
      open.push(new Triangle(a, b, vertices[i]));
    }
  }

  // Copy any remaining open triangles to the closed list, and then
  // remove any triangles that share a vertex with the supertriangle.
  Array.prototype.push.apply(closed, open);

  i = closed.length;
  while (i--)
  if (closed[i].a.__sentinel ||
      closed[i].b.__sentinel ||
      closed[i].c.__sentinel)
      closed.splice(i, 1);

  return closed;
}

},{"turf-featurecollection":5,"turf-polygon":11}],18:[function(require,module,exports){
var random = require('geojson-random');

/**
 * Generates random {@link GeoJSON} data, including {@link Point|Points} and {@link Polygon|Polygons}, for testing
 * and experimentation.
 *
 * @module turf/random
 * @category data
 * @param {String} [type='point'] type of features desired: 'points' or 'polygons'
 * @param {Number} [count=1] how many geometries should be generated.
 * @param {Object} options options relevant to the feature desired. Can include:
 * @param {Array<number>} options.bbox a bounding box inside of which geometries
 * are placed. In the case of {@link Point} features, they are guaranteed to be within this bounds,
 * while {@link Polygon} features have their centroid within the bounds.
 * @param {Number} [options.num_vertices=10] options.vertices the number of vertices added
 * to polygon features.
 * @param {Number} [options.max_radial_length=10] the total number of decimal
 * degrees longitude or latitude that a polygon can extent outwards to
 * from its center.
 * @return {FeatureCollection} generated random features
 * @example
 * var points = turf.random('points', 100, {
 *   bbox: [-70, 40, -60, 60]
 * });
 *
 * //=points
 *
 * var polygons = turf.random('polygons', 4, {
 *   bbox: [-70, 40, -60, 60]
 * });
 *
 * //=polygons
 */
module.exports = function(type, count, options) {
    options = options || {};
    count = count || 1;
    switch (type) {
        case 'point':
        case 'points':
        case undefined:
            return random.point(count, options.bbox);
        case 'polygon':
        case 'polygons':
            return random.polygon(
                count,
                options.num_vertices,
                options.max_radial_length,
                options.bbox);
        default:
            throw new Error('Unknown type given: valid options are points and polygons');
    }
};

},{"geojson-random":19}],19:[function(require,module,exports){
module.exports = function() {
    throw new Error('call .point() or .polygon() instead');
};

function position(bbox) {
    if (bbox) return coordInBBBOX(bbox);
    else return [lon(), lat()];
}

module.exports.position = position;

module.exports.point = function(count, bbox) {
    var features = [];
    for (i = 0; i < count; i++) {
        features.push(feature(bbox ? point(position(bbox)) : point()));
    }
    return collection(features);
};

module.exports.polygon = function(count, num_vertices, max_radial_length, bbox) {
    if (typeof num_vertices !== 'number') num_vertices = 10;
    if (typeof max_radial_length !== 'number') max_radial_length = 10;
    var features = [];
    for (i = 0; i < count; i++) {
        var vertices = [],
            circle_offsets = Array.apply(null,
                new Array(num_vertices + 1)).map(Math.random);

        circle_offsets.forEach(sumOffsets);
        circle_offsets.forEach(scaleOffsets);
        vertices[vertices.length - 1] = vertices[0]; // close the ring

        // center the polygon around something
        vertices = vertices.map(vertexToCoordinate(position(bbox)));
        features.push(feature(polygon([vertices])));
    }

    function sumOffsets(cur, index, arr) {
        arr[index] = (index > 0) ? cur + arr[index - 1] : cur;
    }

    function scaleOffsets(cur, index) {
        cur = cur * 2 * Math.PI / circle_offsets[circle_offsets.length - 1];
        var radial_scaler = Math.random();
        vertices.push([
            radial_scaler * max_radial_length * Math.sin(cur),
            radial_scaler * max_radial_length * Math.cos(cur)
        ]);
    }

    return collection(features);
};


function vertexToCoordinate(hub) {
    return function(cur, index) { return [cur[0] + hub[0], cur[1] + hub[1]]; };
}

function rnd() { return Math.random() - 0.5; }
function lon() { return rnd() * 360; }
function lat() { return rnd() * 180; }

function point(coordinates) {
    return {
        type: 'Point',
        coordinates: coordinates || [lon(), lat()]
    };
}

function coordInBBBOX(bbox) {
    return [
        (Math.random() * (bbox[2] - bbox[0])) + bbox[0],
        (Math.random() * (bbox[3] - bbox[1])) + bbox[1]];
}

function pointInBBBOX() {
    return {
        type: 'Point',
        coordinates: [lon(), lat()]
    };
}

function polygon(coordinates) {
    return {
        type: 'Polygon',
        coordinates: coordinates
    };
}

function feature(geom) {
    return {
        type: 'Feature',
        geometry: geom,
        properties: {}
    };
}

function collection(f) {
    return {
        type: 'FeatureCollection',
        features: f
    };
}

},{}],20:[function(require,module,exports){
turf={}

turf.random = require('turf-random')
turf.isobands = require('turf-isobands')

},{"turf-isobands":2,"turf-random":18}]},{},[20]);
