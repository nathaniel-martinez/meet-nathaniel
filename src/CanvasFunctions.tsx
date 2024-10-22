export class Point{
	this.x: number;
	this.y: number;
	constructor(x_val: number, y_val:number){
		this.x = x_val;
		this.y = y_val;
	}
}

/* Dont htink i need
export class StartAndEnd{
	this.start: point;
	this.end: point;

	constructor(p1: point, p2: point){
		this.start = p1;
		this.end = p2;
	}
}
*/

export class Bezier{
	pointArr: Point[];
	length: number;

	constructor(pointArr: Point[]){
		pointArr = [...pointArr];
		length = pointArr.length;
	}

	
	getFirstPoint(): Point{
		return pointArr[0];
	}

	getLastPoint(): Point{
		return pointArr[length - 1];
	}
	
	getControlPoint(i: number): Point{
		return pointArr[i];
	}
	
	interpolate(p0: Point, p1: Point, t: number): Point{
	    return new Point((1 - t) * p0.x + t * p1.x, (1 - t) * p0.y + t * p1.y);
	}

	getPoint(t: number): point{
		let tmp_point_arr = [...this.pointArr];
		let end = tmp_point_arr.length - 1;
		while(end !== 0){
			for(let i = 0; i < end; i++){
				point_arr[i] = interpolate(point_arr[i], point_arr[i+1], t);
			}
			end--;
		}
		return tmp_point_arr[0];
	}
}


// Traverse a line perpendicularly and get the point. Start at linePercent of the line distance and then traverse tangPercent the tangent line which is also
// a percentage of the original lines distance
export function traversePerpendicular(lineStart: point, lineEnd: point, linePercent: number, tangPercent: number): point{
	let x_distance_traversed: number = (lineEnd.x - lineStart.x);
	let y_distance_traversed: number = (lineEnd.y - lineStart.y);
	let perp_start: point = new Point(lineStart.x + x_distance_traversed*linePercent, lineStart.y + y_distance_traversed*linePercent); 
	return new Point(perp_start.x + y_distance_traversed*tangPercent, perp_start.y - x_distance_traversed*tangPercent);
}
