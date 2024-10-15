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




function SplashScreen(){
	let splashCanvas = useRef(null);
        const introCurves = [
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
                },

                {
                        startX: 50, startY: 100,
                        controlX1: 150, controlY1: 50,
                        controlX2: 350, controlY2: 50,
                        endX: 400, endY: 300
                }
        ];

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

		drawQuarticBezier(ctx, newPoint(0, 0), newPoint(
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
