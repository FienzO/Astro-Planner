import axios from 'axios';
import '../App.css';
import { useState, useEffect } from 'react';
import { CartesianGrid, ComposedChart, Line, LineChart, XAxis, YAxis, ReferenceLine, ReferenceArea, Area, Tooltip} from 'recharts';

function Home() {

  const now = new Date();
  const currentHour = now.getHours();
  const [sunMoonData, setSunMoonData] = useState([]);
  const [tempDewData, setTempDewData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [cloudData, setCloudData] = useState([]);
  const [visData, setVisData] = useState([]);
  const [dayTitles, setDayTitles] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/apigrab1");
        setSunMoonData(response.data.altData); 
        setTempDewData(response.data.tempData);
        setWindData(response.data.windData);
        setCloudData(response.data.cloudData);
        setVisData(response.data.visData);
        setDayTitles(response.data.titleData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    console.log(tempDewData)

    fetchData();
  }, []);

    
    return (
    <div className="App">
      <div className="graph-display">

        {/* Sun & Moon Altitudes*/}
        <text x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Sun & Moon Altitudes
        </text>
        <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 800, margin: 'auto'}} responsive data={sunMoonData}>
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

          <Area type="monotone" dataKey="sun_altitude" stroke="#ffc658" fill="url(#sunGradient)" name="Sun Altitude" unit="°"/>
          <Area type="monotone" dataKey="moon_altitude" stroke="#eeedffff" fill="url(#moonGradient)" name="Moon Altitude" unit="°"/>

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
          <ReferenceLine y={0} stroke="#CCCCCC"strokeWidth={1}/>
          <ReferenceLine y={-18} stroke="white" strokeDasharray="5 4"/>
          <ReferenceArea y1={0} y2={-90} fill="#00013f64" fillOpacity={1} 
          />
        </ComposedChart>

        {/* Temperature & Dewpoint */}
        <text x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Temperature & Dewpoint
        </text>
        <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 800, margin: 'auto'}} data={tempDewData}>
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

        {/* Wind & Gust */}
        <text x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Wind Speed & Gust
        </text>
        <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 800, margin: 'auto'}} data={windData}>
          <defs>
            <Line type="monotone" dataKey="wind_kph" stroke="#ffffffff" strokeWidth={1} dot={false} name="Wind Speed" unit=" Kph"/>
            <Line type="monotone" dataKey="gust_kph" stroke="#555555ff" strokeWidth={1} dot={false} name="Gust Speed" unit=" Kph"/>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

          <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
          <XAxis xAxisId="1"dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
          tickFormatter={(val) => {
            const index = Math.floor(val / 24);
            return dayTitles[index];}}
          />
          <YAxis domain={['auto', 'auto']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit=" Kph" />

          <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
        </ComposedChart>

        {/* Cloud & Weather */}
        <text x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Cloud & Rain
        </text>
        <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 800, margin: 'auto'}} data={cloudData}>
          <defs>
            <Line type="monotone" dataKey="cloud" stroke="#ffffffff" strokeWidth={1} dot={false} name="Cloud Coverage" unit="%"/>
            <Line type="monotone" dataKey="rain" stroke="#41a9ffff" strokeWidth={1} dot={false} name="Chance of Rain" unit="%"/>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

          <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
          <XAxis xAxisId="1"dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
          tickFormatter={(val) => {
            const index = Math.floor(val / 24);
            return dayTitles[index];}}
          />
          <YAxis domain={['0', '100']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit="%" />

          <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3"/>
        </ComposedChart>

        {/* General Visibility */}
        <text x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          General Visibility
        </text>
        <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 1300, margin: 'auto'}} data={visData}>

        <def>
          <Line type="monotone" dataKey="visibility" stroke="#ffffffff" strokeWidth={1} dot={false} name="Visibility" yAxisId='right' unit=" Km"/>
          <Line type="monotone" dataKey="humidity" stroke="#1994f8ff" strokeWidth={1} dot={false} name="Humidity" yAxisId='left' unit="%"/>
        </def>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

          <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
          <XAxis xAxisId="1" dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
          tickFormatter={(val) => {
            const index = Math.floor(val / 24);
            return dayTitles[index];}}
          />
          <YAxis yAxisId="left" orientation="left" domain={['0', '100']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit="%" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit=' Km'/>

          <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <ReferenceLine x={currentHour} yAxisId="left" stroke="red" strokeDasharray="3 3" isFront />
        </ComposedChart>
      </div>
    </div>
  );

}

export default Home;