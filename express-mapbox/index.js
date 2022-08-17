const express = require('express')
const app = express()
const port = 3002
var cors = require('cors')

function onSegment(p,q,r)
{
	if (q[0] <= Math.max(p[0], r[0]) &&
			q[0] >= Math.min(p[0], r[0]) &&
			q[1] <= Math.max(p[1], r[1]) &&
			q[1] >= Math.min(p[1], r[1]))
		{
			return true;
		}
		return false;
}

function orientation(p,q,r)
{
	let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
		if (val == 0)
		{
			return 0; 
		}
		return (val > 0) ? 1 : 2;
}
function doIntersect(p1,q1,p2,q2)
{
		let o1 = orientation(p1, q1, p2);
		let o2 = orientation(p1, q1, q2);
		let o3 = orientation(p2, q2, p1);
		let o4 = orientation(p2, q2, q1);

		if (o1 != o2 && o3 != o4)
		{
			return true;
		}

		if (o1 == 0 && onSegment(p1, p2, q1))
		{
			return true;
		}
		if (o2 == 0 && onSegment(p1, q2, q1))
		{
			return true;
		}

		if (o3 == 0 && onSegment(p2, p1, q2))
		{
			return true;
		}

		if (o4 == 0 && onSegment(p2, q1, q2))
		{
			return true;
		}

		return false;
}

function isInside(polygon,n,p)
{
		if (n < 3)
		{
			return false;
		}

		let extreme = [1000, p[1]];

		let count = 0, i = 0;
		do
		{
			let next = (i + 1) % n;
			if (doIntersect(polygon[i], polygon[next], p, extreme))
			{
				if (orientation(polygon[i], p, polygon[next]) == 0)
				{
					return onSegment(polygon[i], p,
									polygon[next]);
				}
				count++;
			}
			i = next;
		} while (i != 0);
		return (count % 2 == 1);
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('React Application for MapBox');
})

app.post('/calculate', (req, res) => {
  let mapPoints = [];
  let xCoordinates = [];
  let yCoordinates = [];
  req.body?.features?.[0]?.geometry?.coordinates?.[0].forEach(element => {
    xCoordinates.push(element[0]);
    yCoordinates.push(element[1]);
  });
  let xMin = Math.min(...xCoordinates);
  let xMax = Math.max(...xCoordinates);
  let yMin = Math.min(...yCoordinates);
  let yMax = Math.max(...yCoordinates);
  let polygon = req.body?.features?.[0]?.geometry?.coordinates?.[0]
  let size = polygon.length

  for(let i = 0; i < 6; i++){
    let lng = Math.random() * (xMax - xMin) +xMin
    let lat = Math.random() * (yMax - yMin) +yMin

    while(!isInside(polygon, size, [lng, lat])){
      lng = Math.random() * (xMax - xMin) +xMin
      lat = Math.random() * (yMax - yMin) +yMin
    }
    mapPoints.push({lng , lat})
  }

  res.send(mapPoints);
})

app.listen(port, () => console.log("Listening on port 3002"));