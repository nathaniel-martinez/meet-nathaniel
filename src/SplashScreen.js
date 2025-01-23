import { useRef, useEffect } from 'react'
import {Point, Bezier, radiusComponents, traversePerpendicular, rotatePoint, traverseRadius} from "./CanvasFunctions";
import {AnimatableGroup, BezierWrapers, Arc, CircleLink, CircleFill} from "./AnimationClasses";
import * as PIXI form 'pixi.js';

// Some static definitions that are useful for drawing the intro
const MIN_RADIUS = 80;
const RADIUS_GROWTH = 0.06;

// Bezier CONSTS
const BEZIER_TIMESPAN = 1000;
const BEZIER_EASINGFUNC = x=>x**2;
const BEZIER_COLOR = "black";
const BEZIER_WIDTH = 0.2;

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


// Simply to Test the drawing of points so that we can see the points
//function drawPoints(ctx, pointArr, color="green"){
	//ctx.strokeStyle = color;
	//ctx.beginPath();
	//ctx.moveTo(pointArr[0].x, pointArr[0].y)
	//for(let i = 1; i < pointArr.length; i++){
		//ctx.lineTo(pointArr[i].x, pointArr[i].y);
	//}
	//ctx.stroke();
	//ctx.beginPath();
	//ctx.moveTo(pointArr[0].x, pointArr[0].y)
	//ctx.lineTo(pointArr[4].x, pointArr[4].y)
	//ctx.stroke();
	//ctx.strokeStyle = "black";
//}

function SplashScreen(){
	let splashCanvas = useRef(null);
	useEffect(() => {
                const canvas = splashCanvas.current;
                const ctx = canvas.getContext('2d');
		
		//if(!gl){
			//console.log("WebGL not supported, skipping splash screen");
			//return;
		//}

		ctx.imageSmoothingEnabled = true;

		// Adjust the canvas to be able to use the amount of pixel available in the inner window
		const scale = window.devicePixelRatio;
		canvas.width = canvas.clientWidth * scale;
		canvas.height = canvas.clientHeight * scale;

		// Simple function to make actual radius size responsive
		let loader_radius = (MIN_RADIUS) + (canvas.width - MIN_RADIUS) * RADIUS_GROWTH

		let center = new Point(canvas.width / 2, canvas.height / 2);

		//Non transparent background
                //gl.clearColor(1, 1, 1, 1);
		//gl.clear(gl.COLOR_BUFFER_BIT);

		//convert radtiens to degrees
		let [radius_x, radius_y] = radiusComponents(center, loader_radius, Math.PI / 4);

		const splashBezierStartAndEnds = [
			{
				"start": new Point(0, 0), 
				"end": new Point(center.x - radius_x, center.y - radius_y)
			},

			{
				"start": new Point(0, canvas.height),
				"end": new Point(center.x - radius_x, center.y + radius_y)
			},
			
			{
				"start": new Point(canvas.width, canvas.height),
				"end": new Point(center.x + radius_x, center.y + radius_y)
			},

			{
				"start": new Point(canvas.width, 0),
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
		<canvas ref={splashCanvas} className="h-screen w-screen bg-red">
		</canvas>
	);
}

export default SplashScreen;
