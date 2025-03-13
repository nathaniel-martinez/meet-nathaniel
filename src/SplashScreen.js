import { useRef, useEffect } from 'react'
import * as PIXI form 'pixi.js';


const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const BACKGROUND_COLOR = 0xFFFFFF;

// Some static definitions that are useful for drawing the intro
const MIN_RADIUS = 80;
const RADIUS_GROWTH = 0.06;

// Bezier CONSTS
const BEZIER_TIMESPAN = 1000;
const BEZIER_EASINGFUNC = x=>x**2;
//const BEZIER_COLOR = "black";
const BEZIER_COLOR = 0x000000;
const BEZIER_WIDTH = 2;

// Arc CONSTS
const ARC_TIMESPAN = 500;
const ARC_EASINGFUNC = x=> x;// figure out the best easing function later. it should be positive and have a derivative that looks like a quadratic func
const ARC_COLOR = "black";
const ARC_WIDTH = 1;

// Link CONSTS
const LINK_TIMESPAN = 500;
const LINK_EASINGFUNC = x=>x;
const LINK_COLOR = "black";
const LINK_WIDTH = 1;

// Fill CONSTS
const FILL_TIMESPAN = 1000;
const FILL_EASINGFUNC = x=>x;
const FILL_COLOR = "black";


function SplashScreen(){

	const splashCanvas = useRef(null);
	useEffect(() => {
		if (! PIXI.utils.isWebGLSupported()) {
			console.log("WebGL not supported, skipping splash screen");
			return;
		}

		const app = new PIXI.Application({ resizeTo: window, transparent: true });
		splashCanvas.current.appendChild(app.view);

		const vertexShader = `
			precision mediump float;
			attribute vec2 aVertexPosition;
			attribute vec2 aTextureCoord;
			varying vec2 vTextureCoord;

			void main() {
			    vTextureCoord = aTextureCoord;
			    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
			}
		`;

		const fragmentShader = `
			precision mediump float;

			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main() {
			    vec4 color = texture2D(uSampler, vTextureCoord);
			    
			    // Apply a step function to create a hard threshold
			    float threshold = 0.5;
			    float edge = step(threshold, vTextureCoord.x);
			    
			    gl_FragColor = vec4(vec3(edge), 1.0); // Black or White based on the step function
			}
		`;
		// len of radius pretending aspect ratio is 1
		let loader_radius = 0.2; 

		let center = new Point(0, 0);
		let topLeft = new Point(-1, 1);
		let topRight = new Point(1, 1);
		let bottomLeft = new Point(-1, -1);
		let bottomRight = new Point(1, -1);

		let [radius_x, radius_y] = radiusComponents(center, loader_radius, Math.PI / 4);

		const splashBezierStartAndEnds = [
			{
				"start": bottomLeft,
				"end": new Point(center.x - radius_x, center.y - radius_y)
			},

			{
				"start": topLeft,
				"end": new Point(center.x - radius_x, center.y + radius_y)
			},
			
			{
				"start": topRight,
				"end": new Point(center.x + radius_x, center.y + radius_y)
			},

			{
				"start": bottomRight,
				"end": new Point(center.x + radius_x, center.y - radius_y)
			}
		];


		// Our array of beziers in the splash screen
		let bezierArr = new Array(splashBezierStartAndEnds.length);
		for(let i = 0; i < splashBezierStartAndEnds.length; i++){
			bezierArr[i] = new BezierWrapers(ctx, BEZIER_COLOR, BEZIER_WIDTH, new Bezier([
						splashBezierStartAndEnds[i].start,
						traversePerpendicular(splashBezierStartAndEnds[i].start, splashBezierStartAndEnds[i].end, 0.75, 0.15),
						traversePerpendicular(splashBezierStartAndEnds[i].start, splashBezierStartAndEnds[i].end, 0.75, -0.45),
						traversePerpendicular(splashBezierStartAndEnds[i].end, center, 0, -1),
						splashBezierStartAndEnds[i].end
					]
				)
			);
		}

		// Our array of permiters arcs for the throbber
		let arcArr = new Array(4);
		let bottomLeftStart = (Math.PI + Math.PI / 4);
		for(let i = 0; i < 4; i++){
			arcArr[i] = new Arc(ctx, ARC_COLOR, ARC_WIDTH, loader_radius, center, bottomLeftStart + Math.PI * i / 2, bottomLeftStart + Math.PI * (i + 1) / 2)
		}
		

		// BeziersPoints for inside of Throbber
		let throbberBezierPointsArr = new Array(3).fill(null).map(() => new Array(4).fill(null));
		let radiusJumps = loader_radius / 3;
		let jumpBuffer = 2;
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 4; j++){
				// All translations have both a radius slide and a rotation
				let startTranslationTransform = traverseRadius(center, splashBezierStartAndEnds[j].end, radiusJumps * (-1) * i + jumpBuffer);
				let start = rotatePoint(center, startTranslationTransform, (-1) * i * Math.PI / 4);


				let endTranslationTransform = traverseRadius(center, start, radiusJumps * (-1) - jumpBuffer);
				let end = rotatePoint(center, endTranslationTransform, (-1) * Math.PI / 4);

				let mid = traversePerpendicular(start, end, 0.5, 0.1);

				throbberBezierPointsArr[i][j] = [ start, mid, end ];
			}
		}

		
		const animationBeziers = new AnimatableGroup(BEZIER_TIMESPAN, BEZIER_EASINGFUNC, bezierArr);
		const animationArcs = new AnimatableGroup(ARC_TIMESPAN, ARC_EASINGFUNC, arcArr);
		const animationThrobberLinksArr = throbberBezierPointsArr.map(
			(bezierPointsArr) => new AnimatableGroup(LINK_TIMESPAN, LINK_EASINGFUNC, bezierPointsArr.map(
				(bezierPoints) => new CircleLink(ctx, LINK_COLOR, LINK_WIDTH, new Bezier(bezierPoints))
			)));
		const animationThrobberFillsArr = throbberBezierPointsArr.map(
			(bezierPointsArr) => new AnimatableGroup(FILL_TIMESPAN, FILL_EASINGFUNC, bezierPointsArr.map(
				(bezierPoints) => new CircleFill(ctx, FILL_COLOR, center, bezierPoints, (-1) * Math.PI / 2)
			)));
		
		// This is a recursive func used to loop through the animationArrs above with delays
		async function delayLoop(i){
			if(i >= 3){
				return;
			}
			animationThrobberLinksArr[i].startAnimation();
			await new Promise(r => setTimeout(() => (animationThrobberFillsArr[i].startAnimation(), r()), LINK_TIMESPAN));
			setTimeout(() => (delayLoop(i + 1)), FILL_TIMESPAN);
		}

		animationBeziers.startAnimation();
		setTimeout(() => animationArcs.startAnimation(), BEZIER_TIMESPAN);
		setTimeout(() => delayLoop(0), BEZIER_TIMESPAN + ARC_TIMESPAN);
        }, []);

	return (
		<div ref={splashCanvas} className="h-screen w-screen">
		</div>
	);
}

export default SplashScreen;
