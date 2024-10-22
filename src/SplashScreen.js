import { useRef, useEffect } from 'react'

// Some static definitions that are useful for drawing the intro
const MIN_RADIUS = 20;
const RADIUS_GROWTH = 0.05;


// Simple function that gets the Bezier "Average" of all points inputed in the array at a specific point of t

/*
function drawQuarticBezier(ctx, steps, p0, p1, p2, p3, p4){
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	const point_arr = [p0, p1, p2, p3, p4];
	const wrapperPoints = [];
	const wrapWidth = 0.25;
	const wrapDecr = wrapWidth / 4;
	// Create 2 new bezier curves that wrap the original bezier curve
	for(let i = -1; i <= 1; i=i+2){
		let newP0 = traversePerpendicular(p0, p4, 0, wrapWidth * i);
		let transform = {"x_part": (newP0.x - p0.x), "y_part": (newP0.y - p0.y)};
		let transformPoints = new Array(5);
		for(let j = 0; j < 5; j++){
			// transfrom is decremented as we approach the end. This allows our wrapper bezier curves to converge
			transformPoints[j] = newPoint(point_arr[j].x+transform.x_part*((4-j)*wrapDecr), point_arr[j].y+transform.y_part*((4-j)*wrapDecr));
		}
		wrapperPoints.push(transformPoints);
	}
	let t, quart_point;
	for(let i = 0; i < steps; i++){
		t = i/(steps-1);
		quart_point = deCastlejauInstance(t, point_arr);
		ctx.lineTo(quart_point.x, quart_point.y);
	}
	if(!recurse){
		ctx.strokeStyle = "red";
	}
	ctx.stroke();
}

*/

/*
 * This function is used to animate a series of polygons. 
*/
function newPolygonAnimator(ctx, timeSpan, easingFunc, polyDescriptions, prevStates, drawFunc){
	debugger;
	let animationStart = performance.now();
	let newPrevStates = [...prevStates];

	function polygonAnimator(timeStamp){
		let currentT = easingFunc(Math.min((timeStamp-animationStart)/timeSpan, 1));
		for(let i = 0; i < polyDescriptions.length; i++){
			newPrevStates[i] = drawFunc(currentT, polyDescriptions[i], newPrevStates[i]);
		}
		if(currentT < 1){
			return requestAnimationFrame(polygonAnimator);
		}
	}

	return ()=>{requestAnimationFrame(polygonAnimator)};
}

function animateQuarticBeziers(ctx, timeSpan, fillColor, bezierArr){
	const wrapperBezierArr = [];
	const initialState = [];
	const wrapWidth = 0.25;
	const wrapDecr = wrapWidth / 4;
	for(let bezier of bezierArr){
		// Create 2 new bezier curves that wrap the original bezier curve
		let wrapperBeziers = [];
		for(let i = -1; i <= 1; i = i + 2){
			let newp0 = traverseperpendicular(bezier[0], bezier[4], 0, wrapwidth * i);
			let transform = {"x_part": (newp0.x - bezier[0].x), "y_part": (newp0.y - bezier[0].y)};
			let transformpoints = new array(5);
			let j = 0;
			for(let point of bezier){
				transformpoints[j] = newpoint(point.x+transform.x_part*((4-j)*wrapdecr), point.y+transform.y_part*((4-j)*wrapdecr));
				j++;
			}
			debugger;
			wrapperbeziers.push(transformpoints);
		}
		debugger;
		wrapperBezierArr.push(wrapperBeziers);
		initialState.push(newStartAndEnd(wrapperBeziers[0].p0, wrapperBeziers[1].p0));
	}

	const easingFunc = x => x * x;

	const deCastlejauInstance = (t, bezier) => {
		debugger;
		let point_arr = Object.values(bezier);
		let end = point_arr.length - 1;
		while(end !== 0){
			for(let i = 0; i < end; i++){
				point_arr[i] = interpolate(point_arr[i], point_arr[i+1], t);
			}
			end--;
		}
		return point_arr[0];
	}

	const quarticBezierDrawFunc = (ctx, t, wrapperBeziers, prevState) => {
		let p1 = deCastlejauInstance(t, wrapperBeziers[0]);
		let p2 = deCastlejauInstance(t, wrapperBeziers[1]);
		let newPrevState = newStartAndEnd(p1, p2);
		ctx.beginPath();
		ctx.moveTo(prevState.start);
		ctx.lineTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.lineTo(prevState.end);
		ctx.closePath();
		ctx.fillStyle = fillColor;
		ctx.fill();
		return newPrevState;
	}

	const startQuarticAnimation = newPolygonAnimator(ctx, timeSpan, easingFunc, wrapperBezierArr, initialState, quarticBezierDrawFunc);
	startQuarticAnimation();
}

