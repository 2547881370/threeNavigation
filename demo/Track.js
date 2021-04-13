const use = {
    'division': function (a, b) {
        return a / b;
    },
    'isInstanceof': function (a, b) {
        return a instanceof b;
    },
    'subtraction': function (a, b) {
        return a - b;
    },
    'isLessThan': function (a, b) {
        return a < b;
    },
    'multiplication': function (a, b) {
        return a * b;
    },
    'addition': function (a, b) {
        return a + b;
    },
    'fn': function (fn, a, b) {
        return fn(a, b);
    },
    'divide': function (a, b) {
        return a / b;
    },
    'isFlag': function (a, b) {
        return a == b;
    },
    'isGreaterThan': function (a, b) {
        return a > b;
    },
    'vertexShader': '    attribute vec3 previous;    attribute vec3 next;    attribute float side;    varying vec2 v_uv;    uniform float u_lineWidth;    uniform float u_resolution;    uniform bool u_sizeAttention;    void main() {        vec2 currentP = position.xy;        vec2 prevP = previous.xy;        vec2 nextP = next.xy;        float width = u_lineWidth/2.0;        if(u_sizeAttention){        width *= u_resolution;}        float scale = 1.0;vec2 dir;        if( nextP == currentP) dir = normalize( currentP - prevP );        else if( prevP == currentP) dir = normalize( nextP - currentP );        else {            vec2 dir1 = normalize( currentP - prevP );            vec2 dir2 = normalize( nextP - currentP );            dir = normalize( dir1 + dir2 );            float cc = abs(atan(-dir.x/dir.y) - atan(dir1.y/dir1.x));            scale = 1.0/sin(cc);        }        vec2 planeNormal = vec2(-dir.y, dir.x);        vec4 offset = vec4(planeNormal * ( width * scale) * side, 0.0, 1.0);        vec4 finalPosition = vec4(position, 1.0);        finalPosition.xy += offset.xy;        v_uv = vec2(uv.x, uv.y);        if(u_sizeAttention){        v_uv.x = v_uv.x/u_resolution;}        gl_Position = projectionMatrix * modelViewMatrix * finalPosition;    }',
    'fragmentShader': ' varying vec2 v_uv;    uniform vec4 u_lineColor;    uniform float u_placeLength;    uniform float u_placeSpace;    uniform float u_dist;    uniform float u_uvOffset;    uniform bool u_showLine;    uniform bool u_useAlpha;    uniform sampler2D u_pattern;            void main() {                vec4 color = u_lineColor;                vec2 outUv = v_uv;                outUv.x = fract(outUv.x/(u_placeLength + u_placeSpace)-u_uvOffset)*(u_placeLength + u_placeSpace)/u_placeLength;                vec4 textureColor = texture2D(u_pattern,outUv);                if(u_showLine){                    if(u_useAlpha){                        color.a *= textureColor.a;                        gl_FragColor = color;                    }else{                        gl_FragColor = color*(1.0 - textureColor.a) + textureColor * textureColor.a;                    }                }else{                    gl_FragColor = textureColor;                }            } ',
};

class Bezier {
    constructor() {
    }
    static ['getBezierPoints'](inflectionPoint, subsection = 10) {
        if (inflectionPoint['length'] <=  2){
            return inflectionPoint;
        }
        let position = [], count = inflectionPoint['length'] - 1;
        for (let _index = 0; _index <= 1; _index += 1 / subsection) {
            let subsection = 0, __index = 0;
            for (var index = 0; index <= count; index++) {
                let p = use['fn'](calculation1, count, index)
                let p1 = Math['pow'](_index, index)
                let p2 = Math['pow'](1 - _index, count - index);
                subsection += ((p * p1) * p2) * inflectionPoint[index][0],
                __index += ((p* p1 ) * p2) * inflectionPoint[index][1];
            }
            position['push']([subsection, __index]);
        }
        return position['push'](inflectionPoint[count]),position;

        function calculation1(count, index) {
            return use['divide'](use['fn'](calculation, count), use['multiplication'](use['fn'](calculation, index), use['fn'](calculation, use['subtraction'](count, index))));
        }

        function calculation(count) {
            if (count <= 1)
                return 1;
            if (2 == count)
                return 2;
            if (3 == count)
                return 6;
            if (use['isFlag'](4, count))
                return 18;
            if (5 == count)
                return 78;
            for (var subsection = 1, index = 1; use['fn'](index, count); index++)
                subsection *= index;
            return subsection;
        }
    }
}

