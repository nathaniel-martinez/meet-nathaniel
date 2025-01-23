export class Point{
	x: number;
	y: number;


	constructor(x_val?: number, y_val?: number){
		this.x = x_val ?? -1;
		this.y = y_val ?? -1;
	}

	toString(): string{
		return `{x:${this.x}, y:${this.y}}`;
	}
}

export class Bezier{
	pointArr: Point[];
	pointArrLength: number;


	constructor(pointArr?: Point[]){
		this.pointArr = pointArr ? [...pointArr] : [new Point()];
		this.pointArrLength = pointArr?.length ?? -1;
	}

	
	getNumOfControlPoints(){
		return this.pointArrLength;
	}

	getFirstPoint(): Point{
		return this.getControlPoint(0);
	}

	getLastPoint(): Point{
		return this.getControlPoint(this.pointArrLength - 1);
	}
	
	getControlPoint(i: number): Point{
		return this.pointArr[i];
	}
	
	interpolate(p0: Point, p1: Point, t: number): Point{
	    return new Point((1 - t) * p0.x + t * p1.x, (1 - t) * p0.y + t * p1.y);
	}

	getPoint(t: number): Point{
		let tmp_point_arr = [...this.pointArr];
		let count = tmp_point_arr.length - 1;
		while(count !== 0){
			for(let i = 0; i < count; i++){
				tmp_point_arr[i] = this.interpolate(tmp_point_arr[i], tmp_point_arr[i+1], t);
			}
			count--;
		}
		return tmp_point_arr[0];
	}
}

export function radiusComponents(center: Point, radius: number, angle: number): [number, number]{
	return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// Traverse a line perpendicularly and get the point. Start at linePercent of the line distance and then traverse tangPercent the tangent line which is also
// a percentage of the original lines distance
export function traversePerpendicular(lineStart: Point, lineEnd: Point, linePercent: number, tangPercent: number): Point{
	let x_distance_traversed: number = (lineEnd.x - lineStart.x);
	let y_distance_traversed: number = (lineEnd.y - lineStart.y);
	let perp_start: Point = new Point(lineStart.x + x_distance_traversed*linePercent, lineStart.y + y_distance_traversed*linePercent); 
	return new Point(perp_start.x + y_distance_traversed*tangPercent, perp_start.y - x_distance_traversed*tangPercent);
}

// Rotates a point along a circle as if it were on the circumference
// All angles are radians
export function rotatePoint(center: Point, point: Point,  angle: number): Point{
	let currentAngle = Math.atan2(point.y - center.y, point.x - center.x);
	let newAngle = currentAngle - angle;
	let radius = Math.sqrt((point.x - center.x)**2 + (point.y - center.y)**2);
	let x = center.x + radius * Math.cos(newAngle);
	let y = center.y + radius * Math.sin(newAngle);
	return new Point(x, y);
}

// Pretending that the radius of a circle is infinite, move along this line
export function traverseRadius(center: Point, point: Point, amount: number): Point{
	let angle = Math.atan2(point.y - center.y, point.x - center.x);
	let radius = Math.sqrt((point.x - center.x)**2 + (point.y - center.y)**2);
	let newRadius = radius + amount;
	let x = center.x + newRadius * Math.cos(angle);
	let y = center.y + newRadius * Math.sin(angle);
	return new Point(x, y);
}
