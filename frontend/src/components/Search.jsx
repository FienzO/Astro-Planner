import axios from 'axios';
import '../App.css';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/userContext';

function Search({ latitude, longitude }) {
  const [object, setObject] = useState('');
  const [objectAlt, setObjectAlt] = useState('');
  const [objectAz, setObjectAz] = useState('');
  const [objectAu, setObjectAu] = useState('');
  const [objectKm, setObjectKm] = useState('');
  const [visible, setVisible] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const objects = [
    "--Select an Object--",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "ISS"
  ];

  const fetchAstroData = async () => {

    if (object === "--Select an Object--" || !object) {
      alert("Please select and object!");
      return;
    }
    else if (!date || !time) {
      alert("Please enter both date and time!");
      return;
    }
    else if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude!");
      return;
    }

    try {

      const response = await axios.get("http://127.0.0.1:5000/apigrab2", {
        params: { lat: latitude, lon: longitude, date: date, time: time, object: object }
      });

      setObjectAlt(response.data.alt);
      setObjectAz(response.data.az);
      setObjectAu(response.data.au);
      setObjectKm(response.data.km);
      setVisible(response.data.visible);


    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data.");
    }
  };

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        fetchAstroData();
      }
    };

    document.addEventListener('keydown', handleEnter);

    return () => {
      document.removeEventListener('keydown', handleEnter);
    };
  }, [date, time, object, latitude, longitude]); 

  



  return (
    <div className="App">
      <div className='dropdown-location'>
        <p>Astronomical Object: </p>
        <select value={object} onChange={(e) => setObject(e.target.value)}>
          {objects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <p>Time Selector: </p>
      <div className='input-group'>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}/>
      </div>
      <p></p>
      <div>
        <button onClick={fetchAstroData}> Send Search </button>
      </div>
      <div>
        {visible &&(
          <div>
            <p title='If the object is above the horizon'>Visible: {visible}</p>
            <p title='Angle above horizon'>Altitude: {objectAlt}</p>
            <p title='Compass bearing from North'>Azimuth: {objectAz}</p>
            <p title='Distance in Kilometers'>Kilometers: {objectKm}</p>
            <p title='Distance in Astronomical Units'>AU: {objectAu}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