class Track {
    constructor(options = {}) {

            this['iconUrl'] = options['iconUrl'] ? options['iconUrl'] : null

            this['_originPositions'] = options['coordinates'] ? options['coordinates'] : []

            this['color'] = options['color'] ? options['color'] : new THREE[('Color')](0, 1, 0)

            this['opacity'] = options['hasOwnProperty']('opacity') ? options['opacity'] : 1

            this['lineWidth'] = options['width'] ? options['width'] : 15

            this['useAlpha'] = !!options['hasOwnProperty']('useAlpha') && options['useAlpha']

            this['showLine'] = !options['hasOwnProperty']("showLine") || options['showLine']

            this['placeLength'] = options['hasOwnProperty']("placeLength") ? options['placeLength'] : 14

            this['sizeAttention'] = !options['hasOwnProperty']("sizeAttention") || options['sizeAttention']

            this['placeSpace'] = options['hasOwnProperty']('placeSpace') ? options['placeSpace'] : 14

            this['isAnimate'] = !!options['isAnimate'] && options['isAnimate']
            
            this['speed'] = options['hasOwnProperty']("speed") ? options['speed'] : 3

            this['smooth'] = !options['hasOwnProperty']("smooth") || options['smooth']

            this['uvOffset'] = 0

            this['_init']();

    }
    ['_init']() {
        let color = this['color'], opacity = this['opacity'];
        this['colorArr'] = [color['r'], color['g'], color['b'], opacity]
        let _originPositions = this['_originPositions'], position = [];

        if (use['isGreaterThan'](_originPositions['length'], 2)) {

            position['push'](_originPositions[0]);

            for (let index = 1; use['isLessThan'](index, use['subtraction'](_originPositions['length'], 1)); index++) {
                let frontPosition = _originPositions[index - 1]
                let currentPosition = _originPositions[index]
                let afterPosition = _originPositions[index + 1]
                let p1 = [use['addition'](frontPosition[0], use['multiplication'](0.9, use['subtraction'](currentPosition[0], frontPosition[0]))), use['addition'](frontPosition[1], use['multiplication'](0.9, use['subtraction'](currentPosition[1], frontPosition[1]))), use['addition'](frontPosition[2], use['multiplication'](0.9, use['subtraction'](currentPosition[2], frontPosition[2])))]
                let p2 = [use['addition'](currentPosition[0], use['multiplication'](0.1, use['subtraction'](afterPosition[0], currentPosition[0]))), currentPosition[1] + use['multiplication'](0.1, use['subtraction'](afterPosition[1], currentPosition[1])), use['addition'](currentPosition[2], 0.1 * use['subtraction'](afterPosition[2], currentPosition[2]))]
                let p3 = Bezier['getBezierPoints']([[p1[0], p1[1]], [currentPosition[0], currentPosition[1]], [p2[0], p2[1]]], 5);
                for (let value of p3)
                    position['push']([value[0], value[1], currentPosition[2]]);
            }

            position['push'](_originPositions[_originPositions['length'] - 1])

            this['_originPositions'] = position;
        }

        this['_process']();
    }
    ['compareV3'](a, b) {
        let index = 6 * a
            , _index = 6 *b;
            return this['positions'][index] === this['positions'][_index] && this['positions'][index + 1] === this['positions'][_index + 1]
            && this['positions'][index + 2] === this['positions'][_index + 2]
    }
    ['copyV3'](value) {
        let index = 6 *  value;
        return [this['positions'][index], this['positions'][index + 1], this['positions'][index +2]];
    }
    ['_process']() {
        this['positions'] = [];
        for (let index = 0; use['isLessThan'](index, this['_originPositions']['length']); index++) {
            let point = this['_originPositions'][index];
            use['isInstanceof'](point, THREE['Vector3']) ? (this['positions']['push'](point['x'], point['y'], point['z'] ? point['z'] : 0),
            this['positions']['push'](point['x'], point['y'], point['z'] ? point['z'] : 0)) : point instanceof Array && (this['positions']['push'](point[0], point[1], point[2]),
            this['positions']['push'](point[0], point[1], point[2]));
        }
        var compareV3, aspect = use['division'](this['positions']['length'], 6);
        this['previous'] = []
        this['next'] = []
        this['side'] = []
        this['width'] = []
        this['indices'] = []
        this['uvs'] = []
        
        for (var index = 0; use['isLessThan'](index, aspect); index++){
            this['side']['push'](1)
            this['side']['push'](-1)
        }

        compareV3 = this['compareV3'](0, use['subtraction'](aspect, 1)) ? this['copyV3'](use['subtraction'](aspect, 2)) : this['copyV3'](0),
        this['previous']['push'](compareV3[0], compareV3[1], compareV3[2]),
        this['previous']['push'](compareV3[0], compareV3[1], compareV3[2]);

        for (index = 0; use['isLessThan'](index, use['subtraction'](aspect, 1)); index++){
            compareV3 = this['copyV3'](index)
            this['previous']['push'](compareV3[0], compareV3[1], compareV3[2])
            this['previous']['push'](compareV3[0], compareV3[1], compareV3[2])
        }

        for (index = 0x1; use['isLessThan'](index, aspect); index++){
            compareV3 = this['copyV3'](index)
            this['next']['push'](compareV3[0], compareV3[1], compareV3[2])
            this['next']['push'](compareV3[0], compareV3[1], compareV3[2])
        }

        compareV3 = this['compareV3'](aspect - 1, 0) ? this['copyV3'](1) : this['copyV3'](use['subtraction'](aspect, 1)),
        this['next']['push'](compareV3[0], compareV3[1], compareV3[2]),
        this['next']['push'](compareV3[0], compareV3[1], compareV3[2]);

        for (index = 0; index < aspect - 1 ; index++) {
            var value = use['multiplication'](2, index);
            this['indices']['push'](value, value + 2, use['addition'](value, 1)),
            this['indices']['push'](use['addition'](value, 2), use['addition'](value, 3), use['addition'](value, 1));
        }

        let uv = 0;
        for (index = 0; index < aspect; index++) {
            let previous = this['previous'][6 *  index]
                    , p1 = this['previous'][(6 * index) + 1]
                    , p2 = this['previous'][(6 * index )+ 2]
                    , p3 = this['positions'][6 * index]
                    , p4 = this['positions'][(6 * index)+ 1]
                    , p5 = this['positions'][(6 * index) + 2];
                uv += Math['sqrt'](use['addition']((p3 - previous) * use['subtraction'](p3, previous), use['subtraction'](p4, p1) * use['subtraction'](p4, p1)) + use['multiplication'](use['subtraction'](p5, p2), use['subtraction'](p5, p2))),
                    this['uvs']['push'](uv, 0),
                    this['uvs']['push'](uv, 1);
        }

        this['geometry'] = new THREE[('BufferGeometry')]()
        this['geometry']['addAttribute']("position", new THREE['BufferAttribute'](new Float32Array(this['positions']), 3))
        this['geometry']['addAttribute']('previous', new THREE['BufferAttribute'](new Float32Array(this['previous']), 3))
        this['geometry']['addAttribute']("next", new THREE['BufferAttribute'](new Float32Array(this['next']), 3))
        this['geometry']['addAttribute']("side", new THREE[('BufferAttribute')](new Float32Array(this['side']), 1))
        this['geometry']['addAttribute']('uv', new THREE[('BufferAttribute')](new Float32Array(this['uvs']), 2))
        this['geometry']['setIndex'](new THREE['BufferAttribute'](new Uint16Array(this['indices']), 1))

        if(this['iconUrl']){
           let loader = new THREE['TextureLoader']();
           this['texture'] = loader['load'](this['iconUrl']),
           this['texture']['wrapS'] = THREE['ClampToEdgeWrapping'],
           this['texture']['wrapT'] = THREE['ClampToEdgeWrapping'],
           this['texture']['magFilter'] = THREE['NearestFilter'],
           this['texture']['minFilter'] = THREE['NearestFilter'];
        }

        this['material'] = new THREE[('ShaderMaterial')]({
            'transparent': true,
            'depthTest': true,
            'side': THREE['DoubleSide'],
            'uniforms': {
                'u_lineWidth': {
                    'type': 'f',
                    'value': this['lineWidth']
                },
                'u_lineColor': {
                    'type': 'v4',
                    'value': this['colorArr']
                },
                'u_pattern': {
                    'type': 't',
                    'value': this['texture']
                },
                'u_useAlpha': {
                    'type': 'f',
                    'value': this['useAlpha']
                },
                'u_showLine': {
                    'type': 'f',
                    'value': this['showLine']
                },
                'u_placeLength': {
                    'type': 'f',
                    'value': this['placeLength']
                },
                'u_placeSpace': {
                    'type': 'f',
                    'value': this['placeSpace']
                },
                'u_uvOffset': {
                    'type': 'f',
                    'value': this['uvOffset']
                },
                'u_resolution': {
                    'type': 'f',
                    'value': 1
                },
                'u_sizeAttention': {
                    'type': 'f',
                    'value': this['sizeAttention']
                }
            },
            'vertexShader': use['vertexShader'],
            'fragmentShader': use['fragmentShader']
        }),

        this['trail'] = new THREE['Mesh'](this['geometry'], this['material']),
        this['trail']['renderOrder'] = 10;
    }
    ['update'](options) {
        this['isAnimate'] && (this['uvOffset'] += use['multiplication'](0.01, this['speed'])),
        this['uvOffset'] > 1 && this['uvOffset']--,
        this['material']['uniforms']['u_uvOffset']['value'] = this['uvOffset'],
        this['material']['uniforms']['u_resolution']['value'] = options['resolution'];
    }
    ['setVisible'](val) {
        this['trail']['visible'] = val;
    }
}