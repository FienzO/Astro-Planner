import axios from 'axios';
import '../App.css';
import { useState, useEffect } from 'react';
import { CartesianGrid, ComposedChart, Line, LineChart, XAxis, YAxis, ReferenceLine, ReferenceArea, Area, Tooltip} from 'recharts';

function Home() {

  const now = new Date();
  const currentHour = now.getHours();
  const [sunMoonData, setSunMoonData] = useState([]);
  const [tempDewData, setTempDewData] = useState([]);
  const [dayTitles, setDayTitles] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/apigrab1");
        setSunMoonData(response.data.altData); 
        setTempDewData(response.data.tempData);
        setDayTitles(response.data.titleData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    console.log(tempDewData)

    fetchData();
  }, []);


    // console.log(tempDewData)
    
    return (
    <div className="App">
      <div className="graph-display">

        {/* Sun & Moon Altitudes*/}
        <ComposedChart style={{ width: '100%', aspectRatio: 8, minWidth: 1400, margin: 'auto'}} responsive data={sunMoonData}>
          <defs>
            <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1" unit="°">
              <stop offset=".2" stopColor="#ffc658" stopOpacity={0.6} />
              <stop offset="0.5" stopColor="#ffc658" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="moonGradient" x1="0" y1="0" x2="0" y2="1" unit="°">
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
          <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <Area type="monotone" dataKey="sun_altitude" stroke="#ffc658" fill="url(#sunGradient)" />
          <Area type="monotone" dataKey="moon_altitude" stroke="#eeedffff" fill="url(#moonGradient)" />

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
          <ReferenceLine y={0} stroke="#CCCCCC"strokeWidth={1}/>
          <ReferenceLine y={-18} stroke="white" strokeDasharray="5 4"/>
          <ReferenceArea y1={0} y2={-90} fill="#00013f64" fillOpacity={1} 
          />
        </ComposedChart>

        {/* Temperature & Dewpoint */}
        <ComposedChart style={{ width: '100%', aspectRatio: 8, minWidth: 1400, margin: 'auto'}} data={tempDewData}>
          <defs>
            <Line type="monotone" dataKey="temp" stroke="#ffa200ff" strokeWidth={1} dot={false} name="Temperature" unit="°C"/>
            <Line type="monotone" dataKey="dewpoint" stroke="#8884d8" strokeWidth={1} dot={false} name="Dew Point" unit="°C"/>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

          <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
          <XAxis xAxisId="1"dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
          tickFormatter={(val) => {
            const index = Math.floor(val / 24);
            return dayTitles[index];}}
          />
          <YAxis domain={['auto', 'auto']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit="°C" />

          <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
          <ReferenceLine y={0} stroke="#4dabff" strokeWidth={2} strokeDasharray="5 5" />

          <ReferenceArea y1={-50} y2={0} fill="#00013f" fillOpacity={0.4} />
        </ComposedChart>
      </div>
    </div>
  );

}

export default Home;