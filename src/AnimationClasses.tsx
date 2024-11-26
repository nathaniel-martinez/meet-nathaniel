import {Point, Bezier, traversePerpendicular} from "./CanvasFunctions";

interface AnimatableShape{
	color: string;
	ctx: any;
	step(t: number): void;
}

export class BezierWrapers implements AnimatableShape{
	ctx: any;
	color: string;
	beziers: [Bezier, Bezier] = [new Bezier(), new Bezier()];
	currentState: [Point, Point] = [new Point(), new Point()];
	static count: number = 1;

	constructor(ctx: any, color: string, wrapWidth: number, centerBezier: Bezier){
		this.color = color;
		this.ctx = ctx;
		const wrapDecr = wrapWidth / (centerBezier.getNumOfControlPoints() - 1);
		let i = 0;
		for(let sign = -1; sign <= 1; sign = sign + 2){
			let firstPoint: Point = centerBezier.getFirstPoint();
			let lastPoint: Point = centerBezier.getLastPoint();
			let newFirstPoint: Point = traversePerpendicular(firstPoint, lastPoint, 0, wrapWidth * sign);
			let xChange: number = (newFirstPoint.x - firstPoint.x);
			let yChange: number = (newFirstPoint.y - firstPoint.y);
			let transformPoints: Point[] = new Array(centerBezier.getNumOfControlPoints());
			transformPoints[0] = newFirstPoint;
			for(let j = 1; j < centerBezier.getNumOfControlPoints(); j++){
				let p: Point = centerBezier.getControlPoint(j);
				transformPoints[j] = new Point(p.x + xChange * (centerBezier.getNumOfControlPoints() - 1 - j)*wrapDecr, p.y + yChange * (centerBezier.getNumOfControlPoints() - 1 - j)*wrapDecr);
			}
			this.beziers[i] = new Bezier(transformPoints);
			i++;
		}
		this.reset();
	}

	step(t: number): void{
		console.log(`${BezierWrapers.count}. State is ${this.currentState.join(', ')}\n`);
		let start: Point = this.currentState[0];
		let end: Point = this.currentState[1];
		this.currentState[0] = this.beziers[0].getPoint(t);
		this.currentState[1] = this.beziers[1].getPoint(t);

		console.log(`${BezierWrapers.count}. changed state is ${this.currentState.join(', ')}\n\n`);
		let prevFillStyle = this.ctx.fillStyle;
		this.ctx.fillStyle = this.color;

		this.ctx.beginPath();
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(this.currentState[0].x, this.currentState[0].y);
		this.ctx.lineTo(this.currentState[1].x, this.currentState[1].y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.fillStyle = prevFillStyle;
		BezierWrapers.count = BezierWrapers.count + 1;
	}

	reset(): void{
		this.currentState[0] = this.beziers[0].getFirstPoint();
		this.currentState[1] = this.beziers[0].getLastPoint();
	}
}

export class AnimatableGroup{
	timeSpan: number;
	shapes: AnimatableShape[];
	easingFunc: (x: number)=>number;
	animationStart!: number;
	constructor(timeSpan: number, easingFunc: (x: number)=>number, shapeArray: AnimatableShape[]){
		this.timeSpan = timeSpan;
		this.shapes = shapeArray;
		this.easingFunc = easingFunc;
	}
	
	animationCallBack(timeStamp: number): void{
		let currentT = this.easingFunc(Math.min((timeStamp-this.animationStart)/this.timeSpan, 1));
		for(let i = 0; i < this.shapes.length; i++){
			this.shapes[i].step(currentT);
		}
		if(currentT < 1){
			requestAnimationFrame(this.animationCallBack.bind(this));
		}
	}

	startAnimation(): void{
		requestAnimationFrame((timeStamp: number)=>{
			this.animationStart = timeStamp;
			requestAnimationFrame(this.animationCallBack.bind(this))
		});
	}
}
