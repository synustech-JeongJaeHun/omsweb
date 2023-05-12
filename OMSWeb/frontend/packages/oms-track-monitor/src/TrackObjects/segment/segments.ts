import { ITrackData, ISegmentPart } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { findPointById } from '../point/points'
import { Point } from '../point/types/Point'
import { Segment } from './types/Segment'
import { SegmentPart } from './types/SegmentPart'
import { makeDFromSegment, most } from './utils/d'
import { makeSegmentsFromParts } from './utils/segment'
import { PathCommand } from 'src/utils/svg/pathSegment'

const segments = ref<Segment[]>([])
/**
 * segments aren't updated, so we can use computed with shallow reference changed.
 * when segments become realtime-update object, then refactoring this map.
 */
const segmentMap = new Map<Segment['id'], Segment>()
const segmentMapByStartPointId = new Map<Point['id'], Segment[]>()

let slopeLines:Points[] =[]
let crossLines:Points[] =[]
let flrLines:Points[] =[]

function initSegments(segparts: ITrackData['segmentParts']) {
	// clean
	segments.value = []
	segmentMap.clear()
	segmentMapByStartPointId.clear()

	// set
	segments.value = makeSegmentsFromParts(segparts ?? [])
	segments.value.forEach((s) => {
    s.startPointDto = findPointById(s.startPoint)
    s.endPointDto= findPointById(s.endPoint)
		// segmentMap
		segmentMap.set(s.id, s)
		// segmentMapByStartPoint
		const key = s.startPoint
		const value = segmentMapByStartPointId.get(key) ?? []
		segmentMapByStartPointId.set(key, [...value, s])
		s.z= findPointById(key)?.z || 0

    const endZ= findPointById(s.endPoint)?.z || 0;
    s.color = (s.z !== endZ)&&s.z - endZ > 0 ?
      '#80C6FF'
      :'#ff7f7f'
	})

	const flr = most(segments.value.map(it=>it.z ?? 0))[0] || 0;
	const bottom = most(segments.value.map(it=>it.z ?? 0), 3).sort((a, b)=>a-b)[0];
	const top = most(segments.value.map(it=>it.z ?? 0), 3).sort((a, b)=>a-b)[2];
	segments.value.sort((a, b) => (a.z || 0) - (b.z || 0))

	const line:{startPoint: Point, endPoint: Point}[] = classifyLine(segparts)
	containLines(line,flr);
  slopeLines = findSlope(line, flr, top).concat(findSlope(line, bottom, flr))

	segments.value.forEach((s) => {
		s.type= existence(s.startPoint, s.endPoint)
	})
}

function existence(start: number, end: number){
  if(crossLines.find(item=>(item.startPoint===start && item.endPoint===end))) {return 'CROSS'}
  else if(flrLines.find(item=>(item.startPoint===start && item.endPoint===end))) {return 'FLOOR'}
	else if(slopeLines.find(item=>(item.startPoint===start && item.endPoint===end))) {return 'SLOPE'}
	return 'OTHER';
}

function findSegmentById(id: number) {
	return segmentMap.get(id)
}

function setSegmentDisabled(
	id: Segment['id'],
	disabled: boolean,
	disabledByMtl: boolean,
  disabledByOnlyVehicle: boolean,
  isDisabledByUser: boolean,
) {
	const segment = findSegmentById(id)
	if (segment === undefined) return

	segment.disabled = disabled
	segment.disabledByMtl = disabledByMtl
  segment.disabledByOnlyVehicle = disabledByOnlyVehicle
  segment.disabledByUser =isDisabledByUser
}

function findSegmentByPoints(startPointId: number, endPointId: number) {
	return segmentMapByStartPointId
		.get(startPointId)
		?.find((s) => s.endPoint === endPointId)
}

function makeD(
	startPointId: number,
	endPointId: number,
	parts: SegmentPart[],
	length: number
) {
	const startPoint = findPointById(startPointId) ?? { x: 0, y: 0 }
	const endPoint = findPointById(endPointId) ?? { x: 0, y: 0 }

	return makeDFromSegment(startPoint, endPoint, parts, length)
}