// Simply to Test
function drawPoints(ctx, pointArr, color="green"){
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(pointArr[0].x, pointArr[0].y)
	for(let i = 1; i < pointArr.length; i++){
		ctx.lineTo(pointArr[i].x, pointArr[i].y);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(pointArr[0].x, pointArr[0].y)
	ctx.lineTo(pointArr[4].x, pointArr[4].y)
	ctx.stroke();
	ctx.strokeStyle = "black";
}
// The instance of quartic Beziers that we wil use for our animation
/*
function drawSplashBeziers(ctx, start, end, center){
	let p0 = start;
	let p1 = traversePerpendicular(start, end, 0.75, 0.15);
	let p2 = traversePerpendicular(start, end, 0.75, -0.45);
	let p3 = traversePerpendicular(end, center, 0, -1);
	let p4 = end;
	let steps = 1000; //Our Hyperparameter wiggle this until curve looks nice
	drawQuarticBezier(ctx, steps, p0, p1,  p2, p3, p4);
}
*/

// Draw our Splash Bezziers simultaniously and smoothly given an input array of bezzier start and endpoints
// our input objects can be defined only with a start and end point
function drawSplashBeziers(ctx, timeSpan, fillColor, center, splashBezierArr){
	debugger;
	// Turn our splashBezierArr into a an Array of true bezier objects not the simplified ones
	let trueBezierPointsArr = splashBezierArr.map(splashBezier => (
		{
		 "p0": splashBezier.start,
		 "p1": traversePerpendicular(splashBezier.start, splashBezier.end, 0.75, 0.15),
		 "p2": traversePerpendicular(splashBezier.start, splashBezier.end, 0.75, -0.45),
		 "p3": traversePerpendicular(splashBezier.end, center, 0, -1),
		 "p4": splashBezier.end
		}
	));
	animateQuarticBeziers(ctx, timeSpan, fillColor, trueBezierPointsArr)
}

function SplashScreen(){
	let splashCanvas = useRef(null);
	useEffect(() => {
                const canvas = splashCanvas.current;
                const ctx = canvas.getContext('2d');

		// Adjust the canvas to be able to use the amount of pixel available in the inner window
		const scale = window.devicePixelRatio;
		console.log(scale);
		canvas.width = canvas.clientWidth * scale;
		canvas.height = canvas.clientHeight * scale;

		// Simple function to make actual radius size responsive
		let loader_radius = (MIN_RADIUS) + (canvas.width - MIN_RADIUS) * RADIUS_GROWTH

		let center = newPoint(canvas.width / 2, canvas.height / 2);

		//Non transparent background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

		//let slope = center.y / center.x;
		let slope = 1;
		//let slope_ratio_x = Math.sqrt(1 + slope**2);
		let slope_ratio_x = Math.sqrt(2);
		let radius_x_component = (loader_radius / slope_ratio_x);
		let radius_y_component = radius_x_component * slope;

		const splashBezierTime = 1000;
		const splashBezierFillColor = "black";
		const splashBezierStartAndEnds = [
			newStartAndEnd(
				newPoint(0, 0), 
				newPoint(center.x - radius_x_component, center.y - radius_y_component)
			),

			newStartAndEnd(
				newPoint(0, canvas.height),
				newPoint(center.x - radius_x_component, center.y + radius_y_component)
			),
			newStartAndEnd(
				newPoint(canvas.width, canvas.height),
				newPoint(center.x + radius_x_component, center.y + radius_y_component)
			),
			newStartAndEnd(
				newPoint(canvas.width, 0),
				newPoint(center.x + radius_x_component, center.y - radius_y_component)
			)
		];
		drawSplashBeziers(ctx, splashBezierTime, splashBezierFillColor, center, splashBezierStartAndEnds);

		//Center Circle
		ctx.beginPath();
		ctx.arc(center.x, center.y, loader_radius, 0, Math.PI * 2);
		ctx.fillStyle = 'blue';
		ctx.fill();
        }, []);

	return (
		<canvas ref={splashCanvas} className="h-screen w-screen bg-red">
		</canvas>
	);
}

export default SplashScreen;
