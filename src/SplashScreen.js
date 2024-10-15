import { useRef, useEffect } from 'react'

// Some constant definitions that are useful for drawing the intro
const MIN_RADIUS = 20;
const RADIUS_GROWTH = 0.1;
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

		let center = {"x": canvas.width / 2, "y": canvas.height / 2}; 

		//Non transparent background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

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
