import { useRef, useEffect } from 'react'

// Some static definitions that are useful for drawing the intro
const MIN_RADIUS = 20;
const RADIUS_GROWTH = 0.05;

// Define points as a class
function newPoint(x_val = 0, y_val = 0){
	return {x: x_val, y: y_val};
}

function interpolate(p0, p1, t) {
    return newPoint((1 - t) * p0.x + t * p1.x, (1 - t) * p0.y + t * p1.y);
}

// Simple function that gets the Bezier "Average" of all points inputed in the array at a specific point of t
function deCastlejauInstance(t, point_arr){
	safe_point_arr = [...point_arr];
	let end = safe_point_arr.length - 1;
	while(end != 0){
		for(let i = 0; i < end; i++){
			safe_point_arr[i] = interpolate(safe_point_arr[i], safe_point_arr[i+1], t);
		}
		end--;
	}
	return safe_point_arr[0];
}

function drawQuarticBezier(ctx, steps, p0, p1, p2, p3, p4){
	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	const point_arr = [p0, p1, p2, p3, p4];
	let t, quart_point;
	for(let i = 0; i < steps; i++){
		t = i/(steps-1);
		quart_point = deCastlejauInstance(t, point_arr);
		ctx.lineto(quart_point.x, quart_point.y);
	}

	ctx.stroke();
}

// The instance of quartic Beziers that we wil use for our animation
function drawSplashBezier(ctx, start, end){
	// Traverse the line above perpendicularly and normal_percent point and go percent amount
	function traverse_perpendicular(normal_percent, percent){
		let x_distance_traversed = (end.x - start.x);
		let y_distance_traversed = (end.y - start.y);
		// Point on normal line normal_percent away from start
		let perp_start = newPoint(start.x + x_distance_traversed*percent, start.y + y_distance_traversed*percent); 
		//The point that is perpendicular to the line and is percent of start to end away from it
		return newPoint(perp_start.x + y_distance_traversed*new_percent, perp_start.y - x_distance_traversed*new_percent);
	}

	let p0 = start;
	let p1 = traverse_perpendicular(0.75, -0.15);
	let p2 = traverse_perpendicular(0.75, 0.45);
	let p3 = traverse_perpendicular(1, 0.05);
	let p4 = end;
	let steps = 1000; //Our Hyperparameter wiggle this until curve looks nice
	drawQuarticBezier(ctx, steps, p0, p1,  p2, p3, p4);
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

		// Quartic Curves used in the SplashScreen
		/*
		const splashCurves = [
			{
				p0: newPoint(canvas.width, 0),
				p1: newPoint(),
				controlX1: 150, controlY1: 50,
				controlX2: 350, controlY2: 50,
				endX: 400, endY: 300
			},

			{
				startX: 50, startY: 100,
				controlX1: 150, controlY1: 50,
				controlX2: 350, controlY2: 50,
				endX: 400, endY: 300
			},

			{
				startX: 50, startY: 100,
				controlX1: 150, controlY1: 50,
				controlX2: 350, controlY2: 50,
				endX: 400, endY: 300
			},

			{
				startX: 50, startY: 100,
				controlX1: 150, controlY1: 50,
				controlX2: 350, controlY2: 50,
				endX: 400, endY: 300
			}
		];
		*/
		let slope = center.y / center.x;
		let inv_slope = -(center.x / center.y);
		let slope_ratio_x = Math.sqrt(1 slope**2);
		drawSplashBezier(ctx, newPoint(0, 0), newPoint(center.x - (loader_radius * slope_ratio_x), y - (loader_radius * slope_ratio_x * slope));
		drawSplashBezier(ctx, newPoint(0, 0), newPoint(center.x - (loader_radius * slope_ratio_x), y - (loader_radius * slope_ratio_x * slope));
		drawSplashBezier(ctx, newPoint(0, 0), newPoint(center.x - (loader_radius * slope_ratio_x), y - (loader_radius * slope_ratio_x * slope));
		drawSplashBezier(ctx, newPoint(0, 0), newPoint(center.x - (loader_radius * slope_ratio_x), y - (loader_radius * slope_ratio_x * slope));
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
