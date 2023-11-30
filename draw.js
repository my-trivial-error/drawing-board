var game1 = function(processingInstance) {
    with(processingInstance) {
        size(400, 400);
        frameRate(60);
        /* This was created by Robert Lyon. It is licensed under creative commons and mit license. */
        /**
 * Click the program's Restart buttom to toggle between a
 * randomized and a solved Rubik's cube.
 * 
 * Click in the black background to rotate the entire Rubik's
 * cube by dragging the mouse. Traditional Z axis rotation
 * is accomplished by pressing the LEFT arrow (or 'a') and
 * RIGHT arrow (or 'd') keys.
 * 
 * To rotate a face of the Rubik's cube, click then drag
 * the mouse through two adjacent squares which are on the
 * SIDE of the desired face, and NOT on the face itself.
 * 
 * Face rotation is terminated by releasing the mouse. Upon
 * release the face will snap to the nearest quarter turn,
 * so you only have to get close to the desired destination.
 * 
 * Thanks to Dave Smith for describing how to break the cube.
 * The problem is now fixed (I think).
 */

/**
 * The Rubik's cube face rotation can be accomplished via
 * "hot" keys. A Rubik's cube face is defined by the color of
 * its center square. Six faces have six colors - one of white,
 * orange, green, red, blue, and yellow. Pressing one of the
 * hot keys "wogrby", or the respective numbers "123456" will
 * rotate the associated face 90° clockwise. Pressing the upper
 * case of those keys will rotate the associated face 90°
 * counter-clockwise.
 */

/* Rubik's cube's face rotation hot key maps... */
var hotKeys = "wogrby";  /* positive rotation */
var hotCeys = "WOGRBY";  /* negative rotation */
var hotNums = "123456";  /* positive rotation */
var hotCums = "!@#$%^";  /* negative rotation */

/* Rubik's cube's face colors must match hotKeys. */
var colors = [
    color(245),  /* w is for white */
    color(255, 140, 40),  /* o is for orange */
    color(20, 180, 20),  /* g is for green */
    color(240, 40, 40),  /* r is for red */
    color(40, 77, 250),  /* b is for blue */
    color(255, 255, 70),  /* y is for yellow */
];

/* Image to paste on the white face center... */
var kaLogo = function() {
    var wasAngleMode = angleMode;
    angleMode = "radians";  /* KA brain damage */
    var tau = TWO_PI;
    var sideLen = 66;
    var logo = createGraphics(sideLen, sideLen, JAVA2D);
    logo.background(1, 2, 3, 0);
    logo.translate(sideLen/2, sideLen/2);
    logo.textAlign(CENTER, CENTER);
    var r = 0.29 * sideLen;
    var t = "Khan".split("");
    logo.textFont(createFont("monospace Italics"), 16);
    logo.fill(0, 0, 0);
    for (var theta = 7/12*tau, i = 0; i < t.length; i++, theta += (4/12*tau)/(t.length - 1)) {
        var x = r * cos(theta);
        var y = r * sin(theta);
        logo.pushMatrix();
        logo.translate(x, y);
        logo.rotate(theta + tau/4);
        logo.text(t[i], 0, 0);
        logo.popMatrix();
    }
    
    var t = "CUBE".split("");
    logo.textFont(createFont("monospace Bold"), 16);
    for (var theta = 5/12*tau, i = 0; i < t.length; i++, theta -= (4/12*tau)/(t.length - 1)) {
        var x = r * cos(theta);
        var y = r * sin(theta);
        logo.pushMatrix();
        logo.translate(x, y);
        logo.rotate(theta - tau/4);
        logo.text(t[i], 0, 0);
        logo.popMatrix();
    }
    
    angleMode = wasAngleMode;  /* KA brain damage */
    return logo;
};

/*
 * Give every object a "new" method that works around
 * the Khan Academy leak.
 */
function whatNewDoes() {
    var obj = Object.create(this.prototype);
    this.apply(obj, arguments);
    return obj;
}
Object.constructor.prototype.new = whatNewDoes;

(function(PVector) {
    /*
     * Khan Academy leaks objects.  Here is a PVector "patch" that
     * can mitigate PVector leaks iff the programmer invokes
     *      PVector.new()
     * instead of "new PVector()".
     */
    
    /* Reimplement the get method to call PVector.new(). */
    function get() {
        return PVector.new(this.x, this.y, this.z);
    }
    PVector.prototype.get = get;

    /* Reimplement the cross method to call PVector.new(). */
    function cross(v) {
        var ax = this.x, ay = this.y, az = this.z;
        return PVector.new(ay*v.z - az*v.y, az*v.x - ax*v.z, ax*v.y - ay*v.x);
    }
    PVector.prototype.cross = cross;
    
    /*
     * Rewrite static function to invoke PVector.new().  Why the
     * static method was not robotically generated is a mystery.
     */
    function sub(v1, v2) {
        return PVector.new(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    PVector.sub = sub;
    
    /* Rewrite static function to invoke PVector.new(). */
    function fromAngle(angle, v) {
        v = v || PVector.new();
        v.x = cos(angle);
        v.y = sin(angle);
        return v;
    }
    PVector.fromAngle = fromAngle;
    
    /* Rewrite static function to invoke PVector.new(). */
    function random3D(v) {
        var angle = Math.random() * TWO_PI;
        var vz = Math.random() * 2 - 1;
        var mult = Math.sqrt(1 - vz * vz);
        var vx = mult * Math.cos(angle);
        var vy = mult * Math.sin(angle);
        if (! v) {
            v = PVector.new(vx, vy, vz);
        } else {
            v.set(vx, vy, vz);
        }
        return v;
    }
    PVector.random3D = random3D;
    
    /* Rewrite static function to invoke PVector.new(). */
    function lerp(v1, v2, amt) {
        var retval = PVector.new(v1.x, v1.y, v1.z);
        retval.lerp(v2, amt);
        return retval;
    }
    PVector.lerp = lerp;

    /* Let's also fix a real bug in Processing.js PVectors... */
    function angleBetween(a, b) {
        var cosine = a.dot(b) / (a.mag() * b.mag());
        return acos(constrain(cosine, -1, 1));
    }
    PVector.angleBetween = angleBetween;

})(PVector);  /* Patches PVector leaks... */

/*
 * Constructor for 2D rendering matrix which inherits from
 * the Processing.js rendering matrices, PMatrix2D.  The
 * only documentation for PMatrix2D is the code found at 
 * https://raw.github.com/processing-js/processing-js/v1.4.8/processing.js
 */
var RMatrix2D = (function() {
    var isArray = Array.isArray;
    var aTan2 = atan2;
    var abs = Math.abs;
    var sqrt = Math.sqrt;
    var orthogEpsilon = 1/1024/16;
    var epsilon = 1/1024/1024/1024;

    /* Constructor function. Objects inherit everything from PMatrix2D */
    function RMatrix2D() {
        PMatrix2D.apply(this, arguments);
        this.mops = Object.new();
        this.eigenVector1 = PVector.new();
        this.eigenVector2 = PVector.new();
    }

    /*
     * Inherited PMatrix2D properties include:
     *  elements: a six element array of numbers
     *  set: function takes another PMatrix2D, an array, or six numbers
     *  get: function replaced by RMatrix2D.prototype.get
     *  reset: function sets this to the identity matrix
     *  translate: function
     *  determinant: function
     *  invert: inverts the matrix in place; returns a success boolean
     *  scale: function
     *  apply: function this = this * argument(s); matrix multiplication
     *  preApply: function this = argument(s) * this; matrix multiplication
     *  mult: function(source, target) arguments are PVectors or arrays
     *  rotate: function
     *  print: function like printMatrix
     * Others that are avoided are:
     *  array: function returns a new array of this.elements
     *  multX: function, computes only the X tansformation of a point
     *  multY: function, computes only the Y tansformation of a point
     *  skewX: function  (doesn't work)
     *  skewY: function  (doesn't work)
     *  shearX: function(angle)  (doesn't work and is replaced)
     *  shearY: function(angle)  (doesn't work and is replaced)
     *  transpose: function, does nothing!
     *  rotateZ: invokes rotate
     *  invRotateZ: function() undo rotateZ
     *  invTranslate: function undo translate
     *  invScale: function undo scale
     */
    RMatrix2D.prototype = Object.create(PMatrix2D.prototype);
    RMatrix2D.prototype.resetMatrix = PMatrix2D.prototype.reset;  /* alias */
    RMatrix2D.prototype.printMatrix = PMatrix2D.prototype.print;  /* alias */
    RMatrix2D.prototype.transform = PMatrix2D.prototype.mult;  /* alias */

    /* Return a clone of this. */
    function get() {
        return RMatrix2D.new(this);
    }
    RMatrix2D.prototype.get = get;
    
    /* Set the values of this RMatix2D.  Avoids KA leaks and loop detector. */
    function setMatrix(src) {
        var S;
        if (src instanceof PMatrix2D) {
            S = src.elements;
        } else if (arguments.length === 6) {
            S = arguments;
        } else if (isArray(src)) {
            S = src;
        } else {
            throw "RMatrix2D.prototype.set: invalid arguments!";
        }
        var E = this.elements = this.elements || [];
        E.length = 0;
        E.push(S[0], S[1], S[2], S[3], S[4], S[5]);
    }
    RMatrix2D.prototype.set = setMatrix;
    
    /* Provide the same functionality as pushMatrix() as a method. */
    function push() {
        this.stack = this.stack || [];  /* NB: Array.new() does not work */
        this.stack.push(this.get());
    }
    RMatrix2D.prototype.push = RMatrix2D.prototype.pushMatrix = push;
    
    /* Provide the same functionality as popMatrix() as a method. */
    function pop() {
        var stack = this.stack;
        if (stack && stack.length > 0) {
            this.set(stack.pop());
        }
    }
    RMatrix2D.prototype.pop = RMatrix2D.prototype.popMatrix = pop;
    
    /*
     * Shear this RMatrix2D on the X axis by the stated angle.
     * Interface and definition inspired by P5.js.
     */
    function shearX(angle) {
        var t = tan(angle);
        var rm = RMatrix2D.new(1, t, 0,
                               0, 1, 0);
        this.apply(rm);
    }
    RMatrix2D.prototype.shearX = shearX;
    
    /* Shear this RMatrix2D on the Y axis by the stated angle. */
    function shearY(angle) {
        var t = tan(angle);
        var rm = RMatrix2D.new(1, 0, 0,
                               t, 1, 0);
        this.apply(rm);
    }
    RMatrix2D.prototype.shearY = shearY;
    
    /*
     * Return the inverse of this matrix.  Caller provides
     * a target results matrix or is provided a STATIC
     * property of this matrix.
     */
    function inverse(results) {
        var E = this.elements, e0 = E[0], e1 = E[1], e2 = E[2], e3 = E[3], e4 = E[4], e5 = E[5];
        var d = this.determinant();
        if (abs(d) < epsilon) {
            throw "No matrix inverse possible!";
        }
        d = 1 / d;
        results = results ||
            (this.inverted = this.inverted || RMatrix2D.new());
        results.elements.length = 0;
        results.elements.push(
            e4 *  d, e1 * -d, (e1 * e5 - e4 * e2) * d,
            e3 * -d, e0 *  d, (e3 * e2 - e0 * e5) * d
        );
        return results;
    }
    RMatrix2D.prototype.inverse = inverse;
    
    /* 
     * Compute this 2×2 matrix's eigenvalues and UNIT eigenvectors. See
     * http://www.math.harvard.edu/archive/21b_fall_04/exhibits/2dmatrices/index.html
     * for formulas.
     */
    function eigen() {
        var ev1 = this.eigenVector1;
        var ev2 = this.eigenVector2;
        var E = this.elements, e0 = E[0], e1 = E[1], e3 = E[3], e4 = E[4];
        var halfTrace = (e0 + e4) / 2;
        var discrim = halfTrace * halfTrace - this.determinant();
        discrim = (discrim < epsilon) ? 0 : sqrt(discrim);
        var lamda1 = this.lamda1 = halfTrace + discrim;
        var lamda2 = this.lamda2 = halfTrace - discrim;
        if (abs(e3) > epsilon) {
            ev1.set(lamda1 - e4, e3, 0);
            ev2.set(lamda2 - e4, e3, 0);
        } else if (abs(e1) > epsilon) {
            ev1.set(e1, lamda1 - e0, 0);
            ev2.set(e1, lamda2 - e0, 0);
        } else if (abs(e0 - lamda1) < epsilon) {
            ev1.set(1, 0, 0);
            ev2.set(0, 1, 0);
            return;
        } else {
            ev2.set(1, 0, 0);
            ev1.set(0, 1, 0);
            return;
        }
        ev1.normalize();
        ev2.normalize();
    }
    RMatrix2D.prototype.eigen = eigen;
    
    var myV = RMatrix2D.new();
    var myP = RMatrix2D.new();
    /*
     * Find the Singular Value Decomposition of this. Parameters
     * are all required RMatrix2D output targets. So this = U×S×VT.
     * Returns true on success. See section 8.1 of
     * https://datajobs.com/data-science-repo/SVD-Tutorial-[Kirk-Baker].pdf
     */
    function svd(U, S, VT) {
        /* Degenerate matrices (collinear vectors) are a big fail. */
        if (abs(this.determinant()) < epsilon) {
            return false;
        }
        var E = this.elements, a = E[0], b = E[1], c = E[3], d = E[4];
        
        /* Special (simple) case for orthogonal vectors. */
        if (abs(a*b + c*d) < orthogEpsilon) {
            var magX = sqrt(a*a + c*c);
            var magY = sqrt(b*b + d*d);
            U.set(  a/magX, b/magY, 0,
                    c/magX, d/magY, 0 );
            S.set(  magX, 0, 0,
                    0, magY, 0);
            VT.resetMatrix();  /* VT = Identity matrix */
            return true;
        }
        
        /* U is derived from the eigenvector of EE' */
        myP.set(a, c, 0, b, d, 0);  /* sets myP = E' */
        myP.preApply(this);
        myP.eigen();
        var u1 = myP.eigenVector1, u2 = myP.eigenVector2;
        U.set(u1.x, u2.x, 0, u1.y, u2.y, 0);
        
        /* S diag is 1/sqrt of the eigenvalues */
        S.set(sqrt(myP.lamda1), 0, 0, 0, sqrt(myP.lamda2), 0);
        
        /* 
         * V = [v1, v2] where the column vectors
         * v1 = (1/sqrt(lamda1))·E'·u1  and
         * v2 = (1/sqrt(lamda2))·E'·u2.
         */
        var V = myV;
        myP.set(a, c, 0, b, d, 0);  /* myP = E' */
        myP.transform(u1, u1);
        u1.div(S.elements[0]);
        myP.transform(u2, u2);
        u2.div(S.elements[4]);
        V.set(u1.x, u2.x, 0, u1.y, u2.y, 0);
        
        /*
         * Multiply U and V by minusOne if U does not appear to be a
         * valid rotation matrix.  minusOne × minusOne === Identity, so
         * U×S×V remains the same. minusOne = [ -1, 0, 0, 0, 1, 0 ].  This
         * is the same as negating each X column vector of the two matrices.
         */
        U = U.elements;
        V = V.elements;
        if (U[0] * U[4] <= 0) {
            U[0] *= -1;
            U[3] *= -1;
            V[0] *= -1;
            V[3] *= -1;
        }
        
        VT.set(V[0], V[3], 0, V[1], V[4], 0);  /* VT = V' */
        return true;
    }
    RMatrix2D.prototype.svd = svd;
    
    var myU = RMatrix2D.new();
    var myS = RMatrix2D.new();
    var myVT = RMatrix2D.new();
    var rotReflect =  RMatrix2D.new();
    var tuY = PVector.new();
    /*
     * This method provides the arguments to translate,
     * rotate, and scale that can reconstruct a rendering
     * matrix. Results parameter is returned. If no results
     * parameter is given then a STATIC object is returned.
     * Will return null on failure.  See applyMopsToPJS()
     * for HOW to apply the transformations.
     */
    function reconstitute(results) {
        var matrix = this;
        if (! matrix.determinant) {
            return null; // more KA silliness
        }
        var atan2 = aTan2;
        var mops = results || matrix.mops;
        var E = matrix.elements;
        mops.tx = E[2];
        mops.ty = E[5];
        if (matrix.determinant() < 0) {
            /*  
             * A negative determinant means that the Y axis
             * is a negative angle from X axis in a universe 
             * where the Y axis must be a positive angle from X axis.
             * So, find the SVD of a similar "positive" matrix whose
             * X column vector is collinear with the X axis, and
             * whose Y column vector is reflected by the X axis.
             */
            var a = E[0], b = E[1], c = E[3], d = E[4];
            tuY.set(b, d, 0);
            mops.rot0 = atan2(c, a);  /* rotation FROM X axis */
            tuY.rotate(-mops.rot0);  /* normalize tuX & tuV back TO X axis. */
            rotReflect.set(sqrt(a*a + c*c), tuY.x, 0, 0, -tuY.y, 0);
            matrix = rotReflect;
            mops.initSy = -1;  /* reconcile reflection, -tuY.y */
        } else {
            mops.rot0 = 0;  /* no rotation */
            mops.initSy = 1;  /* no reflection */
        }
        
        /* Now, factor matrix into three matrices... */
        if (! matrix.svd(myU, myS, myVT)) {
            return null;
        }
        
        /*
         * Since matrix = U×S×VT, compute arguments to rotate and
         * scale that can reconstruct matrix. Do the first rotate...
         */
        mops.rot1 = atan2(myU.elements[3], myU.elements[0]);
        /* Then do a scale. */
        mops.sx = myS.elements[0];
        mops.sy = myS.elements[4];
        /* Finally do another rotate. */
        mops.rot2 = atan2(myVT.elements[3], myVT.elements[0]);
        return mops;
    }
    RMatrix2D.prototype.reconstitute = reconstitute;
    
    /*
     * Static function applies the results of the reconstitute()
     * method to THE Processing.js rendering matrix. The only
     * way to do that is via a series of tranformation calls.
     * Returns true if mops.
     */
    function applyMopsToPJS(mops) {
        if (mops) {
            void((mops.tx || mops.ty) && translate(mops.tx, mops.ty));
            void(mops.rot0 && rotate(mops.rot0));
            void((mops.initSy !== 1) && scale(1, mops.initSy));
            void(mops.rot1 && rotate(mops.rot1));
            void((mops.sx !== 1 || mops.sy !== 1) && scale(mops.sx, mops.sy));
            void(mops.rot2 && rotate(mops.rot2));
            return true;
        }
    }
    RMatrix2D.applyMopsToPJS = applyMopsToPJS;
    
    /*
     * Apply this RMatrix2D to THE Processing.js rendering matrix.
     * Returns true iff successful.
     */
    function applyMopsToPJS() {
        return RMatrix2D.applyMopsToPJS(this.reconstitute());
    }
    RMatrix2D.prototype.applyMopsToPJS = applyMopsToPJS;
    
    /*
     * (The Holy Grail.)
     * Static function applies the RMatrix2D rm to THE 
     * Processing.js rendering matrix. If you want to SET
     * the Processing.js matrix, then invoke resetMatrix()
     * prior to invoking this function.  Returns true iff
     * successful.
     */
    function applyMatrix(/* rm */) {
        var rm = arguments[0];  /* KA silliness */
        return rm.applyMopsToPJS();
    }
    RMatrix2D.applyMatrix = applyMatrix;
    
    /*
     * Static function that converts the string
     * produced by Processing.js printMatrix to a
     * RMatrix2D object.  KA printMatrix() outputs
     * six numbers on two lines that look like 
     *      a b c
     *      d e f
     * You should pass ONE string that looks like
     *      a b c d e f
     * where the numbers are separated by blanks.
     * Optional parameter results is where the result
     * are placed and returned.  It must be a RMatrix2.
     * If none is provided then a new one is created.
     */
    function string2RMatrix(s, results) {
        try {  /* more KA silliness */
            results = results || RMatrix2D.new();
            var token = s.split(" ");
            var num = results.elements;
            for (var n = 0, i = 0; (n < 6) && (i < token.length); i++) {
                var f = parseFloat(token[i]);
                if (f > f - 1) {
                    /* f is really a (useful) number */
                    num[n++] = f;
                }
            }
            if (n !== 6) {
                println("Expected six, but got " + n + " numbers!");
            }
            return results;
        } catch(err) {}
    }
    RMatrix2D.string2RMatrix = string2RMatrix;
    
    /* Names of extremely interesting Processing.js functions. */
    RMatrix2D.transforms = [ "translate", "scale", "rotate",
        "pushMatrix", "popMatrix", "resetMatrix" ];
        
    /*
     * This static function returns a RMatrix2D that 
     * reflects the transformation operations performed
     * on the Processiong.js transformation functions.
     * Sane people will most likely invoke this after a
     * resetMatrix().
     * The Interpose parameter is the Interpose library that
     * knows how to capture calls to Processing.js.  Get that
     * library at 
     * https://www.khanacademy.org/cs/i/5992045511049216
     */
    function mirrorPJS(Interpose) {
        var mirror = RMatrix2D.new();

        /*
         * This interpose-function invokes the equivalent
         * method in the RMatrix2D object "mirror" that 
         * reflects the Processing.js rendering matrix.
         */
        function mirrorMatrixOp() {
            var mirroredFunction = mirror[this.name];
            if (mirroredFunction && mirroredFunction.apply) {
                /*
                 * This should ALWAYS be the case, but life with the
                 * KA live-editor and resetMatrix is really tough.
                 */
                mirroredFunction.apply(mirror, arguments);
            }
        }
        
        /* Interpose plumbing... */
        RMatrix2D.transforms.forEach(
            function(val) { Interpose.push(val, mirrorMatrixOp); });
        
        /* Undo method.  The method itself disappears... */
        function breakMirror() {
            RMatrix2D.transforms.forEach(
                function(val) { Interpose.pop(val); });
            delete mirror.breakMirror;
        }
        mirror.breakMirror = breakMirror;
        
        return mirror;
    }
    RMatrix2D.mirrorPJS = mirrorPJS;
    
    return RMatrix2D;  // last edited 2023.03.11
})();  /* RMatrix2D is a constructor copied from www.khanacademy.org/cs/mr/3793059675 */

/*
 * Face is a constructor function for creating faces described
 * by their nodes and color. Many support methods & functions
 * are provided for rendering the faces, culling invisible
 * faces, and shading the faces with respect to a static light
 * source. Copied from
 * https://www.khanacademy.org/cs/p/4521460558135296
 */
var Face = (function() {
    /*
     * The drawn faces are rendered using "flat shading". See
     * https://en.wikipedia.org/wiki/Shading#Flat_shading The
     * light source is infinitely far away, but the lightSrc
     * vector is used to determine its 3D angles from the faces.
     * So a light source perpendicular to the picture canvas is
     * the vector(0, 0, <any positive number>). Note that shapes
     * do not cast shadows!
     */
    var lightSrc = new PVector(-5, -3, 100);
    var lightMag = lightSrc.mag();
    var dark = color(50);  /* the color of no light */
    var rm = new RMatrix2D();
    var staticVisibleFaces = [];
    var staticOrig = new PVector();
    var staticNext = new PVector();
    var staticPrev = new PVector();

    /*
     * Additional cross product method that does not leak memory
     * at Khan Academy because the caller specifies where the
     * results are placed. Computes and returns (this ⨯ b). results
     * can be any PVector (including this and b) or nothing at all.
     */
    PVector.prototype.crossRes = function(b, results) {
        results = results || new PVector();
        results.set(
            this.y * b.z - this.z * b.y,
            this.z * b.x - this.x * b.z,
            this.x * b.y - this.y * b.x);
        return results;
    };

    /* Constructor function. Uses (does NOT dup) nodes. */
    var Face = function(nodes, colour) {
        this.nodes = nodes;
        this.color = colour || color(random(230), 200, random(230));
        this.normal = new PVector();
    };

    /* Draw this face and update mini & maxi coordinates. */
    Face.prototype.draw = function(mini, maxi) {
        mini = mini || staticPrev;
        maxi = maxi || staticNext;
        var cosTheta = this.normal.dot(lightSrc) / this.normal.mag() / lightMag;
        var interpolation = (cosTheta < 0.15) ? 0.15 : cosTheta;
        interpolation = min(1, 1.4 * interpolation);
        fill(lerpColor(dark, this.color, interpolation));
        
        /* Stroke added for Rubik's cube. */
        if (this.stroke) {
            stroke(lerpColor(dark, this.stroke, interpolation));
            if (this.strokeWeight) {
                /* Intuit a scale factor from the nodes' perspectives. */
                for (var cnt = 0, scl = 0, nodes = this.nodes, i = nodes.length; --i >= 0; ) {
                    var node = nodes[i];
                    if (node.x) {
                        scl += node.persp.x / node.x;
                        cnt++;
                    }
                }
                scl = (cnt > 0) ? scl/cnt : 1;
                strokeWeight(scl * this.strokeWeight);
            }
        } else {
            noStroke();
        }

        beginShape();
        for (var nodes = this.nodes, i = nodes.length; --i >= 0; ) {
            var persp = nodes[i].persp, x, y, z = persp.z;
            vertex(x = persp.x, y = persp.y);
            void((x < mini.x) && (mini.x = x));
            void((x > maxi.x) && (maxi.x = x));
            void((y < mini.y) && (mini.y = y));
            void((y > maxi.y) && (maxi.y = y));
            void((z < mini.z) && (mini.z = z));
            void((z > maxi.z) && (maxi.z = z));
        }
        endShape(CLOSE);
        
        /* Image added for Rubik's cube. */
        if (this.img) {
            var mid = this.mid.persp,
                ox = nodes[0].persp.x,
                oy = nodes[0].persp.y,
                len = this.sideLen;
            rm.set(
                (nodes[3].persp.x - ox) / len, (nodes[1].persp.x - ox) / len, mid.x,
                (nodes[3].persp.y - oy) / len, (nodes[1].persp.y - oy) / len, mid.y);
            pushMatrix();
            RMatrix2D.applyMatrix(rm);
            image(this.img, 0, 0, len - 12, len - 12);
            popMatrix();
        }
    };
    
    /*
     * Return true iff point (x, y) is in this *rendered* face.
     * See https://www.khanacademy.org/cs/p/5211412870725632
     * which implements even/odd ray tracing.
     */
    Face.prototype.isOver = function(x, y) {
        var isIn = false;
        var nodes = this.nodes;
        for (var i = 0, j = nodes.length - 1; i < nodes.length; j = i++) {
            var pi = nodes[i].persp, xi = pi.x, yi = pi.y;
            var pj = nodes[j].persp, xj = pj.x, yj = pj.y;
            var intersect = yi > y !== yj > y &&
                x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) {
                isIn = !isIn;
            }
        }
        return isIn;
    };
    
    /*
     * Returns the right-handed (unless "left") normal of this face.
     * The normal is with respect to the rendered face until raw,
     * which used actual coordinates.
     */
    Face.prototype.getNormal = function(left, raw) {
        var next = staticNext, prev = staticPrev;
        var origin, nodes = this.nodes;
        
        /* next and prev vectors share common origin nodes[1] */
        if (raw) {
            origin = nodes[1];
            next.set(nodes[2]);
            prev.set(nodes[0]);
        } else {
            origin = nodes[1].persp;
            next.set(nodes[2].persp);
            prev.set(nodes[0].persp);
        }
        next.sub(origin);
        prev.sub(origin);
        if (left) {
            /* left handed ... */
            var tmp = next;
            next = prev;
            prev = tmp;
        } 
        return (this.normal = prev.crossRes(next, this.normal));
    };
    
    /*
     * Is this face currently visible?  See
     * https://en.wikipedia.org/wiki/Back-face_culling
     */
    Face.prototype.isVisible = function() {
        return this.getNormal().z > 0;
    };
    
    /*
     * Assists both back face culling and flat shading. Assumes
     * this face is part of a shape centered at the origin.
     * Finds the correct ordering this face's nodes such that
     * a cross product of two vectors sharing the common nodes[1]
     * points away from the origin.
     */
    Face.prototype.rightHandRule = function(shape) {
        shape.perspective();  /* heavy handed refresh! */
        var common = this.nodes[1];
        var right = this.getNormal();
        right.add(common);
        right = right.mag();
        var left = this.getNormal(true);
        left.add(common);
        if (right < left.mag()) {
            this.nodes.reverse();
        }
    };
    
    /* Compare two faces based on their minimum Z (or average Z) coordinates. */
    var compareFace = function(a, b) {
        return (a.minZ - b.minZ) || (a.aveZ - b.aveZ);
    };
    
    /*
     * Draw the faces.  Optionally set min and max coordinates.
     * Populates visible array with actual faces drawn in the
     * the correct order.
     */
    Face.draw = function(faces, visible, mini, maxi) {
        visible = visible || staticVisibleFaces;
        visible.length = 0;
        for (var l = faces.length, i = 0; i < l; i++) {
            var face = faces[i];
            if (face.isVisible()) {
                visible.push(face);
                /*
                 * (re)Compute the values of the minimum Z coordinate
                 * and the average Z value in the face. Useful for
                 * sorting below.
                 */
                var nodes = face.nodes, m = nodes.length;
                face.minZ = face.aveZ = nodes[0].z;
                for (var j = 1; j < m; j++) {
                    var nz = nodes[j].z;
                    face.aveZ += nz;
                    void((nz < face.minZ) && (face.minZ = nz));
                }
                face.aveZ /= m;
            }
        }
        
        visible.sort(compareFace);
        
        void(mini && mini.set(+Infinity, +Infinity, +Infinity));
        void(maxi && maxi.set(-Infinity, -Infinity, -Infinity));
        for (l = visible.length, i = 0; i < l; i++) {
            visible[i].draw(mini, maxi);
        }
    };
    
    Face.bg = dark;
    return Face;
})();

/*
 * Shape3D is a constructor function for a generic shape that is
 * always constructed at the origin (0, 0, 0). Shapes have methods
 * for moving, scaling, XYZ axes rotating, and rotating around an axle.
 *
 * Shape3D also provides static library functions that are similar
 * to the methods but apply to the entire universe of shapes and
 * their nodes. Copied from
 * https://www.khanacademy.org/cs/p/4521460558135296
 */
var Shape3D = (function() {
    /*
     * A simple perspective is drawn wrt a fixed camera at
     * a positive Z offset.
     */
    var camera = new PVector(0, 0, 1.9 * max(width, height));
    var tau = (cos(PI) < 0) ? TWO_PI : 360;  /* KA silliness */
    var json = (function(what) { return this[what]; })("JSON");
    var jsonInclude = [ "x", "y", "z", "ux", "uy", "uz", "faces", "nodes", "color", "" ];
    var defaultOrigin = new PVector(0, 0, 0);
    var ux = new PVector(1, 0, 0);
    var uy = new PVector(0, 1, 0);
    var uz = new PVector(0, 0, 1);
    var tmpV = new PVector();
    var tmpArray = [];
    var shapes = [];  /* All managed shapes. */
    
    /* Constructor function of a generic shape. */
    var Shape3D = function(noRecord) {
        PVector.call(this, 0, 0, 0);  /* this shape's coordinates */
        this.nodes = [];
        this.faces = [];
        this.drawn = [];
        this.min = new PVector();
        this.max = new PVector();
        if (! noRecord) {
            shapes.push(this);
        }
        
        /*
         * All constructed nodes are bound to this shape.
         * A constructor in a constructor?  Really?
         */
        var thisShape = this;
        this.Node = function(x, y, z) {
            PVector.call(this, x, y, z);
            thisShape.nodes.push(this);
            this.persp = new PVector();  /* perspective of this. */
        };
        this.Node.prototype = PVector.prototype;
    };
    
    Shape3D.prototype = Object.create(PVector.prototype);
    
    /* Remove this shape from the managed shapes array. */
    Shape3D.prototype.remove = function() {
        shapes.splice(shapes.indexOf(this), 1);  /* snip */
    };
    
    /* Append this nodes to array a. */
    Shape3D.prototype.appendNodes = function(a) {
        a.push.apply(a, this.nodes);
        a.push(this);
    };
    
    /*
     * Optionally (re)set unit vectors.  They will undergo
     * all of the transformations that affect all other
     * nodes. Handy for personalized rotation axis...
     */
    Shape3D.prototype.setUnitAxes = function() {
        if (! this.ux) {
            this.ux = new this.Node();
            this.uy = new this.Node();
            this.uz = new this.Node();
        }
        this.ux.set(ux);
        this.uy.set(uy);
        this.uz.set(uz);
    };
    
    /* (re)Compute this shape's X and Y coordinates wrt perspective. */
    Shape3D.prototype.perspective = function() {
        for (var nodes = this.nodes, i = nodes.length; --i >= 0; ) {
            var node = nodes[i];
            var scale = camera.z / camera.dist(node);
            node.persp.set(scale * node.x, scale * node.y, node.z);
        }
    };
    
    /*
     * Moves this shape by a relative amount delta,
     * which is either a vector or three numbers.
     */
    Shape3D.prototype.move = function() {
        var delta = arguments[0];
        if (arguments.length === 3) {
            delta = tmpV;
            delta.set.apply(delta, arguments);
        }
        for (var nodes = this.nodes, n = nodes.length; --n >= 0; ) {
            var node = nodes[n];
            node.add(delta);
        }
        this.add(delta);
    };
    
    /*
     * Moves this shape to new absolute coordinates,
     * either described by a vector or by three coordinates.
     */
    Shape3D.prototype.translate = function() {
        var delta  = tmpV;
        delta.set.apply(delta, arguments);
        delta.sub(this);
        this.move(delta);
    };
    
    /*
     * Scales this shape according to one number,
     * one vector, or three numbers.
     */
    Shape3D.prototype.scale = function() {
        var sf = arguments[0];
        if (arguments.length === 3) {
            sf = tmpV;
            sf.set.apply(sf, arguments);
        }
        for (var nodes = this.nodes, n = nodes.length; --n >= 0; ) {
            var node = nodes[n];
            node.sub(this);
            node.mult(sf);
            node.add(this);
        }
    };
    
    /*
     * Rotate the nodes about a 3D axle described by
     * the line between "from" and "to".  Info at
     * https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
     */
    Shape3D.rotateNodesAxle = function(nodes, theta, from, to) {
        if (theta && nodes.length) {
            var q = tmpV;
            q.set(to);
            q.sub(from);
            q.normalize();
            q.mult(sin(theta/2));
            var qr = cos(theta/2),
                qi = q.x,
                qj = q.y,
                qk = q.z,
                
                r11 = 1 - 2*(qj*qj + qk*qk),
                r12 = 0 + 2*(qi*qj - qk*qr),
                r13 = 0 + 2*(qi*qk + qj*qr),
                
                r21 = 0 + 2*(qi*qj + qk*qr),
                r22 = 1 - 2*(qi*qi + qk*qk),
                r23 = 0 + 2*(qj*qk - qi*qr),
                
                r31 = 0 + 2*(qi*qk - qj*qr),
                r32 = 0 + 2*(qj*qk + qi*qr),
                r33 = 1 - 2*(qi*qi + qj*qj),
            
                ox = from.x,
                oy = from.y,
                oz = from.z;
            
            for (var n = nodes.length; --n >= 0; ) {
                var node = nodes[n];
                var x = node.x - ox;
                var y = node.y - oy;
                var z = node.z - oz;
                node.x = r11*x + r12*y + r13*z + ox;
                node.y = r21*x + r22*y + r23*z + oy;
                node.z = r31*x + r32*y + r33*z + oz;
            }
        }
    };
    
    /*
     * Rotate every node about a 3D axle described by
     * the line between "from" and "to".
     */
    Shape3D.rotateAxle = function(theta, from, to) {
        var allNodes = tmpArray;
        allNodes.length = 0;
        for (var s = shapes.length; --s >= 0; ) {
            shapes[s].appendNodes(allNodes);
        }
        Shape3D.rotateNodesAxle(allNodes, theta, from, to);
    };
    
    /* Rotate this shape's nodes around its Z-axis. */
    Shape3D.prototype.rotateZ3D = function(theta) {
        if (theta) {
            uz.add(this);
            Shape3D.rotateNodesAxle(this.nodes, theta, this, uz);
            uz.sub(this);
        }
    };
    
    /* Rotate this shape's nodes around its Y-axis. */
    Shape3D.prototype.rotateY3D = function(theta) {
        if (theta) {
            uy.add(this);
            Shape3D.rotateNodesAxle(this.nodes, theta, this, uy);
            uy.sub(this);
        }
    };
    
    /* Rotate this shape's nodes around its X-axis. */
    Shape3D.prototype.rotateX3D = function(theta) {
        if (theta) {
            ux.add(this);
            Shape3D.rotateNodesAxle(this.nodes, theta, this, ux);
            ux.sub(this);
        }
    };
    
    /* Rotate every node around the Z axis at origin. */
    Shape3D.rotateZ3D = function(theta, origin) {
        void(theta && Shape3D.rotateAxle(theta, origin || defaultOrigin, uz));
    };
    
    /* Rotate every node around the Y axis at origin. */
    Shape3D.rotateY3D = function(theta, origin) {
        void(theta && Shape3D.rotateAxle(theta, origin || defaultOrigin, uy));
    };
    
    /* Rotate every node around the X axis at origin. */
    Shape3D.rotateX3D = function(theta, origin) {
        void(theta && Shape3D.rotateAxle(theta, origin || defaultOrigin, ux));
    };
    
    /*
     * Rotate the nodes of this shape about a 3D axle described by
     * the line between this coordinates and axle.
     */
    Shape3D.prototype.rotateAxle = function(theta, axle) {
        Shape3D.rotateNodesAxle(this.nodes, theta, this, axle || this.uz || defaultOrigin);
    };
    
    /* Compare two shapes based on their centers' Z coordinates. */
    var compareShape = function(a, b) {
        return a.z - b.z;
    };
    
    /*
     * Draw all shapes from back to front. The
     * rendering of collided shapes is undefined
     * and often disappointing.
     */
    Shape3D.draw = function(dShapes) {
        dShapes = dShapes || shapes;
        dShapes.sort(compareShape);
        for (var l = dShapes.length, i = 0; i < l; i++) {
            var shape = dShapes[i];
            shape.perspective();
            Face.draw(shape.faces, shape.drawn, shape.min, shape.max);
        }
    };
    
    /* Is point (x, y) in the vicinity of this shape? */
    Shape3D.prototype.isAround = function(x, y) {
        return (x >= this.min.x) && (y >= this.min.y) &&
            (y <= this.max.y) && (x <= this.max.x);
    };
    
    /* Is 2D point (x, y) over this shape's 2D projection? */
    Shape3D.prototype.isOver = function(x, y) {
        if (this.isAround(x, y)) {
            for (var faces = this.drawn, i = faces.length; --i >= 0; ) {
                var face = faces[i];
                if (face.isOver(x, y)) {
                    this.overFace = face;
                    return true;
                }
            }
        }
        return false;
    };
    
    /*
     * Return the shape that the point (x, y) is over.
     * NB: Assumes shapes are sorted back to front.
     */
    Shape3D.over = function(x, y) {
        /* Search *must* be front to back! */
        for (var i = shapes.length; --i >= 0; ) {
            if (shapes[i].isOver(x, y)) {
                return shapes[i];
            }
        }
    };
    
    /*
     * Return the JSON description of shape be it
     * a shape or an array of shapes.
     */
    Shape3D.stringify = function(shape) {
        shape = shape || shapes;
        var myNodes;
        
        var replacer = function(key, value) {
            if ((! Array.isArray(this)) && (jsonInclude.indexOf(key) < 0)) {
                return;  /* ignore unwanted key and value */
            }
            if (key === "nodes") {
                if (this.faces && typeof this.z === "number") {
                    /* Remember the actual nodes of this shape. */
                    myNodes = value;
                } else {
                    /* Replace node references with indices into myNodes. */
                    var replacement = [];
                    for (var l = value.length, i = 0; i < l; i++) {
                        replacement.push(myNodes.indexOf(value[i]));
                    }
                    return replacement;
                }
            } else if (key === "ux" || key === "uy" || key === "uz") {
                /* Replace value with an index into myNodes. */
                return myNodes.indexOf(value);
            } 
            return value;
        };
        
        return json.stringify(shape, replacer);
    };
    
    /* Return the JSON description of this shape. */
    Shape3D.prototype.stringify = function() {
        return Shape3D.stringify(this);
    };
    
    /* Make a brand new shape based on the properties of conf. */
    var newShape = function(conf) {
        var shape = new Shape3D();
        var myNodes = shape.nodes;
        shape.set(conf.x, conf.y, conf.z);
        for (var nodes = conf.nodes, l = nodes.length, i = 0; i < l; i++) {
            var node = nodes[i];
            new shape.Node(node.x, node.y, node.z);
        }
        
        for (var faces = conf.faces, l = faces.length, i = 0; i < l; i++) {
            var face = faces[i];
            for (var nodes = face.nodes, m = nodes.length, j = 0; j < m; j++) {
                nodes[j] = myNodes[nodes[j]];
            }
            shape.faces.push(new Face(nodes, face.color));
        }
        
        if (conf.ux >= 0) {
            shape.ux = myNodes[conf.ux];
            shape.uy = myNodes[conf.uy];
            shape.uz = myNodes[conf.uz];
        }
        return shape;
    };
    
    /* Parse string s and build new shapes. */
    Shape3D.parse = function(s) {
        var shapes = json.parse(s);
        if (! Array.isArray(shapes)) {
            shapes = [ shapes ];
        }
        for (var i = shapes.length; --i >= 0; ) {
            newShape(shapes[i]);
        }
    };
    
    /* Clone this shape. */
    Shape3D.prototype.clone = function() {
        var s = this.stringify();
        var conf = json.parse(s);
        return newShape(conf);
    };
    
    Shape3D.tau = tau;
    return Shape3D;
})();

/*
 * Constructor function for a cuboid. Copied from
 * https://www.khanacademy.org/cs/p/4521460558135296
 */
var Cuboid = (function() {
    
    /* Constructor function for cuboid centered at origin. */
    var Cuboid = function(w, h, d) {
        Shape3D.call(this);
        var faces = this.faces;
        w /= 2;
        h /= 2;
        d /= 2;
        var bottom = [
            new this.Node(-w, -h, -d),
            new this.Node(-w, +h, -d),
            new this.Node(+w, +h, -d),
            new this.Node(+w, -h, -d),
        ];
        var top = [
            new this.Node(-w, -h, +d),
            new this.Node(-w, +h, +d),
            new this.Node(+w, +h, +d),
            new this.Node(+w, -h, +d),
        ];
        
        for (var l = top.length, prev = l - 1, i = 0; i < l; prev = i++) {
            faces.push(new Face([ bottom[prev], top[prev], top[i], bottom[i] ],
                faceColor()));
        }
        faces.push(new Face(top, faceColor()), new Face(bottom, faceColor()));
        
        for (i = faces.length; --i >= 0; ) {
            faces[i].rightHandRule(this);
        }
        
        this.setUnitAxes();
    };
    
    Cuboid.prototype = Shape3D.prototype;
    
    var faceColor = function() {
        return color(70, random(120, 160), random(190, 230));
    };
    
    return Cuboid;
})();

/*
 * Constructor function for Rubik's cube PLANE. A plane is
 * 3 ⨯ 3 collection of cubes that rotate intacted around the
 * specified axle at the specified origin (rotation point).
 * So, a Rubik's cude has nine planes - three for each of
 * the 3D axes.
 */
var RCPlane = (function() {
    var tau = Shape3D.tau;
    var quarter = tau/4;  /* a quarter turn */
    var epsilon = 1/1024;
    var cubesDup = [];
    var planes = [];  /* All (nine) managed planes */
    /* position[i] -> position[rotationMap[i]] */
    var rotationMap = [
        [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ], /* no rotation */
        [ 2, 5, 8, 1, 4, 7, 0, 3, 6 ], /* rotate +tau/4 */
        [ 8, 7, 6, 5, 4, 3, 2, 1, 0 ], /* rotate tau/2 */
        [ 6, 3, 0, 7, 4, 1, 8, 5, 2 ], /* rotate -tau/4 */
    ];
    
    /*
     * Constructor function. The constructed plane is perpendicular
     * to the axle.  Or, the plane's normal is the axle.  The axle
     * must be a 3D axis, e.g. two components must be zero.
     */
    var RCPlane = function(origin, axle) {
        Shape3D.call(this);
        this.cubes = [];
        this.axle = new this.Node(axle.x, axle.y, axle.z);
        this.translate(origin);
        if (axle.x) {
            this.axisName = "X";
            this.clockwise = (origin.x < 0) ? -1 : +1;
        } else if (axle.y) {
            this.axisName = "Y";
            this.clockwise = (origin.y < 0) ? -1 : +1;
        } else {
            this.axisName = "Z";
            this.clockwise = (origin.z < 0) ? -1 : +1;
        }
        planes.push(this);
    };
    
    RCPlane.prototype = Object.create(Shape3D.prototype);
    
    /* Add cube to this cubes. */
    RCPlane.prototype.append = function(cube) {
       this.cubes.push(cube); 
    };
    
    /*
     * Return an array of planes that contain cube c.
     * Answers go into results which are returned.
     * The universe of planes is described by p.
     */
    RCPlane.planesOf = function(c, results, p) {
        results = results || [];
        p = p || planes;
        results.length = 0;
        for (var i = p.length; --i >= 0; ) {
            var plane = p[i];
            if (plane.cubes.indexOf(c) >= 0) {
                results.push(plane);
            }
        }
        return results;
    };
    
    /* 
     * Return the face plane whose center
     * cube has the specified color.
     */
    RCPlane.faceByColor = function(color) {
        for (var i = planes.length; --i >= 0; ) {
            var plane = planes[i];
            var face = plane.cubes[4].bestFace;
            if (face && face.color === color) {
                return plane;
            }
        }
    };
    
    /* Paint all faces of this plane the same color. */
    RCPlane.prototype.paint = function(color, stroke, strokeWeight, img) {
        /* First discover which face of the CENTER cube is painted. */
        var axle = this.axle;
        var bestFace = null, bestDist = -Infinity;
        for (var faces = this.cubes[4].faces, i = faces.length; --i >= 0; ) {
            var face = faces[i];
            if (abs(face.getNormal(false, true).dot(axle)) > epsilon) {
                var d = face.nodes[0].mag();
                if (d > bestDist) {
                    bestDist = d;
                    bestFace = i;
                }
            }
        }
        /* Now paint all nine appropriate faces. */
        for (var cubes = this.cubes, i = cubes.length; --i >= 0; ) {
            var face = cubes[i].faces[bestFace];
            face.color = color;
            if (strokeWeight) {
                face.strokeWeight = strokeWeight;
                face.stroke = stroke;
            }
        }
        /* Remember the best face of the CENTER cube. */
        var face = cubes[4].bestFace = cubes[4].faces[bestFace];
        
        /* Set up the optional image... */
        if (img) {
            face.img = img;
            face.sideLen = face.nodes[0].dist(face.nodes[1]);
            face.mid = new cubes[4].Node();
            face.mid.set(face.nodes[1]);
            face.mid.add(face.nodes[3]);
            face.mid.div(2);
        }
    };
    
    /*
     * Rotate this plane 0, 1, 2, or 3 quarter turns.
     * Update the six other planes that are affected by
     * rotation.
     */
    RCPlane.prototype.rotateQuarterTurn = function(qt) {
        qt = ((qt % 4) + 4) % 4;
        if (qt === 0) {
            return;
        }
        var mapTo = rotationMap[qt];
        var after = this.after = this.after || [];
        for (var cubes = this.cubes, i = cubes.length; --i >= 0; ) {
            after[mapTo[i]] = cubes[i];
        }
        
        /*
         * Affect changes for the six planes that 
         * are perpendicular to this.
         */
        for (var axisName = this.axisName, p = planes.length; --p >= 0; ) {
            var plane = planes[p];
            if (plane.axisName !== axisName) {
                plane = plane.cubes;
                for (var j = plane.length; --j >= 0; ) {
                    i = cubes.indexOf(plane[j]);
                    if (i >= 0) {
                        /* Why is a Y plane different??? XXX */
                        plane[j] = (axisName === "Y") ?
                            after[i] : cubes[mapTo[i]];
                    }
                }
            }
        }
        
        /* Finally affect changes for this plane. */
        for (i = cubes.length; --i >= 0; ) {
            cubes[i] = after[i];
        }
    };
    
    /*
     * Determine the rendering order of the three planes
     * parallel to this plane.
     */
    RCPlane.prototype.renderOrder = function() {
        /* Find the three planes parallel to thisPlane. */
        var parallel = this.parallel;
        if (! parallel) {
            parallel = [];
            for (var axisName = this.axisName, i = planes.length; --i >= 0; ) {
                var plane = planes[i];
                if (plane.axisName === axisName) {
                    parallel.push(plane);
                    plane.parallel = parallel;
                }
            }
            /* Make sure that the center plane is the center element. */
            var tmp = parallel[1];
            if (parallel[0].mag() < epsilon) {
                parallel[1] = parallel[0];
                parallel[0] = tmp;
            } else if (parallel[2].mag() < epsilon) {
                parallel[1] = parallel[2];
                parallel[2] = tmp;
            }
        }
        
        /*
         * Determine the rendering order of parallel[0] and parallel[2].
         * So, if the zeroth plane faces are visible, ...
         */
        if (parallel[0].cubes[4].bestFace.getNormal(false, true).z > 0) {
            /* ... then draw that plane LAST. */
            var tmp = parallel[0];
            parallel[0] = parallel[2];
            parallel[2] = tmp;
        }
        
        return parallel;
    };
    
    /*
     * Handle the visual rotation of this plane.  from and to are
     * vectors indicating the mouse's movement used to select this
     * plane. dmx and dmy are delta mouse positions.
     */
    RCPlane.prototype.mouseDragged = function(from, to) {
        var thisPlane = this;
        var renderOrder = this.renderOrder();
        var fromDup = this.fromDup = this.fromDup || new PVector();
        var allNodes = this.allNodes = this.allNodes || [];
        var cumAngle = 0;
        var wasMouseDragged = mouseDragged;
        var wasMouseReleased = mouseReleased;
        var wasMousePressed = mousePressed;
        var wasKeyPressed = keyPressed;
        keyPressed = mousePressed = function() {};

        /* Match mouse movement to plane rotation... */
        fromDup.set(from);
        allNodes.length = 0;
        allNodes.push(fromDup);
        Shape3D.rotateNodesAxle(allNodes, tau/128, thisPlane, thisPlane.axle);
        var dir = (to.dist(fromDup) < to.dist(from)) ? 1 : -1;
        
        /* Gather up all the nodes that will be moving. */
        allNodes.length = 0;
        for (var cubes = thisPlane.cubes, i = cubes.length; --i >= 0; ) {
            cubes[i].appendNodes(allNodes);
        }
        
        /* Called by Processing.js as the uer drags the mouse. */
        mouseDragged = function() {
            var rotate = dir * tau / 196;
            Shape3D.rotateNodesAxle(allNodes, rotate, thisPlane, thisPlane.axle);
            cumAngle += rotate;
            
            /* special redraw */
            background(Face.bg);
            for (var l = renderOrder.length, i = 0; i < l; i++) {
                renderOrder[i].draw();
            }
        };

        /* Called by Processing.js when the user releases the mouse. */
        mouseReleased = function() {
            /* We are done! */
            keyPressed = wasKeyPressed;
            mouseDragged = wasMouseDragged;
            mouseReleased = wasMouseReleased;
            mousePressed = wasMousePressed;
            
            var snap = quarter * round(cumAngle / quarter);
            Shape3D.rotateNodesAxle(allNodes, snap - cumAngle, thisPlane, thisPlane.axle);
            thisPlane.rotateQuarterTurn(round(snap / quarter));
            redraw();
        };
    };
    
    /* Rotate this face a quarter turn in direction dir. */
    RCPlane.prototype.animateQuarter = function(dir) {
        var thisPlane = this;
        var renderOrder = this.renderOrder();
        var allNodes = this.allNodes = this.allNodes || [];
        var wasDraw = draw;
        var wasKeyPressed = keyPressed;
        var wasMousePressed = mousePressed;
        var wasMouseDragged = mouseDragged;
        var frameCount = 0, frames = 9;
        var rotate = dir * tau / 4 / frames;
        var cumAngle = 0;
        
        mouseDragged = mousePressed = keyPressed = function(){};
        /* Gather up all the nodes that will be moving. */
        allNodes.length = 0;
        for (var cubes = thisPlane.cubes, i = cubes.length; --i >= 0; ) {
            cubes[i].appendNodes(allNodes);
        }
        loop();
        
        draw = function() {
            Shape3D.rotateNodesAxle(allNodes, rotate, thisPlane, thisPlane.axle);
            cumAngle += rotate;
            /* special redraw */
            background(Face.bg);
            for (var l = renderOrder.length, i = 0; i < l; i++) {
                renderOrder[i].draw();
            }
            if (++frameCount >= frames) {
                /* We are done! */
                cumAngle = quarter * round(cumAngle / quarter);
                thisPlane.rotateQuarterTurn(round(cumAngle / quarter));
                noLoop();
                draw = wasDraw;
                keyPressed = wasKeyPressed;
                mousePressed = wasMousePressed;
                mouseDragged = wasMouseDragged;
            }
        };
    };
    
    /* Draw the (nine) cubes of this plane. */
    RCPlane.prototype.draw = function() {
        cubesDup.length = 0;
        cubesDup.push.apply(cubesDup, this.cubes);
        Shape3D.draw(cubesDup);
    };
    
    RCPlane.planes = planes;
    return RCPlane;
})();

/* Constructor function for making the Rubik's cube. */
var RubiksCube = (function(sz) {
    var tau = Shape3D.tau;
    var epsilon = 1/1024;
    var sideLen = sz || 66;
    var black = color(1, 2, 3);
    var smallCube = new Cuboid(sideLen, sideLen, sideLen);

    /* Constructor function... */
    var RubiksCube = function(randomize) {
        var origin = new PVector(0, 0, 0), axle = new PVector();
        
        /* Set up three planes per 3D axis. */
        axle.set(1, 0, 0);
        var xPlane = [];
        for (var x = 0; x < 3; x++) {
            origin.set((x - 1)*sideLen, 0, 0);
            xPlane.push(new RCPlane(origin, axle));
        }
        
        axle.set(0, 1, 0);
        var yPlane = [];
        for (var y = 0; y < 3; y++) {
            origin.set(0, (y - 1)*sideLen, 0);
            yPlane.push(new RCPlane(origin, axle));
        }
        
        axle.set(0, 0, 1);
        var zPlane = [];
        for (var z = 0; z < 3; z++) {
            origin.set(0, 0, (z - 1)*sideLen);
            zPlane.push(new RCPlane(origin, axle));
        }

        /* Make 27 cubes and populate the nine planes. */
        var cubes = this.cubes = [], cnt = 0;
        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                for (z = 0; z < 3; z++) {
                    var cube = smallCube.clone();
                    cube.move((x - 1)*sideLen, (y - 1)*sideLen, (z - 1)*sideLen);
                    xPlane[x].append(cube);
                    yPlane[y].append(cube);
                    zPlane[z].append(cube);
                }
            }
        }

        /*
         * Six planes (Rubik's cube faces) get six colors. See
         * https://en.wikipedia.org/wiki/Rubik%27s_Cube#Permutations
         */
        var weight = 3;
        zPlane[0].paint(colors[hotKeys.indexOf("o")], black, weight,
            getImage("avatars/orange-juice-squid"));
        zPlane[2].paint(colors[hotKeys.indexOf("r")], black, weight,
            getImage("avatars/piceratops-ultimate"));
        yPlane[0].paint(colors[hotKeys.indexOf("w")], black, weight,
            kaLogo());
        yPlane[2].paint(colors[hotKeys.indexOf("y")], black, weight,
            getImage("creatures/Winston"));
        xPlane[0].paint(colors[hotKeys.indexOf("g")], black, weight,
            getImage("avatars/old-spice-man"));
        xPlane[2].paint(colors[hotKeys.indexOf("b")], black, weight,
            getImage("avatars/spunky-sam"));

        /* Randomize... */
        var allNodes = [];
        for (var planes = RCPlane.planes, cnt = 99; randomize && cnt-- > 0; ) {
            var plane = planes[floor(random(planes.length))];
            var quarterTurns = floor(random(1, 4));
            /* Gather up all the nodes in the plane. */
            allNodes.length = 0;
            for (var cubes = plane.cubes, i = cubes.length; --i >= 0; ) {
                cubes[i].appendNodes(allNodes);
            }
            /* Roatate! */
            Shape3D.rotateNodesAxle(allNodes, quarterTurns/4*tau, plane, plane.axle);
            plane.rotateQuarterTurn(quarterTurns);
        }
    };
    
    /*
     * Handles the mousePressed event in preparation of plane rotation.
     * The rotation is determined by pressing, then dragging the mouse
     * over two adjacent faces.
     */
    RubiksCube.prototype.mousePressed = function(originX, originY) {
        var from = Shape3D.over(mouseX - originX, mouseY - originY);
        if (! from) {
            return;
        }
        var wasMouseDragged = mouseDragged;
        var fromPlanes = this.fromPlane = RCPlane.planesOf(from, this.fromPlanes);

        /* As the mouse is dragged, detect it over a different cube. */
        mouseDragged = function() {
            var to = Shape3D.over(mouseX - originX, mouseY - originY);
            if (to !== from) {
                mouseDragged = wasMouseDragged;  /* pop */
                var toPlanes = this.toPlanes = RCPlane.planesOf(to, this.toPlanes, fromPlanes);
                if (toPlanes.length === 2) {
                    var dot = abs(to.overFace.getNormal(false, true).dot(toPlanes[1].axle));
                    var i = (dot > epsilon) ? 0 : 1;
                    toPlanes[i].mouseDragged(from, to); /* Let the rotation begin! */   
                }
            }
        };  /* mouseDragged */
    };  /* mousePressed */
    
    /* Prune & paint the prototypical cube for this application. */
    smallCube.nodes.splice(smallCube.nodes.indexOf(smallCube.ux), 1);
    delete(smallCube.ux);
    smallCube.nodes.splice(smallCube.nodes.indexOf(smallCube.uy), 1);
    delete(smallCube.uy);
    smallCube.nodes.splice(smallCube.nodes.indexOf(smallCube.uz), 1);
    delete(smallCube.uz);
    for (var faces = smallCube.faces, i = faces.length; --i >= 0; ) {
        faces[i].color = black;
    }
    smallCube.remove();
    
    return RubiksCube;
})();

var solved = ! solved;
var rc = new RubiksCube(! solved);
Shape3D.rotateY3D(Shape3D.tau/9);
Shape3D.rotateX3D(Shape3D.tau/10);
Shape3D.rotateZ3D(Shape3D.tau/11);

var delta = Shape3D.tau/300;  /* a small (incremental) angle */
var originX = width/2;
var originY = height/2;
translate(originX, originY);  /* center the 2D origin */
strokeJoin(BEVEL);
imageMode(CENTER);

/* Called to draw the canvas. */
var render = function() {
    background(Face.bg);
    Shape3D.draw();
};

/* Called by Processing.js when the mouse button is pressed. */
mousePressed = function() {
    rc.mousePressed(originX, originY);
};

/* Called by Processing.js when the user drags the mouse. */
mouseDragged = function() {
    /* ROTATE the universe. */
    Shape3D.rotateX3D((pmouseY - mouseY) * delta);
    Shape3D.rotateY3D((mouseX - pmouseX) * delta);
    render();
};

/* Called by Processing.js when the user presses a key. */
keyPressed = function() {
    var i, ks = key.toString();
    var planes = RCPlane.planes, clockwise;
    if (keyCode === RIGHT || ks === 'd' || ks === 'D') {
        Shape3D.rotateZ3D(-delta);
    } else if (keyCode === LEFT || ks === 'a' || ks === 'A') {
        Shape3D.rotateZ3D(+delta);
    } else if ((i = hotKeys.indexOf(ks)) >= 0) {
        clockwise = 1;
    } else if ((i = hotCeys.indexOf(ks)) >= 0) {
        clockwise = -1;
    } else if ((i = hotNums.indexOf(ks)) >= 0) {
        clockwise = 1;
    } else if ((i = hotCums.indexOf(ks)) >= 0) {
        clockwise = -1;
    }
    if (clockwise) {
        var plane = RCPlane.faceByColor(colors[i]);
        plane.animateQuarter(clockwise * plane.clockwise);
    }
    render();
};

render();

    }
};
var canvas = document.getElementById("canvas");
var processingInstance = new Processing(canvas, game1);