function checkIntersection(s1: Point, e1: Point, s2: Point, e2: Point): boolean{
	let denominator, a, b, numerator1, numerator2, result = {
		x: 0,
		y: 0,
		onLine1: false,
		onLine2: false
	};
	denominator = ((e2.y - s2.y) * (e1.x - s1.x)) - ((e2.x - s2.x) * (e1.y - s1.y));
	if (denominator == 0) {
			return false;
	}
	a = s1.y - s2.y;
	b = s1.x - s2.x;
	numerator1 = ((e2.x - s2.x) * a) - ((e2.y - s2.y) * b);
	numerator2 = ((e1.x - s1.x) * a) - ((e1.y - s1.y) * b);
	a = numerator1 / denominator;
	b = numerator2 / denominator;

	// if we cast these lines infinitely in both directions, they intersect here:
	result.x = s1.x + (a * (e1.x - s1.x));
	result.y = s1.y + (a * (e1.y - s1.y));
	/*
	// it is worth noting that this should be the same as:
	x = s2.x + (b * (e2.x - s2.x));
	y = s2.x + (b * (e2.y - s2.y));
	*/
	// if line1 is a segment and line2 is infinite, they intersect if:
	if (a > 0 && a < 1) {
			result.onLine1 = true;
	}
	// if line2 is a segment and line1 is infinite, they intersect if:
	if (b > 0 && b < 1) {
			result.onLine2 = true;
	}
	// if line1 and line2 are segments, they intersect if both of the above are true
	return (result.onLine1 && result.onLine2);
}

function classifyLine(segparts: ITrackData['segmentParts']):{startPoint: Point, endPoint: Point}[] {
	let line:{startPoint: Point, endPoint: Point}[] = []

	if(segparts){
		const map = new Map<number, ISegmentPart[]>()
		segparts.forEach(segmentPart => {
			const parts = map.get(segmentPart.id) ?? []
			map.set(segmentPart.id, [...parts, segmentPart])
		})

		map.forEach((parts) => {
			if (parts[0]) {
				const sample = parts[0]
				const startPoint = findPointById(sample.startPoint) ?? { x: 0, y: 0, id: 0, logicalId: '', physicalId: '' }
				const endPoint = findPointById(sample.endPoint) ?? { x: 0, y: 0 , id: 0, logicalId: '', physicalId: '' }
				line.push({startPoint, endPoint})
			}
		})
	}

	return line;
}

function containLines(line:{startPoint: Point, endPoint: Point}[], flr: number){
	for(let i=0; i<line.length; i++){
		for(let j=1; j<line.length-1; j++){
			if(checkIntersection(line[i].startPoint, line[i].endPoint, line[j].startPoint, line[j].endPoint)){
				if(line[i].startPoint.z as number >flr){
					crossLines.push({startPoint: line[i].startPoint.id, endPoint: line[i].endPoint.id})
          flrLines.push({startPoint: line[j].startPoint.id, endPoint: line[j].endPoint.id})
				}
				if(line[i].startPoint.z as number <flr){
					crossLines.push({startPoint: line[j].startPoint.id, endPoint: line[j].endPoint.id})
          flrLines.push({startPoint: line[i].startPoint.id, endPoint: line[i].endPoint.id})
				}
			}
		}
	}
}

function findSlope(line:{startPoint: Point, endPoint: Point}[], b: number, t: number ):Points[] {
	let result : Points[] = [];
	line.forEach(item=> {
    const startZ = item.startPoint.z, endZ = item.endPoint.z;
		if(startZ && endZ&& (endZ - startZ!==0) && startZ>=b && startZ<=t && endZ>=b && endZ<=t)
			result.push({startPoint: item.startPoint.id, endPoint: item.endPoint.id, z: item.startPoint.z});
	})
	return result;
}

export {
	segments,
	initSegments,
	findSegmentById,
	findSegmentByPoints,
	setSegmentDisabled,
	makeD
}


type Points = {
	startPoint: number
	endPoint: number
	z?: number
}
