import {Point, Bezier, traversePerpendicular, rotatePoint} from "./CanvasFunctions";

interface AnimatableShape{
	color: string;
	ctx: any;
	fragmentCondition: (tVarName: string, flagVarName: string)=>string;
}



export class Arc implements AnimatableShape{
	ctx: any;
	color: string;
	strokeWidth: number;
	radius: number;
	center: Point;
	startAngle: number;
	endAngle: number;
	currentState: number;

	constructor(ctx: any, color: string, strokeWidth: number, radius: number, center: Point, startAngle: number, endAngle: number){
		this.color = color;
		this.strokeWidth = strokeWidth;
		this.ctx = ctx;
		this.radius = radius;
		this.center = center;
		this.startAngle = startAngle;
		this.currentState = startAngle;
		this.endAngle = endAngle;
	}

	step(t: number): void{
		let stepStart: number = this.currentState;
		let stepEnd: number = (this.endAngle - this.startAngle) * t + this.startAngle;

		this.ctx.beginPath();
		this.ctx.arc(this.center.x, this.center.y, this.radius, stepStart, stepEnd);
		this.ctx.strokeStyle = this.color;
		this.ctx.lineWidth = this.strokeWidth;
		this.ctx.stroke();
		this.ctx.closePath();

		this.currentState = stepEnd;
	}
}


export class CircleLink implements AnimatableShape{
	ctx: any;
	color: string;
	strokeWidth: number;
	bezier: Bezier = new Bezier();
	currentState: Point = new Point();

	constructor(ctx: any, color: string, strokeWidth: number, bezier: Bezier){
		this.color = color;
		this.ctx = ctx;
		this.strokeWidth = strokeWidth;
		this.bezier = bezier;
		this.currentState = bezier.getFirstPoint();
	}
	
	step(t: number): void{
		let start: Point = this.currentState;
		this.currentState = this.bezier.getPoint(t);

		this.ctx.beginPath();
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(this.currentState.x, this.currentState.y);
		this.ctx.strokeStyle = this.color;
		this.ctx.stroke();
		this.ctx.closePath();
	}
}

export class CircleFill implements AnimatableShape{
	ctx: any;
	color: string;
	center: Point;
	angleDistance: number;
	currentState: Point[] = [new Point(), new Point(), new Point];

	constructor(ctx: any, color: string, center: Point, bezierPoints: Point[], angleDistance: number){
		this.color = color;
		this.ctx = ctx;
		this.center = center;
		this.angleDistance = angleDistance;
		this.currentState = bezierPoints;
	}

	step(t: number): void{
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;

		// drawing start bezier
		this.ctx.beginPath();
		this.ctx.moveTo(this.currentState[0].x, this.currentState[0].y);
		this.ctx.quadraticCurveTo(this.currentState[1].x, this.currentState[1].y, this.currentState[2].x, this.currentState[2].y);
		
		//drawing end bezier
		let stepAngleDistance = this.angleDistance * t;
		let endBezerPoints: Point[] = this.currentState.map((p: Point)=>{return rotatePoint(this.center, p, stepAngleDistance)});
		this.ctx.moveTo(endBezerPoints[0].x, endBezerPoints[0].y);
		this.ctx.quadraticCurveTo(endBezerPoints[1].x, endBezerPoints[1].y, endBezerPoints[2].x, endBezerPoints[2].y);

		this.ctx.fill();
		this.ctx.closePath();
	}
}

export class BezierWrapers implements AnimatableShape{
	ctx: any;
	color: string;
	beziers: [Bezier, Bezier] = [new Bezier(), new Bezier()];
	fragmentEDF: string = '';

	constructor(color: string, wrapWidth: number, centerBezier: Bezier){
		this.color = color;
		const wrapDecr = wrapWidth / (centerBezier.getNumOfControlPoints() - 1);
		let i = 0;
		for(let sign = -1; sign <= 1; sign = sign + 2){
			let firstPoint: Point = centerBezier.getFirstPoint();
			let lastPoint: Point = centerBezier.getLastPoint();
			let newFirstPoint: Point = traversePerpendicular(firstPoint, lastPoint, 0, wrapWidth * sign);
			let xChange: number = (newFirstPoint.x - firstPoint.x);
			let yChange: number = (newFirstPoint.y - firstPoint.y);
			let transformPoints: Point[] = new Array(centerBezier.getNumOfControlPoints());
			const MAX_DECR = centerBezier.getNumOfControlPoints() - 2;
			transformPoints[0] = newFirstPoint;
			for(let j = 1; j < centerBezier.getNumOfControlPoints(); j++){
				let p: Point = centerBezier.getControlPoint(j);
				transformPoints[j] = new Point(p.x + xChange * (centerBezier.getNumOfControlPoints() - 1 - j)*wrapDecr, p.y + yChange * (centerBezier.getNumOfControlPoints() - 1 - j)*wrapDecr);
			}
			this.beziers[i] = new Bezier(transformPoints);
			i++;
		}

		this.fragmentEDF = `
				{ 	
					vec2 topBezier(t){
						return 
			`;
		for(let i = 0; i < this.beziers[0].getNumOfControlPoints(); i++){
			this.fragmetnEDF += 

	}

	function binomialCoefficient(n, k) {
		let result = 1;
		for (let i = 0; i < k; i++) {
		    result *= (n - i) / (i + 1);
		}
		return result;
	}
}

export class AnimatableGroup{
	timeSpan: number;
	shapes: AnimatableShape[];
	easingFunc: (x: number)=>number;
	animationStart!: number;
	vertexShader: string = '';
	fragmentShader: string = '';


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
