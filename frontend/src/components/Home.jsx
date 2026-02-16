import axios from 'axios';
import '../App.css';
import { useState, useEffect } from 'react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis, ReferenceLine, ReferenceArea, Area, Tooltip } from 'recharts';

function Home({ latitude, longitude }) {

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const [sunMoonData, setSunMoonData] = useState([]);
  const [tempDewData, setTempDewData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [cloudData, setCloudData] = useState([]);
  const [visData, setVisData] = useState([]);
  const [dayTitles, setDayTitles] = useState([]);
  const [location, setLocation] = useState([]);
  const [planetudes, setPlanetudes] = useState([]);
  const [finndex, setFinndex] = useState([]);
  const [bortle, setBortle] = useState([]);


  const fetchAstroData = async () => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude!");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:5000/apigrab1", {
        params: { lat: latitude, lon: longitude }
      });

      setSunMoonData(response.data.altData);
      setTempDewData(response.data.tempData);
      setWindData(response.data.windData);
      setCloudData(response.data.cloudData);
      setVisData(response.data.visData);
      setDayTitles(response.data.titleData);
      setLocation(response.data.location);
      setPlanetudes(response.data.planetData);
      setFinndex(response.data.finndex);
      setBortle(response.data.bortle);


    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check console.");
    }
  };
    // Object Toggling
    const [showAll, setShowAll] = useState(true);
    const [showSun, setShowSun] = useState(true);
    const [showMercury, setShowMercury] = useState(true);
    const [showVenus, setShowVenus] = useState(true);
    const [showMars, setShowMars] = useState(true);
    const [showJupiter, setShowJupiter] = useState(true);
    const [showSaturn, setShowSaturn] = useState(true);
    const [showUranus, setShowUranus] = useState(true);
    const [showNeptune, setShowNeptune] = useState(true);
    const [showISS, setShowISS] = useState(true);

    return (
    <div className="App">
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchAstroData}
          style={{ padding: '8px 16px', fontSize: '16px' }}
        >
          Update Location & Refresh Data
        </button>
      </div>
      <p className='text'>{location}</p>
      <p className='text'>Bortle: {bortle}</p>
      <p>UTC</p>
      <div className="graph-display">

        {/* Sun & Moon Altitudes*/}
        <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Sun & Moon Altitudes
        </p>
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

          <XAxis
            xAxisId="timestep"
            axisLine={{ stroke: "white" }}
            tick={{ fill: 'white' }}
            interval={11}
            tickFormatter={(t) => Math.floor((t / 12) % 24)}
            angle={90} dx={4} textAnchor="start" fontSize={12} tick={{ fill: 'white'}}
          />
          <YAxis domain={[-90, 90]} axisLine={false} tick={false}/>
          <XAxis
            xAxisId="days"
            dataKey="t_minutes"
            orientation="bottom"
            axisLine={false}
            tickLine={false}
            ticks={[720/5, 2160/5, 3600/5]}  // midday of day 1, 2, 3
            tick={{ fill: '#ffc658', fontWeight: 'bold' }}
            tickFormatter={(t) => dayTitles[Math.floor(t / (1440/5))]}
          />
          <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <Area type="monotone" dataKey="sun_altitude" stroke="#ffc658" fill="url(#sunGradient)" name="Sun Altitude" unit="°"/>
          <Area type="monotone" dataKey="moon_altitude" stroke="#eeedffff" fill="url(#moonGradient)" name="Moon Altitude" unit="°"/>

          <ReferenceLine x={Math.floor(currentMinute/5 + currentHour*12)} stroke="red" strokeDasharray="3 3" xAxisId="timestep"/>
          <ReferenceLine y={0} stroke="#CCCCCC"strokeWidth={1}/>
          <ReferenceLine y={-10} stroke="#CCCCCC" strokeDasharray="1 3"/>
          <ReferenceArea y1={0} y2={-90} fill="#00013f64" fillOpacity={1} 
          />
        </ComposedChart>

        {/* Temperature & Dewpoint */}
        <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Temperature & Dewpoint
        </p>
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
        <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Wind Speed & Gust
        </p>
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
        <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Cloud & Rain
        </p>
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
        <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          General Visibility
        </p>
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
          <YAxis yAxisId="left" orientation="left" domain={[0, 100]} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit="%" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} axisLine={{stroke: "white"}} tick={{fill: "white"}} unit=' Km'/>

          <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>

          <ReferenceLine x={currentHour} yAxisId="left" stroke="red" strokeDasharray="3 3" isFront />
        </ComposedChart>

        

        {/* Planetudes*/}
         <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Object Altitudes
        </p>

        <div style={{ display: 'flex', height: 400, minWidth: 900, margin: 'auto' }}>
          <div className="selection">
            <p><b>Show Objects:</b></p>

            <label><input type="checkbox" checked={showAll} onChange={() => (setShowAll(!showAll), setShowMercury(!showAll), setShowVenus(!showAll), setShowMars(!showAll), setShowJupiter(!showAll), setShowSaturn(!showAll), setShowUranus(!showAll), setShowNeptune(!showAll), setShowISS(!showAll))} /> Toggle All</label>
            <label><input type="checkbox" checked={showSun} onChange={() => setShowSun(!showSun)} /> Sun</label>
            <label><input type="checkbox" checked={showMercury} onChange={() => setShowMercury(!showMercury)} /> Mercury</label>
            <label><input type="checkbox" checked={showVenus} onChange={() => setShowVenus(!showVenus)} /> Venus</label>
            <label><input type="checkbox" checked={showMars} onChange={() => setShowMars(!showMars)} /> Mars</label>
            <label><input type="checkbox" checked={showJupiter} onChange={() => setShowJupiter(!showJupiter)} /> Jupiter</label>
            <label><input type="checkbox" checked={showSaturn} onChange={() => setShowSaturn(!showSaturn)} /> Saturn</label>
            <label><input type="checkbox" checked={showUranus} onChange={() => setShowUranus(!showUranus)} /> Uranus</label>
            <label><input type="checkbox" checked={showNeptune} onChange={() => setShowNeptune(!showNeptune)} /> Neptune</label>
            <label><input type="checkbox" checked={showISS} onChange={() => setShowISS(!showISS)} /> ISS</label>
          </div>
            <ComposedChart style={{ width: '100%', aspectRatio: 5, minWidth: 500, maxWidth:1200, margin: 'auto'}} responsive data={planetudes}>
              <XAxis
                dataKey="t_minutes"           
                axisLine={{ stroke: "white" }}
                tick={{ fill: 'white' }}
                interval={11}
                tickFormatter={(t) => Math.floor((t / 12) % 24)}
                angle={90} dx={4} textAnchor="start" fontSize={12}
              />
              <YAxis domain={[-90, 90]} axisLine={false} tick={false}/>
              <XAxis
                dataKey="t_minutes"
                xAxisId="timestep"
                orientation="bottom"
                axisLine={false}
                tickLine={false}
                ticks={[720/5, 2160/5, 3600/5]}  // midday of day 1, 2, 3
                tick={{ fill: '#ffc658', fontWeight: 'bold' }}
                tickFormatter={(t) => dayTitles[Math.floor(t / (1440/5))]}
              />
              <Tooltip formatter={(value) => value.toFixed(2)} contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>


              {showSun && <Line dataKey="Sun" stroke="#ffc658" dot={false} />},
              {showSun && <ReferenceLine y={-18} stroke="white" strokeDasharray="5 4"/>},
              {showMercury && <Line dataKey="Mercury" stroke="#b1b1b1" dot={false} />}
              {showVenus && <Line dataKey="Venus" stroke="#e6c28b" dot={false} />}
              {showMars && <Line dataKey="Mars" stroke="#ff6b4a" dot={false} />}
              {showJupiter && <Line dataKey="Jupiter" stroke="#ce7545" dot={false} />}
              {showSaturn && <Line dataKey="Saturn" stroke="#f5e6a8" dot={false} />}
              {showUranus && <Line dataKey="Uranus" stroke="#7ad7f0" dot={false} />}
              {showNeptune && <Line dataKey="Neptune" stroke="#3b6cff" dot={false} />}
              {showISS && <Line dataKey="ISS" stroke="#ffefe9" dot={false} />}

              <ReferenceLine y={0} stroke="#ccc" />
              <ReferenceLine x={Math.floor(currentMinute/5 + currentHour*12)} stroke="red" strokeDasharray="3 3" xAxisId="timestep"/>
              
            </ComposedChart>
          </div>
          
          {/* Finndex */}
          <p x="50%" y={10} fill="white" textAnchor="middle" dominantBaseline="central"style={{ fontSize: '16px', fontWeight: 'bold' }} title="A summation of the data, giving a quick viewing quality indicator.">
            Finndex
          </p>

          <ComposedChart style={{ width: '100%', aspectRatio: 6, minWidth: 1300, margin: 'auto'}} data={finndex}>
            <Line type="monotone" dataKey="finndex" stroke="rgb(255, 223, 223)" strokeWidth={1} dot={false} name="Finndex" />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

            <XAxis dataKey="hour" interval={0} angle={90} dx={4} textAnchor="start" fontSize={12} axisLine={{stroke:"white"}} tick={{ fill: 'white'}} tickFormatter={(hour) => hour % 24}  />
            <XAxis xAxisId="1" dataKey="hour"orientation="bottom"axisLine={false}tickLine={false}tick={{ fill: '#ffc658', fontWeight: 'bold' }}ticks={[12, 36, 60]}
            tickFormatter={(val) => {
              const index = Math.floor(val / 24);
              return dayTitles[index];}}
            />
            <YAxis orientation="left" domain={[0, 1]} axisLine={{stroke: "white"}} tick={{fill: "white"}} />

            <Tooltip contentStyle={{ backgroundColor: '#181c27e0', border: '0px solid' }}itemStyle={{ color: '#fff' }}/>
            <ReferenceLine x={currentHour} stroke="red" strokeDasharray="3 3" isFront />
          </ComposedChart>
        </div>
      </div>
  );

}

// ADD EMAIL PASSWORD RESET.

export default Home;