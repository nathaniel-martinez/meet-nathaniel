import {Point, Bezier, traversePerpendicular} from "./CanvasFunctions";

interface AnimatableShape{
	step(t: number): void;
}

export class BezierWrapers implements AnimatableShape{
	beziers: [Bezier, Bezier];
	currentState: [Point, Point];

	constructor(centerBezier: Bezier, wrapWidth: number){
		const wrapDecr = wrapWidth / (centerBezier.length - 1);
		let i = 0;
		for(let sign = -1; sign <= 1; sign = sign + 2){
			let firstPoint: Point = centerBezier.getFirstPoint();
			let lastPoint: Point = centerBezier.getLastPoint();
			let newFirstPoint: Point = traversePerpendicular(firstPoint, lastPoint, 0, wrapwidth * sign);
			let xChange: number = (newFirstPoint.x - firstPoint.x);
			let yChange: number = (newFirstPoint.y - firstPoint.y);
			let transformPoints: Point[] = new Array(centerBezier.length);
			for(let j = 0; j < centerBezier.length; j++){
				let p: Point = centerBezier.getControlPoint(j);
				transformPoints[j] = new Point(p.x + x_Change * ((4-j)*wrapDecr), p.y + yChange * ((4-j)*wrapDecr));
			}
			beziers[i] = new Bezier(transformPoint);
			i++;
		}
		reset();
	}

	step(t: number): void{
		let start: Point = currentState[0];
		let end: Point = currentState[1];
		currentState[0] = beziers[0].getPoint(t);
		currentState[1] = beziers[1].getPoint(t);

		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(currentState[0].x, currentState[0].y);
		ctx.lineTo(currentState[1].x, currentState[1].y);
		ctx.lineTo(end.x, end.y);
		ctx.endPath();
		ctx.fill();
	}

	reset(): void{
		currentState[0] = beziers[0].getFirstPoint();
		currentState[1] = beziers[0].getLastPoint();
	}
}

class AnimatableGroup{
	this.timeSpan: number;
	this.shapeArray: AnimatableShape[];
	this.easingFunc: (number)=>number;
	this.animationStart: number;

	constructor(timeSpan: number, easingFunc: (number)=>number, shapeArray: AnimatableShape[]){
		this.timeSpan = timeSpan;
		this.shapeArray = shapeArray;
		this.easingFunc = easingFunc;
	}
	
	animationStep(timeStamp: number): void{
		let currentT = easingFunc(Math.min((timeStamp-this.animationStart)/this.timeSpan, 1));
		for(let i = 0; i < shapeArray.length; i++){
			shapeArray[i].step(t);
		}
		if(currentT < 1){
			return requestAnimationFrame(animationStep);
		}
	}

	startAnimation(): void{
		requestAnimationFrame(animationStep);
	}
}
