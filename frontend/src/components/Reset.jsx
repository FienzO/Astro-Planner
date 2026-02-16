import axios from 'axios';
import '../App.css';
import { useState} from 'react';
import { useNavigate } from 'react-router-dom'

function Reset() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [apiResponse, setApiResponse] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

     if (!email) {
      alert("Please enter your email!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/reset", {
        email: email,
      });


      setApiResponse({
        message: response.data.message, 
        type: 'success' 
      });

      navigate('/reset1');


    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setApiResponse({
          message: error.response.data.message, 
          type: 'error' 
        });
      } else if (error.request) {
        setApiResponse({
          message: "No response from server.",
          type: 'error'
        });
      } else {
        setApiResponse({
          message: `Error: ${error.message}`,
          type: 'error'
        });
      }

      console.error(error);
    }
  };


  return (
    <div className="App">
      <div className="App-title">
        <form onSubmit={handleReset}>       
          <div className="input-group">
            <label title="Your recovery Email">Email</label>
            <input
              type="text"
              value={email}
              placeholder="jane.doe@domain.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>  
          <div>
            <button type="submit">Recover</button>
          </div>
        </form>

        {apiResponse.message && (
        <p className={apiResponse.type === 'error' ? 'error-message' : 'success-message'}>{apiResponse.message}</p>
        )}
      </div>
    </div>
  );
}

export default Reset;
