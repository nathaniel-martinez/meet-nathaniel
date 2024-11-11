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
		let end = tmp_point_arr.length - 1;
		while(end !== 0){
			for(let i = 0; i < end; i++){
				tmp_point_arr[i] = this.interpolate(tmp_point_arr[i], tmp_point_arr[i+1], t);
			}
			end--;
		}
		return tmp_point_arr[0];
	}
}


// Traverse a line perpendicularly and get the point. Start at linePercent of the line distance and then traverse tangPercent the tangent line which is also
// a percentage of the original lines distance
export function traversePerpendicular(lineStart: Point, lineEnd: Point, linePercent: number, tangPercent: number): Point{
	let x_distance_traversed: number = (lineEnd.x - lineStart.x);
	let y_distance_traversed: number = (lineEnd.y - lineStart.y);
	let perp_start: Point = new Point(lineStart.x + x_distance_traversed*linePercent, lineStart.y + y_distance_traversed*linePercent); 
	return new Point(perp_start.x + y_distance_traversed*tangPercent, perp_start.y - x_distance_traversed*tangPercent);
}
