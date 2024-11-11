import { useRef, useEffect } from 'react'
import {Point, Bezier, traversePerpendicular} from "./CanvasFunctions";
import {AnimatableGroup, BezierWrapers} from "./AnimationClasses";

// Some static definitions that are useful for drawing the intro
const MIN_RADIUS = 20;
const RADIUS_GROWTH = 0.05;


const BEZIER_TIMESPAN = 1000;
const BEZIER_EASINGFUNC = x=>x**2;
const BEZIER_COLOR = "black";
const BEZIER_WIDTH = 0.2;

// Simply to Test
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
		ctx.imageSmoothingEnabled = false;

		// Adjust the canvas to be able to use the amount of pixel available in the inner window
		const scale = window.devicePixelRatio;
		console.log(scale);
		canvas.width = canvas.clientWidth * scale;
		canvas.height = canvas.clientHeight * scale;

		// Simple function to make actual radius size responsive
		let loader_radius = (MIN_RADIUS) + (canvas.width - MIN_RADIUS) * RADIUS_GROWTH

		let center = new Point(canvas.width / 2, canvas.height / 2);

		//Non transparent background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

		//let slope = center.y / center.x;
		let slope = 1;
		//let slope_ratio_x = Math.sqrt(1 + slope**2);
		let slope_ratio_x = Math.sqrt(2);
		let radius_x_component = (loader_radius / slope_ratio_x);
		let radius_y_component = radius_x_component * slope;

		const splashBezierStartAndEnds = [
			{
				"start": new Point(0, 0), 
				"end": new Point(center.x - radius_x_component, center.y - radius_y_component)
			},

			//{
				//"start": new Point(0, canvas.height),
				//"end": new Point(center.x - radius_x_component, center.y + radius_y_component)
			//},
//
			//{
				//"start": new Point(canvas.width, canvas.height),
				//"end": new Point(center.x + radius_x_component, center.y + radius_y_component)
//
			//},
//
			//{
				//"start": new Point(canvas.width, 0),
				//"end": new Point(center.x + radius_x_component, center.y - radius_y_component)
			//}
		];


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

		const animationBeziers = new AnimatableGroup(BEZIER_TIMESPAN, BEZIER_EASINGFUNC, bezierArr);
		animationBeziers.startAnimation();

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
