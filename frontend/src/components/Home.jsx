import axios from 'axios';
import '../App.css';
import { useState, useEffect } from 'react';
import { CartesianGrid, ComposedChart, Line, LineChart, XAxis, YAxis, ReferenceLine, ReferenceArea, Area} from 'recharts';

function Home() {

  const now = new Date();
  const currentHour = now.getHours();
  const [sunMoonData, setSunMoonData] = useState([]);
  const [dayTitles, setDayTitles] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/apigrab1");
        setSunMoonData(response.data.altData); 
        setDayTitles(response.data.titleData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      // console.log(sunMoonData)
    };

    fetchData();
  }, []);

    // console.log(sunMoonData)
    
    return (
    <div className="App">
      <div className="graph-display">

        {/* Sun & Moon Altitudes*/}
        <ComposedChart style={{ width: '100%', aspectRatio: 8, minWidth: 1400, margin: 'auto'}} responsive data={sunMoonData}>
          <defs>
            <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset=".2" stopColor="#ffc658" stopOpacity={0.6} />
              <stop offset="0.5" stopColor="#ffc658" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="moonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset=".2" stopColor="#8884d8" stopOpacity={0.6} />
              <stop offset="0.5" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
          <YAxis domain={[-90, 90]} axisLine={false} tick={false}/>
          {/* DayTitles */}
          <XAxis xAxisId="1"dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
          tickFormatter={(val) => {
            const index = Math.floor(val / 24);
            return dayTitles[index];}}
          />

          <Area type="monotone" dataKey="sun_altitude" stroke="#ffc658" fill="url(#sunGradient)" />
          <Area type="monotone" dataKey="moon_altitude" stroke="#eeedffff" fill="url(#moonGradient)" />

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
          <ReferenceLine y={0} stroke="#CCCCCC"strokeWidth={1}/>
          <ReferenceLine y={-18} stroke="white" strokeDasharray="5 4"/>
          <ReferenceArea y1={0} y2={-90} fill="#00013f64" fillOpacity={1} 
          />
        </ComposedChart>
      </div>
    </div>
  );

}

export default Home;